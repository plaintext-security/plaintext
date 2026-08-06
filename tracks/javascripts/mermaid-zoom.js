/*
 * mermaid-zoom.js — click any Mermaid diagram to open it full-screen, with
 * scroll-wheel zoom and drag-to-pan. Dependency-free; no external assets.
 *
 * Diagrams render small and are hard to read on large monitors; this makes
 * every diagram a click-to-enlarge affordance without touching the source.
 */
(function () {
  "use strict";

  var OVERLAY_ID = "px-mermaid-overlay";

  function buildOverlay() {
    var existing = document.getElementById(OVERLAY_ID);
    if (existing) return existing;

    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Enlarged diagram");
    overlay.innerHTML =
      '<button class="px-mz-close" aria-label="Close (Esc)">&times;</button>' +
      '<div class="px-mz-hint">scroll to zoom · drag to pan · Esc to close</div>' +
      '<div class="px-mz-stage"></div>';
    document.body.appendChild(overlay);

    var stage = overlay.querySelector(".px-mz-stage");
    var state = { scale: 1, tx: 0, ty: 0, dragging: false, sx: 0, sy: 0 };

    function apply() {
      var svg = stage.firstElementChild;
      if (svg) {
        svg.style.transform =
          "translate(" + state.tx + "px," + state.ty + "px) scale(" + state.scale + ")";
      }
    }
    function reset() {
      state.scale = 1; state.tx = 0; state.ty = 0; apply();
    }
    function close() {
      overlay.classList.remove("is-open");
      stage.innerHTML = "";
    }

    overlay.close = close;
    overlay.reset = reset;
    overlay._state = state;
    overlay._apply = apply;

    overlay.querySelector(".px-mz-close").addEventListener("click", close);
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay || e.target.classList.contains("px-mz-stage")) {
        // click on backdrop closes
        if (e.target === overlay) { close(); return; }
      }
      state.dragging = true;
      state.sx = e.clientX - state.tx;
      state.sy = e.clientY - state.ty;
    });
    window.addEventListener("mousemove", function (e) {
      if (!state.dragging) return;
      state.tx = e.clientX - state.sx;
      state.ty = e.clientY - state.sy;
      apply();
    });
    window.addEventListener("mouseup", function () { state.dragging = false; });
    overlay.addEventListener("wheel", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      state.scale = Math.min(12, Math.max(0.4, state.scale * factor));
      apply();
    }, { passive: false });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    return overlay;
  }

  function openWith(svg) {
    var overlay = buildOverlay();
    var stage = overlay.querySelector(".px-mz-stage");
    var clone = svg.cloneNode(true);
    clone.removeAttribute("style");
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";
    clone.style.transformOrigin = "center center";
    stage.innerHTML = "";
    stage.appendChild(clone);
    overlay.reset();
    overlay.classList.add("is-open");
  }

  function enhance(root) {
    var blocks = (root || document).querySelectorAll(".mermaid");
    blocks.forEach(function (block) {
      if (block.dataset.pxZoom) return;
      block.dataset.pxZoom = "1";
      block.classList.add("px-mermaid-zoomable");
      block.setAttribute("title", "Click to enlarge");
      block.addEventListener("click", function () {
        var svg = block.querySelector("svg");
        if (svg) openWith(svg);
      });
    });
  }

  // Material renders Mermaid asynchronously and (with instant nav) swaps the
  // document; bind to document$ when present, else fall back to DOM ready.
  // Attaching the handler to the .mermaid container (not the svg) means the svg
  // only has to exist at click time, sidestepping render-timing races.
  function schedule() {
    enhance(document);
    // A couple of delayed passes catch late Mermaid renders on first paint.
    setTimeout(function () { enhance(document); }, 400);
    setTimeout(function () { enhance(document); }, 1200);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(schedule);
  } else if (document.readyState !== "loading") {
    schedule();
  } else {
    document.addEventListener("DOMContentLoaded", schedule);
  }
})();
