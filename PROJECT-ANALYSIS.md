# Claude Code 项目架构分析

## 项目概述

这是 **Anthropic 官方出品的 Claude Code CLI** 的完整源代码仓库，一个运行在终端中的 AI 编程助手。用户可以通过自然语言指令让 Claude 执行文件读写、Shell 命令、代码搜索、多步任务编排等开发工作。

---

## 技术选型

| 维度 | 技术 |
|------|------|
| **编程语言** | TypeScript |
| **UI 框架** | React + [Ink](https://github.com/vadimdemedes/ink)（React 终端渲染） |
| **打包工具** | Bun（使用 `bun:bundle` 做条件编译 / DCE） |
| **运行时** | Node.js / Bun |
| **CLI 框架** | @commander-js/extra-typings (Commander.js 类型安全版本) |
| **状态管理** | 自研 createStore (基于 React Context + useSyncExternalStore) |
| **Schema 校验** | Zod v4 |
| **外部依赖** | lodash-es、chalk、react |
| **API SDK** | @anthropic-ai/sdk |
| **协议** | MCP (Model Context Protocol)、WebSocket |

---

## 目录结构总览

```
src/
├── main.tsx                  # 入口文件：CLI 初始化 & 全局配置
├── commands.ts               # 所有内置命令注册中心
├── tools.ts                  # 所有 AI Tool 注册中心
├── context.ts                # System Prompt 构建 & Git 上下文注入
├── Task.ts                   # 任务系统（后台 shell / agent 抽象）
├── Tool.ts                   # Tool 类型定义（约 80+ Tools）
├── QueryEngine.ts            # 查询引擎核心
├── replLauncher.tsx          # REPL 启动器
├── hooks.ts                  # Hook 注册与管理
├── history.ts                # 会话历史管理
├── ink.ts                    # Ink/TUI 渲染入口
│
├── entrypoints/              # 不同入口点
│   ├── cli.tsx               # CLI 主入口
│   ├── init.ts               # 初始化逻辑
│   ├── sdk/                  # SDK 模式
│   └── ...
│
├── state/                    # 应用状态管理
│   ├── AppState.tsx          # React Context Provider
│   └── AppStateStore.js      # Store 实现
│
├── components/               # React UI 组件 (~100+ 组件)
│   ├── App.tsx               # 根组件
│   ├── MessageResponse.tsx   # 消息渲染
│   └── ...
│
├── tools/                    # AI Tools 实现 (~70+ Tools)
│   ├── BashTool/             # Shell 命令执行
│   ├── FileReadTool/         # 文件读取
│   ├── FileWriteTool/        # 文件写入
│   ├── FileEditTool/         # 文件编辑（模糊匹配替换）
│   ├── AgentTool/            # 子 Agent 编排
│   ├── WebSearchTool/        # Web 搜索
│   ├── WebFetchTool/         # 网页抓取
│   ├── GlobTool/             # 文件模式匹配
│   ├── GrepTool/             # 内容搜索
│   ├── NotebookEditTool/     # Jupyter 编辑
│   ├── TodoWriteTool/        # TODO 列表
│   ├── AskUserQuestionTool/  # 用户交互问题
│   ├── EnterPlanModeTool/    # Plan 模式切换
│   ├── CronCreateTool/       # 定时任务创建
│   ├── Task*Tool/            # 任务 CRUD
│   └── ...
│
├── commands/                 # Slash 命令实现 (~70+ 命令)
│   ├── help/                 # /help
│   ├── login/                # /login
│   ├── config/               # /config
│   ├── model/                # /model
│   ├── session/              # /session
│   ├── mcp/                  # /mcp
│   ├── skills/               # /skills
│   ├── review/               # /review
│   ├── vim/                  # Vim 模式
│   ├── plan/                 # Plan 模式
│   └── ...
│
├── services/                 # 后端服务层
│   ├── api/                  # API 客户端（Bootstrap、Files、Referral）
│   ├── mcp/                  # MCP 客户端（服务器连接、资源、工具分发）
│   ├── analytics/            # 分析与遥测（GrowthBook AB 测试）
│   ├── plugins/              # 插件系统
│   ├── skillSearch/          # 技能搜索
│   ├── policyLimits/         # 策略与限流
│   ├── remoteManagedSettings/# 远程配置管理
│   ├── oauth/                # OAuth 认证
│   ├── compact/              # 上下文压缩
│   ├── lsp/                  # LSP 集成
│   └── ...
│
├── bridge/                   # Remote Control Bridge
│   └── 移动端/Web 客户端桥接通信（VS Code IPC-like）
│
├── remote/                   # 远程控制模式
│   ├── RemoteSessionManager/ # 远程会话管理
│   ├── SessionsWebSocket/    # WebSocket 通信
│   └── ...
│
├── coordinator/              # Coordinator 模式
│   └── 多进程协调
│
├── voice/                    # 语音功能
│   └── STT/Voice 相关
│
├── vim/                      # Vim 键位映射
│   ├── motions.ts            # 运动命令
│   ├── textObjects.ts        # 文本对象
│   └── transitions.ts        # 状态机转换
│
├── ink/                      # Ink 渲染定制
│   ├── render-node-to-output.ts
│   ├── optimization.ts
│   └── ...
│
├── utils/                    # 工具函数库
│   ├── auth/                 # 认证（OAuth、订阅、密钥）
│   ├── git/                  # Git 操作封装
│   ├── config/               # 配置文件读写
│   ├── settings/             # 设置管理
│   ├── plugins/              # 插件加载
│   ├── skills/               # Skill 加载
│   ├── messages/             # 消息格式化
│   ├── telemetry/            # 遥测
│   ├── sandbox/              # Sandbox 环境
│   ├── secureStorage/        # Keychain/安全存储
│   ├── mcp/                  # MCP 工具
│   ├── task/                 # 任务输出
│   ├── thinking/             # Thinking 模式
│   └── ...
│
├── types/                    # 全局类型定义
│   ├── command.ts            # Command 类型
│   ├── permissions.ts        # 权限类型
│   ├── message.ts            # 消息类型
│   ├── tools.ts              # Tool 进度类型
│   └── ids.ts                # ID 类型
│
├── hooks/                    # React Hooks (~50+)
│   ├── useCanUseTool.tsx     # Tool 可用性检查
│   ├── useSettingsChange.ts  # 设置变更监听
│   ├── useCopyOnSelect.ts    # 复制行为控制
│   └── ...
│
└── screens/                  # 全屏界面
    ├── SetupScreen/          # 首次安装引导
    └── ...
```

---

## 核心架构设计

### 1. 请求处理流程

```
用户输入 (/command 或自然语言)
  │
  ▼
REPL Launcher (replLauncher.tsx)
  │
  ▼
QueryEngine (QueryEngine.ts) — 查询编排核心
  │
  ▼
Context 构建 (context.ts) — 注入 Git 状态、Claude.md、记忆文件等
  │
  ▼
Anthropic API 调用
  │
  ▼
Assistant 响应解析
  │
  ├── 文本回复 → MessageResponse.tsx → Ink TUI 渲染
  │
  └── Tool Call → Tool 分发 → 对应 Tool 实现
                           │
                     执行结果 → 回传 API
```

### 2. CLI 双层架构

项目采用 **"CLI 前端 + REPL + AI 后端"** 三层架构：

- **CLI 层** (`main.tsx` + `commands.ts`)：命令行入口，通过 Commander.js 注册 ~70+ 个 slash 命令和子命令
- **REPL 层** (`replLauncher.tsx` + `ink.ts`)：交互式终端界面，基于 Ink (React TUI) 实现
- **AI 后端** (`QueryEngine.ts` + `tools.ts`)：通过 Anthropic SDK 调用 Claude API，管理 80+ 种 Tool 工具调用

### 3. Tool 系统

每个 Tool 是独立的模块目录，遵循统一接口。包括：

| 类别 | 代表 Tools |
|------|-----------|
| **文件系统** | FileRead、FileWrite、FileEdit、Glob、Grep |
| **Shell** | Bash、PowerShell |
| **Agent 编排** | Agent、TaskCreate/Get/List/Update/Stop/Output、SendMessage、TeamCreate/Delete |
| **网络** | WebSearch、WebFetch |
| **交互** | AskUserQuestion、EnterPlanMode、ExitPlanMode |
| **MCP** | MCPTool、ListMcpResources、ReadMcpResource、McpAuth |
| **调度** | CronCreate/Delete/List、SleepTool |
| **编辑** | NotebookEdit、Config |
| **其他** | Browser、LSP、ToolSearch、SkillTool |

### 4. 特性开关（Feature Flags）

项目重度使用 Bun 的 `feature()` API 做条件编译 / DCE：

```typescript
const coordinatorMode = feature('COORDINATOR_MODE')
  ? require('./coordinator/coordinatorMode.js') : null;

const assistantModule = feature('KAIROS')
  ? require('./assistant/index.js') : null;
```

常见 Feature Flag：`KAIROS`, `BRIDGE_MODE`, `VOICE_MODE`, `DAEMON`, `PROACTIVE`, `AGENT_TRIGGERS`, `WORKFLOW_SCRIPTS`, `ULTRAPLAN` 等。

这意味着同一份代码可以根据内部版/外部版、不同产品线变体编译出不同形态。

### 5. 状态管理

- **AppState**：单一状态树，基于 React Context + `useSyncExternalStore`
- **Store**：自定义轻量 store 实现（`state/store.ts`），支持不可变更新回调
- **Context 注入**：System Prompt 通过 `context.ts` 动态注入 Git 信息、`.claude.md` 项目指南、内存文件等

### 6. 命令系统

所有命令分为多个来源层：

1. **Bundled**：内嵌的命令/技能（启动时同步加载）
2. **Plugin**：用户安装的第三方插件（异步加载）
3. **Skills Directory**：`/skills/` 目录下的自定义命令
4. **Built-in Commands**：TypeScript 源码中注册的 slash 命令（`/help`、`/login`、`/config` 等）
5. **Dynamic Skills**：文件操作中发现的动态技能
6. **Workflow Scripts**：工作流脚本命令

每个命令具有 `availability` 属性来控制是否根据认证状态/API提供商过滤显示。

### 7. 远程模式

支持三种运行模式：

- **本地模式**：直接在终端运行
- **Remote 模式** (`--remote`)：连接远程会话，只允许安全命令（`REMOTE_SAFE_COMMANDS`）
- **Bridge 模式** (`--bridge-mode`)：通过 IPC/Bridge 通信，服务于桌面端/Mobile/Web 客户端

### 8. MCP 集成

完整的 Model Context Protocol 客户端实现：

- `services/mcp/client.ts`：MCP 服务器管理与工具分发
- `MCPTool`：通用 MCP 调用
- 支持 MCP 服务器自动发现、权限审批（`mcpServerApproval.tsx`）

### 9. Vim 模式

完整的 Vim 状态机实现：

- 运动命令（motions）
- 文本对象（textObjects）
- 操作符（operators）
- 状态转换（transitions）— 基于有限状态机

### 10. 权限系统

细粒度的工具调用权限控制：

- 每次 Tool 调用前需要权限审批
- 支持 `permissionMode`（alwaysAllow / alwaysDeny / ask）
- Bypass 模式可关闭权限检查
- Denial tracking 防止权限疲劳

---

## 关键数据

| 指标 | 数量 |
|------|------|
| 源代码文件数 | ~1,900 |
| AI Tools 数量 | ~80 |
| Slash Commands 数量 | ~70+ |
| React Components 数量 | ~100+ |
| Services 数量 | ~25 |
| Utilities | ~40 |
| Subdirectories | ~150 |

---

## 设计模式总结

1. **模块化 Tool/Command 注册**：集中式注册 + 独立模块实现
2. **Feature Flag DCE**：Bun bundle-level conditional compilation
3. **Memoize 缓存**：lodash memoize 用于昂贵操作（命令加载、Git 状态等）
4. **Lazy Require**：循环依赖解决 + 按需加载大模块
5. **Provider Pattern**：React Context Provider 封装各种服务上下文
6. **Hook 模式**：~50+ React Hooks 用于关注点分离
7. **类型安全**：Zod schema + TypeScript 严格类型
8. **Layered Architecture**：CLI → REPL → AI Engine → External APIs/Tools
