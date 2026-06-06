/* staff.js — "Staff Reading" module logic */
(function (global) {
  "use strict";

  const T = global.DiapasonTheory;
  const Audio = global.DiapasonAudio;
  const Render = global.DiapasonStaff;

  // Semitone offset of each natural letter within an octave.
  const LETTER_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  // MIDI number for a natural note. C4 = 60 (middle C).
  function midiOf(letter, octave) {
    return (octave + 1) * 12 + LETTER_SEMITONE[letter];
  }

  // Build the pool of natural notes used for each clef, within a readable
  // range (a couple of ledger lines at most).
  function buildPool(clef) {
    // [letter, octave] ranges chosen per clef.
    let ranges;
    if (clef === "treble") {
      ranges = enumerate("C", 4, "A", 5); // middle C up to A above the staff
    } else {
      ranges = enumerate("E", 2, "C", 4); // low E up to middle C
    }
    return ranges.map(function (n) {
      return { clef: clef, letter: n.letter, octave: n.octave, midi: midiOf(n.letter, n.octave) };
    });
  }

  // Enumerate natural notes from (lowLetter, lowOct) to (highLetter, highOct).
  function enumerate(lowLetter, lowOct, highLetter, highOct) {
    const order = T.NATURAL_LETTERS; // C D E F G A B
    const result = [];
    let octave = lowOct;
    let idx = order.indexOf(lowLetter);
    while (true) {
      const letter = order[idx];
      result.push({ letter: letter, octave: octave });
      if (letter === highLetter && octave === highOct) break;
      idx++;
      if (idx >= order.length) { idx = 0; octave++; }
      if (octave > highOct + 1) break; // safety guard
    }
    return result;
  }

  const state = {
    clef: null,      // "treble" | "bass" | "both"
    current: null,   // { clef, letter, octave, midi }
    answered: false,
    correct: 0,
    wrong: 0,
  };

  let dom = {};

  function init() {
    dom = {
      setup: document.getElementById("staff-setup"),
      game: document.getElementById("staff-game"),
      render: document.getElementById("staff-render"),
      options: document.getElementById("staff-options"),
      feedback: document.getElementById("staff-feedback"),
      play: document.getElementById("staff-play"),
      next: document.getElementById("staff-new"),
      changeClef: document.getElementById("staff-change-clef"),
      reset: document.getElementById("staff-reset"),
      correct: document.getElementById("staff-correct"),
      wrong: document.getElementById("staff-wrong"),
    };

    Array.prototype.forEach.call(document.querySelectorAll(".clef-choice"), function (btn) {
      btn.addEventListener("click", function () {
        startWithClef(btn.dataset.clef);
      });
    });

    dom.play.addEventListener("click", function () {
      if (state.current) Audio.playNote(state.current.midi);
    });
    dom.next.addEventListener("click", newRound);
    dom.changeClef.addEventListener("click", showSetup);
    dom.reset.addEventListener("click", resetScore);

    // Physical-keyboard answers: press C D E F G A B (also triggers Play
    // again via the spacebar, and a new note via Enter).
    document.addEventListener("keydown", onKeyDown);

    buildLetterButtons();
  }

  // Only react to the keyboard while the staff game is actually on screen.
  function isGameActive() {
    const screen = document.getElementById("staff");
    return screen && screen.classList.contains("active") &&
           !dom.game.classList.contains("hidden");
  }

  function onKeyDown(e) {
    if (!isGameActive()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key.toUpperCase();
    if (T.NATURAL_LETTERS.indexOf(key) >= 0) {
      e.preventDefault();
      guess(key);
    } else if (e.key === " ") {
      e.preventDefault();
      if (state.current) Audio.playNote(state.current.midi);
    } else if (e.key === "Enter") {
      e.preventDefault();
      newRound();
    }
  }

  function buildLetterButtons() {
    dom.options.innerHTML = "";
    T.NATURAL_LETTERS.forEach(function (letter) {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener("click", function () { guess(letter); });
      dom.options.appendChild(btn);
    });
  }

  function startWithClef(clef) {
    state.clef = clef;
    dom.setup.classList.add("hidden");
    dom.game.classList.remove("hidden");
    newRound();
  }

  function showSetup() {
    dom.game.classList.add("hidden");
    dom.setup.classList.remove("hidden");
  }

  function newRound() {
    // For "both", pick a clef at random each round.
    const clef = state.clef === "both"
      ? (T.randomInt(2) === 0 ? "treble" : "bass")
      : state.clef;

    const pool = buildPool(clef);
    state.current = T.pick(pool);
    state.answered = false;

    Array.prototype.forEach.call(dom.options.children, function (btn) {
      btn.classList.remove("correct", "wrong");
      btn.disabled = false;
    });

    dom.feedback.textContent = "";
    dom.feedback.className = "feedback";

    dom.render.innerHTML = "";
    // When "both" was chosen, show the grand staff (treble + bass together).
    const svg = state.clef === "both"
      ? Render.renderGrand(state.current)
      : Render.render(state.current);
    dom.render.appendChild(svg);

    // No autoplay: the user must press Play to hear the note.
  }

  function guess(letter) {
    if (state.answered || !state.current) return;
    state.answered = true;

    const correctLetter = state.current.letter;
    const isRight = letter === correctLetter;

    Array.prototype.forEach.call(dom.options.children, function (btn) {
      btn.disabled = true;
      if (btn.dataset.letter === correctLetter) btn.classList.add("correct");
      else if (btn.dataset.letter === letter) btn.classList.add("wrong");
    });

    if (isRight) {
      state.correct++;
      dom.feedback.textContent = "✓ Correct! It was " + correctLetter + ".";
      dom.feedback.className = "feedback correct";
    } else {
      state.wrong++;
      dom.feedback.textContent = "✗ Wrong. It was " + correctLetter + ".";
      dom.feedback.className = "feedback wrong";
    }
    dom.correct.textContent = state.correct;
    dom.wrong.textContent = state.wrong;
  }

  function resetScore() {
    state.correct = 0;
    state.wrong = 0;
    dom.correct.textContent = "0";
    dom.wrong.textContent = "0";
  }

  function onEnter() {
    // Always return to setup so the user re-picks a clef when entering.
    showSetup();
  }

  global.DiapasonStaffGame = { init: init, onEnter: onEnter };
})(window);
