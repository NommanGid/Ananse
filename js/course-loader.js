/*
  course-loader.js

  Purpose:
  - Load course JSON dynamically (stored under `/courses/{courseId}.json`).
  - Render the sidebar lesson list and the currently selected lesson.
  - Provide "Previous" and "Next" navigation.
  - Track completed lessons in localStorage (UI-only).

  Usage:
  - Open `lesson.html?course=html&lesson=what-is-html` or simply `lesson.html?course=html` to load the first lesson.

  Beginner-friendly notes in comments below explain each step.
*/

(function(){
  'use strict';

  // Helpers ==============================================================
  function qs(selector){ return document.querySelector(selector); }
  function qsa(selector){ return Array.from(document.querySelectorAll(selector)); }

  // Read URL params (course id and lesson id)
  const params = new URLSearchParams(location.search);
  const courseId = params.get('course') || 'html'; // default course
  let lessonId = params.get('lesson') || null;     // optional lesson id

  const COURSE_JSON = 'courses/' + courseId + '.json';
  const STORAGE_KEY = 'completed:' + courseId; // localStorage key to track completed lessons

  // DOM references
  const courseTitleEl = qs('#course-title');
  const courseOverviewEl = qs('#course-overview');
  const lessonListEl = qs('#lesson-list');
  const lessonTitleEl = qs('#lesson-title');
  const lessonBodyEl = qs('#lesson-body');
  const prevLink = qs('#prev-link');
  const nextLink = qs('#next-link');

  // Load completed set from localStorage (returns a Set)
  function loadCompleted(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    }catch(e){ return new Set(); }
  }
  function saveCompleted(set){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set))); }catch(e){}
  }

  // Render lesson list in sidebar
  function renderLessonList(lessons, currentId, completedSet){
    lessonListEl.innerHTML = '';
    lessons.forEach(function(lesson){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = 'lesson.html?course=' + encodeURIComponent(courseId) + '&lesson=' + encodeURIComponent(lesson.id);
      a.textContent = lesson.title;
      a.className = '';
      if(lesson.id === currentId) a.classList.add('active');
      if(completedSet.has(lesson.id)) a.classList.add('completed');
      li.appendChild(a);
      lessonListEl.appendChild(li);
    });
  }

  // Render a lesson (title + HTML body)
  function renderLesson(lesson){
    lessonTitleEl.textContent = lesson.title || '';
    // lesson.content is expected to be HTML-safe fragments (trusted by author)
    lessonBodyEl.innerHTML = lesson.content || '<p>(no content)</p>';
  }

  // Update Prev/Next links based on current index
  function updatePrevNext(lessons, index){
    if(index > 0){
      prevLink.style.visibility = 'visible';
      prevLink.href = 'lesson.html?course=' + encodeURIComponent(courseId) + '&lesson=' + encodeURIComponent(lessons[index-1].id);
    } else {
      prevLink.style.visibility = 'hidden';
    }
    if(index < lessons.length - 1){
      nextLink.style.visibility = 'visible';
      nextLink.href = 'lesson.html?course=' + encodeURIComponent(courseId) + '&lesson=' + encodeURIComponent(lessons[index+1].id);
    } else {
      nextLink.style.visibility = 'hidden';
    }
  }

  // Toggle completed state for current lesson (simple UI control)
  function addCompletedToggle(currentLessonId, completedSet){
    // we add a small toggle button near the lesson title
    let btn = document.getElementById('completed-toggle');
    if(!btn){
      btn = document.createElement('button');
      btn.id = 'completed-toggle';
      btn.className = 'btn small ghost';
      lessonTitleEl.parentNode.insertBefore(btn, lessonTitleEl.nextSibling);
    }
    function refresh(){
      const done = completedSet.has(currentLessonId);
      btn.textContent = done ? 'Completed' : 'Mark complete';
      btn.setAttribute('aria-pressed', String(done));
    }
    btn.onclick = function(){
      if(completedSet.has(currentLessonId)) completedSet.delete(currentLessonId);
      else completedSet.add(currentLessonId);
      saveCompleted(completedSet);
      refresh();
      // re-render sidebar to update completed badges
      // (we assume lessons/lastFetched available in closure)
      if(window.__lastCourseLessons) renderLessonList(window.__lastCourseLessons, currentLessonId, completedSet);
    };
    refresh();
  }

  // Fetch course JSON and initialize page
  fetch(COURSE_JSON).then(function(res){
    if(!res.ok) throw new Error('Failed to load ' + COURSE_JSON);
    return res.json();
  }).then(function(course){
    // store lessons globally for small internal re-render (not required)
    const lessons = course.lessons || [];
    window.__lastCourseLessons = lessons;

    courseTitleEl.textContent = course.title || courseId;
    courseOverviewEl.textContent = course.overview || '';

    // determine initial lesson: if lessonId not provided, take first lesson
    if(!lessonId && lessons.length) lessonId = lessons[0].id;

    // find index of current lesson
    const idx = lessons.findIndex(l => l.id === lessonId);
    const currentIndex = Math.max(0, idx);
    const currentLesson = lessons[currentIndex] || { id:'', title:'', content:'' };

    // load completed state
    const completedSet = loadCompleted();

    // render sidebar and lesson
    renderLessonList(lessons, currentLesson.id, completedSet);
    renderLesson(currentLesson);
    updatePrevNext(lessons, currentIndex);
    addCompletedToggle(currentLesson.id, completedSet);

  }).catch(function(err){
    lessonTitleEl.textContent = 'Failed to load course';
    lessonBodyEl.textContent = err && err.message || String(err);
    console.error(err);
  });

})();
