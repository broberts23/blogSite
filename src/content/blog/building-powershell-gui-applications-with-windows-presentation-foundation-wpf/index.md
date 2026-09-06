---
title: Building PowerShell GUI Applications with Windows Presentation Foundation (WPF)
description: "Combine PowerShell scripts with modern Windows Presentation Foundation markup to create responsive, validated graphical administrative tools."
pubDate: 2025-03-28
tags: [powershell, microsoft-graph]
heroImage: "./cover.webp"
draft: false
---
As PowerShell continues to evolve as a versatile automation tool, many administrators and developers are discovering the power of combining it with Windows Presentation Foundation (WPF) to create sophisticated graphical user interfaces. In this post, I'll walk through a real-world example of building a multi-input validation form with PowerShell and WPF.

### Why PowerShell + WPF?
While PowerShell is phenomenal for automation and scripting, sometimes a command-line interface isn't the most user-friendly option, particularly for less technical users. WPF provides a modern, flexible UI framework that can be seamlessly integrated with PowerShell scripts, giving you the best of both worlds:

- Rich, responsive user interfaces
- Access to PowerShell's powerful automation capabilities
- Professional-looking applications without needing to learn C# or Visual Studio

### The Sample Application
Our demonstration application is a service desk utility that validates and submits user inputs to an Azure Function using a secret provided by the user. The app includes:

- Multiple input fields with different validation patterns
- Authentication
- Responsive UI feedback with a progress bar
- Error handling and validation messaging

Let's break down the key components.

### Setting Up the WPF Environment
First, we need to load the necessary [WPF assembly](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/?view=netdesktop-9.0):

```powershell
# Load required WPF assembly
Add-Type -AssemblyName PresentationFramework
```
### Defining the UI with XAML
WPF uses XAML (eXtensible Application Markup Language) to define user interfaces. In PowerShell, we can define our XAML as a here-string:

```powershell
[xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="Multi-Input - Authentication Demo" Height="500" Width="500">
    <!-- Window contents defined here -->
</Window>
"@
```
The XAML defines:

1. A window with grid layout
1. Text input fields for various data entries
1. A password box for secure input
1. Buttons for submitting data and quitting the application
1. A progress bar for visual feedback
1. A result area to display messages

### Loading the XAML and Accessing UI Elements
After defining the XAML, we need to transform it into a live WPF window:

```powershell
$reader = (New-Object System.Xml.XmlNodeReader $xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

# Retrieve controls by their names.
$Input1 = $window.FindName("Input1")
$Input2 = $window.FindName("Input2")
$Input3 = $window.FindName("Input3")
$Input4 = $window.FindName("Input4")
$PasswordInput = $window.FindName("PasswordInput") # PasswordBox control
$SubmitButton = $window.FindName("SubmitButton")
$QuitButton = $window.FindName("QuitButton")
$ProgressBar = $window.FindName("ProgressBar")
$ResultTextBlock = $window.FindName("ResultTextBlock")
```
The `FindName` method allows us to retrieve UI elements by their defined names in the XAML.

### Input Validation with Regular Expressions
A highlight of our application is the ability to validate different inputs using specific regex patterns:

```powershell
# Define regex patterns for validation
$regexPatternCase = '^(RITM|INC)\d{7}$'  # ServiceNow case format
$regexPatternEmail = '^[A-Za-z]+\.[A-Za-z]+@[A-Za-z]+\.com\.au$'  # Email format
```
The application uses these patterns to validate that:

- Input conforms to a ServiceNow case ID format (RITM or INC followed by 7 digits)
- Inputs follow an email format (firstname.lastname@domain.com.au)
- Other input validation like match a user ID, sAMAccountName or Department.

### Event Handling in PowerShell WPF
WPF applications are event-driven. We add event handlers using PowerShell script blocks:

```powershell
$SubmitButton.Add_Click({
    # Button click handling code
})

$QuitButton.Add_Click({
    $window.Close()
})
```

The Submit button's event handler contains the core logic of our application, while the Quit button simply closes the window.

### Security Considerations: Handling Passwords
For secure input, we use the WPF PasswordBox control:
```powershell
<PasswordBox Name="PasswordInput" Width="330" Height="25"/>
```
This displays input as asterisks, and doesn't hard code the secret.

This helps protect sensitive information in memory but ideally this would be handled using machine identities. In my use case I didn't have programmatic access to a secret store to retrieve the secrets, but if you In an Azure environment or have Arc enables machines this could be substituted.

### Advanced Input Validation with PowerShell
Our application takes a sophisticated approach to validation by defining a collection of input definitions:

```powershell
$inputs = @(
    @{ Control = $Input1; Label = "Input 1 (Case)"; Pattern = $regexPatternCase; GetValue = { param($ctrl) $ctrl.Text.Trim() } },
    @{ Control = $Input2; Label = "Input 2"; Pattern = $regexPatternEmail; GetValue = { param($ctrl) $ctrl.Text.Trim() } },
    @{ Control = $Input3; Label = "Input 3"; Pattern = $regexPatternEmail; GetValue = { param($ctrl) $ctrl.Text.Trim() } },
    @{ Control = $Input4; Label = "Input 4"; Pattern = $regexPatternEmail; GetValue = { param($ctrl) $ctrl.Text.Trim() } },
    @{ Control = $window.FindName("PasswordInput"); Label = "Client Secret"; Pattern = $null; GetValue = { param($ctrl) $ctrl.Password.Trim() } }
)

# Initialize a variable to store validation failures.
$validationFailures = @()

# Validate each input in the list.
foreach ($i in $inputs) {
    $value = & $i.GetValue $i.Control
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        $validationFailures += "$($i.Label) failure: No value provided."
    }
    elseif ($i.Pattern -and -not [System.Text.RegularExpressions.Regex]::IsMatch($value, $i.Pattern)) {
        $validationFailures += "$($i.Label) failure: '$value' does not match the required pattern."
    }
}
# Additionally, validate the password field.
$passwordValue = $PasswordInput.Password.Trim()
if ([string]::IsNullOrWhiteSpace($passwordValue)) {
    $validationFailures += "Client Secret failure: No value provided."
}
    
# If there are any validation failures, output them and re-enable the button.
if ($validationFailures.Count -gt 0) {
    $ResultTextBlock.Text = ($validationFailures -join "`n")
    $ResultTextBlock.Foreground = [System.Windows.Media.Brushes]::Red
    $SubmitButton.IsEnabled = $true
    return
}
```
This approach allows for:

- Centralized validation logic
- Different validation rules for each input
- Specialized value extraction (notice how password values are handled differently)
- Captures null values
- Clear, descriptive error messaging

### Keeping the UI Responsive

One common challenge in GUI applications is keeping the interface responsive during long-running operations. Our example addresses this using the Dispatcher:

```powershell
$window.Dispatcher.Invoke([Action] {}, [System.Windows.Threading.DispatcherPriority]::Render)
```

This forces the UI to refresh after updating progress indicators, ensuring users see the current state of the application.

### Making HTTP Requests from PowerShell WPF
The following code demonstrates making HTTP requests to an API endpoint using Bearer token authentication.

For context, this use case was the allow users to manually create an account which was only accessible from an API hosted in Azure.

We're using a service principle with App Role authorization to the API to authenticate. If you'd like more information of Entra Application authentication and bearer tokens I cover it [here](https://benroberts.io/api-authentication-using-azure-managed-identity).

```powershell
$tenant = "YOUR_TENANT_ID"
$appId = "YOUR_SERVICE_PRINCIPAL_APP_ID"
$secret = $passwordValue
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

# Example: Call your Azure Function App (update the URL accordingly).
$Uri = "https://<your-wep-app-name>.azurewebsites.net/api/CreateAccount"
        
# Build a payload including all inputs.
$payload = @{
  input1 = $Input1.Text.Trim()
  input2 = $Input2.Text.Trim()
  input3 = $Input3.Text.Trim()
  input4 = $Input4.Text.Trim()
} | ConvertTo-Json
    
Invoke-WebRequest -Method POST -Uri $Uri -Headers $headers -ContentType 'application/json' -Body $payload -UseBasicParsing
```
This illustrates how PowerShell GUI applications can interact with external services while maintaining a user-friendly interface.

### Conclusion

This PowerShell WPF example demonstrates how administrators and developers can create sophisticated, user-friendly interfaces for their automation tools. By combining the flexibility of PowerShell with the rich UI capabilities of WPF, we can build professional applications that:

1. Validate user input with clear error messages
1. Provide visual feedback on progress
1. Handle passwords securely
1. Interact with external services
1. Present complex functionality through a simple interface
The full code example includes additional features like preventing multiple submissions and properly reporting errors to users.

Whether you're building tools for service desk staff, administrators, or end users, PowerShell and WPF together provide a powerful platform for creating maintainable, effective GUI applications without leaving the PowerShell ecosystem.

You can find the code in full on [GitHub](https://github.com/broberts23/blogs/blob/main/wpfDemoUI.ps1)

Thanks for reading! 🚀
