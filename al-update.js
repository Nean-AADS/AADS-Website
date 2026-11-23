/* AADS, Al's update package (Nean1.zip, 16-17 Nov) in the v20 redesign theme. Loads after v20.js.
   Layout only: every word comes from the page. */
(()=>{
const d=document,$=(s,r=d)=>r.querySelector(s),$$=(s,r=d)=>[...r.querySelectorAll(s)];
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const hide=e=>{e.setAttribute('aria-hidden','true');return e};
const ico=p=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

/* ---------- Homepage: Experience Behind Your Next Request (trust + audience links) ---------- */
const why=$('#whyChooseUs>.container');
if(why&&!$('.al-xp',why)){
  const trust=$(':scope>.experience-trust-intro',why),routes=$(':scope>.audience-routes',why);
  if(trust&&routes){
    const panel=el('div','v-panel al-xp');
    const lead=el('div','al-xp-lead');
    lead.append(hide(el('div','ctx-orb',`<span class="ctx-disc"><img alt="" loading="lazy" src="./assets/experience.svg"></span>`)));
    const h3=$('h3',trust),tp=$('p',trust);
    if(h3){h3.innerHTML=h3.innerHTML.replace(/Since 2002/,'<span class="v-since">Since 2002</span>');lead.append(h3)}
    if(tp)lead.append(tp);
    const ART={'for-law-firms':'court','for-lenders':'ucc-lien-research','for-title-settlement-teams':'title-municipal','for-accountants-cpas':'corporate'};
    routes.classList.add('al-aud');
    $$('a',routes).forEach(a=>{const k=Object.keys(ART).find(k=>a.getAttribute('href').includes(k));
      const label=a.textContent.replace('→','').trim();a.textContent='';
      a.append(hide(el('span','al-aud-art',`<img alt="" loading="lazy" src="./assets/svc/${ART[k]||'checklist'}.svg">`)),el('span','al-aud-l',label),hide(el('span','al-aud-go',ico('<path d="M5 12h14M13 6l6 6-6 6"/>'))))});
    panel.append(lead,routes);trust.replaceWith(panel);
  }
}

/* ---------- Homepage: Knowing where to look (three research stories) ---------- */
const ex=$('#experience-examples>.container');
if(ex&&!$('.al-stories',ex)){
  const grid=$(':scope>.knowledge-grid',ex);
  const ART=[ico('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><circle cx="11.5" cy="14" r="3"/><path d="m14 16.5 2.5 2.5"/>'),
             ico('<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M12 9.5v.01"/>'),
             ico('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 20h10M12 16v4"/><path d="M8 10h2M14 10h2" /><path d="M11 10h2" stroke-dasharray="1 2"/>')];
  if(grid){grid.classList.add('al-stories');
    $$(':scope>.experience-example',grid).forEach((c,i)=>{
      c.prepend(hide(el('div','al-story-top',`<span class="al-story-ico">${ART[i%3]}</span><span class="al-story-n">${String(i+1).padStart(2,'0')}</span>`)));
      const det=$('details',c);if(det){const s=$('summary',det);s.append(hide(el('span','al-plus','')));
        $$(':scope>p',det).forEach(p=>{p.classList.add('al-story-row');const b=$('strong',p);if(b)b.classList.add('al-story-k')})}
    });
  }
  /* only the clicked card grows: equal resting height, smooth open and close */
  if(grid){const cards=$$(':scope>.experience-example',grid),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const multi=()=>getComputedStyle(grid).gridTemplateColumns.split(' ').length>1;
    const anyOpen=()=>cards.some(c=>{const t=$('details',c);return t&&t.open});
    const level=()=>{grid.style.removeProperty('--al-story-h');if(anyOpen()||!multi())return;
      grid.style.setProperty('--al-story-h',Math.max(...cards.map(c=>c.offsetHeight))+'px')};
    level();addEventListener('load',level);addEventListener('resize',()=>{if(!anyOpen())level()});
    /* the open/close height animation itself comes from site-motion.js; fade the revealed rows in */
    cards.forEach(c=>{const det=$('details',c);if(!det)return;
      det.addEventListener('toggle',()=>{if(!det.open||reduce)return;
        [...det.children].filter(x=>x.tagName!=='SUMMARY').forEach((x,j)=>x.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:320,delay:60+j*60,easing:'ease-out',fill:'backwards'}))})});
  }
  const note=$(':scope>.small-note',ex);if(note)note.classList.add('al-draft');
  const sample=$$(':scope>p.center',ex).pop();if(sample)sample.classList.add('al-sample');
}

/* ---------- Homepage: Intelligence Center and AADS TV as secondary drop-downs ---------- */
$$('details.homepage-secondary').forEach((dt,i)=>{
  if(dt.classList.contains('al-sec'))return;dt.classList.add('al-sec');
  const s=$(':scope>summary',dt);if(s){s.prepend(hide(el('span','al-sec-dot','')));s.append(hide(el('span','al-plus','')))}
});

/* ---------- Homepage: closing request section ---------- */
const close=$('#contactUs.journey-close>.container');
if(close&&!$('.al-close',close)){
  const box=el('div','al-close');while(close.firstChild)box.append(close.firstChild);close.append(box);
  const links=$$(':scope>p',box).pop();if(links&&links.querySelector('a')){links.classList.add('al-close-links');
    [...links.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});
    const IC={'request-status':ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),'mailto':ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),'tel':ico('<path d="M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 5a2 2 0 0 1 2-2Z"/>')};
    $$('a',links).forEach(a=>{const h=a.getAttribute('href');const k=Object.keys(IC).find(k=>h.includes(k));if(k)a.insertAdjacentHTML('afterbegin',IC[k])});}
  const btn=$('a.button',box);if(btn){btn.classList.remove('outline')}
  box.prepend(hide(el('div','al-close-art',`<img alt="" loading="lazy" src="./assets/svc/checklist.svg">`)));
}

/* ---------- Law firms: paralegal and attorney guidance panels get an icon each ---------- */
$$('.legal-paths .journey-grid>article').forEach((c,i)=>{if($('.al-guide-ico',c))return;c.classList.add('al-guide-card');
  c.prepend(hide(el('span','al-guide-ico',i?ico('<path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>'):ico('<path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 11h6M9 15h4"/>'))))});

/* ---------- process: the step row has as many columns as steps ---------- */
const wf=$('.wf');if(wf){const n=$$('.wf-tick',wf).length;if(n)wf.style.setProperty('--wf-n',n)}
const wfLater=()=>{const w=$('.wf');if(w&&!w.style.getPropertyValue('--wf-n')){const n=$$('.wf-tick',w).length;if(n)w.style.setProperty('--wf-n',n)}};
addEventListener('load',wfLater);

/* ---------- Intelligence Center: task finder ---------- */
const tf=$('#task-finder, .task-finder');
if(tf&&!tf.classList.contains('al-tf')){tf.classList.add('al-tf')}
/* ---------- pop-up form: bring the confirmation or error message into view (it sat below the fold) ---------- */
const fst=$('#form-status');
if(fst&&!fst.dataset.alWatch){fst.dataset.alWatch='1';
  new MutationObserver(()=>{if(fst.textContent.trim())requestAnimationFrame(()=>fst.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}))}).observe(fst,{childList:true,characterData:true,subtree:true})}
})();
