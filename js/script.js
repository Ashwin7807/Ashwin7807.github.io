import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   BOOT SEQUENCE
   ========================================================= */
const boot = document.getElementById('boot-screen');
setTimeout(() => {
  boot.classList.add('is-hidden');
}, prefersReducedMotion ? 100 : 2100);

/* =========================================================
   FOOTER YEAR
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   HERO NAME — DecryptedText scramble-reveal (letter-by-letter, controlled speed)
   ========================================================= */
(() => {
  const container = document.getElementById('decrypted-name');
  const dot = document.getElementById('hero-dot');
  if (!container) return;

  const text = container.dataset.text || 'Ashwin';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+{}[]<>';
  const delayStart = prefersReducedMotion ? 100 : 2200;

  function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function render(revealedCount, currentScramble) {
    container.innerHTML = '';
    text.split('').forEach((realChar, i) => {
      const span = document.createElement('span');
      if (i < revealedCount) {
        span.className = 'decrypted-char revealed';
        span.textContent = realChar;
      } else if (i === revealedCount) {
        span.className = 'decrypted-char encrypted';
        span.textContent = currentScramble || getRandomChar();
      } else {
        span.className = 'decrypted-char encrypted';
        span.textContent = getRandomChar();
      }
      container.appendChild(span);
    });
  }

  // Pre-render scrambled placeholders
  render(0, '');

  setTimeout(() => {
    let revealedCount = 0;
    let scrambleFrame = 0;
    const framesPerLetter = 4; // 4 frames of scrambling per character (fast, clean reveal)
    const intervalMs = 40; // 40ms between frames

    const interval = setInterval(() => {
      if (revealedCount >= text.length) {
        clearInterval(interval);
        container.innerHTML = '';
        text.split('').forEach((realChar) => {
          const span = document.createElement('span');
          span.className = 'decrypted-char revealed';
          span.textContent = realChar;
          container.appendChild(span);
        });
        if (dot) dot.style.opacity = '1';
        return;
      }

      render(revealedCount, getRandomChar());
      scrambleFrame++;

      if (scrambleFrame >= framesPerLetter) {
        scrambleFrame = 0;
        revealedCount++;
      }
    }, intervalMs);
  }, delayStart);
})();

/* =========================================================
   ROLLING TEXT
   ========================================================= */
(() => {
  const lines = document.querySelectorAll('.rolling-line');
  if (!lines.length) return;
  let i = 0;
  setInterval(() => {
    lines[i].classList.remove('is-active');
    i = (i + 1) % lines.length;
    lines[i].classList.add('is-active');
  }, 2600);
})();

/* =========================================================
   TIME-ZONE AWARE GREETING (uses the VISITOR'S local clock)
   ========================================================= */
(() => {
  const el = document.getElementById('cat-greeting');
  if (!el) return;
  const hour = new Date().getHours();
  let msg;
  if (hour >= 5 && hour < 12) msg = "Good morning! Rise & secure ☀️";
  else if (hour >= 12 && hour < 17) msg = "Good afternoon! Stay sharp 🐾";
  else if (hour >= 17 && hour < 21) msg = "Good evening! Nice of you to drop by 🌙";
  else msg = "Up late? Get some rest, hacker 😽";
  el.textContent = msg;
})();

/* =========================================================
   ID CARD & SKILL TAB CARDS — Single Touch / Click 180° Flip
   ========================================================= */
(() => {
  // Photo ID Card
  const idCard = document.getElementById('id-card');
  if (idCard) {
    let busy = false;
    const flipIdCard = (e) => {
      if (e) { e.preventDefault(); }
      if (busy) return;
      busy = true;
      idCard.classList.toggle('is-flipped');
      setTimeout(() => { busy = false; }, 420);
    };
    idCard.addEventListener('click', flipIdCard);
    idCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { flipIdCard(e); }
    });
  }

  // Skill tab cards
  document.querySelectorAll('.skill-flip-card').forEach(card => {
    let busy = false;
    const flipSkillCard = (e) => {
      if (e) { e.preventDefault(); }
      if (busy) return;
      busy = true;
      card.classList.toggle('is-flipped');
      setTimeout(() => { busy = false; }, 420);
    };
    card.addEventListener('click', flipSkillCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { flipSkillCard(e); }
    });
  });
})();

/* =========================================================
   LANGUAGE CHIPS TOOLTIP
   ========================================================= */
(() => {
  const tooltip = document.getElementById('lang-tooltip');
  if (!tooltip) return;
  const defaultText = 'Hover or tap a language or tool chip above to see details.';
  tooltip.textContent = defaultText;

  document.querySelectorAll('.lang-chip').forEach(chip => {
    const desc = chip.dataset.desc;
    if (!desc) return;
    chip.addEventListener('mouseenter', () => { tooltip.textContent = desc; });
    chip.addEventListener('mouseleave', () => { tooltip.textContent = defaultText; });
    chip.addEventListener('focus', () => { tooltip.textContent = desc; });
    chip.addEventListener('blur', () => { tooltip.textContent = defaultText; });
  });
})();

/* =========================================================
   NEON BORDER — animated amber glow arc around elements
   Converted from React/Originkit NeonBorder to vanilla JS canvas
   ========================================================= */
(() => {
  if (prefersReducedMotion) return;

  const SPEED = 16; // 1–20
  const BORDER_SIZE = 55; // arc length percent
  const GLOW_LAYERS = [
    { blur: 8, opacity: 0.55, reach: 0.3 },
    { blur: 18, opacity: 0.3,  reach: 0.6 },
    { blur: 48, opacity: 0.15, reach: 1.0 },
  ];
  const SLOWEST_CYCLE = 30;
  const FASTEST_CYCLE = 4;

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3
      ? h.split('').map(c => c+c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function perimeterPoint(u, w, h) {
    const d = (((u % 1) + 1) % 1) * 2 * (w + h);
    if (d < w)         return [d, 0];
    if (d < w + h)     return [w, d - w];
    if (d < w * 2 + h) return [w - (d - w - h), h];
    return [0, h - (d - w * 2 - h)];
  }

  function perimeterAngle(u, w, h) {
    const [x, y] = perimeterPoint(u, w, h);
    return (Math.atan2(x - w/2, h/2 - y) * 180) / Math.PI;
  }

  function cornerLap(k, w, h) {
    const p = 2 * (w + h);
    const at = [0, w/p, (w+h)/p, (w*2+h)/p];
    return Math.floor(k/4) + at[((k%4)+4)%4];
  }

  function withAlpha(r, g, b, a) {
    return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,a)).toFixed(3)})`;
  }

  function drawArc(ctx, lap, bsPct, W, H, rgb, thick, glow) {
    const span = Math.max(0.015, (bsPct / 100) * 0.5);
    const ARC_S = 20;
    let base = 0, prev = 0, acc = 0;
    const solidT = bsPct / 100;

    // Build gradient stops
    const stops = [];
    for (let i = 0; i <= ARC_S; i++) {
      const f = i / ARC_S;
      const angle = perimeterAngle(lap + (f - 0.5) * span, W, H);
      if (i === 0) { base = angle; }
      else {
        let d = angle - prev;
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        acc += d;
      }
      prev = angle;
      const t = Math.abs(f - 0.5) * 2;
      const k = solidT >= 1 ? 1 : t <= solidT ? 1 : 1 - (t - solidT) / (1 - solidT);
      const alpha = k * k * (3 - 2 * k);
      stops.push({ angle: acc, alpha });
    }
    stops.push({ angle: acc, alpha: 0 });
    stops.push({ angle: 360, alpha: 0 });

    // Draw main arc band
    const gradient = ctx.createConicGradient ? null : null; // fallback
    // Use manual arc segments since createConicGradient support varies
    const cx2 = W / 2, cy2 = H / 2;
    const perimeter = 2 * (W + H);
    const [r, g, b] = rgb;

    // Draw border segments
    ctx.save();
    ctx.lineWidth = thick;
    for (let i = 0; i < stops.length - 1; i++) {
      const { angle: a0, alpha: al0 } = stops[i];
      const { angle: a1, alpha: al1 } = stops[i+1];
      if (al0 <= 0.001 && al1 <= 0.001) continue;
      // Find perimeter position for this angle segment
      const f0 = i / ARC_S, f1 = (i+1) / ARC_S;
      const u0 = lap + (f0 - 0.5) * span;
      const u1 = lap + (f1 - 0.5) * span;
      const [x0, y0] = perimeterPoint(u0, W, H);
      const [x1, y1] = perimeterPoint(u1, W, H);
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, withAlpha(r, g, b, al0));
      grad.addColorStop(1, withAlpha(r, g, b, al1));
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = grad;
      ctx.stroke();

      // Glow layers
      if (glow > 0) {
        GLOW_LAYERS.forEach(layer => {
          ctx.save();
          ctx.shadowColor = withAlpha(r, g, b, layer.opacity * (al0 + al1) / 2);
          ctx.shadowBlur = layer.blur;
          ctx.lineWidth = thick + layer.reach * 10;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.strokeStyle = withAlpha(r, g, b, layer.opacity * (al0 + al1) / 2 * glow);
          ctx.stroke();
          ctx.restore();
        });
      }
    }
    ctx.restore();
  }

  function initNeonCanvas(canvas) {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const colorHex = canvas.dataset.neonColor || '#C9965A';
    const rgb = hexToRgb(colorHex);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let lap = 0, corner = 0, stepT = 0;
    let last = performance.now();

    function resize() {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const beat = (SLOWEST_CYCLE + ((FASTEST_CYCLE - SLOWEST_CYCLE) * (SPEED - 1)) / 19) / 4;
      stepT += dt / beat;
      while (stepT >= 1) { stepT -= 1; corner += 1; }
      const eased = stepT * stepT * (3 - 2 * stepT); // smooth step
      const from = cornerLap(corner, W, H);
      const to   = cornerLap(corner + 1, W, H);
      lap = from + (to - from) * eased;

      ctx.clearRect(0, 0, W, H);
      // Draw two arcs 180° apart for symmetric glow
      drawArc(ctx, lap,       BORDER_SIZE, W, H, rgb, 2, 1);
      drawArc(ctx, lap + 0.5, BORDER_SIZE, W, H, rgb, 2, 1);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.querySelectorAll('canvas.neon-canvas').forEach(initNeonCanvas);
})();


/* =========================================================
   CURSOR-REACTIVE GRID BACKGROUND (CursorGrid)
   ========================================================= */
(() => {
  const container = document.getElementById('cursor-grid');
  if (!container) return;
  const canvas = container.querySelector('.cursor-grid__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const cfg = {
    cellSize: 75, color: '#C9965A', radius: 130,
    falloff: 'smooth', holdTime: 350, fadeDuration: 700,
    lineWidth: 1.0, maxOpacity: 0.38, fillOpacity: 0,
    gridOpacity: 0, cellRadius: 0, clickPulse: true, pulseSpeed: 550
  };

  const FALLOFF = { linear: t => t, smooth: t => t * t * (3 - 2 * t), sharp: t => t * t * t };
  const hx = cfg.color.replace('#', '');
  const cR = parseInt(hx.slice(0, 2), 16);
  const cG = parseInt(hx.slice(2, 4), 16);
  const cB = parseInt(hx.slice(4, 6), 16);

  let cols = 0, rows = 0, offX = 0, offY = 0;
  let alphas, touched, gw = 0, gh = 0;
  const pulses = [];
  let raf = 0, running = false, lastFrame = 0;

  function rebuild() {
    gw = window.innerWidth; gh = window.innerHeight;
    canvas.width = Math.max(1, Math.round(gw * dpr));
    canvas.height = Math.max(1, Math.round(gh * dpr));
    canvas.style.width = gw + 'px';
    canvas.style.height = gh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(gw / cfg.cellSize) + 1;
    rows = Math.ceil(gh / cfg.cellSize) + 1;
    offX = (gw - cols * cfg.cellSize) / 2;
    offY = (gh - rows * cfg.cellSize) / 2;
    alphas = new Float32Array(cols * rows);
    touched = new Float64Array(cols * rows);
  }

  function cellCenter(i) {
    return [
      offX + (i % cols) * cfg.cellSize + cfg.cellSize / 2,
      offY + Math.floor(i / cols) * cfg.cellSize + cfg.cellSize / 2
    ];
  }

  function energize(x, y) {
    const r = Math.max(cfg.radius, 1);
    const ease = FALLOFF[cfg.falloff] || FALLOFF.linear;
    const now = performance.now();
    const mc1 = Math.max(0, Math.floor((x - r - offX) / cfg.cellSize));
    const mc2 = Math.min(cols - 1, Math.floor((x + r - offX) / cfg.cellSize));
    const mr1 = Math.max(0, Math.floor((y - r - offY) / cfg.cellSize));
    const mr2 = Math.min(rows - 1, Math.floor((y + r - offY) / cfg.cellSize));
    for (let row = mr1; row <= mr2; row++) {
      for (let col = mc1; col <= mc2; col++) {
        const i = row * cols + col;
        const [cx, cy] = cellCenter(i);
        const dist = Math.hypot(cx - x, cy - y);
        if (dist > r) continue;
        const level = ease(1 - dist / r) * cfg.maxOpacity;
        if (level > alphas[i]) { alphas[i] = level; touched[i] = now; }
        else if (level > 0) { touched[i] = now; }
      }
    }
  }

  function draw(now) {
    const dt = Math.min(now - lastFrame, 50);
    lastFrame = now;
    ctx.clearRect(0, 0, gw, gh);

    /* Click pulses */
    for (let pi = pulses.length - 1; pi >= 0; pi--) {
      const p = pulses[pi];
      const age = (now - p.t0) / 1000;
      const ringR = age * cfg.pulseSpeed;
      if (ringR > Math.hypot(gw, gh)) { pulses.splice(pi, 1); continue; }
      const band = cfg.cellSize;
      const pc1 = Math.max(0, Math.floor((p.x - ringR - band - offX) / cfg.cellSize));
      const pc2 = Math.min(cols - 1, Math.floor((p.x + ringR + band - offX) / cfg.cellSize));
      const pr1 = Math.max(0, Math.floor((p.y - ringR - band - offY) / cfg.cellSize));
      const pr2 = Math.min(rows - 1, Math.floor((p.y + ringR + band - offY) / cfg.cellSize));
      for (let row = pr1; row <= pr2; row++) {
        for (let col = pc1; col <= pc2; col++) {
          const i = row * cols + col;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - p.x, cy - p.y);
          if (Math.abs(dist - ringR) < band / 2 && cfg.maxOpacity > alphas[i]) {
            alphas[i] = cfg.maxOpacity; touched[i] = now;
          }
        }
      }
    }

    let anyVisible = pulses.length > 0;
    const fadeStep = dt / Math.max(cfg.fadeDuration, 16);
    const half = cfg.cellSize / 2;

    for (let i = 0; i < alphas.length; i++) {
      let a = alphas[i];
      if (a <= 0) continue;
      if (now - touched[i] > cfg.holdTime) {
        a = Math.max(0, a - fadeStep); alphas[i] = a;
        if (a <= 0) continue;
      }
      anyVisible = true;
      const [cx, cy] = cellCenter(i);
      const grad = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cfg.cellSize);
      grad.addColorStop(0, `rgba(${cR},${cG},${cB},${a})`);
      grad.addColorStop(1, `rgba(${cR},${cG},${cB},0)`);
      const x = cx - half + 0.5, y = cy - half + 0.5, s = cfg.cellSize - 1;
      ctx.beginPath();
      ctx.rect(x, y, s, s);
      if (cfg.fillOpacity > 0) {
        ctx.fillStyle = `rgba(${cR},${cG},${cB},${a * cfg.fillOpacity})`; ctx.fill();
      }
      ctx.strokeStyle = grad; ctx.lineWidth = cfg.lineWidth; ctx.stroke();
    }

    if (anyVisible) { raf = requestAnimationFrame(draw); }
    else { running = false; }
  }

  function wake() {
    if (running) return;
    running = true; lastFrame = performance.now();
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('pointermove', e => { energize(e.clientX, e.clientY); wake(); });
  window.addEventListener('pointerdown', e => {
    if (!cfg.clickPulse) return;
    pulses.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    wake();
  });

  window.addEventListener('resize', () => { rebuild(); wake(); });
  rebuild();
  if (!prefersReducedMotion) wake();
})();

/* =========================================================
   CURSOR EFFECT — classic arrow cursor + orbiting dot/bot + trailing hex glyphs
   ========================================================= */
(() => {
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch
  const canvas = document.getElementById('cursor-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  let mx = w / 2, my = h / 2;
  let clickPulse = 0;
  let botAngle = 0;
  const glyphs = [];
  const hexChars = '0123456789ABCDEF';
  let overInteractive = false;

  // Cursor trail & orbiting dot effects over normal cursor

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX * dpr;
    my = e.clientY * dpr;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    overInteractive = !!(target && target.closest('a, button, .id-card, .folder'));
    if (Math.random() < 0.35) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 12 * dpr;
      const pair = Math.random() < 0.3;
      glyphs.push({
        x: mx + Math.cos(angle) * spread,
        y: my + Math.sin(angle) * spread,
        ch: pair
          ? hexChars[Math.floor(Math.random() * hexChars.length)] + hexChars[Math.floor(Math.random() * hexChars.length)]
          : hexChars[Math.floor(Math.random() * hexChars.length)],
        life: 1,
        decay: 0.014 + Math.random() * 0.016,
        drift: (Math.random() - 0.5) * 0.4,
        size: (7 + Math.random() * 3.5) * dpr,
      });
    }
  });
  window.addEventListener('mousedown', () => { clickPulse = 1; });

  function drawBot(bx, by, size) {
    // Small orbiting dot/bot around the cursor
    const s = size * dpr;
    const col = overInteractive ? '224,184,112' : '201,150,90';
    ctx.save();
    ctx.translate(bx, by);
    // Bot head
    ctx.fillStyle = `rgba(${col},0.9)`;
    ctx.strokeStyle = `rgba(${col},1)`;
    ctx.lineWidth = 0.8 * dpr;
    ctx.beginPath();
    ctx.roundRect(-s * 0.5, -s * 0.7, s, s * 0.65, s * 0.15);
    ctx.fill();
    ctx.stroke();
    // eyes
    ctx.fillStyle = `rgba(18,14,10,0.95)`;
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.42, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.42, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // eye glow
    ctx.fillStyle = `rgba(${col},1)`;
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.42, s * 0.055, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.42, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = `rgba(${col},0.75)`;
    ctx.beginPath();
    ctx.roundRect(-s * 0.38, -s * 0.06, s * 0.76, s * 0.5, s * 0.1);
    ctx.fill();
    ctx.stroke();
    // antenna
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(0, -s * 1.0);
    ctx.strokeStyle = `rgba(${col},0.9)`;
    ctx.lineWidth = 0.8 * dpr;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -s * 1.05, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col},1)`;
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Orbiting dot / bot around normal system cursor
    botAngle += 0.045;
    const orbitR = 22 * dpr;
    const bx = mx + Math.cos(botAngle) * orbitR;
    const by = my + Math.sin(botAngle) * orbitR;
    drawBot(bx, by, 4.2);

    // click pulse — brief expanding ring
    if (clickPulse > 0) {
      ctx.beginPath();
      ctx.arc(mx + 4 * dpr, my + 4 * dpr, (1 - clickPulse) * 26 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(201,150,90,${clickPulse})`;
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
      clickPulse -= 0.05;
    }

    // trailing hex glyphs — soft glow, gentle upward drift
    for (let i = glyphs.length - 1; i >= 0; i--) {
      const g = glyphs[i];
      ctx.font = `${g.size}px 'JetBrains Mono', monospace`;
      ctx.shadowColor = 'rgba(198,166,100,0.6)';
      ctx.shadowBlur = 4 * dpr;
      ctx.fillStyle = `rgba(210,198,178,${g.life * 0.55})`;
      ctx.fillText(g.ch, g.x + 18 * dpr, g.y - 18 * dpr);
      ctx.shadowBlur = 0;
      g.life -= g.decay;
      g.y -= 0.3 * dpr;
      g.x += g.drift;
      if (g.life <= 0) glyphs.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }
  if (!prefersReducedMotion) draw();
})();

/* =========================================================
   UNIVERSE / STARS BACKGROUND — floating star particles & slow nebula drift
   (replaces shield; uses Three.js for a beautiful cosmic atmosphere)
   ========================================================= */
(() => {
  if (prefersReducedMotion) return;

  const stage = document.getElementById('shield-stage');
  if (!stage) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.pointerEvents = 'none';
  stage.appendChild(renderer.domElement);

  // --- Star field layers (near, mid, far)
  function makeStars(count, spread, size, opacity, color) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i]     = (Math.random() - 0.5) * spread;
      pos[i + 1] = (Math.random() - 0.5) * spread;
      pos[i + 2] = (Math.random() - 0.5) * spread * 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }

  const starsFar  = makeStars(900,  60, 0.03, 0.5,  0x94A3B8);
  const starsMid  = makeStars(500,  45, 0.055, 0.65, 0xBAE6FD);
  const starsNear = makeStars(200,  30, 0.09,  0.8,  0xF0F9FF);
  scene.add(starsFar, starsMid, starsNear);

  // --- Wireframe icosahedron nebula sphere (subtle)
  const nebGeo = new THREE.IcosahedronGeometry(7, 1);
  const nebMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.055 });
  const nebula = new THREE.Mesh(nebGeo, nebMat);
  scene.add(nebula);

  // --- Outer orbiting ring of glow dots
  const ringGeo = new THREE.BufferGeometry();
  const ringCount = 80;
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const r = 5.5 + (Math.random() - 0.5) * 1.8;
    ringPos[i * 3]     = Math.cos(angle) * r;
    ringPos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
    ringPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.07, transparent: true, opacity: 0.55 });
  const ring = new THREE.Points(ringGeo, ringMat);
  scene.add(ring);

  // Second accent ring (gold)
  const ring2Geo = new THREE.BufferGeometry();
  const ring2Pos = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    const r = 4.2 + (Math.random() - 0.5) * 1.2;
    ring2Pos[i * 3]     = Math.cos(angle) * r;
    ring2Pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    ring2Pos[i * 3 + 2] = Math.sin(angle) * r;
  }
  ring2Geo.setAttribute('position', new THREE.BufferAttribute(ring2Pos, 3));
  const ring2Mat = new THREE.PointsMaterial({ color: 0xc6a664, size: 0.055, transparent: true, opacity: 0.45 });
  const ring2 = new THREE.Points(ring2Geo, ring2Mat);
  scene.add(ring2);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.0005;

    starsFar.rotation.y  = t * 0.3;
    starsMid.rotation.y  = t * 0.5;
    starsNear.rotation.y = t * 0.8;
    starsNear.rotation.x = Math.sin(t * 0.4) * 0.06;

    nebula.rotation.y = -t * 0.4;
    nebula.rotation.x = Math.sin(t * 0.3) * 0.08;

    ring.rotation.y  = t * 1.2;
    ring2.rotation.y = -t * 0.9;
    ring2.rotation.x = Math.sin(t * 0.6) * 0.1;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w2 = window.innerWidth;
    const h2 = window.innerHeight;
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    renderer.setSize(w2, h2);
  });
})();
