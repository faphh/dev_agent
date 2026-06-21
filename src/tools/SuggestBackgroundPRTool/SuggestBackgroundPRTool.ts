// Stub: SuggestBackgroundPRTool
import type { Tool } from '../../Tool.js'

export const SUGGEST_BACKGROUND_PR_TOOL_NAME = 'SuggestBackgroundPR'

export const SuggestBackgroundPRTool: Tool = {
  name: SUGGEST_BACKGROUND_PR_TOOL_NAME,
  description: 'Suggest background PR tool (stub)',
  isEnabled: () => false,
  isHidden: () => true,
  needsPermissions: () => false,
  prompt: () => '',
  call: async () => ({ type: 'text' as const, text: 'Not implemented' }),
}
