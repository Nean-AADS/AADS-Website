/* AADS showcase: plain-JS take on the 21st.dev "Spatial Product Showcase".
   A circle visual (rotating dashed ring, pulse disc, the AADS lily in WebGL)
   beside a details panel, plus an island switcher with a sliding surface.
   The side flips on each switch, like the original's left/right swap.
   Content is the page's own: existing cards/steps/sections are moved into
   panels unchanged. No gradients. Without JS the original layout stays. */
(()=>{
const doc=document;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const L=window.AADSLily;
const pad=n=>String(n).padStart(2,'0');
const SPRING='cubic-bezier(.16,1,.3,1)';
let uid=0;

/* 3D magnifier sweeping over the item's illustration; the lens magnifies it */
const POSES=[
  {spin:-.35,el:6,size:.74,ox:0,oy:0,tilt:.12,roll:0},
  {spin:.3,el:10,size:.74,ox:0,oy:0,tilt:-.1,roll:.25},
];
const ZOOM=1.8;
function mag(visual,orb){
  const base=doc.createElement('img'),zoom=doc.createElement('img');
  base.className='sc-img';zoom.className='sc-zoom';[base,zoom].forEach(i=>{i.alt='';i.decoding='async';i.setAttribute('aria-hidden','true')});
  orb.append(base,zoom);
  const M=window.AADSMag;let R=null,canvas=null;
  if(M&&L&&L.glOK){canvas=doc.createElement('canvas');canvas.className='sc-canvas';canvas.setAttribute('aria-hidden','true');visual.append(canvas);R=M.create(canvas)}
  if(!R||!R.ok){root(visual).classList.add('sc-nogl');return {set:(i,src)=>{base.src=src;zoom.removeAttribute('src')}}}
  const ro=new ResizeObserver(()=>{R.resize();if(reduce)frame(performance.now(),0)});ro.observe(canvas);R.resize();
  const cur={...POSES[0]};let target=POSES[0],time=0,born=performance.now();
  const p={x:0,y:0,tx:0,ty:0,on:false};
  visual.parentElement.addEventListener('pointermove',e=>{const r=visual.getBoundingClientRect();p.tx=((e.clientX-r.left)/r.width-.5)*2;p.ty=((e.clientY-r.top)/r.height-.5)*2;p.on=true});
  visual.parentElement.addEventListener('pointerleave',()=>{p.on=false});
  const frame=(now,dt)=>{time+=dt;const a=1-Math.exp(-dt*4);for(const k in cur)cur[k]+=(target[k]-cur[k])*a;
    const wx=reduce?.1:Math.sin(time*.45)*.38,wy=reduce?.05:Math.sin(time*.7+1)*.28;
    const tx=p.on?p.tx*.55:wx,ty=p.on?-p.ty*.55:wy;p.x+=(tx-p.x)*(1-Math.exp(-dt*3));p.y+=(ty-p.y)*(1-Math.exp(-dt*3));
    if(reduce){p.x=tx;p.y=ty}
    R.draw(cur,{px:p.x*.4,py:-p.y*.3,time,sway:reduce?0:1,bloom:reduce?1:Math.min(1,(now-born)/1200),lx:p.x,ly:p.y});
    const ln=R.lens();if(ln){const c=[ln.cx,ln.cy];
      zoom.style.transformOrigin=`${c[0]}px ${c[1]}px`;
      zoom.style.clipPath='polygon('+ln.pts.map(q=>`${(c[0]+(q[0]-c[0])/ZOOM).toFixed(1)}px ${(c[1]+(q[1]-c[1])/ZOOM).toFixed(1)}px`).join(',')+')'}};
  if(reduce)requestAnimationFrame(()=>frame(performance.now(),0));else L.loop(visual,frame);
  return {set:(i,src)=>{target=POSES[i%POSES.length];if(base.getAttribute('src')!==src){base.src=src;zoom.src=src}
    if(!reduce){born=performance.now()-500;base.animate([{opacity:0,transform:'scale(1.25) rotate(-6deg)',filter:'blur(12px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:700,easing:SPRING})}
    else frame(performance.now(),0)}};
}
const root=v=>v.closest('.sc')||v;
window.AADSMagOrb=(visual,orb,src)=>{const m=mag(visual,orb);m.set(0,src);return m};

/* items: [{el, label}] ; mount: element the showcase is inserted before */
function showcase(mount,items,opts={}){
  if(!mount||items.length<2)return null;
  const id='sc'+(++uid),n=items.length;
  const root=doc.createElement('div');root.className='sc'+(opts.dark?' sc-dark':'')+(opts.cls?' '+opts.cls:'');
  root.innerHTML=`<div class="sc-row"><div class="sc-visual" aria-hidden="true"><div class="sc-ring"></div><div class="sc-pulse"></div><div class="sc-orb"><span class="sc-big"></span></div><div class="sc-status"><span class="sc-dot"></span><span class="sc-count"></span></div></div><div class="sc-panels"></div></div><div class="sc-switch-wrap"><div class="sc-switch" role="tablist"${opts.tablistLabel?` aria-label="${opts.tablistLabel}"`:''}><span class="sc-surface" aria-hidden="true"></span></div></div>`;
  const row=root.querySelector('.sc-row'),visual=root.querySelector('.sc-visual'),orb=root.querySelector('.sc-orb'),big=root.querySelector('.sc-big'),
        count=root.querySelector('.sc-count'),panels=root.querySelector('.sc-panels'),sw=root.querySelector('.sc-switch'),surface=root.querySelector('.sc-surface');
  mount.parentNode.insertBefore(root,mount);
  /* v20: every choice visible in a vertical list beside the panel (no hunting in a sideways switcher) */
  const vert=!!opts.vertical;if(vert){root.classList.add('sc-vert');row.prepend(root.querySelector('.sc-switch-wrap'));sw.setAttribute('aria-orientation','vertical')}
  const tabs=[],pans=[];
  items.forEach((it,i)=>{
    const p=doc.createElement('div');p.className='sc-panel';p.id=`${id}-p${i}`;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',`${id}-t${i}`);p.tabIndex=-1;
    p.append(it.el);panels.append(p);pans.push(p);
    const b=doc.createElement('button');b.type='button';b.className='sc-tab';b.id=`${id}-t${i}`;b.setAttribute('role','tab');b.setAttribute('aria-controls',p.id);
    b.innerHTML=`<span class="sc-tab-n" aria-hidden="true">${pad(i+1)}</span><span class="sc-tab-l"></span>`;b.querySelector('.sc-tab-l').textContent=it.label;
    sw.append(b);tabs.push(b);
    if('onbeforematch' in p){p.addEventListener('beforematch',()=>go(i,{instant:true}))}
  });
  const pic=mag(visual,orb);
  let cur=-1;
  const moveSurface=()=>{const b=tabs[cur];if(!b)return;if(vert&&wide()){surface.style.width=b.offsetWidth+'px';surface.style.height=b.offsetHeight+'px';surface.style.transform=`translate(${b.offsetLeft}px,${b.offsetTop}px)`;return}
    surface.style.height='';surface.style.width=b.offsetWidth+'px';surface.style.transform=`translateX(${b.offsetLeft}px)`};
  const wide=()=>matchMedia('(min-width:900px)').matches;
  function go(i,{focus=false,instant=false}={}){
    if(i===cur)return;const prev=cur;cur=i;
    tabs.forEach((t,k)=>{const on=k===i;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;t.classList.toggle('is-on',on)});
    if(focus)tabs[i].focus();
    // FLIP the side swap
    const flip=!vert&&wide()&&!reduce&&!instant&&prev>=0;const r0=flip?visual.getBoundingClientRect():null,p0=flip?panels.getBoundingClientRect():null;
    if(!vert)root.classList.toggle('sc-flip',i%2===1);root.dataset.tone='royal';
    if(flip){const r1=visual.getBoundingClientRect(),p1=panels.getBoundingClientRect();
      visual.animate([{transform:`translateX(${r0.left-r1.left}px)`},{transform:'none'}],{duration:900,easing:SPRING});
      panels.animate([{transform:`translateX(${p0.left-p1.left}px)`},{transform:'none'}],{duration:900,easing:SPRING})}
    pans.forEach((p,k)=>{if(k===i){p.hidden=false}else if(k!==prev||reduce||instant||prev<0){p.hidden=('onbeforematch' in p)?'until-found':true}});
    if(prev>=0&&!reduce&&!instant){const old=pans[prev];old.classList.add('sc-leaving');
      old.animate([{opacity:1,transform:'none',filter:'blur(0)'},{opacity:0,transform:'translateY(-10px)',filter:'blur(5px)'}],{duration:200,easing:'ease-in'}).finished.then(()=>{old.classList.remove('sc-leaving');if(cur!==prev)old.hidden=('onbeforematch' in old)?'until-found':true});}
    else if(prev>=0){pans[prev].hidden=('onbeforematch' in pans[prev])?'until-found':true}
    if(!reduce&&prev>=0&&!instant){const kids=[...(pans[i].firstElementChild||pans[i]).children].slice(0,8);
      kids.forEach((k,j)=>k.animate([{opacity:0,transform:'translateY(20px)',filter:'blur(10px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:700,delay:120+j*80,easing:SPRING,fill:'backwards'}));
      orb.animate([{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:700,easing:'cubic-bezier(.34,1.56,.64,1)'})}
    count.textContent=`${pad(i+1)} / ${pad(n)}`;big.textContent=pad(i+1);
    if(items[i].img)pic.set(i,items[i].img);moveSurface();
    if(!(vert&&wide())){const sl=tabs[i].offsetLeft-(sw.clientWidth-tabs[i].offsetWidth)/2;sw.scrollTo({left:sl,behavior:reduce||instant?'auto':'smooth'})}
  }
  sw.addEventListener('click',e=>{const b=e.target.closest('.sc-tab');if(b)go(tabs.indexOf(b))});
  sw.addEventListener('keydown',e=>{const k={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];
    if(k){e.preventDefault();go((cur+k+n)%n,{focus:true})}else if(e.key==='Home'){e.preventDefault();go(0,{focus:true})}else if(e.key==='End'){e.preventDefault();go(n-1,{focus:true})}});
  new ResizeObserver(moveSurface).observe(sw);
  const fromHash=()=>{const h=location.hash&&location.hash.length>1&&doc.getElementById(decodeURIComponent(location.hash.slice(1)));if(!h)return false;
    const k=pans.findIndex(p=>p.contains(h));if(k<0)return false;go(k,{instant:true});requestAnimationFrame(()=>h.scrollIntoView());return true};
  if(!fromHash())go(0,{instant:true});
  addEventListener('hashchange',fromHash);
  root.classList.add('sc-ready');
  return root;
}

/* ---------- where it is used ---------- */
const txt=el=>(el&&el.textContent||'').replace(/\s+/g,' ').trim();

// Homepage services: the eight service cards, each with its own illustration
const SVC=[['ucc-lien-research','ucc-lien-research'],['ucc-filing','ucc-filing-monitoring'],['ucc-lien-monitoring','ucc-filing-monitoring'],['title-municipal','title-municipal'],
  ['corporate-documents','corporate'],['apostille','apostille'],['ofac','ofac'],['registered-agent','registered-agent'],['court-','court']];
const art=k=>`./assets/svc/${k}.svg`;
const artFor=el=>{const h=[...el.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).concat(el.getAttribute('href')||'').join(' ');const m=SVC.find(([k])=>h.includes(k));return art(m?m[1]:'checklist')};
const sGrid=doc.querySelector('#services .knowledge-grid');
if(sGrid){const cards=[...sGrid.children].filter(c=>c.matches('.knowledge-card'));
  if(showcase(sGrid,cards.map(c=>({el:c,label:txt(c.querySelector('h3')),img:artFor(c)})),{cls:'sc-services',tablistLabel:'Services',vertical:true}))sGrid.classList.add('sc-emptied');}

// v20: homepage Intelligence Center as one big box, built like the services box
const iGrid=doc.querySelector('#intelligence>.knowledge-grid');
const GUIDE=h=>{const m=(h||'').match(/guide-[a-z-]+/);return m?`./assets/guides/${m[0]}.svg`:art('checklist')};
if(iGrid){const cards=[...iGrid.children].filter(c=>c.matches('a.knowledge-card'));
  if(showcase(iGrid,cards.map(c=>({el:c,label:txt(c.querySelector('h3')),img:GUIDE(c.getAttribute('href'))})),{cls:'sc-services sc-guides',tablistLabel:'Request-preparation guides',vertical:true}))iGrid.classList.add('sc-emptied');}

// round 2: Intelligence Center page, "Start with the question in your file" gets the same big box as the homepage
const icMain=/intelligence-center(\.html)?$/.test(location.pathname)&&doc.querySelector('main');
if(icMain){const h=[...icMain.querySelectorAll('h2')].find(x=>/question in your file/i.test(x.textContent));const g=h&&h.nextElementSibling;
  if(g&&g.matches('.knowledge-grid')){const cards=[...g.children].filter(c=>c.matches('a.knowledge-card'));
    if(showcase(g,cards.map(c=>({el:c,label:txt(c.querySelector('h3')),img:GUIDE(c.getAttribute('href'))})),{cls:'sc-services sc-guides sc-ic',tablistLabel:'Request-preparation guides',vertical:true}))g.classList.add('sc-emptied');}}

// FAQ page: each question group becomes one switchable panel
const FAQ_ART=['apostille','checklist','ucc-lien-research','ucc-filing-monitoring','ucc-filing-monitoring','title-municipal','ofac','corporate','court'];
const faqMain=/faq\.html$|\/faq$/.test(location.pathname)&&doc.querySelector('main.reading-page');
if(faqMain){const groups=[...faqMain.querySelectorAll(':scope>section')].filter(s=>s.querySelector(':scope>h2')&&s.querySelector('.accordion'));
  const mount=doc.createElement('span');groups[0]&&groups[0].before(mount);
  if(showcase(mount,groups.map((g,i)=>({el:g,label:txt(g.querySelector('h2')),img:art(FAQ_ART[i]||'checklist')})),{cls:'sc-faq',tablistLabel:'Question topics',vertical:true}))mount.remove();}
})();
