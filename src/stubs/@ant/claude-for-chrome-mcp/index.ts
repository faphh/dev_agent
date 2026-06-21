// Stub: @ant/claude-for-chrome-mcp
export type ClaudeForChromeContext = {
  tabId?: number
  url?: string
}

export type Logger = {
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}

export type PermissionMode = 'ask' | 'alwaysAllow' | 'alwaysDeny'

export const BROWSER_TOOLS = ['browser_navigate', 'browser_click', 'browser_type', 'browser_screenshot'] as const

export function createClaudeForChromeMcpServer(_context: ClaudeForChromeContext) {
  return {
    connect: async () => {},
    disconnect: async () => {},
    tools: BROWSER_TOOLS,
  }
}
