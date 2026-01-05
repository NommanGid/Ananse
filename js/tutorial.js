function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function simpleHighlight(code, lang){
  // basic token highlighting for readability (not a full highlighter)
  let out = escapeHtml(code);
  // strings
  out = out.replace(/(".*?"|'.*?'|`.*?`)/g,'<span class="token string">$1</span>');
  // numbers
  out = out.replace(/\b(\d+)\b/g,'<span class="token number">$1</span>');
  // keywords for common languages
  const keywords = ['function','return','const','let','var','if','else','for','while','break','class','new','import','from','export','try','catch','switch','case'];
  const kwRe = new RegExp('\\\b(' + keywords.join('|') + ')\\\b','g');
  out = out.replace(kwRe,'<span class="token keyword">$1</span>');
  return out;
}

function setOutput(text){
  const out = document.getElementById('output');
  out.textContent = text === undefined || text === null ? '(no output)' : String(text);
}

function init(){
  const params = new URLSearchParams(location.search);
  let id = params.get('id') || location.hash.replace('#','');
  const titleEl = document.getElementById('title');
  const explanationEl = document.getElementById('explanation');
  const codePre = document.getElementById('code');
  const copyBtn = document.getElementById('copyBtn');
  const runBtn = document.getElementById('runBtn');

  fetch('data/tutorials.json')
    .then(r=>r.json())
    .then(data=>{
      const tutorial = (id && data.find(t=>t.id===id)) || data[0];
      if(!tutorial){ titleEl.textContent='Not found'; explanationEl.textContent=''; setOutput(); return; }
      titleEl.textContent = tutorial.title || '';
      explanationEl.textContent = tutorial.description || tutorial.explanation || '';
      const code = tutorial.code || tutorial.example || '';
      // prefer explicit language, fallback to first tag
      const langTag = (tutorial.language) || (tutorial.tags && tutorial.tags[0]) || '';
      const codeEl = codePre.querySelector('code');

      // set Prism language class (e.g. language-javascript). Normalize some common names.
      let prismLang = String((langTag||'')).toLowerCase();
      if(prismLang === 'js') prismLang = 'javascript';
      if(prismLang === 'c++') prismLang = 'cpp';
      if(prismLang === 'html' || prismLang === 'markup') prismLang = 'markup';
      if(prismLang === 'css') prismLang = 'css';
      if(prismLang === 'python') prismLang = 'python';
      if(prismLang === 'java') prismLang = 'java';

      // Use Prism when available, otherwise fall back to simpleHighlight
      try{
        codeEl.className = 'language-' + prismLang;
        // set textContent so Prism can safely tokenize/escape
        codeEl.textContent = code;
        if(window.Prism && Prism.highlightElement){
          Prism.highlightElement(codeEl);
        } else {
          // fallback: insert lightweight highlighted HTML
          codeEl.innerHTML = simpleHighlight(code, prismLang);
        }
      }catch(e){
        codeEl.textContent = code;
      }

      copyBtn.addEventListener('click', ()=>{
        navigator.clipboard.writeText(code).then(()=>{
          copyBtn.textContent='Copied';
          setTimeout(()=>copyBtn.textContent='Copy',900);
        }).catch(()=>{
          copyBtn.textContent='Unable to copy';
        });
      });

      const lang = ( (tutorial.language) || (tutorial.tags && tutorial.tags[0]) || '' ).toString().toLowerCase();
      if(lang.includes('javascript') || lang==='javascript' || (tutorial.title||'').toLowerCase().includes('javascript')){
        runBtn.style.display='inline-block';
        runBtn.addEventListener('click', ()=>{
          setOutput('Running...');
          try{
            const logs = [];
            const origLog = console.log;
            console.log = function(...args){ logs.push(args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ')); origLog.apply(console,args); };
            try{ new Function(code)(); } catch(e){ logs.push('Error: ' + e.message); }
            console.log = origLog;
            setOutput(logs.length?logs.join('\n'):'(no output)');
          }catch(e){ setOutput('Error running code: '+e.message); }
        });
      }
    }).catch(err=>{
      titleEl.textContent='Failed to load';
      explanationEl.textContent='Could not fetch tutorial data.';
      console.error(err);
    });
}

document.addEventListener('DOMContentLoaded', init);
