/*
 * Plaintext — client-side progress tracking.
 *
 * Adds a "Mark this module complete" checkbox to the top of every module
 * concept page and stores the state in the browser's localStorage. Nothing
 * leaves the browser; there is no account and no server. Clearing site data
 * (or using a different browser) resets progress — that is by design: the
 * real credential is the artifact you commit, not a checkbox here.
 *
 * Storage shape: a single JSON object under the key below, mapping a stable
 * page id (the module's path) to `true`. Per-track totals are derived live
 * from that object.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "plaintext:progress:v1";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage disabled / full — degrade silently */
    }
  }

  /* A stable id for the current page, independent of host/base path.
     We key on the pathname after the site root so it survives the project
     sub-path (/plaintext/) and local previews alike. */
  function pageId() {
    var path = window.location.pathname.replace(/\/index\.html$/, "/");
    /* Strip everything up to and including the first "/modules/" or track
       segment is overkill; the full pathname is already unique per page. */
    return path.replace(/\/+$/, "/");
  }

  /* Is this a module concept page? We detect the metadata strip the build
     injects under the hook line. Lab pages and overviews are skipped. */
  function moduleContentRoot() {
    var content = document.querySelector(".md-content__inner");
    if (!content) return null;
    if (!content.querySelector("p.module-meta")) return null;
    return content;
  }

  function buildWidget(content) {
    var state = loadState();
    var id = pageId();
    var done = state[id] === true;

    var wrap = document.createElement("div");
    wrap.className = "module-progress" + (done ? " is-done" : "");

    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "module-progress-checkbox";
    cb.checked = done;

    var label = document.createElement("label");
    label.setAttribute("for", "module-progress-checkbox");
    label.textContent = done
      ? "Completed — nice work"
      : "Mark this module complete";

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "module-progress__reset";
    reset.textContent = "Reset all progress";
    reset.title = "Clear every saved completion in this browser";

    cb.addEventListener("change", function () {
      var s = loadState();
      if (cb.checked) {
        s[id] = true;
        wrap.classList.add("is-done");
        label.textContent = "Completed — nice work";
      } else {
        delete s[id];
        wrap.classList.remove("is-done");
        label.textContent = "Mark this module complete";
      }
      saveState(s);
    });

    reset.addEventListener("click", function () {
      if (
        window.confirm(
          "Clear all saved module progress in this browser? This cannot be undone."
        )
      ) {
        saveState({});
        cb.checked = false;
        wrap.classList.remove("is-done");
        label.textContent = "Mark this module complete";
      }
    });

    wrap.appendChild(cb);
    wrap.appendChild(label);
    wrap.appendChild(reset);

    /* Place the widget directly under the metadata strip. */
    var meta = content.querySelector("p.module-meta");
    if (meta && meta.parentNode) {
      meta.parentNode.insertBefore(wrap, meta.nextSibling);
    } else {
      content.insertBefore(wrap, content.firstChild);
    }
  }

  function init() {
    var content = moduleContentRoot();
    if (!content) return;
    if (content.querySelector(".module-progress")) return; // already added
    buildWidget(content);
  }

  /* Material for MkDocs exposes a `document$` observable when instant
     navigation is enabled; subscribe to it so the widget survives SPA-style
     page swaps. Fall back to a plain DOMContentLoaded otherwise. */
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(function () {
      init();
    });
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
