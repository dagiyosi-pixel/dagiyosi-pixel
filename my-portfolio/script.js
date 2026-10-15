/* ==========================================================================
   DAGI YOSI (0xDagi) // CINEMATIC VOLUMETRIC EMBER & AUDIO ENGINE
   ========================================================================== */

// --- 1. Cinematic Audio Synthesizer (Resonance & Drums) ---
class MasterAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playDrum(freq = 90, decay = 0.45) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + decay);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + decay);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + decay);
    } catch (e) {}
  }

  playGong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      [220, 440, 660, 880].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.035 / (idx + 1), this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.4);
      });
    } catch (e) {}
  }

  playPieceClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }
}

const audio = new MasterAudio();

// --- 2. Cinematic Volumetric Fire Ember Simulation ---
const canvas = document.getElementById('fire-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let embers = [];
let mouse = { x: null, y: null, radius: 180 };

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Spawn kinetic micro-sparks on cursor move
  if (Math.random() < 0.45) {
    embers.push(new MasterEmber(mouse.x, mouse.y, true));
  }
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

class MasterEmber {
  constructor(customX = null, customY = null, isSpark = false) {
    this.reset(customX, customY, isSpark);
  }

  reset(customX = null, customY = null, isSpark = false) {
    this.isSpark = isSpark;
    this.x = customX !== null ? customX + (Math.random() - 0.5) * 16 : Math.random() * width;
    this.y = customY !== null ? customY + (Math.random() - 0.5) * 16 : height + Math.random() * 30;
    this.size = isSpark ? Math.random() * 2 + 0.8 : Math.random() * 2.8 + 1;
    this.speedY = isSpark ? (Math.random() - 0.5) * 2 - 1.5 : -(Math.random() * 1.6 + 0.7);
    this.speedX = (Math.random() - 0.5) * (isSpark ? 2.5 : 1.2);
    this.life = isSpark ? Math.random() * 35 + 25 : Math.random() * 140 + 90;
    this.maxLife = this.life;
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = (Math.random() - 0.5) * 0.035;
    this.colorType = Math.random();
  }

  update() {
    this.angle += this.angularSpeed;
    this.x += this.speedX + Math.sin(this.angle) * 0.8;
    this.y += this.speedY;
    this.life--;

    // Thermal vortex displacement
    if (mouse.x && mouse.y && !this.isSpark) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 4.5;
        this.y -= force * 3.5;
      }
    }

    if (this.life <= 0 || this.y < -20 || this.x < -20 || this.x > width + 20) {
      if (this.isSpark) {
        this.dead = true;
      } else {
        this.reset();
      }
    }
  }

  draw() {
    const progress = this.life / this.maxLife;
    const alpha = Math.sin(progress * Math.PI);

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    if (this.colorType > 0.6) {
      ctx.fillStyle = `rgba(245, 207, 104, ${alpha * 0.85})`;
      ctx.shadowColor = '#e5b842';
    } else if (this.colorType > 0.2) {
      ctx.fillStyle = `rgba(255, 106, 0, ${alpha * 0.9})`;
      ctx.shadowColor = '#ff4500';
    } else {
      ctx.fillStyle = `rgba(255, 245, 230, ${alpha * 0.95})`;
      ctx.shadowColor = '#fff2db';
    }

    ctx.shadowBlur = this.size * 5;
    ctx.fill();
    ctx.restore();
  }
}

// Populate embers
for (let i = 0; i < 95; i++) {
  embers.push(new MasterEmber());
}

function runEmberEngine() {
  ctx.clearRect(0, 0, width, height);
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];
    e.update();
    e.draw();
    if (e.dead) {
      embers.splice(i, 1);
    }
  }
  requestAnimationFrame(runEmberEngine);
}
runEmberEngine();

// Sound Toggle
const audioToggle = document.getElementById('audioToggle');
const audioIcon = document.getElementById('audioIcon');
if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    audioIcon.textContent = audio.enabled ? '🔊' : '🔇';
    if (audio.enabled) audio.playDrum(120, 0.25);
  });
}

// --- 3. Kinetic Calligraphy Typewriter ---
const phrases = [
  "ARCHITECTING SCALABLE FULL-STACK ECOSYSTEMS.",
  "CREATOR OF ETHIOPIA 360 // GEOSPATIAL ATLAS.",
  "ENGINEERING GRADE 7 & 8 SQ3R ACTIVE-RECALL PLATFORM.",
  "HIGH-STAKES AMT AVIATION CERTIFICATION PLATFORM.",
  "AUTONOMOUS AUTODESK REVIT BIM AUTOMATION & GEOMETRY."
];

let pIdx = 0;
let cIdx = 0;
let isReversing = false;
const typewriterEl = document.getElementById('typewriter');

function cycleTypewriter() {
  if (!typewriterEl) return;
  const curr = phrases[pIdx];

  if (isReversing) {
    cIdx--;
  } else {
    cIdx++;
  }

  typewriterEl.textContent = curr.substring(0, cIdx);

  let pace = isReversing ? 28 : 65;

  if (!isReversing && cIdx === curr.length) {
    pace = 2400; // Dignified pause at completion
    isReversing = true;
  } else if (isReversing && cIdx === 0) {
    isReversing = false;
    pIdx = (pIdx + 1) % phrases.length;
    pace = 450;
  }

  setTimeout(cycleTypewriter, pace);
}
cycleTypewriter();

// --- 4. Tactical Chess Chamber (Playable Checkmate) ---
// White Queen d1 (r:7, c:3) strikes f7 (r:1, c:5) for checkmate!
const dojoMatrix = [
  ['', '', '', '', '♚', '', '', ''], // 0
  ['♟', '♟', '♟', '♟', '', '♟', '♟', '♟'], // 1 (f7 is col 5)
  ['', '', '♞', '', '', '', '', ''], // 2
  ['', '', '♝', '', '', '', '', ''], // 3
  ['', '', '♗', '', '', '', '', ''], // 4
  ['', '', '', '', '', '', '', ''], // 5
  ['♙', '♙', '♙', '♙', '', '♙', '♙', '♙'], // 6
  ['♖', '', '', '♕', '♔', '', '♘', '♖']  // 7 (Queen r:7, c:3)
];

let chessState = JSON.parse(JSON.stringify(dojoMatrix));
let selectedSquare = null;
let puzzleSolved = false;

const boardEl = document.getElementById('chessBoard');
const feedbackEl = document.getElementById('chessFeedback');
const turnBadge = document.getElementById('chessTurnBadge');
const resetBtn = document.getElementById('resetChess');
const hintBtn = document.getElementById('hintChess');

function renderDojoGrid() {
  if (!boardEl) return;
  boardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      sq.className = `dojo-square ${isLight ? 'light-wood' : 'dark-wood'}`;
      sq.dataset.row = r;
      sq.dataset.col = c;
      sq.textContent = chessState[r][c];

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('highlight-selected');
      }

      if (selectedSquare && selectedSquare.r === 7 && selectedSquare.c === 3 && r === 1 && c === 5) {
        sq.classList.add('highlight-target');
      }

      sq.addEventListener('click', () => onSquareSelect(r, c));
      boardEl.appendChild(sq);
    }
  }
}

function onSquareSelect(r, c) {
  if (puzzleSolved) return;

  // Selecting White Queen (d1)
  if (r === 7 && c === 3 && chessState[r][c] === '♕') {
    selectedSquare = { r, c };
    audio.playPieceClick();
    feedbackEl.innerHTML = `<span style="color:#e5b842;">♕ White Queen Selected (d1).</span> Strike Black's outpost at <strong>f7</strong> to conclude the match!`;
    renderDojoGrid();
    return;
  }

  // Striking f7 (1, 5) with Queen
  if (selectedSquare && selectedSquare.r === 7 && selectedSquare.c === 3) {
    if (r === 1 && c === 5) {
      // CHECKMATE!
      chessState[7][3] = '';
      chessState[1][5] = '♕';
      puzzleSolved = true;
      selectedSquare = null;
      renderDojoGrid();

      audio.playGong();
      audio.playDrum(80, 0.6);
      turnBadge.textContent = 'CHECKMATE';
      turnBadge.style.background = '#e5b842';
      turnBadge.style.color = '#100d0a';

      feedbackEl.innerHTML = `🏆 <strong style="color:#e5b842;">CHECKMATE CONCLUDED.</strong><br/>
      <span style="color:#fcf9f2;">Decisive tactical victory. The hallmark of an authentic master code architect.</span>`;
      return;
    } else {
      audio.playDrum(180, 0.1);
      feedbackEl.textContent = "That move does not deliver checkmate. Strike f7 directly.";
      selectedSquare = null;
      renderDojoGrid();
      return;
    }
  }

  selectedSquare = null;
  renderDojoGrid();
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    chessState = JSON.parse(JSON.stringify(dojoMatrix));
    selectedSquare = null;
    puzzleSolved = false;
    turnBadge.textContent = 'PUZZLE: ACTIVE';
    turnBadge.style.background = '';
    turnBadge.style.color = '';
    feedbackEl.textContent = "Click White Queen (♕ on d1), then strike the f7 outpost to secure victory.";
    audio.playPieceClick();
    renderDojoGrid();
  });
}

if (hintBtn) {
  hintBtn.addEventListener('click', () => {
    audio.playGong();
    selectedSquare = { r: 7, c: 3 };
    feedbackEl.innerHTML = `💡 <strong>TACTICAL INSIGHT:</strong> The Bishop on c4 covers f7. Queen on d1 can strike directly!`;
    renderDojoGrid();
  });
}

renderDojoGrid();

// --- 5. Copy Email Action ---
const copyBtn = document.getElementById('copyEmailBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const email = copyBtn.getAttribute('data-email');
    navigator.clipboard.writeText(email).then(() => {
      audio.playGong();
      const hint = copyBtn.querySelector('.channel-copy-hint');
      const prev = hint.textContent;
      hint.textContent = '[COPIED TO CLIPBOARD!]';
      hint.style.color = '#4ade80';
      setTimeout(() => {
        hint.textContent = prev;
        hint.style.color = '';
      }, 2500);
    });
  });
}

// --- 6. Metric Numbers Counting Animation ---
function animateKPIs() {
  const kpiEls = document.querySelectorAll('.kpi-num[data-target]');
  kpiEls.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isPercent = el.textContent.includes('%') || target === 99.9 || target === 100;
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = progress * target;
      if (target % 1 !== 0) {
        el.textContent = current.toFixed(1) + '%';
      } else if (isPercent) {
        el.textContent = Math.floor(current) + '%';
      } else {
        el.textContent = Math.floor(current);
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

window.addEventListener('DOMContentLoaded', animateKPIs);
