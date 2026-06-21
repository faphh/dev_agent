// Stub: REPLTool
import type { Tool } from '../../Tool.js'

export const REPL_TOOL_NAME = 'REPL'

export const REPLTool: Tool = {
  name: REPL_TOOL_NAME,
  description: 'REPL tool (stub)',
  isEnabled: () => false,
  isHidden: () => true,
  needsPermissions: () => false,
  prompt: () => '',
  call: async () => ({ type: 'text' as const, text: 'Not implemented' }),
}
