/* Site motion layer (Motion for JavaScript, vendor/motion.min.js).
   Decorative only: every element is fully visible and usable without this file,
   and nothing animates for visitors who ask for reduced motion. */
(()=>{
  const header=document.querySelector('.site-header');
  if(header){
    const onScroll=()=>header.classList.toggle('is-scrolled',window.scrollY>8);
    onScroll();window.addEventListener('scroll',onScroll,{passive:true});
    // Let the dark hero band start under the floating header.
    const setH=()=>document.documentElement.style.setProperty('--hdr',header.offsetHeight+'px');
    setH();window.addEventListener('resize',setH,{passive:true});
  }

  const M=window.Motion;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(!M||!M.animate||reduce.matches)return;
  const {animate,inView,stagger,scroll}=M;
  const ease=[0.22,1,0.36,1];
  // Only animate things that start below the fold and are actually rendered (not in closed or hidden containers).
  const below=el=>!el.closest('details:not([open]),[hidden]')&&el.getClientRects().length>0&&el.getBoundingClientRect().top>window.innerHeight*0.92;
  const target=a=>a instanceof Element?a:a&&a.target;

  // 1) Scroll reveals: groups of cards rise in with a short stagger.
  const groups=['.knowledge-grid','.package-grid','.connection-grid','.deliverable-grid','.blog-grid','.process-grid','.expectation-grid','.proof-grid','.audience-routes','.ucc-paths','.email-preview-grid','.service-shortcuts','.content-columns'];
  const done=new WeakSet();
  document.querySelectorAll(groups.join(',')).forEach(group=>{
    const items=[...group.children].filter(c=>c.nodeType===1&&!c.matches('script,template,[hidden]'));
    if(!items.length||!below(group))return;
    items.forEach(i=>{i.style.opacity='0';done.add(i)});
    inView(group,()=>{
      animate(items,{opacity:[0,1],y:[-8,0],filter:['blur(4px)','blur(0px)']},{duration:.8,ease,delay:stagger(.07,{startDelay:.05})})
        .then?.(()=>items.forEach(i=>{i.style.transform='';i.style.opacity='';i.style.filter=''}));
    },{amount:0.12,margin:'0px 0px -8% 0px'});
  });

  // 2) Section headings, intros and stand-alone panels fade up once.
  const singles='main h2.center,.section-intro,.split>*,.blue-band,.connection-panel,.article-cta,.answer-box,.contact-form-panel,.contact-panel,.package-card,.order-page form .step,.experience-trust-intro,.state-hub-intro';
  document.querySelectorAll(singles).forEach(el=>{
    if(done.has(el)||!below(el))return;done.add(el);
    el.style.opacity='0';
    inView(el,()=>{animate(el,{opacity:[0,1],y:[-8,0],filter:['blur(4px)','blur(0px)']},{duration:.8,ease}).then?.(()=>{el.style.transform='';el.style.opacity='';el.style.filter=''});},{amount:0.2});
  });

  // 3) Homepage hero artwork settles in on load.
  const art=document.querySelector('.home-light .hero-art');
  if(art)animate(art,{opacity:[0,1],scale:[.96,1],y:[12,0]},{duration:.9,ease,delay:.1});
  // Headline word reveal: words rise out of a mask. The text itself is unchanged.
  const splitWords=h=>{
    const label=h.textContent.replace(/\s+/g,' ').trim();
    [...h.childNodes].forEach(n=>{
      if(n.nodeType!==3||!n.textContent.trim())return;
      const frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part)return;
        if(/^\s+$/.test(part)){frag.append(document.createTextNode(part));return;}
        const w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
        const i=document.createElement('span');i.textContent=part;w.append(i);frag.append(w);
      });
      n.replaceWith(frag);
    });
    h.setAttribute('aria-label',label);
    return h.querySelectorAll('.w>span');
  };
  document.querySelectorAll('.home-light .hero h1,.inside-hero h1').forEach(h=>{
    const words=splitWords(h);
    if(words.length)animate(words,{y:['110%','0%']},{duration:.9,ease,delay:stagger(.07,{startDelay:.1})});
  });
  const heroCopy=document.documentElement.classList.contains('lys-home')?[]:document.querySelectorAll('.home-light .hero-copy>*:not(h1),.home-light .brand-strip>*');
  if(heroCopy.length)animate(heroCopy,{opacity:[0,1],y:[14,0]},{duration:.6,ease,delay:stagger(.06)});
  const insideHero=document.querySelectorAll('.inside-hero>*:not(h1)');
  if(insideHero.length)animate(insideHero,{opacity:[0,1],y:[12,0]},{duration:.55,ease,delay:stagger(.05)});

  // 4) Smooth open/close for accordions and FAQ answers (native <details> keeps working without JS).
  document.querySelectorAll('details:not(.services-menu)').forEach(d=>{
    const summary=d.querySelector(':scope>summary');if(!summary)return;
    let running=null;
    summary.addEventListener('click',e=>{
      if(e.defaultPrevented)return;
      e.preventDefault();
      running?.stop?.();
      const start=d.offsetHeight;
      d.style.overflow='hidden';
      if(!d.open){
        d.open=true;
        const end=d.scrollHeight;
        running=animate(d,{height:[start+'px',end+'px']},{duration:.35,ease});
      }else{
        const end=summary.offsetHeight+(parseFloat(getComputedStyle(d).borderBottomWidth)||0);
        running=animate(d,{height:[start+'px',end+'px']},{duration:.28,ease:[.4,0,.2,1]});
        running.then?.(()=>{if(running)d.open=false;});
      }
      running.then?.(()=>{d.style.height='';d.style.overflow='';running=null;});
    });
  });

  // 5) Reading progress bar on long reading pages.
  const reading=document.querySelector('main.reading-page');
  if(reading&&scroll&&document.documentElement.scrollHeight>window.innerHeight*2.2){
    const bar=document.createElement('div');bar.className='read-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
    scroll(animate(bar,{scaleX:[0,1]},{ease:'linear'}));
  }

  // 5c) Magnetic main calls to action (pointer devices only).
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.home-light .hero-actions .button,.blue-band .button,.site-header .nav-contact,.article-cta .button').forEach(b=>{
      b.addEventListener('pointermove',e=>{
        const r=b.getBoundingClientRect();
        animate(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.28},{type:'spring',stiffness:300,damping:18});
      });
      b.addEventListener('pointerleave',()=>animate(b,{x:0,y:0},{type:'spring',stiffness:260,damping:14}));
    });
  }

  // 5d) Process steps: number nodes count in as the band scrolls into view.
  const steps=document.querySelectorAll('.section.process .process-grid>article');
  steps.forEach((a,i)=>{
    const n=a.querySelector('.process-icon');if(!n)return;
    inView(a,()=>{animate(n,{scale:[.6,1]},{type:'spring',stiffness:220,damping:16,delay:.08*(i%3)});},{amount:.5});
  });

  // 6) Services dropdown panel eases in.
  const services=document.querySelector('#services-menu');
  if(services)services.addEventListener('toggle',()=>{
    if(services.open&&matchMedia('(min-width:1181px)').matches){
      const panel=services.querySelector('.services-panel');
      if(panel)animate(panel,{opacity:[0,1]},{duration:.2,ease});
    }
  });
})();
