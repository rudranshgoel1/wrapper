const API_URL = '/api/rap';
const MODEL   = 'mistralai/mistral-small-3.1-24b-instruct:free';

let items         = [];
let selectedStyle = 'old school';
let bangerCount   = 0;
let isLoading     = false;


const itemInput     = document.getElementById('item-input');
const itemsArea     = document.getElementById('items-area');
const itemCountNote = document.getElementById('item-count-note');
const rapOutputWrap = document.getElementById('rap-output-wrap');
const trackDot      = document.getElementById('track-dot');
const statusText    = document.getElementById('status-text');
const logList       = document.getElementById('log-list');
const btnGenerate   = document.getElementById('btn-generate');
const btnCopy       = document.getElementById('btn-copy');
const statItems     = document.getElementById('stat-items');
const statBars      = document.getElementById('stat-bars');
const statBangers   = document.getElementById('stat-bangers');


document.getElementById('style-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.style-btn');
  if (!btn) return;
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedStyle = btn.dataset.style;
  addLog('Style: ' + selectedStyle, 'info');
});


function addItem() {
  const val = itemInput.value.trim();
  if (!val) return;
  if (items.map(i => i.toLowerCase()).includes(val.toLowerCase())) {
    addLog('"' + val + '" is already in your list!', 'info');
    itemInput.value = '';
    return;
  }
  if (items.length >= 20) {
    addLog("Max 20 items! That's a whole album already.", 'info');
    return;
  }
  items.push(val);
  itemInput.value = '';
  renderItems();
  updateStats();
  addLog('Added: ' + val, 'info');
}


function renderItems() {
  itemsArea.innerHTML = '';
  if (items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'items-empty';
    empty.textContent = 'Your cart is empty';
    itemsArea.appendChild(empty);
    return;
  }
  items.forEach((item, i) => {
    const tag = document.createElement('div');
    tag.className = 'item-tag';
    tag.innerHTML =
      '<span>' + escapeHtml(item) + '</span>' +
      '<button class="item-tag-remove" title="Remove" onclick="removeItem(' + i + ')">&times;</button>';
    itemsArea.appendChild(tag);
  });
}


function removeItem(index) {
  const removed = items[index];
  items.splice(index, 1);
  renderItems();
  updateStats();
  addLog('Removed: ' + removed, 'info');
}


function clearItems() {
  if (items.length === 0) return;
  items = [];
  renderItems();
  updateStats();
  addLog('Grocery list cleared.', 'info');
}


function updateStats() {
  statItems.textContent = items.length;
  itemCountNote.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');
}


async function generateRap() {
  if (isLoading) return;
  if (items.length === 0) {
    addLog('Add some groceries first!', 'info');
    return;
  }

  isLoading = true;
  setLoadingUI(true);
  addLog('Cooking up a ' + selectedStyle + ' banger...', 'info');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(items, selectedStyle) }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('API ' + response.status + ': ' + errText.slice(0, 120));
    }

    const data = await response.json();
    const rap  = (data.choices?.[0]?.message?.content || '').trim();
    if (!rap) throw new Error('Empty response from API');

    displayRap(rap);
    bangerCount++;
    statBangers.textContent = bangerCount;
    const barCount = rap.split('\n').filter(l => l.trim()).length;
    statBars.textContent = barCount;
    addLog('Dropped a ' + barCount + '-bar ' + selectedStyle + ' banger!', 'win');

  } catch (err) {
    showError(err.message);
    addLog('Error: ' + err.message, 'lose');
  } finally {
    isLoading = false;
    setLoadingUI(false);
  }
}

function buildPrompt(items, style) {
  return 'You are a master rapper. Turn this grocery list into a ' + style + ' rap song.\n\n' +
    'Grocery list: ' + items.join(', ') + '\n\n' +
    'Rules:\n' +
    '- Write 12-16 bars\n' +
    '- Make it rhyme with great flow\n' +
    '- Weave ALL the items into the lyrics naturally\n' +
    '- Match the energy of ' + style + ' rap\n' +
    '- Be creative, witty, entertaining\n' +
    '- Output ONLY the rap lyrics, nothing else\n\nGo:';
}

function displayRap(rap) {
  rapOutputWrap.innerHTML = '<div class="rap-output">' + escapeHtml(rap) + '</div>';
  btnCopy.style.display = '';
  statusText.textContent = 'Latest banger ready! (' + selectedStyle + ')';
}

function setLoadingUI(on) {
  btnGenerate.disabled = on;
  if (on) {
    trackDot.classList.add('live');
    statusText.textContent = 'Writing your banger...';
    btnCopy.style.display = 'none';
    rapOutputWrap.innerHTML =
      '<div class="loading-lines">' +
      '<div class="shimmer" style="width:80%"></div>' +
      '<div class="shimmer" style="width:65%"></div>' +
      '<div class="shimmer" style="width:90%"></div>' +
      '<div class="shimmer" style="width:55%"></div>' +
      '<div class="shimmer" style="width:75%"></div>' +
      '<div class="shimmer" style="width:60%"></div>' +
      '<div class="shimmer" style="width:85%"></div>' +
      '</div>';
  } else {
    trackDot.classList.remove('live');
  }
}

function showError(msg) {
  rapOutputWrap.innerHTML =
    '<p class="rap-placeholder">Something went wrong:<br><br><strong>' +
    escapeHtml(msg) + '</strong><br><br>Check your API key and try again.</p>';
  statusText.textContent = 'Error — see log';
}

function copyRap() {
  const rapEl = rapOutputWrap.querySelector('.rap-output');
  if (!rapEl) return;
  navigator.clipboard.writeText(rapEl.textContent).then(() => {
    btnCopy.textContent = 'Copied!';
    addLog('Lyrics copied to clipboard.', 'win');
    setTimeout(() => { btnCopy.textContent = 'Copy Lyrics'; }, 2000);
  });
}

function addLog(message, type) {
  type = type || 'info';
  const li = document.createElement('li');
  li.className = 'log-entry log-' + type;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  li.textContent = '[' + time + '] ' + message;
  logList.prepend(li);
  while (logList.children.length > 30) logList.removeChild(logList.lastChild);
}


function clearLog() {
  logList.innerHTML = '';
  addLog('Log cleared.', 'info');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

itemInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem(); });

updateStats();
renderItems();

async function toggleBeat() {
  const btn = document.getElementById('btn-beat');
  const btnLabel = document.getElementById('btn-beat-label');
  const bpmNote = document.getElementById('beat-bpm-note');
  const icon = btn.querySelector('.btn-race-icon');

  if (isBeatPlaying()) {
    stopBeat();
    btn.style.background = 'var(-paper)';
    btn.style.color = 'var(--ink)';
    icon.textContent = '\u25B6';
    btnLabel.textContent = 'Play Beat';
    bpmNote.textContent = '';
    addLog('Beat stopped.', 'info');
  } else {
    await startBeat(selectedStyle);
    const bpm = { 'old school': 95, 'trap': 140, 'boom bap': 90, 'drill': 145, 'conscious': 88, 'funny comedic': 100 }[selectedStyle] || 95;
    btn.style.background = 'var(--ink)';
    btn.style.color = 'var(--paper)';
    icon.textContent = '\u23F9';
    btnLabel.textContent = 'Stop Beat';
    bpmNote.textContent = bpm + ' bpm';
    addLog('Beat started: ' + selectedStyle + ' at ' + bpm + ' BPM', 'win');
  }
}