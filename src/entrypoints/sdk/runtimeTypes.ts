// Stub: SDK runtime types
export interface RuntimeConfig {
  apiKey?: string
  model?: string
  maxTokens?: number
}

export interface SessionConfig extends RuntimeConfig {
  sessionId?: string
  workingDirectory?: string
}

export type SDKStatus = 'idle' | 'connecting' | 'connected' | 'error'
