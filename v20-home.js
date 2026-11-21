/* AADS homepage, v20 layer (21 Nov 2026). Runs after sections.js and showcase.js.
   Layout only: every word on the page is kept and only regrouped (the two placeholder
   sentences Nean asked to remove are dropped in the HTML).
   - Experience Behind Your Next Request: the same panel design as "Public Records. Useful Knowledge.
     Experienced People." (picture + heading card beside rows), always open, new picture
   - A Clear Process: back to the original design in workflow.js (round 2, Nean)
   - Related Services. / One Coordinated Request. on their own lines
   - "since 2002" kept red wherever it appears */
(()=>{
const d=document;if(!d.body.classList.contains('home-light'))return;
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const hide=e=>{e.setAttribute('aria-hidden','true');return e};
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* both drop-down panels share the v20 panel styling */
d.querySelectorAll('#services>.additional-context>.context-panel').forEach(p=>p.classList.add('v-panel'));

/* ---------- Experience Behind Your Next Request ---------- */
const why=d.querySelector('#whyChooseUs>.container');
if(why&&!why.querySelector('.v-xp')){
  const trust=why.querySelector(':scope>.experience-trust-intro'),split=why.querySelector(':scope>.split');
  const accs=split?[...split.querySelectorAll('.accordion')]:[];
  const whoTitle=split&&split.querySelector('.who-title'),routes=split&&split.querySelector('.audience-routes');
  if(trust&&accs.length){
    const panel=el('div','v-panel v-xp');
    const rowOf=(leadNodes,details,art,acts)=>{
      const row=el('div','split ctx-row');const copy=el('div','copy ctx-copy');row.append(copy);
      const lead=el('div','ctx-lead');
      const orb=hide(el('div','ctx-orb',`<span class="ctx-disc"><img alt="" loading="lazy" src="${art}"></span>`));lead.append(orb);
      leadNodes.forEach(n=>n&&lead.append(n));
      if(acts){const a=el('div','ctx-acts');a.append(acts);lead.append(a)}
      const list=el('ol','ctx-list');
      details.forEach(dt=>{const s=dt.querySelector('summary'),p=dt.querySelector('p');const li=el('li','ctx-item');const h=el('h4');h.textContent=s?s.textContent.trim():'';li.append(h);if(p)li.append(p);list.append(li)});
      copy.append(lead,list);return row};
    const h3=trust.querySelector('h3'),tp=trust.querySelector('p');
    if(h3)h3.innerHTML=h3.innerHTML.replace(/Since 2002/,'<span class="v-since">Since 2002</span>');
    panel.append(rowOf([h3,tp],[...accs[0].querySelectorAll(':scope>details')],'./assets/experience.svg'));
    if(accs[1])panel.append(rowOf([whoTitle],[...accs[1].querySelectorAll(':scope>details')],'./assets/svc/court.svg',routes));
    /* each audience row links to its page (the route links stay as written) */
    if(routes){const map={};routes.querySelectorAll('a').forEach(a=>map[a.textContent.replace('→','').trim()]=a.getAttribute('href'));
      panel.querySelectorAll('.ctx-row:last-child .ctx-item').forEach(li=>{const t=li.querySelector('h4').textContent.trim();if(map[t]){li.classList.add('v-link');li.addEventListener('click',e=>{if(!e.target.closest('a'))location.href=map[t]})}})}
    trust.remove();split.before(panel);split.remove();
  }
}

/* ---------- Related Services. / One Coordinated Request. ---------- */
const ph=d.querySelector('#packages>h2');
if(ph&&!ph.querySelector('span')){const m=ph.textContent.trim().match(/^(.*?\.)\s+(.*)$/);if(m){ph.textContent='';ph.append(el('span','v-l',m[1]),el('span','v-l',m[2]))}}

/* A Clear Process: the original workflow.js design (bigger, click/autoplay, no pinning) */
})();
