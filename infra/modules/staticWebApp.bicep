param location string
param name string
param repositoryUrl string
param branch string

@secure()
param repositoryToken string = ''

resource swa 'Microsoft.Web/staticSites@2025-03-01' = {
  name: name
  location: location
  tags: {
    Environment: 'production'
    Application: 'benroberts-io'
  }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    provider: empty(repositoryToken) ? 'None' : 'GitHub'
    repositoryUrl: empty(repositoryToken) ? null : repositoryUrl
    branch: empty(repositoryToken) ? null : branch
    repositoryToken: empty(repositoryToken) ? null : repositoryToken
    buildProperties: empty(repositoryToken) ? null : {
      appLocation: '/'
      apiLocation: ''
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
    }
  }
}

output name string = swa.name
output defaultHostname string = swa.properties.defaultHostname
output id string = swa.id
