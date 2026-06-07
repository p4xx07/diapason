/* explorer.js — "Chord Explorer" module: free ear-training playground.
   Pick a root note (no sound), then pick a chord type to hear the chord.
   Octave +/-, an arpeggio toggle and an inversion stepper let you explore each
   chord. The chord-type registry is shared (DiapasonTheory.CHORD_TYPES), so it
   stays in sync with the recognition module. */
(function (global) {
  "use strict";

  const T = global.DiapasonTheory;
  const Audio = global.DiapasonAudio;

  // Roots are the 12 chromatic notes starting from C3, shifted by the octave control.
  const ROOT_BASE = 48; // C3
  const MIN_SHIFT = -24; // down 2 octaves
  const MAX_SHIFT = 24;  // up 2 octaves

  const INV_NAMES = ["Root position", "1st inversion", "2nd inversion",
    "3rd inversion", "4th inversion", "5th inversion"];

  const state = {
    rootIndex: 0,    // 0..11 chromatic offset from the base C
    octaveShift: 0,  // semitone offset (multiples of 12)
    type: null,      // currently selected chord type
    inv: 0,          // current inversion index
    arpeggio: false, // play one note at a time
  };

  let dom = {};

  function rootMidi() {
    return ROOT_BASE + state.octaveShift + state.rootIndex;
  }

  function baseOctave() {
    return 3 + state.octaveShift / 12;
  }

  function init() {
    dom = {
      roots: document.getElementById("explorer-roots"),
      types: document.getElementById("explorer-types"),
      name: document.getElementById("explorer-name"),
      piano: document.getElementById("explorer-piano"),
      octave: document.getElementById("exp-octave"),
      octDown: document.getElementById("exp-oct-down"),
      octUp: document.getElementById("exp-oct-up"),
      arpeggio: document.getElementById("exp-arpeggio"),
      invPrev: document.getElementById("exp-inv-prev"),
      invNext: document.getElementById("exp-inv-next"),
      inversion: document.getElementById("exp-inversion"),
    };

    buildRootButtons();
    buildTypeButtons();

    dom.octDown.addEventListener("click", function () { shiftOctave(-12); });
    dom.octUp.addEventListener("click", function () { shiftOctave(12); });
    dom.arpeggio.addEventListener("change", function () { state.arpeggio = dom.arpeggio.checked; });
    dom.invPrev.addEventListener("click", function () { stepInversion(-1); });
    dom.invNext.addEventListener("click", function () { stepInversion(1); });

    updateControls();
  }

  function buildRootButtons() {
    dom.roots.innerHTML = "";
    // Use the canonical chord-root spelling (Db, Eb, F#, Ab, Bb) for the labels.
    T.ROOT_NAMES.forEach(function (name, i) {
      const btn = document.createElement("button");
      btn.className = "option" + (i === state.rootIndex ? " selected" : "");
      btn.textContent = name;
      btn.dataset.index = i;
      btn.addEventListener("click", function () { selectRoot(i); });
      dom.roots.appendChild(btn);
    });
  }

  // Built from the shared chord-type registry, just like the recognition module.
  function buildTypeButtons() {
    dom.types.innerHTML = "";
    T.CHORD_TYPES.forEach(function (type) {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = type.label;
      btn.dataset.id = type.id;
      btn.addEventListener("click", function () { selectType(type); });
      dom.types.appendChild(btn);
    });
  }

  // Selecting a root only highlights it — no sound is played. If a chord type is
  // already chosen, the display is refreshed silently to the new root.
  function selectRoot(i) {
    state.rootIndex = i;
    Array.prototype.forEach.call(dom.roots.children, function (b) {
      b.classList.toggle("selected", Number(b.dataset.index) === i);
    });
    if (state.type) renderCurrent(false);
    else updateControls();
  }

  // Selecting a type resets to root position, plays the chord and shows it.
  function selectType(type) {
    state.type = type;
    state.inv = 0;
    Array.prototype.forEach.call(dom.types.children, function (b) {
      b.classList.toggle("selected", b.dataset.id === type.id);
    });
    renderCurrent(true);
  }

  function shiftOctave(delta) {
    const next = state.octaveShift + delta;
    if (next < MIN_SHIFT || next > MAX_SHIFT) return;
    state.octaveShift = next;
    // Replay the current chord at the new octave (if one is selected).
    if (state.type) renderCurrent(true);
    else updateControls();
  }

  // Move forward/backward through the inversions, wrapping around. The number of
  // inversions equals the number of notes in the chord (triads 3, tetrads 4, ...).
  function stepInversion(delta) {
    if (!state.type) return;
    const n = state.type.intervals.length;
    state.inv = ((state.inv + delta) % n + n) % n;
    renderCurrent(true);
  }

  // Build (and optionally play) the current chord, then update name + keyboard.
  function renderCurrent(play) {
    if (!state.type) return;
    const root = rootMidi();
    let notes = T.buildChord(root, state.type.intervals);
    let rootVoiced = root;
    if (state.inv > 0) {
      notes = T.invert(notes, state.inv);
      rootVoiced = root + 12; // the root (lowest note) was raised an octave
    }

    if (play) {
      if (state.arpeggio) Audio.playArpeggio(notes);
      else Audio.playChord(notes);
    }

    dom.name.innerHTML = T.chordName(root, state.type) +
      '<span class="ctype">' + state.type.label + "</span>";
    dom.name.classList.remove("hidden");

    dom.piano.innerHTML = "";
    const spelled = T.spellChord(root, state.type);
    dom.piano.appendChild(global.DiapasonPiano.render(notes, rootVoiced, spelled.byPc));
    dom.piano.classList.remove("hidden");

    updateControls();
  }

  function updateControls() {
    dom.octave.textContent = baseOctave();
    dom.octDown.disabled = state.octaveShift <= MIN_SHIFT;
    dom.octUp.disabled = state.octaveShift >= MAX_SHIFT;

    if (state.type) {
      const n = state.type.intervals.length;
      const name = INV_NAMES[state.inv] || (state.inv + "th inversion");
      dom.inversion.textContent = name + " (" + (state.inv + 1) + "/" + n + ")";
      dom.invPrev.disabled = false;
      dom.invNext.disabled = false;
    } else {
      dom.inversion.textContent = "—";
      dom.invPrev.disabled = true;
      dom.invNext.disabled = true;
    }
  }

  function onEnter() { /* state persists across visits */ }

  global.DiapasonExplorer = { init: init, onEnter: onEnter };
})(window);
