#!/bin/bash
# Dev Agent CLI wrapper script
# Usage: dev-agent [options]

# Get the real path of this script (following symlinks)
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
NODE_BIN="/Users/jack/.nvm/versions/node/v22.22.2/bin/node"

# ============================================================
# 加载环境配置 (从 .env 文件)
# ============================================================
if [ -f "$SCRIPT_DIR/.env" ]; then
  # 导出 .env 文件中的所有变量
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# ============================================================
# 检查是否在真实终端中运行
# ============================================================
if [ ! -t 0 ] || [ ! -t 1 ]; then
  # 不是交互式终端，使用 -p 模式
  if [ $# -eq 0 ]; then
    echo "错误: Dev Agent 交互模式需要在真实终端中运行。"
    echo ""
    echo "使用方法:"
    echo "  1. 直接在终端运行: ./dev-agent.sh"
    echo "  2. 非交互模式: ./dev-agent.sh -p \"你的问题\""
    echo ""
    echo "示例:"
    echo "  ./dev-agent.sh -p \"你好，请介绍一下自己\""
    exit 1
  fi
fi

exec "$NODE_BIN" "$SCRIPT_DIR/dist/cli.js" "$@"
