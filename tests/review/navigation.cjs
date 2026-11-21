async function openUnifiedTool(page,id){
 const toggle=page.locator('[data-nav-toggle]');if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();await page.locator('#business-nav-links [data-unified-tool="'+id+'"]').click();
 if(id==='chat'&&await page.locator('[data-model-dialog]').count()){const model=await page.evaluate(()=>BUSINESS_CHAT_SELECTION.get());await page.locator('[data-model-dialog] [data-select="'+model+'"]').click();}
}
module.exports={openUnifiedTool};
