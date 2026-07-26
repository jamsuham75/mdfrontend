// ── 게임 데이터 ──────────────────────────
const CHOICES = {
  scissors: { label: '가위', icon: '✌️', beats: 'paper'    },
  rock:     { label: '바위', icon: '✊', beats: 'scissors' },
  paper:    { label: '보',   icon: '🖐', beats: 'rock'     },
};
const CHOICE_KEYS = Object.keys(CHOICES); // ['scissors', 'rock', 'paper']

// ── 게임 상태 ──────────────────────────
let scores  = { my: 0, cpu: 0, draw: 0 };
let history = [];
let isPlaying = false; // 애니메이션 중 중복 클릭 방지

// ── 요소 참조 ──────────────────────────
const myChoiceBox  = document.getElementById('myChoice');
const cpuChoiceBox = document.getElementById('cpuChoice');
const cpuIcon      = document.getElementById('cpuIcon');
const resultMsg    = document.getElementById('resultMsg');
const myScoreEl    = document.getElementById('myScore');
const cpuScoreEl   = document.getElementById('cpuScore');
const drawScoreEl  = document.getElementById('drawScore');
const historyList  = document.getElementById('historyList');
const resetBtn     = document.getElementById('resetBtn');

// ── 랜덤 컴퓨터 선택 ─────────────────
function getCpuChoice() {
  const idx = Math.floor(Math.random() * CHOICE_KEYS.length);
  return CHOICE_KEYS[idx];
}

// ── 승패 판정 ─────────────────────────
function judge(my, cpu) {
  if (my === cpu) return 'draw';
  return CHOICES[my].beats === cpu ? 'win' : 'lose';
}

// ── 컴퓨터 선택 애니메이션 ──────────
function animateCpuChoice(finalChoice, onDone) {
  let count = 0;
  const total = 8; // 빠르게 8번 바꿈
  cpuIcon.classList.add('spinning');

  const intervalId = setInterval(() => {
    const random = CHOICE_KEYS[Math.floor(Math.random() * CHOICE_KEYS.length)];
    cpuIcon.textContent = CHOICES[random].icon;
    count++;

    if (count >= total) {
      clearInterval(intervalId);
      cpuIcon.classList.remove('spinning');
      cpuIcon.textContent = CHOICES[finalChoice].icon;
      cpuIcon.classList.add('pop');
      cpuIcon.addEventListener('animationend',
        () => cpuIcon.classList.remove('pop'), { once: true });
      onDone();
    }
  }, 80);
}

// ── 결과 처리 ─────────────────────────
function showResult(myChoice, cpuChoice, result) {
  // 점수 업데이트
  if (result === 'win')  { scores.my++;   myScoreEl.textContent  = scores.my;   }
  if (result === 'lose') { scores.cpu++;  cpuScoreEl.textContent = scores.cpu;  }
  if (result === 'draw') { scores.draw++; drawScoreEl.textContent= scores.draw; }

  // 결과 메시지
  const messages = {
    win:  '🎉 승리!',
    lose: '😢 패배...',
    draw: '🤝 무승부!',
  };
  resultMsg.textContent = messages[result];
  resultMsg.className   = `result-msg ${result}`;

  // 기록 추가 (최대 5개)
  const record = {
    my:     CHOICES[myChoice].label,
    cpu:    CHOICES[cpuChoice].label,
    result: result,
  };
  history.unshift(record);
  if (history.length > 5) history.pop();
  renderHistory();

  isPlaying = false;
}

// ── 기록 렌더링 ──────────────────────
function renderHistory() {
  const labels = { win: '승리', lose: '패배', draw: '무승부' };
  historyList.innerHTML = history.map(h => `
    <li class='history-item'>
      <span>나: ${h.my} vs 컴퓨터: ${h.cpu}</span>
      <span class='history-result ${h.result}'>${labels[h.result]}</span>
    </li>
  `).join('');
}

// ── 초기화 ───────────────────────────
function resetGame() {
  scores   = { my: 0, cpu: 0, draw: 0 };
  history  = [];
  myScoreEl.textContent   = 0;
  cpuScoreEl.textContent  = 0;
  drawScoreEl.textContent = 0;
  resultMsg.textContent   = '선택하세요!';
  resultMsg.className     = 'result-msg';
  document.querySelector('.choice-icon', myChoiceBox).textContent = '🤔';
  cpuIcon.textContent     = '❓';
  historyList.innerHTML   = '';
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
}

// ── 이벤트: 선택 버튼 (이벤트 위임) ─
document.querySelector('.choice-btns').addEventListener('click', (e) => {
  if (isPlaying) return; // 애니메이션 중 무시

  const btn = e.target.closest('.choice-btn');
  if (!btn) return;

  isPlaying = true;
  const myChoice  = btn.dataset.choice;
  const cpuChoice = getCpuChoice();

  // 선택 버튼 강조
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // 내 선택 표시
  myChoiceBox.querySelector('.choice-icon').textContent = CHOICES[myChoice].icon;

  // 컴퓨터 선택 애니메이션 후 결과 처리
  animateCpuChoice(cpuChoice, () => {
    const result = judge(myChoice, cpuChoice);
    showResult(myChoice, cpuChoice, result);
  });
});

// ── 이벤트: 키보드 단축키 ────────────
document.addEventListener('keydown', (e) => {
  const keyMap = { '1': 'scissors', '2': 'rock', '3': 'paper' };
  if (keyMap[e.key]) {
    document.querySelector(`[data-choice='${keyMap[e.key]}']`).click();
  }
});

// ── 이벤트: 초기화 버튼 ─────────────
resetBtn.addEventListener('click', resetGame);
