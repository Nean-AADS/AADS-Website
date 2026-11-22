(()=>{
  // Sends a form to the configured HTTPS intake endpoint and returns the server reference.
  // Errors carry .field when the server rejected one specific field, so the form can point to it.
  function fail(message,field){const e=new Error(message);if(field)e.field=field;return e;}
  async function submit(endpoint,payload){
    /* Al's update: the new service choices (title vs municipal, civil / bankruptcy / criminal) and municipal items
       travel inside the text the intake already stores, under the closest existing service code. */
    const SPLIT={'title-research':['title-municipal-research','Title Searches'],'municipal-lien-search':['title-municipal-research','Municipal Lien Searches'],
      'civil-litigation':['court-litigation-bankruptcy','Civil Litigation Searches'],'bankruptcy-research':['court-litigation-bankruptcy','Bankruptcy Searches'],
      'criminal-research':['court-litigation-bankruptcy','Criminal Court Searches']};
    try{const kind=payload.get('request_kind'),textField=kind==='order'?'instructions':'message',extra=[];
      const sv=payload.get('service');if(SPLIT[sv]){payload.set('service',SPLIT[sv][0]);extra.push('Service selected: '+SPLIT[sv][1])}
      const items=payload.getAll('municipal-items');if(items.length){extra.push('Municipal records requested: '+items.join(', '))}payload.delete('municipal-items');
      if(payload.get('confirmed')){extra.push('Authorized to provide these instructions and documents: yes')}payload.delete('confirmed');
      if(extra.length){const t=String(payload.get(textField)||'');payload.set(textField,extra.join('\n')+(t?'\n\n'+t:''))}
    }catch{}
    let url;try{url=new URL(endpoint)}catch{throw fail('Receiving service is not configured.')}
    if(url.protocol!=='https:'||url.username||url.password)throw fail('Receiving service is not configured.');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
    try{
      const response=await fetch(url.href,{method:'POST',body:payload,credentials:'omit',signal:controller.signal});
      let receipt=null;try{receipt=await response.json()}catch{}
      if(!response.ok){
        const message=receipt&&typeof receipt.error==='string'&&receipt.error.length<300?receipt.error:'Receipt could not be confirmed. Your request has not been cleared from this form.';
        throw fail(message,receipt&&typeof receipt.field==='string'?receipt.field:'');
      }
      if(!receipt||receipt.success!==true||typeof receipt.reference!=='string'||!receipt.reference.trim()||receipt.reference.length>100)throw fail('A valid request reference was not returned. Receipt could not be confirmed.');
      const kind=payload.get('request_kind');
      if(['inquiry','order'].includes(kind))window.dispatchEvent(new CustomEvent('aads:intake-receipt',{detail:{kind}}));
      return {reference:receipt.reference.trim()};
    }catch(error){
      if(error.name==='AbortError')throw fail('The response timed out. Receipt is uncertain; retry with the same request details.');
      if(error instanceof TypeError)throw fail('The form could not reach AADS. Check your connection and try again. Your details remain in this form.');
      throw error;
    }finally{clearTimeout(timer);try{window.turnstile?.reset?.()}catch{}}
  }
  window.AADS_INTAKE={submit};
})();
