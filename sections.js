/* Homepage section layouts (round 6). Only wraps/moves existing nodes and
   adds decorative, aria-hidden visuals; no copy is added or changed. */
(()=>{
const doc=document;
const el=(tag,cls,html)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e};

/* 1) Experience Behind Your Next Request: rebuilt in v20-home.js */

/* 2) Experience, Scope and Human Review: bento with icons */
const proof=doc.querySelector('.proof-section');
if(proof){proof.classList.add('pf');
  const icons=['<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/></svg>',
    '<svg viewBox="0 0 48 48"><path d="M20 28l8-8M17 22l-4 4a6 6 0 0 0 9 9l4-4M31 26l4-4a6 6 0 0 0-9-9l-4 4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 14v10l7 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>'];
  proof.querySelectorAll('.proof-grid>article').forEach((a,i)=>{const ic=el('span','pf-icon',icons[i%3]);ic.setAttribute('aria-hidden','true');a.prepend(ic);
    const n=el('span','pf-n',String(i+1).padStart(2,'0'));n.setAttribute('aria-hidden','true');a.prepend(n)});
  const cta=proof.querySelector('.proof-cta'),btn=cta&&cta.nextElementSibling;
  if(cta&&btn){const bar=el('div','pf-bar');cta.before(bar);bar.append(cta,btn)}
}

/* 3) See What Your Team Receives: showcase with the magnifier over a deliverable */
doc.querySelectorAll('.connection-section').forEach(sec=>{
  const panel=sec.querySelector('.connection-panel'),report=panel&&panel.querySelector('.connection-report');if(!report)return;
  sec.classList.add('rcv');
  const vis=el('div','rcv-visual sc-visual');vis.innerHTML='<div class="sc-ring"></div><div class="sc-pulse"></div><div class="sc-orb"></div>';
  const col=el('div','rcv-col');report.before(col);col.append(vis,report);report.classList.add('rcv-status');
  if(window.AADSMagOrb)window.AADSMagOrb(vis,vis.querySelector('.sc-orb'),'./assets/svc/deliverable.svg');
  else{const i=el('img','sc-img');i.alt='';i.src='./assets/svc/deliverable.svg';vis.querySelector('.sc-orb').append(i)}
});

/* 4) Behind the Paperwork: featured episode + list, on a navy screen */
const tv=doc.querySelector('#aads-tv-preview');
if(tv){tv.classList.add('tvx','tvn');
  const grid=tv.querySelector('.connection-grid'),cards=[...tv.querySelectorAll('.connection-card')],kicker=tv.querySelector(':scope>.connection-label');
  if(grid&&cards.length){
    const studio=el('div','tvn-studio');grid.before(studio);
    const scr=el('div','tvn-screen');scr.setAttribute('aria-hidden','true');
    const t=c=>c.querySelector('h3').textContent.trim();
    scr.innerHTML='<div class="tvn-set tvn-podcast"><img class="tvn-mascot" src="./assets/aads-tv-mascot.svg" alt="" width="640" height="360"></div>'+
      '<div class="tvn-bug"><span class="tvn-dot"></span>'+(kicker?kicker.textContent.trim():'')+'</div><div class="tvn-clock"></div>'+
      '<div class="tvn-l3"><span class="tvn-l3-tag"></span><span class="tvn-l3-title"></span><span class="tvn-l3-sub"></span></div>'+
      '<div class="tvn-ticker"><div class="tvn-crawl"></div></div><div class="tvn-ch"></div>';
    const crawl=scr.querySelector('.tvn-crawl');const items=cards.map(c=>'<span><b>'+t(c)+'</b> '+c.querySelector('p:not(.connection-label)').textContent.trim()+'</span>').join('');crawl.innerHTML=items+items;
    studio.append(scr,grid);grid.classList.add('tvn-rundown');
    let cur=0,timer=null;const still=matchMedia('(prefers-reduced-motion: reduce)');
    const l3=scr.querySelector('.tvn-l3');
    function show(i){cur=i;cards.forEach((c,k)=>c.classList.toggle('on',k===i));
      scr.querySelector('.tvn-l3-tag').textContent=cards[i].querySelector('.connection-label').textContent.trim();
      scr.querySelector('.tvn-l3-title').textContent=t(cards[i]);
      scr.querySelector('.tvn-l3-sub').textContent=cards[i].querySelector('p:not(.connection-label)').textContent.trim();
      scr.querySelector('.tvn-ch').textContent=String(i+1).padStart(2,'0');
      l3.classList.remove('swap');void l3.offsetWidth;l3.classList.add('swap');scr.dataset.ch=i}
    cards.forEach((c,i)=>{const n=el('span','tvx-n',String(i+1).padStart(2,'0'));n.setAttribute('aria-hidden','true');c.prepend(n);
      c.addEventListener('mouseenter',()=>{show(i);stop()});c.addEventListener('focusin',()=>{show(i);stop()});c.addEventListener('mouseleave',start)});
    function start(){stop();if(!still.matches)timer=setInterval(()=>show((cur+1)%cards.length),5600)}
    function stop(){clearInterval(timer)}
    const clock=scr.querySelector('.tvn-clock');const tick=()=>{const d=new Date();clock.textContent=d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})};tick();setInterval(tick,30000);
    show(0);new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?start():stop())).observe(studio);
  }}

/* 5) Start Your Next Request: numbered form groups */
const form=doc.querySelector('#contact-form');
if(form){form.classList.add('rq-form');doc.querySelector('#contactUs')?.classList.add('rq');}

/* 7) The two homepage drop-downs: rebuilt as theme cards (orb art + numbered rows).
   Text is only regrouped; the old off-palette illustrations become decorative orbs. */
const orb=(src)=>{const o=el('div','ctx-orb');o.setAttribute('aria-hidden','true');o.innerHTML='<span class="ctx-ring"></span><span class="ctx-disc"><img alt="" loading="lazy" src="./assets/svc/'+src+'.svg"></span>';return o};
const svcPanel=doc.querySelector('#services>.additional-context>.context-panel');
if(svcPanel){svcPanel.closest('details').classList.add('ctx-dd');
  const arts=['ucc-lien-research','checklist'];
  svcPanel.querySelectorAll(':scope>.split').forEach((sp,k)=>{sp.classList.add('ctx-row');const copy=sp.querySelector('.copy');const old=sp.querySelector(':scope>img.illustration');if(!copy)return;
    if(old)old.classList.add('ctx-old');
    const lead=el('div','ctx-lead'),list=el('ol','ctx-list');
    const h3=copy.querySelector(':scope>h3');lead.append(orb(arts[k%2]));if(h3)lead.append(h3);
    [...copy.querySelectorAll(':scope>h4')].forEach(h=>{const li=el('li','ctx-item');const p=h.nextElementSibling;li.append(h);if(p&&p.tagName==='P')li.append(p);list.append(li)});
    const acts=el('div','ctx-acts');[...copy.querySelectorAll(':scope>a')].forEach(a=>acts.append(a));lead.append(acts);
    copy.append(lead,list);copy.classList.add('ctx-copy')})}
const supPanel=doc.querySelector('#whyChooseUs .additional-context .context-panel');
if(supPanel){supPanel.closest('details').classList.add('ctx-dd');supPanel.classList.add('sup');
  const arts=['ucc-lien-research','deliverable','registered-agent'];
  supPanel.querySelectorAll('.expectation-grid>article').forEach((a,k)=>{const img=a.querySelector(':scope>img');if(img)img.classList.add('ctx-old');
    const n=el('span','sup-n',String(k+1).padStart(2,'0'));n.setAttribute('aria-hidden','true');a.prepend(orb(arts[k%3]));a.prepend(n)})}
doc.querySelectorAll('details.additional-context').forEach(d=>d.classList.add('ctx-dd'));
})();
