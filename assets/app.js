/* ════════════════════════════════════════════
   Research Hub · App JS
   動態渲染 + 搜尋 + 篩選
   ════════════════════════════════════════════ */

let MANIFEST = null;

async function loadManifest() {
  if (MANIFEST) return MANIFEST;
  const res = await fetch('manifest.json');
  if (!res.ok) throw new Error('Failed to load manifest.json');
  MANIFEST = await res.json();
  return MANIFEST;
}

function getCategoryName(catId) {
  const m = MANIFEST.categories.find(c => c.id === catId);
  return m ? m.name : catId;
}

function getCategoryTagClass(catId) {
  const map = {
    semi: 'tag-cat-semi',
    tech: 'tag-cat-tech',
    software: 'tag-cat-software',
    industrial: 'tag-cat-industrial',
    utility: 'tag-cat-utility',
    other: 'tag-cat-other'
  };
  return map[catId] || 'tag-cat-other';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

/* ════════════════════════════════════════════
   首頁渲染
   ════════════════════════════════════════════ */

async function renderHomepage() {
  const m = await loadManifest();

  // Hero stats
  const statsEl = document.getElementById('hero-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div>
        <div class="hstat-num">${m.earnings.length}</div>
        <div class="hstat-label">財報分析</div>
      </div>
      <div>
        <div class="hstat-num">${m.research.length}</div>
        <div class="hstat-label">主題研究</div>
      </div>
      <div>
        <div class="hstat-num">${m.site.year}</div>
        <div class="hstat-label">維護中</div>
      </div>
    `;
  }

  // Weekly row
  const weeklyEl = document.getElementById('weekly-row');
  if (weeklyEl && m.weekly) {
    const w = m.weekly.latest;
    const flagsHtml = w.flags.map(f => {
      const cls = f === '最新' ? 'flag-new' : 'flag-region';
      return `<span class="flag ${cls}">${escapeHtml(f)}</span>`;
    }).join('');
    weeklyEl.href = m.weekly.url;
    weeklyEl.innerHTML = `
      <div class="weekly-date-inline">
        <div class="range">${escapeHtml(w.range)}</div>
        <div class="year">${escapeHtml(w.year)}</div>
      </div>
      <div class="weekly-content">
        <div class="weekly-title">${escapeHtml(w.title)}</div>
        <div class="weekly-summary">${w.summary}</div>
      </div>
      <div class="weekly-flags">${flagsHtml}</div>
      <div class="weekly-arrow">›</div>
    `;
  }

  // Earnings grid (latest 4 + 2 placeholder = 6 slots, or fill more if many reports)
  const earningsEl = document.getElementById('earnings-grid');
  if (earningsEl) {
    const sorted = [...m.earnings].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
    const latest = sorted.slice(0, 6);
    let html = latest.map(renderEarnCard).join('');
    // Fill placeholders if fewer than 6
    const placeholders = Math.max(0, 6 - latest.length);
    for (let i = 0; i < placeholders; i++) {
      html += renderPlaceholderCard('earn');
    }
    earningsEl.innerHTML = html;
  }

  // Research grid (latest 3 + placeholders)
  const researchEl = document.getElementById('research-grid');
  if (researchEl) {
    const latest = m.research.slice(0, 3);
    let html = latest.map(renderResearchCard).join('');
    const placeholders = Math.max(0, 3 - latest.length);
    for (let i = 0; i < placeholders; i++) {
      html += renderPlaceholderCard('research');
    }
    researchEl.innerHTML = html;
  }
}

function renderEarnCard(e) {
  const catName = getCategoryName(e.category);
  const catClass = getCategoryTagClass(e.category);
  const tagsHtml = e.tags.map(t =>
    `<span class="tag tag-theme">${escapeHtml(t)}</span>`
  ).join('');
  const stockDir = e.metrics.stock_reaction_dir || 'neutral';
  const revDir = e.metrics.rev_yoy_dir || 'neutral';
  return `
    <a class="earn-card" href="${escapeHtml(e.file)}">
      <div class="earn-top">
        <div class="earn-ticker-wrap">
          <div class="earn-ticker">${escapeHtml(e.ticker)}</div>
          <div class="earn-company">${escapeHtml(e.company_en)} · ${escapeHtml(e.company_zh)}</div>
        </div>
        <div class="earn-quarter">${escapeHtml(e.quarter)}</div>
      </div>
      <div class="earn-headline">${escapeHtml(e.headline)}</div>
      <div class="earn-metrics">
        <div class="metric">
          <div class="metric-label">Stock Reaction</div>
          <div class="metric-value ${stockDir}">${escapeHtml(e.metrics.stock_reaction)}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Rev YoY</div>
          <div class="metric-value ${revDir}">${escapeHtml(e.metrics.rev_yoy)}</div>
        </div>
      </div>
      <div class="tag-row">
        <span class="tag ${catClass}">${escapeHtml(catName)}</span>
        ${tagsHtml}
      </div>
    </a>
  `;
}

function renderResearchCard(r) {
  const catClass = getCategoryTagClass(r.category);
  const catName = getCategoryName(r.category);
  const tagsHtml = r.tags.map(t =>
    `<span class="tag tag-theme">${escapeHtml(t)}</span>`
  ).join('');
  const statsHtml = (r.stats || []).map(s =>
    `<span><strong>${escapeHtml(s.value)}</strong> ${escapeHtml(s.label)}</span>`
  ).join('');
  return `
    <a class="research-card" href="${escapeHtml(r.file)}">
      <div class="research-eyebrow">${escapeHtml(r.eyebrow || '')}</div>
      <div class="research-title">${escapeHtml(r.title)}</div>
      <div class="research-subtitle">${escapeHtml(r.subtitle)}</div>
      <div class="research-meta">
        ${statsHtml}
        <span>${escapeHtml(r.date)}</span>
      </div>
      <div class="tag-row">
        <span class="tag ${catClass}">${escapeHtml(catName)}</span>
        ${tagsHtml}
      </div>
    </a>
  `;
}

function renderPlaceholderCard(type) {
  const text = type === 'research' ? '未來主題研究將在這裡' : '未來財報將在這裡';
  const hint = type === 'research' ? 'COMING SOON' : 'COMING SOON · Q2 2026';
  const cls = type === 'research' ? 'research-card' : 'earn-card';
  return `
    <div class="${cls} placeholder">
      <div class="placeholder-icon">＋</div>
      <div class="placeholder-text">${text}</div>
      <div class="placeholder-hint">${hint}</div>
    </div>
  `;
}

/* ════════════════════════════════════════════
   財報列表頁
   ════════════════════════════════════════════ */

let earningsState = {
  search: '',
  category: 'all',
  tags: new Set(),
  sort: 'date'  // 'date' | 'company'
};

async function initEarningsPage() {
  const m = await loadManifest();

  // Render category tabs
  const tabsEl = document.getElementById('cat-tabs');
  tabsEl.innerHTML = m.categories.map(c =>
    `<button class="cat-tab ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}">${escapeHtml(c.name)}</button>`
  ).join('');

  // Render tag chips (collect unique tags from all earnings)
  const allTags = new Set();
  m.earnings.forEach(e => e.tags.forEach(t => allTags.add(t)));
  const chipsEl = document.getElementById('tag-chips');
  if (allTags.size > 0) {
    const chipsHtml = `
      <span class="tag-chip-label">主題</span>
      ${[...allTags].sort().map(t =>
        `<button class="tag-chip" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`
      ).join('')}
      <button class="tag-chip-clear" id="tag-clear" style="display:none;">清除</button>
    `;
    chipsEl.innerHTML = chipsHtml;
  }

  // Bind events
  document.getElementById('search-input').addEventListener('input', (ev) => {
    earningsState.search = ev.target.value.trim().toLowerCase();
    renderEarningsList();
  });

  tabsEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.cat-tab');
    if (!btn) return;
    earningsState.category = btn.dataset.cat;
    tabsEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderEarningsList();
  });

  chipsEl.addEventListener('click', (ev) => {
    const chip = ev.target.closest('.tag-chip');
    const clearBtn = ev.target.closest('#tag-clear');
    if (clearBtn) {
      earningsState.tags.clear();
      chipsEl.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
      document.getElementById('tag-clear').style.display = 'none';
      renderEarningsList();
      return;
    }
    if (!chip) return;
    const tag = chip.dataset.tag;
    if (earningsState.tags.has(tag)) {
      earningsState.tags.delete(tag);
      chip.classList.remove('active');
    } else {
      earningsState.tags.add(tag);
      chip.classList.add('active');
    }
    document.getElementById('tag-clear').style.display =
      earningsState.tags.size > 0 ? 'inline-block' : 'none';
    renderEarningsList();
  });

  document.getElementById('sort-toggle').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    earningsState.sort = btn.dataset.sort;
    document.querySelectorAll('#sort-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEarningsList();
  });

  renderEarningsList();
}

function filterEarnings() {
  let filtered = MANIFEST.earnings;

  if (earningsState.category !== 'all') {
    filtered = filtered.filter(e => e.category === earningsState.category);
  }

  if (earningsState.tags.size > 0) {
    // OR logic — must match at least one selected tag
    filtered = filtered.filter(e =>
      e.tags.some(t => earningsState.tags.has(t))
    );
  }

  if (earningsState.search) {
    const q = earningsState.search;
    filtered = filtered.filter(e =>
      e.ticker.toLowerCase().includes(q) ||
      e.company_en.toLowerCase().includes(q) ||
      (e.company_zh && e.company_zh.toLowerCase().includes(q))
    );
  }

  return filtered;
}

function renderEarningsList() {
  const filtered = filterEarnings();
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = filtered.length;

  const container = document.getElementById('results-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <div class="text">沒有符合條件的財報</div>
      </div>
    `;
    return;
  }

  if (earningsState.sort === 'date') {
    const sorted = [...filtered].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
    container.className = 'earnings-grid';
    container.innerHTML = sorted.map(renderEarnCard).join('');
  } else {
    // Group by ticker
    const groups = {};
    filtered.forEach(e => {
      if (!groups[e.ticker]) {
        groups[e.ticker] = {
          ticker: e.ticker,
          company_en: e.company_en,
          company_zh: e.company_zh,
          items: []
        };
      }
      groups[e.ticker].items.push(e);
    });
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    const sortedGroups = Object.values(groups).sort((a, b) =>
      a.ticker.localeCompare(b.ticker)
    );
    container.className = '';
    container.innerHTML = sortedGroups.map(renderCompanyGroup).join('');
  }
}

function renderCompanyGroup(g) {
  const itemsHtml = g.items.map(e => {
    const dir = e.metrics.stock_reaction_dir || 'neutral';
    return `
      <a class="company-group-item" href="${escapeHtml(e.file)}">
        <span class="quarter">${escapeHtml(e.quarter)}</span>
        <span class="headline">${escapeHtml(e.headline)}</span>
        <span class="stock-react ${dir}">${escapeHtml(e.metrics.stock_reaction)}</span>
        <span class="arrow">›</span>
      </a>
    `;
  }).join('');
  return `
    <div class="company-group">
      <div class="company-group-header">
        <span class="company-group-ticker">${escapeHtml(g.ticker)}</span>
        <span class="company-group-name">${escapeHtml(g.company_en)} · ${escapeHtml(g.company_zh)}</span>
        <span class="company-group-count">${g.items.length} 份報告</span>
      </div>
      <div class="company-group-list">${itemsHtml}</div>
    </div>
  `;
}

/* ════════════════════════════════════════════
   主題研究列表頁
   ════════════════════════════════════════════ */

let researchState = {
  search: '',
  category: 'all',
  tags: new Set()
};

async function initResearchPage() {
  const m = await loadManifest();

  // Tabs
  const tabsEl = document.getElementById('cat-tabs');
  tabsEl.innerHTML = m.categories.map(c =>
    `<button class="cat-tab ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}">${escapeHtml(c.name)}</button>`
  ).join('');

  // Tag chips
  const allTags = new Set();
  m.research.forEach(r => r.tags.forEach(t => allTags.add(t)));
  const chipsEl = document.getElementById('tag-chips');
  if (allTags.size > 0) {
    chipsEl.innerHTML = `
      <span class="tag-chip-label">主題</span>
      ${[...allTags].sort().map(t =>
        `<button class="tag-chip" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`
      ).join('')}
      <button class="tag-chip-clear" id="tag-clear" style="display:none;">清除</button>
    `;
  }

  // Events
  document.getElementById('search-input').addEventListener('input', (ev) => {
    researchState.search = ev.target.value.trim().toLowerCase();
    renderResearchList();
  });

  tabsEl.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.cat-tab');
    if (!btn) return;
    researchState.category = btn.dataset.cat;
    tabsEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderResearchList();
  });

  chipsEl.addEventListener('click', (ev) => {
    const chip = ev.target.closest('.tag-chip');
    const clearBtn = ev.target.closest('#tag-clear');
    if (clearBtn) {
      researchState.tags.clear();
      chipsEl.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
      document.getElementById('tag-clear').style.display = 'none';
      renderResearchList();
      return;
    }
    if (!chip) return;
    const tag = chip.dataset.tag;
    if (researchState.tags.has(tag)) {
      researchState.tags.delete(tag);
      chip.classList.remove('active');
    } else {
      researchState.tags.add(tag);
      chip.classList.add('active');
    }
    document.getElementById('tag-clear').style.display =
      researchState.tags.size > 0 ? 'inline-block' : 'none';
    renderResearchList();
  });

  renderResearchList();
}

function renderResearchList() {
  let filtered = MANIFEST.research;

  if (researchState.category !== 'all') {
    filtered = filtered.filter(r => r.category === researchState.category);
  }
  if (researchState.tags.size > 0) {
    filtered = filtered.filter(r =>
      r.tags.some(t => researchState.tags.has(t))
    );
  }
  if (researchState.search) {
    const q = researchState.search;
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subtitle.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = filtered.length;

  const container = document.getElementById('results-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔬</div>
        <div class="text">沒有符合條件的研究</div>
      </div>
    `;
    container.className = '';
    return;
  }

  container.className = 'research-grid';
  container.innerHTML = filtered.map(renderResearchCard).join('');
}
