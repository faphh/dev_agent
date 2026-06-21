#!/usr/bin/env node

/**
 * Dev Agent 简化交互模式
 *
 * 这是一个使用 readline 的简化版本，不依赖 Ink 框架，
 * 可以在所有环境中正常工作。
 */

import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
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

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\x1b[36m\x1b[1m>\x1b[0m '
});

console.log('\x1b[1m\x1b[36mDev Agent v1.0.0\x1b[0m');
console.log('\x1b[90m输入消息与 AI 对话 | /help 帮助 | quit 退出\x1b[0m');
console.log('');

let isProcessing = false;

function prompt() {
  if (!isProcessing) {
    rl.prompt();
  }
}

async function sendMessage(message) {
  isProcessing = true;

  try {
    // 调用 Dev Agent
    const child = spawn('node', [
      path.join(__dirname, 'dist', 'cli.js'),
      '-p', message
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // 实时输出
      process.stdout.write('\x1b[32m' + text);
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // 重置颜色
      if (output) {
        process.stdout.write('\x1b[0m');
      }

      if (errorOutput.trim() && !errorOutput.includes('DeprecationWarning')) {
        console.error('\x1b[31m' + errorOutput.trim() + '\x1b[0m');
      }

      console.log('');
      isProcessing = false;
      prompt();
    });

    child.on('error', (err) => {
      console.error('\x1b[31m启动失败: ' + err.message + '\x1b[0m');
      isProcessing = false;
      prompt();
    });
  } catch (err) {
    console.error('\x1b[31m错误: ' + err.message + '\x1b[0m');
    isProcessing = false;
    prompt();
  }
}

rl.on('line', (input) => {
  const trimmed = input.trim();

  if (!trimmed) {
    prompt();
    return;
  }

  // 处理退出命令
  if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit' || trimmed === '/exit') {
    console.log('\x1b[90m再见！\x1b[0m');
    rl.close();
    return;
  }

  // 处理帮助命令
  if (trimmed === '/help' || trimmed === 'help') {
    console.log('');
    console.log('\x1b[1m可用命令:\x1b[0m');
    console.log('  /help   - 显示此帮助');
    console.log('  /clear  - 清除屏幕');
    console.log('  quit    - 退出程序');
    console.log('  exit    - 退出程序');
    console.log('');
    console.log('\x1b[90m直接输入消息即可与 AI 对话\x1b[0m');
    console.log('');
    prompt();
    return;
  }

  // 处理清屏命令
  if (trimmed === '/clear' || trimmed === 'clear') {
    console.clear();
    prompt();
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
    console.log('\n\x1b[90m已取消\x1b[0m');
    isProcessing = false;
    prompt();
  } else {
    console.log('\n\x1b[90m输入 quit 退出\x1b[0m');
    prompt();
  }
});

prompt();
