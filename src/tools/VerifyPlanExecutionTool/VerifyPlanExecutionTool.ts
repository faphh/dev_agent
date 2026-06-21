// Stub: VerifyPlanExecutionTool
import type { Tool } from '../../Tool.js'

export const VERIFY_PLAN_EXECUTION_TOOL_NAME = 'VerifyPlanExecution'

export const VerifyPlanExecutionTool: Tool = {
  name: VERIFY_PLAN_EXECUTION_TOOL_NAME,
  description: 'Verify plan execution tool (stub)',
  isEnabled: () => false,
  isHidden: () => true,
  needsPermissions: () => false,
  prompt: () => '',
  call: async () => ({ type: 'text' as const, text: 'Not implemented' }),
}
