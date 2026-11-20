#!/bin/sh
# Pane: run gh-dash through the login shell so PATH and the gh extension resolve.
if ! command -v gh >/dev/null 2>&1; then
  printf 'gh-dash needs the GitHub CLI: https://cli.github.com\n\nPress Enter to close.'
  read -r _
  exit 1
fi
exec "${SHELL:-/bin/sh}" -lic "gh dash"
