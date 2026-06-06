# Diapason
Diapason è una applicazione per studiare musica.

# Note tecniche
L'applicazione è sviluppata in HTML + CSS + Javascript "vanilla", senza l'utilizzo di framework come React, insomma senza l'utilizzo di Node. Deve essere possibile copiare il contenuto della cartella dell'applicazione sulla cartella web di Apache per farlo funzionare.

L'applicazione è in lingua INGLESE, le note sono indicate con notazione anglosassone (CDEFGAB).

L'interfaccia è **responsive** e deve funzionare sia su **desktop** che su **mobile**.

L'audio è generato con la **Web Audio API** (sintesi con oscillatori, onda triangolare e inviluppo morbido). Per requisito dei browser il contesto audio parte solo dopo la prima interazione dell'utente: il primo suono si sente quindi al primo click.

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

### Modulo per riconoscere le note sul pentagramma (Staff Reading)

Viene chiesto che tipo di pentagramma si desidera usare:
- Chiave di SOL (treble)
- Chiave di FA (bass)
- Entrambe (both)

Quando si sceglie **Entrambe**, viene mostrato un **rigo doppio (grand staff)** con **tutte e due le chiavi** (SOL sopra, FA sotto) unite da una graffa a sinistra; la nota viene collocata sulla chiave corretta e, ad ogni round, la chiave usata è scelta a caso. Il DO centrale appartiene allo spazio tra i due righi (taglio addizionale).

Viene mostrata sul pentagramma una nota (con eventuali tagli addizionali). Viene chiesto all'utente di che nota si tratta; si risponde scegliendo la lettera (C–B). Per la lettura si usano solo note naturali (senza alterazioni).

In caso positivo si dice che è corretta, nel caso errato si dice all'utente la risposta corretta. È presente un contatore di risposte corrette/errate.

Comportamento specifico:
- **Nessun autoplay**: la nota NON viene suonata automaticamente; per ascoltarla serve premere **▶ Play note** (oppure la **barra spaziatrice**).
- Il pulsante Play resta sempre attivo: si può ri-suonare la nota anche dopo aver risposto.
- **Input da tastiera fisica**: premendo i tasti **C D E F G A B** si risponde direttamente; **Spazio** ri-suona la nota, **Invio** passa alla nota successiva. La tastiera è attiva solo quando il modulo è a schermo e i tasti vengono ignorati dopo che si è già risposto.
- Il pulsante **Change clef** riporta alla scelta della chiave.
- Il pulsante **↺ Reset score** azzera il contatore di risposte corrette/errate.
