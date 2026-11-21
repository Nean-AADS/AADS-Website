/* "Back" control on inside pages: returns to the previous AADS page, or to the homepage
   when the visitor arrived from elsewhere. One inline button by the breadcrumbs plus a
   floating one that appears after scrolling. */
(()=>{
const d=document;if(d.body.querySelector('.lys-hero:not(.lys-still)')||/(^|\/)(index\.html)?$/.test(location.pathname))return;
const main=d.querySelector('main');if(!main)return;
const internal=(()=>{try{return d.referrer&&new URL(d.referrer).origin===location.origin&&history.length>1}catch{return false}})();
const go=e=>{e.preventDefault();if(internal)history.back();else location.href='./index.html'};
const icon='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
const make=cls=>{const a=d.createElement('a');a.href='./index.html';a.className='back-nav '+cls;a.innerHTML=icon+'<span>Back</span>';a.addEventListener('click',go);return a};
const crumbs=main.querySelector('.breadcrumbs');
const inline=make('back-inline');crumbs?crumbs.before(inline):main.prepend(inline);
const fab=make('back-float');fab.setAttribute('aria-label','Back to the previous page');fab.tabIndex=-1;d.body.append(fab);
let on=false;const upd=()=>{const s=scrollY>520;if(s!==on){on=s;fab.classList.toggle('show',s)}};addEventListener('scroll',upd,{passive:true});upd();
const foot=d.querySelector('body>footer');foot&&new IntersectionObserver(([e])=>fab.classList.toggle('hide',e.isIntersecting),{rootMargin:'0px 0px -120px 0px'}).observe(foot);
})();
