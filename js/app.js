/* ============================================
   Code Repair Tech — Interactions
   - Custom cursor
   - Aurora canvas (subtle gradient mesh)
   - Scroll-driven 3D parallax (hero shapes + tilt cards)
   - Counter animation
   - Reveal on scroll
   - Mobile nav, back-to-top, form feedback
   ============================================ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ------------------------------------------
     Custom cursor (desktop only)
  ------------------------------------------ */
  const initCursor = () => {
    if (isTouch) return;
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    const ring = cursor.querySelector('.cursor__ring');
    const dot = cursor.querySelector('.cursor__dot');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();

    // Hover state on interactive elements
    const interactives = document.querySelectorAll('a, button, [data-tilt], [data-magnetic]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  };

  /* ------------------------------------------
     Aurora canvas — subtle mesh gradient
  ------------------------------------------ */
  const initAurora = () => {
    const canvas = document.getElementById('aurora-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w, h, t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.2, y: 0.2, r: 0.5, color: [124, 58, 237], speed: 0.0003 },
      { x: 0.8, y: 0.3, r: 0.45, color: [34, 211, 238], speed: 0.00025 },
      { x: 0.5, y: 0.8, r: 0.55, color: [244, 114, 182], speed: 0.00035 },
      { x: 0.3, y: 0.7, r: 0.4,  color: [167, 139, 250], speed: 0.0002 },
    ];

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      blobs.forEach((b, i) => {
        const x = (b.x + Math.sin(t * b.speed + i) * 0.15) * window.innerWidth;
        const y = (b.y + Math.cos(t * b.speed * 1.3 + i) * 0.12) * window.innerHeight;
        const r = b.r * Math.min(window.innerWidth, window.innerHeight) * (0.8 + Math.sin(t * b.speed * 2) * 0.15);
        const [cr, cg, cb] = b.color;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},0.25)`);
        grd.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.08)`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    };
    render();
  };

  /* ------------------------------------------
     Scroll-driven 3D parallax for hero shapes
  ------------------------------------------ */
  const initHero3D = () => {
    if (prefersReducedMotion) return;
    const scene = document.getElementById('heroScene');
    const hero = document.getElementById('hero');
    if (!scene || !hero) return;

    const shapes = scene.querySelectorAll('[data-depth]');
    let scrollY = 0, mouseX = 0, mouseY = 0;
    let rect = hero.getBoundingClientRect();

    const onScroll = () => { scrollY = window.scrollY; };
    const onMouse = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX = (e.clientX - cx) / cx;
      mouseY = (e.clientY - cy) / cy;
    };

    const updateRect = () => { rect = hero.getBoundingClientRect(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', updateRect);
    updateRect();

    const animate = () => {
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (inView) {
        const progress = Math.max(0, -rect.top / rect.height);
        shapes.forEach((shape) => {
          const depth = parseFloat(shape.dataset.depth) || 1;
          const translateZ = depth * 60;
          const rotX = mouseY * -8 * (depth / 3);
          const rotY = mouseX *  10 * (depth / 3);
          const ty   = progress * -120 * depth;
          shape.style.transform = `
            translate3d(0, ${ty}px, ${translateZ}px)
            rotateX(${rotX}deg)
            rotateY(${rotY}deg)
          `;
        });
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ------------------------------------------
     Tilt cards (services + stat cards)
  ------------------------------------------ */
  const initTilt = () => {
    if (prefersReducedMotion) return;
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach((card) => {
      let rect = card.getBoundingClientRect();
      const onEnter = () => { rect = card.getBoundingClientRect(); };
      const onMove = (e) => {
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top)  / rect.height;
        const rotY = (px - 0.5) * 14;
        const rotX = (0.5 - py) * 14;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  };

  /* ------------------------------------------
     Magnetic buttons
  ------------------------------------------ */
  const initMagnetic = () => {
    if (prefersReducedMotion || isTouch) return;
    const els = document.querySelectorAll('[data-magnetic]');
    els.forEach((el) => {
      let rect;
      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onMove = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
        el.style.transform = `translate(${x}px, ${y}px)`;
      };
      const onLeave = () => { el.style.transform = ''; };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  };

  /* ------------------------------------------
     Counter animation
  ------------------------------------------ */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    if (Number.isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = 0 + (target - 0) * eased;
      el.textContent = Math.round(val).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    };
    requestAnimationFrame(step);
  };

  /* ------------------------------------------
     Reveal on scroll (IntersectionObserver)
  ------------------------------------------ */
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal, [data-scroll-section]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          const counters = entry.target.querySelectorAll('[data-counter]');
          counters.forEach(animateCounter);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => io.observe(el));
  };

  /* ------------------------------------------
     Nav: scrolled state, mobile toggle, progress
  ------------------------------------------ */
  const initNav = () => {
    const nav = document.getElementById('nav');
    const progress = document.getElementById('navProgress');
    const toggle = document.getElementById('navToggle');
    const menu = nav && nav.querySelector('.nav__menu');

    if (nav) {
      const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('is-scrolled', y > 30);
        if (progress) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
          progress.style.width = pct + '%';
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
    }
  };

  /* ------------------------------------------
     Back to top
  ------------------------------------------ */
  const initBackToTop = () => {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const onScroll = () => {
      btn.hidden = window.scrollY < 600;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    onScroll();
  };

  /* ------------------------------------------
     Contact form feedback (Web3Forms)
  ------------------------------------------ */
  const initForm = () => {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Enviando…</span>';

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          feedback.hidden = false;
          feedback.className = 'form__feedback is-success';
          feedback.textContent = '✓ Mensaje enviado. Te contactaremos en menos de 24 horas.';
          form.reset();
        } else {
          throw new Error(json.message || 'Error al enviar');
        }
      } catch (err) {
        feedback.hidden = false;
        feedback.className = 'form__feedback is-error';
        feedback.textContent = '✕ No pudimos enviar el mensaje. Intenta de nuevo o escríbenos directamente.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
        setTimeout(() => { feedback.hidden = true; }, 6000);
      }
    });
  };

  /* ------------------------------------------
     Stat bar fill (when stat-card enters view)
  ------------------------------------------ */
  const initStatBars = () => {
    if (!('IntersectionObserver' in window)) return;
    const bars = document.querySelectorAll('.stat-card__bar span');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const span = entry.target;
          const val = span.style.getPropertyValue('--bar');
          requestAnimationFrame(() => { span.style.width = val; });
          io.unobserve(span);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
  };

  /* ------------------------------------------
     Boot
  ------------------------------------------ */
  const init = () => {
    initCursor();
    initAurora();
    initNav();
    initHero3D();
    initTilt();
    initMagnetic();
    initReveal();
    initStatBars();
    initBackToTop();
    initForm();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
