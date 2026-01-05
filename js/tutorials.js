const groupsEl = document.getElementById('groups');

function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function groupByLanguage(list){
  const LANGS = ['JavaScript','Python','C++','HTML','CSS','Java'];
  const map = {};
  list.forEach(t=>{
    const tags = (t.tags||[]).map(s=>String(s).trim());
    // include explicit language field when available
    if(t.language && !tags.includes(t.language)) tags.unshift(String(t.language));
    let found = 'Other';
    for(const L of LANGS){
      if(tags.find(x=>x.toLowerCase()===L.toLowerCase())){ found = L; break; }
    }
    if (!map[found]) map[found] = [];
    map[found].push(t);
  });
  return map;
}

function makeCard(t){
  const div = document.createElement('a');
  div.className = 'card card-link';
  div.href = `tutorial.html?id=${encodeURIComponent(t.id)}`;
  div.innerHTML = `
    <div class="meta">${t.level}</div>
    <h3>${escapeHtml(t.title)}</h3>
    <p>${escapeHtml(t.description)}</p>
  `;
  return div;
}

function renderGroups(data){
  const grouped = groupByLanguage(data);
  groupsEl.innerHTML = '';
  Object.keys(grouped).sort().forEach(lang=>{
    const section = document.createElement('section');
    section.className = 'group';
    const h = document.createElement('h2');
    h.textContent = lang;
    section.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'grid';
    grouped[lang].forEach(t=>{
      grid.appendChild(makeCard(t));
    });
    section.appendChild(grid);
    groupsEl.appendChild(section);
  });
}

fetch('data/tutorials.json')
  .then(r=>r.json())
  .then(renderGroups)
  .catch(err=>{
    groupsEl.innerHTML = '<div class="empty">Failed to load tutorials.</div>';
    console.error(err);
  });
