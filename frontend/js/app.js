const API_BASE = 'http://localhost:5000/api';

async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not logged in');
    const user = await res.json();
    document.getElementById('userInfo').innerText = `${user.name} (${user.email})`;
    window.currentUser = user;
  } catch (err) {
    document.getElementById('userInfo').innerText = 'Not signed in';
  }
}

fetchProfile();

const attendanceForm = document.getElementById('attendanceForm');
attendanceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!window.currentUser) return alert('Please sign in with Google first');

  const data = {
    userId: window.currentUser._id,
    date: document.getElementById('date').value,
    periodNumber: parseInt(document.getElementById('period').value, 10),
    status: document.getElementById('status').value,
    subject: document.getElementById('subject').value
  };

  try {
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed');

    document.getElementById('result').innerText = 'Attendance marked';
    loadSummary();
  } catch (err) {
    document.getElementById('result').innerText = `Error: ${err.message}`;
  }
});

async function loadSummary() {
  if (!window.currentUser) return;
  try {
    const res = await fetch(`${API_BASE}/attendance/stats/${window.currentUser._id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    const s = json.stats;
    document.getElementById('summaryContent').innerHTML = `Present: ${s.totalPresent} | Absent: ${s.totalAbsent} | Leave: ${s.totalLeave} | %: ${s.attendancePercentage}`;
  } catch (err) {
    document.getElementById('summaryContent').innerText = 'Unable to load summary';
  }
}

window.loadSummary = loadSummary;
