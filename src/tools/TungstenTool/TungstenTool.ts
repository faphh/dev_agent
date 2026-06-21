// Stub: TungstenTool
import type { Tool } from '../../Tool.js'

export const TUNGSTEN_TOOL_NAME = 'Tungsten'

export const TungstenTool: Tool = {
  name: TUNGSTEN_TOOL_NAME,
  description: 'Tungsten tool (stub)',
  isEnabled: () => false,
  isHidden: () => true,
  needsPermissions: () => false,
  prompt: () => '',
  call: async () => ({ type: 'text' as const, text: 'Not implemented' }),
}
