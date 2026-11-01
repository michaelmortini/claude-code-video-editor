# Rimozione

## Con un solo comando

Dalla cartella del repository, su Mac o Linux:

```bash
bash scripts/rimuovi.sh
```

Lo script mostra l'elenco completo di ciò che rimuoverà e chiede conferma. La rimozione è definitiva.

| Opzione | Effetto |
|---|---|
| `--prova` | Mostra l'elenco senza rimuovere nulla |
| `--mantieni-programmi` | Non tocca FFmpeg, uv e i loro dati, utile se li usi per altro |
| `--si` | Non chiede conferma |

Se Homebrew appartiene a un altro utente del Mac, lo script chiede la password di quell'account. Se non riesce a rimuovere i programmi, completa comunque il resto e rimanda al passaggio manuale qui sotto.

### Cosa resta

- **`videos/`:** girato, video finali, timeline, sottotitoli e tutti gli altri file di ogni video.
- **`brand/`:** logo, font e musica.
- **Le tue impostazioni:** `CLAUDE.md`, `STYLE-GUIDE.md`, `lessons.md`, `glossario.txt` e `motion/src/kit/theme.ts`.
- **`motion/out/`:** le grafiche renderizzate a parte.
- **Ogni altro file che hai aggiunto al progetto o modificato** rispetto alla versione pubblicata.
- **`.git`,** se contiene commit non pubblicati.
- **Git, Node e Homebrew.**

### Cosa viene rimosso

| Elemento | Percorso | Spazio indicativo |
|---|---|---|
| freecut, il suo ambiente Python e Whisper | `~/tools/freecut` | 1,2 GB |
| Skill freecut per Claude Code | `~/.claude/skills/freecut` | Solo un collegamento |
| Modello Whisper | `~/.cache/huggingface` | 1,5 GB |
| Cache dei comandi `npx` | `~/.npm/_npx` | Fino a qualche centinaio di MB |
| Remotion, browser di rendering e skill | `motion/node_modules`, `motion/.agents`, `motion/.claude` | Circa 900 MB |
| File del progetto non modificati | La cartella del repository | Pochi MB |
| Python scaricato da uv e cache di uv | `~/.local/share/uv`, `~/.cache/uv` | 1,3 GB |
| Riga di FFmpeg nel percorso del terminale | `~/.zshrc` | Una riga |
| FFmpeg, uv e le dipendenze rimaste inutilizzate | Gestiti da Homebrew | Variabile |

Le ultime tre righe vengono saltate con `--mantieni-programmi`. Se in `~/.cache/huggingface` ci sono altri modelli, lo script toglie solo quello di questo progetto. Su Mac, `ffmpeg-full` porta con sé anche `whisper.cpp`, `llama.cpp` e `tesseract`, rimossi insieme alle altre dipendenze inutilizzate.

## A mano

Serve su Windows, oppure se lo script non riesce a rimuovere i programmi.

**Mac**

Se Homebrew appartiene a un altro utente, esegui i comandi da quell'account.

```bash
brew uninstall ffmpeg-full uv
```

Guarda quali dipendenze inutilizzate verrebbero rimosse. L'elenco include tutte quelle orfane del Mac, anche se non legate a questo progetto:

```bash
brew autoremove --dry-run
```

Se l'elenco va bene:

```bash
brew autoremove
```

**Linux (Debian/Ubuntu)**

Lo script non rimuove i pacchetti di sistema:

```bash
sudo apt remove ffmpeg
```

**Windows (PowerShell)**

```powershell
winget uninstall Gyan.FFmpeg
```

```powershell
winget uninstall astral-sh.uv
```

```powershell
Remove-Item -Force "$HOME\.claude\skills\freecut"
```

```powershell
Remove-Item -Recurse -Force "$HOME\tools\freecut", "$HOME\.cache\huggingface"
```

Elimina poi `motion\node_modules`, `motion\.agents` e `motion\.claude` dalla cartella del repository. Se usi altri modelli Hugging Face, non eliminare `.cache\huggingface` per intero.

## Verifica

Apri un nuovo terminale. Questi comandi non devono trovare nulla:

```bash
command -v ffmpeg uv
```

```bash
ls -d ~/tools/freecut ~/.claude/skills/freecut
```
