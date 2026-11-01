#!/usr/bin/env bash
# Installs freecut with the local patch, the local Whisper backend, and Remotion.
# Prerequisites are listed in INSTALLAZIONE.md. System packages are not installed here.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FREECUT="$HOME/tools/freecut"
FREECUT_COMMIT="f1d4334"
PATCH="$ROOT/tools/freecut-local.patch"

missing=0
for tool in git ffmpeg ffprobe uv node npm python3; do
  if ! command -v "$tool" >/dev/null; then
    echo "Manca: $tool"
    missing=1
  fi
done
[ "$missing" -eq 0 ] || { echo "Installa i prerequisiti (vedi INSTALLAZIONE.md) e riprova."; exit 1; }

filters="$(ffmpeg -hide_banner -filters 2>/dev/null)"
for filter in subtitles loudnorm zscale; do
  if ! grep -q " $filter " <<<"$filters"; then
    echo "FFmpeg non include il filtro '$filter'. Su Mac serve ffmpeg-full nel PATH (vedi INSTALLAZIONE.md)."
    exit 1
  fi
done

echo "==> freecut"
if [ ! -d "$FREECUT" ]; then
  mkdir -p "$(dirname "$FREECUT")"
  git clone https://github.com/Moh4696/freecut.git "$FREECUT"
  git -C "$FREECUT" checkout --quiet "$FREECUT_COMMIT"
  git -C "$FREECUT" apply "$PATCH"
elif git -C "$FREECUT" apply --reverse --check "$PATCH" 2>/dev/null; then
  echo "Già installato, patch presente."
else
  echo "$FREECUT esiste ma non ha la patch attesa: spostalo o applica $PATCH a mano."
  exit 1
fi

echo "==> Trascrizione locale"
uv sync --project "$FREECUT" --quiet
if [ "$(uname -s)-$(uname -m)" = "Darwin-arm64" ]; then
  whisper="mlx-whisper"
  module="mlx_whisper"
else
  whisper="faster-whisper"
  module="faster_whisper"
fi
uv pip install --quiet --python "$FREECUT/.venv/bin/python" "$whisper"
"$FREECUT/.venv/bin/python" -c "import $module, librosa, PIL, numpy"

echo "==> Skill di Claude Code"
mkdir -p "$HOME/.claude/skills"
ln -sfn "$FREECUT" "$HOME/.claude/skills/freecut"

echo "==> Remotion"
cd "$ROOT/motion"
npm ci --silent
npx --yes skills add remotion-dev/skills --yes >/dev/null
npx remotion still Title out/prova.jpg >/dev/null
rm -f out/prova.jpg

echo
echo "Installazione completata."
if [ "$whisper" = "faster-whisper" ]; then
  echo "Su questo sistema cambia in CLAUDE.md il modello da large-v3-turbo a large-v3."
fi
echo "Apri Claude Code nella cartella del progetto e segui il README."
