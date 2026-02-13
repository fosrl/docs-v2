/**
 * Shows the Pangolin Cloud CTA in the table of contents on every page.
 * Moves the PangolinCloudTocCta snippet (MDX Card) into the TOC when present.
 * Re-runs on SPA navigation; avoids duplicating when DOM re-renders (e.g. theme toggle).
 */
(function () {
  const MAX_ATTEMPTS = 30;
  const RETRY_MS = 150;
  const DEBOUNCE_MS = 100;
  const CTA_MARKER = "data-pangolin-toc-cta";

  function moveSnippetToToc() {
    const toc = document.getElementById("table-of-contents");
    const source = document.getElementById("pangolin-toc-cta");
    if (!toc || !source) return false;

    if (toc.querySelector("[" + CTA_MARKER + "]")) {
      const duplicate = source.firstElementChild;
      if (duplicate) source.removeChild(duplicate);
      return true;
    }

    const card = source.firstElementChild;
    if (!card) return false;

    source.removeChild(card);
    card.setAttribute(CTA_MARKER, "true");
    toc.appendChild(card);
    return true;
  }

  function tryRun() {
    moveSnippetToToc();
  }

  let debounceTimer = null;
  function scheduleRun() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      tryRun();
    }, DEBOUNCE_MS);
  }

  function run() {
    let attempts = 0;
    const id = setInterval(function () {
      attempts++;
      if (moveSnippetToToc()) {
        clearInterval(id);
        observeForNavigation();
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(id);
        observeForNavigation();
      }
    }, RETRY_MS);
  }

  function observeForNavigation() {
    const observer = new MutationObserver(function () {
      if (document.getElementById("pangolin-toc-cta")) {
        scheduleRun();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
