#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST_DIR="/Users/asaritoshiyuki/Library/CloudStorage/GoogleDrive-asari.graphic@gmail.com/マイドライブ/hibi-kippo-app-notebooklm"

cd "$ROOT_DIR"

shopt -s nullglob
COPY_SOURCES=("AGENTS.md" docs/*.md)

if [ "${#COPY_SOURCES[@]}" -eq 0 ]; then
  echo "No files to copy. Expected AGENTS.md and docs/*.md." >&2
  exit 1
fi

echo "NotebookLM / Google Drive sync target:"
echo "  $DEST_DIR"
echo
echo "Warning:"
echo "  This script copies project documentation into a Google Drive sync folder."
echo "  Only AGENTS.md and top-level docs/*.md are allowed."
echo "  Do not use this script for src/, .env files, credentials, tokens, build output, or dependencies."
echo
echo "Files to copy:"
for source in "${COPY_SOURCES[@]}"; do
  case "$source" in
    AGENTS.md|docs/*.md)
      echo "  $source"
      ;;
    *)
      echo "Refusing unexpected copy source: $source" >&2
      exit 1
      ;;
  esac
done
echo

read -r -p "Type yes to copy these files to Google Drive: " answer
if [ "$answer" != "yes" ]; then
  echo "Cancelled. No files were copied."
  exit 0
fi

mkdir -p "$DEST_DIR"

COPIED_FILES=()
for source in "${COPY_SOURCES[@]}"; do
  destination="$DEST_DIR/$(basename "$source")"
  cp "$source" "$destination"
  COPIED_FILES+=("$destination")
done

echo
echo "Copied files:"
for copied in "${COPIED_FILES[@]}"; do
  echo "  $copied"
done

echo
echo "Checking destination for disallowed files or folders..."
DANGEROUS_ITEMS=()
while IFS= read -r item; do
  DANGEROUS_ITEMS+=("$item")
done < <(
  find "$DEST_DIR" -maxdepth 2 \( \
    -name "src" -o \
    -name ".env" -o \
    -name ".env.*" -o \
    -iname "*secret*" -o \
    -iname "*credential*" -o \
    -iname "*token*" -o \
    -name "node_modules" -o \
    -name ".next" -o \
    -name ".vercel" \
  \) -print
)

if [ "${#DANGEROUS_ITEMS[@]}" -gt 0 ]; then
  echo "Warning: disallowed items were found in the destination:" >&2
  for item in "${DANGEROUS_ITEMS[@]}"; do
    echo "  $item" >&2
  done
  exit 2
fi

echo "Done. No disallowed files or folders were found in the destination."
