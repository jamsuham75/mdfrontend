const KEY = 'memos';
let memos = JSON.parse(localStorage.getItem(KEY) || '[]');
let keyword = '';

const newText = document.getElementById('newText');
const search  = document.getElementById('search');
const list    = document.getElementById('list');

function save() { localStorage.setItem(KEY, JSON.stringify(memos)); }

function render() {
  const filtered = memos.filter(m => m.text.includes(keyword));
  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty">메모가 없습니다</p>';
    return;
  }
  list.innerHTML = filtered.map(m => `
    <li class="memo-item" data-id="${m.id}">
      <div>
        <div class="memo-text">${escapeHtml(m.text)}</div>
        <div class="memo-date">${new Date(m.createdAt).toLocaleString('ko-KR')}</div>
      </div>
      <button class="btn-del" data-action="del" data-id="${m.id}">삭제</button>
    </li>
  `).join('');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&').replace(/</g,'<')
          .replace(/>/g,'>').replace(/'/g,''')
          .replace(/\n/g,'<br>');
}

function addMemo() {
  const text = newText.value.trim();
  if (!text) return;
  memos.unshift({
    id: Date.now(),
    text,
    createdAt: new Date().toISOString(),
  });
  save();
  newText.value = '';
  render();
}

list.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="del"]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  memos = memos.filter(m => m.id !== id);
  save();
  render();
});

search.addEventListener('input', (e) => {
  keyword = e.target.value;
  render();
});

// 다른 탭에서 변경 감지
window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    memos = JSON.parse(e.newValue || '[]');
    render();
  }
});

render();