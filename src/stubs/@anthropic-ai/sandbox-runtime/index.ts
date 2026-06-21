// Stub: @anthropic-ai/sandbox-runtime
export class SandboxRuntime {
  constructor(_config?: Record<string, unknown>) {}
  async execute(_command: string): Promise<string> {
    return 'Stub execution'
  }
}

export class SandboxManager {
  constructor(_config?: Record<string, unknown>) {}

  // Static methods
  static isSupportedPlatform(): boolean {
    return false
  }

  static async checkDependencies(_config?: Record<string, unknown>): Promise<{ ok: boolean; missing: string[] }> {
    return { ok: true, missing: [] }
  }

  static async initialize(_config?: Record<string, unknown>, _callback?: () => Promise<void>): Promise<void> {}

  static async wrapWithSandbox<T>(_fn: () => Promise<T>, _config?: Record<string, unknown>): Promise<T> {
    return _fn()
  }

  static updateConfig(_config: Record<string, unknown>): void {}

  static async reset(): Promise<void> {}

  static getFsReadConfig(): Record<string, unknown> {
    return {}
  }

  static getFsWriteConfig(): Record<string, unknown> {
    return {}
  }

  static getNetworkRestrictionConfig(): Record<string, unknown> {
    return {}
  }

  static getIgnoreViolations(): boolean {
    return false
  }

  static getAllowUnixSockets(): boolean {
    return false
  }

  static getAllowLocalBinding(): boolean {
    return false
  }

  static getEnableWeakerNestedSandbox(): boolean {
    return false
  }

  static getProxyPort(): number {
    return 0
  }

  static getSocksProxyPort(): number {
    return 0
  }

  static getLinuxHttpSocketPath(): string {
    return ''
  }

  static getLinuxSocksSocketPath(): string {
    return ''
  }

  static async waitForNetworkInitialization(): Promise<void> {}

  static getSandboxViolationStore(): Record<string, unknown> {
    return {}
  }

  // Instance methods
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async execute(_command: string): Promise<string> {
    return 'Stub execution'
  }
}
