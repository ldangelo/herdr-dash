#!/bin/sh
# Action: open the gh-dash popup in the focused pane's folder.
# Actions get no PTY, so this only asks Herdr to open the popup pane declared in herdr-plugin.toml.
set -eu

herdr_bin="${HERDR_BIN_PATH:-herdr}"

# focused_pane_cwd from the invocation context (no jq dependency); fall back to the workspace folder.
cwd=$(printf '%s' "${HERDR_PLUGIN_CONTEXT_JSON:-}" | sed -n 's/.*"focused_pane_cwd":"\([^"]*\)".*/\1/p')
[ -n "$cwd" ] || cwd=$(printf '%s' "${HERDR_PLUGIN_CONTEXT_JSON:-}" | sed -n 's/.*"workspace_cwd":"\([^"]*\)".*/\1/p')

set -- plugin pane open --plugin ldangelo.herdr-dash --entrypoint dash --focus
[ -z "$cwd" ] || set -- "$@" --cwd "$cwd"
exec "$herdr_bin" "$@"
