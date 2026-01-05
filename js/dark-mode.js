/*
  dark-mode.js
  Simple standalone dark mode toggle for pages that don't include main.js.
  - toggles `dark-mode` class on <body>
  - persists choice in localStorage under 'site-theme'
  - updates button label of element with id 'darkModeToggle'
*/
(function(){
  'use strict';
  const STORAGE_KEY = 'site-theme';
  const toggleId = 'darkModeToggle';
  const body = document.body;

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
    try{ localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light'); }catch(e){}
    updateToggleLabel();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    try{ const stored = localStorage.getItem(STORAGE_KEY); if(stored) applyPreference(stored);}catch(e){}
    const btn = document.getElementById(toggleId);
    if(btn) btn.addEventListener('click', toggle);
    updateToggleLabel();
  });
})();
