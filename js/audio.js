/* audio.js — simple Web Audio API synth for notes and chords */
(function (global) {
  "use strict";

  let ctx = null;

  function getContext() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      ctx = new AC();
    }
    // iOS/Safari and Chrome suspend the context until a user gesture.
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  // MIDI note number -> frequency in Hz (A4 = 69 = 440Hz)
  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a single frequency with a soft attack/release envelope.
  function playFreq(freq, when, duration, gainPeak) {
    const ac = getContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    const start = ac.currentTime + when;
    const end = start + duration;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainPeak, start + 0.02);
    gain.gain.setValueAtTime(gainPeak, end - 0.15);
    gain.gain.linearRampToValueAtTime(0, end);

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start(start);
    osc.stop(end + 0.02);
  }

  // Play several MIDI notes together (a chord).
  function playChord(midiNotes, duration) {
    duration = duration || 1.6;
    getContext(); // ensure resumed
    const peak = Math.min(0.25, 0.6 / midiNotes.length);
    midiNotes.forEach(function (m) {
      playFreq(midiToFreq(m), 0, duration, peak);
    });
  }

  // Play notes one after another (arpeggio), then leave them ringing.
  function playArpeggio(midiNotes, duration) {
    duration = duration || 1.8;
    getContext();
    const step = 0.18;
    const peak = Math.min(0.25, 0.6 / midiNotes.length);
    midiNotes.forEach(function (m, i) {
      const when = i * step;
      playFreq(midiToFreq(m), when, duration - when, peak);
    });
  }

  // Play a single note.
  function playNote(midi, duration) {
    duration = duration || 1.4;
    getContext();
    playFreq(midiToFreq(midi), 0, duration, 0.25);
  }

  global.DiapasonAudio = {
    getContext: getContext,
    midiToFreq: midiToFreq,
    playChord: playChord,
    playArpeggio: playArpeggio,
    playNote: playNote,
  };
})(window);
