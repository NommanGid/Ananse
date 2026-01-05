const listEl = document.getElementById('tutorial-list');
const searchInput = document.getElementById('search');

let tutorials = [];

function render(list) {
	if (!list.length) {
		listEl.innerHTML = '<div class="empty">No tutorials found.</div>';
		return;
	}
	listEl.innerHTML = list.map(t => {
		const tags = t.tags || (t.language ? [t.language] : []);
		const desc = t.description || t.explanation || '';
		const code = t.code || t.example || '';
		return `
		<article class="card">
			<div class="meta">${t.level || ''}${tags.length? ' • ' + tags.join(', '): ''}</div>
			<h3>${t.title || ''}</h3>
			<p>${desc}</p>
			<div class="tags">${tags.map(tag=>`<span class="tag">${tag}</span>`).join('')}</div>
			<details style="margin-top:10px">
				<summary>Show example</summary>
				<pre><code>${escapeHtml(code)}</code></pre>
			</details>
		</article>
		`;
	}).join('');
}

function escapeHtml(s){
	return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function load(){
	fetch('data/tutorials.json')
		.then(r=>r.json())
		.then(data=>{
			tutorials = data;
			render(tutorials.slice(0,6));
		}).catch(err=>{
			listEl.innerHTML = '<div class="empty">Failed to load tutorials.</div>';
			console.error(err);
		});
}

function filter(q){
	q = (q||'').toLowerCase().trim();
	if (!q) return render(tutorials.slice(0,6));
	const res = tutorials.filter(t=>{
		return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.join(' ').toLowerCase().includes(q);
	});
	render(res);
}

searchInput && searchInput.addEventListener('input', e=>filter(e.target.value));

document.addEventListener('DOMContentLoaded', load);

/* ==========================
	 Dark mode toggle (beginner-friendly)
	 - looks for a button with id `darkModeToggle`
	 - toggles `dark-mode` class on <body>
	 - saves preference to localStorage as 'site-theme' ('dark'|'light')
	 ==========================
*/
(function(){
	const STORAGE_KEY = 'site-theme';
	const toggleId = 'darkModeToggle';
	const body = document.body;

	// apply stored preference or keep default (light)
	function applyPreference(pref){
		if(pref === 'dark') body.classList.add('dark-mode'); else body.classList.remove('dark-mode');
		updateToggleLabel();
	}

	function updateToggleLabel(){
		const btn = document.getElementById(toggleId);
		if(!btn) return;
		const isDark = body.classList.contains('dark-mode');
		btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
		btn.setAttribute('aria-pressed', String(isDark));
	}

	function toggle(){
		const isDark = body.classList.toggle('dark-mode');
		localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
		updateToggleLabel();
	}

	// Init
	document.addEventListener('DOMContentLoaded', ()=>{
		try{
			const stored = localStorage.getItem(STORAGE_KEY);
			if(stored) applyPreference(stored);
		}catch(e){ /* ignore storage errors */ }

		const btn = document.getElementById(toggleId);
		if(btn) btn.addEventListener('click', toggle);
		// update label in case script ran after preference applied
		updateToggleLabel();
	});
})();
