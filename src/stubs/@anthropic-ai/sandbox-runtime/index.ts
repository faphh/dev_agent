// Stub: @anthropic-ai/sandbox-runtime
export class SandboxRuntime {
  constructor(_config?: Record<string, unknown>) {}
  async execute(_command: string): Promise<string> {
    return 'Stub execution'
  }
}

export class SandboxManager {
  constructor(_config?: Record<string, unknown>) {}
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async execute(_command: string): Promise<string> {
    return 'Stub execution'
  }
}
