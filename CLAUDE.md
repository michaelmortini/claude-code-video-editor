
# Canale YouTube

Tipo di video: [da completare: tutorial/vlog/...], lingua italiana, formato 16:9.

## Tagli
- Tieni l'ultima take completa, salvo diversa indicazione.
- Elimina riempitivi ("ehm", "cioè", "praticamente") solo se il taglio resta naturale.
- Non togliere pause utili a enfasi o battute.
- Mai un taglio a metà parola.

## B-roll
- Usa un B-roll solo se aiuta a capire o evita un'inquadratura statica troppo lunga.
- Ordine di preferenza: girato mio, Remotion, stock gratuito con licenza verificata.
- Per ogni clip stock registra fonte e licenza.
- Non usare generatori video AI a pagamento.

## Primo utilizzo
Se STYLE-GUIDE.md contiene ancora il segnaposto "[da completare]", prima di qualsiasi montaggio fermati e chiedi all'utente lo stile desiderato, anche se non lo ha chiesto:
1. Spiega in una frase che lo stile del canale non è ancora impostato.
2. Chiedi, mostrando i valori attuali come predefiniti: tipo di video e formato, ritmo e tono, conversione HDR e gradazione, modalità e stile dei sottotitoli, colori e font delle grafiche, nomi e termini ricorrenti.
3. Se non ha preferenze su un punto, tieni il predefinito.
4. Aggiorna CLAUDE.md, STYLE-GUIDE.md, motion/src/kit/theme.ts e glossario.txt, togliendo tutti i segnaposto così da non chiedere di nuovo.

## Processo
- Crea le cartelle dei nuovi video con python3 tools/nuovo_video.py "Titolo": il formato è videos/AAAA-MM-titolo/raw, con la data corrente.
- Leggi STYLE-GUIDE.md e lessons.md prima di ogni montaggio.
- Prima di tagliare, mostra il piano con timestamp e motivazione.
- Non modificare mai raw/.
- Numera ogni versione renderizzata e non sovrascrivere le precedenti.
- Dopo ogni modifica ai tagli, riallinea sottotitoli, B-roll ed effetti.

## Strumenti
- freecut è in ~/tools/freecut (commit f1d4334): segui il suo SKILL.md e usa il suo .venv.
- Usa solo strumenti locali, gratuiti o open source.
- Non usare servizi a pagamento e non chiedermi chiavi API.
- Trascrivi con: --backend whisper --language it. Mai un modello ".en".
- Usa Remotion (motion/) per clip brevi, mai per renderizzare l'intero video.
- Non usare CapCut e non controllare Resolve via script.
- Per ogni video completato crea sempre anche la timeline per Resolve, nella cartella edit/ insieme agli altri file finali: python3 tools/edl_to_fcpxml.py edit/edl.json -o edit/timeline.fcpxml.
- Quando installi qualcosa di nuovo sul sistema, aggiorna RIMOZIONE.md e scripts/rimuovi.sh.

## Note su freecut
- In edl.json indica sempre "fps" uguale al girato (senza, render.py usa 24). La risoluzione di uscita resta 1080p, anche per il 4K.
- I percorsi in "overlays" sono relativi a edit/ (es. animations/slot_1/render.mp4), non "edit/animations/...".
- Le chiavi di "sources" devono coincidere col nome del file sorgente, altrimenti i sottotitoli non trovano la trascrizione.
- Colore e sottotitoli seguono STYLE-GUIDE.md. In edl.json: "tonemap" è la conversione HDR, "grade" la gradazione, "subtitle_style" lo stile dei sottotitoli bruciati.
- I sottotitoli predefiniti sono 2 parole in maiuscolo: per YouTube crea invece un SRT a frasi naturali con python3 tools/crea_sottotitoli.py edit/edl.json -o edit/sottotitoli.srt --max-chars <valore di STYLE-GUIDE.md>, e rileggilo prima di consegnarlo.
- Per bruciarli nel video, indica in edl.json "subtitles": "sottotitoli.srt" (percorso relativo a edit/) e non usare --build-subtitles.
- Ogni taglio deve durare un numero intero di fotogrammi (a 25 fps, multipli di 0,04 s): altrimenti sottotitoli e grafiche si sfasano un po' a ogni taglio.
- Whisper allunga le parole sulle pause e nasconde le esitazioni: decidi i tagli incrociando la trascrizione con silencedetect e la forma d'onda.
- Modello di trascrizione: --model large-v3-turbo.
- helpers/render.py ha modifiche locali (fotogrammi esatti, campi "fps", "tonemap" e "subtitle_style", video verticali ruotati), salvate in tools/freecut-local.patch: conservale se aggiorni freecut e aggiorna la patch se le cambi.

## Glossario
Nomi propri, brand e termini tecnici sono in glossario.txt, una correzione per riga: sbagliato => corretto. Aggiungi lì ogni errore ricorrente della trascrizione.

# CLAUDE.md

Fonte: [andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills), licenza MIT.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
