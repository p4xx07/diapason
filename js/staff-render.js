/* staff-render.js — draws a 5-line staff (or a grand staff with both clefs)
   with a clef and a single note, as SVG */
(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  // Layout constants (SVG user units).
  const VIEW_W = 360;
  const VIEW_H = 160;            // single-staff canvas height
  const VIEW_H_GRAND = 200;      // grand-staff canvas height
  const STAFF_LEFT = 20;
  const STAFF_RIGHT = 340;
  const LINE_GAP = 12;            // vertical distance between staff lines
  const STEP = LINE_GAP / 2;      // one diatonic step = half a line gap
  const NOTE_X = 230;             // x position of the notehead

  // Bottom-line y positions. For the grand staff the two staves share a single
  // continuous coordinate system, so the same pitch always lands at the same y
  // (and middle C floats correctly on a ledger line between them).
  const TREBLE_BOTTOM = 88;       // treble bottom line E4 (top line at y=40)
  const BASS_BOTTOM = 160;        // bass bottom line G2  (top line at y=112)

  const LETTER_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

  // Diatonic index: a linear position counting only natural-note letters.
  function diatonicIndex(letter, octave) {
    return LETTER_INDEX[letter] + 7 * octave;
  }

  // Reference notes that sit on the bottom staff line for each clef.
  // Treble bottom line = E4; bass bottom line = G2.
  const CLEF_REF = {
    treble: diatonicIndex("E", 4),
    bass: diatonicIndex("G", 2),
  };

  // y coordinate for a note, relative to a staff whose bottom line is bottomLineY.
  function noteY(clef, letter, octave, bottomLineY) {
    const idx = diatonicIndex(letter, octave);
    return bottomLineY - STEP * (idx - CLEF_REF[clef]);
  }

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }

  function drawStaffLines(svg, bottomLineY) {
    for (let i = 0; i < 5; i++) {
      const y = bottomLineY - i * LINE_GAP;
      svg.appendChild(el("line", {
        x1: STAFF_LEFT, y1: y, x2: STAFF_RIGHT, y2: y,
        stroke: "#e8ecff", "stroke-width": 1.4,
      }));
    }
  }

  function drawClef(svg, clef, bottomLineY) {
    const topLineY = bottomLineY - 4 * LINE_GAP;
    const glyph = clef === "bass" ? "𝄢" : "𝄞";
    const glyphY = clef === "bass" ? topLineY + LINE_GAP * 1.55
                                   : topLineY + LINE_GAP * 3.4;
    const glyphSize = clef === "bass" ? LINE_GAP * 3.4 : LINE_GAP * 6.2;
    const t = el("text", {
      x: STAFF_LEFT + 6, y: glyphY,
      "font-size": glyphSize,
      fill: "#e8ecff",
      "font-family": "serif",
    });
    t.textContent = glyph;
    svg.appendChild(t);
  }

  function drawLedgerLines(svg, y, topLineY, bottomLineY) {
    const half = 11; // ledger line half-width around the notehead
    for (let ly = bottomLineY + LINE_GAP; ly <= y + 0.5; ly += LINE_GAP) {
      svg.appendChild(el("line", {
        x1: NOTE_X - half, y1: ly, x2: NOTE_X + half, y2: ly,
        stroke: "#e8ecff", "stroke-width": 1.4,
      }));
    }
    for (let ly = topLineY - LINE_GAP; ly >= y - 0.5; ly -= LINE_GAP) {
      svg.appendChild(el("line", {
        x1: NOTE_X - half, y1: ly, x2: NOTE_X + half, y2: ly,
        stroke: "#e8ecff", "stroke-width": 1.4,
      }));
    }
  }

  // Draw a notehead (with ledger lines and a stem) at global y, where the note
  // belongs to the staff whose bottom line is bottomLineY.
  function drawNote(svg, y, bottomLineY) {
    const topLineY = bottomLineY - 4 * LINE_GAP;

    drawLedgerLines(svg, y, topLineY, bottomLineY);

    svg.appendChild(el("ellipse", {
      cx: NOTE_X, cy: y, rx: 7.5, ry: 5.6,
      fill: "#6c8cff",
      transform: "rotate(-20 " + NOTE_X + " " + y + ")",
    }));

    // Stem: up if the note is below the staff's middle line, down otherwise.
    const stemUp = y > topLineY + 2 * LINE_GAP;
    if (stemUp) {
      svg.appendChild(el("line", {
        x1: NOTE_X + 7, y1: y - 1, x2: NOTE_X + 7, y2: y - 34,
        stroke: "#6c8cff", "stroke-width": 1.8,
      }));
    } else {
      svg.appendChild(el("line", {
        x1: NOTE_X - 7, y1: y + 1, x2: NOTE_X - 7, y2: y + 34,
        stroke: "#6c8cff", "stroke-width": 1.8,
      }));
    }
  }

  // Single staff. note = { clef, letter, octave }
  function render(note) {
    const svg = el("svg", {
      viewBox: "0 0 " + VIEW_W + " " + VIEW_H,
      role: "img",
      "aria-label": "musical staff with one note",
    });

    drawStaffLines(svg, TREBLE_BOTTOM);
    drawClef(svg, note.clef, TREBLE_BOTTOM);
    const y = noteY(note.clef, note.letter, note.octave, TREBLE_BOTTOM);
    drawNote(svg, y, TREBLE_BOTTOM);

    return svg;
  }

  // Grand staff: both clefs shown together (treble on top, bass below), with the
  // note placed on the clef given by note.clef.
  function renderGrand(note) {
    const svg = el("svg", {
      viewBox: "0 0 " + VIEW_W + " " + VIEW_H_GRAND,
      role: "img",
      "aria-label": "grand staff (treble and bass clefs) with one note",
    });

    const trebleTop = TREBLE_BOTTOM - 4 * LINE_GAP; // 40
    const bassBottom = BASS_BOTTOM;                 // 160

    // System bracket joining the two staves on the left.
    svg.appendChild(el("line", {
      x1: STAFF_LEFT, y1: trebleTop, x2: STAFF_LEFT, y2: bassBottom,
      stroke: "#e8ecff", "stroke-width": 2,
    }));
    svg.appendChild(el("line", {
      x1: STAFF_LEFT, y1: trebleTop, x2: STAFF_LEFT + 6, y2: trebleTop,
      stroke: "#e8ecff", "stroke-width": 2,
    }));
    svg.appendChild(el("line", {
      x1: STAFF_LEFT, y1: bassBottom, x2: STAFF_LEFT + 6, y2: bassBottom,
      stroke: "#e8ecff", "stroke-width": 2,
    }));

    drawStaffLines(svg, TREBLE_BOTTOM);
    drawStaffLines(svg, BASS_BOTTOM);
    drawClef(svg, "treble", TREBLE_BOTTOM);
    drawClef(svg, "bass", BASS_BOTTOM);

    // Place the note on its assigned staff; the shared coordinate system keeps
    // it correct relative to whichever clef it belongs to.
    const bottomLineY = note.clef === "bass" ? BASS_BOTTOM : TREBLE_BOTTOM;
    const y = noteY(note.clef, note.letter, note.octave, bottomLineY);
    drawNote(svg, y, bottomLineY);

    return svg;
  }

  global.DiapasonStaff = {
    render: render,
    renderGrand: renderGrand,
    diatonicIndex: diatonicIndex,
  };
})(window);
