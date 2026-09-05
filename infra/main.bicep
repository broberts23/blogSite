targetScope = 'subscription'

@description('Azure region for the Static Web App resource')
param location string = 'eastasia'

@description('Resource group name')
param resourceGroupName string = 'rg-blog'

@description('Static Web App name')
param staticWebAppName string = 'swa-benroberts-blog'

@description('GitHub repository URL (owner/repo)')
param repositoryUrl string = 'https://github.com/broberts23/blogSite'

@description('GitHub branch to deploy from')
param branch string = 'main'

@description('GitHub personal access token with repo scope — leave empty to attach source later in portal/Actions')
@secure()
param repositoryToken string = ''

resource rg 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: {
    Environment: 'production'
    Application: 'benroberts-io'
  }
}

module swa 'modules/staticWebApp.bicep' = {
  name: 'swa-deploy'
  scope: rg
  params: {
    location: location
    name: staticWebAppName
    repositoryUrl: repositoryUrl
    branch: branch
    repositoryToken: repositoryToken
  }
}

module policy 'modules/policy.bicep' = {
  name: 'blog-policy'
  scope: subscription()
  params: {
    policyAssignmentName: 'deny-non-swa-blog'
  }
}

module lock 'modules/lock.bicep' = {
  name: 'rg-lock'
  scope: rg
  params: {
    lockName: 'CanNotDelete'
  }
  dependsOn: [
    swa
  ]
}

output staticWebAppName string = swa.outputs.name
output defaultHostname string = swa.outputs.defaultHostname
output resourceGroup string = rg.name
