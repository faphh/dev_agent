// Build script for Dev Agent
import { build, plugin } from 'bun'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
const version = packageJson.version || '1.0.0'

// Polyfill for stdin.ref() in non-TTY environments
const STDIN_POLYFILL = `
// Polyfill for stdin.ref() in non-TTY environments
if (typeof process.stdin.ref !== 'function') {
  process.stdin.ref = function() { return this; };
}
if (typeof process.stdin.unref !== 'function') {
  process.stdin.unref = function() { return this; };
}
`

// Plugin to resolve stub packages
plugin({
  name: 'stub-resolver',
  setup(build) {
    const stubs: Record<string, string> = {
      '@ant/claude-for-chrome-mcp': join(__dirname, 'src/stubs/@ant/claude-for-chrome-mcp/index.ts'),
      '@anthropic-ai/bedrock-sdk': join(__dirname, 'src/stubs/@anthropic-ai/bedrock-sdk/index.ts'),
      '@anthropic-ai/foundry-sdk': join(__dirname, 'src/stubs/@anthropic-ai/foundry-sdk/index.ts'),
      '@anthropic-ai/mcpb': join(__dirname, 'src/stubs/@anthropic-ai/mcpb/index.ts'),
      '@anthropic-ai/sandbox-runtime': join(__dirname, 'src/stubs/@anthropic-ai/sandbox-runtime/index.ts'),
      '@anthropic-ai/vertex-sdk': join(__dirname, 'src/stubs/@anthropic-ai/vertex-sdk/index.ts'),
      '@azure/identity': join(__dirname, 'src/stubs/@azure/identity/index.ts'),
      'color-diff-napi': join(__dirname, 'src/stubs/color-diff-napi/index.ts'),
      'modifiers-napi': join(__dirname, 'src/stubs/modifiers-napi/index.ts'),
    }

    for (const [packageName, stubPath] of Object.entries(stubs)) {
      build.onResolve({ filter: new RegExp(`^${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }, () => ({
        path: stubPath,
        namespace: 'file',
      }))
    }
  },
})

async function main() {
  console.log('Building Dev Agent...')
  console.log(`Version: ${version}`)

  const result = await build({
    entrypoints: ['./src/entrypoints/cli.tsx'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    sourcemap: 'external',
    external: ['sharp', 'fflate', 'turndown'],
    loader: {
      '.md': 'text',
      '.txt': 'text',
    },
    define: {
      'MACRO.VERSION': JSON.stringify(version),
      'MACRO.ISSUES_EXPLAINER': JSON.stringify('Please report issues at https://github.com/faphh/dev_agent/issues'),
      'MACRO.PACKAGE_URL': JSON.stringify('https://github.com/faphh/dev_agent'),
      'MACRO.NATIVE_PACKAGE_URL': JSON.stringify('https://github.com/faphh/dev_agent'),
      'MACRO.VERSION_CHANGELOG': JSON.stringify(''),
    },
  })

  if (!result.success) {
    console.error('Build failed!')
    for (const message of result.logs) {
      console.error(message)
    }
    process.exit(1)
  }

  console.log('Build successful!')
  for (const output of result.outputs) {
    console.log(`  ${output.path} (${(output.size / 1024 / 1024).toFixed(2)} MB)`)

    // Inject stdin polyfill for non-TTY environments
    if (output.path.endsWith('.js')) {
      const content = readFileSync(output.path, 'utf-8')
      const polyfilled = STDIN_POLYFILL + '\n' + content
      writeFileSync(output.path, polyfilled)
      console.log(`    → Injected stdin polyfill`)
    }
  }
}

main().catch(console.error)
