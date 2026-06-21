# Dev Agent 多平台配置指南

## 概述

Dev Agent 支持多种 AI API 平台，你可以根据需要选择合适的提供商：

| 提供商 | 模型 | 特点 |
|--------|------|------|
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | 默认，最佳代码能力 |
| **OpenAI** | GPT-4o, GPT-4-turbo | 广泛使用，多模态支持 |
| **Ollama** | Llama 3, Mistral, Gemma | 本地运行，免费使用 |

## 快速配置

### 1. Anthropic (默认)

```bash
# 设置 API Key
export ANTHROPIC_API_KEY="sk-ant-xxx"

# 可选：指定模型
export ANTHROPIC_MODEL="claude-sonnet-4-6"

# 启动 Dev Agent
./dev-agent.sh
```

### 2. OpenAI

```bash
# 设置提供商
export DEV_AGENT_PROVIDER="openai"

# 设置 API Key
export OPENAI_API_KEY="sk-xxx"

# 可选：自定义配置
export OPENAI_MODEL="gpt-4o"                    # 默认模型
export OPENAI_BASE_URL="https://api.openai.com/v1"  # API 地址
export OPENAI_MAX_TOKENS="4096"                  # 最大输出 token
export OPENAI_TEMPERATURE="0.7"                  # 温度参数

# 启动 Dev Agent
./dev-agent.sh
```

### 3. Ollama (本地模型)

```bash
# 1. 首先安装 Ollama
# macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh
# 或访问 https://ollama.com 下载

# 2. 下载模型
ollama pull llama3.1
ollama pull mistral
ollama pull codellama

# 3. 配置 Dev Agent
export DEV_AGENT_PROVIDER="ollama"
export OLLAMA_BASE_URL="http://localhost:11434"  # 默认地址
export OLLAMA_MODEL="llama3.1"                   # 选择模型

# 4. 启动 Dev Agent
./dev-agent.sh
```

## 环境变量参考

### 通用配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEV_AGENT_PROVIDER` | API 提供商 | `anthropic` |

### Anthropic 配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | API Key | (必填) |
| `ANTHROPIC_MODEL` | 模型名称 | `claude-sonnet-4-6` |
| `ANTHROPIC_MAX_TOKENS` | 最大输出 token | `8192` |

### OpenAI 配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | API Key | (必填) |
| `OPENAI_MODEL` | 模型名称 | `gpt-4o` |
| `OPENAI_BASE_URL` | API 地址 | `https://api.openai.com/v1` |
| `OPENAI_MAX_TOKENS` | 最大输出 token | `4096` |
| `OPENAI_TEMPERATURE` | 温度参数 | (可选) |

### Ollama 配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OLLAMA_BASE_URL` | Ollama 服务地址 | `http://localhost:11434` |
| `OLLAMA_MODEL` | 模型名称 | `llama3` |
| `OLLAMA_MAX_TOKENS` | 最大输出 token | `4096` |
| `OLLAMA_TEMPERATURE` | 温度参数 | (可选) |

## 推荐模型

### OpenAI 推荐

| 模型 | 适用场景 | 价格 |
|------|----------|------|
| `gpt-4o` | 最佳性能，多模态 | $5/$15 per 1M tokens |
| `gpt-4-turbo` | 长上下文，代码能力强 | $10/$30 per 1M tokens |
| `gpt-4o-mini` | 性价比高，速度快 | $0.15/$0.6 per 1M tokens |
| `gpt-3.5-turbo` | 经济实惠 | $0.5/$1.5 per 1M tokens |

### Ollama 推荐

| 模型 | 大小 | 适用场景 |
|------|------|----------|
| `llama3.1` | 8B/70B | 通用，质量好 |
| `codellama` | 7B/13B/34B | 代码专用 |
| `mistral` | 7B | 快速，质量不错 |
| `deepseek-coder` | 6.7B/33B | 代码能力强 |
| `qwen2.5-coder` | 7B/32B | 代码能力强 |

## 使用技巧

### 1. 临时切换模型

```bash
# 使用 OpenAI 运行一次
DEV_AGENT_PROVIDER=openai OPENAI_API_KEY=sk-xxx ./dev-agent.sh -p "你好"

# 使用 Ollama 运行一次
DEV_AGENT_PROVIDER=ollama OLLAMA_MODEL=mistral ./dev-agent.sh -p "你好"
```

### 2. 创建配置文件

创建 `~/.dev-agent.env` 文件：

```bash
# 选择一个提供商
DEV_AGENT_PROVIDER=ollama

# Anthropic 配置
# ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI 配置
# OPENAI_API_KEY=sk-xxx
# OPENAI_MODEL=gpt-4o

# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

然后在启动脚本中加载：

```bash
#!/bin/bash
source ~/.dev-agent.env
./dev-agent.sh "$@"
```

### 3. 使用代理

如果需要使用代理访问 API：

```bash
# OpenAI 代理
export OPENAI_BASE_URL="https://your-proxy.com/v1"

# 或使用系统代理
export https_proxy="http://your-proxy:port"
```

## 故障排除

### Ollama 连接失败

```bash
# 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 启动 Ollama 服务
ollama serve
```

### OpenAI API 错误

```bash
# 测试 API 连通性
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 模型不支持工具调用

某些模型（特别是较小的本地模型）可能不支持工具调用。建议使用：
- OpenAI: `gpt-4o`, `gpt-4-turbo`
- Ollama: `llama3.1`, `mistral` (较大版本)

## 性能对比

| 提供商 | 延迟 | 质量 | 成本 | 隐私 |
|--------|------|------|------|------|
| Anthropic | 中等 | ⭐⭐⭐⭐⭐ | 中等 | 云端 |
| OpenAI | 中等 | ⭐⭐⭐⭐⭐ | 中高 | 云端 |
| Ollama | 低 | ⭐⭐⭐⭐ | 免费 | 本地 |

## 下一步

- 查看 [API 文档](https://platform.openai.com/docs) 了解更多 OpenAI 功能
- 查看 [Ollama 文档](https://ollama.com/library) 浏览可用模型
- 提交 Issue 反馈问题或建议
