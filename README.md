# Diapason

An application for learning music, built with **vanilla HTML, CSS and JavaScript** — no
frameworks, no build step, no Node. Just copy the folder into any web server's
document root (e.g. Apache's `htdocs`) and open it.

The app is in English and uses English note notation (C D E F G A B).
The interface is responsive and works on both desktop and mobile.

## Modules

### 🎹 Chord Types
A random chord is played (random root, random type). You identify the **type** of the
chord — not the key. Supported types: major, minor, dominant 7th, maj7, minor 7th,
9th, 11th, 13th, add9, sus4, sus2, diminished, augmented. Correct/wrong answers are
reported, and the right answer is shown when you miss.

### 🎼 Staff Reading
Choose a clef — treble (G), bass (F), or both. A note is shown on the staff (with
ledger lines when needed) and played. You identify the note letter. Correct/wrong
answers are reported, and the right answer is shown when you miss.

## Running

It is a fully static site. Either:

- Open `index.html` directly in a browser, **or**
- Copy the folder into a web server's document root and browse to it, e.g.
  ```sh
  cp -r diapason /var/www/html/
  ```
- For local development you can also use any static server:
  ```sh
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```

> Audio uses the Web Audio API, which starts only after the first user interaction
> (a browser requirement) — so the first sound plays once you click a button.

## Structure

```
index.html            markup and screen layout
css/styles.css        responsive styling
js/audio.js           Web Audio synth (notes & chords)
js/theory.js          note names, MIDI helpers, chord definitions
js/staff-render.js    SVG staff / clef / note rendering
js/chords.js          Chord Types module logic
js/staff.js           Staff Reading module logic
js/app.js             screen navigation and wiring
```
