# Rimozione

Come togliere tutto ciò che l'installazione ha aggiunto al sistema.

Le eliminazioni sono definitive. Prima salva i video e tutto ciò che vuoi conservare. I comandi sono per Mac e Linux; su Windows i percorsi equivalenti sono sotto `%USERPROFILE%`.

## Cosa viene installato e dove

| Elemento | Percorso | Spazio indicativo |
|---|---|---|
| freecut, il suo ambiente Python e Whisper | `~/tools/freecut` | 1,2 GB |
| Skill freecut per Claude Code | `~/.claude/skills/freecut` | Solo un collegamento |
| Modello Whisper | `~/.cache/huggingface` | 1,5 GB |
| Python scaricato da uv e cache di uv | `~/.local/share/uv`, `~/.cache/uv` | 1,3 GB |
| Cache dei comandi `npx` | `~/.npm/_npx` | Fino a qualche centinaio di MB |
| Progetto, Remotion e browser di rendering | La cartella del repository | Circa 900 MB, più i video |
| FFmpeg, uv e dipendenze | Gestiti da Homebrew o dal sistema | Variabile |

### Una nota su whisper.cpp

Il progetto trascrive con mlx-whisper o faster-whisper, dentro `~/tools/freecut/.venv`. Su Mac, `ffmpeg-full` installa però anche `whisper.cpp` (comando `whisper-cli`), `llama.cpp` e `tesseract` come proprie dipendenze. Vengono gestiti al passaggio 3.

## 1. Rimuovi i file del tuo account

```bash
rm -f ~/.claude/skills/freecut
```

```bash
rm -rf ~/tools/freecut
```

`rmdir` fallisce se in `~/tools` ci sono altri file: in quel caso la cartella resta dov'è.

```bash
rmdir ~/tools
```

Se usi uv per altri progetti, salta questo comando: elimina anche i Python e la cache che usano.

```bash
rm -rf ~/.local/share/uv ~/.cache/uv
```

Se usi altri modelli Hugging Face, salta questo comando e togli solo il modello dalla cartella `hub`.

```bash
rm -rf ~/.cache/huggingface
```

Facoltativo: la cache di `npx` può contenere pacchetti di altri progetti, ma viene ricreata quando serve.

```bash
rm -rf ~/.npm/_npx
```

## 2. Togli FFmpeg dal percorso del terminale

Solo se hai aggiunto la riga su Mac.

```bash
sed -i '' '/ffmpeg-full/d' ~/.zshrc
```

## 3. Rimuovi i programmi

Salta i programmi che usi anche per altro. Non rimuovere Git, Node o Homebrew se c'erano già prima.

**Mac**

```bash
brew uninstall ffmpeg-full uv
```

Guarda quali dipendenze inutilizzate verrebbero rimosse:

```bash
brew autoremove --dry-run
```

`autoremove` include tutte le dipendenze orfane del Mac, anche quelle non legate a questo progetto. Se l'elenco va bene:

```bash
brew autoremove
```

Se Homebrew appartiene a un altro utente del Mac, esegui questi comandi da quell'account.

**Linux (Debian/Ubuntu)**

```bash
sudo apt remove ffmpeg
```

```bash
rm -f ~/.local/bin/uv ~/.local/bin/uvx
```

**Windows (PowerShell)**

```powershell
winget uninstall Gyan.FFmpeg
```

```powershell
winget uninstall astral-sh.uv
```

## 4. Rimuovi il progetto

**Questo elimina anche i video, le regole e le grafiche.** Spostali altrove se vuoi conservarli. Sostituisci il percorso con quello del tuo repository:

```bash
rm -rf "/percorso/del/repository"
```

## 5. Verifica

Apri un nuovo terminale. Questi comandi non devono trovare nulla:

```bash
command -v ffmpeg uv whisper-cli
```

```bash
ls -d ~/tools/freecut ~/.claude/skills/freecut
```

`whisper-cli` può restare solo se un altro pacchetto ne ha bisogno.

## Cosa non viene installato

Nessun servizio in background e nessuna chiave API. DaVinci Resolve è facoltativo e si disinstalla come una normale applicazione.
