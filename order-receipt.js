window.AADS_ORDER_RECEIPT=(box,saved)=>{
 box.replaceChildren();box.className='receipt-box';box.setAttribute('role','status');box.setAttribute('tabindex','-1');
 const url=new URL('./request-status.html',location.href);url.hash=new URLSearchParams({reference:saved.reference,code:saved.accessCode});
 const title=document.createElement('h2');title.textContent='Your review order was saved';box.append(title);
 for(const text of ['Reference: '+saved.reference,'Status: Received — awaiting staff review','We will confirm the work, fees and expected timing before starting. This receipt does not confirm a delivery deadline.','Private review only: staff email notifications are not connected.','Private access code: '+saved.accessCode]){const p=document.createElement('p');p.textContent=text;box.append(p);}
 const link=document.createElement('a');link.className='button outline';link.href=url.href;link.textContent='Check order status';box.append(link);
 const download=document.createElement('button');download.type='button';download.className='button outline';download.textContent='Download receipt';download.onclick=()=>{const blob=URL.createObjectURL(new Blob(['AADS PRIVATE REVIEW ORDER\nReference: '+saved.reference+'\nAccess code: '+saved.accessCode+'\nStatus link: '+url.href+'\nStaff email notifications are not connected.'],{type:'text/plain'}));const a=document.createElement('a');a.href=blob;a.download=saved.reference+'-receipt.txt';a.click();setTimeout(()=>URL.revokeObjectURL(blob),1000);};box.append(download);box.focus();
};
