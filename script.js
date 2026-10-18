(function () {
  'use strict';

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TAU = Math.PI * 2;
  var PALETTE = ['#F3A6C6', '#E767A0', '#C2336F', '#B98ADB', '#8A3FB8', '#FFFFFF', '#FBD0E3'];

  /* How long the celebration plays before the love letter appears (milliseconds). */
  var LETTER_DELAY = 4200;

  function $(id) { return document.getElementById(id); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- Shapes ---------- */
  function drawHeart(c, s) {
    c.beginPath();
    c.moveTo(0, s * 0.35);
    c.bezierCurveTo(-s * 0.95, -s * 0.15, -s * 0.5, -s * 0.95, 0, -s * 0.4);
    c.bezierCurveTo(s * 0.5, -s * 0.95, s * 0.95, -s * 0.15, 0, s * 0.35);
    c.fill();
  }
  function drawPetal(c, s) {
    c.beginPath();
    c.moveTo(0, -s);
    c.bezierCurveTo(s * 0.85, -s * 0.5, s * 0.7, s * 0.6, 0, s);
    c.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.85, -s * 0.5, 0, -s);
    c.fill();
  }
  function drawButterfly(c, s, f, col) {
    var side;
    c.fillStyle = col;
    for (side = -1; side <= 1; side += 2) {
      c.save();
      c.scale(side * f, 1);
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(0, -s * 0.1);
      c.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.5, -s * 0.9, s * 1.2, -s * 0.1);
      c.bezierCurveTo(s * 1.1, s * 0.2, s * 0.4, s * 0.2, 0, 0);
      c.fill();
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(s * 0.8, s * 0.1, s * 1.1, s * 0.8, s * 0.6, s * 0.9);
      c.bezierCurveTo(s * 0.2, s * 1, 0, s * 0.4, 0, 0);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.beginPath();
      c.arc(s * 0.75, -s * 0.35, s * 0.18, 0, TAU);
      c.fill();
      c.restore();
    }
    c.fillStyle = '#3A1A4F';
    c.beginPath();
    c.ellipse(0, s * 0.1, s * 0.07, s * 0.5, 0, 0, TAU);
    c.fill();
    c.strokeStyle = '#3A1A4F';
    c.lineWidth = Math.max(1, s * 0.05);
    c.beginPath();
    c.moveTo(0, -s * 0.35);
    c.quadraticCurveTo(-s * 0.2, -s * 0.7, -s * 0.35, -s * 0.75);
    c.moveTo(0, -s * 0.35);
    c.quadraticCurveTo(s * 0.2, -s * 0.7, s * 0.35, -s * 0.75);
    c.stroke();
  }

  /* ---------- Canvas setup ---------- */
  var ambientCanvas = $('ambient');
  var fxCanvas = $('fx');
  var ax, fx;

  function sizeCanvas(c) {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(window.innerWidth * d);
    c.height = Math.round(window.innerHeight * d);
    var ctx = c.getContext('2d');
    ctx.setTransform(d, 0, 0, d, 0, 0);
    return ctx;
  }
  function resize() {
    ax = sizeCanvas(ambientCanvas);
    fx = sizeCanvas(fxCanvas);
    if (reduce) drawAmbient(0);
  }

  /* ---------- Ambient petals and butterflies ---------- */
  var petals = [];
  var flyers = [];
  var narrow = window.innerWidth < 600;
  var i;
  for (i = 0; i < (narrow ? 10 : 18); i++) {
    petals.push({
      x: rand(0, window.innerWidth), y: rand(0, window.innerHeight),
      s: rand(6, 12), vx: rand(-0.15, 0.15), vy: rand(0.3, 0.8),
      ph: rand(0, TAU), r: rand(0, TAU), vr: rand(-0.02, 0.02),
      c: pick(['#F3A6C6', '#FBD0E3', '#E767A0', '#D8B7F0'])
    });
  }
  for (i = 0; i < (narrow ? 3 : 5); i++) {
    flyers.push({
      x: rand(0, window.innerWidth), y: rand(0, window.innerHeight),
      s: rand(9, 15), a: rand(0, TAU), sp: rand(0.35, 0.7),
      t: rand(0, TAU), w: rand(0, TAU),
      c: pick(['#8A3FB8', '#E767A0', '#B98ADB', '#F08BB8'])
    });
  }

  var lastAmb = 0;
  function drawAmbient(dt) {
    var W = window.innerWidth, H = window.innerHeight;
    ax.clearRect(0, 0, W, H);
    petals.forEach(function (p) {
      p.ph += 0.02 * dt;
      p.x += (Math.sin(p.ph) * 0.5 + p.vx) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
      if (p.x > W + 20) p.x = -20;
      if (p.x < -20) p.x = W + 20;
      ax.save();
      ax.translate(p.x, p.y);
      ax.rotate(p.r);
      ax.globalAlpha = 0.6;
      ax.fillStyle = p.c;
      drawPetal(ax, p.s);
      ax.restore();
    });
    flyers.forEach(function (b) {
      b.t += 0.22 * dt;
      b.w += 0.012 * dt;
      b.a += Math.sin(b.w * 3) * 0.035 * dt;
      b.x += Math.cos(b.a) * b.sp * dt;
      b.y += Math.sin(b.a) * b.sp * dt * 0.7;
      if (b.x > W + 40) b.x = -40;
      if (b.x < -40) b.x = W + 40;
      if (b.y > H + 40) b.y = -40;
      if (b.y < -40) b.y = H + 40;
      ax.save();
      ax.translate(b.x, b.y);
      ax.rotate(b.a + Math.PI / 2);
      ax.globalAlpha = 0.85;
      drawButterfly(ax, b.s, 0.25 + 0.75 * Math.abs(Math.sin(b.t)), b.c);
      ax.restore();
    });
  }

  var ambRaf = 0;
  function ambTick(now) {
    var dt = Math.min((now - lastAmb) / 16.67, 3);
    lastAmb = now;
    drawAmbient(dt);
    ambRaf = requestAnimationFrame(ambTick);
  }
  function startAmbient() {
    if (reduce || ambRaf) return;
    lastAmb = performance.now();
    ambRaf = requestAnimationFrame(ambTick);
  }
  function stopAmbient() {
    if (ambRaf) { cancelAnimationFrame(ambRaf); ambRaf = 0; }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAmbient(); else startAmbient();
  });
  window.addEventListener('resize', resize);
  resize();
  if (!reduce) startAmbient();

  /* ---------- Celebration confetti ---------- */
  var P = [];
  var fxRunning = false;
  var lastFx = 0;

  function kind() {
    var r = Math.random();
    return r < 0.42 ? 'h' : (r < 0.82 ? 'p' : 'b');
  }
  function add(t, x, y, vx, vy, s) {
    P.push({ t: t, x: x, y: y, vx: vx, vy: vy, s: s, r: rand(0, TAU), vr: rand(-0.12, 0.12), c: pick(PALETTE), ph: rand(0, TAU), age: 0 });
  }
  function fxTick(now) {
    var dt = Math.min((now - lastFx) / 16.67, 3);
    var W = window.innerWidth, H = window.innerHeight;
    lastFx = now;
    fx.clearRect(0, 0, W, H);
    P.forEach(function (p) {
      p.age += dt;
      p.ph += 0.2 * dt;
      if (p.t === 'b') {
        p.vx += Math.sin(p.ph) * 0.05 * dt;
        p.vy += 0.015 * dt;
        p.vx *= Math.pow(0.97, dt);
        p.vy *= Math.pow(0.97, dt);
      } else {
        p.vy += 0.13 * dt;
        p.vx *= Math.pow(0.992, dt);
        p.vy *= Math.pow(0.992, dt);
        p.r += p.vr * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      fx.save();
      fx.translate(p.x, p.y);
      if (p.t === 'b') {
        fx.rotate(Math.sin(p.ph * 0.3) * 0.4);
        drawButterfly(fx, p.s, 0.25 + 0.75 * Math.abs(Math.sin(p.ph)), p.c === '#FFFFFF' ? '#B98ADB' : p.c);
      } else {
        fx.rotate(p.r);
        fx.fillStyle = p.c;
        fx.globalAlpha = 0.95;
        if (p.t === 'h') drawHeart(fx, p.s); else drawPetal(fx, p.s * 0.8);
      }
      fx.restore();
    });
    P = P.filter(function (p) { return p.y < H + 60 && p.y > -260 && p.age < 900; });
    if (P.length) {
      requestAnimationFrame(fxTick);
    } else {
      fxRunning = false;
      fx.clearRect(0, 0, W, H);
    }
  }
  function startFx() {
    fxRunning = true;
    lastFx = performance.now();
    requestAnimationFrame(fxTick);
  }
  function burst() {
    var W = window.innerWidth, H = window.innerHeight, n, left, ang, sp;
    if (reduce) return;
    for (n = 0; n < 70; n++) {
      left = n % 2 === 0;
      ang = left ? rand(-1.35, -0.8) : rand(-2.35, -1.8);
      sp = rand(9, 17);
      add(kind(), left ? W * 0.05 : W * 0.95, H, Math.cos(ang) * sp, Math.sin(ang) * sp, rand(7, 14));
    }
    setTimeout(function () {
      var k;
      for (k = 0; k < 60; k++) add(kind(), rand(0, W), -20, rand(-1, 1), rand(1, 3), rand(7, 14));
      if (!fxRunning) startFx();
    }, 700);
    setTimeout(function () {
      var k, a, s;
      for (k = 0; k < 50; k++) {
        a = rand(0, TAU); s = rand(3, 10);
        add(kind(), W / 2, H * 0.4, Math.cos(a) * s, Math.sin(a) * s - 2, rand(7, 14));
      }
      if (!fxRunning) startFx();
    }, 1500);
    if (!fxRunning) startFx();
  }

  /* ---------- Pet names ---------- */
  var names = ['Amaka My Sweet', 'Mummym', 'My Love', 'Omalicham'];
  var nameIdx = 0;
  var aka = $('aka');
  aka.textContent = names[0];
  setInterval(function () {
    aka.classList.add('swap');
    setTimeout(function () {
      nameIdx = (nameIdx + 1) % names.length;
      aka.textContent = names[nameIdx];
      aka.classList.remove('swap');
    }, 350);
  }, 2800);

  /* ---------- NO button ---------- */
  var noCount = 0;
  var noMessages = [
    'Hmm, I think that button is broken 😂',
    'Are you sure, Mummym? Think about it again.',
    'Omalicham, please. My heart is begging.',
    'The YES button is getting bigger. It knows something.',
    'Amaka My Sweet, I can wait here all day 😂',
    'Okay, I am taking the NO button away. It was never going to work ❤️'
  ];
  var yesBtn = $('yes');
  var noBtn = $('no');
  var noMsg = $('nomsg');

  noBtn.addEventListener('click', function () {
    var msg;
    noCount += 1;
    msg = noMessages[Math.min(noCount, noMessages.length) - 1];
    noMsg.textContent = msg;
    yesBtn.style.fontSize = Math.min(1.1 + noCount * 0.2, 2.3) + 'rem';
    noBtn.style.fontSize = Math.max(1.1 - noCount * 0.07, 0.75) + 'rem';
    noBtn.classList.remove('shake');
    void noBtn.offsetWidth;
    noBtn.classList.add('shake');
    if (noCount >= noMessages.length) noBtn.hidden = true;
  });

  /* ---------- YES flow: celebration, then the letter appears on its own ---------- */
  var ask = $('ask');
  var party = $('party');
  var letter = $('letter');
  var said = false;

  function revealLetter() {
    letter.hidden = false;
    letter.classList.add('show');
    letter.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  yesBtn.addEventListener('click', function () {
    if (said) return;
    said = true;
    ask.classList.add('leaving');
    setTimeout(function () {
      ask.hidden = true;
      party.hidden = false;
      window.scrollTo(0, 0);
      try { $('partyTitle').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      burst();
      setTimeout(revealLetter, reduce ? 600 : LETTER_DELAY);
    }, reduce ? 0 : 350);
  });

  $('again').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    burst();
  });
})();
