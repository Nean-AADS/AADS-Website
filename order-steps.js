/* Order page: live step tracker + active/complete step states.
   Layout and behaviour only: the step names are read from the form's own headings,
   and nothing about how the form validates or submits is changed. */
(()=>{
const d=document,form=d.getElementById('order-form');if(!form)return;
const steps=[...form.querySelectorAll(':scope>section.step')];if(!steps.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(t,c,h)=>{const e=d.createElement(t);if(c)e.className=c;if(h!=null)e.textContent=h;return e};
const fieldsOf=s=>[...s.querySelectorAll('input,select,textarea')].filter(f=>f.type!=='hidden'&&!f.disabled&&!f.closest('.honeypot,[hidden]'));
const filled=f=>f.type==='checkbox'||f.type==='radio'?f.checked:f.type==='file'?f.files&&f.files.length>0:String(f.value||'').trim()!=='';
/* tracker */
const nav=el('nav','os-track');nav.setAttribute('aria-label','Order steps');
const head=el('div','os-head');const pct=el('span','os-pct','0%');pct.setAttribute('aria-hidden','true');
const bar=el('span','os-bar');const fill=el('i');bar.append(fill);head.append(bar,pct);
const list=el('ol','os-list');
const items=steps.map((s,i)=>{
  s.classList.add('os-step');s.dataset.osIndex=i;
  if(!s.id)s.id='order-step-'+(i+1);
  const h=s.querySelector('h2');
  const li=el('li','os-item');const a=el('a','os-link');a.href='#'+s.id;
  const n=el('span','os-n',String(i+1).padStart(2,'0'));n.setAttribute('aria-hidden','true');
  const t=el('span','os-t',h?h.textContent.trim():'');const m=el('span','os-m');m.append(el('i'));m.setAttribute('aria-hidden','true');
  const tw=el('span','os-tw');tw.append(t,m);a.append(n,tw);li.append(a);list.append(li);
  a.addEventListener('click',e=>{e.preventDefault();s.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    const f=fieldsOf(s).find(x=>!x.disabled);setTimeout(()=>f&&f.focus({preventScroll:true}),reduce?0:450)});
  return {s,li,a,m};
});
nav.append(head,list);
const side=d.querySelector('.order-page .sidebar .sticky')||d.querySelector('.order-page .sidebar');
if(side)side.prepend(nav);
/* compact bar for phones, where the sidebar sits below the form */
const mini=el('div','os-mini');mini.setAttribute('aria-hidden','true');
const mbar=el('span','os-bar');const mfill=el('i');mbar.append(mfill);
const dots=el('span','os-dots');items.forEach((it,i)=>{const b=el('span','os-dot',String(i+1));it.dot=b;dots.append(b)});
mini.append(dots,mbar);form.insertBefore(mini,steps[0]);
/* state */
let active=-1;
const setActive=i=>{if(i===active)return;active=i;items.forEach((it,k)=>{const on=k===i;it.s.classList.toggle('is-active',on);it.li.classList.toggle('is-active',on);it.dot.classList.toggle('is-active',on);on?it.a.setAttribute('aria-current','step'):it.a.removeAttribute('aria-current')})};
const update=()=>{let req=0,ok=0;
  items.forEach(it=>{const fs=fieldsOf(it.s);const r=fs.filter(f=>f.required);const pool=r.length?r:fs;
    const done=pool.filter(filled).length;const frac=pool.length?done/pool.length:0;
    it.m.firstChild.style.transform='scaleX('+frac.toFixed(3)+')';
    const complete=r.length?r.every(f=>filled(f)&&f.checkValidity()):false;
    it.s.classList.toggle('is-done',complete);it.dot.classList.toggle('is-done',complete);it.li.classList.toggle('is-done',complete);
    req+=r.length;ok+=r.filter(f=>filled(f)&&f.checkValidity()).length});
  const p=req?Math.round(ok/req*100):0;fill.style.transform=mfill.style.transform='scaleX('+(p/100)+')';pct.textContent=p+'%'};
form.addEventListener('input',update);form.addEventListener('change',update);form.addEventListener('reset',()=>setTimeout(update,0));
form.addEventListener('focusin',e=>{const s=e.target.closest('section.step');if(s)setActive(+s.dataset.osIndex)});
const io=new IntersectionObserver(es=>{if(form.contains(d.activeElement)&&d.activeElement!==form)return;
  const vis=items.map(it=>{const r=it.s.getBoundingClientRect();return Math.max(0,Math.min(r.bottom,innerHeight*.6)-Math.max(r.top,innerHeight*.15))});
  const best=vis.indexOf(Math.max(...vis));if(vis[best]>0)setActive(best)},{threshold:[0,.25,.5,.75,1]});
items.forEach(it=>io.observe(it.s));
setActive(0);update();
})();
