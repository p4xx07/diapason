/* chords.js — "Chord Types" module logic */
(function (global) {
  "use strict";

  const T = global.DiapasonTheory;
  const Audio = global.DiapasonAudio;

  // Root notes are chosen from a comfortable octave so chords stay audible.
  const ROOT_MIN = 52; // E3
  const ROOT_MAX = 64; // E4

  const state = {
    current: null,   // { type, rootMidi, notes }
    answered: false,
    correct: 0,
    wrong: 0,
  };

  let dom = {};

  function init() {
    dom = {
      play: document.getElementById("chord-play"),
      next: document.getElementById("chord-new"),
      reset: document.getElementById("chord-reset"),
      options: document.getElementById("chord-options"),
      feedback: document.getElementById("chord-feedback"),
      name: document.getElementById("chord-name"),
      piano: document.getElementById("chord-piano"),
      correct: document.getElementById("chord-correct"),
      wrong: document.getElementById("chord-wrong"),
    };

    dom.play.addEventListener("click", function () {
      if (state.current) Audio.playChord(state.current.notes);
    });
    dom.next.addEventListener("click", function () { newRound(true); });
    dom.reset.addEventListener("click", resetScore);

    buildOptionButtons();
  }

  // Build one button per chord type once; reuse across rounds.
  function buildOptionButtons() {
    dom.options.innerHTML = "";
    T.CHORD_TYPES.forEach(function (type) {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = type.label;
      btn.dataset.id = type.id;
      btn.addEventListener("click", function () { guess(type); });
      dom.options.appendChild(btn);
    });
  }

  // play = true sounds the new chord right away (used by the "New chord"
  // button). Entering the module leaves it silent until the user presses Play.
  function newRound(play) {
    const type = T.pick(T.CHORD_TYPES);
    const rootMidi = ROOT_MIN + T.randomInt(ROOT_MAX - ROOT_MIN + 1);
    state.current = {
      type: type,
      rootMidi: rootMidi,
      notes: T.buildChord(rootMidi, type.intervals),
    };
    state.answered = false;

    // Reset button styles.
    Array.prototype.forEach.call(dom.options.children, function (btn) {
      btn.classList.remove("correct", "wrong");
      btn.disabled = false;
    });

    dom.feedback.textContent = "";
    dom.feedback.className = "feedback";

    // Hide the chord name and keyboard; wait for the user to press Play (no autoplay).
    dom.name.innerHTML = "";
    dom.name.classList.add("hidden");
    dom.piano.innerHTML = "";
    dom.piano.classList.add("hidden");

    if (play) Audio.playChord(state.current.notes);
  }

  function guess(type) {
    if (state.answered || !state.current) return;
    state.answered = true;

    const correctId = state.current.type.id;
    const isRight = type.id === correctId;

    Array.prototype.forEach.call(dom.options.children, function (btn) {
      btn.disabled = true;
      if (btn.dataset.id === correctId) btn.classList.add("correct");
      else if (btn.dataset.id === type.id) btn.classList.add("wrong");
    });

    if (isRight) {
      state.correct++;
      dom.feedback.textContent = "✓ Correct! It was " + state.current.type.label + ".";
      dom.feedback.className = "feedback correct";
    } else {
      state.wrong++;
      dom.feedback.textContent = "✗ Wrong. It was " + state.current.type.label + ".";
      dom.feedback.className = "feedback wrong";
    }
    dom.correct.textContent = state.correct;
    dom.wrong.textContent = state.wrong;

    // Show the full chord name (e.g. "E9") together with the keyboard,
    // and the chord notes highlighted (root in green).
    const fullName = T.chordName(state.current.rootMidi, state.current.type);
    dom.name.innerHTML = fullName +
      '<span class="ctype">' + state.current.type.label + "</span>";
    dom.name.classList.remove("hidden");

    dom.piano.innerHTML = "";
    dom.piano.appendChild(global.DiapasonPiano.render(state.current.notes));
    dom.piano.classList.remove("hidden");
  }

  function resetScore() {
    state.correct = 0;
    state.wrong = 0;
    dom.correct.textContent = "0";
    dom.wrong.textContent = "0";
  }

  // Called by app.js when the chord screen is opened.
  function onEnter() {
    if (!state.current) newRound();
  }

  global.DiapasonChords = { init: init, onEnter: onEnter, newRound: newRound };
})(window);
