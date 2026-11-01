# Guida di stile

Valori provvisori: sostituiscili con quelli del canale. Claude li applica a ogni montaggio, salvo diversa indicazione per un singolo video.

## Ritmo e tono

- Ritmo: [da completare]
- Tono: [da completare]

## Colore del video

- Conversione HDR: `hable`. Vale solo per il girato HDR, come quello degli iPhone. Altri valori: `mobius` (più chiaro), `reinhard`.
- Gradazione: `none`. Altri valori: `subtle`, `neutral_punch`, `warm_cinematic`, `auto` (corregge ogni taglio in base all'immagine), oppure un filtro FFmpeg, ad esempio `eq=contrast=1.05:saturation=1.1`.

## Sottotitoli

- Modalità: file separato da caricare su YouTube. L'alternativa è `bruciati nel video`.
- Lunghezza massima della riga: 42 caratteri.
- Stile, solo se bruciati: `FontName=Helvetica,FontSize=12,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0,Alignment=2,MarginV=25`

I colori di questo stile sono nel formato `&H00BBGGRR`: blu, verde e rosso, in quest'ordine.

## Grafiche e B-roll

I valori effettivi sono in `motion/src/kit/theme.ts`.

- Colori: sfondo #0F1115, testo #F5F6F7, accento #FF5A00
- Font: sistema (sans-serif), da sostituire con il font del canale
- Regole: un elemento nuovo alla volta, testo breve, leggibile a velocità normale
