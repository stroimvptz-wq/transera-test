/* Refresh idle saved tabs after a release. Never restart or repeat paid operations. */
'use strict';
(()=>{
 const version=document.currentScript?.dataset.version;if(!version)return;
 let checking=false,pending=null,reloading=false;
 function working(){return document.hidden||window.BIZNES_AI_CHAT_BRIDGE?.isBusy?.()||window.BUSINESS_MEDIA_DRAFT?.isBusy?.()||window.BUSINESS_AUDIO?.isBusy?.()||window.BUSINESS_MUSIC?.isBusy?.()||window.BUSINESS_CHAT_ATTACHMENTS?.isBusy?.()||!!document.querySelector('[aria-busy="true"],input[type=password]:focus,[data-ai-mic][aria-pressed=true],[data-media-mic][aria-pressed=true]');}
 async function apply(){if(!pending||working()||reloading)return;reloading=true;try{window.dispatchEvent(new Event('business-chat-changed'));window.BUSINESS_MEDIA_DRAFT?.snapshot?.();window.BUSINESS_MUSIC?.snapshot?.();if(typeof appSaveBeforeLeave==='function'&&!await appSaveBeforeLeave())return;if(working())return;const key='business-update-attempt';if(sessionStorage.getItem(key)===pending)return;sessionStorage.setItem(key,pending);location.reload();}finally{reloading=false;}}
 async function check(){if(checking||document.hidden||navigator.onLine===false)return;checking=true;try{const response=await fetch('site-version.json',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(10000)});if(!response.ok)return;const data=await response.json();if(typeof data.version==='string'&&data.version!==version&&/^[a-zA-Z0-9._-]{1,80}$/.test(data.version)){pending=data.version;await apply();}}catch{}finally{checking=false;}}
 for(const event of ['pageshow','focus','online'])window.addEventListener(event,()=>void check());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void check();});setInterval(()=>void check(),60000);void check();
})();
