(() => {
  'use strict';

  const PRODUCT_URL =
    'https://www.corevalabsusa.com/products/nitric-oxide-flow-blood-flow-restoration-for-men-over-50-copy';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function initStickyCta() {
    const bar = document.querySelector('[data-sticky-cta]');
    const heroCta = document.querySelector('[data-cta="hero"]');
    if (!bar || !heroCta || !('IntersectionObserver' in window)) return;

    const zonesInView = new Set();
    let visible = null;

    const render = () => {
      const pastHero = heroCta.getBoundingClientRect().bottom < 0;
      const show = pastHero && zonesInView.size === 0;
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

    document.querySelectorAll('#offer, .final-cta').forEach((zone) => zoneObserver.observe(zone));

    bar.hidden = false;
    onScrollFrame(render);
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

  function initStatBars() {
    const lists = document.querySelectorAll('[data-animate-stats]');
    if (!lists.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    lists.forEach((list) => {
      list.classList.add('is-pending');
      observer.observe(list);
    });
  }

  initCurrentYear();
  initBundlePicker();
  initStickyCta();
  initReadingProgress();
  initStatBars();
})();
