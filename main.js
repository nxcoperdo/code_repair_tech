(function () {
  "use strict";

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  const data = window.__BRAND__ || {};
  const $  = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const reduced   = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  const nf = new Intl.NumberFormat("es-CO");

  /* ---------------------------------------------------------
     Fondo reactivo al ratón — malla que se aparta del cursor
     Intrusivo: se salta con reduced-motion y en pantallas chicas
     --------------------------------------------------------- */
  function initReactiveField() {
    if (reduced || !fineHover || window.innerWidth < 960) return;

    const cv = $("#bgc");
    const spot = $("#spot");
    if (!cv || !cv.getContext) return;

    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SPACING = 64;
    const RADIUS = 230;

    let W = 0, H = 0, nodes = [];
    let mx = -9999, my = -9999, tmx = -9999, tmy = -9999;
    let raf = 0;

    function build() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      for (let y = SPACING / 2; y < H + SPACING; y += SPACING) {
        for (let x = SPACING / 2; x < W + SPACING; x += SPACING) {
          nodes.push({ x: x, y: y, ox: x, oy: y });
        }
      }
    }

    let resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 160);
    });

    window.addEventListener("mousemove", function (e) {
      tmx = e.clientX; tmy = e.clientY;
      if (spot) {
        spot.style.setProperty("--mx", e.clientX + "px");
        spot.style.setProperty("--my", e.clientY + "px");
      }
    }, { passive: true });

    window.addEventListener("mouseleave", function () { tmx = -9999; tmy = -9999; });

    function frame() {
      mx += (tmx - mx) * 0.10;
      my += (tmy - my) * 0.10;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.ox - mx, dy = n.oy - my;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const push = d < RADIUS ? (1 - d / RADIUS) : 0;
        const tx = n.ox + (dx / d) * push * 22;
        const ty = n.oy + (dy / d) * push * 22;
        n.x += (tx - n.x) * 0.14;
        n.y += (ty - n.y) * 0.14;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.1 + push * 2.2, 0, 6.2832);
        ctx.fillStyle = "rgba(46,155,255," + (0.055 + push * 0.42) + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    // Pausar cuando la pestaña no está visible — no gastar batería de balde
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { raf = requestAnimationFrame(frame); }
    });

    build();
    raf = requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     Reveals — micro, nunca se apagan con reduced-motion
     Red de seguridad: si el observer no dispara, todo visible
     --------------------------------------------------------- */
  function initReveals() {
    const targets = $$(".section > .shell, .stats__inner, .case, .milestone, .wa");
    if (!targets.length) return;

    targets.forEach(function (el) { el.classList.add("reveal"); });

    function showAll() { targets.forEach(function (el) { el.classList.add("is-in"); }); }

    if (!("IntersectionObserver" in window)) { showAll(); return; }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });

    // Lo que ya está en pantalla al cargar, sin esperar scroll
    const hero = $(".hero .shell");
    if (hero) hero.classList.add("is-in");

    // Doble red: si algo falla, a los 2.5s se muestra todo
    setTimeout(showAll, 2500);
  }

  /* ---------------------------------------------------------
     Conteo de cifras — micro, no se gatea
     --------------------------------------------------------- */
  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;

    function run(el) {
      const end = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(end)) return;
      if (reduced) { el.textContent = nf.format(end); return; }
      const dur = 1100;
      const t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = nf.format(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.05 });

    nums.forEach(function (el) { io.observe(el); });
    setTimeout(function () { nums.forEach(function (el) {
      if (el.textContent.trim() === "") run(el);
    }); }, 2500);
  }

  /* ---------------------------------------------------------
     Video del reel: solo reproduce cuando se ve
     --------------------------------------------------------- */
  function initReelVideo() {
    const v = $(".reel video");
    if (!v) return;
    const play = function () { const p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (!("IntersectionObserver" in window)) { play(); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) play(); else v.pause();
      });
    }, { threshold: 0.05, rootMargin: "-20% 0px -20% 0px" });
    io.observe(v);
    setTimeout(function () { if (v.paused && v.getBoundingClientRect().top < innerHeight) play(); }, 2500);
  }

  /* ---------------------------------------------------------
     Imágenes que se desplazan dentro del marco del reel.
     Se mide el desborde real: si la imagen es más alta que el
     marco, se anima ese sobrante exacto; si no, queda estática y
     recortada por arriba. Así nunca aparece un hueco vacío.
     --------------------------------------------------------- */
  function initReelScroll() {
    $$(".reel__scroll").forEach(function (img) {
      function fit() {
        const box = img.parentElement;
        if (!box) return;
        const overflow = Math.round(img.offsetHeight - box.offsetHeight);
        if (overflow > 8 && !reduced) {
          img.style.setProperty("--reel-shift", "-" + overflow + "px");
        } else {
          img.style.animation = "none";
          img.style.position = "absolute";
          img.style.top = "0";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.objectPosition = "top";
        }
      }
      if (img.complete && img.naturalWidth) fit();
      else img.addEventListener("load", fit, { once: true });
      window.addEventListener("resize", fit, { passive: true });
    });
  }

  /* ---------------------------------------------------------
     Navegación: sombra al hacer scroll + resaltar sección activa
     --------------------------------------------------------- */
  function initNav() {
    const nav = $(".nav");
    if (!nav) return;
    let last = -1;
    window.addEventListener("scroll", function () {
      const on = window.scrollY > 12;
      if (on !== last) {
        nav.style.borderBottomColor = on ? "rgba(46,155,255,.22)" : "";
        last = on;
      }
    }, { passive: true });

    // Menú hamburguesa (móvil)
    const toggle = $(".nav__toggle");
    if (toggle) {
      const setOpen = function (open) {
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      };
      toggle.addEventListener("click", function () {
        setOpen(!nav.classList.contains("is-open"));
      });
      $$(".nav__links a").forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setOpen(false);
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth >= 960) setOpen(false);
      });
    }
  }

  /* ---------------------------------------------------------
     Inclinación suave en las tarjetas — micro, solo con ratón fino
     --------------------------------------------------------- */
  function initTilt() {
    if (!fineHover) return;
    const cards = $$(".pillar, .service, .ccard");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "translateY(-4px) rotateX(" + (-py * 4).toFixed(2) + "deg) rotateY(" + (px * 4).toFixed(2) + "deg)";
        card.style.transformStyle = "preserve-3d";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------
     Parallax del retrato — GSAP, gateado por feature detection
     --------------------------------------------------------- */
  function initHeroParallax() {
    if (reduced) return;
    const el = $(".hero__portrait img");
    if (!el) return;
    gsap.to(el, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  /* ---------------------------------------------------------
     Trayecto: los hitos aparecen con un stagger suave.
     La visibilidad la controla el sistema .reveal (con su red de
     seguridad a los 2.5s); acá solo se retrasa cada hito un poco.
     Nunca se toca opacity con GSAP para que no quede nada oculto
     si el ScrollTrigger no dispara.
     --------------------------------------------------------- */
  function initTimelineDraw() {
    if (reduced) return;
    const items = $$(".milestone");
    if (!items.length) return;
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 0.09, 0.45) + "s";
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function boot() {
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initReactiveField, "initReactiveField");
    safe(initReelVideo, "initReelVideo");
    safe(initReelScroll, "initReelScroll");
    safe(initNav, "initNav");
    safe(initTilt, "initTilt");
    safe(initTimelineDraw, "initTimelineDraw");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
