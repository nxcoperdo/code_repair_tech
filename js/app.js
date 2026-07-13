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
     CUSTOM CURSOR + LABEL
     ============================================ */
  const initCursor = () => {
    if (isTouch) return;
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
     THREE.JS — HERO 3D SCENE (EXOTIC ELECTRIC)
     Multi-layer wireframe + plasma core + particle vortex
     that react to scroll and mouse
     ============================================ */
  const initHero3D = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 10);

    // ELECTRIC PLASMA CORE — glowing orange sphere
    const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFF4D00,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Inner wireframe icosahedron — electric blue
    const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    // Middle icosahedron — orange
    const ico2Geo = new THREE.IcosahedronGeometry(2.4, 0);
    const ico2Mat = new THREE.MeshBasicMaterial({
      color: 0xFF4D00,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const ico2 = new THREE.Mesh(ico2Geo, ico2Mat);
    scene.add(ico2);

    // Outer icosahedron — purple accent
    const ico3Geo = new THREE.IcosahedronGeometry(3.0, 0);
    const ico3Mat = new THREE.MeshBasicMaterial({
      color: 0x7B00FF,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ico3 = new THREE.Mesh(ico3Geo, ico3Mat);
    scene.add(ico3);

    // ELECTRIC RINGS — 5 rings with different colors
    const rings = [];
    const ringColors = [0xFF4D00, 0x00F0FF, 0xFF0066, 0x7B00FF, 0x00F0FF];
    const ringRadii = [3.5, 4.2, 4.9, 5.6, 6.3];

    ringColors.forEach((color, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadii[i], 0.015 + (4 - i) * 0.005, 12, 100),
        new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8 - i * 0.12,
          blending: THREE.AdditiveBlending
        })
      );
      ring.rotation.x = Math.PI / 2 + (i - 2) * 0.25;
      ring.rotation.y = i * 0.4;
      ring.rotation.z = i * 0.3;
      scene.add(ring);
      rings.push(ring);
    });

    // PARTICLE VORTEX — swirling electric particles
    const particlesCount = 1500;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const colorBlue = new THREE.Color(0x00F0FF);
    const colorOrange = new THREE.Color(0xFF4D00);
    const colorPurple = new THREE.Color(0x7B00FF);

    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 12;
      const height = (Math.random() - 0.5) * 8;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Mix colors
      const colorMix = Math.random();
      let chosenColor;
      if (colorMix < 0.4) chosenColor = colorBlue;
      else if (colorMix < 0.7) chosenColor = colorOrange;
      else chosenColor = colorPurple;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // GLOW SPRITES — floating orbs
    const spriteCount = 20;
    const sprites = [];
    const spriteColors = [0xFF4D00, 0x00F0FF, 0x7B00FF];

    for (let i = 0; i < spriteCount; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        color: spriteColors[Math.floor(Math.random() * spriteColors.length)],
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      sprite.scale.set(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4, 1);
      sprites.push(sprite);
      scene.add(sprite);
    }

    // Scroll & mouse
    let scrollY = 0, mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animate = () => {
      const t = performance.now() * 0.001;

      // Scroll-driven camera dolly + fade
      const scrollProgress = Math.min(1, scrollY / window.innerHeight);
      camera.position.z = 10 - scrollProgress * 5;
      camera.position.y = scrollProgress * -2;
      camera.position.x = scrollProgress * mouseX * 2;

      // Mouse follow with smooth interpolation
      targetX += (mouseX * 0.5 - targetX) * 0.04;
      targetY += (-mouseY * 0.5 - targetY) * 0.04;

      // Core pulse
      const pulse = 1 + Math.sin(t * 3) * 0.08;
      core.scale.set(pulse, pulse, pulse);
      core.rotation.y = -t * 0.2;

      // Icosahedrons rotation
      ico.rotation.x = targetY * 0.4 + Math.sin(t * 0.5) * 0.1;
      ico.rotation.y = targetX * 0.4 + t * 0.15;
      ico.rotation.z = t * 0.05;

      ico2.rotation.x = -targetY * 0.3 + Math.cos(t * 0.4) * 0.15;
      ico2.rotation.y = -targetX * 0.3 - t * 0.1;
      ico2.rotation.z = -t * 0.03;

      ico3.rotation.x = targetY * 0.2 + Math.sin(t * 0.3) * 0.2;
      ico3.rotation.y = -targetX * 0.2 + t * 0.05;

      // Rings animation
      rings.forEach((ring, i) => {
        ring.rotation.z += (0.002 + i * 0.001) * (i % 2 ? 1 : -1);
        ring.rotation.x += Math.sin(t * 0.5 + i) * 0.002;
      });

      // Particle vortex rotation
      particles.rotation.y = t * 0.08 + targetX * 0.1;
      particles.rotation.x = targetY * 0.08;

      // Sprites floating
      sprites.forEach((sprite, i) => {
        sprite.position.y += Math.sin(t * 2 + i) * 0.005;
        sprite.scale.setScalar(0.3 + Math.sin(t * 1.5 + i) * 0.1);
      });

      // Fade out as you scroll past hero
      const opacity = 1 - scrollProgress * 1.3;
      const fade = Math.max(0, opacity);
      coreMat.opacity = 0.9 * fade;
      icoMat.opacity = 0.7 * fade;
      ico2Mat.opacity = 0.5 * fade;
      ico3Mat.opacity = 0.35 * fade;
      particleMat.opacity = 0.8 * fade;
      rings.forEach(ring => {
        ring.material.opacity = Math.max(0.2, ring.material.opacity - 0.02 * scrollProgress);
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ============================================
     THREE.JS — SERVICES STICKY SCENE (EXOTIC)
     Electric plasma core with orbiting energy rings
     ============================================ */
  const initServices3D = () => {
    const canvas = document.getElementById('scene-canvas');
    const stage = document.getElementById('servicesStage');
    if (!canvas || !stage) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    // GLOWING PLASMA CORE — changes color per service
    const coreGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFF4D00,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const plasmaCore = new THREE.Mesh(coreGeo, coreMat);
    scene.add(plasmaCore);

    // Wireframe icosahedron shell
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 0),
      new THREE.MeshBasicMaterial({ color: 0xFF4D00, wireframe: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
    );
    scene.add(core);

    // Inner electric core
    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })
    );
    scene.add(innerCore);

    // ELECTRIC RINGS — 4 orbiting rings
    const rings = [];
    const ringData = [
      { radius: 1.8, color: 0xFF4D00, thickness: 0.012 },
      { radius: 2.3, color: 0x00F0FF, thickness: 0.010 },
      { radius: 2.8, color: 0xFF0066, thickness: 0.008 },
      { radius: 3.3, color: 0x7B00FF, thickness: 0.006 }
    ];

    ringData.forEach((data, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(data.radius, data.thickness, 10, 60),
        new THREE.MeshBasicMaterial({
          color: data.color,
          transparent: true,
          opacity: 0.85 - i * 0.15,
          blending: THREE.AdditiveBlending
        })
      );
      ring.rotation.x = Math.PI / 2 + (i - 1.5) * 0.35;
      ring.rotation.y = i * 0.6;
      ring.rotation.z = i * 0.3;
      scene.add(ring);
      rings.push(ring);
    });

    // ENERGY PARTICLES — orbiting dots
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const colorOrange = new THREE.Color(0xFF4D00);
    const colorBlue = new THREE.Color(0x00F0FF);
    const colorPurple = new THREE.Color(0x7B00FF);

    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 3;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;

      const c = Math.random() < 0.4 ? colorBlue : (Math.random() < 0.7 ? colorOrange : colorPurple);
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
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
    const colors = [0xFF4D00, 0x00F0FF, 0xFF4D00, 0x00F0FF];
    const innerColors = [0x00F0FF, 0xFF4D00, 0x00F0FF, 0xFF4D00];
    const glowColors = [
      [0xFF4D00, 0x00F0FF],
      [0x00F0FF, 0xFF4D00],
      [0xFF4D00, 0x00F0FF],
      [0x00F0FF, 0xFF4D00]
    ];

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
        // Smooth color transition
        const targetColor = colors[idx];
        const targetInner = innerColors[idx];

        // Animate color change
        const startTime = performance.now();
        const animateColor = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(1, elapsed / 500);

          plasmaCore.material.color.setHex(targetColor);
          core.material.color.setHex(targetColor);
          innerCore.material.color.setHex(targetInner);

          if (progress < 1) requestAnimationFrame(animateColor);
        };
        animateColor();

        if (labelEl) {
          labelEl.textContent = labels[idx];
          labelEl.style.transform = 'scale(0.85)';
          labelEl.style.opacity = '0.7';
          requestAnimationFrame(() => {
            labelEl.style.transition = 'all 0.4s var(--ease-spring)';
            labelEl.style.transform = 'scale(1)';
            labelEl.style.opacity = '1';
          });
        }
      }
    };

    const t0 = performance.now();
    let mouseX = 0, mouseY = 0;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });

    const animate = () => {
      const t = (performance.now() - t0) * 0.001;
      updateActive();

      // Plasma core pulse
      const plasmaPulse = 1 + Math.sin(t * 3) * 0.08;
      plasmaCore.scale.setScalar(plasmaPulse);
      plasmaCore.rotation.y = -t * 0.2;

      // Wireframe core rotation with mouse influence
      core.rotation.x = t * 0.25 + mouseY * 0.4;
      core.rotation.y = t * 0.35 + mouseX * 0.4;
      core.rotation.z = t * 0.1;

      // Inner core counter-rotation
      innerCore.rotation.x = -t * 0.5;
      innerCore.rotation.y = -t * 0.6;
      innerCore.rotation.z = -t * 0.2;

      // Pulsing scale
      const pulse = 1 + Math.sin(t * 2.5) * 0.06;
      innerCore.scale.setScalar(pulse);
      core.scale.setScalar(1 + Math.sin(t * 2) * 0.04);

      // Rings animation — each rotates differently
      rings.forEach((ring, i) => {
        ring.rotation.z = t * (0.4 - i * 0.08) * (i % 2 ? 1 : -1);
        ring.rotation.x += Math.sin(t * 0.8 + i) * 0.003;
        ring.rotation.y += Math.cos(t * 0.6 + i * 0.5) * 0.002;
      });

      // Particle vortex
      particles.rotation.y = t * 0.12;
      particles.rotation.x = targetY * 0.15;
      particles.rotation.z = t * 0.03;

      // Subtle camera movement
      camera.position.x = mouseX * 0.3;
      camera.position.y = mouseY * 0.3;
      camera.lookAt(0, 0, 0);

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
    initHeroParallax();
    initTilt();
    initMagnetic();
    initReveal();
    initStatBars();
    initBackToTop();
    initForm();
    initProcessStack();
    // Three.js services scene only on desktop
    if (!isMobile) requestAnimationFrame(() => setTimeout(initServices3D, 300));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
