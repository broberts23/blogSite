param lockName string = 'CanNotDelete'

resource lock 'Microsoft.Authorization/locks@2020-05-01' = {
  name: lockName
  properties: {
    level: 'CanNotDelete'
    notes: 'Protect the production blog resource group from accidental deletion.'
  }
}
