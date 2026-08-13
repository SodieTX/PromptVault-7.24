#!/usr/bin/env bash
# PV native host installer — macOS / Linux (per-user).
# Usage:  ./pv/install-mac-linux.sh          (install)
#         ./pv/install-mac-linux.sh --uninstall
set -euo pipefail

HOST_NAME="com.sodietx.pv"
EXT_ID="ofcdjhohhhogaeenjlpflakpjmkbkach"   # stable — derived from the pinned key in manifest.json
PV_DIR="$HOME/.pv/host"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$(uname -s)" in
  Darwin) TARGETS=("$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts") ;;
  *)      TARGETS=("$HOME/.config/google-chrome/NativeMessagingHosts" "$HOME/.config/chromium/NativeMessagingHosts") ;;
esac

if [[ "${1:-}" == "--uninstall" ]]; then
  for t in "${TARGETS[@]}"; do rm -f "$t/$HOST_NAME.json"; done
  rm -rf "$PV_DIR"
  echo "PV host uninstalled."
  exit 0
fi

command -v node >/dev/null || { echo "Node.js not found — install the LTS from https://nodejs.org first."; exit 1; }

mkdir -p "$PV_DIR"
cp "$SCRIPT_DIR/host.mjs" "$PV_DIR/host.mjs"

RUNNER="$PV_DIR/pv-host.sh"
printf '#!/usr/bin/env bash\nexec "%s" "%s" "$@"\n' "$(command -v node)" "$PV_DIR/host.mjs" > "$RUNNER"
chmod +x "$RUNNER"

for t in "${TARGETS[@]}"; do
  mkdir -p "$t"
  cat > "$t/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Prompt Vault PV bridge — lets local MCP agents read/add vault items",
  "path": "$RUNNER",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
EOF
done

echo "PV host installed for Chrome (extension $EXT_ID)."
echo "Restart Chrome, then connect an agent, e.g.:"
echo "  claude mcp add pv -- node \"$SCRIPT_DIR/pv-mcp.mjs\""
