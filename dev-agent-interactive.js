#!/usr/bin/env node

/**
 * Dev Agent 交互模式
 *
 * 支持：
 * - 流式输出
 * - 模型切换
 * - 彩色终端 UI
 * - 多平台 API 支持
 */

import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 可用模型列表
// ============================================================
const AVAILABLE_MODELS = {
  'anthropic': [
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: '最新模型，性能最佳' },
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: '最强推理能力' },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: '快速响应，成本低' },
  ],
  'openai': [
    { id: 'gpt-4o', name: 'GPT-4o', description: '最新多模态模型' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '长上下文，代码能力强' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '性价比高，速度快' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '经济实惠' },
  ],
  'ollama': [
    { id: 'llama3.1', name: 'Llama 3.1', description: '通用模型，质量好' },
    { id: 'mistral', name: 'Mistral', description: '快速，质量不错' },
    { id: 'codellama', name: 'Code Llama', description: '代码专用' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', description: '代码能力强' },
  ],
  'xiaomi': [
    { id: 'mimo-v2.5-pro', name: 'MiMo v2.5 Pro', description: '小米大模型' },
  ]
};

// ============================================================
// 加载配置
// ============================================================
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

// 当前配置
let currentConfig = {
  provider: detectProvider(),
  model: detectModel(),
  baseUrl: process.env.ANTHROPIC_BASE_URL || '',
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.OPENAI_API_KEY || '',
};

function detectProvider() {
  if (process.env.DEV_AGENT_PROVIDER) return process.env.DEV_AGENT_PROVIDER;
  if (process.env.ANTHROPIC_BASE_URL?.includes('xiaomimimo')) return 'xiaomi';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.OLLAMA_BASE_URL) return 'ollama';
  return 'anthropic';
}

function detectModel() {
  if (process.env.ANTHROPIC_MODEL) return process.env.ANTHROPIC_MODEL;
  if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;
  if (process.env.OLLAMA_MODEL) return process.env.OLLAMA_MODEL;
  return 'mimo-v2.5-pro';
}

// ============================================================
// 终端 UI 工具函数
// ============================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function colorize(color, text) {
  return `${color}${text}${colors.reset}`;
}

function printBanner() {
  console.log('');
  console.log(colorize(colors.cyan + colors.bold, '  ╔═══════════════════════════════════════════════════╗'));
  console.log(colorize(colors.cyan + colors.bold, '  ║                                                   ║'));
  console.log(colorize(colors.cyan + colors.bold, '  ║           🤖 Dev Agent v1.0.0                    ║'));
  console.log(colorize(colors.cyan + colors.bold, '  ║                                                   ║'));
  console.log(colorize(colors.cyan + colors.bold, '  ║       AI 编程助手 - 基于 Claude Code 架构        ║'));
  console.log(colorize(colors.cyan + colors.bold, '  ║                                                   ║'));
  console.log(colorize(colors.cyan + colors.bold, '  ╚═══════════════════════════════════════════════════╝'));
  console.log('');
}

function printStatus() {
  const providerName = {
    'anthropic': 'Anthropic',
    'openai': 'OpenAI',
    'ollama': 'Ollama (本地)',
    'xiaomi': '小米开放平台'
  }[currentConfig.provider] || currentConfig.provider;

  console.log(colorize(colors.gray, '  ┌─────────────────────────────────────────────┐'));
  console.log(colorize(colors.gray, '  │ ') + colorize(colors.white + colors.bold, '当前配置') + colorize(colors.gray, '                                   │'));
  console.log(colorize(colors.gray, '  ├─────────────────────────────────────────────┤'));
  console.log(colorize(colors.gray, '  │ ') + colorize(colors.yellow, '平台: ') + colorize(colors.white, providerName.padEnd(35)) + colorize(colors.gray, ' │'));
  console.log(colorize(colors.gray, '  │ ') + colorize(colors.yellow, '模型: ') + colorize(colors.white, currentConfig.model.padEnd(35)) + colorize(colors.gray, ' │'));
  console.log(colorize(colors.gray, '  └─────────────────────────────────────────────┘'));
  console.log('');
}

function printHelp() {
  console.log('');
  console.log(colorize(colors.cyan + colors.bold, '  📖 命令列表'));
  console.log(colorize(colors.gray, '  ─────────────────────────────────────────────'));
  console.log('');
  console.log(colorize(colors.yellow, '  /help') + colorize(colors.gray, '     - 显示此帮助信息'));
  console.log(colorize(colors.yellow, '  /model') + colorize(colors.gray, '    - 切换模型'));
  console.log(colorize(colors.yellow, '  /config') + colorize(colors.gray, '   - 查看当前配置'));
  console.log(colorize(colors.yellow, '  /clear') + colorize(colors.gray, '    - 清除屏幕'));
  console.log(colorize(colors.yellow, '  quit') + colorize(colors.gray, '      - 退出程序'));
  console.log(colorize(colors.yellow, '  exit') + colorize(colors.gray, '      - 退出程序'));
  console.log('');
  console.log(colorize(colors.gray, '  直接输入消息即可与 AI 对话'));
  console.log('');
}

function printModels() {
  console.log('');
  console.log(colorize(colors.cyan + colors.bold, '  🔄 切换模型'));
  console.log(colorize(colors.gray, '  ─────────────────────────────────────────────'));
  console.log('');

  const models = AVAILABLE_MODELS[currentConfig.provider] || [];
  models.forEach((model, index) => {
    const isCurrent = model.id === currentConfig.model;
    const marker = isCurrent ? colorize(colors.green + colors.bold, ' ● ') : colorize(colors.gray, ' ○ ');
    const name = isCurrent ? colorize(colors.green + colors.bold, model.name) : colorize(colors.white, model.name);
    const desc = colorize(colors.gray, model.description);
    console.log(`  ${marker}${index + 1}. ${name} - ${desc}`);
  });

  console.log('');
  console.log(colorize(colors.gray, '  输入模型编号或名称切换，输入 0 取消'));
  console.log('');
}

// ============================================================
// 创建 readline 接口
// ============================================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize(colors.cyan + colors.bold, '  > ')
});

let isProcessing = false;
let waitingForModelSelection = false;

function prompt() {
  if (!isProcessing && !waitingForModelSelection) {
    rl.prompt();
  }
}

// ============================================================
// 发送消息到 AI
// ============================================================
async function sendMessage(message) {
  isProcessing = true;

  try {
    // 根据当前配置设置环境变量
    const env = { ...process.env };

    if (currentConfig.provider === 'openai') {
      env.DEV_AGENT_PROVIDER = 'openai';
      env.OPENAI_API_KEY = currentConfig.apiKey;
      env.OPENAI_MODEL = currentConfig.model;
    } else if (currentConfig.provider === 'ollama') {
      env.DEV_AGENT_PROVIDER = 'ollama';
      env.OLLAMA_BASE_URL = currentConfig.baseUrl || 'http://localhost:11434';
      env.OLLAMA_MODEL = currentConfig.model;
    } else {
      env.ANTHROPIC_BASE_URL = currentConfig.baseUrl;
      env.ANTHROPIC_AUTH_TOKEN = currentConfig.apiKey;
      env.ANTHROPIC_MODEL = currentConfig.model;
    }

    // 调用 Dev Agent
    const child = spawn('node', [
      path.join(__dirname, 'dist', 'cli.js'),
      '-p', message
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // 实时输出
      process.stdout.write(colorize(colors.green, text));
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // 重置颜色
      if (output) {
        process.stdout.write(colors.reset);
      }

      if (errorOutput.trim() && !errorOutput.includes('DeprecationWarning')) {
        console.error(colorize(colors.red, errorOutput.trim()));
      }

      console.log('');
      isProcessing = false;
      prompt();
    });

    child.on('error', (err) => {
      console.error(colorize(colors.red, `启动失败: ${err.message}`));
      isProcessing = false;
      prompt();
    });
  } catch (err) {
    console.error(colorize(colors.red, `错误: ${err.message}`));
    isProcessing = false;
    prompt();
  }
}

// ============================================================
// 处理模型切换
// ============================================================
function handleModelSelection(input) {
  const models = AVAILABLE_MODELS[currentConfig.provider] || [];
  const trimmed = input.trim();

  if (trimmed === '0') {
    console.log(colorize(colors.gray, '  已取消'));
    console.log('');
    waitingForModelSelection = false;
    prompt();
    return;
  }

  // 尝试作为编号
  const index = parseInt(trimmed) - 1;
  if (index >= 0 && index < models.length) {
    const model = models[index];
    currentConfig.model = model.id;
    console.log(colorize(colors.green, `  ✓ 已切换到 ${model.name}`));
    console.log('');
    waitingForModelSelection = false;
    prompt();
    return;
  }

  // 尝试作为模型名称
  const found = models.find(m => m.id === trimmed || m.name.toLowerCase() === trimmed.toLowerCase());
  if (found) {
    currentConfig.model = found.id;
    console.log(colorize(colors.green, `  ✓ 已切换到 ${found.name}`));
    console.log('');
    waitingForModelSelection = false;
    prompt();
    return;
  }

  console.log(colorize(colors.red, '  无效选择，请重新输入'));
}

// ============================================================
// 主事件处理
// ============================================================
rl.on('line', (input) => {
  const trimmed = input.trim();

  // 处理模型选择
  if (waitingForModelSelection) {
    handleModelSelection(trimmed);
    return;
  }

  if (!trimmed) {
    prompt();
    return;
  }

  // 处理退出命令
  if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit' || trimmed === '/exit') {
    console.log(colorize(colors.gray, '  再见！'));
    rl.close();
    return;
  }

  // 处理帮助命令
  if (trimmed === '/help' || trimmed === 'help') {
    printHelp();
    prompt();
    return;
  }

  // 处理清屏命令
  if (trimmed === '/clear' || trimmed === 'clear') {
    console.clear();
    printBanner();
    printStatus();
    prompt();
    return;
  }

  // 处理配置命令
  if (trimmed === '/config' || trimmed === 'config') {
    printStatus();
    prompt();
    return;
  }

  // 处理模型切换命令
  if (trimmed === '/model' || trimmed === 'model') {
    printModels();
    waitingForModelSelection = true;
    return;
  }

  // 发送消息到 AI
  sendMessage(trimmed);
});

rl.on('close', () => {
  process.exit(0);
});

// 处理 Ctrl+C
rl.on('SIGINT', () => {
  if (isProcessing) {
    console.log(colorize(colors.gray, '\n  已取消'));
    isProcessing = false;
    prompt();
  } else if (waitingForModelSelection) {
    console.log(colorize(colors.gray, '\n  已取消'));
    waitingForModelSelection = false;
    prompt();
  } else {
    console.log(colorize(colors.gray, '\n  输入 quit 退出'));
    prompt();
  }
});

// ============================================================
// 启动
// ============================================================
printBanner();
printStatus();
prompt();
