/* audio.js — Web Audio API synth with selectable timbres (piano/organ/strings).
   The chosen timbre is global, so every module that plays through DiapasonAudio
   uses it automatically. */
(function (global) {
  "use strict";

  let ctx = null;

  // Timbre definitions: a set of harmonic partials + an amplitude envelope, plus
  // an optional low-pass filter. Partial gains are normalized at play time.
  const TIMBRES = {
    piano: {
      partials: [
        { type: "triangle", ratio: 1, gain: 1 },
        { type: "sine", ratio: 2, gain: 0.4 },
        { type: "sine", ratio: 3, gain: 0.12 },
      ],
      env: { kind: "percussive", attack: 0.005 }, // sharp attack, continuous decay
    },
    organ: {
      partials: [
        { type: "sine", ratio: 1, gain: 1 },
        { type: "sine", ratio: 2, gain: 0.6 },
        { type: "sine", ratio: 3, gain: 0.4 },
        { type: "sine", ratio: 4, gain: 0.25 },
      ],
      env: { kind: "sustained", attack: 0.02, release: 0.06 }, // flat, holds steady
    },
    strings: {
      partials: [
        { type: "sawtooth", ratio: 1, gain: 1, detune: -7 },
        { type: "sawtooth", ratio: 1, gain: 1, detune: 7 },
      ],
      env: { kind: "sustained", attack: 0.18, release: 0.32 }, // slow swell
      filter: 2600, // soften the bright sawtooth
    },
  };

  const state = { timbre: "piano" };

  function getContext() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      ctx = new AC();
    }
    // iOS/Safari and Chrome suspend the context until a user gesture.
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function setTimbre(name) {
    if (TIMBRES[name]) state.timbre = name;
  }
  function getTimbre() { return state.timbre; }

  // MIDI note number -> frequency in Hz (A4 = 69 = 440Hz)
  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Play a single voice (one note) with the current timbre.
  function playVoice(freq, when, duration, peak) {
    const ac = getContext();
    const timbre = TIMBRES[state.timbre] || TIMBRES.piano;
    const start = ac.currentTime + when;
    const end = start + duration;

    // Per-voice envelope gain node, optionally through a low-pass filter.
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, start);

    if (timbre.filter) {
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = timbre.filter;
      env.connect(lp);
      lp.connect(ac.destination);
    } else {
      env.connect(ac.destination);
    }

    // Sum the partials, normalized so the mix peaks around 1 regardless of timbre.
    const total = timbre.partials.reduce(function (s, p) { return s + p.gain; }, 0);
    timbre.partials.forEach(function (p) {
      const osc = ac.createOscillator();
      osc.type = p.type;
      osc.frequency.value = freq * p.ratio;
      if (p.detune) osc.detune.value = p.detune;
      const g = ac.createGain();
      g.gain.value = p.gain / total;
      osc.connect(g);
      g.connect(env);
      osc.start(start);
      osc.stop(end + 0.05);
    });

    // Amplitude envelope.
    if (timbre.env.kind === "percussive") {
      env.gain.linearRampToValueAtTime(peak, start + timbre.env.attack);
      env.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.02), end);
    } else {
      const rel = timbre.env.release;
      env.gain.linearRampToValueAtTime(peak, start + timbre.env.attack);
      env.gain.setValueAtTime(peak, Math.max(start + timbre.env.attack, end - rel));
      env.gain.linearRampToValueAtTime(0.0001, end);
    }
  }

  // Play several MIDI notes together (a chord).
  function playChord(midiNotes, duration) {
    duration = duration || 1.8;
    getContext();
    const peak = Math.min(0.22, 0.5 / midiNotes.length);
    midiNotes.forEach(function (m) {
      playVoice(midiToFreq(m), 0, duration, peak);
    });
  }

  // Play the notes one after another (arpeggio), legato: the attacks are
  // staggered (so each note is heard separately) but every note keeps ringing
  // until the end of the sequence, so the notes connect and overlap instead of
  // sounding staccato — they gradually build up the full chord.
  function playArpeggio(midiNotes) {
    getContext();
    const step = 0.3;   // spacing between successive attacks
    const tail = 1.4;   // how long the last note keeps ringing
    const span = (midiNotes.length - 1) * step + tail;
    const peak = Math.min(0.22, 0.5 / midiNotes.length); // notes overlap, so scale like a chord
    midiNotes.forEach(function (m, i) {
      playVoice(midiToFreq(m), i * step, span - i * step, peak);
    });
  }

  // Play a single note.
  function playNote(midi, duration) {
    duration = duration || 1.4;
    getContext();
    playVoice(midiToFreq(midi), 0, duration, 0.25);
  }

  global.DiapasonAudio = {
    getContext: getContext,
    midiToFreq: midiToFreq,
    setTimbre: setTimbre,
    getTimbre: getTimbre,
    playChord: playChord,
    playArpeggio: playArpeggio,
    playNote: playNote,
  };
})(window);
