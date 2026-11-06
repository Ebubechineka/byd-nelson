/* ==========================================================================
   BYD Nelson — Admin app logic
   Static site: no server. All edits live in the browser until you press
   Publish, which writes data/cars.json + data/news.json + data/settings.json
   to GitHub via the Contents API using a Personal Access Token kept in
   localStorage.
   ========================================================================== */

const REPO   = 'Ebubechineka/byd-nelson';
const BRANCH = 'main';
const TOKEN_KEY = 'byd_gh_token';
const SESSION_KEY = 'byd_admin_session';

/* ---------- auth guard ----------
   The password login gate has been removed: the admin panel now opens
   straight to the dashboard. Publishing is protected by the GitHub token,
   which only the owner holds. requireAuth() is kept as a no-op so the
   existing page scripts keep working. */
function requireAuth() { return true; }
function logout() { location.href = 'index.html'; }

/* ---------- token ---------- */
function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t.trim()); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

/* ---------- data access ---------- */
const DATA = { cars: [], news: [], settings: {} };

async function loadData() {
  const bust = '?t=' + Date.now();
  const [c, n, s] = await Promise.all([
    fetch('../data/cars.json' + bust, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch('../data/news.json' + bust, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch('../data/settings.json' + bust, { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).catch(() => ({}))
  ]);
  DATA.cars = Array.isArray(c) ? c : [];
  DATA.news = Array.isArray(n) ? n : [];
  DATA.settings = (s && typeof s === 'object' && !Array.isArray(s)) ? s : {};
  return DATA;
}

/* ---------- dealership contact details ---------- */
const SETTINGS_KEY = 'byd_site_settings';

function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through */ }
  return DATA.settings || {};
}

function setSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  DATA.settings = s;
}

async function loadSettings() {
  if (!DATA.settings || !Object.keys(DATA.settings).length) {
    const bust = '?t=' + Date.now();
    const s = await fetch('../data/settings.json' + bust, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .catch(() => ({}));
    DATA.settings = (s && typeof s === 'object' && !Array.isArray(s)) ? s : {};
  }
  return getSettings();
}

/* ---------- helpers ---------- */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const money = v => {
  if (v == null || v === '') return '';
  const n = String(v).replace(/[^0-9.]/g, '');
  if (!n) return String(v);
  return '$' + Number(n).toLocaleString('en-NZ', { maximumFractionDigits: 0 });
};

function toast(msg, kind) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.className = 'toast show ' + (kind || '');
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast'; }, 4200);
}

function uid(prefix) {
  return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- image upload -> data URL ---------- */
function readImageFile(file, maxW = 1400) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!/^image\//.test(file.type)) return reject(new Error('Not an image file'));
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Could not read file'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(fr.result); // fall back to raw data URL
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        try { resolve(cv.toDataURL('image/jpeg', 0.82)); }
        catch (e) { resolve(fr.result); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ==========================================================================
   GitHub Contents API
   ========================================================================== */
async function ghGet(path) {
  const r = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: { Authorization: 'token ' + getToken(), Accept: 'application/vnd.github+json' }, cache: 'no-store' }
  );
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('GitHub read failed (' + r.status + ') for ' + path);
  return r.json();
}

async function ghPut(path, contentString, message) {
  const existing = await ghGet(path);
  const body = {
    message: message || ('Update ' + path),
    content: b64EncodeUnicode(contentString),
    branch: BRANCH
  };
  if (existing && existing.sha) body.sha = existing.sha;

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: 'token ' + getToken(),
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('GitHub write failed (' + r.status + ') for ' + path + ': ' + t.slice(0, 200));
  }
  return r.json();
}

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/* ---------- verify token ---------- */
async function verifyToken() {
  const t = getToken();
  if (!t) throw new Error('No token saved. Add one in Settings.');
  const r = await fetch('https://api.github.com/user', {
    headers: { Authorization: 'token ' + t }, cache: 'no-store'
  });
  if (!r.ok) throw new Error('Token rejected by GitHub (' + r.status + ')');
  const u = await r.json();
  const rr = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { Authorization: 'token ' + t }, cache: 'no-store'
  });
  if (!rr.ok) throw new Error('Token cannot access ' + REPO);
  const repo = await rr.json();
  if (!repo.permissions || !repo.permissions.push) throw new Error('Token has no push access to ' + REPO);
  return { user: u.login, repo: repo.full_name };
}

/* ---------- publish ---------- */
async function publishAll() {
  if (!getToken()) throw new Error('No GitHub token saved. Open Settings and paste one first.');

  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const results = [];

  results.push(await ghPut('data/cars.json',
    JSON.stringify(DATA.cars, null, 2) + '\n',
    'Admin: update car inventory (' + stamp + ')'));

  results.push(await ghPut('data/news.json',
    JSON.stringify(DATA.news, null, 2) + '\n',
    'Admin: update news posts (' + stamp + ')'));

  results.push(await ghPut('data/settings.json',
    JSON.stringify(getSettings(), null, 2) + '\n',
    'Admin: update dealership contact details (' + stamp + ')'));

  return results;
}

/* ---------- expose ---------- */
window.BYD = {
  REPO, BRANCH, DATA,
  requireAuth, logout,
  getToken, setToken, clearToken, verifyToken,
  loadData, publishAll,
  getSettings, setSettings, loadSettings,
  esc, money, toast, uid, readImageFile
};
