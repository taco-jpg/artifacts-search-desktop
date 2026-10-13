#!/bin/sh
set -eu
APP="${DSH_APP:-/Applications/DeepSeek Harness.app}"
if [ "$#" -ne 1 ]; then echo "Usage: sh install-macos.sh /path/to/artifacts-search-desktop-VERSION.tgz" >&2; exit 1; fi
if pgrep -f "^$APP/Contents/MacOS/DeepSeek Harness$" >/dev/null; then
  echo 'Quit DeepSeek Harness first, then run this installer again.' >&2; exit 1
fi
ELECTRON_RUN_AS_NODE=1 "$APP/Contents/MacOS/DeepSeek Harness" --expose-internals "$APP/Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js" plugin --profile desktop add "$1"
