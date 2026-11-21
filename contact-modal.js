/* Request pop-up. The "Start Your Next Request" form opens in a dialog from any page
   (header "Get in Touch", "Discuss Your Request", "Start the conversation" and every other #contactUs link).
   On the homepage the existing section is moved into the dialog; other pages build the same markup
   from TPL below (a copy of the homepage section, wording unchanged). Must load before form-guard.js and script.js. */
(()=>{
const TPL="<section class=\"section contact\" id=\"contactUs\"><!-- CONTACT PANEL LAYOUT START --><div class=\"split\"><aside class=\"contact-panel\" aria-labelledby=\"contact-title\"><h2 id=\"contact-title\">Start Your Next Request</h2><p class=\"contact-intro\">Tell us what you need and the date your team is working toward. Choose a service or package and share the jurisdictions and supporting documents required.</p><img class=\"illustration\" src=\"./assets/contact-illustration.svg\" alt=\"Illustration of two professionals connecting\" width=\"600\" height=\"460\" loading=\"lazy\"><div class=\"contact-methods\"><a class=\"contact-method\" href=\"tel:+18663188638\"><span class=\"contact-method-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 5a2 2 0 0 1 2-2Z\"/></svg></span><span class=\"contact-method-text\"><span class=\"contact-method-label\">Phone</span><span class=\"contact-method-value\">866-318-8638</span></span></a><a class=\"contact-method\" href=\"mailto:requests@allamericandocs.com\"><span class=\"contact-method-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 7 9 6 9-6\"/></svg></span><span class=\"contact-method-text\"><span class=\"contact-method-label\">Email</span><span class=\"contact-method-value\">requests@allamericandocs.com</span></span></a></div></aside><div class=\"contact-form-panel\"><noscript><p>JavaScript is required to use the inquiry form. Submission delivery must be configured by the site administrator.</p></noscript><form aria-labelledby=\"contact-title\" id=\"contact-form\" name=\"aads-contact\" method=\"POST\" data-netlify=\"true\" netlify-honeypot=\"bot-field\">\n<input type=\"hidden\" name=\"form-name\" value=\"aads-contact\"><p class=\"honeypot\" aria-hidden=\"true\"><label>Leave this field empty <input name=\"bot-field\" tabindex=\"-1\" autocomplete=\"off\"></label></p><label for=\"full-name\">Full Name</label><input id=\"full-name\" name=\"name\" placeholder=\"Your Full Name\" autocomplete=\"name\" required><label for=\"company\">Company</label><input id=\"company\" name=\"company\" placeholder=\"Company Name\" autocomplete=\"organization\"><div class=\"form-row\"><div><label for=\"email\">Email</label><input id=\"email\" name=\"email\" type=\"email\" placeholder=\"Your Email Address\" autocomplete=\"email\" required></div><div><label for=\"phone\">Phone Number</label><input id=\"phone\" name=\"phone\" type=\"tel\" placeholder=\"Your Phone Number\" autocomplete=\"tel\"></div></div><label for=\"service\">What do you need?</label><select id=\"service\" name=\"service\"><option value=\"\">Select a service</option><option value=\"court-litigation-bankruptcy\">Civil, Criminal &amp; Bankruptcy Court Research</option><option value=\"ucc-filing-continuations\">UCC Filing &amp; Continuation Services</option><option value=\"ucc-lien-monitoring\">UCC &amp; Lien Monitoring \u2014 scope inquiry</option><option value=\"ucc-lien-research\">UCC, Lien &amp; Litigation Research</option><option value=\"title-municipal-research\">Real Estate Title &amp; Municipal Lien Research</option><option value=\"corporate-documents-filings\">Corporate Documents, Filings &amp; Registered Agent Support</option><option value=\"apostille-legalization\">Apostille, Authentication &amp; Legalization</option><option value=\"ofac-sanctions-searches\">OFAC &amp; Sanctions Searches</option><option value=\"registered-agent-services\">Registered Agent Services</option><option value=\"due-diligence-package\">UCC, Lien &amp; Litigation Due Diligence Package</option><option value=\"real-estate-package\">Real Estate Package</option><option value=\"other\">Another request / scope review</option></select><label for=\"message\">Message</label><textarea id=\"message\" name=\"message\" rows=\"4\" placeholder=\"Tell us about the service, jurisdiction and date needed.\" required></textarea><label for=\"source\">How did you hear about us?</label><select id=\"source\" name=\"source\"><option value=\"\">Please select an option</option><option>Search engine</option><option>Referral</option><option>LinkedIn</option><option>Email</option><option>Other</option></select><div class=\"consent-field\"><input type=\"checkbox\" id=\"privacy-consent\" name=\"privacy-consent\" value=\"yes\" required><label for=\"privacy-consent\">I have read the <a href=\"./privacy.html\" target=\"_blank\" rel=\"noopener\">Privacy Notice</a> and agree that AADS may use the information I provide to respond to this request. <span class=\"consent-required\" aria-hidden=\"true\">*</span></label></div><p class=\"form-note\">Contact form setup is in progress. This form does not currently send or save information.</p><button class=\"button solid\" type=\"submit\">Contact form unavailable</button><p id=\"form-status\" role=\"status\" hidden></p></form></div></div><!-- CONTACT PANEL LAYOUT END --></section>";
const d=document;
let sec=d.getElementById('contactUs');
if(!sec){const t=d.createElement('template');t.innerHTML=TPL;sec=t.content.firstElementChild;}
sec.classList.add('rq');
const form=sec.querySelector('#contact-form');form&&form.classList.add('rq-form');
/* pair Full Name + Company in one row (layout only) */
if(form&&!form.querySelector('.rq-pair')){const pair=d.createElement('div');pair.className='form-row rq-pair';
  ['full-name','company'].forEach(id=>{const l=form.querySelector('label[for="'+id+'"]'),f=form.querySelector('#'+id);if(l&&f){const w=d.createElement('div');l.before(pair);w.append(l,f);pair.append(w)}});}
const dlg=d.createElement('dialog');dlg.className='rq-modal';dlg.id='request-dialog';dlg.setAttribute('aria-labelledby','contact-title');
const shell=d.createElement('div');shell.className='rq-shell';
const close=d.createElement('button');close.type='button';close.className='rq-close';close.setAttribute('aria-label','Close');
close.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
shell.append(close,sec);dlg.append(shell);d.body.append(dlg);

/* 3D request docket: mirrors what the visitor types, using the form's own labels. */
const panel=sec.querySelector('.contact-panel'),intro=sec.querySelector('.contact-intro');
const lab=id=>{const l=sec.querySelector('label[for="'+id+'"]');return l?l.textContent.trim():''};
const stage=d.createElement('div');stage.className='rq-stage';stage.setAttribute('aria-hidden','true');
stage.innerHTML='<div class="rq-scene"><span class="rq-orb rq-orb-a"></span><span class="rq-orb rq-orb-b"></span><span class="rq-orb rq-orb-c"></span>'+
 '<div class="rq-sheet rq-sheet-3"></div><div class="rq-sheet rq-sheet-2"></div>'+
 '<div class="rq-ticket"><div class="rq-t-top"><img src="./assets/aads-logo.svg" alt="" width="84" height="42"><span class="rq-t-bar"><i></i></span></div>'+
 ['full-name','company','service','message'].map(id=>'<div class="rq-t-row" data-for="'+id+'"><span class="rq-t-l">'+lab(id)+'</span><span class="rq-t-v"></span></div>').join('')+
 '<div class="rq-stamp"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54"/><circle cx="60" cy="60" r="44"/><path d="M38 62l14 14 30-32"/></svg></div></div></div>';
if(panel){(intro||panel.firstElementChild).after(stage)}
const ticket=stage.querySelector('.rq-ticket'),bar=stage.querySelector('.rq-t-bar i');
function mirror(){
  if(!form)return;
  stage.querySelectorAll('.rq-t-row').forEach(r=>{const f=form.querySelector('#'+r.dataset.for);let v='';
    if(f){v=f.tagName==='SELECT'?(f.value?f.options[f.selectedIndex].text:''):f.value.trim()}
    if(v.length>64)v=v.slice(0,64)+'…';r.querySelector('.rq-t-v').textContent=v;r.classList.toggle('on',!!v)});
  const req=[...form.querySelectorAll('[required]')];const ok=req.filter(f=>f.type==='checkbox'?f.checked:f.value.trim()&&f.checkValidity()).length;
  bar.style.transform='scaleX('+(req.length?ok/req.length:0)+')';stage.classList.toggle('ready',ok===req.length);
}
form&&['input','change','reset'].forEach(e=>form.addEventListener(e,()=>setTimeout(mirror,0)));
window.addEventListener('aads:intake-receipt',e=>{if(e.detail&&e.detail.kind==='inquiry'){stage.classList.remove('sent');void stage.offsetWidth;stage.classList.add('sent')}});
const still=matchMedia('(prefers-reduced-motion: reduce)');
stage.addEventListener('pointermove',e=>{if(still.matches)return;const r=stage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;stage.style.setProperty('--rx',(-y*14).toFixed(2)+'deg');stage.style.setProperty('--ry',(x*18).toFixed(2)+'deg')});
stage.addEventListener('pointerleave',()=>{stage.style.removeProperty('--rx');stage.style.removeProperty('--ry')});

/* open / close */
let opener=null;
function open(service,from){
  opener=from||d.activeElement;
  if(service&&form&&form.elements.service&&[...form.elements.service.options].some(o=>o.value===service))form.elements.service.value=service;
  mirror();stage.classList.remove('sent');
  if(!dlg.open){d.documentElement.classList.add('rq-open');dlg.showModal();requestAnimationFrame(()=>dlg.classList.add('in'))}
  const first=form&&form.querySelector('#full-name');first&&setTimeout(()=>first.focus({preventScroll:true}),60);
}
function shut(){dlg.classList.remove('in');const done=()=>{if(dlg.open)dlg.close()};still.matches?done():setTimeout(done,220)}
dlg.addEventListener('close',()=>{d.documentElement.classList.remove('rq-open');dlg.classList.remove('in');if(location.hash==='#contactUs')history.replaceState(null,'',location.pathname+location.search);opener&&opener.focus&&opener.focus({preventScroll:true})});
dlg.addEventListener('cancel',e=>{e.preventDefault();shut()});
close.addEventListener('click',shut);
dlg.addEventListener('pointerdown',e=>{if(e.target===dlg)shut()});
d.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href*="#contactUs"]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;
  let u;try{u=new URL(a.getAttribute('href'),location.href)}catch{return}
  if(u.hash!=='#contactUs')return;
  e.preventDefault();open(u.searchParams.get('service'),a);
});
window.AADSRequest={open,close:shut};
const boot=()=>{if(location.hash==='#contactUs')open(new URLSearchParams(location.search).get('service'))};
d.readyState==='loading'?d.addEventListener('DOMContentLoaded',boot):setTimeout(boot,0);
})();
