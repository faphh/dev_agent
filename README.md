# Dev Agent

<p align="center">
  <strong>🤖 基于 Claude Code 架构的开源 AI 编程助手</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术架构">技术架构</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#配置">配置</a> •
  <a href="#许可证">许可证</a>
</p>

---

## 📖 项目简介

Dev Agent 是一个运行在终端中的 AI 编程助手，基于 Anthropic 的 Claude Code 开源架构进行改造和优化。它可以通过自然语言指令执行文件读写、Shell 命令、代码搜索、多步任务编排等开发工作，帮助开发者大幅提升编程效率。

## ✨ 功能特性

### 核心能力
- **🧠 智能代码理解**：自动分析项目结构，理解代码上下文
- **📝 文件操作**：读取、写入、编辑文件，支持模糊匹配替换
- **🔍 代码搜索**：基于 Glob 模式和正则表达式的文件内容搜索
- **💻 Shell 命令执行**：安全地执行终端命令，支持权限控制
- **🌐 网页搜索与抓取**：集成 WebSearch 和 WebFetch 工具
- **📋 任务管理**：创建、跟踪和管理开发任务

### 高级功能
- **🤖 多 Agent 编排**：支持子 Agent 并行处理复杂任务
- **📊 Plan 模式**：先规划后执行，确保方案经过深思熟虑
- **🔄 MCP 协议**：完整的 Model Context Protocol 客户端支持
- **⏰ 定时任务**：支持 Cron 定时任务调度
- **🎯 技能系统**：可扩展的技能/插件架构
- **🔐 权限管理**：细粒度的工具调用权限控制

### 终端体验
- **🎨 美观的 TUI 界面**：基于 React + Ink 的终端渲染
- **⌨️ Vim 模式**：完整的 Vim 键位映射支持
- **🌈 主题系统**：支持深色/浅色主题切换
- **📊 实时状态栏**：显示当前模型、目录、会话信息

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** 或 **bun**
- 支持 macOS、Linux、Windows (WSL)

### 安装

```bash
# 从 npm 安装
npm install -g dev-agent

# 或从源码构建
git clone https://github.com/faphh/dev_agent.git
cd dev_agent
bun install
bun run build
```

### 配置 API Key

```bash
# 设置 Anthropic API Key
export ANTHROPIC_API_KEY="your-api-key-here"

# 或通过登录方式
dev-agent auth login
```

### 启动使用

```bash
# 启动交互式会话
dev-agent

# 非交互式模式（适合脚本）
dev-agent -p "解释这段代码的功能"

# 指定工作目录
dev-agent -d /path/to/project
```

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────┐
│                   CLI 层                         │
│  Commander.js 命令注册 (~70+ slash 命令)         │
├─────────────────────────────────────────────────┤
│                  REPL 层                         │
│  React + Ink 终端 UI 渲染引擎                    │
├─────────────────────────────────────────────────┤
│                AI 引擎层                         │
│  QueryEngine → Anthropic API → Tool 分发         │
├─────────────────────────────────────────────────┤
│                工具层                            │
│  80+ Tools (Bash, FileIO, Agent, Web, MCP...)   │
└─────────────────────────────────────────────────┘
```

### 技术栈

| 维度 | 技术选型 |
|------|----------|
| **编程语言** | TypeScript |
| **UI 框架** | React + Ink (终端渲染) |
| **打包工具** | Bun |
| **运行时** | Node.js / Bun |
| **CLI 框架** | Commander.js |
| **状态管理** | 自研 Store (React Context) |
| **Schema 校验** | Zod v4 |
| **API SDK** | @anthropic-ai/sdk |

### 目录结构

```
src/
├── main.tsx              # CLI 入口
├── commands.ts           # 命令注册中心
├── tools.ts              # 工具注册中心
├── context.ts            # System Prompt 构建
├── QueryEngine.ts        # 查询引擎核心
├── components/           # React UI 组件 (~100+)
├── tools/                # AI 工具实现 (~80+)
├── commands/             # Slash 命令 (~70+)
├── services/             # 后端服务层
├── hooks/                # React Hooks (~50+)
├── utils/                # 工具函数库
└── types/                # 类型定义
```

## 📚 使用指南

### 常用命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/config` | 查看/修改配置 |
| `/model` | 切换 AI 模型 |
| `/clear` | 清除当前会话 |
| `/compact` | 压缩上下文 |
| `/cost` | 查看 Token 用量 |
| `/doctor` | 健康检查 |
| `/review` | 代码审查 |
| `/plan` | 进入 Plan 模式 |
| `/fast` | 切换快速模式 |

### 工具列表

**文件系统**
- `FileRead` - 读取文件
- `FileWrite` - 写入文件
- `FileEdit` - 编辑文件（模糊匹配）
- `Glob` - 文件模式匹配
- `Grep` - 内容搜索

**Shell**
- `Bash` - 执行 Shell 命令

**Agent 编排**
- `Agent` - 子 Agent 任务
- `TaskCreate/Get/List/Update` - 任务管理

**网络**
- `WebSearch` - 网页搜索
- `WebFetch` - 网页抓取

**交互**
- `AskUserQuestion` - 向用户提问
- `EnterPlanMode` - 进入计划模式

## ⚙️ 配置

### 配置文件

Dev Agent 使用多层配置系统：

1. **全局配置**：`~/.config/dev-agent/config.json`
2. **项目配置**：项目根目录下的 `.dev-agent.json`
3. **环境变量**：`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` 等

### 主题设置

```bash
# 切换主题
dev-agent config set theme dark    # 深色主题
dev-agent config set theme light   # 浅色主题
dev-agent config set theme auto    # 跟随系统
```

### 权限模式

```bash
# 设置权限模式
dev-agent config set permissionMode ask        # 每次询问
dev-agent config set permissionMode alwaysAllow # 始终允许
```

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: 添加某个功能'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 Claude Code 开源架构进行改造，遵循原始项目的许可协议。

## 🔗 相关链接

- **GitHub 仓库**：https://github.com/faphh/dev_agent
- **Claude API 文档**：https://docs.anthropic.com
- **MCP 协议**：https://modelcontextprotocol.io

---

<p align="center">
  <sub>Built with ❤️ by Dev Agent Team</sub>
</p>
