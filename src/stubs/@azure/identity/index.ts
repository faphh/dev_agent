// Stub: @azure/identity
export class DefaultAzureCredential {
  constructor(_options?: Record<string, unknown>) {}
  async getToken(_scopes: string | string[]): Promise<{ token: string; expiresOnTimestamp: number }> {
    return { token: 'stub-token', expiresOnTimestamp: Date.now() + 3600000 }
  }
}

export class ClientSecretCredential {
  constructor(_tenantId: string, _clientId: string, _clientSecret: string) {}
  async getToken(_scopes: string | string[]): Promise<{ token: string; expiresOnTimestamp: number }> {
    return { token: 'stub-token', expiresOnTimestamp: Date.now() + 3600000 }
  }
}
