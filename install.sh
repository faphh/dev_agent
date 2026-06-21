#!/bin/bash
# Dev Agent 全局安装脚本
# 运行此脚本后，可以在任何地方使用 dev-agent 命令

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$(which node)"

echo "╔═══════════════════════════════════════╗"
echo "║     Dev Agent 全局安装程序            ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 检查 node 是否安装
if [ -z "$NODE_BIN" ]; then
    echo "❌ 错误: 未找到 node，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js: $NODE_BIN"

# 创建 ~/bin 目录 (如果不存在)
mkdir -p ~/bin

# 创建全局命令脚本
cat > ~/bin/dev-agent << EOF
#!/bin/bash
# Dev Agent 全局命令

# 获取 Dev Agent 安装目录
DEV_AGENT_DIR="$SCRIPT_DIR"

# 清除可能冲突的环境变量
unset ANTHROPIC_API_KEY

# 加载环境配置
if [ -f "\$DEV_AGENT_DIR/.env" ]; then
    set -a
    source "\$DEV_AGENT_DIR/.env"
    set +a
fi

# 判断运行模式
if [ \$# -gt 0 ]; then
    # 有参数，使用原始 CLI
    exec node "\$DEV_AGENT_DIR/dist/cli.js" "\$@"
else
    # 无参数，使用交互模式
    exec node "\$DEV_AGENT_DIR/dev-agent-interactive.js"
fi
EOF

# 添加执行权限
chmod +x ~/bin/dev-agent

echo "✅ 已创建命令: ~/bin/dev-agent"

# 检查 ~/bin 是否在 PATH 中
if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
    echo ""
    echo "⚠️  ~/bin 不在 PATH 中，正在添加..."

    # 检测 shell 类型
    SHELL_NAME="$(basename "$SHELL")"

    if [ "$SHELL_NAME" = "zsh" ]; then
        CONFIG_FILE="$HOME/.zshrc"
    elif [ "$SHELL_NAME" = "bash" ]; then
        CONFIG_FILE="$HOME/.bash_profile"
    else
        CONFIG_FILE="$HOME/.profile"
    fi

    # 添加到 PATH
    echo '' >> "$CONFIG_FILE"
    echo '# Dev Agent' >> "$CONFIG_FILE"
    echo 'export PATH="$HOME/bin:$PATH"' >> "$CONFIG_FILE"

    echo "✅ 已添加到 $CONFIG_FILE"
    echo ""
    echo "⚠️  请运行以下命令使配置生效:"
    echo "    source $CONFIG_FILE"
    echo ""
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║        ✅ 安装完成！                  ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "使用方法:"
echo "  dev-agent          # 交互模式"
echo "  dev-agent -p \"问题\" # 非交互模式"
echo ""
echo "如果命令不可用，请运行:"
echo "  source $CONFIG_FILE"
echo "  # 或者重新打开终端"
echo ""
