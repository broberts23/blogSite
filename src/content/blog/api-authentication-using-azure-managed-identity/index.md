---
title: API Authentication using Azure Managed Identity
description: "Authentication to Azure APIs has traditionally relied on service principals with client secrets or certificates. While effective, managing these credentials introduces operational complexity and security risks. Azure ..."
pubDate: 2025-03-03
tags: [powershell, entra, identity, security]
draft: false
---
Authentication to Azure APIs has traditionally relied on service principals with client secrets or certificates. While effective, managing these credentials introduces operational complexity and security risks. Azure Managed Identity offers a compelling alternative by eliminating the need to manage credentials entirely. I recently had the opportunity to work with Managed Identity tokens and found some nuances in token acquisition and usage that are important to understand for successful implementation.

## The Challenge with Service Principal Authentication

When authenticating to Azure APIs using service principals, you typically need to:

1\. Create an app registration in Entra  
2\. Generate and securely store a client secret  
3\. Request tokens using that secret

This approach works but has several drawbacks:

\- Secrets require secure storage, rotation and governance  
\- Leaked secrets pose significant security risks  
\- Managing secret lifetimes adds operational overhead

Here's what a typical authentication flow using service principal credentials looks like:

```powershell
# Define your tenant, client ID and client secret
$tenant = "YOUR_TENANT_ID"
$appId = "YOUR_SERVICE_PRINCIPAL_APP_ID"
$secret = "YOUR_SERVICE_PRINCIPAL_SECRET"
$scope = "api://your-api-client-id/.default"

# Construct the token endpoint URL
$tokenEndpoint = "https://login.microsoftonline.com/$tenant/oauth2/v2.0/token"

# Define the body for the token request
$body = @{
    client_id     = $appId
    client_secret = $secret
    scope         = $scope
    grant_type    = "client_credentials"
}

# Request the token
$response = Invoke-RestMethod -Method Post -Uri $tokenEndpoint -Body $body
$accessToken = $response.access_token

# Use the access token to call an API
$headers = @{
    Authorization = "Bearer $accessToken"
}

Invoke-WebRequest -Method POST -Uri "https://your-api-endpoint" -Headers $headers -ContentType 'application/json'
```

## Introducing Azure Managed Identity

Managed Identity provides Azure resources with an automatically managed identity in Entra ID. This eliminates credential management completely, as Azure handles everything behind the scenes.

### Benefits of Managed Identity

* *No credential management*: Azure creates and rotates credentials automatically
    
* *Enhanced security*: No secrets to store in code or configuration
    
* *Simplified operations*: No rotation schedules to maintain
    
* *Seamless integration*: Works natively with Azure services
    

## How to Use Managed Identity for API Authentication

### Step 1: Enable Managed Identity on Your Azure Resource

First, enable a system-assigned managed identity on your Azure VM, App Service, or other supported resource through the Azure Portal or via PowerShell/CLI.

### Step 2: Grant the Managed Identity Access to Your Application

The managed identity operates as a service principal in Entra ID. You'll need to assign it appropriate permissions after identifying your Service Principals by Display Name or Application ID:

```powershell
# Required Modules
Import-Module Az.Accounts
Import-Module Az.Resources

# Connect to Azure AD
Connect-AzAccount

# Get the managed identity's service principal
$managedIdentitySP = Get-AzADServicePrincipal -DisplayName "Your-VM-DisplayName"

# Get your API's service principal
$apiSP = Get-AzADServicePrincipal -ApplicationId "YOUR_API_APP_ID"

# Get your Application Role ID
$appRoleId = ($apiSP.AppRoles | Where-Object {$_.DisplayName -eq "YourRequiredRole"}).Id

# Assign the role to the managed identity
New-AzADServicePrincipalAppRoleAssignment `
    -ServicePrincipalId $managedIdentitySP.Id `
    -ResourceId $apiSP.Id `
    -AppRoleId $appRoleId
```

The assignment will be visible in Users and Group of the Enterprise Application

### Step 3.1: Request a Token Using Managed Identity (Virtual Machine)

From within an Azure resource with managed identity enabled (like a VM), you can request a token using the local IMDS endpoint. The Instance Metadata Service (IMDS) provides a simple HTTP interface for obtaining tokens. 

```powershell
# Define your target resource/audience
$resource = "api://your-api-client-id"
$apiVersion = "2018-02-01"


# Construct the token request URL
$tokenUrl = "http://169.254.169.254/metadata/identity/oauth2/token?api-version=$apiVersion&resource=$([uri]::EscapeDataString($resource))"

# Request the token
$response = Invoke-RestMethod -Method GET -Uri $tokenUrl -Headers @{Metadata="true"}
$accessToken = $response.access_token

# Use the token to call your API
$headers = @{
    Authorization = "Bearer $accessToken"
}

Invoke-WebRequest -Method POST -Uri "https://your-service/endpoint" -Headers $headers -ContentType 'application/json'
```

You can find example code for different languages, and more information about managed identity access tokens here: [https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/how-to-use-vm-token](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/how-to-use-vm-token)

### Step 3.2: Request a Token Using Managed Identity (Web and Function Apps)

For Azure Web Apps and Function Apps, you can use the built-in endpoint to request a token once the managed identity is enabled. This is available through the `IDENTITY_ENDPOINT` and `IDENTITY_HEADER` environment variables. These are REST API endpoints that provide a simple way to obtain tokens. e.g. `http://127.0.0.1:41854/MSI/token/`, IDENTITY_HEADER is the secret used to authenticate the request.

```powershell
# Define your target resource/audience
$resourceURI = "api://your-api-client-id"
$tokenAuthURI = $env:IDENTITY_ENDPOINT + "?resource=$resourceURI&api-version=2019-08-01"
$tokenResponse = Invoke-RestMethod -Method Get -Headers @{"X-IDENTITY-HEADER"="$env:IDENTITY_HEADER"} -Uri $tokenAuthURI
$accessToken = $tokenResponse.access_token

# Use the token to call your API
$headers = @{
    Authorization = "Bearer $($accessToken)"
}

Invoke-WebRequest -Method POST -Uri "https://your-service/endpoint" -Headers $headers -ContentType 'application/json'
```

If you would like more information on how to use managed identity in Azure Functions, or examples for other languages, you can refer to the [official documentation](https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity)


## Troubleshooting Common Issues

### 401 Unauthorized Errors

If you receive a 401 Unauthorized response, check:

* Is the managed identity properly enabled?
    
* Has the identity been granted appropriate permissions (Roles) on your API?
    
* Are you requesting a token for the correct resource/audience?
    

### 415 Unsupported Media Type

This error indicates the API doesn't support the Content-Type of your request. Ensure you're setting the appropriate Content-Type header (e.g., 'application/json') that your API expects.

### Detailed Error Information

For more detailed error information, use the -Verbose flag with your requests:

```powershell
$webResponse = Invoke-WebRequest -Uri $apiUrl -Headers $headers -Method Get -Verbose
```

Or catch exceptions to see detailed error messages:

```powershell
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
}
```

## Conclusion

Azure Managed Identity simplifies authentication flows, enhances security posture, and reduces operational overhead by eliminating credential management. By adopting managed identities for your inter-service authentication needs, you can build more secure and maintainable solutions in Azure.

This modern approach to authentication represents a significant improvement over traditional service principal authentication methods, particularly for services running within the Azure ecosystem.
