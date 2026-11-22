/* Short request page (request.html), from Al's update, connected to the existing AADS intake (window.AADS_INTAKE).
   Without files it is sent as an inquiry; with files it is sent as an order so the attachments are stored. */
(()=>{
const d=document,form=d.querySelector('#journey-request'),select=d.querySelector('#request-service'),error=d.querySelector('#request-error'),receipt=d.querySelector('#receipt');
if(!form||!select)return;
const help={
'ucc-lien-research':'Include exact debtor names and variations, states/counties, UCC/tax/judgment/court categories, search dates and copy requirements. County and court coverage is confirmed separately.',
'corporate-documents-filings':'Include the legal entity name, issuing state, file number if known, exact certificate or filed document, certification and receiving-party requirements.',
'civil-litigation':'Include party names, courts, civil case categories, search period and requested documents.',
'bankruptcy-research':'Include exact names, bankruptcy courts or jurisdictions, search period and requested filings or docket documents.',
'criminal-research':'Include names, courts and jurisdictions, criminal case categories and search period; DOB for individuals and aliases if known.',
'court-litigation-bankruptcy':'Include party names, aliases, court/jurisdiction, search period and case categories. For criminal research include DOB through an authorized attachment when required. Specify misdemeanor and criminal traffic coverage; a county index is not a nationwide search.',
'ofac-sanctions-searches':'Include names, known identifiers, requested lists, search date and supporting evidence required.',
'registered-agent-services':'Include entity name, states, appointment or change, and the authorized end-client contact.',
'apostille-legalization':'Include document origin, destination country, receiving authority and required date. Tell us whether you hold the original.',
'ucc-filing-continuations':'Attach authorized filing instructions and documents. Identify state or county office, filing action, existing filing number if applicable, and any separate search to reflect.',
'ucc-lien-monitoring':'List subjects/filings, offices, frequency, dates and notification recipients. Coverage and availability must be confirmed before enrollment.',
'title-research':'Include property address, parcel, title search period, document copies and closing date. Municipal lien searches are a separate choice.',
'municipal-lien-search':'Include property address, parcel, city/county and closing date. Select the municipal records you need; Street, Fire and Certificate of Occupancy are optional.',
'title-municipal-research':'Include property address, parcel/legal description, title scope, code/permit/utility requirements, copies and closing date.'};
const LEGACY={'ucc-lien-monitoring':'ucc-lien-monitoring'};
const pre=new URLSearchParams(location.search).get('service')||'';if([...select.options].some(o=>o.value===pre))select.value=pre;
function guide(){const m=d.querySelector('#inquiry-municipal-items');if(m){m.hidden=!['municipal-lien-search','title-municipal-research','real-estate-package'].includes(select.value);m.disabled=m.hidden}
  d.querySelector('#service-help').textContent=help[select.value]||'Describe the records or documents your team needs, the jurisdictions and deadline. We can clarify the available options before work starts.'}
guide();select.addEventListener('change',guide);
const started=Date.now();let key=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36);
const val=n=>String((form.elements.namedItem(n)||{}).value||'').trim();
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;error.textContent='';
  const files=[...d.querySelector('#attachments').files];
  if(files.length>5||files.some(f=>f.size>5*1024*1024)||files.reduce((n,f)=>n+f.size,0)>15*1024*1024){error.textContent='Choose up to five files, 5 MB each and 15 MB total.';return}
  const cfg=(window.AADS_CONFIG||{}),ep=files.length?(cfg.order||{}).endpoint:(cfg.contact||{}).endpoint;
  if(!window.AADS_INTAKE||!ep){error.textContent='Requests cannot be sent from this page yet. Email requests@allamericandocs.com or call 866-318-8638.';return}
  const button=d.querySelector('#send-request');button.disabled=true;button.textContent='Sending…';
  const label=select.options[select.selectedIndex].text;
  const lines=['Request page: '+label,'Names, entity or property: '+val('subject'),'States, counties or courts: '+val('jurisdictions'),'Date needed: '+val('deadline'),val('clientReference')&&'Matter or client reference: '+val('clientReference'),'Searches, documents and instructions:\n'+val('details')].filter(Boolean).join('\n');
  const fd=new FormData();fd.set('client_request_id',key);fd.set('form_started_at',String(started));fd.set('bot-field',val('website'));if(form.querySelector('#privacy-consent:checked'))fd.set('privacy-consent','yes');fd.set('service',select.value==='other'?'other':select.value);fd.set('email',val('email'));
  for(const i of form.querySelectorAll('input[name="municipal-items"]:checked'))fd.append('municipal-items',i.value);
  if(form.querySelector('input[name="confirmed"]:checked'))fd.set('confirmed','yes');
  if(files.length){const parts=val('name').split(/\s+/);fd.set('request_kind','order');fd.set('first-name',parts.shift()||'');fd.set('last-name',parts.join(' ')||'-');fd.set('company',val('firm'));
    fd.set('jurisdictions',val('jurisdictions'));fd.set('date-needed',val('deadline'));fd.set('matter-reference',val('clientReference'));fd.set('instructions',lines);files.forEach(f=>fd.append('attachments',f))}
  else{fd.set('request_kind','inquiry');fd.set('name',val('name'));fd.set('company',val('firm'));fd.set('message',lines);fd.set('source','')}
  try{const r=await window.AADS_INTAKE.submit(ep,fd);
    form.hidden=true;receipt.hidden=false;receipt.className='receipt-box al-receipt';receipt.replaceChildren();
    const h=d.createElement('h2');h.textContent='Your request was received';receipt.append(h);
    const add=(k,v)=>{const p=d.createElement('p');const b=d.createElement('strong');b.textContent=k;p.append(b,d.createTextNode(v));receipt.append(p)};
    add('Reference: ',r.reference);add('Next: ','We’ll confirm the work, fees and expected timing before starting. This receipt does not confirm a delivery deadline.');
    add('Questions: ','Email requests@allamericandocs.com or call 866-318-8638 with your reference.');
    receipt.focus();key=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36);
  }catch(ex){error.textContent=ex.message||'Request could not be confirmed. Please retry; your form has been retained.'}
  finally{button.disabled=false;button.textContent='Send Request'}});
})();
