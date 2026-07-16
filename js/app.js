/* ==================================================================
   Code Repair Tech — "LA SEÑAL QUE REPARA"
   Motor 3D cinematográfico
   ------------------------------------------------------------------
   · Mundo PCB procedural: chip central + trazas con quiebres a 45°
   · Pulsos de luz (señales de datos) recorriendo las trazas
   · Cámara con recorrido cinematográfico sincronizado al scroll
     (dolly / órbita / cenital / acercamiento final)
   · Gradación de color por sección: azul diagnóstico → naranja energía
   · Sin postprocesado: bloom falso con sprites aditivos (perf móvil)
   ================================================================== */

import * as THREE from 'three';

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const isMobile = window.innerWidth < 768;

  /* Paleta compartida con el CSS */
  const PALETTE = {
    blue:   new THREE.Color(0x00B4D8),
    blueHi: new THREE.Color(0x48CAE4),
    orange: new THREE.Color(0xFF6B35),
    orangeHi: new THREE.Color(0xFF8A5C),
    board:  new THREE.Color(0x0A0E1A),
    copper: new THREE.Color(0x123047)
  };

  /* ============================================
     UTILIDADES DE TEXTURA (canvas 2D)
     ============================================ */

  /** Sprite radial blanco → transparente (para bloom falso) */
  const makeGlowTexture = (size = 64) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.65)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  /** Cara superior del chip: marco, micro-trazas y marca grabada */
  const makeChipFaceTexture = () => {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');

    ctx.clearRect(0, 0, S, S);

    // Marco con degradado azul → naranja
    const frame = ctx.createLinearGradient(0, 0, S, S);
    frame.addColorStop(0, '#48CAE4');
    frame.addColorStop(1, '#FF8A5C');
    ctx.strokeStyle = frame;
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(0,180,216,0.9)';
    ctx.shadowBlur = 18;
    const m = 34;
    ctx.strokeRect(m, m, S - m * 2, S - m * 2);

    // Micro-trazas internas (esquinas, quiebres a 45°)
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    const trace = (pts, color) => {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      // pad final
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pts[pts.length - 1][0], pts[pts.length - 1][1], 6, 0, Math.PI * 2);
      ctx.fill();
    };
    trace([[m, 120], [150, 120], [190, 160]], 'rgba(72,202,228,0.95)');
    trace([[m, 392], [130, 392], [170, 352]], 'rgba(72,202,228,0.8)');
    trace([[S - m, 150], [372, 150], [332, 190]], 'rgba(255,138,92,0.95)');
    trace([[S - m, 372], [382, 372], [342, 332]], 'rgba(255,138,92,0.8)');
    trace([[120, m], [120, 130]], 'rgba(72,202,228,0.6)');
    trace([[392, S - m], [392, 382]], 'rgba(255,138,92,0.6)');

    // Marca central
    ctx.shadowBlur = 26;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,180,216,0.95)';
    ctx.fillStyle = '#EAF7FC';
    ctx.font = '700 92px "Space Grotesk", "Inter", sans-serif';
    ctx.fillText('CR', S / 2, S / 2 - 26);
    ctx.shadowColor = 'rgba(255,107,53,0.9)';
    ctx.fillStyle = '#FFD9C4';
    ctx.font = '500 30px "JetBrains Mono", monospace';
    ctx.fillText('CODE · REPAIR', S / 2, S / 2 + 52);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  };

  /* Texturas compartidas entre escenas */
  const glowTex = makeGlowTexture();

  /* ============================================
     SHADER DE PUNTOS (tamaño y color por vértice)
     ============================================ */
  const makePointsMaterial = (texture) => new THREE.ShaderMaterial({
    uniforms: { uTex: { value: texture } },
    vertexShader: /* glsl */`
      attribute float aSize;
      attribute vec3  aColor;
      varying   vec3  vColor;
      void main() {
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (280.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex;
      varying vec3 vColor;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(vColor, 1.0) * t;
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  /* ============================================
     CONSTRUCTORES DE MUNDO
     ============================================ */

  /** Chip central (cuerpo, pines, cara grabada, anillos orbitales) */
  const buildChip = (scale = 1) => {
    const group = new THREE.Group();
    const W = 2.4 * scale, H = 0.28 * scale;

    // Cuerpo
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, W),
      new THREE.MeshStandardMaterial({
        color: 0x0C1322, metalness: 0.72, roughness: 0.34,
        emissive: 0x03121C, emissiveIntensity: 0.6
      })
    );
    group.add(body);

    // Cara superior grabada (aditiva → parece emisiva)
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 0.94, W * 0.94),
      new THREE.MeshBasicMaterial({
        map: makeChipFaceTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    face.rotation.x = -Math.PI / 2;
    face.position.y = H / 2 + 0.002;
    group.add(face);

    // Pines perimetrales
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x2A3A52, metalness: 0.9, roughness: 0.35 });
    const pinGeo = new THREE.BoxGeometry(0.09 * scale, H * 0.5, 0.22 * scale);
    const perSide = 9;
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < perSide; i++) {
        const pin = new THREE.Mesh(pinGeo, pinMat);
        const off = -W / 2 + (i + 0.5) * (W / perSide);
        const d = W / 2 + 0.11 * scale;
        if (s === 0) pin.position.set(off, -H * 0.15, d);
        if (s === 1) pin.position.set(off, -H * 0.15, -d);
        if (s === 2) { pin.position.set(d, -H * 0.15, off); pin.rotation.y = Math.PI / 2; }
        if (s === 3) { pin.position.set(-d, -H * 0.15, off); pin.rotation.y = Math.PI / 2; }
        group.add(pin);
      }
    }

    // Anillos orbitales (eco del loader)
    const mkRing = (r, color, tilt) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.014 * scale, 8, 96),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.55,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2 + tilt;
      group.add(ring);
      return ring;
    };
    const ringA = mkRing(2.1 * scale, PALETTE.blueHi, 0.22);
    const ringB = mkRing(2.55 * scale, PALETTE.orange, -0.16);

    return { group, face, ringA, ringB };
  };

  /**
   * Trazas PCB procedurales: parten de los pines del chip hacia afuera,
   * con quiebres a 45° (como un circuito real). Devuelve polilíneas
   * (para animar pulsos) y la geometría de líneas.
   */
  const buildTraces = (count, chipHalf) => {
    const polylines = [];
    const linePositions = [];
    const lineColors = [];
    const viaPositions = [];
    const viaColors = [];
    const Y = 0.015;
    const rng = (a, b) => a + Math.random() * (b - a);

    for (let i = 0; i < count; i++) {
      const side = i % 4;                        // N, S, E, O
      const lane = rng(-chipHalf * 0.85, chipHalf * 0.85);
      const dir = new THREE.Vector3(
        side === 2 ? 1 : side === 3 ? -1 : 0, 0,
        side === 0 ? 1 : side === 1 ? -1 : 0
      );
      const perp = new THREE.Vector3(dir.z, 0, -dir.x);

      const pts = [];
      let p = new THREE.Vector3()
        .addScaledVector(dir, chipHalf + 0.12)
        .addScaledVector(perp, lane);
      p.y = Y;
      pts.push(p.clone());

      // 2–3 tramos: recto → diagonal 45° → recto
      p = p.clone().addScaledVector(dir, rng(0.7, 2.2)); pts.push(p.clone());
      const sign = Math.random() > 0.5 ? 1 : -1;
      const diag = rng(0.5, 1.6);
      p = p.clone().addScaledVector(dir, diag).addScaledVector(perp, diag * sign);
      pts.push(p.clone());
      p = p.clone().addScaledVector(dir, rng(0.8, 3.2)); pts.push(p.clone());
      if (Math.random() > 0.55) {
        const d2 = rng(0.4, 1.1);
        p = p.clone().addScaledVector(dir, d2).addScaledVector(perp, -d2 * sign);
        pts.push(p.clone());
        p = p.clone().addScaledVector(dir, rng(0.6, 2.0));
        pts.push(p.clone());
      }

      // Longitudes acumuladas (para recorrer pulsos)
      const cum = [0];
      for (let j = 1; j < pts.length; j++) {
        cum.push(cum[j - 1] + pts[j].distanceTo(pts[j - 1]));
      }
      polylines.push({ pts, cum, total: cum[cum.length - 1] });

      // Segmentos de línea + color por lado (E/O naranja, N/S azul)
      const base = (side >= 2 ? PALETTE.copper.clone().lerp(PALETTE.orange, 0.35)
                              : PALETTE.copper.clone().lerp(PALETTE.blue, 0.4));
      for (let j = 0; j < pts.length - 1; j++) {
        linePositions.push(pts[j].x, pts[j].y, pts[j].z, pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
        const fade = 1 - (j / pts.length) * 0.45;
        const c1 = base.clone().multiplyScalar(fade);
        lineColors.push(c1.r, c1.g, c1.b, c1.r, c1.g, c1.b);
      }

      // Via (pad) al final
      const end = pts[pts.length - 1];
      viaPositions.push(end.x, end.y + 0.001, end.z);
      const vc = side >= 2 ? PALETTE.orange : PALETTE.blue;
      viaColors.push(vc.r * 0.8, vc.g * 0.8, vc.b * 0.8);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));

    const viaGeo = new THREE.BufferGeometry();
    viaGeo.setAttribute('position', new THREE.Float32BufferAttribute(viaPositions, 3));
    viaGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(viaColors, 3));
    viaGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(
      new Array(count).fill(0).map(() => rng(0.07, 0.12)), 1));
    const vias = new THREE.Points(viaGeo, makePointsMaterial(glowTex));

    return { polylines, lines, vias };
  };

  /** Pool de pulsos de luz que recorren las trazas (cabeza + estela) */
  const buildPulses = (polylines, count) => {
    const N = count * 2; // cabeza + estela por pulso
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const sizes = new Float32Array(N);

    const pulses = [];
    for (let i = 0; i < count; i++) {
      pulses.push({
        trace: (Math.random() * polylines.length) | 0,
        offset: Math.random() * 40,
        speed: 0.9 + Math.random() * 1.8,
        warm: Math.random() // 0 = azul, 1 = naranja
      });
      sizes[i * 2] = 0.16;       // cabeza
      sizes[i * 2 + 1] = 0.30;   // estela (halo suave)
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    const points = new THREE.Points(geo, makePointsMaterial(glowTex));
    points.frustumCulled = false;

    const tmp = new THREE.Vector3();
    const cHead = new THREE.Color(), cTail = new THREE.Color();

    /** warmBias ∈ [0,1]: gradación de color por sección */
    const update = (time, warmBias) => {
      for (let i = 0; i < count; i++) {
        const p = pulses[i];
        const line = polylines[p.trace];
        const distHead = (time * p.speed + p.offset) % line.total;
        const distTail = Math.max(0, distHead - 0.28);

        const sample = (dist, out) => {
          let j = 1;
          while (j < line.cum.length - 1 && line.cum[j] < dist) j++;
          const segT = (dist - line.cum[j - 1]) / (line.cum[j] - line.cum[j - 1] || 1);
          out.lerpVectors(line.pts[j - 1], line.pts[j], segT);
        };

        sample(distHead, tmp);
        positions[i * 6] = tmp.x; positions[i * 6 + 1] = tmp.y + 0.02; positions[i * 6 + 2] = tmp.z;
        sample(distTail, tmp);
        positions[i * 6 + 3] = tmp.x; positions[i * 6 + 4] = tmp.y + 0.02; positions[i * 6 + 5] = tmp.z;

        const w = THREE.MathUtils.clamp(p.warm * 0.5 + warmBias * 0.7, 0, 1);
        cHead.copy(PALETTE.blueHi).lerp(PALETTE.orangeHi, w);
        cTail.copy(cHead).multiplyScalar(0.32);
        colors[i * 6] = cHead.r; colors[i * 6 + 1] = cHead.g; colors[i * 6 + 2] = cHead.b;
        colors[i * 6 + 3] = cTail.r; colors[i * 6 + 4] = cTail.g; colors[i * 6 + 5] = cTail.b;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
    };

    return { points, update };
  };

  /** Polvo de datos: partículas flotando sobre la placa */
  const buildDust = (count) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = Math.random() * 7 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26;
      c.copy(Math.random() > 0.7 ? PALETTE.orange : PALETTE.blue)
        .multiplyScalar(0.16 + Math.random() * 0.3);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      sizes[i] = 0.03 + Math.random() * 0.07;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return new THREE.Points(geo, makePointsMaterial(glowTex));
  };

  /* ============================================
     ESCENA PRINCIPAL — recorrido cinematográfico
     ============================================ */
  const initCinematicWorld = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0A0E1A, 0.052);

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 80);

    // Iluminación: fría por un flanco, cálida por el otro
    scene.add(new THREE.AmbientLight(0x223048, 0.9));
    const keyBlue = new THREE.PointLight(0x00B4D8, 26, 30);
    keyBlue.position.set(-5, 5, 4);
    scene.add(keyBlue);
    const keyOrange = new THREE.PointLight(0xFF6B35, 20, 26);
    keyOrange.position.set(5, 3.4, -3);
    scene.add(keyOrange);

    // Mundo
    const chip = buildChip(1);
    scene.add(chip.group);

    const traces = buildTraces(isMobile ? 30 : 56, 1.2);
    scene.add(traces.lines, traces.vias);

    const pulses = buildPulses(traces.polylines, isMobile ? 22 : 56);
    scene.add(pulses.points);

    const dust = buildDust(isMobile ? 320 : 750);
    scene.add(dust);

    /* --- Guion de cámara (keyframe por sección) --- */
    const SECTION_IDS = ['hero', 'empresa-info', 'servicios', 'como-funciona', 'contacto'];
    const camKeys = [
      { pos: new THREE.Vector3(4.4, 2.5, 5.8),   look: new THREE.Vector3(0, 0.45, 0) },  // Hero: 3/4 dramático
      { pos: new THREE.Vector3(-5.2, 3.4, 4.4),  look: new THREE.Vector3(-0.4, 0.2, 0) },// Nosotros: barrido lateral
      { pos: new THREE.Vector3(-6.2, 5.8, -2.4), look: new THREE.Vector3(0, 0, 0) },     // Servicios: órbita elevada
      { pos: new THREE.Vector3(0.6, 9.2, 1.4),   look: new THREE.Vector3(0, 0, 0) },     // Proceso: cenital (la placa como mapa)
      { pos: new THREE.Vector3(0, 1.7, 7.4),     look: new THREE.Vector3(0, 0.6, 0) }    // Contacto: frontal, en calma
    ];
    const warmKeys = [0.25, 0.15, 0.75, 0.5, 0.35]; // balance azul↔naranja por sección
    const posCurve = new THREE.CatmullRomCurve3(camKeys.map(k => k.pos), false, 'centripetal', 0.4);
    const lookCurve = new THREE.CatmullRomCurve3(camKeys.map(k => k.look), false, 'centripetal', 0.4);

    let breakpoints = [];
    const computeBreakpoints = () => {
      breakpoints = SECTION_IDS.map(id => {
        const el = document.getElementById(id);
        return el ? Math.max(0, el.offsetTop - window.innerHeight * 0.25) : 0;
      });
    };
    computeBreakpoints();

    /** Scroll → u ∈ [0,1] (interpolación por tramos entre secciones) */
    const scrollToU = (s) => {
      const n = breakpoints.length;
      if (s <= breakpoints[0]) return 0;
      for (let i = 0; i < n - 1; i++) {
        if (s < breakpoints[i + 1]) {
          const t = (s - breakpoints[i]) / (breakpoints[i + 1] - breakpoints[i] || 1);
          return (i + t) / (n - 1);
        }
      }
      return 1;
    };

    /* --- Estado de entrada --- */
    let scrollTarget = window.scrollY, scrollSmooth = scrollTarget;
    let mouseX = 0, mouseY = 0, mouseSX = 0, mouseSY = 0;
    window.addEventListener('scroll', () => { scrollTarget = window.scrollY; }, { passive: true });
    if (!isTouch) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      computeBreakpoints();
    });

    // Recalcular anclas cuando cargan fuentes/imágenes y cambia el layout
    window.addEventListener('load', computeBreakpoints, { once: true });

    /* --- Bucle de render --- */
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    const fogCold = new THREE.Color(0x0A1220);
    const fogWarm = new THREE.Color(0x160E0C);
    let rafId = 0;
    let running = true;

    const renderFrame = (time) => {
      const t = time * 0.001;

      // Scroll y mouse amortiguados (sensación cinematográfica)
      scrollSmooth += (scrollTarget - scrollSmooth) * 0.065;
      mouseSX += (mouseX - mouseSX) * 0.05;
      mouseSY += (mouseY - mouseSY) * 0.05;

      const u = scrollToU(scrollSmooth);
      const warm = (() => {
        const n = warmKeys.length - 1;
        const f = u * n, i = Math.min(n - 1, f | 0);
        return THREE.MathUtils.lerp(warmKeys[i], warmKeys[i + 1], f - i);
      })();

      // Cámara sobre el rail + parallax sutil de mouse
      posCurve.getPoint(u, camPos);
      lookCurve.getPoint(u, camLook);
      camPos.x += mouseSX * 0.45;
      camPos.y += -mouseSY * 0.3;
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // Gradación de color por sección
      scene.fog.color.copy(fogCold).lerp(fogWarm, warm);
      keyBlue.intensity = 26 * (1.15 - warm * 0.55);
      keyOrange.intensity = 20 * (0.55 + warm * 0.85);

      // Vida del mundo
      pulses.update(t, warm);
      chip.face.material.opacity = 0.78 + Math.sin(t * 1.6) * 0.18;
      chip.ringA.rotation.z = t * 0.22;
      chip.ringB.rotation.z = -t * 0.16;
      chip.group.position.y = Math.sin(t * 0.7) * 0.05;
      dust.rotation.y = t * 0.014;

      renderer.render(scene, camera);
      if (running && !prefersReducedMotion) rafId = requestAnimationFrame(renderFrame);
    };

    if (prefersReducedMotion) {
      // Fotograma fijo digno: sin animación, pero con mundo visible
      pulses.update(4, 0.35);
      renderFrame(0);
      window.addEventListener('scroll', () => renderFrame(0), { passive: true });
      window.addEventListener('resize', () => renderFrame(0));
    } else {
      rafId = requestAnimationFrame(renderFrame);
      document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) rafId = requestAnimationFrame(renderFrame);
        else cancelAnimationFrame(rafId);
      });
    }
  };

  /* ============================================
     ESCENA SERVICIOS — módulo por servicio
     (mini chip que cambia de energía según la
      tarjeta activa en el stack)
     ============================================ */
  const initServices3D = () => {
    const canvas = document.getElementById('scene-canvas');
    const stage = document.getElementById('servicesStage');
    if (!canvas || !stage) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    stage.classList.add('has-3d'); // oculta el orbe CSS de respaldo
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(2.6, 2.1, 3.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x223048, 1.1));
    const lightA = new THREE.PointLight(0x00B4D8, 14, 18);
    lightA.position.set(-3, 3, 2);
    scene.add(lightA);
    const lightB = new THREE.PointLight(0xFF6B35, 10, 16);
    lightB.position.set(3, 2, -2);
    scene.add(lightB);

    const chip = buildChip(0.62);
    scene.add(chip.group);

    const dust = buildDust(120);
    dust.scale.setScalar(0.35);
    scene.add(dust);

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };
    resize();
    new ResizeObserver(resize).observe(stage);

    // Servicio activo según scroll de tarjetas
    const labelEl = document.getElementById('stageLabel');
    const services = [
      { label: '01 · Inventario',     warm: 0.15 },
      { label: '02 · Contable',       warm: 0.85 },
      { label: '03 · Restaurantes',   warm: 0.35 },
      { label: '04 · Automatización', warm: 0.65 }
    ];
    let activeIndex = 0, warmCurrent = services[0].warm;

    const updateActive = () => {
      const cards = document.querySelectorAll('.service-card');
      let idx = 0;
      cards.forEach((card, i) => {
        if (card.getBoundingClientRect().top < window.innerHeight * 0.55) idx = i;
      });
      if (idx !== activeIndex && services[idx]) {
        activeIndex = idx;
        if (labelEl) labelEl.textContent = services[idx].label;
      }
    };

    const ringColorA = new THREE.Color(), ringColorB = new THREE.Color();
    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) * 0.001;
      updateActive();

      warmCurrent += ((services[activeIndex] || services[0]).warm - warmCurrent) * 0.04;
      ringColorA.copy(PALETTE.blueHi).lerp(PALETTE.orangeHi, warmCurrent);
      ringColorB.copy(PALETTE.orangeHi).lerp(PALETTE.blueHi, warmCurrent);
      chip.ringA.material.color.copy(ringColorA);
      chip.ringB.material.color.copy(ringColorB);
      lightA.intensity = 14 * (1.1 - warmCurrent * 0.5);
      lightB.intensity = 10 * (0.5 + warmCurrent * 0.9);

      chip.group.rotation.y = t * 0.3;
      chip.ringA.rotation.z = t * 0.4;
      chip.ringB.rotation.z = -t * 0.3;
      chip.face.material.opacity = 0.8 + Math.sin(t * 2) * 0.15;
      dust.rotation.y = t * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    if (!prefersReducedMotion) animate();
    else { updateActive(); renderer.render(scene, camera); }
  };

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
     CURSOR PERSONALIZADO (solo escritorio)
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
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (label) label.style.transform = `translate(${mx}px, ${ry}px) translate(-50%, -50%) translateY(35px)`;
      requestAnimationFrame(animate);
    };
    animate();

    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');
        if (label) label.textContent = el.dataset.cursor;
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  };

  /* ============================================
     PARALLAX 2D DEL HERO
     ============================================ */
  const initHeroParallax = () => {
    const scene = document.getElementById('heroShapes');
    const hero = document.getElementById('hero');
    if (!scene || !hero) return;

    const shapes = scene.querySelectorAll('[data-depth]');
    const snippets = document.querySelectorAll('.code-snippet');
    let mouseX = 0, mouseY = 0, rect = hero.getBoundingClientRect();

    window.addEventListener('resize', () => { rect = hero.getBoundingClientRect(); });
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const animate = () => {
      rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = Math.max(0, -rect.top / rect.height);
        shapes.forEach((s) => {
          const d = parseFloat(s.dataset.depth) || 1;
          s.style.transform =
            `translate3d(0, ${progress * -150 * d}px, ${d * 80}px)` +
            ` rotateX(${mouseY * -10 * (d / 3)}deg) rotateY(${mouseX * 14 * (d / 3)}deg)`;
        });
        snippets.forEach((s) => {
          const d = parseFloat(s.dataset.depth) || 1;
          s.style.transform =
            `translate3d(0, ${progress * -100 * d}px, ${d * 30}px)` +
            ` rotateX(${mouseY * -4}deg) rotateY(${mouseX * 6}deg)`;
        });
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  /* ============================================
     TARJETAS TILT
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
        card.style.transform =
          `perspective(1200px) rotateX(${(0.5 - py) * 18}deg) rotateY(${(px - 0.5) * 18}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  };

  /* ============================================
     BOTONES MAGNÉTICOS
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
     CONTADORES
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
     NAVEGACIÓN
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
     VOLVER ARRIBA
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
     FORMULARIO (Web3Forms)
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
     BARRAS DE ESTADÍSTICAS
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
     PROCESO — stack fijado
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
      const progress = Math.min(1, Math.max(0, -rect.top) / totalH);
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
     ARRANQUE
     ============================================ */
  const init = () => {
    initLoader();
    initCursor();
    initNav();
    initCinematicWorld();

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
