#!/bin/bash
# Dev Agent CLI wrapper script
# Usage: dev-agent [options]

# Get the real path of this script (following symlinks)
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
NODE_BIN="/Users/jack/.nvm/versions/node/v22.22.2/bin/node"

exec "$NODE_BIN" "$SCRIPT_DIR/dist/cli.js" "$@"
