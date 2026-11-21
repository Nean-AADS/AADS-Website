/* Service and audience pages: interactive layouts with graphics and a workflow.
   Layout only: every heading, list item and paragraph keeps its exact wording.
   - What You Receive  -> a 3D records dossier; each deliverable lifts its sheet
   - Request-to-delivery steps -> a workflow track that fills as you scroll
   - Prepare Your Request lists -> a checklist you can tick (nothing is sent or saved)
   - Service lists, scope notes, tables, Search/File/Monitor paths and FAQs restyled */
(()=>{
const d=document,main=d.querySelector('main.reading-page');if(!main)return;
const page=(location.pathname.split('/').pop()||'').replace('.html','');
const ART={'ucc-lien-research':'ucc-lien-research','court-litigation-bankruptcy':'court','title-municipal-research':'title-municipal','ofac-sanctions-searches':'ofac','ucc-lien-monitoring':'ucc-filing-monitoring','ucc-filing-continuations':'ucc-filing-monitoring','corporate-documents-filings':'corporate','registered-agent-services':'registered-agent','apostille-legalization':'apostille'};
const isSvc=page in ART,isAud=/^for-/.test(page);if(!isSvc&&!isAud)return;
d.body.classList.add('sv-page');
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const hide=e=>{e.setAttribute('aria-hidden','true');return e};
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const artFor=href=>{for(const k in ART)if(href&&href.includes(k))return ART[k];return 'deliverable'};

/* A) What You Receive: dossier */
main.querySelectorAll('section.deliverable-overview').forEach(sec=>{
  const dl=sec.querySelector('dl.deliverable-grid');if(!dl)return;const items=[...dl.children];
  const wrap=el('div','sv-dossier');dl.before(wrap);
  const stack=hide(el('div','sv-stack'));
  stack.innerHTML='<div class="sv-folder"><span class="sv-tab"></span></div>'+items.map((it,i)=>'<div class="sv-sheet" style="--i:'+i+'"><span class="sv-sn">'+String(i+1).padStart(2,'0')+'</span><b></b><i></i><i></i><i></i></div>').join('')+
    '<div class="sv-badge"><img alt="" src="./assets/svc/'+(ART[page]||'deliverable')+'.svg" loading="lazy"></div>';
  stack.style.setProperty('--n',items.length);
  items.forEach((it,i)=>{stack.querySelectorAll('.sv-sheet b')[i].textContent=it.querySelector('dt').textContent;it.classList.add('sv-del');it.style.setProperty('--i',i);
    const n=hide(el('span','sv-del-n',String(i+1).padStart(2,'0')));it.prepend(n);it.tabIndex=0;
    const on=()=>{items.forEach(x=>x.classList.toggle('on',x===it));stack.dataset.on=i;stack.querySelectorAll('.sv-sheet').forEach((s,k)=>s.classList.toggle('on',k===i))};
    it.addEventListener('mouseenter',on);it.addEventListener('focus',on)});
  wrap.append(stack,dl);
  let auto=0,t=null;const run=()=>{if(still)return;t=setInterval(()=>{if(wrap.matches(':hover,:focus-within'))return;auto=(auto+1)%items.length;items[auto].dispatchEvent(new Event('mouseenter'))},3200)};
  items[0].dispatchEvent(new Event('mouseenter'));
  new IntersectionObserver(([e])=>{clearInterval(t);if(e.isIntersecting)run()}).observe(wrap);
  stack.addEventListener('pointermove',e=>{if(still)return;const r=stack.getBoundingClientRect();stack.style.setProperty('--ry',(((e.clientX-r.left)/r.width-.5)*16).toFixed(1)+'deg');stack.style.setProperty('--rx',(-((e.clientY-r.top)/r.height-.5)*12).toFixed(1)+'deg')});
  stack.addEventListener('pointerleave',()=>{stack.style.removeProperty('--rx');stack.style.removeProperty('--ry')});
});

/* helper: heading text -> next sibling list */
const h2s=[...main.querySelectorAll('h2')];
const listAfter=h=>{let n=h.nextElementSibling;return n&&/^(UL|OL)$/.test(n.tagName)?n:null};

/* B) workflow track */
h2s.filter(h=>/^From Your Request to Delivery$/i.test(h.textContent.trim())).forEach(h=>{const ol=listAfter(h);if(!ol)return;
  const box=el('div','sv-flow');h.before(box);box.append(h,ol);ol.classList.add('sv-flow-ol');
  const icons=['M4 6h16M4 12h10M4 18h7','M5 13l4 4L19 7','M4 4h16v16H4zM8 9h8M8 13h8M8 17h5','M3 12h13M12 6l6 6-6 6'];
  [...ol.children].forEach((li,i)=>{li.prepend(hide(el('span','sv-node','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+icons[i%icons.length]+'"/></svg>')))});
  ol.style.setProperty('--steps',ol.children.length);const bar=hide(el('div','sv-flow-bar','<i></i>'));ol.before(bar);
  const upd=()=>{const r=box.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.8-r.top)/(r.height*.9)));bar.firstChild.style.transform='scaleX('+p.toFixed(3)+')';
    const k=Math.round(p*ol.children.length);[...ol.children].forEach((li,i)=>li.classList.toggle('done',i<k))};
  if(still){bar.firstChild.style.transform='scaleX(1)';[...ol.children].forEach(li=>li.classList.add('done'))}else{addEventListener('scroll',upd,{passive:true});upd()}
});

/* C) Prepare lists -> tickable checklist */
h2s.filter(h=>/^Prepare Your/i.test(h.textContent.trim())).forEach(h=>{const ul=listAfter(h);if(!ul)return;
  ul.classList.add('sv-check');ul.setAttribute('role','group');if(!h.id)h.id='sv-prep-'+Math.random().toString(36).slice(2,7);ul.setAttribute('aria-labelledby',h.id);const host=ul.parentElement;host.classList.add('sv-check-card');
  const meter=hide(el('div','sv-meter','<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18"/><circle class="v" cx="22" cy="22" r="18"/></svg><span>0/'+ul.children.length+'</span>'));const row=el('div','sv-check-head');h.before(row);row.append(h,meter);
  const upd=()=>{const all=[...ul.children],k=all.filter(li=>li.getAttribute('aria-checked')==='true').length;meter.querySelector('span').textContent=k+'/'+all.length;meter.querySelector('.v').style.strokeDashoffset=(113.1*(1-k/all.length)).toFixed(1);meter.classList.toggle('full',k===all.length)};
  [...ul.children].forEach(li=>{li.setAttribute('role','checkbox');li.setAttribute('aria-checked','false');li.tabIndex=0;li.prepend(hide(el('span','sv-box','<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>')));
    const tog=()=>{li.setAttribute('aria-checked',String(li.getAttribute('aria-checked')!=='true'));upd()};
    li.addEventListener('click',e=>{if(e.target.closest('a'))return;tog()});li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();tog()}})});
  upd();
});

/* D) other section lists -> icon cards */
main.querySelectorAll(':scope>section>ul:not(.sv-check):not(.service-list), .content-columns>section>ul:not(.sv-check)').forEach(ul=>{ul.classList.add('sv-list');ul.parentElement.classList.add('sv-list-card')});

/* E) scope notes */
h2s.filter(h=>/^Clear scope before work begins$/i.test(h.textContent.trim())).forEach(h=>{const p=h.nextElementSibling;if(!p||p.tagName!=='P')return;
  const box=el('div','sv-callout');h.before(box);box.append(hide(el('span','sv-stamp','<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="42"/><path d="M38 62l14 14 30-32"/></svg>')),h,p)});

/* F) Search / File / Monitor path -> workflow cards */
main.querySelectorAll('nav.ucc-paths').forEach(n=>{n.classList.add('sv-paths');[...n.children].forEach((a,i)=>{a.prepend(hide(el('span','sv-path-n',String(i+1).padStart(2,'0'))))})});

/* G) route cards (audience pages) get the service art */
main.querySelectorAll('.route-card').forEach(c=>{const a=c.querySelector('a[href]');c.prepend(hide(el('span','sv-orb','<img alt="" loading="lazy" src="./assets/svc/'+artFor(a&&a.getAttribute('href'))+'.svg">')))});

/* reveal on scroll */
if(!still){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('sv-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
  main.querySelectorAll('.sv-dossier,.sv-flow,.sv-check-card,.sv-list-card,.sv-callout,.sv-paths,.table-scroll,.accordion,.knowledge-grid').forEach(e=>{e.classList.add('sv-rv');io.observe(e)})}
})();
