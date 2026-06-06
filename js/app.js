/* app.js — screen navigation and module wiring */
(function (global) {
  "use strict";

  function showScreen(id) {
    Array.prototype.forEach.call(document.querySelectorAll(".screen"), function (s) {
      s.classList.toggle("active", s.id === id);
    });

    if (id === "chords") global.DiapasonChords.onEnter();
    if (id === "staff") global.DiapasonStaffGame.onEnter();
  }

  function init() {
    global.DiapasonChords.init();
    global.DiapasonStaffGame.init();

    // Module cards on the home screen.
    Array.prototype.forEach.call(document.querySelectorAll(".module-card"), function (card) {
      card.addEventListener("click", function () {
        showScreen(card.dataset.module);
      });
    });

    // Back buttons.
    Array.prototype.forEach.call(document.querySelectorAll("[data-back]"), function (btn) {
      btn.addEventListener("click", function () {
        showScreen("home");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
