#!/usr/bin/env bash
# Build a PDF for every chapter markdown file in ../src
# Usage: bash build-all.sh [glob]   e.g. bash build-all.sh "01-*"
set -euo pipefail
cd "$(dirname "$0")"
SRC="../src"
OUT="../pdf"
mkdir -p "$OUT"
PATTERN="${1:-*.md}"
shopt -s nullglob
for f in $SRC/$PATTERN; do
  base="$(basename "${f%.md}")"
  # Derive a part label from the first H1 kicker if present, else filename
  echo "▶ Building $base ..."
  node build.mjs "$f" "$OUT/$base.pdf" "The n8n Automation Textbook" "$base" || echo "  ✖ failed: $base"
done
echo "Done. PDFs in $OUT"
