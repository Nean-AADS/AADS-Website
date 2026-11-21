/* AADS process flow: plain-JS take on the 21st.dev "Dimensional Workflow
   Hero" (@automate_flows). Same design as before, but nothing pins to the scroll (v20,
   21 Nov 2026): the steps play on their own, slowly, and the round step buttons under
   the picture (each carrying its step name) move between them. The 3D deck is bigger.
   Copy is the page's own, moved unchanged; the deck is decorative.
   Phones get a vertical flow; reduced motion keeps the graphic with instant step changes. */
(()=>{
const doc=document;
const sec=doc.querySelector('#ourProcess');if(!sec)return;
const grid=sec.querySelector('.process-grid');const steps=grid?[...grid.querySelectorAll(':scope>article')]:[];if(steps.length<2)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad=n=>String(n).padStart(2,'0');
const h2=sec.querySelector(':scope>h2'),intro=sec.querySelector(':scope>.section-intro');
const N=steps.length,CH=N+1,VPC=1.1;

const wf=doc.createElement('div');wf.className='wf';
wf.innerHTML=`<div class="wf-stage"><div class="wf-copy"></div><div class="wf-scene" aria-hidden="true"><div class="wf-deck"></div></div><nav class="wf-nav" aria-label="Process steps"><span class="wf-nav-line"><span class="wf-nav-fill"></span></span></nav></div>`;
(h2||grid).before(wf);
const copy=wf.querySelector('.wf-copy'),deck=wf.querySelector('.wf-deck'),nav=wf.querySelector('.wf-nav'),navFill=wf.querySelector('.wf-nav-fill'),stage=wf.querySelector('.wf-stage');

// chapter 0: the section's own heading + intro
const ch0=doc.createElement('div');ch0.className='wf-ch wf-intro';if(h2)ch0.append(h2);if(intro)ch0.append(intro);copy.append(ch0);
const chapters=[ch0];
const glyph=a=>{const g=a.querySelector('.process-icon');return g?g.textContent.trim():''};
const glyphs=steps.map(glyph);
steps.forEach((a,i)=>{const c=doc.createElement('div');c.className='wf-ch';
  const tag=doc.createElement('span');tag.className='wf-tag';tag.setAttribute('aria-hidden','true');tag.textContent=`${pad(i+1)} / ${pad(N)}`;
  c.append(tag,a);copy.append(c);chapters.push(c)});
grid.classList.add('sc-emptied');

// per-step mock screens (decorative, no text): request form, scope checklist,
// source map, review sheet, delivered file, follow-up thread
const bar=(w,c='')=>`<span class="wf-b ${c}" style="width:${w}%"></span>`;
const MOCKS=[
  ()=>`<div class="wf-form"><div class="wf-field">${bar(34,'k')}${bar(80,'v')}</div><div class="wf-field">${bar(26,'k')}${bar(64,'v')}</div><div class="wf-row2"><div class="wf-field">${bar(50,'k')}${bar(90,'v')}</div><div class="wf-field">${bar(44,'k')}${bar(76,'v')}</div></div><div class="wf-foot"><span class="wf-chip"></span><span class="wf-send"></span></div></div>`,
  ()=>`<div class="wf-check">${[1,1,1,0].map((c,k)=>`<div class="wf-ci${c?' on':''}"><i></i>${bar(70-k*12)}</div>`).join('')}<div class="wf-quote"><span></span>${bar(60,'v')}${bar(40)}</div></div>`,
  ()=>`<div class="wf-map"><div class="wf-search"><i></i>${bar(55)}</div><div class="wf-grid">${Array.from({length:40},(_,k)=>`<span class="${[6,17,29].includes(k)?'pin':[5,7,16,18,28,30].includes(k)?'near':''}"></span>`).join('')}</div></div>`,
  ()=>`<div class="wf-review"><div class="wf-sheet">${[88,72,80,60,76].map((w,k)=>`<div class="wf-rl">${bar(w)}${k%2?'':'<i></i>'}</div>`).join('')}</div><div class="wf-stamp"></div></div>`,
  ()=>`<div class="wf-deliver"><div class="wf-files"><span></span><span></span><span></span></div><div class="wf-dl"><i></i><div class="wf-prog"><span></span></div></div></div>`,
  ()=>`<div class="wf-thread"><div class="wf-msg l">${bar(80)}${bar(50)}</div><div class="wf-msg r">${bar(70,'w')}</div><div class="wf-msg l">${bar(60)}</div><div class="wf-typing"><span></span><span></span><span></span></div></div>`];
const mock=i=>MOCKS[i%MOCKS.length]();

// deck cards: a small flow diagram per step (prev → current → next)
const cards=steps.map((a,i)=>{const c=doc.createElement('div');c.className='wf-card';
  const node=(k,cls)=>k<0||k>=N?'<span class="wf-node is-ghost"></span>':`<span class="wf-node ${cls}"><b>${glyphs[k]}</b><i>${pad(k+1)}</i></span>`;
  c.innerHTML=`<div class="wf-card-top"><span></span><span></span><span></span><em>${pad(i+1)}</em></div>
  <div class="wf-flow">${node(i-1,'is-prev')}<span class="wf-link"><span class="wf-pulse"></span></span>${node(i,'is-now')}<span class="wf-link"><span class="wf-pulse"></span></span>${node(i+1,'is-next')}</div>
  <div class="wf-mock">${mock(i)}</div>`;
  deck.append(c);return c});

// step buttons under the picture: a circle with the step number and the step's own name
const names=steps.map(a=>{const h=a.querySelector('h3');return h?h.textContent.trim():''});
const ticks=chapters.map((c,i)=>{const b=doc.createElement('button');b.type='button';b.className='wf-tick';
  b.innerHTML=`<span class="wf-dot" aria-hidden="true">${i?pad(i):'—'}</span><span class="wf-name">${i?names[i-1]:'Overview'}</span>`;
  nav.append(b);b.addEventListener('click',()=>{user=true;jump(i)});return b});

const flat=()=>matchMedia('(max-width:899px)').matches; /* reduced motion keeps the graphic; steps just change without the glide */
let cur=0,target=0,raf=0,shown=-1,user=false,timer=null;
const layout=()=>{const f=flat();wf.classList.toggle('wf-flat',f);wf.style.height='';
  if(f){chapters.forEach(c=>{c.style.opacity='';c.style.transform='';c.style.visibility=''});cards.forEach(c=>c.style.transform='')}};
const jump=i=>{if(flat()){(chapters[i].querySelector('h3,h2')||chapters[i]).scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});return}
  target=i;kick()};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const frame=()=>{raf=0;if(wf.classList.contains('wf-flat'))return;
  cur+=(target-cur)*.07;if(reduce||Math.abs(target-cur)<.001)cur=target;
  const c=cur;
  chapters.forEach((ch,k)=>{const d=k-c,o=clamp(1-Math.abs(d)*1.8,0,1);ch.style.opacity=o.toFixed(3);
    ch.style.transform=`translate3d(0,${(d*40).toFixed(1)}px,0)`;ch.style.visibility=o<.01?'hidden':'visible';ch.style.pointerEvents=o>.5?'auto':'none'});
  cards.forEach((cd,k)=>{const d=k+1-c;let tx,ty,tz,ry,rx,op;
    if(d>=0){tx=d*58;ty=-d*14;tz=-d*110;ry=-26-Math.min(d,1)*8;rx=6;op=clamp(1-d*.14,0,1)}
    else{const a=-d;tx=-a*300;ty=a*30;tz=a*60;ry=-10+a*30;rx=6;op=clamp(1-a*1.4,0,1)}
    cd.style.transform=`translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx}deg)`;
    cd.style.opacity=op.toFixed(3);cd.style.zIndex=String(100-Math.round(Math.abs(d)*10));cd.classList.toggle('is-front',Math.abs(d)<.5)});
  navFill.style.transform=`scaleX(${(c/(CH-1)).toFixed(4)})`;
  const s=Math.round(c);if(s!==shown){shown=s;ticks.forEach((t,k)=>{t.classList.toggle('done',k<s);k===s?t.setAttribute('aria-current','step'):t.removeAttribute('aria-current')})}
  if(Math.abs(target-cur)>.001)raf=requestAnimationFrame(frame)};
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
// slow autoplay while the section is on screen; stops once someone picks a step, pauses on hover/focus
const play=()=>{clearInterval(timer);if(reduce)return;timer=setInterval(()=>{if(user||flat()||wf.matches(':hover,:focus-within'))return;jump((target+1)%CH)},6500)};
new IntersectionObserver(([e])=>{e.isIntersecting?play():clearInterval(timer)},{threshold:.35}).observe(wf);
new ResizeObserver(()=>{layout();kick()}).observe(stage);
wf.addEventListener('focusin',e=>{if(flat())return;const k=chapters.findIndex(c=>c.contains(e.target));if(k>=0&&k!==shown){user=true;jump(k)}});
nav.addEventListener('keydown',e=>{const k={ArrowRight:1,ArrowLeft:-1}[e.key];if(!k)return;e.preventDefault();user=true;const n=(target+k+CH)%CH;jump(n);ticks[n].focus()});
layout();kick();
})();
