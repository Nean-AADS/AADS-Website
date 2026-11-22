/* Request status page (Al's update). Online status lookups need a status service that the AADS intake does not have yet,
   so the form explains how to get a status update instead of pretending to look one up. */
(()=>{const d=document,f=d.querySelector('#status-form'),r=d.querySelector('#status-result'),error=d.querySelector('#status-error');if(!f)return;
const params=new URLSearchParams(location.hash.slice(1));const ref=d.querySelector('#status-reference');if(ref)ref.value=params.get('reference')||'';
f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;error.textContent='';r.replaceChildren();
  const box=d.createElement('div');box.className='al-status-note';
  const h=d.createElement('h2');h.textContent='Online status checks are coming soon';
  const p=d.createElement('p');p.textContent='Until then, email us your reference and we’ll reply with the current status of your request.';
  const a=d.createElement('a');a.className='button';a.href='mailto:requests@allamericandocs.com?subject='+encodeURIComponent('Status update: '+(ref?ref.value:''));a.textContent='Email for a status update';
  box.append(h,p,a);r.append(box);box.scrollIntoView({block:'nearest'})});
})();
