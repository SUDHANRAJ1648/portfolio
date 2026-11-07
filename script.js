/* ==========================================================================
   SUDHAN.DEV — interaction layer
   Vanilla JavaScript. Progressive enhancement, accessible interactions.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

  if (!hasGSAP) root.classList.add('no-gsap');

  /* ---------------------------------------------------------------------
     Utilities
     --------------------------------------------------------------------- */
  var toastTimer;
  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function setScrollLock(locked) {
    body.style.overflow = locked ? 'hidden' : '';
    body.classList.toggle('menu-open', Boolean(locked));
  }

  /* ---------------------------------------------------------------------
     Loader
     --------------------------------------------------------------------- */
  var loader = $('#loader');
  var loaderBar = $('#loaderBar');
  var loaderPercent = $('#loaderPercent');
  var loadProgress = 0;
  var loadFinished = false;
  var loadTimer;

  function paintProgress(value) {
    loadProgress = Math.max(0, Math.min(100, value));
    if (loaderBar) loaderBar.style.width = loadProgress + '%';
    if (loaderPercent) loaderPercent.textContent = String(Math.round(loadProgress)).padStart(2, '0');
  }

  function finishLoading() {
    if (loadFinished) return;
    loadFinished = true;
    window.clearInterval(loadTimer);
    paintProgress(100);

    window.setTimeout(function () {
      if (!loader) return;
      loader.classList.add('is-done');
      body.classList.remove('is-loading');
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 750);
      startHeroAnimation();
    }, reduceMotion ? 60 : 360);
  }

  if (loader) {
    paintProgress(6);
    loadTimer = window.setInterval(function () {
      if (loadProgress >= 92) {
        window.clearInterval(loadTimer);
        return;
      }
      var step = loadProgress < 55 ? 7 : loadProgress < 80 ? 3 : 1;
      paintProgress(loadProgress + step);
    }, reduceMotion ? 10 : 110);

    if (document.readyState === 'complete') {
      window.setTimeout(finishLoading, 500);
    } else {
      window.addEventListener('load', function () {
        window.setTimeout(finishLoading, 420);
      }, { once: true });
    }

    /* Safety net: never trap the page behind the loader. */
    window.setTimeout(finishLoading, 5000);
  } else {
    body.classList.remove('is-loading');
    startHeroAnimation();
  }

  /* ---------------------------------------------------------------------
     Hero entrance (GSAP text reveal)
     --------------------------------------------------------------------- */
  var heroStarted = false;
  function startHeroAnimation() {
    if (heroStarted) return;
    heroStarted = true;
    if (reduceMotion || !hasGSAP) {
      $$('.hero__tagline, .hero__desc, .hero__actions, .hero__meta, .hero__eyebrow').forEach(function (el) {
        el.style.opacity = '';
      });
      return;
    }

    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.7 }, 0)
      .from('.hero__hello', { opacity: 0, y: 18, duration: 0.7 }, 0.05)
      .from('.hero__name-line', {
        yPercent: 116,
        duration: 1.25,
        stagger: 0.12,
        ease: 'expo.out'
      }, 0.12)
      .from('.hero__roles', { opacity: 0, y: 16, duration: 0.65 }, 0.4)
      .to('.hero__tagline', { opacity: 1, y: 0, duration: 0.75 }, 0.55)
      .to('.hero__desc', { opacity: 1, y: 0, duration: 0.75 }, 0.68)
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.75 }, 0.82)
      .to('.hero__meta', { opacity: 1, y: 0, duration: 0.75 }, 0.94)
      .from('.hero__portrait-wrap', { opacity: 0, y: 34, duration: 1.15, ease: 'power3.out' }, 0.05)
      .from('.hero__rail-link', { opacity: 0, x: 12, stagger: 0.06, duration: 0.5 }, 0.85)
      .from('.hero__top', { opacity: 0, y: -10, duration: 0.7 }, 0.2)
      .from('.hero__ticker', { opacity: 0, duration: 0.9 }, 1.1)
      .from('.hero__hud-item', { opacity: 0, y: -8, stagger: 0.08, duration: 0.5 }, 0.4)
      .from('.hero__scroll', { opacity: 0, y: 10, duration: 0.6 }, 1.15);
  }

  /* ---------------------------------------------------------------------
     Header, scroll progress and active navigation
     --------------------------------------------------------------------- */
  var header = $('#siteHeader');
  var progress = $('#scrollProgress');
  var ticking = false;

  function onScrollFrame() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', scrollY > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, scrollY / max) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + '%';
    }
    ticking = false;
  }

  function requestScrollFrame() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  onScrollFrame();

  /* The editorial hero is light, so the fixed header and cursor invert while
     it is on screen, then return to the site's dark styling further down. */
  var heroViewport = $('.hero');

  function syncHeroView() {
    if (!heroViewport) return;
    /* Stay light until the hero has fully left the viewport, so the dark header
       never appears on top of the light hero while it is still visible. */
    var limit = heroViewport.offsetHeight - 2;
    var y = window.scrollY || window.pageYOffset;
    body.classList.toggle('hero-in-view', y < limit);
  }

  window.addEventListener('scroll', syncHeroView, { passive: true });
  window.addEventListener('resize', syncHeroView, { passive: true });
  syncHeroView();

  var navLinks = $$('.nav-link');
  var sections = $$('main section[id]');

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  var menuToggle = $('#menuToggle');
  var mobileMenu = $('#mobileMenu');
  var menuOpen = false;

  function openMenu() {
    if (!mobileMenu || !menuToggle) return;
    menuOpen = true;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    setScrollLock(true);
    var firstLink = $('a', mobileMenu);
    if (firstLink) window.setTimeout(function () { firstLink.focus(); }, 80);
  }

  function closeMenu(returnFocus) {
    if (!mobileMenu || !menuToggle) return;
    menuOpen = false;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    setScrollLock(false);
    if (returnFocus) menuToggle.focus();
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      if (menuOpen) closeMenu(true); else openMenu();
    });

    $$('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuOpen) closeMenu(true);
      if (event.key !== 'Tab' || !menuOpen) return;

      var focusables = $$('a, button', mobileMenu).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------------------- */
  var revealItems = $$('.reveal');

  function revealNow(el) {
    el.classList.add('is-visible');
  }

  if (reduceMotion) {
    revealItems.forEach(revealNow);
  } else if (hasGSAP) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    revealItems.forEach(function (el, index) {
      window.gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          delay: (index % 3) * 0.045,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true
          },
          onStart: function () { el.classList.add('is-visible'); }
        }
      );
    });

    /* Code lines reveal */
    var codeLines = $$('.code-lines li');
    if (codeLines.length) {
      window.gsap.from(codeLines, {
        opacity: 0,
        x: -14,
        duration: 0.45,
        stagger: 0.035,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.code-window', start: 'top 82%', once: true }
      });
    }
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(revealNow);
  }

  /* ---------------------------------------------------------------------
     Custom cursor (desktop, fine pointer only)
     --------------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    var cursor = $('#cursor');
    var dot = $('.cursor__dot', cursor || document);
    var ring = $('.cursor__ring', cursor || document);
    var cursorText = $('.cursor__text', cursor || document);
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var ringPos = { x: mouse.x, y: mouse.y };
    var cursorVisible = false;

    if (cursor && dot && ring) {
      body.classList.add('custom-cursor-active');

      window.addEventListener('mousemove', function (event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        if (!cursorVisible) {
          cursorVisible = true;
          cursor.classList.add('is-visible');
        }

        dot.style.transform = 'translate3d(' + mouse.x + 'px, ' + mouse.y + 'px, 0)';

        var interactive = event.target.closest('a, button, [data-tilt], .project-frame, .code-window, .hero__portrait');
        if (interactive) {
          cursor.classList.add('is-hover');
          if (cursorText) {
            if (interactive.classList.contains('hero__portrait')) {
              cursorText.textContent = '360°';
            } else if (interactive.classList.contains('project-frame') || interactive.hasAttribute('data-tilt')) {
              cursorText.textContent = 'inspect';
            } else if (interactive.tagName === 'A') {
              cursorText.textContent = 'open';
            } else {
              cursorText.textContent = 'click';
            }
          }
        } else {
          cursor.classList.remove('is-hover');
        }
      }, { passive: true });

      window.addEventListener('mouseleave', function () {
        cursorVisible = false;
        cursor.classList.remove('is-visible');
      });

      var cursorLoop = function () {
        ringPos.x += (mouse.x - ringPos.x) * 0.16;
        ringPos.y += (mouse.y - ringPos.y) * 0.16;
        ring.style.transform = 'translate3d(' + ringPos.x + 'px, ' + ringPos.y + 'px, 0)';
        window.requestAnimationFrame(cursorLoop);
      };
      window.requestAnimationFrame(cursorLoop);
    }
  }

  /* ---------------------------------------------------------------------
     3D tilt & spotlight (pointer fine only)
     --------------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(function (card) {
      var rafId = null;
      var targetX = 0;
      var targetY = 0;
      var currentX = 0;
      var currentY = 0;
      var maxTilt = card.classList.contains('project-frame') ? 7 : card.classList.contains('skill-card') ? 6 : card.classList.contains('code-window') ? 4 : 5;

      function animate() {
        currentX += (targetX - currentX) * 0.14;
        currentY += (targetY - currentY) * 0.14;
        card.style.setProperty('--rx', currentX.toFixed(2) + 'deg');
        card.style.setProperty('--ry', currentY.toFixed(2) + 'deg');
        if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
          rafId = window.requestAnimationFrame(animate);
        } else {
          rafId = null;
        }
      }

      function start() {
        if (!rafId) rafId = window.requestAnimationFrame(animate);
      }

      card.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        targetX = (0.5 - py) * maxTilt * 2;
        targetY = (px - 0.5) * maxTilt * 2;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        start();
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        targetX = 0;
        targetY = 0;
        start();
      });
    });
  }

  /* ---------------------------------------------------------------------
     360° portrait — pointer tilt, parallax and dynamic lighting
     --------------------------------------------------------------------- */
  var portrait = $('#portrait');
  var heroSection = $('.hero');
  if (portrait && heroSection && finePointer && !reduceMotion) {
    var pAura = $('.portrait__aura', portrait);
    var pHalo = $('.portrait__halo', portrait);
    var pName = $('.hero__nameplate', portrait);
    var pCurvesSvg = $('.hero__curves-svg', heroSection);
    var pTargetRX = 0, pTargetRY = 0, pTargetX = 0, pTargetY = 0;
    var pCurRX = 0, pCurRY = 0, pCurX = 0, pCurY = 0;
    var pRaf = null;

    function portraitFrame() {
      pCurRX += (pTargetRX - pCurRX) * 0.1;
      pCurRY += (pTargetRY - pCurRY) * 0.1;
      pCurX += (pTargetX - pCurX) * 0.075;
      pCurY += (pTargetY - pCurY) * 0.075;

      portrait.style.setProperty('--prx', pCurRX.toFixed(2) + 'deg');
      portrait.style.setProperty('--pry', pCurRY.toFixed(2) + 'deg');
      portrait.style.setProperty('--psx', pCurX.toFixed(2) + 'px');
      portrait.style.setProperty('--psy', pCurY.toFixed(2) + 'px');

      if (pAura) {
        pAura.style.transform = 'translate3d(' + (pCurX * -1.5).toFixed(2) + 'px, ' + (pCurY * -1.5).toFixed(2) + 'px, 0)';
      }
      if (pHalo) {
        pHalo.style.transform = 'translate3d(' + (pCurX * -0.6).toFixed(2) + 'px, ' + (pCurY * -0.6).toFixed(2) + 'px, 0)';
      }
      if (pCurvesSvg) {
        /* The line field drifts against the pointer, one layer behind the portrait */
        pCurvesSvg.style.transform = 'translate3d(' + (pCurX * -1.15).toFixed(2) + 'px, ' + (pCurY * -0.85).toFixed(2) + 'px, 0)';
      }
      if (pName) {
        pName.style.setProperty('--nptx', (pCurX * -0.85).toFixed(2) + 'px');
        pName.style.setProperty('--npty', (pCurY * -0.7).toFixed(2) + 'px');
      }

      if (Math.abs(pTargetRX - pCurRX) > 0.02 || Math.abs(pTargetRY - pCurRY) > 0.02 ||
          Math.abs(pTargetX - pCurX) > 0.05 || Math.abs(pTargetY - pCurY) > 0.05) {
        pRaf = window.requestAnimationFrame(portraitFrame);
      } else {
        pRaf = null;
      }
    }

    function startPortrait() {
      if (!pRaf) pRaf = window.requestAnimationFrame(portraitFrame);
    }

    heroSection.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;

      var heroRect = heroSection.getBoundingClientRect();
      var hx = (event.clientX - heroRect.left) / heroRect.width;
      var hy = (event.clientY - heroRect.top) / heroRect.height;

      pTargetRY = Math.max(-1, Math.min(1, hx - 0.5)) * 20;
      pTargetRX = Math.max(-1, Math.min(1, 0.5 - hy)) * 13;
      pTargetX = (hx - 0.5) * 16;
      pTargetY = (hy - 0.5) * 12;

      var pRect = portrait.getBoundingClientRect();
      var px = Math.max(-0.25, Math.min(1.25, (event.clientX - pRect.left) / pRect.width));
      var py = Math.max(-0.25, Math.min(1.25, (event.clientY - pRect.top) / pRect.height));
      portrait.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      portrait.style.setProperty('--my', (py * 100).toFixed(1) + '%');

      startPortrait();
    }, { passive: true });

    heroSection.addEventListener('pointerleave', function () {
      pTargetRX = 0;
      pTargetRY = 0;
      pTargetX = 0;
      pTargetY = 0;
      startPortrait();
    });
  }

  /* ---------------------------------------------------------------------
     Editorial hero — scroll parallax and magnetic buttons
     --------------------------------------------------------------------- */
  var noriHero = $('.hero--nori');
  if (noriHero && !reduceMotion && hasGSAP) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    function heroScrollCfg() {
      return {
        trigger: noriHero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
      };
    }

    var curveFar = $('.hero__curves-group--far', noriHero);
    var curveNear = $('.hero__curves-group--near', noriHero);
    var noriName = $('.hero__name', noriHero);
    var noriPortrait = $('.hero__portrait-wrap', noriHero);

    if (curveFar) {
      window.gsap.to(curveFar, { yPercent: -14, ease: 'none', scrollTrigger: heroScrollCfg() });
    }
    if (curveNear) {
      window.gsap.to(curveNear, { yPercent: 20, ease: 'none', scrollTrigger: heroScrollCfg() });
    }
    if (noriName) {
      window.gsap.to(noriName, { yPercent: -7, ease: 'none', scrollTrigger: heroScrollCfg() });
    }
    if (noriPortrait) {
      window.gsap.to(noriPortrait, { yPercent: 6, ease: 'none', scrollTrigger: heroScrollCfg() });
    }
  }

  if (finePointer && !reduceMotion) {
    $$('.hero--nori .hero__btn').forEach(function (btn) {
      var mRaf = null;
      var mTargetX = 0, mTargetY = 0, mCurX = 0, mCurY = 0;

      function magnetFrame() {
        mCurX += (mTargetX - mCurX) * 0.18;
        mCurY += (mTargetY - mCurY) * 0.18;
        btn.style.transform = 'translate3d(' + mCurX.toFixed(2) + 'px, ' + mCurY.toFixed(2) + 'px, 0)';

        if (Math.abs(mTargetX - mCurX) > 0.1 || Math.abs(mTargetY - mCurY) > 0.1) {
          mRaf = window.requestAnimationFrame(magnetFrame);
        } else {
          mRaf = null;
        }
      }

      btn.addEventListener('pointermove', function (event) {
        var rect = btn.getBoundingClientRect();
        mTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
        mTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
        if (!mRaf) mRaf = window.requestAnimationFrame(magnetFrame);
      });

      btn.addEventListener('pointerleave', function () {
        mTargetX = 0;
        mTargetY = 0;
        if (!mRaf) mRaf = window.requestAnimationFrame(magnetFrame);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Project filters
     --------------------------------------------------------------------- */
  var filterButtons = $$('.filter-btn');
  var projectCards = $$('.project-card');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (btn) {
        var active = btn === button;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      projectCards.forEach(function (card) {
        var visible = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          card.classList.add('is-visible');
          if (hasGSAP && !reduceMotion) {
            window.gsap.fromTo(card,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true }
            );
          }
        }
      });
    });
  });

  /* ---------------------------------------------------------------------
     Project case-study modal
     --------------------------------------------------------------------- */
  var projects = {
    rentmate: {
      title: 'RentMate',
      kicker: 'Rental management platform',
      desc: 'A rental workspace for owners and renters that keeps payments, receipts, maintenance requests and communication in one place. Built around a Node.js and Express backend with a MySQL data layer.',
      features: [
        'Renter payment management',
        'Monthly payment receipt visibility',
        'House maintenance and problem requests',
        'Owner communication'
      ],
      stack: ['Node.js', 'Express.js', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
      live: 'https://rentmate-pee5.onrender.com'
    },
    exam: {
      title: 'Smart Examination Hall Seating Management System',
      kicker: 'Examination operations system',
      desc: 'An exam planning system that turns uploaded student lists and hall capacity data into automatic seating arrangements, with constraints designed to reduce copying and reports for invigilators.',
      features: [
        'Automatic examination seating arrangement',
        'Excel file uploads',
        'Hall capacity management',
        'Anti-cheating seating constraints',
        'Student roll number search',
        'Invigilator reports'
      ],
      stack: ['Node.js', 'Express.js', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
      live: null
    },
    library: {
      title: 'Smart Library Management System',
      kicker: 'Library circulation platform',
      desc: 'A QR-first library platform where every physical book copy has its own identity. Students and librarians get role-based access to issue, return and track books, with fines calculated from circulation records.',
      features: [
        'Unique QR code for each book copy',
        'Book issue and return management',
        'Student and librarian roles',
        'Fine calculation',
        'QR-based book tracking'
      ],
      stack: ['Node.js', 'Express.js', 'Supabase', 'JWT', 'QR Code', 'JavaScript'],
      live: null
    },
    bloodbank: {
      title: 'AI-Based Blood Bank Management System',
      kicker: 'Emergency healthcare platform',
      desc: 'A blood-support platform focused on visibility and speed: blood availability, hospital requests, nearby emergency donor discovery and QR-based donor information in one workflow.',
      features: [
        'Blood availability tracking',
        'Hospital blood requests',
        'Nearby emergency donor discovery',
        'QR-based donor information',
        'Emergency blood support'
      ],
      stack: ['HTML5', 'CSS3', 'JavaScript', 'QR Code'],
      live: null
    }
  };

  var modal = $('#projectModal');
  var modalPanel = $('.modal__panel', modal || document);
  var modalVisual = $('#modalVisual');
  var modalKicker = $('#modalKicker');
  var modalTitle = $('#modalTitle');
  var modalDesc = $('#modalDesc');
  var modalFeatures = $('#modalFeatures');
  var modalStack = $('#modalStack');
  var modalActions = $('#modalActions');
  var modalLastFocus = null;

  function openProject(key, trigger) {
    var project = projects[key];
    if (!project || !modal) return;

    modalLastFocus = trigger || document.activeElement;
    modalKicker.textContent = project.kicker;
    modalTitle.textContent = project.title;
    modalDesc.textContent = project.desc;
    modalFeatures.innerHTML = '';
    modalStack.innerHTML = '';
    modalActions.innerHTML = '';

    project.features.forEach(function (feature) {
      var li = document.createElement('li');
      li.textContent = feature;
      modalFeatures.appendChild(li);
    });

    project.stack.forEach(function (tech) {
      var span = document.createElement('span');
      span.textContent = tech;
      modalStack.appendChild(span);
    });

    if (project.live) {
      var liveLink = document.createElement('a');
      liveLink.className = 'btn btn--primary';
      liveLink.href = project.live;
      liveLink.target = '_blank';
      liveLink.rel = 'noopener noreferrer';
      liveLink.innerHTML = '<span>View live project</span><svg class="icon" aria-hidden="true"><use href="#icon-arrow-up-right"></use></svg>';
      modalActions.appendChild(liveLink);
    }

    var talkLink = document.createElement('a');
    talkLink.className = 'btn btn--glass';
    talkLink.href = '#contact';
    talkLink.textContent = 'Discuss this project';
    talkLink.addEventListener('click', function () { closeProject(false); });
    modalActions.appendChild(talkLink);

    /* Clone the matching 3D preview into the modal. */
    var sourceCard = $('.project-card[data-project="' + key + '"]');
    if (modalVisual && sourceCard) {
      modalVisual.innerHTML = '';
      var visual = $('.project-visual', sourceCard);
      if (visual) modalVisual.appendChild(visual.cloneNode(true));
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setScrollLock(true);

    window.setTimeout(function () {
      var closeButton = $('.modal__close', modal);
      if (closeButton) closeButton.focus();
    }, 80);
  }

  function closeProject(returnFocus) {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    if (!menuOpen) setScrollLock(false);

    var focusTarget = returnFocus === false ? null : modalLastFocus;
    if (focusTarget && typeof focusTarget.focus === 'function') {
      window.setTimeout(function () { focusTarget.focus(); }, 120);
    }
  }

  $$('[data-open-project]').forEach(function (button) {
    button.addEventListener('click', function () {
      openProject(button.getAttribute('data-open-project'), button);
    });
  });

  if (modal) {
    $$('[data-close-modal]', modal).forEach(function (el) {
      el.addEventListener('click', function () { closeProject(true); });
    });

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeProject(true);
        return;
      }

      if (event.key !== 'Tab') return;

      var focusables = $$('a, button, [tabindex]:not([tabindex="-1"])', modalPanel).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Copy email to clipboard
     --------------------------------------------------------------------- */
  var copyButton = $('#copyEmail');

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener('click', function () {
      var email = copyButton.getAttribute('data-email');
      var done = function (success) {
        if (success) {
          var label = $('span', copyButton);
          var original = label ? label.textContent : '';
          if (label) label.textContent = 'Copied!';
          showToast('Email address copied to clipboard.');
          window.setTimeout(function () {
            if (label) label.textContent = original;
          }, 2400);
        } else {
          showToast('Could not copy — please select the email address manually.');
        }
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }).catch(function () {
          done(legacyCopy(email));
        });
      } else {
        done(legacyCopy(email));
      }
    });
  }

  /* ---------------------------------------------------------------------
     Contact form — validates, then opens a pre-filled mailto message
     --------------------------------------------------------------------- */
  var form = $('#contactForm');
  var formStatus = $('#formStatus');

  function emailIsValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function setFieldError(input, message) {
    var field = input.closest('.field');
    var error = field ? $('.field__error', field) : null;
    if (field) field.classList.toggle('has-error', Boolean(message));
    if (error) error.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(input) {
    var value = input.value.trim();
    var message = '';

    if (input.id === 'name' && value.length < 2) {
      message = 'Please enter your name (at least 2 characters).';
    } else if (input.id === 'email' && !emailIsValid(value)) {
      message = 'Please enter a valid email address.';
    } else if (input.id === 'message' && value.length < 10) {
      message = 'Please add a little more detail (at least 10 characters).';
    }

    setFieldError(input, message);
    return !message;
  }

  if (form) {
    var fields = $$('input, textarea', form);

    fields.forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
      input.addEventListener('blur', function () {
        if (input.value.trim()) validateField(input);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = true;
      var firstInvalid = null;

      fields.forEach(function (input) {
        var fieldValid = validateField(input);
        if (!fieldValid && !firstInvalid) firstInvalid = input;
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        if (formStatus) {
          formStatus.textContent = 'Please fix the highlighted fields before sending.';
          formStatus.style.color = 'var(--red)';
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var name = $('#name', form).value.trim();
      var email = $('#email', form).value.trim();
      var message = $('#message', form).value.trim();
      var subject = 'Portfolio contact from ' + name;
      var bodyText = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      var mailto = 'mailto:sudhanraj1648@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);

      if (formStatus) {
        formStatus.textContent = 'Opening your email app with the message pre-filled...';
        formStatus.style.color = 'var(--green)';
      }
      showToast('Opening your email app...');

      window.setTimeout(function () {
        window.location.href = mailto;
      }, 220);
    });
  }

  /* ---------------------------------------------------------------------
     Misc
     --------------------------------------------------------------------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Close mobile menu on resize to desktop */
  window.addEventListener('resize', function () {
    if (menuOpen && window.innerWidth > 980) closeMenu(false);
  }, { passive: true });

  /* Add a class once the page is interactive (used for graceful fallbacks) */
  window.setTimeout(function () { body.classList.add('page-ready'); }, 100);
})();
