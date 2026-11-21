/* Matchbox carousel (after 21st.dev @neebarp "Matchbox Carousel"), shared by the
   homepage Intelligence Center section and the Intelligence Center page. Each guide's
   title is printed on a sleeve; the tray slides out with a picture, the summary and the
   link, then closes as the boxes shuffle along. Copy is moved unchanged. */
(()=>{
const doc=document;
const el=(tag,cls,html)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e};
const ART=[['ucc-search-to-reflect','ucc-filing-monitoring'],['ucc','ucc-lien-research'],['municipal','title-municipal'],['property','title-municipal'],['zoning','title-municipal'],['good-standing','corporate'],['apostille','apostille'],['ofac','ofac']];
function matchbox(intel,igrid,label){

  const cards=[...igrid.querySelectorAll(':scope>a.knowledge-card')];
  const reduceM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  intel.classList.add('mbx-sec');
  const stage=el('div','mbx');stage.setAttribute('role','region');stage.setAttribute('aria-roledescription','carousel');stage.setAttribute('aria-label',(label||intel.querySelector('h2')||{}).textContent||'Guides');
  igrid.before(stage);const track=el('div','mbx-track');stage.append(track);
  cards.forEach((a,i)=>{const kick=a.querySelector(':scope>span'),h=a.querySelector(':scope>h3'),pp=a.querySelector(':scope>p'),bb=a.querySelector(':scope>b');
    a.classList.add('mbx-box');
    const sleeve=el('div','mbx-sleeve'),tray=el('div','mbx-tray');
    const n=el('span','mbx-n',String(i+1).padStart(2,'0'));n.setAttribute('aria-hidden','true');
    const strike=el('span','mbx-strike');strike.setAttribute('aria-hidden','true');
    [kick,h].forEach(x=>x&&sleeve.append(x));sleeve.append(n,strike);
    const href=a.getAttribute('href')||'',m=ART.find(([k])=>href.includes(k)),pic=el('div','mbx-pic');pic.setAttribute('aria-hidden','true');
    const im=el('img');im.alt='';im.loading='lazy';im.src='./assets/svc/'+(m?m[1]:'checklist')+'.svg';pic.append(im);
    tray.append(pic);[pp,bb].forEach(x=>x&&tray.append(x));
    a.append(sleeve,tray);track.append(a)});
  igrid.remove();
  const ui=el('div','mbx-ui');
  ui.innerHTML='<button type="button" class="mbx-btn" data-d="-1" aria-label="Previous guide"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="mbx-count" aria-hidden="true"></span><span class="mbx-dots"></span><button type="button" class="mbx-btn" data-d="1" aria-label="Next guide"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  stage.after(ui);
  const boxes=[...track.children],dots=ui.querySelector('.mbx-dots'),count=ui.querySelector('.mbx-count');
  const dotEls=boxes.map((b,i)=>{const d=doc.createElement('button');d.type='button';d.className='mbx-dot';d.setAttribute('aria-label',String(i+1));d.addEventListener('click',()=>go(i));dots.append(d);return d});
  let cur=0,busy=0,timer=0,hold=false;
  const flat=()=>matchMedia('(max-width:760px)').matches;
  const place=()=>{if(flat()){track.style.transform='';return}
    const bw=boxes[0].querySelector('.mbx-sleeve').offsetWidth,gap=parseFloat(getComputedStyle(track).columnGap)||24,aw=boxes[cur].offsetWidth||bw;
    const x=stage.clientWidth/2-(cur*(bw+gap)+(bw+(boxes[cur].classList.contains('is-on')?parseFloat(getComputedStyle(stage).getPropertyValue('--tw'))||0:0))/2);
    track.style.transform=`translate3d(${x.toFixed(1)}px,0,0)`};
  const mark=()=>{boxes.forEach((b,i)=>{b.classList.toggle('is-on',i===cur);b.classList.toggle('is-before',i<cur);b.classList.toggle('is-after',i>cur);b.setAttribute('aria-current',i===cur?'true':'false')});
    dotEls.forEach((d,i)=>i===cur?d.setAttribute('aria-current','true'):d.removeAttribute('aria-current'));
    count.textContent=String(cur+1).padStart(2,'0')+' / '+String(boxes.length).padStart(2,'0')};
  const open=()=>boxes[cur].classList.add('is-open');
  const go=i=>{i=(i+boxes.length)%boxes.length;if(i===cur&&boxes[cur].classList.contains('is-open'))return;
    clearTimeout(busy);boxes.forEach(b=>b.classList.remove('is-open'));
    const d=reduceM||flat()?0:420;
    busy=setTimeout(()=>{cur=i;mark();place();busy=setTimeout(()=>{open();arm()},reduceM||flat()?0:620)},d)};
  const arm=()=>{clearTimeout(timer);if(reduceM||hold||flat())return;timer=setTimeout(()=>go(cur+1),5200)};
  ui.addEventListener('click',e=>{const b=e.target.closest('.mbx-btn');if(b)go(cur+Number(b.dataset.d))});
  boxes.forEach((b,i)=>{b.addEventListener('click',e=>{if(i!==cur&&!flat()){e.preventDefault();go(i)}});
    b.addEventListener('focus',()=>{if(i!==cur&&!flat())go(i)})});
  stage.addEventListener('pointerenter',()=>{hold=true;clearTimeout(timer)});stage.addEventListener('pointerleave',()=>{hold=false;arm()});
  stage.addEventListener('focusin',()=>{hold=true;clearTimeout(timer)});stage.addEventListener('focusout',()=>{hold=false;arm()});
  new IntersectionObserver(([e])=>{if(e.isIntersecting)arm();else clearTimeout(timer)}).observe(stage);
  addEventListener('resize',place);
  mark();open();place();requestAnimationFrame(place);

}
window.AADSMatchbox=matchbox;
const home=doc.querySelector('#intelligence'),hg=home&&home.querySelector(':scope>.knowledge-grid');
if(hg)matchbox(home,hg);
const ks=doc.querySelector('#knowledge-search');
if(ks&&doc.querySelector('main.reading-page')){doc.body.classList.add('ic-page');
  const h=[...doc.querySelectorAll('main.reading-page>h2')].find(x=>/question in your file/i.test(x.textContent));
  const g=h&&h.nextElementSibling;if(g&&g.classList.contains('knowledge-grid')){const w=el('div','ic-shelf');h.before(w);w.append(h,g);matchbox(w,g,h)}}
})();
