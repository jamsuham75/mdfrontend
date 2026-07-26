// ── 상태 ──────────────────────────────────────────────────────
let todos = [];        // 할 일 전체 배열
let nextId = 1;        // 다음 항목 ID
let currentFilter = 'all'; // 현재 필터

// ── 요소 참조 ──────────────────────────────────────────────────
const todoInput   = document.getElementById('todoInput');
const addBtn      = document.getElementById('addBtn');
const todoList    = document.getElementById('todoList');
const emptyState  = document.getElementById('emptyState');
const remaining   = document.getElementById('remaining');
const clearDoneBtn= document.getElementById('clearDoneBtn');
const dateDisplay = document.getElementById('dateDisplay');
const countAll    = document.getElementById('countAll');
const countActive = document.getElementById('countActive');
const countDone   = document.getElementById('countDone');

// ── 날짜 표시 ──────────────────────────────────────────────────
dateDisplay.textContent = new Date().toLocaleDateString('ko-KR',
  { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

// ── 할 일 추가 ─────────────────────────────────────────────────
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) { todoInput.focus(); return; }
  todos.push({ id: nextId++, text, done: false });
  todoInput.value = '';
  todoInput.focus();
  render();
}

// ── 완료 토글 ──────────────────────────────────────────────────
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) todo.done = !todo.done;
  render();
}

// ── 삭제 ────────────────────────────────────────────────────────
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  render();
}

// ── XSS 방지: HTML 특수문자 이스케이프 ─────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
             .replace(/>/g,'&gt;').replace(/'/g,'&#39;');
}

// ── 렌더링 (핵심 함수) ─────────────────────────────────────────
function render() {
  // 필터 적용
  const filtered = todos.filter(t => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'done')   return  t.done;
    return true;
  });

  // DocumentFragment로 한 번에 DOM 업데이트
  const fragment = document.createDocumentFragment();
  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox"
             ${todo.done ? 'checked' : ''}
             data-action="toggle" data-id="${todo.id}">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="todo-delete" data-action="delete"
              data-id="${todo.id}" aria-label="삭제">✕</button>`

    fragment.appendChild(li);
  });
  todoList.innerHTML = '';
  todoList.appendChild(fragment);

  // 카운트 업데이트
  const doneCount   = todos.filter(t => t.done).length;
  const activeCount = todos.length - doneCount;
  countAll.textContent    = todos.length;
  countActive.textContent = activeCount;
  countDone.textContent   = doneCount;
  remaining.textContent   = `${activeCount}개 남음`;
  emptyState.classList.toggle('visible', filtered.length === 0);
}

// ── 이벤트 등록 ────────────────────────────────────────────────
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// 이벤트 위임: 목록 전체를 하나의 리스너로
todoList.addEventListener('click', (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const id = Number(actionEl.dataset.id);
  if (actionEl.dataset.action === 'toggle') toggleTodo(id);
  if (actionEl.dataset.action === 'delete') deleteTodo(id);
});

// 이벤트 위임: 필터 탭
document.querySelector('.filter-tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentFilter = tab.dataset.filter;
  render();
});

clearDoneBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  render();
});

// 초기 렌더링
render();
