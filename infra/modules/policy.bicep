targetScope = 'subscription'

@description('Deny create of resource types other than Static Web Apps (and supporting deployment resources)')
param policyAssignmentName string = 'deny-non-swa-blog'

var allowedTypes = [
  'Microsoft.Resources/resourceGroups'
  'Microsoft.Web/staticSites'
  'Microsoft.Web/staticSites/customDomains'
  'Microsoft.Web/staticSites/builds'
  'Microsoft.Web/staticSites/config'
  'Microsoft.Resources/deployments'
  'Microsoft.Authorization/policyAssignments'
  'Microsoft.Authorization/policyDefinitions'
  'Microsoft.Authorization/locks'
  'Microsoft.Authorization/roleAssignments'
]

resource definition 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'deny-resources-except-static-web-apps'
  properties: {
    displayName: 'Deny resources except Azure Static Web Apps'
    description: 'Allows only Static Web Apps and a small set of management resource types in the blog subscription.'
    mode: 'All'
    policyRule: {
      if: {
        not: {
          field: 'type'
          in: allowedTypes
        }
      }
      then: {
        effect: 'Deny'
      }
    }
  }
}

resource assignment 'Microsoft.Authorization/policyAssignments@2022-06-01' = {
  name: policyAssignmentName
  properties: {
    displayName: 'Blog subscription: Static Web Apps only'
    policyDefinitionId: definition.id
    enforcementMode: 'Default'
  }
}

output policyAssignmentId string = assignment.id
