// Stub: tools types
export type ToolName = string

export interface ToolDefinition {
  name: ToolName
  description: string
  inputSchema: Record<string, unknown>
}

export interface ToolCall {
  id: string
  name: ToolName
  input: Record<string, unknown>
}

export interface ToolResult {
  tool_use_id: string
  content: string
  is_error?: boolean
}

export type ToolPermissionMode = 'ask' | 'alwaysAllow' | 'alwaysDeny'
