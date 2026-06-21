#!/bin/bash
# Dev Agent 全局命令

# 获取 Dev Agent 安装目录
DEV_AGENT_DIR="/Users/jack/Desktop/dev_agent"

# 清除可能冲突的环境变量
unset ANTHROPIC_API_KEY

# 加载环境配置
if [ -f "$DEV_AGENT_DIR/.env" ]; then
    set -a
    source "$DEV_AGENT_DIR/.env"
    set +a
fi

# 判断运行模式
if [ $# -gt 0 ]; then
    # 有参数，使用原始 CLI
    exec node "$DEV_AGENT_DIR/dist/cli.js" "$@"
else
    # 无参数，使用交互模式
    exec node "$DEV_AGENT_DIR/dev-agent-interactive.js"
fi
