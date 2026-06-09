// API base: use localhost backend in dev, otherwise assume relative path
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

// Theme handling
function applyTheme(theme) {
  document.body.classList.toggle('theme-light', theme === 'light');
  document.body.classList.toggle('theme-dark', theme !== 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'light' ? '☀' : '🌙';
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) themeToggle.addEventListener('click', () => {
  const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

function showToast(msg, timeout = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._hide);
  t._hide = setTimeout(() => { t.style.display = 'none'; }, timeout);
}

async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not logged in');
    const user = await res.json();
    renderProfile(user);
    window.currentUser = user;
    await loadSummary();
  } catch (err) {
    renderSignedOut();
  }
}

function renderProfile(user) {
  const el = document.getElementById('userInfo');
  if (!el) return;
  const role = (user.role || user.role === 0) ? user.role : (user.role || 'student');
  const roleText = (role || 'student').toString();
  const roleClass = roleText.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-meta">
        <div style="display:flex;align-items:center;gap:10px">
          <strong>${user.name || 'User'}</strong>
          <span class="role-badge ${roleClass}">${roleText.charAt(0).toUpperCase() + roleText.slice(1)}</span>
        </div>
        <div class="muted">${user.email || ''}</div>
      </div>
    </div>`;
  const signin = document.getElementById('signinLink');
  const signout = document.getElementById('signoutBtn');
  if (signin) signin.style.display = 'none';
  if (signout) signout.style.display = 'inline-flex';
}

function renderSignedOut() {
  const el = document.getElementById('userInfo');
  if (el) el.textContent = 'Not signed in';
  const signin = document.getElementById('signinLink');
  const signout = document.getElementById('signoutBtn');
  if (signin) signin.style.display = 'inline-flex';
  if (signout) signout.style.display = 'none';
}

// Sign out (mock or real if endpoint exists)
async function signOut() {
  try {
    await fetch(`${API_BASE.replace('/api','')}/auth/mock-logout`, { method: 'POST', credentials: 'include' });
  } catch (e) {
    // ignore
  }
  window.currentUser = null;
  renderSignedOut();
  showToast('Signed out');
}

document.getElementById('signoutBtn')?.addEventListener('click', signOut);

fetchProfile();

// Attendance form
const attendanceForm = document.getElementById('attendanceForm');
if (attendanceForm) attendanceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!window.currentUser) return showToast('Please sign in first');

  const data = {
    userId: window.currentUser._id || window.currentUser.id,
    date: document.getElementById('date').value,
    periodNumber: parseInt(document.getElementById('period').value, 10),
    status: document.getElementById('status').value,
    subject: document.getElementById('subject').value || ''
  };

  const resultEl = document.getElementById('result');
  try {
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed');
    resultEl.textContent = 'Attendance marked';
    showToast('Attendance marked');
    loadSummary();
  } catch (err) {
    resultEl.textContent = `Error: ${err.message}`;
    showToast(`Error: ${err.message}`);
  }
});

// Summary loader
async function loadSummary() {
  if (!window.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/attendance/stats/${window.currentUser._id || window.currentUser.id}`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    const s = json.stats;
    document.getElementById('summaryContent').innerHTML = `Present: ${s.totalPresent} &nbsp;|&nbsp; Absent: ${s.totalAbsent} &nbsp;|&nbsp; Leave: ${s.totalLeave} &nbsp;|&nbsp; %: ${s.attendancePercentage}`;
  } catch (err) {
    document.getElementById('summaryContent').innerText = 'Unable to load summary';
  }
}

window.loadSummary = loadSummary;
