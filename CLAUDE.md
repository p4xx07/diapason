# Diapason
Diapason è una applicazione per studiare musica.

# Note tecniche
L'applicazione è sviluppata in HTML + CSS + Javascript "vanilla", senza l'utilizzo di framework come React, insomma senza l'utilizzo di Node. Deve essere possibile copiare il contenuto della cartella dell'applicazione sulla cartella web di Apache per farlo funzionare.

L'applicazione è in lingua INGLESE, le note sono indicate con notazione anglosassone (CDEFGAB).

L'interfaccia è **responsive** e deve funzionare sia su **desktop** che su **mobile**.

L'audio è generato con la **Web Audio API** tramite sintesi. È possibile scegliere il **timbro** fra **Piano**, **Organo** e **Archi** con un selettore unico nell'header: la scelta è globale e vale per tutti e tre i moduli (tutti suonano tramite `DiapasonAudio`). I timbri sono sintetizzati così:
- **Piano**: triangle + armoniche, inviluppo percussivo (attacco rapido, decadimento continuo).
- **Organo**: somma additiva di sinusoidi (1ª, 2ª, 3ª, 4ª armonica), inviluppo sostenuto e piatto.
- **Archi**: due onde a dente di sega leggermente scordate (effetto ensemble) con filtro passa-basso, attacco lento.

Per requisito dei browser il contesto audio parte solo dopo la prima interazione dell'utente: il primo suono si sente quindi al primo click.

## Struttura dei file
```
index.html            markup e layout delle schermate
css/styles.css        stile responsive (tema scuro)
js/audio.js           sintetizzatore Web Audio (note e accordi)
js/theory.js          nomi note, helper MIDI, definizioni degli accordi
js/staff-render.js    rendering SVG del pentagramma singolo e del rigo doppio
js/piano-render.js    rendering SVG della tastiera del pianoforte
js/chords.js          logica del modulo "Chord Types"
js/staff.js           logica del modulo "Staff Reading"
js/explorer.js        logica del modulo "Chord Explorer"
js/app.js             navigazione tra le schermate e wiring dei moduli
favicon.svg           favicon (diapason/tuning fork, vettoriale)
favicon-32.png        favicon raster 32x32 (fallback)
apple-touch-icon.png  icona 180x180 per iOS / home screen
```

La favicon raffigura un **diapason (tuning fork)** in tinta teal su sfondo scuro arrotondato, coerente col tema. È referenziata nell'`<head>` di `index.html` (SVG con fallback PNG + apple-touch-icon, più `theme-color`).

La pagina iniziale (home) presenta la scelta del modulo. Ogni modulo ha un pulsante "Back" per tornare alla home.

## Moduli
Prevede diversi moduli:
- Modulo per riconoscere il tipo di accordi
- Modulo per esercitarsi sulla lettura del pentagramma
- Modulo "Chord Explorer" per allenare l'orecchio

> **Anagrafica unica dei tipi di accordo**: tutti i tipi di accordo (id, etichetta, simbolo, intervalli, gradi) sono definiti in un solo punto, `DiapasonTheory.CHORD_TYPES` in `js/theory.js`. Sia il modulo di riconoscimento (Chord Types) sia il modulo di allenamento (Chord Explorer) costruiscono le proprie liste da lì. Per aggiungere/rimuovere un tipo di accordo basta modificare quell'unico array: la modifica vale automaticamente per entrambi i moduli.

> **Spelling enarmonico corretto**: oltre agli intervalli (in semitoni), ogni tipo di accordo definisce i **gradi** delle sue note (1, 3, 5, 7, 9, 11, 13). La funzione `DiapasonTheory.spellChord(rootMidi, type)` usa i gradi per assegnare a ogni nota la lettera del suo grado e poi l'alterazione corretta, secondo la teoria musicale (es. **C7 = C E G Bb**, mai C E G A#; Cm7 = C Eb G Bb; Cdim = C Eb Gb). Le fondamentali usano lo spelling convenzionale dei lead-sheet (`ROOT_NAMES`: Db, Eb, F#, Ab, Bb). Le etichette delle note sulla **tastiera del pianoforte** (in entrambi i moduli) e i nomi degli accordi seguono questo spelling.

### Modulo per i tipi di accordi (Chord Types)
Viene scelto a caso un accordo, in una tonalità casuale e di un tipo casuale.

Per tipo si intende (tipi attualmente implementati):
- maggiore (Major)
- minore (Minor)
- settima di dominante (Dominant 7th)
- maj7 (indicata anche come 7+) (Major 7th)
- minore 7 (Minor 7th)
- 9 (9th)
- 11 (11th)
- 13 (13th)
- add9
- sus4
- sus2
- diminuito (Diminished)
- aumentato (Augmented)

Viene riprodotto il suono dell'accordo e viene chiesto all'utente di riconoscere il tipo di accordo (non la tonalità). L'applicazione in caso di successo dirà che è giusto, in caso di insuccesso verrà mostrata all'utente la risposta corretta. È presente un contatore di risposte corrette/errate.

Comportamento specifico:
- **Nessun autoplay all'ingresso**: entrando nel modulo l'accordo NON viene suonato automaticamente; l'utente deve premere il pulsante **▶ Play chord** per ascoltarlo.
- Il pulsante Play resta sempre attivo: si può **ri-suonare** l'accordo in qualsiasi momento, anche dopo aver risposto (giusto o sbagliato).
- Quando viene mostrata la risposta, viene visualizzata anche la **tastiera di un pianoforte** (SVG) con le note dell'accordo evidenziate: la **fondamentale in verde**, le altre note in **blu**, con le etichette dei nomi delle note.
- Insieme alla tastiera viene mostrato il **nome completo dell'accordo** (fondamentale + tipo), ad esempio `E9`, `Cmaj7`, `Am`, `Aadd9`, con sotto l'etichetta descrittiva del tipo (es. "9th").
- Il pulsante **⟳ New chord** genera un nuovo accordo e lo **suona subito** (è un'azione esplicita dell'utente).
- Il pulsante **↺ Reset score** azzera il contatore di risposte corrette/errate.

Opzioni di pratica (pannello impostazioni nel modulo):
- **Sottoinsieme di tipi**: ogni tipo di accordo ha una checkbox per abilitarlo/disabilitarlo, così ci si può esercitare solo su un sottoinsieme. Sono presenti i pulsanti **Select all** e **Clear all**. Sia gli accordi proposti sia i pulsanti di risposta riflettono i tipi abilitati; se non è abilitato alcun tipo viene mostrato un avviso.
- **Arpeggio**: se attivo, l'accordo viene suonato una nota alla volta (arpeggiato) invece che simultaneamente. Gli attacchi sono sfalsati (ogni nota si sente distintamente) ma ogni nota continua a risuonare fino alla fine della sequenza: le note si sovrappongono e si connettono (**legato**), costruendo gradualmente l'accordo, senza effetto staccato.
- **Inversions (rivolti)**: se attivo, l'accordo viene presentato in un rivolto casuale. Il riconoscimento riguarda comunque il tipo; alla risposta, sotto il nome dell'accordo viene indicato il rivolto (es. "1st inversion") e la tastiera evidenzia la fondamentale (in verde) anche quando non è la nota più bassa.

### Modulo per riconoscere le note sul pentagramma (Staff Reading)

Viene chiesto che tipo di pentagramma si desidera usare:
- Chiave di SOL (treble)
- Chiave di FA (bass)
- Entrambe (both)

Quando si sceglie **Entrambe**, viene mostrato un **rigo doppio (grand staff)** con **tutte e due le chiavi** (SOL sopra, FA sotto) unite da una graffa a sinistra; la nota viene collocata sulla chiave corretta e, ad ogni round, la chiave usata è scelta a caso. Il DO centrale appartiene allo spazio tra i due righi (taglio addizionale).

Viene mostrata sul pentagramma una nota (con eventuali tagli addizionali). Viene chiesto all'utente di che nota si tratta; si risponde scegliendo la lettera (C–B). Per la lettura si usano solo note naturali (senza alterazioni).

Nei modi a chiave singola (SOL o FA) il range delle note si estende fino a circa **3-4 tagli addizionali** sopra e sotto il rigo, per esercitarsi anche sulle note estreme. Nel modo **Entrambe** il range resta vicino a ciascun rigo, così le note non invadono la chiave opposta del rigo doppio.

La chiave di FA è **disegnata in SVG** (testa tonda, coda arricciata e due punti) e NON usa il glifo unicode, la cui posizione dipendeva dal font e risultava disallineata su alcuni browser. È costruita in modo che la testa e i due punti circondino sempre la riga del FA (la seconda dall'alto), così "punta" correttamente al FA, indipendentemente dal font. La chiave di SOL usa invece il glifo unicode, che si rende correttamente.

I checkbox dei tipi di accordo sono disposti in una griglia (2 colonne su mobile, 3 su schermi più larghi), non a wrap inline.

In caso positivo si dice che è corretta, nel caso errato si dice all'utente la risposta corretta. È presente un contatore di risposte corrette/errate.

Comportamento specifico:
- **Nessun autoplay**: la nota NON viene suonata automaticamente; per ascoltarla serve premere **▶ Play note** (oppure la **barra spaziatrice**).
- Il pulsante Play resta sempre attivo: si può ri-suonare la nota anche dopo aver risposto.
- **Input da tastiera fisica**: premendo i tasti **C D E F G A B** si risponde direttamente; **Spazio** ri-suona la nota, **Invio** passa alla nota successiva. La tastiera è attiva solo quando il modulo è a schermo e i tasti vengono ignorati dopo che si è già risposto.
- Il pulsante **Change clef** riporta alla scelta della chiave.
- Il pulsante **↺ Reset score** azzera il contatore di risposte corrette/errate.

### Modulo Chord Explorer
Modulo di esplorazione/allenamento dell'orecchio, da usare prima del modulo di riconoscimento del tipo di accordi.

Presenta due serie di pulsanti:
- una serie di **note fondamentali** (le 12 note cromatiche);
- una serie di **tipi di accordo** (presi dall'anagrafica unica `CHORD_TYPES`).

Comportamento:
- Selezionando una **fondamentale** non viene riprodotto alcun suono: il bottone cambia colore (**riempimento teal pieno**), distinto dal blu usato per il tipo selezionato, e resta evidenziato anche dopo aver scelto un tipo. Se è già selezionato un tipo, il display dell'accordo viene aggiornato in modo silenzioso alla nuova fondamentale.
- Selezionando un **tipo di accordo** viene riprodotto l'accordo (fondamentale selezionata + tipo) e vengono mostrati il nome completo dell'accordo e la **tastiera del pianoforte** con le note evidenziate (fondamentale in verde).

Controlli aggiuntivi (barra sotto i tipi):
- **Octave − / +**: alza o abbassa l'ottava della fondamentale (entro ±2 ottave); se un accordo è selezionato viene ri-suonato alla nuova ottava.
- **Arpeggio**: toggle identico a quello del modulo di riconoscimento; se attivo l'accordo viene suonato una nota alla volta, in legato (attacchi distinti ma note che risuonano e si sovrappongono).
- **Inversion ◀ / ▶**: scorre avanti e indietro tra i rivolti dell'accordo, con wrap-around. Il numero di rivolti dipende dal numero di note (triadi 3, quadriadi 4, ecc.); l'etichetta mostra il rivolto corrente (es. "1st inversion (2/4)"). Cambiando tipo, il rivolto torna a "Root position".

Non c'è punteggio: è uno strumento libero di ascolto/esplorazione.
