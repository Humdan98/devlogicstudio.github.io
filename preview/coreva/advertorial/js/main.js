(() => {
  'use strict';

  const PRODUCT_URL =
    'https://www.corevalabsusa.com/products/nitric-oxide-flow-blood-flow-restoration-for-men-over-50-copy';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  function onScrollFrame(callback) {
    let queued = false;

    const run = () => {
      queued = false;
      callback();
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(run);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    callback();
  }

  function initCurrentYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = year;
    });
  }

  function initReadingProgress() {
    const bar = document.querySelector('[data-reading-progress]');
    if (!bar) return;

    onScrollFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      bar.style.setProperty('--progress', progress.toFixed(4));
    });
  }

  function initChapterLabel() {
    const label = document.querySelector('[data-chapter-label]');
    const chapters = document.querySelectorAll('[data-chapter]');
    if (!label || !chapters.length || !canObserve) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) label.textContent = entry.target.dataset.chapter;
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    chapters.forEach((chapter) => observer.observe(chapter));
  }

  function initReveal() {
    const targets = document.querySelectorAll('.chapter__head, .whisper, .beat, .turn__line, .plate');
    if (!targets.length || prefersReducedMotion || !canObserve) return;

    document.documentElement.classList.add('js');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  function initStickyCta() {
    const bar = document.querySelector('[data-sticky-cta]');
    const trigger = document.querySelector('[data-sticky-trigger]');
    if (!bar || !trigger || !canObserve) return;

    const zonesInView = new Set();
    let visible = null;

    const render = () => {
      const show = trigger.getBoundingClientRect().bottom < 0 && zonesInView.size === 0;
      if (show === visible) return;

      visible = show;
      bar.classList.toggle('is-visible', show);
      bar.inert = !show;
    };

    const zoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) zonesInView.add(entry.target);
        else zonesInView.delete(entry.target);
      });
      render();
    }, { threshold: 0.15 });

    zoneObserver.observe(document.querySelector('#offer'));

    bar.hidden = false;
    onScrollFrame(render);
  }

  function initBundlePicker() {
    const checkoutLink = document.querySelector('[data-checkout-link]');
    const inputs = document.querySelectorAll('input[name="bundle"]');
    if (!checkoutLink || !inputs.length) return;

    const update = (variantId) => {
      const url = new URL(PRODUCT_URL);
      url.searchParams.set('variant', variantId);
      checkoutLink.href = url.toString();
    };

    inputs.forEach((input) => {
      input.addEventListener('change', () => update(input.value));
      if (input.checked) update(input.value);
    });
  }

  initCurrentYear();
  initReadingProgress();
  initChapterLabel();
  initReveal();
  initStickyCta();
  initBundlePicker();
})();
