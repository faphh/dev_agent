// Script to setup stub packages in node_modules
import { mkdirSync, cpSync, existsSync } from 'fs'
import { join } from 'path'

const stubPackages = [
  '@ant/claude-for-chrome-mcp',
  '@anthropic-ai/bedrock-sdk',
  '@anthropic-ai/foundry-sdk',
  '@anthropic-ai/mcpb',
  '@anthropic-ai/sandbox-runtime',
  '@anthropic-ai/vertex-sdk',
  '@azure/identity',
  'color-diff-napi',
  'modifiers-napi',
]

const stubsDir = join(__dirname, '..', 'src', 'stubs')
const nodeModulesDir = join(__dirname, '..', 'node_modules')

for (const pkg of stubPackages) {
  const sourceDir = join(stubsDir, pkg)
  const targetDir = join(nodeModulesDir, pkg)

  if (!existsSync(sourceDir)) {
    console.warn(`Stub not found for ${pkg}, skipping...`)
    continue
  }

  // Create target directory
  mkdirSync(targetDir, { recursive: true })

  // Copy stub files
  cpSync(sourceDir, targetDir, { recursive: true })

  // Create package.json
  const packageJson = {
    name: pkg,
    version: '0.0.0-stub',
    main: 'index.ts',
    types: 'index.ts',
  }

  const packageJsonPath = join(targetDir, 'package.json')
  const { writeFileSync } = require('fs')
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  console.log(`✓ Installed stub for ${pkg}`)
}

console.log('Stub packages setup complete!')
