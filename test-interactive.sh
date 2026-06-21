#!/bin/bash
# 测试交互模式
# 这个脚本会启动 Dev Agent 并等待用户输入

echo "=========================================="
echo "  Dev Agent 交互模式测试"
echo "=========================================="
echo ""
echo "正在启动 Dev Agent..."
echo "启动后，你可以直接输入消息与 AI 对话。"
echo "按 Ctrl+C 退出。"
echo ""

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 启动 Dev Agent
"$SCRIPT_DIR/dev-agent.sh"
