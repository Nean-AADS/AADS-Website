/* Homepage hero, v20 (Nean & Khelef, 21 Nov 2026).
   An animated, interactive carousel that turns to the left. No scroll-locking, nothing spins.
   Slide 1  "See What Others Miss." over a calm field of sample records
   Slide 2  a navy card: the h2 and paragraph beside a large desktop monitor. The monitor screen is a
            small AADS workspace: pick a service on the left to see its sample document.
   After the carousel, the "since 2002" line, the two buttons and the service pills sit in their own
   section (they are no longer a slide).
   Every word is the page's own; this only moves existing elements.
   Reduced motion: no autoplay and no sliding; the controls still switch slides. */
(()=>{
const d=document,top=d.querySelector('.home-light .blue-top'),hero=top&&top.querySelector('section.hero');
if(!top||!hero||top.classList.contains('hm'))return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const copy=hero.querySelector('.hero-copy'),h1=copy&&copy.querySelector('h1'),h2=copy&&copy.querySelector('h2'),
  para=copy&&copy.querySelector('p:not(.hero-support)'),sup=copy&&copy.querySelector('.hero-support'),acts=copy&&copy.querySelector('.hero-actions'),
  chips=hero.querySelector('.service-shortcuts'),kicker=top.querySelector('.brand-strip'),img=hero.querySelector('.hero-main-art');
if(!h1||!h2||!para||!sup||!acts||!chips)return;
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const ic=p=>`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${p}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ALL=['ucc-search','ucc-filing','good-standing','municipal','title','apostille','ofac','court','registered-agent'];

/* headline in two lines (same words) */
const t1=h1.textContent.trim(),m=t1.match(/^(\S+\s+\S+)\s+(.+)$/);
if(m){h1.textContent='';h1.append(el('span','hm-l1',m[1]),d.createTextNode(' '),el('span','hm-l2',m[2]))}

/* slide 1: a calm field of records (they drift slowly, no rotation loops) */
const FIELD=[[5,16,.2,-10],[17,62,.55,7],[3,74,.9,-6],[29,9,.35,5],[71,12,.3,-8],[87,22,.85,7],[80,64,.5,-5],[93,80,.2,9],[62,78,.7,-4],[45,88,.15,8],[13,90,.4,-9],[53,5,.1,3]];
const field=el('div','hm-field');field.setAttribute('aria-hidden','true');
FIELD.forEach(([x,y,z,r],i)=>{const s=el('span','hm-fd'+(z>.8?' hm-near':''),`<img src="./assets/docs3d/${ALL[i%ALL.length]}.svg" alt="" loading="${i<6?'eager':'lazy'}">`);
  s.style.cssText=`--x:${x}%;--y:${y}%;--z:${z};--r:${r}deg;--i:${i}`;field.append(s)});

/* slide 2: the desktop monitor */
const links=[...chips.querySelectorAll('a')];
const DOCMAP=[['ucc-lien-research','ucc-search'],['ucc-filing','ucc-filing'],['corporate','good-standing'],['#municipal','municipal'],['title-municipal','title'],['apostille','apostille'],['ofac','ofac']];
const items=links.map(a=>{const h=a.getAttribute('href')||'';const k=(DOCMAP.find(([s])=>h.includes(s))||[0,'court'])[1];return {name:a.textContent.trim(),k,href:h}})
  .filter((v,i,arr)=>arr.findIndex(w=>w.k===v.k)===i);
const mon=el('div','mn',
 `<div class="mn-head">
    <div class="mn-bezel">
      <div class="mn-screen">
        <div class="mn-ui">
          <div class="mn-bar"><span class="mn-dots"><i></i><i></i><i></i></span><span class="mn-url"><i class="mn-lock"></i><b></b></span><img src="./assets/aads-logo.svg" alt="" width="844" height="420"></div>
          <div class="mn-app">
            <div class="mn-nav"></div>
            <div class="mn-view"><div class="mn-sheets"></div><div class="mn-pager"></div></div>
            <div class="mn-side" aria-hidden="true"><span class="mn-card"><i></i><i></i><i class="s"></i></span><span class="mn-card"><i></i><i class="s"></i></span><span class="mn-card mn-ok"><i></i><i class="s"></i></span></div>
          </div>
        </div>
        <span class="mn-glare" aria-hidden="true"></span>
      </div>
    </div>
    <div class="mn-chin"><img src="./assets/aads-logo.svg" alt="" width="844" height="420"><span class="mn-led"></span></div>
  </div>
  <div class="mn-neck"></div><div class="mn-foot"></div><div class="mn-shadow"></div>`);
const nav=mon.querySelector('.mn-nav'),sheets=mon.querySelector('.mn-sheets'),pager=mon.querySelector('.mn-pager'),ui=mon.querySelector('.mn-ui'),urlB=mon.querySelector('.mn-url b');
nav.setAttribute('role','group');nav.setAttribute('aria-label',img&&img.alt?img.alt:'Sample documents');
let doc=-1,docUser=false;
const btns=items.map((it,i)=>{const b=el('button','mn-item',`<i aria-hidden="true"></i><span>${it.name}</span>`);b.type='button';b.setAttribute('aria-pressed','false');
  b.addEventListener('click',()=>{docUser=true;showDoc(i)});nav.append(b);
  sheets.append(el('span','mn-sheet',`<img src="./assets/docs3d/${it.k}.svg" alt="" loading="lazy">`));pager.append(el('i'));return b});
const sheetEls=[...sheets.children],pips=[...pager.children];
function showDoc(i){if(i===doc)return;const prev=doc;doc=i;
  btns.forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-pressed',String(j===i))});
  pips.forEach((p,j)=>p.classList.toggle('on',j===i));
  urlB.textContent='aads.com/'+(items[i].href.replace(/^\.\//,'').replace(/\.html.*$/,'')||'');
  sheetEls.forEach((s,j)=>{s.classList.toggle('on',j===i);s.classList.toggle('out',j===prev)})}
showDoc(0);
sheets.addEventListener('click',()=>{docUser=true;showDoc((doc+1)%items.length)});

/* build the carousel */
top.classList.add('hm');d.documentElement.classList.add('hm-home');
const root=el('section','hk hm-car');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label',t1);
const track=el('div','hk-track');track.setAttribute('aria-live','off');
const s1=el('div','hk-slide hm-s1'),s2=el('div','hk-slide hm-s2');
const in1=el('div','hm-in');in1.append(h1);s1.append(field,in1);
const card=el('div','hm-card'),left=el('div','hm-left'),dev=el('div','hm-device');
left.append(h2,para);dev.append(mon);card.append(left,dev);s2.append(card);
const slides=[s1,s2],N=slides.length;
const names=[t1,h2.textContent.trim()];
slides.forEach((s,i)=>{s.id='hk-slide-'+(i+1);s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');s.setAttribute('aria-label',`${i+1} / ${N}`);track.append(s)});
const STAY=[6000,14000];
const ctrl=el('div','hk-ctrl');
const prev=el('button','hk-arrow',ic('M15 5l-7 7 7 7'));prev.type='button';prev.setAttribute('aria-label','Previous slide');
const next=el('button','hk-arrow',ic('M9 5l7 7-7 7'));next.type='button';next.setAttribute('aria-label','Next slide');
const dotsEl=el('div','hk-dots');
const dots=slides.map((s,i)=>{const b=el('button','hk-dot','<span class="hk-bar"><span class="hk-fill"></span></span>');b.type='button';
  b.setAttribute('aria-label',names[i]);b.setAttribute('aria-controls',s.id);b.setAttribute('aria-current','false');b.style.setProperty('--stay',STAY[i]+'ms');
  b.addEventListener('click',()=>go(i));dotsEl.append(b);return b});
const pause=el('button','hk-pause');pause.type='button';
const P_PAUSE=ic('M9 5v14M15 5v14'),P_PLAY='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
ctrl.append(prev,dotsEl,next,pause);
root.append(track,ctrl);

/* the "since 2002" call to action: its own section right after the carousel */
const cta=el('section','hm-cta');cta.setAttribute('aria-label',sup.textContent.trim());
const ctaIn=el('div','hm-cta-in');kicker&&ctaIn.append(kicker);ctaIn.append(sup,acts,chips);cta.append(ctaIn);
links.forEach(a=>a.insertAdjacentHTML('beforeend','<i class="hm-arrow" aria-hidden="true"></i>'));
hero.before(root);root.after(cta);hero.classList.add('hm-rest');

let cur=-1,stopped=reduce,holdN=0,seen=true;
function state(){const run=!stopped&&!holdN&&seen&&!d.hidden;root.classList.toggle('hk-run',run);root.classList.toggle('hk-stopped',stopped);
  pause.innerHTML=stopped?P_PLAY:P_PAUSE;pause.setAttribute('aria-label',stopped?'Play slides':'Pause slides');
  track.setAttribute('aria-live',stopped?'polite':'off')}
function go(i,dir){i=(i+N)%N;if(i===cur)return;const from=cur;
  dir=dir||(from<0?1:(i>from?1:-1));
  slides.forEach((s,k)=>{const on=k===i;s.inert=!on;s.setAttribute('aria-hidden',String(!on))});
  const inc=slides[i];
  if(from>=0&&!reduce){
    const out=slides[from];
    inc.classList.remove('hk-out','hk-play');inc.style.setProperty('--from',dir>0?'100%':'-100%');inc.classList.add('hk-from');
    void inc.offsetWidth;
    inc.classList.remove('hk-from');inc.classList.add('on');
    out.style.setProperty('--to',dir>0?'-100%':'100%');out.classList.remove('on');out.classList.add('hk-out');
    clearTimeout(out._t);out._t=setTimeout(()=>{if(!out.classList.contains('on'))out.classList.remove('hk-out','hk-play')},1400);
  }else{slides.forEach((s,k)=>{s.classList.toggle('on',k===i);if(k!==i)s.classList.remove('hk-play')})}
  cur=i;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(cur===i)inc.classList.add('hk-play')}));
  dots.forEach((b,k)=>{b.classList.toggle('on',k===i);b.classList.toggle('done',k<i);b.setAttribute('aria-current',String(k===i));
    const f=b.querySelector('.hk-fill');f.style.animation='none';void f.offsetWidth;f.style.animation=''});
  if(i===1&&!docUser)showDoc(0);
}
dots.forEach((b,k)=>b.querySelector('.hk-fill').addEventListener('animationend',()=>{if(k===cur&&root.classList.contains('hk-run'))go(cur+1,1)}));
prev.addEventListener('click',()=>go(cur-1,-1));
next.addEventListener('click',()=>go(cur+1,1));
pause.addEventListener('click',()=>{stopped=!stopped;if(!stopped)docUser=false;state()});
const holdOn=()=>{holdN++;state()},holdOff=()=>{holdN=Math.max(0,holdN-1);state()};
if(matchMedia('(hover:hover)').matches)[ui,ctrl].forEach(z=>{z.addEventListener('pointerenter',holdOn);z.addEventListener('pointerleave',holdOff)});
let focusHeld=false;
root.addEventListener('focusin',()=>{if(!focusHeld){focusHeld=true;holdOn()}});
root.addEventListener('focusout',e=>{if(focusHeld&&!root.contains(e.relatedTarget)){focusHeld=false;holdOff()}});
root.addEventListener('keydown',e=>{if(e.target.closest('.hk-dots')){if(e.key==='ArrowRight'){e.preventDefault();go(cur+1,1);dots[cur].focus()}if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1,-1);dots[cur].focus()}}});
new IntersectionObserver(es=>es.forEach(e=>{seen=e.isIntersecting;state()}),{threshold:.35}).observe(root);
d.addEventListener('visibilitychange',state);
/* on the monitor, the documents turn by themselves until the visitor picks one */
setInterval(()=>{if(cur!==1||docUser||reduce||!root.classList.contains('hk-run'))return;showDoc((doc+1)%items.length)},2800);
/* the monitor turns a touch toward the pointer (small, slow) */
const head=mon.querySelector('.mn-head');
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){let raf=0,mx=0,my=0,cx=0,cy=0;
  const loop=()=>{cx+=(mx-cx)*.06;cy+=(my-cy)*.06;mon.style.transform=`perspective(1800px) rotateX(${(-cy*3).toFixed(2)}deg) rotateY(${(cx*5).toFixed(2)}deg)`;
    raf=Math.abs(mx-cx)>.002||Math.abs(my-cy)>.002?requestAnimationFrame(loop):0};
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(loop)});
  card.addEventListener('pointerleave',()=>{mx=my=0;if(!raf)raf=requestAnimationFrame(loop)})}
go(0);state();
requestAnimationFrame(()=>root.classList.add('hk-ready'));
})();
