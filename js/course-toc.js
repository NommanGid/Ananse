/*
  course-toc.js
  Vanilla JS for Table of Contents interactions:
  - smooth scroll on click
  - highlight active TOC item on scroll
  - accessible active state (aria-current)

  Simple and beginner-friendly implementation. No libraries required.
*/

(function () {
  'use strict';

  // Configuration
  const SCROLL_OFFSET = 96; // pixels from top to consider a section active

  // Helper: get all TOC links and corresponding target elements
  function getTocData() {
    const links = Array.from(document.querySelectorAll('.toc a'));
    const items = links.map((link) => {
      const href = link.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : null;
      const target = id ? document.getElementById(id) : null;
      return { link, id, target };
    }).filter(item => item.id && item.target);
    return items;
  }

  // Smooth scroll to an element and update URL hash without jumping
  function smoothScrollTo(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // update hash without causing an immediate jump
    history.replaceState(null, '', '#' + target.id);
  }

  // Update active class on links; set aria-current for accessibility
  function setActive(items, activeId) {
    items.forEach(({ link, id }) => {
      const isActive = id === activeId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  }

  // Determine which section is currently active based on viewport position
  function findActiveId(items) {
    let activeId = null;
    for (let i = 0; i < items.length; i++) {
      const el = items[i].target;
      const rect = el.getBoundingClientRect();
      if (rect.top - SCROLL_OFFSET <= 0) activeId = items[i].id;
    }
    // If none matched and the top of page, pick first
    if (!activeId && items.length) {
      const firstRect = items[0].target.getBoundingClientRect();
      if (firstRect.top - SCROLL_OFFSET > 0) activeId = null;
    }
    return activeId;
  }

  // Throttle scroll events using requestAnimationFrame
  function setupScrollSpy(items) {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const activeId = findActiveId(items);
        setActive(items, activeId);
        ticking = false;
      });
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    // run once on load to set initial state
    window.addEventListener('load', onScroll);
    // also run after DOM content is ready
    document.addEventListener('DOMContentLoaded', onScroll);
  }

  // Initialize click handlers and the scroll spy
  function init() {
    const items = getTocData();
    if (!items.length) return;

    // Click handlers for smooth scrolling
    items.forEach(({ link, target }) => {
      link.addEventListener('click', (ev) => {
        // allow modifier keys/default behavior to open in new tab
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        smoothScrollTo(target);
        setActive(items, target.id);
      });
    });

    // Update active as user scrolls
    setupScrollSpy(items);
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
