/* Doodle footer (style idea: 21st.dev "Doodle Crew Footer" by @kedhareswer, redrawn for AADS in plain JS + SVG, no gradients):
   - links on top, then a giant dry-brush ink AADS wordmark with a hand-drawn crew around it:
     the AADS document mascot with its clipboard, a courthouse, the county records cabinet and a seal
   - eyes follow the pointer and blink; click (or tap) a character and it hops; doodles drift
   - the closing line and "Start the conversation" sit under the drawing, then the bottom bar
   Layout only: every footer link and line of text is kept exactly as written. */
(()=>{
const d=document,f=d.querySelector('body>footer');if(!f||f.classList.contains('dcf'))return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const grid=f.querySelector('.footer-grid'),bottom=f.querySelector('.footer-bottom');if(!grid)return;
const [brand,links,contact]=grid.children;
f.classList.add('dcf');

/* top row: brand + links + contact (same elements, re-homed) */
const top=el('div','dcf-top');
brand&&(brand.classList.add('dcf-brand'),top.append(brand));
links&&(links.classList.add('dcf-links'),top.append(links));
let cta=null,tag=null;
if(contact){contact.classList.add('dcf-contact');
  cta=[...contact.querySelectorAll(':scope>a')].find(a=>/#contactUs/.test(a.getAttribute('href')||''))||null;
  tag=[...contact.querySelectorAll(':scope>p')].pop()||null;
  top.append(contact)}

/* the drawing */
const N='#1E295A',R='#1334A6',RED='#D21E47',G='#1E7A4B',GOLD='#E2A72E',SKY='#E1E7FA';
const eye=(x,y,r,p)=>`<g class="dcf-eye" data-x="${x}" data-y="${y}" data-m="${(r-p-1).toFixed(1)}"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${N}" stroke-width="2.6"/><circle class="dcf-pupil" cx="${x}" cy="${y}" r="${p}" fill="${N}"/><circle class="dcf-glint" cx="${x-p*.35}" cy="${y-p*.4}" r="${(p*.32).toFixed(1)}" fill="#fff"/></g>`;
const svg=`
<svg class="dcf-svg" viewBox="0 -50 1200 420" role="presentation" focusable="false">
 <defs>
  <filter id="dcf-ink" x="-4%" y="-6%" width="108%" height="112%">
   <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="edge"/>
   <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough"/>
   <feTurbulence type="fractalNoise" baseFrequency="0.018 0.32" numOctaves="2" seed="4" result="streak"/>
   <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 5.6" result="streakA"/>
   <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="9" result="speck"/>
   <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -24 7.0" result="speckA"/>
   <feComposite in="streakA" in2="speckA" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="holes"/>
   <feComposite in="rough" in2="holes" operator="out"/>
  </filter>
  <filter id="dcf-boil" x="-10%" y="-10%" width="120%" height="120%">
   <feTurbulence class="dcf-boil-t" type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
   <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="dcf-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
   <line x1="0" y1="0" x2="0" y2="7" stroke="${N}" stroke-width="1.3" opacity=".35"/>
  </pattern>
 </defs>

 <!-- paper plane flying behind -->
 <g class="dcf-plane"><g filter="url(#dcf-boil)" stroke="${N}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
  <path d="M0 0 L54 -20 L22 6 Z" fill="#fff"/><path d="M22 6 L28 22 L34 -4" fill="${SKY}"/><path d="M-26 8 q-14 4 -30 -2 M-34 18 q-12 3 -22 -1" fill="none" stroke-dasharray="5 6" stroke-width="2"/>
 </g></g>

 <!-- giant ink wordmark -->
 <g class="dcf-word" filter="url(#dcf-ink)" fill="${N}" font-family="'Plus Jakarta Sans',Arial,sans-serif" font-weight="800" font-size="300" text-anchor="middle">
  <text x="252" y="318">A</text><text x="481" y="318">A</text><text x="712" y="318">D</text><text x="940" y="318">S</text>
 </g>

 <!-- courthouse sitting on the D -->
 <g class="dcf-c" data-k="court"><g class="dcf-hop"><g class="dcf-bob"><g filter="url(#dcf-boil)" stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" transform="translate(670 104)">
  <path d="M0 -112 V-140" fill="none"/><path class="dcf-flag" d="M0 -140 h24 l-6 7 l6 7 h-24 Z" fill="${R}"/>
  <path d="M-64 -78 L0 -112 L64 -78 Z" fill="#fff"/>
  <rect x="-58" y="-80" width="116" height="10" fill="${SKY}"/>
  <rect x="-50" y="-70" width="10" height="52" fill="#fff"/><rect x="-22" y="-70" width="10" height="52" fill="#fff"/><rect x="12" y="-70" width="10" height="52" fill="#fff"/><rect x="40" y="-70" width="10" height="52" fill="#fff"/>
  <rect x="-40" y="-70" width="18" height="52" fill="url(#dcf-hatch)" stroke="none"/><rect x="22" y="-70" width="18" height="52" fill="url(#dcf-hatch)" stroke="none"/>
  <rect x="-60" y="-18" width="120" height="9" fill="#fff"/><rect x="-68" y="-9" width="136" height="9" fill="#fff"/>
  <path d="M-6 -90 q6 5 12 0" fill="none" stroke-width="2.4"/>
 </g>${eye(670-11,104-95,5.5,2.6).replace('dcf-eye','dcf-eye dcf-small')}${eye(670+11,104-95,5.5,2.6).replace('dcf-eye','dcf-eye dcf-small')}</g></g></g>

 <!-- seal / stamp sitting on the S -->
 <g class="dcf-c" data-k="seal"><g class="dcf-hop"><g class="dcf-bob"><g filter="url(#dcf-boil)" stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" transform="translate(946 92)">
  <path d="M-12 -10 L-22 26 L-12 20 L-6 30 L0 -6 Z" fill="${RED}"/><path d="M12 -10 L22 26 L12 20 L6 30 L0 -6 Z" fill="${RED}"/>
  <path d="M0 -80 l8 6 l10 -1 l3 9 l9 5 l-3 9 l4 9 l-8 6 l-1 10 l-10 1 l-6 8 l-9 -4 l-9 4 l-6 -8 l-10 -1 l-1 -10 l-8 -6 l4 -9 l-3 -9 l9 -5 l3 -9 l10 1 Z" fill="${GOLD}"/>
  <circle cx="0" cy="-42" r="24" fill="#fff"/><circle cx="0" cy="-42" r="18" fill="none" stroke-width="1.6" stroke-dasharray="3 4"/>
  <path d="M-7 -32 q7 6 14 0" fill="none" stroke-width="2.4"/>
 </g>${eye(946-8,92-46,6,2.9)}${eye(946+8,92-46,6,2.9)}</g></g></g>

 <!-- AADS document mascot with its clipboard, standing at the left -->
 <g class="dcf-c dcf-mascot" data-k="docky"><g class="dcf-hop"><g class="dcf-bob"><g filter="url(#dcf-boil)" stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" transform="translate(84 318)">
  <ellipse cx="0" cy="2" rx="52" ry="6" fill="${SKY}" stroke="none"/>
  <path d="M-16 -32 L-18 -4 M16 -32 L18 -4" fill="none"/><path d="M-30 -2 q10 -9 20 0 Z M10 -2 q10 -9 20 0 Z" fill="${N}"/>
  <path d="M-46 -166 H24 L48 -142 V-30 H-46 Z" fill="#fff"/><path d="M24 -166 V-142 H48" fill="${SKY}"/>
  <path d="M-34 -78 H28 M-34 -66 H12 M-34 -54 H30" fill="none" stroke-width="2" opacity=".55"/>
  <rect x="-34" y="-47" width="40" height="8" fill="${N}" stroke="none"/><rect x="12" y="-47" width="18" height="8" fill="${N}" stroke="none"/>
  <path d="M-46 -74 L-64 -94" fill="none"/><circle cx="-66" cy="-97" r="5" fill="#fff"/>
  <path d="M48 -86 L62 -98" fill="none"/><g transform="translate(78 -118) rotate(8)"><rect x="-20" y="-26" width="40" height="52" rx="4" fill="#fff"/><rect x="-9" y="-31" width="18" height="9" rx="3" fill="${R}"/><path d="M-12 -12 H12 M-12 -2 H12 M-12 8 H5" fill="none" stroke="#1334A6" stroke-width="3"/></g>
  <circle cx="-28" cy="-104" r="6" fill="${RED}" opacity=".22" stroke="none"/><circle cx="14" cy="-104" r="6" fill="${RED}" opacity=".22" stroke="none"/>
  <path d="M-15 -100 q8 9 16 0" fill="none"/>
 </g>${eye(84-21,318-124,10,4.4)}${eye(84+5,318-124,10,4.4)}</g></g></g>

 <!-- county records cabinet standing at the right -->
 <g class="dcf-c" data-k="records"><g class="dcf-hop"><g class="dcf-bob"><g filter="url(#dcf-boil)" stroke="${N}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" transform="translate(1112 318)">
  <ellipse cx="0" cy="2" rx="50" ry="6" fill="${SKY}" stroke="none"/>
  <path d="M-30 -18 v14 M30 -18 v14" fill="none" stroke-width="5"/>
  <path d="M-18 -150 l-4 -22 l34 -4 l4 24" fill="#fff"/><path d="M-12 -166 h20 M-11 -159 h14" fill="none" stroke-width="1.8" opacity=".6"/>
  <rect x="-42" y="-152" width="84" height="136" rx="7" fill="#fff"/>
  <rect x="-42" y="-152" width="12" height="136" fill="url(#dcf-hatch)" stroke="none"/>
  <rect x="-33" y="-142" width="66" height="38" rx="3" fill="#fff"/><rect x="-33" y="-98" width="66" height="36" rx="3" fill="#fff"/><rect x="-33" y="-56" width="66" height="34" rx="3" fill="#fff"/>
  <rect x="-10" y="-84" width="20" height="7" rx="3" fill="${R}"/><rect x="-10" y="-42" width="20" height="7" rx="3" fill="${R}"/>
  <path d="M-8 -112 q8 7 16 0" fill="none" stroke-width="2.6"/>
 </g>${eye(1112-12,318-127,7.5,3.4)}${eye(1112+12,318-127,7.5,3.4)}</g></g></g>

 <!-- drifting doodles: paperclip, page, star, envelope, pen, folder, pin -->
 <g class="dcf-dood" stroke="${N}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  <g class="dcf-d dcf-d1" transform="translate(360 70) rotate(-18)"><path d="M0 22 V-6 a8 8 0 0 1 16 0 V26 a12 12 0 0 1 -24 0 V0" fill="none" stroke="${R}" stroke-width="3.4"/></g>
  <g class="dcf-d dcf-d2" transform="translate(585 74) rotate(-8)"><rect x="-12" y="-15" width="24" height="30" rx="3" fill="#fff" stroke="#1334A6" stroke-width="2.4"/><path d="M-6 -6 H6 M-6 0 H6 M-6 6 H2" stroke="#1334A6" stroke-width="2.2"/></g>
  <g class="dcf-d dcf-d3" transform="translate(806 54)"><path d="M0 -15 l4.5 9.5 l10.5 1.5 l-7.5 7.5 l2 10.5 l-9.5 -5 l-9.5 5 l2 -10.5 l-7.5 -7.5 l10.5 -1.5 Z" fill="${GOLD}"/></g>
  <g class="dcf-d dcf-d4" transform="translate(1020 52) rotate(10)"><rect x="-20" y="-13" width="40" height="26" rx="3" fill="#fff"/><path d="M-20 -11 L0 3 L20 -11" fill="none"/></g>
  <g class="dcf-d dcf-d5" transform="translate(205 110) rotate(28)"><rect x="-4" y="-26" width="8" height="40" rx="2" fill="${R}"/><path d="M-4 14 L0 24 L4 14" fill="#fff"/><path d="M-4 -18 h8" fill="none" stroke="#fff"/></g>
  <g class="dcf-d dcf-d6" transform="translate(800 352) rotate(-8)"><path d="M-18 -10 h12 l4 5 h20 v19 h-36 Z" fill="${SKY}"/></g>
  <g class="dcf-d dcf-d7" transform="translate(300 352)"><circle r="6" fill="${RED}"/><path d="M0 6 v10" fill="none"/></g>
  <g class="dcf-d dcf-d8" transform="translate(1180 210) rotate(14)"><path d="M0 -10 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1 Z" fill="${GOLD}"/></g>
 </g>

 <!-- ground, tufts, pebbles -->
 <g class="dcf-ground" filter="url(#dcf-boil)" stroke="${N}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 320 C120 316 210 323 320 319 S520 316 640 321 S860 317 980 320 S1120 323 1188 318"/>
  <path d="M150 320 l4 -9 l3 9 l4 -7 M420 319 l3 -8 l4 8 M612 321 l4 -9 l3 9 l4 -6 M826 318 l3 -8 l4 8 M1030 320 l4 -9 l3 9 M1170 318 l3 -7 l3 7" stroke-width="2.2"/>
  <ellipse cx="210" cy="336" rx="6" ry="4" stroke-width="2.2"/><ellipse cx="226" cy="340" rx="3.5" ry="2.6" stroke-width="2"/><ellipse cx="540" cy="338" rx="5" ry="3.5" stroke-width="2.2"/><ellipse cx="760" cy="334" rx="4" ry="3" stroke-width="2"/><ellipse cx="995" cy="339" rx="6" ry="4" stroke-width="2.2"/>
 </g>
</svg>`;
const scene=el('div','dcf-scene',svg);scene.setAttribute('aria-hidden','true');

/* closing line + call to action under the drawing */
const close=el('div','dcf-close');
if(tag){tag.classList.add('dcf-tag');close.append(tag)}
if(cta){cta.classList.add('dcf-btn','button');const btns=el('div','dcf-btns');btns.append(cta);close.append(btns)}

/* bottom bar + back to top */
const base=el('div','dcf-base');bottom&&base.append(bottom);
const up=el('button','dcf-up','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>');
up.type='button';up.setAttribute('aria-label','Back to top');up.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));base.append(up);

grid.remove();
const wrap=el('div','dcf-wrap');wrap.append(top,scene,close,base);f.append(wrap);

/* ---- life ---- */
const S=scene.querySelector('svg'),eyes=[...S.querySelectorAll('.dcf-eye')];
let vis=false,mx=600,my=-200,raf=0,tid=0;
const toSvg=(cx,cy)=>{const r=S.getBoundingClientRect();return[(cx-r.left)/r.width*1200,(cy-r.top)/r.height*420-50]};
function look(){raf=0;eyes.forEach(g=>{const x=+g.dataset.x,y=+g.dataset.y,m=+g.dataset.m,dx=mx-x,dy=my-y,dist=Math.hypot(dx,dy)||1,k=Math.min(1,dist/120)*m;
  const p=g.querySelector('.dcf-pupil'),gl=g.querySelector('.dcf-glint'),t=`translate(${(dx/dist*k).toFixed(2)}px,${(dy/dist*k).toFixed(2)}px)`;p.style.transform=t;gl.style.transform=t})}
if(!reduce){
  addEventListener('pointermove',e=>{if(!vis)return;[mx,my]=toSvg(e.clientX,e.clientY);if(!raf)raf=requestAnimationFrame(look)},{passive:true});
  /* blink now and then */
  const blink=()=>{if(vis){const c=S.querySelectorAll('.dcf-c')[Math.floor(Math.random()*4)];c&&c.classList.add('blink');setTimeout(()=>c&&c.classList.remove('blink'),170)}tid=setTimeout(blink,1400+Math.random()*2200)};blink();
  /* hand-drawn "boil": nudge the wobble seed a few times a second while in view */
  const bt=S.querySelector('.dcf-boil-t');let seed=3;setInterval(()=>{if(vis&&!d.hidden){seed=seed%5+1;bt.setAttribute('seed',String(seed*7+3))}},220);
}
/* click a character: it hops and the doodles near it jump */
S.querySelectorAll('.dcf-c').forEach(c=>{c.addEventListener('click',()=>{if(reduce)return;const h=c.querySelector('.dcf-hop');h.classList.remove('go');void h.getBoundingClientRect();h.classList.add('go')})});
scene.addEventListener('click',e=>{if(reduce||e.target.closest('.dcf-c'))return;S.querySelectorAll('.dcf-hop').forEach((h,i)=>{setTimeout(()=>{h.classList.remove('go');void h.getBoundingClientRect();h.classList.add('go')},i*90)})});
new IntersectionObserver(([e])=>{vis=e.isIntersecting;f.classList.toggle('dcf-on',vis)},{rootMargin:'80px'}).observe(scene);
})();
