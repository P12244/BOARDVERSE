/* BOARDVERSE - UI interactions, particles, hover sound */

/* Smooth hover sound using WebAudio (no external file) */
class HoverAudio {
  constructor() {
    this.ctx = null;
    this.gain = null;
  }
  _init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.04; // subtle
    this.gain.connect(this.ctx.destination);
  }
  play() {
    this._init();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 500;
    o.type = 'sine';
    o.frequency.setValueAtTime(900, now);
    o.frequency.exponentialRampToValueAtTime(1500, now + 0.06);
    o.connect(f);
    f.connect(this.gain);
    o.start(now);
    o.stop(now + 0.09);
  }
}
const hoverAudio = new HoverAudio();

/* Attach hover sound and micro interactions to buttons */
document.querySelectorAll('[data-sound]').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    hoverAudio.play();
    btn.classList.add('hovered');
  });
  btn.addEventListener('mouseleave', () => btn.classList.remove('hovered'));
  btn.addEventListener('touchstart', () => hoverAudio.play(), {passive:true});
  btn.addEventListener('click', (e) => {
    // quick ripple effect
    const r = document.createElement('span');
    r.className = 'ripple';
    btn.appendChild(r);
    setTimeout(()=> r.remove(), 600);
  });
});

/* Add small ripple style dynamically */
const style = document.createElement('style');
style.innerHTML = `
.ripple {
  position:absolute;
  left:50%;
  top:50%;
  width:8px;
  height:8px;
  background: radial-gradient(circle, rgba(124,58,237,0.25), transparent 40%);
  transform: translate(-50%,-50%) scale(1);
  border-radius: 999px;
  pointer-events: none;
  animation: ripple 600ms ease-out;
  mix-blend-mode: screen;
}
@keyframes ripple {
  from { transform: translate(-50%,-50%) scale(0.6); opacity: 0.8; }
  to { transform: translate(-50%,-50%) scale(9); opacity: 0; }
}
`;
document.head.appendChild(style);

/* Particle background (subtle sparkles) */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let w = 0, h = 0;
function resize() {
  const ratio = window.devicePixelRatio || 1;
  w = canvas.width = innerWidth * ratio;
  h = canvas.height = innerHeight * ratio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(ratio, ratio);
}
function initParticles() {
  particles = [];
  const count = Math.max(20, Math.floor((innerWidth * innerHeight) / 50000));
  for (let i=0;i<count;i++){
    particles.push({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: Math.random()*2 + 0.6,
      vx: (Math.random()-0.5)*0.2,
      vy: (Math.random()-0.5)*0.2,
      alpha: Math.random()*0.9 + 0.1,
      twinkle: Math.random()*200
    });
  }
}
function tickParticles() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  // dark gradient overlay for depth
  const g = ctx.createLinearGradient(0,0,0,innerHeight);
  g.addColorStop(0,'rgba(2,6,11,0)');
  g.addColorStop(1,'rgba(2,6,11,0.2)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.twinkle += 1;
    const a = p.alpha * (0.6 + 0.4*Math.sin(p.twinkle*0.04));
    ctx.beginPath();
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
    grad.addColorStop(0, `rgba(124,58,237,${a})`);
    grad.addColorStop(0.2, `rgba(14,165,233,${a*0.6})`);
    grad.addColorStop(1, `rgba(14,165,233,0)`);
    ctx.fillStyle = grad;
    ctx.arc(p.x, p.y, p.r*3, 0, Math.PI*2);
    ctx.fill();

    // wrap
    if (p.x < -10) p.x = innerWidth + 10;
    if (p.y < -10) p.y = innerHeight + 10;
    if (p.x > innerWidth + 10) p.x = -10;
    if (p.y > innerHeight + 10) p.y = -10;
  }

  requestAnimationFrame(tickParticles);
}

/* Initialize */
function start() {
  resize();
  initParticles();
  tickParticles();
}
window.addEventListener('resize', () => {
  // debounce
  clearTimeout(window._rv);
  window._rv = setTimeout(()=> {
    resize();
    initParticles();
  }, 120);
});
start();

/* Accessibility: allow keyboard focus styles */
document.addEventListener('keyup', (e) => {
  if (e.key === 'Tab') document.body.classList.add('show-focus');
});