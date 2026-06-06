/* theory.js — note names, MIDI helpers, chord definitions (English notation) */
(function (global) {
  "use strict";

  // Pitch class names (English notation: C D E F G A B). Prefer sharps.
  const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // The 7 natural note letters used for staff reading.
  const NATURAL_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

  // Chord types: name + label shown to the user + interval pattern in semitones
  // from the root. The label is what the user must recognize.
  // `symbol` is the suffix appended to the root name to form the full chord
  // name (e.g. root "E" + symbol "9" -> "E9"; a major triad has no suffix).
  const CHORD_TYPES = [
    { id: "maj",    label: "Major",          symbol: "",     intervals: [0, 4, 7] },
    { id: "min",    label: "Minor",          symbol: "m",    intervals: [0, 3, 7] },
    { id: "7",      label: "Dominant 7th",   symbol: "7",    intervals: [0, 4, 7, 10] },
    { id: "maj7",   label: "Major 7th (maj7)", symbol: "maj7", intervals: [0, 4, 7, 11] },
    { id: "min7",   label: "Minor 7th",      symbol: "m7",   intervals: [0, 3, 7, 10] },
    { id: "9",      label: "9th",            symbol: "9",    intervals: [0, 4, 7, 10, 14] },
    { id: "11",     label: "11th",           symbol: "11",   intervals: [0, 4, 7, 10, 14, 17] },
    { id: "13",     label: "13th",           symbol: "13",   intervals: [0, 4, 7, 10, 14, 21] },
    { id: "add9",   label: "Add9",           symbol: "add9", intervals: [0, 4, 7, 14] },
    { id: "sus4",   label: "Sus4",           symbol: "sus4", intervals: [0, 5, 7] },
    { id: "sus2",   label: "Sus2",           symbol: "sus2", intervals: [0, 2, 7] },
    { id: "dim",    label: "Diminished",     symbol: "dim",  intervals: [0, 3, 6] },
    { id: "aug",    label: "Augmented",      symbol: "aug",  intervals: [0, 4, 8] },
  ];

  function randomInt(maxExclusive) {
    return Math.floor(Math.random() * maxExclusive);
  }

  function pick(array) {
    return array[randomInt(array.length)];
  }

  // Build the MIDI notes of a chord given a root MIDI note and an interval list.
  function buildChord(rootMidi, intervals) {
    return intervals.map(function (semi) {
      return rootMidi + semi;
    });
  }

  // Pitch class name (with sharp) for a MIDI note.
  function midiToName(midi) {
    return PITCH_NAMES[((midi % 12) + 12) % 12];
  }

  // Full chord name, e.g. rootMidi=E + type "9" -> "E9", maj triad on C -> "C".
  function chordName(rootMidi, type) {
    return midiToName(rootMidi) + type.symbol;
  }

  global.DiapasonTheory = {
    PITCH_NAMES: PITCH_NAMES,
    NATURAL_LETTERS: NATURAL_LETTERS,
    CHORD_TYPES: CHORD_TYPES,
    randomInt: randomInt,
    pick: pick,
    buildChord: buildChord,
    midiToName: midiToName,
    chordName: chordName,
  };
})(window);
