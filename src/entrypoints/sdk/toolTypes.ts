// Stub: SDK tool types
export interface SDKToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface SDKToolResult {
  type: 'text' | 'image' | 'error'
  content: string
}
