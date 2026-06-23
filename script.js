/* ===================================================================
   DEV LOGIC STUDIO — MAIN SCRIPT
   Vanilla JS only. No external libraries.
   =================================================================== */
(function(){
  "use strict";

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------
     LOADER
  ------------------------------------------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.add('loaded');
      revealHero();
    }, 500);
  });

  function revealHero(){
    document.querySelectorAll('.reveal-line__inner').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-inview'), i * 120);
    });
  }

  /* -------------------------------------------------
     CUSTOM CURSOR — circle bubble follower
  ------------------------------------------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (isFinePointer && cursorDot && cursorRing){
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function loop(){
      // dot tracks fast, ring trails with easing for a "bubble" feel
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%,-50%)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const hoverTargets = 'a, button, input, textarea, select, .accordion__trigger, .filter-btn, .port-card, .tech-card, .testi-slider__dots button, .why-card, .service-card';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('is-active');
        cursorRing.classList.add('is-active');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('is-active');
        cursorRing.classList.remove('is-active');
      });
    });

    document.addEventListener('mousedown', () => {
      cursorDot.classList.add('is-click');
      cursorRing.classList.add('is-click');
    });
    document.addEventListener('mouseup', () => {
      cursorDot.classList.remove('is-click');
      cursorRing.classList.remove('is-click');
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  /* -------------------------------------------------
     STICKY NAV
  ------------------------------------------------- */
  const nav = document.getElementById('nav');
  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScrollNav, { passive:true });
  onScrollNav();

  /* active link highlight */
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = Array.from(navLinks).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  function updateActiveLink(){
    let current = sections[0];
    const offset = 140;
    sections.forEach(sec => {
      if (sec && sec.getBoundingClientRect().top - offset <= 0) current = sec;
    });
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive:true });
  updateActiveLink();

  /* -------------------------------------------------
     MOBILE MENU
  ------------------------------------------------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu(){
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded','false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    burger.classList.toggle('is-active', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

  /* -------------------------------------------------
     BACK TO TOP
  ------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive:true });

  /* -------------------------------------------------
     SCROLL REVEAL (AOS-style, pure JS, IntersectionObserver)
  ------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window && !reducedMotion){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
          setTimeout(() => el.classList.add('is-inview'), delay);
          io.unobserve(el);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-inview'));
  }

  /* -------------------------------------------------
     ANIMATED COUNTERS
  ------------------------------------------------- */
  function animateCounter(el){
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll('[data-count]');
  const staticEls = document.querySelectorAll('[data-static]');
  staticEls.forEach(el => { el.textContent = el.getAttribute('data-static'); });

  if ('IntersectionObserver' in window){
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold:0.4 });
    counterEls.forEach(el => counterIO.observe(el));
  } else {
    counterEls.forEach(animateCounter);
  }

  /* -------------------------------------------------
     PROCESS TIMELINE FILL LINE
  ------------------------------------------------- */
  const timelineFill = document.getElementById('timelineFill');
  if (timelineFill){
    const timelineIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          timelineFill.style.width = '100%';
          timelineIO.unobserve(entry.target);
        }
      });
    }, { threshold:0.3 });
    timelineIO.observe(document.querySelector('.timeline'));
  }

  /* -------------------------------------------------
     PORTFOLIO FILTER
  ------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portCards = document.querySelectorAll('.port-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.getAttribute('data-filter');

      portCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* -------------------------------------------------
     PORTFOLIO MODAL
  ------------------------------------------------- */
  const modal = document.getElementById('portfolioModal');
  const modalMedia = document.getElementById('modalMedia');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTags = document.getElementById('modalTags');

  function openModal(card){
    const mediaClass = Array.from(card.querySelector('.port-card__media').classList).find(c => c.startsWith('port-card__media--'));
    modalMedia.className = 'modal__media ' + (mediaClass || '');
    modalTag.textContent = card.querySelector('.port-card__tag').textContent;
    modalTitle.textContent = card.getAttribute('data-title');
    modalDesc.textContent = card.getAttribute('data-desc');
    modalTags.innerHTML = '';
    (card.getAttribute('data-tags') || '').split(',').forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag.trim();
      modalTags.appendChild(span);
    });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  portCards.forEach(card => card.addEventListener('click', () => openModal(card)));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* -------------------------------------------------
     TESTIMONIALS SLIDER (auto-play carousel)
  ------------------------------------------------- */
  const testiTrack = document.getElementById('testiTrack');
  const testiCards = testiTrack ? testiTrack.querySelectorAll('.testi-card') : [];
  const testiDotsWrap = document.getElementById('testiDots');
  let testiIndex = 0;
  let testiTimer;

  if (testiTrack && testiCards.length){
    testiCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i+1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goToTesti(i));
      testiDotsWrap.appendChild(dot);
    });

    function goToTesti(i){
      testiIndex = (i + testiCards.length) % testiCards.length;
      testiTrack.style.transform = `translateX(-${testiIndex * 100}%)`;
      testiDotsWrap.querySelectorAll('button').forEach((d, idx) => d.classList.toggle('is-active', idx === testiIndex));
    }

    function startAutoplay(){
      if (reducedMotion) return;
      testiTimer = setInterval(() => goToTesti(testiIndex + 1), 5500);
    }
    function stopAutoplay(){ clearInterval(testiTimer); }

    document.querySelector('.testi-slider').addEventListener('mouseenter', stopAutoplay);
    document.querySelector('.testi-slider').addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* -------------------------------------------------
     FAQ ACCORDION
  ------------------------------------------------- */
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // close all others
      document.querySelectorAll('.accordion__trigger').forEach(t => {
        t.setAttribute('aria-expanded','false');
        t.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen){
        trigger.setAttribute('aria-expanded','true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* -------------------------------------------------
     CONTACT FORM VALIDATION
  ------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    phone: (v) => (!v || /^[\d+\-()\s]{7,}$/.test(v.trim())) ? '' : 'Please enter a valid phone number.',
    company: () => '',
    service: (v) => v ? '' : 'Please select a service.',
    message: (v) => v.trim().length >= 10 ? '' : 'Please write at least 10 characters.'
  };

  function validateField(name){
    const input = form.elements[name];
    const errorEl = document.getElementById('err-' + name);
    const msg = validators[name] ? validators[name](input.value) : '';
    input.closest('.field').classList.toggle('has-error', !!msg);
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  }

  ['name','email','phone','company','service','message'].forEach(name => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = ['name','email','phone','company','service','message'];
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid){
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.classList.add('submitBtn-loading');
    submitBtn.disabled = true;

    // Simulate network request — replace with real endpoint integration
    setTimeout(() => {
      submitBtn.classList.remove('submitBtn-loading');
      submitBtn.disabled = false;
      formSuccess.classList.add('is-visible');
      form.reset();
      fields.forEach(name => {
        const field = form.elements[name];
        if (field) field.closest('.field').classList.remove('has-error');
      });
      setTimeout(() => formSuccess.classList.remove('is-visible'), 6000);
    }, 1200);
  });

  /* -------------------------------------------------
     BUTTON RIPPLE EFFECT
  ------------------------------------------------- */
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = btn.getBoundingClientRect();
      const ink = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = size + 'px';
      ink.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ink.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ink);
      setTimeout(() => ink.remove(), 650);
    });
  });

  /* -------------------------------------------------
     CARD TILT EFFECT (subtle 3D tilt on pointer move)
  ------------------------------------------------- */
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches){
    document.querySelectorAll('.service-card, .why-card, .port-card, .hero__panel, .testi-card').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* -------------------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS (with nav offset)
  ------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 84;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------------
     HERO CIRCUIT / LOGIC-NODE CANVAS BACKGROUND
     Signature visual: nodes connect like circuit logic paths,
     pulsing data packets travel along the connections.
  ------------------------------------------------- */
  const canvas = document.getElementById('circuitCanvas');
  if (canvas && !reducedMotion){
    const ctx = canvas.getContext('2d');
    let w, h, nodes, links, packets;
    const hero = document.querySelector('.hero');

    function resize(){
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
      buildGraph();
    }

    function buildGraph(){
      const cols = Math.max(6, Math.floor(w / 160));
      const rows = Math.max(4, Math.floor(h / 160));
      nodes = [];
      for (let i = 0; i < cols; i++){
        for (let j = 0; j < rows; j++){
          if (Math.random() > 0.55) continue;
          nodes.push({
            x: (i / (cols - 1)) * w + (Math.random() * 60 - 30),
            y: (j / (rows - 1)) * h + (Math.random() * 60 - 30),
            r: Math.random() * 1.6 + 1.2
          });
        }
      }
      links = [];
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (j <= i) return;
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < 190 && Math.random() > 0.5) links.push({ a:n, b:m, d });
        });
      });
      packets = links
        .filter(() => Math.random() > 0.7)
        .map(link => ({ link, t: Math.random(), speed: 0.0025 + Math.random() * 0.003 }));
    }

    function draw(){
      ctx.clearRect(0, 0, w, h);

      // links
      links.forEach(({a,b,d}) => {
        const alpha = Math.max(0, 0.16 - d / 1900);
        ctx.strokeStyle = `rgba(139,148,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(160,180,255,0.5)';
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // traveling packets (the "logic" pulses)
      packets.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const x = p.link.a.x + (p.link.b.x - p.link.a.x) * p.t;
        const y = p.link.a.y + (p.link.b.y - p.link.a.y) * p.t;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grad.addColorStop(0, 'rgba(6,182,212,0.9)');
        grad.addColorStop(1, 'rgba(6,182,212,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', () => {
      clearTimeout(window.__circuitResizeT);
      window.__circuitResizeT = setTimeout(resize, 250);
    });
  }

  /* -------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
