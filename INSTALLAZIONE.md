# Installazione

Lo script `scripts/setup.sh` installa freecut, la trascrizione locale e Remotion. I prerequisiti del sistema vanno installati prima, a mano.

**Stato delle prove:** l'installazione completa è stata provata solo su Mac con Apple Silicon. Le istruzioni per Mac Intel, Linux e Windows non sono state provate.

## Cosa serve

- [Claude Code](https://claude.com/claude-code) con un piano Claude attivo.
- Almeno 5 GB liberi, più lo spazio per i video.
- Node 20.19 o superiore.
- Connessione a Internet per l'installazione e per scaricare il modello alla prima trascrizione.

## Mac

Serve [Homebrew](https://brew.sh). Il pacchetto `ffmpeg-full` è necessario perché quello standard non ha il filtro per i sottotitoli.

```bash
brew install git node ffmpeg-full uv
```

```bash
echo 'export PATH="$(brew --prefix ffmpeg-full)/bin:$PATH"' >> ~/.zshrc
```

Riapri il terminale, poi:

```bash
git clone https://github.com/michaelmortini/claude-code-video-editor.git
```

```bash
cd claude-code-video-editor && bash scripts/setup.sh
```

Se Homebrew appartiene a un altro utente del Mac, esegui `brew install` da quell'account.

## Linux (Debian/Ubuntu), non provato

```bash
sudo apt install git ffmpeg
```

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Installa Node da [nodejs.org](https://nodejs.org), poi clona il repository ed esegui lo script come su Mac. Lo script si ferma se FFmpeg non ha i filtri richiesti.

## Windows, non provato

In PowerShell:

```powershell
winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg astral-sh.uv
```

Lo script richiede Bash e non è previsto per Windows. Riapri PowerShell ed esegui questi passaggi dalla cartella del repository clonato:

```powershell
git clone https://github.com/Moh4696/freecut.git "$HOME\tools\freecut"
```

```powershell
git -C "$HOME\tools\freecut" checkout f1d4334
```

```powershell
git -C "$HOME\tools\freecut" apply "$PWD\tools\freecut-local.patch"
```

```powershell
uv sync --project "$HOME\tools\freecut"
```

```powershell
uv pip install --python "$HOME\tools\freecut\.venv\Scripts\python.exe" faster-whisper
```

```powershell
New-Item -ItemType Junction -Path "$HOME\.claude\skills\freecut" -Target "$HOME\tools\freecut"
```

```powershell
cd motion; npm ci; npx --yes skills add remotion-dev/skills --yes; cd ..
```

Su Windows sostituisci `.venv/bin/python` con `.venv\Scripts\python` e `python3` con `python`.

## Dopo l'installazione

**Sui sistemi senza Apple Silicon**, in `CLAUDE.md` cambia il modello da `large-v3-turbo` a `large-v3`: è il nome adatto a faster-whisper.

**Completa i file del tuo canale:**
- `CLAUDE.md`: tipo di video e formato.
- `glossario.txt`: nomi propri e termini tecnici.
- `STYLE-GUIDE.md`: ritmo, tono, colori e font.
- `motion/src/kit/theme.ts`: colori e font delle grafiche.
- `brand/`: logo, font e musica.

**Verifica Claude Code:** apri Claude Code nella cartella del repository e controlla che la skill `freecut` sia disponibile. Le skill vengono lette all'avvio, quindi riapri eventuali sessioni già attive.

## Aggiornare freecut

Lo script installa la versione `f1d4334`, l'unica provata con `tools/freecut-local.patch`. Se la aggiorni, verifica che la patch si applichi ancora e rifai una prova di montaggio.

## Problemi comuni

| Messaggio | Soluzione |
|---|---|
| `Manca: ...` | Installa il programma indicato e riapri il terminale |
| `FFmpeg non include il filtro` | Su Mac controlla `ffmpeg-full` e la riga aggiunta al PATH |
| `esiste ma non ha la patch attesa` | Sposta `~/tools/freecut` e rilancia lo script |
| `Permission denied` da Homebrew | Homebrew appartiene a un altro utente del Mac: installa da quell'account |
