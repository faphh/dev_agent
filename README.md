# Dev Agent

<p align="center">
  <strong>🤖 专属于你的牛马程序员 🐂🐴</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#配置说明">配置说明</a> •
  <a href="#多平台支持">多平台支持</a> •
  <a href="#开发指南">开发指南</a>
</p>

---

## 📖 项目简介

Dev Agent 是一个运行在终端中的 AI 编程助手，专属于你的牛马程序员 🐂🐴。它可以通过自然语言指令执行文件读写、Shell 命令、代码搜索、多步任务编排等开发工作，帮助开发者大幅提升编程效率。

## ✨ 功能特性

### 核心能力
- 🧠 **智能代码理解** - 自动分析项目结构，理解代码上下文
- 📝 **文件操作** - 读取、写入、编辑文件，支持模糊匹配替换
- 🔍 **代码搜索** - 基于 Glob 模式和正则表达式的文件内容搜索
- 💻 **Shell 命令执行** - 安全地执行终端命令，支持权限控制
- 🌐 **网页搜索与抓取** - 集成 WebSearch 和 WebFetch 工具
- 📋 **任务管理** - 创建、跟踪和管理开发任务

### 高级功能
- 🤖 **多 Agent 编排** - 支持子 Agent 并行处理复杂任务
- 📊 **Plan 模式** - 先规划后执行，确保方案经过深思熟虑
- 🔄 **MCP 协议** - 完整的 Model Context Protocol 客户端支持
- ⏰ **定时任务** - 支持 Cron 定时任务调度
- 🎯 **技能系统** - 可扩展的技能/插件架构
- 🔐 **权限管理** - 细粒度的工具调用权限控制

### 终端体验
- 🎨 **美观的 TUI 界面** - 基于 React + Ink 的终端渲染
- ⌨️ **Vim 模式** - 完整的 Vim 键位映射支持
- 🌈 **主题系统** - 支持深色/浅色主题切换
- 📊 **实时状态栏** - 显示当前模型、目录、会话信息

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **bun** (推荐) 或 npm
- 支持 macOS、Linux、Windows (WSL)

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/faphh/dev_agent.git
cd dev_agent
```

#### 2. 安装依赖

```bash
# 安装 bun (如果未安装)
curl -fsSL https://bun.sh/install | bash

# 安装项目依赖
bun install
```

#### 3. 构建项目

```bash
bun run build
```

#### 4. 配置 API

创建 `.env` 文件：

```bash
# 小米开放平台配置 (Anthropic 兼容接口)
ANTHROPIC_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
ANTHROPIC_AUTH_TOKEN=你的API密钥
ANTHROPIC_MODEL=mimo-v2.5-pro
```

#### 5. 全局安装

```bash
# 运行安装脚本，添加全局 dev-agent 命令
./install.sh

# 使配置生效
source ~/.zshrc
```

#### 6. 测试运行

```bash
# 测试是否安装成功
dev-agent --version

# 运行交互模式
dev-agent
```

---

## 📚 使用指南

### 交互模式

在终端中直接运行：

```bash
dev-agent
```

进入交互模式后：
- 直接输入消息与 AI 对话
- AI 回复会实时流式输出
- 输入 `/help` 查看可用命令
- 输入 `quit` 或 `exit` 退出

示例对话：
```
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║           🤖 Dev Agent v1.0.0                    ║
  ║                                                   ║
  ║         专属于你的牛马程序员 🐂🐴               ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝

  ┌─────────────────────────────────────────────┐
  │ 当前配置                                    │
  ├─────────────────────────────────────────────┤
  │ 平台: 小米开放平台                          │
  │ 模型: mimo-v2.5-pro                         │
  └─────────────────────────────────────────────┘

  > 帮我看看这个项目有什么问题
我来帮你分析这个项目...

> 解释一下 main.tsx 的作用
main.tsx 是项目的入口文件...

> /model

  🔄 切换模型
  ─────────────────────────────────────────────

   ● 1. MiMo v2.5 Pro - 小米大模型

  输入模型编号或名称切换，输入 0 取消

  > 1
  ✓ 已切换到 MiMo v2.5 Pro

> quit
  再见！
```

### 非交互模式

适合脚本和自动化场景：

```bash
# 单次对话
dev-agent -p "你的问题"

# 示例
dev-agent -p "帮我看看这个项目有什么问题"
dev-agent -p "解释一下这段代码的作用"
dev-agent -p "帮我写一个 hello world 程序"
```

### 指定工作目录

```bash
# 在指定目录下运行
dev-agent -d /path/to/your/project

# 示例
dev-agent -d ~/projects/my-app
```

### 常用命令

在交互模式下，可以使用以下命令：

#### 基础命令
| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/clear` | 清除屏幕 |
| `/config` | 查看当前配置 |
| `quit` | 退出程序 |
| `exit` | 退出程序 |

#### 模型相关
| 命令 | 说明 |
|------|------|
| `/model` | 切换模型 |
| `/cost` | 查看 Token 使用量 |

#### 会话管理
| 命令 | 说明 |
|------|------|
| `/compact` | 压缩上下文 |
| `/context` | 查看上下文 |
| `/version` | 查看版本 |
| `/release-notes` | 查看更新日志 |

---

## ⚙️ 配置说明

### 环境变量

在项目根目录的 `.env` 文件中配置：

```bash
# ============================================================
# API 配置 (选择一个平台)
# ============================================================

# 方式1: Anthropic 官方 API
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_AUTH_TOKEN=你的API密钥
ANTHROPIC_MODEL=claude-sonnet-4-6

# 方式2: 小米开放平台 (Anthropic 兼容)
ANTHROPIC_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
ANTHROPIC_AUTH_TOKEN=你的API密钥
ANTHROPIC_MODEL=mimo-v2.5-pro
```

### 配置优先级

1. 命令行参数 (最高优先级)
2. 环境变量
3. `.env` 文件
4. 默认值 (最低优先级)

---

## 🌐 多平台支持

Dev Agent 支持多种 AI API 平台：

| 平台 | 模型 | 配置方式 |
|------|------|----------|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | 默认支持 |
| **小米开放平台** | mimo-v2.5-pro | Anthropic 兼容接口 |
| **OpenAI** | GPT-4o, GPT-4-turbo | 设置 `DEV_AGENT_PROVIDER=openai` |
| **Ollama** | Llama 3, Mistral, CodeLlama | 设置 `DEV_AGENT_PROVIDER=ollama` |

### 使用 OpenAI

在 `.env` 文件中配置：

```bash
DEV_AGENT_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o
```

### 使用 Ollama (本地模型)

```bash
# 1. 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 下载模型
ollama pull llama3.1

# 3. 在 .env 中配置
DEV_AGENT_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

---

## 🛠️ 开发指南

### 项目结构

```
dev_agent/
├── src/                    # 源代码
│   ├── main.tsx           # CLI 入口
│   ├── commands.ts        # 命令注册
│   ├── tools.ts           # 工具注册
│   ├── components/        # React 组件
│   ├── tools/             # AI 工具实现
│   ├── commands/          # 命令实现
│   ├── services/          # 服务层
│   └── utils/             # 工具函数
├── dist/                  # 构建输出
├── docs/                  # 文档
├── .env                   # 环境配置 (不提交到 Git)
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── build.ts               # 构建脚本
```

### 开发命令

```bash
# 安装依赖
bun install

# 构建项目
bun run build

# 开发模式运行
bun run dev

# 类型检查
bun run typecheck

# 代码格式化
bun run lint:fix
```

### 添加新功能

1. **添加新命令**: 在 `src/commands/` 目录下创建新文件
2. **添加新工具**: 在 `src/tools/` 目录下创建新文件
3. **修改 UI**: 编辑 `src/components/` 目录下的组件

### 构建流程

```bash
# 清理旧构建
bun run clean

# 重新构建
bun run build

# 测试构建结果
./dev-agent.sh --version
```

---

## 📋 常见问题

### Q: 交互模式无法输入怎么办？

A: 确保在真实终端中运行，不要通过管道或脚本运行。

### Q: API 连接失败怎么办？

A: 检查 `.env` 文件中的 API 配置是否正确，确保 API 密钥有效。

### Q: 如何切换模型？

A: 修改 `.env` 文件中的 `ANTHROPIC_MODEL` 或 `OPENAI_MODEL` 配置。

### Q: 如何查看日志？

A: 使用 `--debug` 参数运行：
```bash
dev-agent --debug
```

---

## 📄 许可证

本项目基于 Claude Code 开源架构进行改造，遵循原始项目的许可协议。

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/faphh/dev_agent
- **Claude Code**: https://github.com/anthropics/claude-code
- **Anthropic API**: https://docs.anthropic.com
- **MCP 协议**: https://modelcontextprotocol.io

---

## 🙏 致谢

- [Anthropic](https://www.anthropic.com) - 提供 Claude Code 开源架构
- [Claude Code](https://github.com/anthropics/claude-code) - 原始项目

---

<p align="center">
  <sub>Built with ❤️ by Dev Agent Team</sub>
</p>
