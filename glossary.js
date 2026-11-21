(()=>{
const controls=document.querySelector('#glossary-controls'),search=window.AADS_SEARCH;if(!controls||!search)return;
const query=document.querySelector('#glossary-query'),topic=document.querySelector('#glossary-topic'),status=document.querySelector('#glossary-status'),empty=document.querySelector('#glossary-empty'),clear=document.querySelector('#glossary-clear'),broaden=document.querySelector('#glossary-broaden'),entries=[...document.querySelectorAll('.glossary-entry')],letters=[...document.querySelectorAll('.glossary-letter')];
const records=entries.map(entry=>({entry,prepared:search.prepare({title:entry.querySelector('h3').textContent,text:entry.querySelector('p').textContent,aliases:entry.dataset.searchAliases?[entry.dataset.searchAliases]:[]})}));controls.hidden=false;
function restore(){const params=new URLSearchParams(location.search);query.value=params.get('q')||'';const requested=params.get('topic')||'';topic.value=[...topic.options].some(o=>o.value===requested)?requested:''}
function remember(){const url=new URL(location.href);url.searchParams.delete('q');url.searchParams.delete('topic');if(query.value.trim())url.searchParams.set('q',query.value.trim());if(topic.value)url.searchParams.set('topic',topic.value);if(query.value.trim()||topic.value)url.hash='glossary-controls';else if(url.hash==='#glossary-controls')url.hash='';try{history.replaceState(history.state,'',url)}catch{/* Filtering remains available in local-file previews. */}}
function render(){const compiled=search.query(query.value);let count=0;for(const {entry,prepared} of records){const match=(!topic.value||entry.dataset.topic===topic.value)&&search.matches(prepared,compiled);entry.hidden=!match;if(match)count++}for(const group of letters)group.hidden=![...group.querySelectorAll('.glossary-entry')].some(e=>!e.hidden);for(const a of document.querySelectorAll('.glossary-alphabet a'))a.hidden=document.querySelector(a.getAttribute('href')).hidden;status.textContent=count+' term'+(count===1?'':'s')+(compiled.tokens.length||topic.value?' found':'');empty.hidden=count!==0;if(clear)clear.hidden=!query.value&&!topic.value;if(broaden){broaden.href='./intelligence-center.html'+(query.value.trim()?'?q='+encodeURIComponent(query.value.trim()):'')+'#knowledge-search';broaden.hidden=count!==0}}
query.addEventListener('input',()=>{render();remember()});topic.addEventListener('change',()=>{render();remember()});if(clear)clear.addEventListener('click',()=>{query.value='';topic.value='';render();remember();query.focus()});addEventListener('popstate',()=>{restore();render()});addEventListener('pageshow',event=>{if(event.persisted){restore();render()}});restore();render();
})();

/* Interactive dictionary layout: sticky rail (search, topic chips, A-Z with scroll-spy)
   beside letter sections of index cards. Layout only; every term and definition is unchanged. */
(()=>{
const d=document,main=d.querySelector('main'),controls=d.querySelector('#glossary-controls'),alpha=d.querySelector('.glossary-alphabet');
const letters=[...d.querySelectorAll('.glossary-letter')];if(!main||!alpha||!letters.length)return;
d.body.classList.add('gl-page');
const layout=d.createElement('div');layout.className='gl-layout';
const rail=d.createElement('aside');rail.className='gl-rail';
const body=d.createElement('div');body.className='gl-body';
(controls||alpha).before(layout);layout.append(rail,body);
if(controls)rail.append(controls);rail.append(alpha);
const empty=d.querySelector('#glossary-empty'),broaden=d.querySelector('#glossary-broaden');
letters.forEach(l=>body.append(l));empty&&body.append(empty);broaden&&body.append(broaden);
/* topic chips mirror the Topic select */
const topic=d.querySelector('#glossary-topic');
if(topic){const chips=d.createElement('div');chips.className='gl-chips';chips.setAttribute('role','group');
  const lab=d.querySelector('label[for="glossary-topic"]');chips.setAttribute('aria-label',lab?lab.textContent:'Topic');
  [...topic.options].forEach(o=>{const b=d.createElement('button');b.type='button';b.className='gl-chip';b.dataset.v=o.value;b.dataset.topic=o.value||'all';b.textContent=o.textContent;
    b.addEventListener('click',()=>{topic.value=o.value;topic.dispatchEvent(new Event('change',{bubbles:true}));sync()});chips.append(b)});
  const sync=()=>chips.querySelectorAll('.gl-chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===topic.value)));
  topic.addEventListener('change',sync);addEventListener('popstate',()=>setTimeout(sync));
  topic.closest('div').after(chips);topic.closest('div').classList.add('gl-select');sync();}
/* count badge per letter */
letters.forEach(l=>{const h=l.querySelector('h2');const n=d.createElement('span');n.className='gl-count';n.setAttribute('aria-hidden','true');h.append(n)});
const counts=()=>letters.forEach(l=>{l.querySelector('.gl-count').textContent=[...l.querySelectorAll('.glossary-entry')].filter(e=>!e.hidden).length});
/* highlight matches */
const q=d.querySelector('#glossary-query');
const unmark=root=>root.querySelectorAll('mark.gl-hit').forEach(m=>{m.replaceWith(d.createTextNode(m.textContent))});
function mark(){d.querySelectorAll('.glossary-entry').forEach(e=>{unmark(e);e.normalize()});
  const words=(q&&q.value||'').trim().split(/\s+/).filter(w=>w.length>1).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));if(!words.length)return;
  const re=new RegExp('\\b('+words.join('|')+')','gi');
  d.querySelectorAll('.glossary-entry:not([hidden])').forEach(e=>{[e.querySelector('h3'),e.querySelector('h3+p')].forEach(el=>{if(!el)return;
    const w=d.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(t=>{if(!re.test(t.data))return;re.lastIndex=0;const f=d.createDocumentFragment();let last=0;t.data.replace(re,(m,_,i)=>{f.append(t.data.slice(last,i));const k=d.createElement('mark');k.className='gl-hit';k.textContent=m;f.append(k);last=i+m.length});f.append(t.data.slice(last));t.replaceWith(f)})})})}
const refresh=()=>{counts();mark()};
q&&q.addEventListener('input',()=>setTimeout(refresh));topic&&topic.addEventListener('change',()=>setTimeout(refresh));
d.querySelector('#glossary-clear')?.addEventListener('click',()=>setTimeout(()=>{refresh();topic&&topic.dispatchEvent(new Event('change'))}));
refresh();
/* scroll-spy on the A-Z */
const links=new Map([...alpha.querySelectorAll('a')].map(a=>[a.getAttribute('href').slice(1),a]));
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove('on'));links.get(e.target.id)?.classList.add('on')}})},{rootMargin:'-30% 0px -65% 0px'});
letters.forEach(l=>io.observe(l));
})();
