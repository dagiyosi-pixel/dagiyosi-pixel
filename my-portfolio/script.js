const screens = Array.from(document.querySelectorAll('.screen'));
const progressBar = document.getElementById('progressBar');
const currentLevel = document.getElementById('currentLevel');

const stages = [
  'screen-intro',
  'screen-level-1',
  'screen-level-2',
  'screen-level-3',
  'screen-final',
  'screen-ending'
];

let activeIndex = 0;
let levelOneSolved = false;
let levelTwoSolved = false;

function setProgress(step) {
  const percent = (step / (stages.length - 1)) * 100;
  progressBar.style.width = percent + '%';
  currentLevel.textContent = String(Math.min(step + 1, 5));
}

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === id);
  });
}

function nextStage() {
  activeIndex = Math.min(activeIndex + 1, stages.length - 1);
  const nextId = stages[activeIndex];
  setProgress(activeIndex);
  showScreen(nextId);
}

function handleIntroStart() {
  activeIndex = 1;
  setProgress(1);
  showScreen('screen-level-1');
}

document.getElementById('startBtn').addEventListener('click', handleIntroStart);

const memoryCards = Array.from(document.querySelectorAll('.memory-card'));
const level1Status = document.getElementById('level1Status');
const hiddenHeartIndex = 4;

memoryCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    if (levelOneSolved) return;

    if (index === hiddenHeartIndex) {
      card.textContent = '❤';
      card.classList.add('correct');
      levelOneSolved = true;
      level1Status.textContent = 'You found the heart. Beautiful. Keep going.';

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'btn';
      nextButton.textContent = 'Next level';
      nextButton.style.marginTop = '18px';

      const statusBlock = document.querySelector('#screen-level-1 .status-note');
      if (!statusBlock.querySelector('.btn')) {
        statusBlock.appendChild(nextButton);
      }

      nextButton.addEventListener('click', () => {
        activeIndex = 2;
        setProgress(2);
        showScreen('screen-level-2');
      });

      return;
    }

    card.textContent = '✕';
    card.classList.add('wrong');
    card.disabled = true;
    level1Status.textContent = 'Not this one yet — your heart is almost there.';
  });
});

const choiceButtons = Array.from(document.querySelectorAll('.choice'));
const level2Status = document.getElementById('level2Status');

choiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (levelTwoSolved) return;

    const isCorrect = button.textContent.trim() === 'Your everything';

    button.classList.add(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      levelTwoSolved = true;
      level2Status.textContent = 'That is exactly right — you are my whole world.';
      setTimeout(() => {
        activeIndex = 3;
        setProgress(3);
        showScreen('screen-level-3');
      }, 700);
      return;
    }

    level2Status.textContent = 'Almost... but not quite.';
  });
});

const envelope = document.getElementById('envelope');
const revealLetterBtn = document.getElementById('revealLetterBtn');
let letterOpened = false;

revealLetterBtn.addEventListener('click', () => {
  letterOpened = !letterOpened;
  envelope.classList.toggle('open', letterOpened);
  revealLetterBtn.textContent = letterOpened ? 'Letter opened' : 'Open the letter';

  if (letterOpened) {
    setTimeout(() => {
      activeIndex = 4;
      setProgress(4);
      showScreen('screen-final');
    }, 900);
  }
});

const finalRevealBtn = document.getElementById('finalRevealBtn');
finalRevealBtn.addEventListener('click', () => {
  activeIndex = 5;
  setProgress(5);
  showScreen('screen-ending');
});

document.getElementById('restartBtn').addEventListener('click', () => {
  activeIndex = 0;
  levelOneSolved = false;
  levelTwoSolved = false;
  letterOpened = false;

  memoryCards.forEach((card) => {
    card.textContent = '✦';
    card.classList.remove('correct', 'wrong');
    card.disabled = false;
  });

  choiceButtons.forEach((button) => {
    button.classList.remove('correct', 'wrong');
  });

  level1Status.textContent = 'Pick the hidden heart.';
  level2Status.textContent = 'Select the right answer.';
  revealLetterBtn.textContent = 'Open the letter';
  envelope.classList.remove('open');
  setProgress(0);
  showScreen('screen-intro');
});

setProgress(0);
showScreen('screen-intro');
