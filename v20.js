/* AADS redesign v20, site-wide layer (21 Nov 2026). Loads last on every page.
   Layout only for founder-approved text: existing words are moved or regrouped, not rewritten.
   - floating Back / Forward buttons (every page)
   - inside-page hero pictures (no magnifying glass): each guide has its own picture, same size everywhere
   - guide pages use the service-page building blocks: a dashboard summary, a node workflow and a checklist
   - "Book an appointment" in the request pop-up
   Reduced motion is respected throughout. */
(()=>{
const d=document,page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const hide=e=>{e.setAttribute('aria-hidden','true');return e};
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const svg=p=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p}"/></svg>`;

/* ---------- 1. Floating Back / Forward ---------- */
(()=>{
  const internal=(()=>{try{return d.referrer&&new URL(d.referrer).origin===location.origin}catch{return false}})();
  const bar=el('nav','v-hist');bar.setAttribute('aria-label','Page history');
  const back=el('button','v-hist-b',svg('M19 12H5M11 18l-6-6 6-6')+'<span>Back</span>');back.type='button';
  const fwd=el('button','v-hist-b v-hist-f','<span>Forward</span>'+svg('M5 12h14M13 6l6 6-6 6'));fwd.type='button';
  back.addEventListener('click',()=>{if(internal&&history.length>1)history.back();else location.href='./index.html'});
  fwd.addEventListener('click',()=>history.forward());
  const nav=window.navigation;
  const sync=()=>{if(nav&&'canGoForward' in nav){fwd.disabled=!nav.canGoForward;fwd.setAttribute('aria-disabled',String(!nav.canGoForward))}
    if(page==='index'&&!internal){back.disabled=true}};
  sync();nav&&nav.addEventListener&&nav.addEventListener('currententrychange',sync);
  bar.append(back,fwd);d.body.append(bar);
  let shown=false;const upd=()=>{const s=scrollY>420;if(s!==shown){shown=s;bar.classList.toggle('show',s)}};addEventListener('scroll',upd,{passive:true});upd();
  const foot=d.querySelector('body>footer');foot&&new IntersectionObserver(([e])=>bar.classList.toggle('hide',e.isIntersecting),{rootMargin:'0px 0px -80px 0px'}).observe(foot);
  d.addEventListener('keydown',e=>{if(e.key==='Escape')return});
})();

/* ---------- 2. Inside-page hero pictures ---------- */
const SVC={'ucc-lien-research':'svc/ucc-lien-research','court-litigation-bankruptcy':'svc/court','title-municipal-research':'svc/title-municipal','ofac-sanctions-searches':'svc/ofac',
  'ucc-lien-monitoring':'svc/ucc-filing-monitoring','ucc-filing-continuations':'svc/ucc-filing-monitoring','corporate-documents-filings':'svc/corporate','registered-agent-services':'svc/registered-agent',
  'apostille-legalization':'svc/apostille','for-law-firms':'svc/court','for-lenders':'svc/ucc-lien-research','for-title-settlement-teams':'svc/title-municipal','for-accountants-cpas':'svc/corporate',
  'faq':'svc/checklist','glossary':'svc/deliverable','state-guides':'guides/guide-florida-public-records','intelligence-center':'svc/deliverable','place-an-order':'svc/checklist',
  'privacy':'svc/registered-agent','client-access':'svc/registered-agent','blog':'svc/deliverable','case-studies':'svc/deliverable','about-aads':'svc/corporate'};
const top=d.querySelector('.inside-top'),ih=top&&top.querySelector('.inside-hero');
if(ih&&!top.querySelector('.v-art')){
  let src=null;
  if(/^guide-/.test(page))src='guides/'+page;else if(SVC[page])src=SVC[page];else if(/^blog-/.test(page))src='svc/deliverable';else if(/-preview$/.test(page))src='svc/deliverable';
  if(src){const fig=hide(el('figure','v-art',`<span class="v-art-card"><img src="./assets/${src}.svg" alt="" width="400" height="400" decoding="async"></span>`));
    top.classList.add('v-top');ih.after(fig)}
}

/* ---------- 3. Guide pages: dashboard summary, node workflow, checklist ---------- */
const main=d.querySelector('main.reading-page');
if(main&&/^guide-/.test(page)){
  d.body.classList.add('v-guide');
  const kids=[...main.children],h2s=kids.filter(n=>n.tagName==='H2');
  /* dashboard: the "Start here" box plus a jump list of the guide's own section headings */
  const box=main.querySelector(':scope>.answer-box');
  if(box&&h2s.length){
    const dash=el('section','v-dash');dash.setAttribute('aria-label',(box.querySelector('strong')||{}).textContent||'Start here');box.before(dash);
    const lead=el('div','v-dash-lead');lead.append(box);
    const meta=main.querySelector(':scope>.article-meta');if(meta)lead.prepend(meta);
    const jump=el('nav','v-dash-jump');jump.setAttribute('aria-label','In this guide');
    h2s.forEach((h,i)=>{if(!h.id)h.id='g-'+(i+1);const a=el('a','',`<i aria-hidden="true"></i><span></span>`);a.href='#'+h.id;a.querySelector('span').textContent=h.textContent.trim();jump.append(a)});
    dash.append(lead,jump);
  }
  /* node workflow: each section hangs from a vertical line with a node, no numbers */
  if(h2s.length>1){
    const flow=el('div','v-flow');h2s[0].before(flow);
    h2s.forEach((h,i)=>{const step=el('section','v-step');step.setAttribute('aria-labelledby',h.id);
      const node=hide(el('span','v-node'));step.append(node);const body=el('div','v-step-body');step.append(body);
      let n=h;const stop=h2s[i+1];const take=[];while(n&&n!==stop&&!(n.matches&&n.matches('.source-box,.scope-note,.reading-link,.article-cta,aside'))){take.push(n);n=n.nextElementSibling}
      take.forEach(x=>body.append(x));flow.append(step)});
  }
  /* lists of things to collect or provide become a tickable checklist (nothing is sent or saved) */
  main.querySelectorAll('.v-step-body>ul').forEach(ul=>{
    const h=ul.parentElement.querySelector('h2');const t=(h&&h.textContent||'').toLowerCase();
    if(!/(collect|provide|prepare|include|checklist|information|ask|confirm|request)/.test(t)||ul.children.length<3){ul.classList.add('v-points');return}
    ul.classList.add('sv-check','v-check');ul.setAttribute('role','group');h&&ul.setAttribute('aria-labelledby',h.id);
    const meter=hide(el('span','v-meter','0/'+ul.children.length));h&&h.append(meter);
    const upd=()=>{const all=[...ul.children],k=all.filter(li=>li.getAttribute('aria-checked')==='true').length;meter.textContent=k+'/'+all.length;meter.classList.toggle('full',k===all.length)};
    [...ul.children].forEach(li=>{li.setAttribute('role','checkbox');li.setAttribute('aria-checked','false');li.tabIndex=0;li.prepend(hide(el('span','sv-box','<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>')));
      const tog=()=>{li.setAttribute('aria-checked',String(li.getAttribute('aria-checked')!=='true'));upd()};
      li.addEventListener('click',e=>{if(e.target.closest('a'))return;tog()});li.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();tog()}})});
  });
  main.querySelectorAll('.v-step-body>table').forEach(t=>{if(!t.parentElement.classList.contains('table-scroll')){const w=el('div','table-scroll');t.before(w);w.append(t)}});
  if(!still){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});
    main.querySelectorAll('.v-step,.v-dash').forEach(s=>{s.classList.add('v-rv');io.observe(s)})}
}

/* ---------- 4. Request pop-up: Book an appointment ---------- */
(()=>{
  const form=d.getElementById('contact-form');if(!form||form.querySelector('.v-book'))return;
  const msg=form.querySelector('#message');if(!msg)return;
  const tabs=el('div','v-mode');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','How would you like to start?');
  const tReq=el('button','v-mode-b on',svg('M4 6h16M4 12h10M4 18h7')+'<span>Send a request</span>');
  const tBook=el('button','v-mode-b',svg('M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z')+'<span>Book an appointment</span>');
  [tReq,tBook].forEach((b,i)=>{b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(i===0))});
  tabs.append(tReq,tBook);
  const book=el('fieldset','v-book');book.hidden=true;
  book.innerHTML=`<legend>Pick a day and time</legend>
   <div class="v-cal"><div class="v-cal-head"><button type="button" class="v-cal-nav" data-d="-1" aria-label="Previous month">${svg('M15 5l-7 7 7 7')}</button><b class="v-cal-m"></b><button type="button" class="v-cal-nav" data-d="1" aria-label="Next month">${svg('M9 5l7 7-7 7')}</button></div>
   <div class="v-cal-w" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div class="v-cal-g" role="grid"></div></div>
   <div class="v-slots"><p class="v-slots-t">Times (Eastern)</p><div class="v-slots-g"></div>
   <div class="v-how" role="radiogroup" aria-label="Meeting type"><label><input type="radio" name="v-how" value="Phone call" checked> Phone call</label><label><input type="radio" name="v-how" value="Video call"> Video call</label></div></div>
   <p class="v-pick" aria-live="polite"></p>`;
  const anchor=form.querySelector('.rq-pair')||form.querySelector('label[for="full-name"]')||form.firstElementChild;
  /* round 2: Place an Order sits beside the two choices and opens the order page */
  /* Place an Order sits at the bottom of the left panel (Nean, 21 Nov) */
  form.insertBefore(tabs,anchor);form.insertBefore(book,anchor);
  const side=d.querySelector('#contactUs .contact-panel, .contact-panel');const methods=side&&side.querySelector('.contact-methods');
  if(side&&!side.querySelector('.v-order')){const order=el('a','button v-order','Place an Order');order.href='./place-an-order.html';(methods||side).after?methods?methods.after(order):side.append(order):0}
  const grid=book.querySelector('.v-cal-g'),mLabel=book.querySelector('.v-cal-m'),slotsG=book.querySelector('.v-slots-g'),pick=book.querySelector('.v-pick');
  const today=new Date();today.setHours(0,0,0,0);let view=new Date(today.getFullYear(),today.getMonth(),1),day=null,time=null;
  const TIMES=['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM'];
  const fmt=dt=>dt.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const limit=new Date(today);limit.setDate(limit.getDate()+60);
  function drawCal(){grid.innerHTML='';mLabel.textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const first=view.getDay(),n=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    for(let i=0;i<first;i++)grid.append(el('span','v-cal-x'));
    for(let i=1;i<=n;i++){const dt=new Date(view.getFullYear(),view.getMonth(),i);const b=el('button','v-cal-d',String(i));b.type='button';
      const off=dt<=today||dt>limit||dt.getDay()===0||dt.getDay()===6;b.disabled=off;b.setAttribute('aria-label',dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}));
      if(day&&dt.getTime()===day.getTime())b.classList.add('on');
      b.addEventListener('click',()=>{day=dt;time=null;drawCal();drawSlots();write()});grid.append(b)}
    book.querySelector('[data-d="-1"]').disabled=view<=new Date(today.getFullYear(),today.getMonth(),1);
    book.querySelector('[data-d="1"]').disabled=new Date(view.getFullYear(),view.getMonth()+1,1)>limit}
  function drawSlots(){slotsG.innerHTML='';if(!day){slotsG.append(el('span','v-slots-e','Choose a weekday first.'));return}
    TIMES.forEach(t=>{const b=el('button','v-slot'+(t===time?' on':''),t);b.type='button';b.setAttribute('aria-pressed',String(t===time));b.addEventListener('click',()=>{time=t;drawSlots();write()});slotsG.append(b)})}
  const TAG='Appointment request: ';
  function write(){const how=(book.querySelector('input[name="v-how"]:checked')||{}).value||'';
    const line=day&&time?`${TAG}${fmt(day)} at ${time} ET (${how})`:'';
    pick.textContent=line?line.replace(TAG,'Selected: '):'';
    const rest=msg.value.split('\n').filter(l=>!l.startsWith(TAG)).join('\n').replace(/^\n+/,'');
    msg.value=line?(line+(rest?'\n'+rest:'')):rest;msg.dispatchEvent(new Event('input',{bubbles:true}))}
  book.addEventListener('change',e=>{if(e.target.name==='v-how')write()});
  book.querySelectorAll('.v-cal-nav').forEach(b=>b.addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+(+b.dataset.d),1);drawCal()}));
  const submit=form.querySelector('button[type=submit]');const subText=submit&&submit.textContent;
  function mode(isBook){tReq.classList.toggle('on',!isBook);tBook.classList.toggle('on',isBook);tReq.setAttribute('aria-selected',String(!isBook));tBook.setAttribute('aria-selected',String(isBook));
    book.hidden=!isBook;form.classList.toggle('v-booking',isBook);if(isBook){drawCal();drawSlots()}else{day=null;time=null;write()}
    if(submit&&!submit.disabled&&!/unavailable/i.test(subText||''))submit.textContent=isBook?'Request this appointment':subText}
  tReq.addEventListener('click',()=>mode(false));tBook.addEventListener('click',()=>mode(true));
  window.AADSBook=()=>{window.AADSRequest&&window.AADSRequest.open();mode(true)};
  d.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-book]');if(a){e.preventDefault();window.AADSBook()}});
})();
})();
