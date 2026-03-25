const revealBtn = document.getElementById('revealBtn');
const celebrateBtn = document.getElementById('celebrateBtn');
const note = document.getElementById('note');
const yearEl = document.getElementById('year');
const daysText = document.getElementById('daysText');
const sinceText = document.getElementById('sinceText');
const beatsText = document.getElementById('beatsText');
const heartsLayer = document.getElementById('hearts');

yearEl.textContent = new Date().getFullYear();

// Change this date if you want an exact anniversary start date:
const startDate = new Date('2024-07-07T00:00:00');

function fmtDate(d){
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysBetween(a, b){
  const ms = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(0, Math.floor((utcB - utcA) / ms));
}

function updateCounters(){
  const now = new Date();
  sinceText.textContent = fmtDate(startDate);

  const days = daysBetween(startDate, now);
  daysText.textContent = days.toLocaleString() + ' days';

  // Cute, symbolic counter (not real heartbeats)
  const beats = 200000 + days * 1234;
  beatsText.textContent = beats.toLocaleString();
}

updateCounters();
setInterval(updateCounters, 30_000);

revealBtn.addEventListener('click', () => {
  const willShow = note.hasAttribute('hidden');
  if (willShow) {
    note.removeAttribute('hidden');
    floatHeartsBurst(16);
  } else {
    note.setAttribute('hidden', '');
  }
});

celebrateBtn.addEventListener('click', () => {
  startConfetti(1800);
  floatHeartsBurst(22);
});

// Floating hearts background
function spawnHeart(){
  const el = document.createElement('div');
  el.className = 'heart';

  const x = Math.random() * 100;
  const size = 10 + Math.random() * 18;
  const duration = 6 + Math.random() * 6;
  const delay = Math.random() * 2;

  el.style.left = x + 'vw';
  el.style.bottom = '-30px';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.opacity = String(0.25 + Math.random() * 0.55);
  el.style.animation = `floatUp ${duration}s ease-in ${delay}s forwards`;

  // Slightly vary color
  const tint = 170 + Math.floor(Math.random() * 60);
  el.style.background = `rgba(255, ${tint}, ${tint + 30}, .55)`;

  heartsLayer.appendChild(el);

  const totalMs = (duration + delay) * 1000 + 100;
  window.setTimeout(() => el.remove(), totalMs);
}

function floatHeartsBurst(n){
  for (let i = 0; i < n; i++) {
    window.setTimeout(spawnHeart, i * 60);
  }
}

// gentle ambient hearts
setInterval(() => {
  if (document.hidden) return;
  spawnHeart();
}, 650);

// Confetti (simple canvas)
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let confetti = [];
let confettiAnimating = false;

function resize(){
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

function startConfetti(ms){
  const colors = ['#ff4fa7', '#ff86c8', '#ffd6ea', '#ffffff', '#ff2d8d'];
  const count = 160;
  confetti = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.3,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 5,
    r: 3 + Math.random() * 5,
    rot: Math.random() * Math.PI,
    vr: -0.15 + Math.random() * 0.3,
    c: colors[Math.floor(Math.random() * colors.length)],
    a: 0.8
  }));

  const endAt = performance.now() + ms;
  if (!confettiAnimating) {
    confettiAnimating = true;
    requestAnimationFrame(function tick(t){
      drawConfetti();
      stepConfetti();

      if (t < endAt) {
        requestAnimationFrame(tick);
      } else {
        // fade out
        const fadeEnd = t + 600;
        requestAnimationFrame(function fade(tt){
          drawConfetti();
          confetti.forEach(p => p.a = Math.max(0, p.a - 0.03));
          stepConfetti();
          if (tt < fadeEnd && confetti.some(p => p.a > 0)) requestAnimationFrame(fade);
          else {
            confetti = [];
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            confettiAnimating = false;
          }
        });
      }
    });
  }
}

function stepConfetti(){
  for (const p of confetti) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vy += 0.03; // gravity

    if (p.y > window.innerHeight + 40) {
      p.y = -30;
      p.x = Math.random() * window.innerWidth;
      p.vy = 2 + Math.random() * 5;
    }

    if (p.x < -40) p.x = window.innerWidth + 40;
    if (p.x > window.innerWidth + 40) p.x = -40;
  }
}

function drawConfetti(){
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of confetti) {
    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
    ctx.restore();
  }
}
