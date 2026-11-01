#!/usr/bin/env bash
# Removes what this project installed, keeping videos and personal files.
# Usage: bash scripts/rimuovi.sh [--prova] [--si] [--mantieni-programmi]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HF="${HF_HOME:-$HOME/.cache/huggingface}"
KEEP=(CLAUDE.md STYLE-GUIDE.md lessons.md glossario.txt motion/src/kit/theme.ts)
WHISPER_MODELS=(models--mlx-community--whisper-large-v3-turbo models--Systran--faster-whisper-large-v3)

DRY=1
PROVA=0
SI=0
PROGRAMMI=1
KEPT_FILES=""

# No single quotes in here: it is wrapped in them to run from another account.
BREW_SCRIPT='
brew=__BREW__
installed=""
for f in ffmpeg-full uv; do
  if "$brew" list --formula "$f" >/dev/null 2>&1; then installed="$installed $f"; fi
done
if [ -z "$installed" ]; then echo "FFmpeg e uv non sono installati con Homebrew."; exit 0; fi
deps=$("$brew" deps --formula $installed 2>/dev/null | sort -u)
"$brew" uninstall $installed
orphans=$("$brew" autoremove --dry-run 2>/dev/null | grep -Ev "^==>|^$" || true)
remove=""
for f in $orphans; do
  if printf "%s\n" "$deps" | grep -qx "$f"; then remove="$remove $f"; fi
done
if [ -n "$remove" ]; then "$brew" uninstall $remove; fi
'

remove() {
  [ -e "$1" ] || [ -L "$1" ] || return 0
  if [ "$DRY" -eq 1 ]; then echo "  $1"; else rm -rf "$1"; fi
}

remove_install() {
  remove "$HOME/.claude/skills/freecut"
  if [ -f "$HOME/tools/freecut/helpers/render.py" ]; then
    remove "$HOME/tools/freecut"
  fi
  [ "$DRY" -eq 1 ] || rmdir "$HOME/tools" 2>/dev/null || true
  remove "$HOME/.npm/_npx"
}

remove_whisper_models() {
  local others
  others="$(find "$HF/hub" -maxdepth 1 -name 'models--*' 2>/dev/null | grep -Ev "$(IFS='|'; echo "${WHISPER_MODELS[*]}")" || true)"
  if [ -z "$others" ]; then
    remove "$HF"
    return
  fi
  local model link
  for model in "${WHISPER_MODELS[@]}"; do
    [ -d "$HF/hub/$model" ] || continue
    while IFS= read -r link; do
      remove "$HF/hub/blobs/$(basename "$(readlink "$link")")"
    done < <(find "$HF/hub/$model" -type l)
    remove "$HF/hub/$model"
  done
}

remove_uv_data() {
  remove "$HOME/.local/share/uv"
  remove "$HOME/.cache/uv"
  if ! command -v brew >/dev/null; then
    remove "$HOME/.local/bin/uv"
    remove "$HOME/.local/bin/uvx"
  fi
}

clean_shell_config() {
  local file="$HOME/.zshrc" tmp
  [ -f "$file" ] && grep -q '^export PATH=.*ffmpeg-full' "$file" || return 0
  if [ "$DRY" -eq 1 ]; then
    echo "  la riga di FFmpeg in $file"
    return
  fi
  tmp="$(mktemp)"
  grep -v '^export PATH=.*ffmpeg-full' "$file" >"$tmp" || true
  cat "$tmp" >"$file"
  rm -f "$tmp"
}

remove_programs() {
  command -v brew >/dev/null || {
    [ "$DRY" -eq 0 ] || echo "  Homebrew non trovato: FFmpeg va rimosso a mano (vedi RIMOZIONE.md)"
    return 0
  }
  if [ "$DRY" -eq 1 ]; then
    echo "  ffmpeg-full, uv e le dipendenze di Homebrew rimaste inutilizzate"
    return
  fi

  local brew cellar owner script status=0
  brew="$(command -v brew)"
  cellar="$("$brew" --prefix)/Cellar"
  script="${BREW_SCRIPT//__BREW__/$brew}"
  if [ -w "$cellar" ]; then
    /bin/bash -c "$script" || status=$?
  else
    owner="$(stat -f %Su "$cellar" 2>/dev/null || stat -c %U "$cellar")"
    echo "Homebrew appartiene all'account $owner: inserisci la password di quell'account."
    su - "$owner" -c "/bin/bash -c '$script'" || status=$?
  fi
  if [ "$status" -ne 0 ]; then
    echo "Non sono riuscito a rimuovere i programmi di Homebrew: segui il passaggio relativo in RIMOZIONE.md."
  fi
}

is_kept() {
  local path="$1" kept
  for kept in "${KEEP[@]}"; do
    [ "$path" = "$kept" ] && return 0
  done
  case "$path" in videos/* | brand/*) return 0 ;; esac
  return 1
}

remove_project() {
  remove "$ROOT/motion/node_modules"
  remove "$ROOT/motion/.agents"
  remove "$ROOT/motion/.claude"
  remove "$ROOT/motion/skills-lock.json"

  if [ ! -d "$ROOT/.git" ] || ! command -v git >/dev/null; then
    [ "$DRY" -eq 0 ] || echo "  (senza Git non so distinguere i tuoi file: gli altri file del progetto restano)"
    return 0
  fi

  # Files changed from the published version are the user's, whether committed or not.
  local reference path
  reference="$(git -C "$ROOT" rev-parse --abbrev-ref '@{upstream}' 2>/dev/null || echo HEAD)"
  KEPT_FILES=""
  while IFS= read -r -d '' path; do
    if is_kept "$path"; then
      continue
    elif git -C "$ROOT" diff --quiet "$reference" -- "$path" 2>/dev/null; then
      remove "$ROOT/$path"
    else
      KEPT_FILES="$KEPT_FILES\n  $path"
    fi
  done < <(git -C "$ROOT" ls-files -z)

  # .git holds the only copy of commits that were never pushed.
  if [ "$reference" != "HEAD" ] && [ -z "$(git -C "$ROOT" log --branches --not --remotes --oneline)" ]; then
    remove "$ROOT/.git"
  else
    KEPT_FILES="$KEPT_FILES\n  .git (contiene commit non pubblicati)"
  fi

  if [ "$DRY" -eq 0 ]; then
    find "$ROOT/motion" "$ROOT/scripts" "$ROOT/tools" -depth -type d -empty -delete 2>/dev/null || true
  fi
}

remove_all() {
  remove_install
  remove_whisper_models
  remove_project
  if [ "$PROGRAMMI" -eq 1 ]; then
    remove_uv_data
    clean_shell_config
    remove_programs
  fi
}

main() {
  local arg
  for arg in "$@"; do
    case "$arg" in
      --prova) PROVA=1 ;;
      --si) SI=1 ;;
      --mantieni-programmi) PROGRAMMI=0 ;;
      *)
        echo "Uso: bash scripts/rimuovi.sh [--prova] [--si] [--mantieni-programmi]"
        exit 1
        ;;
    esac
  done

  echo "Verrà rimosso:"
  remove_all
  echo
  echo "Resta dov'è, in $ROOT:"
  echo "  videos/ e brand/, con video, timeline e file creati da te"
  echo "  ${KEEP[*]}"
  echo "  motion/out/ e tutti i file che hai aggiunto o modificato"
  [ -z "$KEPT_FILES" ] || printf '%b\n' "  In particolare:$KEPT_FILES"
  if [ "$PROGRAMMI" -eq 1 ]; then
    echo
    echo "FFmpeg e uv vengono rimossi anche se li usi per altro. Per tenerli: --mantieni-programmi"
    echo "Git, Node e Homebrew restano installati."
  fi
  echo

  [ "$PROVA" -eq 0 ] || { echo "Prova: non è stato rimosso nulla."; return 0; }

  if [ "$SI" -eq 0 ]; then
    if [ ! -t 0 ]; then
      echo "Nessuna conferma possibile: rilancia con --si."
      exit 1
    fi
    local answer
    read -r -p "La rimozione è definitiva. Confermi? [s/N] " answer
    case "$answer" in
      s | S | si | SI | Si | sì | Sì) ;;
      *)
        echo "Annullato: non è stato rimosso nulla."
        return 0
        ;;
    esac
  fi

  DRY=0
  remove_all
  echo
  echo "Rimozione completata. Apri un nuovo terminale."
}

# Wrapped in main so bash has read everything before the script deletes itself.
main "$@"
exit 0
