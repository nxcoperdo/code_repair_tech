/* ============================================
   Code Repair Tech — EXOTIC ELECTRIC EDITION
   - Electric Orange & Blue plasma core
   - Multi-layer wireframe icosahedrons
   - Particle vortex with color mixing
   - Aurora borealis background
   - Custom cursor with neon glow
   - Magnetic buttons, tilt cards
   - Sticky process stack with scroll progress
   ============================================ */

import * as THREE from 'three';

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  /* ============================================
     LOADER
     ============================================ */
  const initLoader = () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const hide = () => {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.classList.remove('intro-active');
      }, 800);
    };
    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide, { once: true });
  };

  /* ============================================
     CUSTOM CURSOR + LABEL (Desktop only)
     ============================================ */
  const initCursor = () => {
    if (isTouch || isMobile) return;
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    const ring = cursor.querySelector('.cursor__ring');
    const dot = cursor.querySelector('.cursor__dot');
    const label = document.getElementById('cursorLabel');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (label) label.style.transform = `translate(${mx}px, ${ry}px) translate(-50%, -50%) translateY(35px)`;
      requestAnimationFrame(animate);
    };
    animate();

    document.querySelectorAll('[data-cursor]').forEach(el => {
      const text = el.dataset.cursor;
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        if (label) label.textContent = text;
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  };

  /* ============================================
     THREE.JS — HERO 3D SCENE (Modern & Clean)
     Minimalist wireframe sphere with subtle particles
     Optimized for mobile performance
     ============================================ */
  const initHero3D = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Main wireframe sphere — clean blue
    const sphereGeo = new THREE.IcosahedronGeometry(2, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00B4D8,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Inner sphere — orange accent
    const innerGeo = new THREE.IcosahedronGeometry(1, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xFF6B35,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    // Subtle particles
    const particlesCount = isMobile ? 300 : 600;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00B4D8,
      size: 0.03,
      transparent: true,
      opacity: 0.5
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Scroll & mouse
    let scrollY = 0, mouseX = 0, mouseY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    if (!isMobile) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => {
      const t = performance.now() * 0.001;
      const scrollProgress = Math.min(1, scrollY / window.innerHeight);

      // Subtle rotation
      sphere.rotation.y = t * 0.05 + mouseX * 0.1;
      sphere.rotation.x = mouseY * 0.1;
      inner.rotation.y = -t * 0.08;
      inner.rotation.x = -t * 0.05;

      // Particles drift
      particles.rotation.y = t * 0.02;

      // Scroll fade
      const fade = Math.max(0, 1 - scrollProgress * 1.2);
      sphereMat.opacity = 0.3 * fade;
      innerMat.opacity = 0.4 * fade;
      particleMat.opacity = 0.5 * fade;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ============================================
     THREE.JS — SERVICES STICKY SCENE (Modern)
     Clean orbiting ring with subtle animation
     Optimized for mobile
     ============================================ */
  const initServices3D = () => {
    const canvas = document.getElementById('scene-canvas');
    const stage = document.getElementById('servicesStage');
    if (!canvas || !stage) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    // Central sphere — changes color per service
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xFF6B35, transparent: true, opacity: 0.9 })
    );
    scene.add(core);

    // Wireframe shell
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshBasicMaterial({ color: 0x00B4D8, wireframe: true, transparent: true, opacity: 0.4 })
    );
    scene.add(shell);

    // Single orbiting ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.02, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x00B4D8, transparent: true, opacity: 0.6 })
    );
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Subtle particles
    const pCount = isMobile ? 100 : 200;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 6;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x00B4D8,
      size: 0.025,
      transparent: true,
      opacity: 0.5
    }));
    scene.add(particles);

    // Resize to stage box
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // Scroll-driven color + rotation
    const labelEl = document.getElementById('stageLabel');
    const labels = ['01 · Inventory', '02 · Contable', '03 · Restaurantes', '04 · Automatización'];
    const colors = [0xFF6B35, 0x00B4D8, 0xFF6B35, 0x00B4D8];

    let activeIndex = -1;
    const updateActive = () => {
      const cards = document.querySelectorAll('.service-card');
      let idx = 0;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.55) idx = i;
      });
      if (idx !== activeIndex && idx >= 0) {
        activeIndex = idx;
        core.material.color.setHex(colors[idx]);
        shell.material.color.setHex(idx % 2 === 0 ? 0xFF6B35 : 0x00B4D8);
        ring.material.color.setHex(idx % 2 === 0 ? 0x00B4D8 : 0xFF6B35);
        if (labelEl) {
          labelEl.textContent = labels[idx];
        }
      }
    };

    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) * 0.001;
      updateActive();

      // Subtle rotation
      core.rotation.y = t * 0.2;
      shell.rotation.x = t * 0.15;
      shell.rotation.y = t * 0.2;
      ring.rotation.z = t * 0.1;
      ring.rotation.x = Math.sin(t * 0.5) * 0.1;
      particles.rotation.y = t * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ============================================
     HERO 2D PARALLAX (for hshape divs)
     ============================================ */
  const initHeroParallax = () => {
    const scene = document.getElementById('heroShapes');
    const hero = document.getElementById('hero');
    if (!scene || !hero) return;

    const shapes = scene.querySelectorAll('[data-depth]');
    const snippets = document.querySelectorAll('.code-snippet');
    let mouseX = 0, mouseY = 0, scrollY = 0, rect = hero.getBoundingClientRect();

    const updateRect = () => { rect = hero.getBoundingClientRect(); };
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    window.addEventListener('resize', updateRect);

    const animate = () => {
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      if (inView) {
        const progress = Math.max(0, -rect.top / rect.height);
        shapes.forEach((s) => {
          const d = parseFloat(s.dataset.depth) || 1;
          const tz = d * 80;
          const rx = mouseY * -10 * (d / 3);
          const ry = mouseX *  14 * (d / 3);
          const ty = progress * -150 * d;
          s.style.transform = `translate3d(0, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        snippets.forEach((s) => {
          const d = parseFloat(s.dataset.depth) || 1;
          const ty = progress * -100 * d;
          s.style.transform = `translate3d(0, ${ty}px, ${d * 30}px) rotateX(${mouseY * -4}deg) rotateY(${mouseX * 6}deg)`;
        });
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ============================================
     TILT CARDS
     ============================================ */
  const initTilt = () => {
    if (prefersReducedMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      let rect;
      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotY = (px - 0.5) * 18;
        const rotX = (0.5 - py) * 18;
        card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  };

  /* ============================================
     MAGNETIC BUTTONS
     ============================================ */
  const initMagnetic = () => {
    if (prefersReducedMotion || isTouch) return;
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      let rect;
      el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  };

  /* ============================================
     COUNTER ANIMATION
     ============================================ */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.counter);
    if (Number.isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    };
    requestAnimationFrame(step);
  };

  /* ============================================
     REVEAL ON SCROLL
     ============================================ */
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal, [data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.querySelectorAll('[data-counter]').forEach(animateCounter);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => io.observe(el));
  };

  /* ============================================
     NAVIGATION
     ============================================ */
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
          const total = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
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

  /* ============================================
     BACK TO TOP
     ============================================ */
  const initBackToTop = () => {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const onScroll = () => { btn.hidden = window.scrollY < 600; };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  };

  /* ============================================
     FORM (Web3Forms)
     ============================================ */
  const initForm = () => {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    if (!form || !feedback) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn__bg"></span><span class="btn__content"><span>Enviando…</span></span>';
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          feedback.hidden = false;
          feedback.className = 'form__feedback is-success';
          feedback.textContent = '✓ Mensaje enviado. Te contactaremos en menos de 24 horas.';
          form.reset();
        } else throw new Error(json.message || 'Error al enviar');
      } catch (err) {
        feedback.hidden = false;
        feedback.className = 'form__feedback is-error';
        feedback.textContent = '✕ No pudimos enviar el mensaje. Intenta de nuevo.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
        setTimeout(() => { feedback.hidden = true; }, 6000);
      }
    });
  };

  /* ============================================
     STAT BARS
     ============================================ */
  const initStatBars = () => {
    if (!('IntersectionObserver' in window)) return;
    const bars = document.querySelectorAll('.stat-card__bar span');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const span = entry.target;
          const v = span.style.getPropertyValue('--bar');
          requestAnimationFrame(() => { span.style.width = v; });
          io.unobserve(span);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
  };

  /* ============================================
     PROCESS — sticky stack
     ============================================ */
  const initProcessStack = () => {
    const pin = document.getElementById('processPin');
    const stack = document.getElementById('processStack');
    const num = document.getElementById('processNum');
    const bar = document.querySelector('.process-pin__bar span');
    const steps = document.querySelectorAll('.process-step');
    if (!pin || !stack) return;

    const total = steps.length;

    const update = () => {
      const rect = pin.getBoundingClientRect();
      const totalH = pin.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / totalH);
      const idx = Math.min(total - 1, Math.floor(progress * total));

      steps.forEach((s, i) => {
        s.classList.remove('is-active', 'is-past');
        if (i === idx) s.classList.add('is-active');
        else if (i < idx) s.classList.add('is-past');
      });
      if (num) num.textContent = String(idx + 1).padStart(2, '0');
      if (bar) bar.style.height = (progress * 100) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ============================================
     BOOT
     ============================================ */
  const init = () => {
    initLoader();
    initCursor();
    initNav();
    initHero3D();

    // Only init parallax on desktop
    if (!isMobile) {
      initHeroParallax();
      initTilt();
      initMagnetic();
      requestAnimationFrame(() => setTimeout(initServices3D, 300));
    }

    initReveal();
    initStatBars();
    initBackToTop();
    initForm();
    initProcessStack();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
