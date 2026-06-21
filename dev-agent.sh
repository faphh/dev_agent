#!/bin/bash
# Dev Agent CLI wrapper script
# Usage: dev-agent [options]

# Get the real path of this script (following symlinks)
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
NODE_BIN="/Users/jack/.nvm/versions/node/v22.22.2/bin/node"

# ============================================================
# 清除可能冲突的环境变量
# ============================================================
unset ANTHROPIC_API_KEY

# ============================================================
# 加载环境配置 (从 .env 文件)
# ============================================================
if [ -f "$SCRIPT_DIR/.env" ]; then
  # 导出 .env 文件中的所有变量
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

exec "$NODE_BIN" "$SCRIPT_DIR/dist/cli.js" "$@"
