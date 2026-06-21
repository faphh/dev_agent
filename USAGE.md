# Dev Agent 使用指南

## 交互模式使用方法

### 重要说明

Dev Agent 的交互模式需要在**真实终端**中运行，不能通过脚本或管道运行。

### 正确的使用方式

#### 方式 1: 直接在终端运行

```bash
# 打开终端 (Terminal.app, iTerm2, etc.)
cd /Users/jack/Desktop/dev_agent

# 运行 Dev Agent
./dev-agent.sh
```

#### 方式 2: 使用非交互模式 (推荐用于测试)

```bash
# 使用 -p 参数进行单次对话
./dev-agent.sh -p "你好，请介绍一下自己"

# 管道输入
echo "解释这段代码" | ./dev-agent.sh -p
```

#### 方式 3: 创建全局命令

```bash
# 添加到 PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 创建符号链接
mkdir -p ~/bin
ln -sf /Users/jack/Desktop/dev_agent/dev-agent.sh ~/bin/dev-agent

# 现在可以在任何地方运行
dev-agent
```

## 交互模式功能

启动交互模式后，你可以：

1. **直接输入消息** - 输入问题或指令，按 Enter 发送
2. **使用斜杠命令** - 输入 `/help` 查看所有可用命令
3. **Tab 补全** - 按 Tab 补全命令和文件名
4. **上下箭头** - 浏览历史消息
5. **Ctrl+C** - 中断当前操作
6. **Ctrl+D** - 退出 Dev Agent

## 常用命令

```bash
/help           # 查看帮助
/clear          # 清除屏幕
/cost           # 查看 Token 使用量
/model          # 查看/切换模型
/config         # 查看配置
/compact        # 压缩上下文
/doctor         # 健康检查
```

## 故障排除

### 问题: 无法输入消息

**原因**: 可能是通过脚本或管道运行，而不是在真实终端中运行。

**解决方案**:
1. 直接在终端中运行 `./dev-agent.sh`
2. 使用非交互模式: `./dev-agent.sh -p "你的问题"`

### 问题: 终端显示异常

**原因**: 终端类型不兼容。

**解决方案**:
```bash
# 设置终端类型
export TERM=xterm-256color

# 或使用简单模式
./dev-agent.sh --bare
```

### 问题: API 连接失败

**原因**: API Key 或 Base URL 配置错误。

**解决方案**:
```bash
# 检查配置
cat .env

# 测试 API 连接
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     "$ANTHROPIC_BASE_URL/v1/messages" \
     -d '{"model":"mimo-v2.5-pro","max_tokens":100,"messages":[{"role":"user","content":"hi"}]}'
```

## 配置文件

### .env 文件

```bash
# Dev Agent 配置
ANTHROPIC_BASE_URL=https://token-plan-cn.xiaomimimo.com/anthropic
ANTHROPIC_API_KEY=your-api-key
ANTHROPIC_MODEL=mimo-v2.5-pro
```

### 配置优先级

1. 命令行参数 (最高优先级)
2. 环境变量
3. .env 文件
4. 默认值 (最低优先级)

## 高级用法

### 指定工作目录

```bash
./dev-agent.sh -d /path/to/your/project
```

### 使用不同的模型

```bash
# 临时使用其他模型
./dev-agent.sh --model mimo-v2.5-pro -p "你好"

# 或在 .env 中设置默认模型
echo "ANTHROPIC_MODEL=mimo-v2.5-pro" >> .env
```

### 调试模式

```bash
./dev-agent.sh --debug
```

### 非交互模式 (用于脚本)

```bash
# 输出纯文本
./dev-agent.sh -p "你的问题" --output-format text

# 输出 JSON
./dev-agent.sh -p "你的问题" --output-format json

# 流式输出
./dev-agent.sh -p "你的问题" --output-format stream-json
```

## 示例

### 示例 1: 代码审查

```bash
./dev-agent.sh -p "请审查 src/main.tsx 文件，找出潜在的问题"
```

### 示例 2: 代码解释

```bash
./dev-agent.sh -p "解释一下这段代码的作用: console.log('hello')"
```

### 示例 3: 代码重构

```bash
./dev-agent.sh -p "帮我重构这个函数，使其更简洁"
```

### 示例 4: 调试帮助

```bash
./dev-agent.sh -p "这段代码报错了: TypeError: undefined is not a function"
```

## 获取帮助

- 查看内置帮助: `./dev-agent.sh --help`
- 查看命令列表: 在交互模式中输入 `/help`
- 提交问题: https://github.com/faphh/dev_agent/issues
