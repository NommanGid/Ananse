/*
  scroll-top.js
  - Shows a scroll-to-top button when the page is scrolled down
  - Smoothly scrolls to top when clicked
  - Beginner-friendly and dependency-free
*/
(function(){
  'use strict';
  const ID = 'scrollTopBtn';
  const SHOW_AT = 300; // show button after px scrolled

  function createButton(){
    let btn = document.getElementById(ID);
    if(btn) return btn;
    btn = document.createElement('button');
    btn.id = ID;
    btn.className = 'scroll-top';
    btn.title = 'Scroll to top';
    btn.setAttribute('aria-label','Scroll to top');
    btn.innerHTML = '\u2191';
    document.body.appendChild(btn);
    return btn;
  }

  function scrollToTop(){
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function init(){
    const btn = createButton();
    btn.addEventListener('click', scrollToTop);

    function onScroll(){
      if(window.scrollY > SHOW_AT){
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }

    document.addEventListener('scroll', onScroll, {passive:true});
    // run once
    onScroll();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
