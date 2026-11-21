/* AADS horizontal timeline: plain-JS take on the 21st.dev "Product Timeline"
   (@hyperiux). The section pins; vertical scroll slides the track sideways;
   each milestone draws its stem and reveals its copy as it reaches the
   centre. Milestones are the About page's own h2 chapters, unchanged.
   Phones and reduced motion get a vertical reading layout. No gradients. */
(()=>{
const doc=document;
const main=/about-aads(\.html)?$/.test(location.pathname)&&doc.querySelector('main.reading-page');
if(!main)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad=n=>String(n).padStart(2,'0');
const heads=[...main.children].filter(c=>c.tagName==='H2');if(heads.length<2)return;

const tl=doc.createElement('section');tl.className='tl';tl.setAttribute('aria-label','AADS timeline');
tl.innerHTML='<div class="tl-pin"><div class="tl-head"><span class="tl-eyebrow"></span><span class="tl-count" aria-hidden="true"></span></div><div class="tl-viewport"><ol class="tl-track"></ol><div class="tl-axis" aria-hidden="true"><span class="tl-axis-fill"></span></div></div><div class="tl-hint" aria-hidden="true"><span></span></div></div>';
heads[0].before(tl);
const track=tl.querySelector('.tl-track'),pin=tl.querySelector('.tl-pin'),fill=tl.querySelector('.tl-axis-fill'),count=tl.querySelector('.tl-count');
// eyebrow re-uses the page's own breadcrumb label
const crumb=main.querySelector('.breadcrumbs span:last-child');tl.querySelector('.tl-eyebrow').textContent='';
if(crumb){tl.querySelector('.tl-eyebrow').setAttribute('aria-hidden','true');tl.querySelector('.tl-eyebrow').textContent=crumb.textContent}

const stones=heads.map((h,i)=>{
  const li=doc.createElement('li');li.className='tl-stone';
  li.innerHTML=`<div class="tl-card"></div><span class="tl-stem" aria-hidden="true"></span><span class="tl-node" aria-hidden="true"></span><span class="tl-label" aria-hidden="true">${pad(i+1)}</span>`;
  const card=li.querySelector('.tl-card');let x=h;
  const stop=y=>!y||(y.nodeType===1&&(y.tagName==='H2'||y.matches('aside,.article-cta,.tl')));
  const nodes=[];do{nodes.push(x);x=x.nextSibling}while(x&&!stop(x));
  nodes.forEach(n=>card.append(n));
  track.append(li);return li});

const mobile=()=>matchMedia('(max-width:759px)').matches;
let st=0,target=0,raf=0,maxX=0,on=false;
const layout=()=>{
  const flat=reduce||mobile();tl.classList.toggle('tl-flat',flat);
  if(flat){tl.style.height='';track.style.transform='';stones.forEach(s=>s.classList.add('is-in'));fill.style.transform='scaleX(1)';return}
  maxX=Math.max(0,track.scrollWidth-pin.clientWidth);
  tl.style.height=`calc(${pin.offsetHeight+maxX}px)`;
};
const progress=()=>{const r=tl.getBoundingClientRect(),span=tl.offsetHeight-pin.offsetHeight;return span>0?Math.min(1,Math.max(0,-(r.top-pinTop())/span)):0};
const pinTop=()=>parseFloat(getComputedStyle(pin).top)||0;
const frame=()=>{raf=0;if(tl.classList.contains('tl-flat'))return;
  target=progress();st+=(target-st)*.12;if(Math.abs(target-st)<.0004)st=target;
  track.style.transform=`translate3d(${(-st*maxX).toFixed(1)}px,0,0)`;fill.style.transform=`scaleX(${st.toFixed(4)})`;
  const mid=pin.getBoundingClientRect().left+pin.clientWidth*.62;let act=0;
  stones.forEach((s,i)=>{const r=s.getBoundingClientRect();const inn=r.left<mid;s.classList.toggle('is-in',inn);if(inn)act=i});
  count.textContent=`${pad(act+1)} / ${pad(stones.length)}`;
  if(Math.abs(target-st)>.0004)raf=requestAnimationFrame(frame)};
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
addEventListener('scroll',kick,{passive:true});
new ResizeObserver(()=>{layout();kick()}).observe(pin);
// keyboard: tabbing into a milestone scrolls the page so it slides into view
tl.addEventListener('focusin',e=>{if(tl.classList.contains('tl-flat'))return;const s=e.target.closest('.tl-stone');if(!s)return;const i=stones.indexOf(s);
  const span=tl.offsetHeight-pin.offsetHeight,goal=stones.length>1?i/(stones.length-1):0;
  scrollTo({top:scrollY+tl.getBoundingClientRect().top-pinTop()+goal*span,behavior:'smooth'})});
layout();kick();
})();
