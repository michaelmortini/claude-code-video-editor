# Claude Code Video Editor

Usa [Claude Code](https://claude.com/claude-code) come montatore per i tuoi video YouTube. Metti il girato in una cartella: Claude lo trascrive, propone i tagli, crea i B-roll e prepara i file finali. Tu approvi ogni decisione importante.

L'unico servizio a pagamento è Claude. Tutti gli altri strumenti sono gratuiti e girano sul tuo computer, senza altre chiavi API.

> Progetto indipendente, non affiliato ad Anthropic. Le istruzioni e le regole sono in italiano.

**Stato delle prove:** il flusso è stato provato su Mac con Apple Silicon, con clip brevi. Altri sistemi, video lunghi e l'import in DaVinci Resolve non sono ancora stati provati.

## Cosa ottieni

Per ogni video, in `videos/<nome-video>/edit/`:

| File | Contenuto |
|---|---|
| `<nome-video>-v1.mp4`, `-v2.mp4`... | Versioni renderizzate, numerate |
| `<nome-video>-final.mp4` | Video finale, pronto da caricare: è la versione approvata, rinominata senza crearne una copia |
| `sottotitoli.srt` | Sottotitoli da caricare a parte |
| `pubblicazione.md` | Titoli, descrizione, capitoli e crediti |
| `timeline.fcpxml` | Timeline da rifinire in DaVinci Resolve |
| `edl.json` | Elenco dei tagli e delle grafiche |
| `project.md` | Memoria delle decisioni sul video |

## Come funziona

```text
Girato → Trascrizione locale → Piano di tagli → Primo taglio → B-roll → Sottotitoli → Export
                                     ↑               ↑            ↑
                                  approvi         approvi      approvi
```

Claude non guarda il video in movimento: ragiona sulla trascrizione, sulla forma d'onda e su singoli fotogrammi. Per questo rende meglio sui video parlati.

## Installazione rapida su Mac

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

Linux, Windows, requisiti e soluzione dei problemi sono in [INSTALLAZIONE.md](INSTALLAZIONE.md).

## Monta un video

**1. Imposta lo stile del canale.** Al primo montaggio Claude ti chiede tipo di video, ritmo, colori e sottotitoli, poi salva le risposte. Puoi anche compilare prima i file indicati in [Personalizzare lo stile](#personalizzare-lo-stile).

**2. Crea la cartella del video.** Il comando usa la data di oggi, nel formato `videos/AAAA-MM-titolo/raw`:

```bash
python3 tools/nuovo_video.py "Titolo del video"
```

**3. Copia il girato nella cartella indicata.** Poi apri Claude Code nella cartella del repository e incolla il messaggio stampato dal comando.

**4. Scegli gli output.** Prima del piano dei tagli Claude elenca tutto ciò che creerà, come in [Cosa ottieni](#cosa-ottieni). Puoi saltare sottotitoli, B-roll e grafiche, timeline per Resolve e `pubblicazione.md`.

**5. Approva nei tre momenti in cui Claude si ferma:** piano dei tagli, primo taglio ed elenco dei B-roll.

**6. Chiudi il video:**

```text
Il montaggio è approvato. Esegui il controllo qualità, esporta per YouTube e crea gli altri output scelti.
Proponi anche nuove regole per lessons.md.
```

Guarda sempre il video intero prima di pubblicarlo.

## Personalizzare lo stile

| Cosa | Dove |
|---|---|
| Conversione HDR e gradazione del video | `STYLE-GUIDE.md` |
| Modalità, lunghezza e stile dei sottotitoli | `STYLE-GUIDE.md` |
| Colori e font delle grafiche | `motion/src/kit/theme.ts` |
| Correzioni a nomi e termini | `glossario.txt` |

Tipo di video e formato sono in `CLAUDE.md`. Per un solo video, basta chiederlo a Claude: ad esempio "per questo video usa colori più caldi".

## Rifinire in DaVinci Resolve

In Resolve scegli **File > Import > Timeline** e seleziona `edit/timeline.fcpxml`, poi importa a parte `sottotitoli.srt`. La timeline punta ai file originali, quindi crea il file sul computer in cui lo usi e non spostare le cartelle.

Basta la versione gratuita, ma le funzioni AI di Resolve richiedono Studio. Color grading, conversione HDR, dissolvenze audio e normalizzazione del volume non passano nella timeline.

## Com'è fatto il repository

```text
.
├── CLAUDE.md               # regole del canale e istruzioni per Claude
├── STYLE-GUIDE.md          # ritmo, tono, colori e font
├── lessons.md              # errori da non ripetere, cresce a ogni video
├── glossario.txt           # correzioni a nomi e termini nei sottotitoli
├── INSTALLAZIONE.md        # installazione su ogni sistema
├── RIMOZIONE.md            # come disinstallare tutto
├── brand/                  # logo, font e musica del canale
├── motion/                 # progetto Remotion con il kit di B-roll
├── scripts/
│   ├── setup.sh            # installazione automatica
│   └── rimuovi.sh          # rimozione automatica
├── tools/
│   ├── nuovo_video.py      # crea la cartella di un nuovo video
│   ├── crea_sottotitoli.py # crea i sottotitoli a frasi naturali
│   ├── edl_to_fcpxml.py    # crea la timeline per Resolve
│   └── freecut-local.patch # correzioni a freecut
└── videos/                 # i tuoi video, esclusi da Git
```

## Strumenti usati

| Strumento | A cosa serve |
|---|---|
| Claude Code | Regia e decisioni di montaggio |
| [freecut](https://github.com/Moh4696/freecut) | Tagli, composizione e render |
| mlx-whisper o faster-whisper | Trascrizione locale |
| FFmpeg | Elaborazione di audio e video |
| [Remotion](https://www.remotion.dev) | B-roll e grafiche |
| DaVinci Resolve Free | Ritocchi manuali, facoltativo |

`tools/freecut-local.patch` corregge in freecut l'esattezza dei fotogrammi di ogni taglio, il frame rate e i video verticali.

## Privacy

Girato, audio e trascrizione vengono elaborati in locale, ma **ciò che Claude legge viene inviato ad Anthropic**: trascrizioni, immagini estratte dal video e testo delle conversazioni. Il file video completo non viene caricato. I video sono esclusi da Git tramite `.gitignore`.

## Limiti

- **Decisioni finali:** Claude non sente la voce e non vede il movimento, quindi ritmo e naturalezza vanno controllati da te.
- **Riempitivi:** Whisper tende a toglierli dal testo. Claude li cerca anche con forma d'onda e pause, ma alcuni possono sfuggire.
- **Più persone che parlano:** il backend gratuito gestisce un solo parlante.
- **Risoluzione:** l'export è in 1080p, anche partendo da 4K.
- **B-roll:** Remotion crea grafiche, non riprese realistiche.
- **Consumo:** analizzare immagini consuma molto più del testo.
- **freecut:** è un fork piccolo, per questo l'installazione usa una versione fissa.

## Licenza

Il codice di questo repository è sotto licenza [MIT](LICENSE). I componenti di terze parti hanno le proprie condizioni, riportate in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). In particolare, **Remotion richiede una licenza a pagamento per le aziende con più di 3 dipendenti**.

## Rimozione

Questo comando rimuove ciò che il progetto ha installato e conserva video, timeline e file creati da te. Prima chiede conferma; i dettagli sono in [RIMOZIONE.md](RIMOZIONE.md).

```bash
bash scripts/rimuovi.sh
```
