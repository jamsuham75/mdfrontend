// ── 상태 ──
const state = {
  questions: [],
  current: 0,
  score: 0,
  answered: false,
  timeLeft: 20,
  timerId: null,
};
const TIME_LIMIT = 20;

// ── 화면 전환 ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── JSON 데이터 로드 ──
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error('데이터 로드 실패');
    state.questions = await res.json();
  } catch (err) {
    alert('문제 데이터를 불러오지 못했습니다. Live Server로 실행했는지 확인해 주세요.');
  }
}

// ── Fisher-Yates 셔플 ──
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── 퀴즈 시작 ──
function startQuiz() {
  state.questions = shuffle(state.questions);
  state.current   = 0;
  state.score     = 0;
  state.answered  = false;
  showScreen('screenQuiz');
  renderQuestion();
}

// ── 문제 렌더링 ──
function renderQuestion() {
  const q = state.questions[state.current];
  state.answered = false;

  document.getElementById('counter').textContent =
    `${state.current + 1} / ${state.questions.length}`;
  document.getElementById('score').textContent = state.score + '점';
  document.getElementById('question').textContent = q.question;

  const optionsEl = document.getElementById('options');
  optionsEl.innerHTML = q.options.map((opt, i) =>
    `<button class="option-btn" data-index="${i}">${opt}</button>`
  ).join('');

  document.getElementById('nextBtn').classList.remove('visible');
  startTimer();
}

// ── 타이머 ──
function startTimer() {
  state.timeLeft = TIME_LIMIT;
  updateTimer();
  state.timerId = setInterval(() => {
    state.timeLeft--;
    updateTimer();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      checkAnswer(-1);  // 시간 초과 = 오답 처리
    }
  }, 1000);
}

function updateTimer() {
  const timer = document.getElementById('timer');
  timer.textContent = '⏱ ' + state.timeLeft;
  timer.classList.toggle('warning', state.timeLeft <= 5);
}

// ── 정답 체크 ──
function checkAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerId);

  const q = state.questions[state.current];
  const buttons = document.querySelectorAll('.option-btn');

  buttons.forEach(btn => btn.disabled = true);
  buttons[q.answer].classList.add('correct');

  if (selectedIndex >= 0 && selectedIndex !== q.answer) {
    buttons[selectedIndex].classList.add('wrong');
  }

  if (selectedIndex === q.answer) {
    state.score += 10;
    document.getElementById('score').textContent = state.score + '점';
  }

  document.getElementById('nextBtn').classList.add('visible');
}

// ── 다음 문제 ──
function nextQuestion() {
  state.current++;
  if (state.current < state.questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

// ── 결과 화면 ──
function showResult() {
  const total = state.questions.length;
  const correct = state.score / 10;
  const percent = Math.round((correct / total) * 100);

  let grade;
  if (percent === 100)     grade = '🏆 완벽해요!';
  else if (percent >= 80)  grade = '🎉 훌륭해요!';
  else if (percent >= 60)  grade = '👍 잘했어요!';
  else if (percent >= 40)  grade = '💪 조금 더 힘내요!';
  else                     grade = '📚 다시 도전!';

  document.getElementById('resultGrade').textContent = grade;
  document.getElementById('resultScore').textContent =
    `${total}문제 중 ${correct}개 정답 (${percent}%) — ${state.score}점`;

  const best = Number(localStorage.getItem('bestScore') || 0);
  if (state.score > best) {
    localStorage.setItem('bestScore', state.score);
  }

  showScreen('screenResult');
}

function showBestScore() {
  const best = localStorage.getItem('bestScore') || 0;
  document.getElementById('bestScore').textContent =
    best > 0 ? `🏆 최고 점수: ${best}점` : '첫 도전을 환영합니다!';
}

// ── 이벤트 연결 ──
document.getElementById('startBtn').addEventListener('click', startQuiz);

document.getElementById('retryBtn').addEventListener('click', () => {
  showScreen('screenStart');
  showBestScore();
});

document.getElementById('nextBtn').addEventListener('click', nextQuestion);

document.getElementById('options').addEventListener('click', (e) => {
  const btn = e.target.closest('.option-btn');
  if (!btn || btn.disabled) return;
  checkAnswer(Number(btn.dataset.index));
});

// 초기화
loadQuestions().then(showBestScore);