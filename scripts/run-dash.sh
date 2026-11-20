#!/bin/sh
# Pane: run gh-dash through the login shell so PATH and the gh extension resolve.
# The gh check happens inside that shell: gh may only be on PATH there.
exec "${SHELL:-/bin/sh}" -lic 'command -v gh >/dev/null 2>&1 || { printf "gh-dash needs the GitHub CLI: https://cli.github.com\n\nPress Enter to close."; read -r _; exit 1; }; exec gh dash'
