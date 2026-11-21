'use strict';
(()=>{
 let navigating=false;
 function visit(tool){if(navigating)return;const old=history.state||{};if(old.page==='ai'&&old.aiTool===tool)return;history.pushState({...old,transera:true,page:'ai',aiTool:tool},'', '#ai');}
 window.BUSINESS_AI_NAV={visit};
 function compact(){if(page!=='ai')return;const root=document.querySelector('.ai-page');if(!root)return;root.querySelector('.ai-page-head')?.remove();const title=root.querySelector('.ai-workspace .ai-tool-title');if(title)root.prepend(title);root.querySelectorAll('[data-ai-chat-check],[data-ai-menu],[data-media-back]').forEach(x=>x.remove());let quota=root.querySelector('.ai-quota');if(!quota){const box=document.createElement('div');box.innerHTML=window.BIZNES_AI_CHAT_BRIDGE?.quotaHTML?.()||'';quota=box.querySelector('.ai-quota');if(quota)root.prepend(box);}const target=root.querySelector('.ai-chat-main > header')||root.querySelector('.ai-workspace > .card')||root;if(target===root){if(quota)quota.classList.add('ai-compact-quota');return;}let bar=target.matches('header')?target:target.querySelector('.ai-work-header');if(!bar){bar=document.createElement('header');bar.className='ai-work-header';target.prepend(bar);}if(quota){quota.classList.add('ai-compact-quota');if(quota.parentNode!==bar)bar.append(quota);}}
 window.BUSINESS_COMPACT_AI=compact;new MutationObserver(compact).observe(document.getElementById('content'),{childList:true,subtree:true});
 const previous=render;render=function(){previous();compact();};
 window.addEventListener('popstate',e=>{if(e.state?.businessWallet)return;setTimeout(()=>{if(page!=='ai')return;const tool=history.state?.aiTool;if(!tool||tool==='menu'){page='home';history.replaceState({...history.state,transera:true,page:'home',aiTool:null},'','#home');render();return;}navigating=true;window.BUSINESS_MUSIC?.hide();window.BUSINESS_MEDIA_DRAFT?.hide();if(tool==='song')void window.BUSINESS_MUSIC?.open();else if(tool==='audio')void window.BUSINESS_AUDIO?.open();else if(tool.startsWith('media-'))window.BUSINESS_MEDIA_DRAFT?.show(tool.slice(6));else window.BIZNES_AI_CHAT_BRIDGE?.show(tool);navigating=false;compact();},0);});
 compact();
})();
