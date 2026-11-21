/* AADS About page, v20 layer (21 Nov 2026).
   - Founder profile: photo placeholder (no picture yet) and a short bio written from Nean's notes
   - Company timeline: the page's own sections become a calm vertical timeline (no pinning, no scroll-locking).
     Only 2002 is a confirmed year; the other markers describe the stage, not a date. */
(()=>{
const d=document,main=d.querySelector('main.reading-page');if(!main||main.querySelector('.v-founder'))return;
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- founder ---------- */
const NAME='Khelef Mahfudh';
const f=el('section','v-founder');f.setAttribute('aria-labelledby','v-founder-name');
f.innerHTML=`<div class="v-founder-photo"><div class="v-founder-ph" role="img" aria-label="Photo of ${NAME} coming soon"><span aria-hidden="true">KM</span></div><p class="v-founder-ph-note" aria-hidden="true">Photo coming soon</p></div>
<div class="v-founder-copy"><p class="v-kicker">Principal and Founder</p><h2 id="v-founder-name">${NAME}</h2>
<p>${NAME.split(' ')[0]} founded All American Document Services in 2002 and has led the company from its first search to the nationwide service it is today. He built AADS on a simple belief: legal, lending, title and accounting teams deserve public-records work they can rely on, delivered by people who check it.</p>
<p>Through more than two decades of changing courts, filing offices and technology, he has kept the company steady and kept that standard in place. Under his leadership AADS now handles searches in every state, and he continues to oversee the company's work and direction every day.</p>
<ul class="v-founder-facts"><li><b>2002</b><span>Founded AADS</span></li><li><b>All states</b><span>Searches nationwide</span></li><li><b>Today</b><span>Oversees the company</span></li></ul></div>`;

/* ---------- timeline from the page's own sections ---------- */
const crumbs=main.querySelector('.breadcrumbs');
const h2s=[...main.querySelectorAll(':scope>h2')];
const LABEL=['2002','Our promise','Today','How we work','Next'];
const tl=el('section','v-tl');tl.setAttribute('aria-label','Company timeline');
tl.append(el('p','v-kicker v-tl-kicker','Company timeline'));
const ol=el('ol','v-tl-list');tl.append(ol);
h2s.forEach((h,i)=>{
  const li=el('li','v-tl-item');const mark=el('span','v-tl-mark',LABEL[i]||'');mark.setAttribute('aria-hidden','true');
  const card=el('div','v-tl-card');li.append(mark,card);
  let n=h.nextSibling;card.append(h);
  while(n&&!(n.nodeType===1&&(n.matches('h2')||n.matches('aside')))){const nx=n.nextSibling;card.append(n);n=nx}
  ol.append(li);
});
const anchor=crumbs?crumbs.nextSibling:main.firstChild;
main.insertBefore(f,anchor);main.insertBefore(tl,f.nextSibling);
main.classList.add('v-about');

if(!still&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.25});
  [f,...ol.children].forEach(x=>{x.classList.add('v-rise');io.observe(x)});
}
})();
