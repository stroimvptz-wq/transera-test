/* Informational policy links only: no consent checkbox or extra registration step. */
'use strict';
(()=>{
 window.BUSINESS_TERMS=Object.freeze({offer:'2026-11-21-2',tariffs:'2026-11-21-2'});
 function draw(){
  const landing=document.getElementById('landing-fields');if(landing&&!document.querySelector('[data-registration-policy]')){const p=document.createElement('p');p.dataset.registrationPolicy='';p.className='muted';p.innerHTML='Обработка данных описана в <a href="privacy.html" target="_blank" rel="noopener">Политике обработки персональных данных</a>.';landing.after(p);}
  const host=document.querySelector('.main');if(host&&!host.querySelector('.legal-footer')){const footer=document.createElement('footer');footer.className='legal-footer';footer.innerHTML='<details><summary>Правовая информация</summary><nav><a href="offer.html">Оферта</a><a href="tariffs.html">Тарифы и правила списания</a><a href="privacy.html">Обработка персональных данных</a><a href="contacts.html">Реквизиты и контакты</a></nav></details>';host.append(footer);}
 }
 const previous=render;render=function(){previous();draw();};draw();
})();

// Read policy documents without discarding the running application and its session.
(()=>{
 const allowed=new Set(['offer.html','tariffs.html','privacy.html','contacts.html']);let dialog=null,version=0;
 function close(){version++;dialog?.close();dialog?.remove();dialog=null;}
 async function show(url){const n=++version;try{const r=await fetch(url,{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error();const doc=new DOMParser().parseFromString(await r.text(),'text/html'),main=doc.querySelector('main');if(!main)throw Error();main.querySelectorAll('script,iframe,object,embed,form').forEach(x=>x.remove());main.querySelectorAll('*').forEach(x=>{for(const a of [...x.attributes])if(/^on/i.test(a.name)||['href','src'].includes(a.name)&&/^\s*javascript:/i.test(a.value))x.removeAttribute(a.name);});if(n!==version)return;if(!dialog){dialog=document.createElement('dialog');dialog.className='app-message-dialog legal-document-dialog';dialog.style.cssText='width:min(960px,calc(100vw - 24px));max-height:90svh;overflow:auto';dialog.addEventListener('cancel',e=>{e.preventDefault();close();});document.body.append(dialog);dialog.showModal();}dialog.replaceChildren();const nav=document.createElement('div');nav.className='actions';nav.innerHTML='<button class="btn" data-legal-close>‹ Назад</button><button class="btn" data-legal-home>⌂ Главная</button>';main.querySelector('nav')?.remove();dialog.append(nav,main);}catch{if(n===version)window.BUSINESS_CHAT_OPERATION_NOTICE?.('legal','Не удалось загрузить документ. Повторите открытие.');}}
 document.addEventListener('click',e=>{if(e.target.closest('[data-legal-close]')){e.preventDefault();close();return;}if(e.target.closest('[data-legal-home]')){e.preventDefault();close();document.querySelector('[data-go-home]')?.click();return;}const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;let u;try{u=new URL(a.href);}catch{return;}if(u.origin!==location.origin||!allowed.has(u.pathname.split('/').pop()))return;e.preventDefault();e.stopImmediatePropagation();void show(u.href);},true);
 window.addEventListener('popstate',close);
})();
