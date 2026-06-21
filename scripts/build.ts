// Custom build script with alias resolution
import { build } from 'bun'

const stubAliases: Record<string, string> = {
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

async function main() {
  console.log('Building Dev Agent...')

  const result = await build({
    entrypoints: ['./src/entrypoints/cli.tsx'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    sourcemap: 'external',
    external: ['sharp', 'fflate', 'turndown'],
    alias: stubAliases,
    loader: {
      '.md': 'text',
      '.txt': 'text',
    },
  })

  if (!result.success) {
    console.error('Build failed!')
    for (const message of result.logs) {
      console.error(message)
    }
    process.exit(1)
  }

  console.log(`Build successful!`)
  for (const output of result.outputs) {
    console.log(`  ${output.path} (${(output.size / 1024 / 1024).toFixed(2)} MB)`)
  }
}

main().catch(console.error)
