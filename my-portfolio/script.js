/* ==========================================================================
   0xDagi // CYBER-KINETIC ENGINE JAVASCRIPT
   ========================================================================== */

// --- 1. Sound FX Engine (Synthesized Web Audio API) ---
class CyberAudio {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBlip(freq = 600, duration = 0.04) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playGlitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }
}

const sfx = new CyberAudio();

// --- 2. Interactive Canvas Particle Background (Fire & Cyber Grid) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = -Math.random() * 1.5 - 0.5; // Upward fire embers
    this.size = Math.random() * 2.5 + 1;
    this.life = Math.random() * 100 + 80;
    this.maxLife = this.life;
  }

  update(theme) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    // Mouse evasion / interaction
    if (mouse.x && mouse.y) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 5;
        this.y -= (dy / dist) * force * 5;
      }
    }

    if (this.life <= 0 || this.y < -10 || this.x < -10 || this.x > width + 10) {
      this.reset();
      this.y = height + 10;
    }
  }

  draw(theme) {
    const alpha = (this.life / this.maxLife) * 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    if (theme === 'fire') {
      ctx.fillStyle = `rgba(255, ${Math.floor(69 + (1 - alpha) * 100)}, 0, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff4500';
    } else {
      ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ff88';
    }

    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Populate particles
for (let i = 0; i < 90; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  const currentTheme = document.body.getAttribute('data-theme') || 'fire';
  ctx.clearRect(0, 0, width, height);

  // Render & connect particles within range
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(currentTheme);
    particles[i].draw(currentTheme);

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 90) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        const lineAlpha = (1 - dist / 90) * 0.18;
        ctx.strokeStyle = currentTheme === 'fire' 
          ? `rgba(255, 69, 0, ${lineAlpha})` 
          : `rgba(0, 255, 136, ${lineAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

animateParticles();

// --- 3. Kinetic Typewriter Cycling ---
const phrases = [
  "FULL-STACK WEB ARCHITECT",
  "PREFAB BIM AUTOMATION SPECIALIST",
  "TURNING CAFFEINE INTO PRODUCTION CODE",
  "HIGH-PERFORMANCE ALGORITHMIC SYSTEMS",
  "MICROSERVICES // WEBSOCKETS // CAD PLUGINS"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typeEffect() {
  const currentPhrase = phrases[phraseIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typewriterEl.textContent = currentPhrase.substring(0, charIndex);

  let speed = isDeleting ? 40 : 80;

  if (!isDeleting && charIndex === currentPhrase.length) {
    speed = 1800; // Pause at end of phrase
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    speed = 400;
  }

  setTimeout(typeEffect, speed);
}

typeEffect();

// --- 4. Interactive Hacker Terminal ---
const termBody = document.getElementById('term-body');
const termInput = document.getElementById('term-input');
const chipButtons = document.querySelectorAll('.chip-btn');

const terminalCommands = {
  help: `AVAILABLE COMMANDS:
  • skills    : List primary tech stack weapons
  • projects  : Inspect mission battlegrounds
  • whoami    : Print developer profile & origin
  • fire      : Switch interface to Fire Theme
  • matrix    : Switch interface to Matrix Theme
  • contact   : Get uplink coordinates
  • clear     : Purge terminal display
  • sudo      : Execute administrative override`,

  skills: `⚡ 0xDagi PRIMARY ARSENAL:
  [LANGUAGES]    Python (95%), TypeScript (94%), C#/.NET (90%), SQL, HTML5/CSS3
  [FULL-STACK]   React, Next.js, Node.js, Express, FastAPI, Django
  [BIM & CAD]    Revit API, Dynamo, AutoCAD, Algorithmic Geometry
  [DEVOPS & DB]  Docker, Linux, PostgreSQL, Redis, MongoDB, GitHub Actions`,

  projects: `🚀 RECENT BATTLEGROUNDS:
  #01 RevitCopilot & Automation Bridge (C#, Revit API, Python)
  #02 Nexus Cloud Architect Dashboard (Next.js, TypeScript, Postgres)
  #03 Prefab Hollow-Core Generator (Python, Dynamo, Structural Math)
  Run 'contact' to collaborate on next-gen builds.`,

  whoami: `👤 OPERATIVE IDENTITY:
  Name      : Dagi Yosi (0xDagi)
  Role      : Full-Stack Engineer & BIM Automation Architect
  Location  : Addis Ababa, Ethiopia → Global Cyberspace
  Philosophy: "Never compromise on speed, reliability, or design aesthetics."`,

  contact: `📡 TRANSMISSION UPLINK:
  GitHub : https://github.com/dagiyosi-pixel
  Email  : dagiyosi5321@gmail.com
  Status : OPEN FOR CONTRACTS & ELITE ENGINEERING ROLES`,

  fire: () => {
    setTheme('fire');
    return '🔥 SYSTEM STATUS: FIRE THEME ACTIVATED.';
  },

  matrix: () => {
    setTheme('matrix');
    return '👾 SYSTEM STATUS: CYBER MATRIX PROTOCOL ENGAGED.';
  },

  clear: () => {
    termBody.innerHTML = '';
    return '';
  },

  sudo: `[SECURITY ALERT] User 'guest' is not in the sudoers file. This incident will be reported to 0xDagi.`
};

function executeCommand(rawCmd) {
  const cmd = rawCmd.trim().toLowerCase();
  if (!cmd) return;

  sfx.playBlip(750, 0.05);

  const row = document.createElement('div');
  row.className = 'term-row';

  const cmdLine = document.createElement('div');
  cmdLine.innerHTML = `<span class="term-prompt">0xDagi@root:~$</span> <span class="term-cmd">${rawCmd}</span>`;
  row.appendChild(cmdLine);

  let outputText = '';
  if (terminalCommands[cmd]) {
    if (typeof terminalCommands[cmd] === 'function') {
      outputText = terminalCommands[cmd]();
    } else {
      outputText = terminalCommands[cmd];
    }
  } else {
    outputText = `command not found: ${cmd}. Type 'help' for available directives.`;
  }

  if (outputText) {
    const outDiv = document.createElement('div');
    outDiv.className = 'term-output';
    outDiv.textContent = outputText;
    row.appendChild(outDiv);
  }

  termBody.appendChild(row);
  termBody.scrollTop = termBody.scrollHeight;
}

termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = termInput.value;
    termInput.value = '';
    executeCommand(val);
  }
});

chipButtons.forEach((chip) => {
  chip.addEventListener('click', () => {
    const cmd = chip.getAttribute('data-cmd');
    executeCommand(cmd);
  });
});

// --- 5. Arsenal Tabs Filtering ---
const tabButtons = document.querySelectorAll('.tab-btn');
const weaponCards = document.querySelectorAll('.weapon-card');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    sfx.playBlip(550, 0.03);
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    weaponCards.forEach((card) => {
      const cats = card.getAttribute('data-cat') || '';
      if (filter === 'all' || cats.includes(filter)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// --- 6. Theme Switching ---
const modeToggle = document.getElementById('mode-toggle');

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  const btnText = modeToggle.querySelector('.btn-text');
  const btnIcon = modeToggle.querySelector('.btn-icon');

  if (theme === 'fire') {
    btnText.textContent = 'MODE: FIRE';
    btnIcon.textContent = '🔥';
  } else {
    btnText.textContent = 'MODE: MATRIX';
    btnIcon.textContent = '👾';
  }
  sfx.playGlitch();
}

modeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') || 'fire';
  const next = current === 'fire' ? 'matrix' : 'fire';
  setTheme(next);
});

// --- 7. Audio Toggle ---
const sfxToggle = document.getElementById('sfx-toggle');
sfxToggle.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  const status = sfxToggle.querySelector('.sfx-status');
  const icon = sfxToggle.querySelector('.sfx-icon');
  if (sfx.enabled) {
    status.textContent = 'SFX: ON';
    icon.textContent = '🔊';
    sfx.playBlip(800, 0.06);
  } else {
    status.textContent = 'SFX: OFF';
    icon.textContent = '🔇';
  }
});

// --- 8. Copy Email ---
const copyBtn = document.getElementById('copy-email');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const email = copyBtn.getAttribute('data-email');
    navigator.clipboard.writeText(email).then(() => {
      sfx.playBlip(1000, 0.08);
      const hint = copyBtn.querySelector('.copy-hint');
      hint.textContent = '[COPIED TO CLIPBOARD!]';
      hint.style.color = '#00ff88';
      setTimeout(() => {
        hint.textContent = '[CLICK TO COPY]';
        hint.style.color = '';
      }, 2500);
    });
  });
}

// --- 9. Stat Counter Animation ---
function animateStats() {
  const statVals = document.querySelectorAll('.stat-val[data-target]');
  statVals.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isFloat = target % 1 !== 0;
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      current = progress * target;
      if (isFloat) {
        el.textContent = current.toFixed(1) + '%';
      } else {
        el.textContent = Math.floor(current) + '+';
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  });
}

window.addEventListener('DOMContentLoaded', animateStats);
