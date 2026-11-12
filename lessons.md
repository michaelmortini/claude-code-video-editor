# Lezioni

Regole generali ricavate dalle correzioni sui video. Claude le legge prima di ogni montaggio.

## Registrazione
- Tieni fermo il telefono mentre parli: spostarlo a metà frase obbliga a coprire il punto con un B-roll.
- Se devi spostarti, fermati prima di farlo e riprendi la frase dall'inizio.

## Montaggio
- Nei B-roll brevi, sotto i 3 secondi, il titolo deve essere già visibile dal primo fotogramma.
- Controlla i fotogrammi attorno a ogni taglio prima di presentare il montaggio, non solo l'audio.
- Tagli serrati: pause naturali fino a 0,3 s, ai tagli circa 0,2 s (0,6/0,3 s erano ancora troppo larghi). Le pause lunghe in cui si cercano le parole vanno tolte, non accorciate.
- Togli sempre respiri, schiocchi e rumori tra le frasi, anche dentro un blocco continuo: ogni tratto senza parole è da scartare.
- I bordi di ogni taglio vanno sulla voce reale (70 ms prima del primo istante sopra -38 dB, 100 ms dopo l'ultimo sopra -40 dB), non sui confini delle frasi rilevate: code e attacchi quasi muti sommati ai margini fanno buchi da mezzo secondo a ogni giunzione.
- Anche dentro le frasi, i tratti quasi muti (sotto -36 dB, respiri leggeri e rumore di stanza) più lunghi di 0,3 s si accorciano a 0,2 s.
- Prima di presentare una versione, rileggi per intero la trascrizione del montato, riga per riga. I controlli automatici non vedono le false partenze con parole diverse ("e lì rischia con… e lì conosce"), le ripetizioni fatte di parole brevi ("e la storia, e la storia") né le parole tolte per sbaglio ("sta così male che [tenta] di togliersi la vita").
- Ripeti il controllo delle ripetizioni dopo ogni stretta del ritmo: con le pause più corte la trascrizione fa emergere balbuzie che prima restavano nascoste ("di cominciare, di cominciare").
- Whisper non trascrive quasi mai "ehm" e "mmm": cerca nell'audio i tratti con voce non coperti da parole, ritrascrivili da soli e taglia quelli che risultano vuoti, "Grazie." (allucinazione tipica sui rumori) o congiunzioni allungate oltre 0,45 s.
- Per scegliere le take, dividi l'audio in frasi sulle pause e trascrivi ogni frase da sola. Whisper sull'intero file fonde le take ripetute in una sola frase: le ripetizioni spariscono dal testo ma restano nel video.
- Una frase che dura molto più di quanto servirebbe per le parole trascritte nasconde quasi sempre una take ripetuta: ritrascrivila da sola prima di decidere.
- Dopo il montaggio, ritrascrivi il montato e cerca le stesse parole ripetute a breve distanza: è il controllo che trova le ripetizioni sfuggite.
