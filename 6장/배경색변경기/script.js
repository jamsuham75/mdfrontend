// ── 요소 선택 ──
const body         = document.body;
const colorDisplay = document.getElementById('colorDisplay');
const colorName    = document.getElementById('colorName');
const historyEl    = document.getElementById('history');

// ── 색상 이력 배열 ──
const colorHistory = [];

// ── 랜덤 정수 생성 (min 이상 max 이하) ──
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── RGB → HEX 변환 ──
function rgbToHex(r, g, b) {
  const toHex = n => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ── 밝기 계산 (밝으면 검은 글씨, 어두우면 흰 글씨) ──
function getTextColor(r, g, b) {
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 128 ? '#222222' : '#ffffff';
}

// ── 배경색 적용 ──
function applyColor(hex, label = '') {
  body.style.backgroundColor = hex;
  colorDisplay.textContent   = hex;
  colorName.textContent      = label || hex;

  // 글자 색상을 배경에 맞게 자동 조정
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const textColor = getTextColor(r, g, b);
  colorDisplay.style.color = textColor;
  colorName.style.color    = textColor;

  // 이력 추가
  addHistory(hex);
}

// ── 이력 점(dot) 추가 ──
function addHistory(hex) {
  if (colorHistory[colorHistory.length - 1] === hex) return;
  colorHistory.push(hex);
  if (colorHistory.length > 8) colorHistory.shift(); // 최대 8개

  const dot = document.createElement('div');
  dot.className = 'history-dot';
  dot.style.backgroundColor = hex;
  dot.title = hex;
  dot.addEventListener('click', () => applyColor(hex));

  historyEl.innerHTML = '';  // 기존 점 초기화
  colorHistory.forEach(c => {
    const d = document.createElement('div');
    d.className = 'history-dot';
    d.style.backgroundColor = c;
    d.title = c;
    d.addEventListener('click', () => applyColor(c));
    historyEl.appendChild(d);
  });
}

// ── 완전 랜덤 색상 ──
document.getElementById('randomBtn').addEventListener('click', () => {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  applyColor(rgbToHex(r, g, b));
});

// ── 파스텔 톤 (밝은 색상) ──
document.getElementById('pastelBtn').addEventListener('click', () => {
  const r = randomInt(180, 255);
  const g = randomInt(180, 255);
  const b = randomInt(180, 255);
  applyColor(rgbToHex(r, g, b), '파스텔 톤');
});

// ── 다크 톤 (어두운 색상) ──
document.getElementById('darkBtn').addEventListener('click', () => {
  const r = randomInt(0, 80);
  const g = randomInt(0, 80);
  const b = randomInt(0, 80);
  applyColor(rgbToHex(r, g, b), '다크 톤');
});

// ── 초기화 ──
document.getElementById('resetBtn').addEventListener('click', () => {
  applyColor('#F0F0F0', '초기 배경');
  colorHistory.length = 0;
  historyEl.innerHTML = '';
});

// ── 키보드 단축키: 스페이스바로 랜덤 색상 ──
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    document.getElementById('randomBtn').click();
  }
});
