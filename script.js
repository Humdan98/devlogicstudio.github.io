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
  if (window.scrollY > 40) {
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
};

window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

/* -------------------------------------------------
   ACTIVE LINK HIGHLIGHT
------------------------------------------------- */
const navLinks = document.querySelectorAll('.nav__link');

// Only include links that point to sections on the page (#...)
const sections = Array.from(navLinks)
  .map(link => {
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#')) {
      return null;
    }

    return document.querySelector(href);
  })
  .filter(Boolean);

function updateActiveLink() {
  if (!sections.length) return;

  let current = sections[0];
  const offset = 140;

  sections.forEach(section => {
    if (section.getBoundingClientRect().top - offset <= 0) {
      current = section;
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');

    // Don't try to highlight external links
    if (!href || !href.startsWith('#')) {
      link.classList.remove('is-active');
      return;
    }

    link.classList.toggle('is-active', href === `#${current.id}`);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

  /* -------------------------------------------------
     MOBILE MENU
  ------------------------------------------------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuScrollY = 0;

  function lockScroll(){
    menuScrollY = window.scrollY || window.pageYOffset;
    document.body.style.top = (-menuScrollY) + 'px';
    document.body.classList.add('menu-open');
  }
  function unlockScroll(){
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    // html has scroll-behavior:smooth — restore instantly, not animated
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, menuScrollY);
    html.style.scrollBehavior = prev;
  }

  function syncMenuActive(){
    const active = document.querySelector('.nav__link.is-active');
    const href = active ? active.getAttribute('href') : null;
    mobileMenu.querySelectorAll('.mobile-menu__nav a').forEach(a => {
      // aria-current="page" (e.g. About on the About page) always wins
      a.classList.toggle('is-active',
        a.getAttribute('aria-current') === 'page' || (!!href && a.getAttribute('href') === href));
    });
  }

  function openMobileMenu(){
    syncMenuActive();
    lockScroll();
    mobileMenu.removeAttribute('inert');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  }

  function closeMobileMenu(opts){
    if (!mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.setAttribute('inert', '');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    unlockScroll();
    if (opts && opts.returnFocus) burger.focus({ preventScroll: true });
  }

  if (burger && mobileMenu){
    burger.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open')
        ? closeMobileMenu({ returnFocus: false })
        : openMobileMenu();
    });

    // Close on link tap. Capture phase = runs BEFORE the smooth-scroll
    // handler on the link, so the page's real scroll position is restored
    // before that handler measures where to scroll to.
    mobileMenu.addEventListener('click', e => {
      if (e.target.closest('a')) closeMobileMenu();
    }, true);

    // Escape closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobileMenu({ returnFocus: true });
    });

    // Rotating to / resizing into desktop width closes it
    window.matchMedia('(min-width: 1101px)').addEventListener('change', e => {
      if (e.matches) closeMobileMenu();
    });
  }

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
  // const modal = document.getElementById('portfolioModal');
  // const modalMedia = document.getElementById('modalMedia');
  // const modalTag = document.getElementById('modalTag');
  // const modalTitle = document.getElementById('modalTitle');
  // const modalDesc = document.getElementById('modalDesc');
  // const modalTags = document.getElementById('modalTags');

  // function openModal(card){
  //   const mediaClass = Array.from(card.querySelector('.port-card__media').classList).find(c => c.startsWith('port-card__media--'));
  //   modalMedia.className = 'modal__media ' + (mediaClass || '');
  //   modalTag.textContent = card.querySelector('.port-card__tag').textContent;
  //   modalTitle.textContent = card.getAttribute('data-title');
  //   modalDesc.textContent = card.getAttribute('data-desc');
  //   modalTags.innerHTML = '';
  //   (card.getAttribute('data-tags') || '').split(',').forEach(tag => {
  //     const span = document.createElement('span');
  //     span.textContent = tag.trim();
  //     modalTags.appendChild(span);
  //   });
  //   modal.classList.add('is-open');
  //   modal.setAttribute('aria-hidden','false');
  //   document.body.style.overflow = 'hidden';
  // }
  // function closeModal(){
  //   modal.classList.remove('is-open');
  //   modal.setAttribute('aria-hidden','true');
  //   document.body.style.overflow = '';
  // }

  // portCards.forEach(card => card.addEventListener('click', () => openModal(card)));
  // modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  // document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* -------------------------------------------------
     TESTIMONIALS — DRAG SLIDER + BULLETS + ARROWS
  ------------------------------------------------- */
  (function(){
    const viewport  = document.querySelector('.testi-slider__viewport');
    const track     = document.getElementById('testiTrack');
    const dotsWrap  = document.getElementById('testiDots');
    const prevBtn   = document.getElementById('testiPrev');
    const nextBtn   = document.getElementById('testiNext');
    if(!track || !viewport) return;

    const cards  = Array.from(track.querySelectorAll('.testi-card'));
    const total  = cards.length;
    let   cur    = 0;
    let   timer;

    // ── Build dots ──
    cards.forEach((_,i)=>{
      const d = document.createElement('button');
      d.setAttribute('aria-label','Go to testimonial '+(i+1));
      if(i===0) d.classList.add('is-active');
      d.addEventListener('click',()=>{ goTo(i); restartAuto(); });
      dotsWrap.appendChild(d);
    });

    function goTo(i, animated=true){
      cur = ((i % total) + total) % total;
      if(!animated) track.classList.add('no-transition');
      track.style.transform = `translateX(-${cur * 100}%)`;
      if(!animated) requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ track.classList.remove('no-transition'); }); });
      dotsWrap.querySelectorAll('button').forEach((d,idx)=>d.classList.toggle('is-active', idx===cur));
    }

    prevBtn && prevBtn.addEventListener('click',()=>{ goTo(cur-1); restartAuto(); });
    nextBtn && nextBtn.addEventListener('click',()=>{ goTo(cur+1); restartAuto(); });

    // ── Autoplay ──
    function startAuto(){ if(reducedMotion) return; timer = setInterval(()=>goTo(cur+1), 5500); }
    function stopAuto(){  clearInterval(timer); }
    function restartAuto(){ stopAuto(); startAuto(); }

    // ── Drag / swipe ──
    let startX=0, startY=0, dragX=0, isDragging=false, hasMoved=false;
    const THRESHOLD = 60;

    function onDragStart(x,y){
      startX=x; startY=y; dragX=0; isDragging=true; hasMoved=false;
      track.classList.add('no-transition');
      viewport.classList.add('is-dragging');
      stopAuto();
    }
    function onDragMove(x,y){
      if(!isDragging) return;
      const dx = x - startX;
      const dy = y - startY;
      if(!hasMoved && Math.abs(dy) > Math.abs(dx)+5){ isDragging=false; return; } // vertical scroll priority
      hasMoved=true;
      dragX=dx;
      track.style.transform = `translateX(calc(-${cur*100}% + ${dx}px))`;
    }
    function onDragEnd(){
      if(!isDragging) return;
      isDragging=false;
      viewport.classList.remove('is-dragging');
      track.classList.remove('no-transition');
      if(dragX < -THRESHOLD) goTo(cur+1);
      else if(dragX > THRESHOLD) goTo(cur-1);
      else goTo(cur);
      restartAuto();
    }

    // Mouse
    viewport.addEventListener('mousedown', e=>{ e.preventDefault(); onDragStart(e.clientX, e.clientY); });
    window.addEventListener('mousemove',   e=>{ onDragMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup',     ()=>{ onDragEnd(); });

    // Touch
    viewport.addEventListener('touchstart', e=>{ onDragStart(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    viewport.addEventListener('touchmove',  e=>{ onDragMove(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
    viewport.addEventListener('touchend',   ()=>{ onDragEnd(); });

    // Keyboard
    document.getElementById('testiSlider') && document.getElementById('testiSlider').addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){ goTo(cur-1); restartAuto(); }
      if(e.key==='ArrowRight'){ goTo(cur+1); restartAuto(); }
    });

    // Pause on hover
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);

    startAuto();
  })();

  /* -------------------------------------------------
     FAQ ACCORDION
  ------------------------------------------------- */
  // document.querySelectorAll('.accordion__trigger').forEach(trigger => {
  //   trigger.addEventListener('click', () => {
  //     const panel = trigger.nextElementSibling;
  //     const isOpen = trigger.getAttribute('aria-expanded') === 'true';

  //     // close all others
  //     document.querySelectorAll('.accordion__trigger').forEach(t => {
  //       t.setAttribute('aria-expanded','false');
  //       t.nextElementSibling.style.maxHeight = null;
  //     });

  //     if (!isOpen){
  //       trigger.setAttribute('aria-expanded','true');
  //       panel.style.maxHeight = panel.scrollHeight + 'px';
  //     }
  //   });
  // });

  /* -------------------------------------------------
     CONTACT FORM — validation + sending via Web3Forms
     ---------------------------------------------------
     Paste your free Web3Forms access key below (get it at
     https://web3forms.com — enter hello@devlogicstudio.com).
     Until a key is added, the form opens the visitor's email
     app with their message filled in, so it never breaks.
  ------------------------------------------------- */
  const CONTACT_FORM_KEY = 'c7cc59d8f-6a58-4876-80a0-429840bd9b72';
  const CONTACT_EMAIL = 'hello@devlogicstudio.com';

  const contactValidators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    service: (v) => v ? '' : 'Please pick a service (or "Not sure yet").',
    message: (v) => v.trim().length >= 10 ? '' : 'Please tell us a little more (at least 10 characters).'
  };

  document.querySelectorAll('.js-contact-form').forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const success = form.querySelector('.form-success');
    const successText = form.querySelector('.form-success__text');
    const okMsg = successText ? successText.textContent : '';

    function validateField(name){
      const input = form.elements[name];
      if (!input) return true;
      const errorEl = form.querySelector('[data-error-for="' + name + '"]');
      const msg = contactValidators[name] ? contactValidators[name](input.value) : '';
      input.closest('.field').classList.toggle('has-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errorEl) errorEl.textContent = msg;
      return !msg;
    }

    Object.keys(contactValidators).forEach(name => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', () => { if (input.value) validateField(name); });
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);
      });
      input.addEventListener('change', () => {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);
      });
    });

    function showStatus(msg, isError){
      if (!success) return;
      successText.textContent = msg;
      success.classList.toggle('is-error', !!isError);
      success.classList.add('is-visible');
    }

    function data(){
      const get = (n) => (form.elements[n] ? form.elements[n].value.trim() : '');
      return {
        name: get('name'), email: get('email'), service: get('service'),
        budget: get('budget') || 'Not given', website: get('website') || 'Not given',
        message: get('message'), page: location.pathname
      };
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.elements.botcheck && form.elements.botcheck.checked) return; // bot

      const allValid = Object.keys(contactValidators).map(validateField).every(Boolean);
      if (!allValid){
        const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      const d = data();

      // No key yet: fall back to the visitor's email app
      if (!CONTACT_FORM_KEY || CONTACT_FORM_KEY.indexOf('YOUR_') === 0){
        const body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nService: ' + d.service +
          '\nBudget: ' + d.budget + '\nWebsite: ' + d.website + '\n\n' + d.message;
        location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' +
          encodeURIComponent('New project enquiry: ' + d.service) + '&body=' + encodeURIComponent(body);
        return;
      }

      submitBtn.classList.add('submitBtn-loading');
      submitBtn.disabled = true;
      success.classList.remove('is-visible');

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.assign({
            access_key: CONTACT_FORM_KEY,
            subject: 'New enquiry: ' + d.service + ' (' + d.name + ')',
            from_name: 'Dev Logic Studio website',
            replyto: d.email
          }, d))
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error(json.message || 'Send failed');

        form.reset();
        form.querySelectorAll('.field').forEach(f => f.classList.remove('has-error'));
        showStatus(okMsg, false);
      } catch (err){
        showStatus('Sorry, that didn\'t send. Please try again, or email us at ' + CONTACT_EMAIL + '.', true);
      } finally {
        submitBtn.classList.remove('submitBtn-loading');
        submitBtn.disabled = false;
      }
    });
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


  (function(){
    var owpTracks = document.querySelectorAll('.owp-track');
    if (!owpTracks.length) return;

    // Duplicate each track's content once so the loop is seamless.
    owpTracks.forEach(function(track){
      if (track.dataset.cloned) return;
      var clones = track.cloneNode(true).children;
      Array.prototype.slice.call(clones).forEach(function(card){
        card.setAttribute('aria-hidden', 'true');
        card.querySelectorAll('a').forEach(function(a){ a.setAttribute('tabindex', '-1'); });
        track.appendChild(card);
      });
      track.dataset.cloned = '1';
    });

    var toggle = document.getElementById('owpToggle');
    var label = document.getElementById('owpToggleLabel');
    var paused = false;

    var isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (toggle){
      toggle.addEventListener('click', function(){
        paused = !paused;
        owpTracks.forEach(function(t){
          t.style.animationPlayState = paused ? 'paused' : 'running';
        });
        toggle.setAttribute('aria-pressed', String(paused));
        if (label) label.textContent = paused ? 'Resume auto-scroll' : 'Pause auto-scroll';
      });
    }

    // Desktop without Reduce Motion keeps the CSS marquee. Touch devices, and any
    // device with Reduce Motion on (where the CSS animation is switched off),
    // use the script below — slower when Reduce Motion is on.
    if (!isTouch && !reduce) return;

    /* ---- Touch: auto-scroll layered on top of native swipe ----
       iOS Safari scrolls overflow boxes on a separate thread; setting
       scrollLeft every frame fights it (it reports stale positions back,
       which looked like user swipes, so the rows never moved). Instead the
       auto-motion is a GPU transform on the track (--owp-x) and native
       scrolling is left entirely to the user's finger.
         visible position  v = scrollLeft (user) + off (auto)          */
    var SPEED = reduce ? 16 : 28;   // px per second (gentler with Reduce Motion)
    var RESUME_AFTER = 2200; // ms after the user stops touching/scrolling
    var section = document.querySelector('.owp-section');
    var visible = true;

    var rows = Array.prototype.map.call(document.querySelectorAll('.owp-track-viewport'), function(vp){
      var track = vp.querySelector('.owp-track');
      var row = {
        vp: vp, track: track,
        dir: track.classList.contains('reverse') ? -1 : 1,
        base: vp.scrollLeft, off: 0, half: 0,
        touching: false, holdUntil: 0
      };
      // distance from a card to its clone = one full loop
      row.measure = function(){
        var kids = track.children, n = kids.length / 2;
        row.half = n >= 1 ? (kids[n].offsetLeft - kids[0].offsetLeft) : 0;
        if (row.dir < 0 && row.off === 0 && row.half > 0) row.off = row.half / 2; // reverse row starts mid-loop
        row.apply();
      };
      row.wrap = function(){                // keep v inside one loop
        if (row.half <= 0) return;
        var v = row.base + row.off;
        while (v >= row.half){ row.off -= row.half; v -= row.half; }
        while (v < 0)        { row.off += row.half; v += row.half; }
      };
      row.apply = function(){
        track.style.setProperty('--owp-x', row.off.toFixed(2) + 'px');
        if (!isTouch) track.style.transform = 'translate3d(' + (-row.off).toFixed(2) + 'px,0,0)';
      };
      row.measure();

      var hold = function(){ row.holdUntil = performance.now() + RESUME_AFTER; };
      vp.addEventListener('touchstart', function(){ row.touching = true; hold(); }, { passive: true });
      vp.addEventListener('mouseenter', function(){ if (!isTouch) row.touching = true; });
      vp.addEventListener('mouseleave', function(){ if (!isTouch) row.touching = false; });
      vp.addEventListener('touchend',   function(){ row.touching = false; hold(); }, { passive: true });
      vp.addEventListener('touchcancel',function(){ row.touching = false; hold(); }, { passive: true });
      vp.addEventListener('scroll', function(){
        // only the user scrolls this box now, so any scroll = user swipe / momentum
        row.base = vp.scrollLeft;
        row.wrap(); row.apply();
        hold();
      }, { passive: true });
      return row;
    });

    // Re-measure when images load or the viewport changes
    window.addEventListener('resize', function(){ rows.forEach(function(r){ r.measure(); }); });
    document.querySelectorAll('.owp-card img').forEach(function(img){
      if (!img.complete) img.addEventListener('load', function(){ rows.forEach(function(r){ r.measure(); }); }, { once: true });
    });

    // Only animate while the section is on screen (battery friendly)
    if ('IntersectionObserver' in window && section){
      new IntersectionObserver(function(entries){
        visible = entries[0].isIntersecting;
      }, { rootMargin: '100px 0px' }).observe(section);
    }

    var last = performance.now();
    function tick(now){
      var dt = Math.min(now - last, 64);   // clamp after tab switches / low-power mode
      last = now;
      if (visible && !paused && !document.hidden){
        rows.forEach(function(r){
          if (r.touching || now < r.holdUntil || r.half <= 0) return;
          r.off += r.dir * SPEED * dt / 1000;
          r.wrap(); r.apply();
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  
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


(function(){
  // Reads the slides that already exist in the HTML — no content is generated by JS.
  var slideEls    = Array.prototype.slice.call(document.querySelectorAll('.owt3-slide'));
  var dotsWrap    = document.getElementById('owt3Dots');
  var counterCur  = document.getElementById('owt3CounterCurrent');
  var counterTot  = document.getElementById('owt3CounterTotal');
  var progressFill= document.getElementById('owt3ProgressFill');
  var ambient     = document.getElementById('owt3Ambient');
  var prevBtn     = document.getElementById('owt3Prev');
  var nextBtn     = document.getElementById('owt3Next');
  var stageWrap   = document.querySelector('.owt3-stage');

  // Not every page has the testimonial slider (e.g. /about/) — skip instead of crashing.
  if (!slideEls.length || !counterTot) return;

  var len = slideEls.length;
  var active = 0;
  var autoplayMs = 4600;
  var timer = null;
  var isPaused = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  counterTot.textContent = String(len).padStart(2, '0');

  // Dot indicators are structural UI (no copy), so they're the only piece still built in JS —
  // one per existing slide.
  var dotEls = slideEls.map(function(slide, i){
    var b = document.createElement('button');
    b.className = 'owt3-dotbtn';
    b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    b.addEventListener('click', function(){ goTo(i, true); });
    dotsWrap.appendChild(b);
    return b;
  });

  slideEls.forEach(function(el, i){
    el.addEventListener('click', function(){
      if (i !== active) goTo(i, true);
    });
  });

  function shortestDiff(i, active, len){
    var diff = i - active;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  }

  function render(){
    slideEls.forEach(function(el, i){
      var diff = shortestDiff(i, active, len);
      var absDiff = Math.abs(diff);
      var scale = Math.max(1 - absDiff * 0.16, 0.55);
      var rotY = Math.max(Math.min(diff * -22, 66), -66);
      var opacity = absDiff > 3 ? 0 : 1 - absDiff * 0.28;
      var blur = Math.min(absDiff * 1.6, 6);
      var z = 100 - absDiff;

      el.style.transform =
        'translateX(' + (diff * 58) + '%) ' +
        'translateZ(' + (-absDiff * 140) + 'px) ' +
        'rotateY(' + rotY + 'deg) ' +
        'scale(' + scale + ')';
      el.style.opacity = String(Math.max(opacity, 0));
      el.style.filter = 'blur(' + blur + 'px)';
      el.style.zIndex = String(z);
      el.style.pointerEvents = absDiff > 3 ? 'none' : 'auto';
      el.classList.toggle('is-active', diff === 0);
    });

    dotEls.forEach(function(d, i){ d.classList.toggle('is-active', i === active); });

    counterCur.textContent = String(active + 1).padStart(2, '0');
    var tint = slideEls[active].dataset.tint || '232,185,35';
    ambient.style.background = 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(' + tint + ',0.16), transparent 65%)';

    restartProgress();
  }

  function restartProgress(){
    progressFill.classList.remove('animate');
    void progressFill.offsetWidth;
    if (!reduceMotion) progressFill.classList.add('animate');
    progressFill.classList.toggle('paused', isPaused);
  }

  function goTo(i, userInitiated){
    active = ((i % len) + len) % len;
    render();
    if (userInitiated) resetAutoplay();
  }

  function next(){ goTo(active + 1); }
  function prev(){ goTo(active - 1); }

  function resetAutoplay(){
    if (timer) clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(function(){ if (!isPaused) next(); }, autoplayMs);
  }

  prevBtn.addEventListener('click', function(){ prev(); resetAutoplay(); });
  nextBtn.addEventListener('click', function(){ next(); resetAutoplay(); });

  stageWrap.addEventListener('mouseenter', function(){ isPaused = true; progressFill.classList.add('paused'); });
  stageWrap.addEventListener('mouseleave', function(){ isPaused = false; progressFill.classList.remove('paused'); });

  stageWrap.setAttribute('tabindex', '0');
  stageWrap.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft'){ prev(); resetAutoplay(); }
    if (e.key === 'ArrowRight'){ next(); resetAutoplay(); }
  });

  render();
  resetAutoplay();
})();


  /* -------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
