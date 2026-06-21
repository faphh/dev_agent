// Bun build plugin to resolve stub packages
import { plugin } from 'bun'

const stubPackages: Record<string, string> = {
  '@ant/claude-for-chrome-mcp': './src/stubs/@ant/claude-for-chrome-mcp/index.ts',
  '@anthropic-ai/bedrock-sdk': './src/stubs/@anthropic-ai/bedrock-sdk/index.ts',
  '@anthropic-ai/foundry-sdk': './src/stubs/@anthropic-ai/foundry-sdk/index.ts',
  '@anthropic-ai/mcpb': './src/stubs/@anthropic-ai/mcpb/index.ts',
  '@anthropic-ai/sandbox-runtime': './src/stubs/@anthropic-ai/sandbox-runtime/index.ts',
  '@anthropic-ai/vertex-sdk': './src/stubs/@anthropic-ai/vertex-sdk/index.ts',
  '@azure/identity': './src/stubs/@azure/identity/index.ts',
  'color-diff-napi': './src/stubs/color-diff-napi/index.ts',
  'modifiers-napi': './src/stubs/modifiers-napi/index.ts',
}

plugin({
  name: 'stub-resolver',
  setup(build) {
    for (const [packageName, stubPath] of Object.entries(stubPackages)) {
      build.onResolve({ filter: new RegExp(`^${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }, () => ({
        path: stubPath,
        namespace: 'file',
      }))
    }
  },
})
