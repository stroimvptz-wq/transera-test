const {test,expect}=require('playwright/test');
const email='recovery@example.test';
async function setup(page,{read='missing',recover='closed',quoteError=false}={}){
 const calls={generate:0,recover:0,read:0,ids:[]};
 await page.route('https://functions.yandexcloud.net/**',async r=>{
  const req=r.request(),url=new URL(req.url()),route=url.searchParams.get('route');
  let status=200,data={ok:true,verified:true,user:{email},history:[],requests:[],chats:[],items:[],walletVersion:2,availableMicro:100000000,balanceMicro:100000000,heldMicro:0};
  if(route==='/music/catalog')data={ok:true,enabled:true,models:[{id:'suno/generate',title:'Suno',mode:'song',maxChargeMicro:30000000}]};
  if(route==='/music/quote'){if(quoteError){status=503;data={ok:false,code:'AUTH_UNAVAILABLE',error:'Не удалось проверить вход.'};}else data={ok:true,maxChargeMicro:30000000};}
  if(route==='/music/generate'){calls.generate++;calls.ids.push(req.postDataJSON().id);status=503;data={ok:false,code:'AUTH_UNAVAILABLE',error:'Не удалось проверить вход.'};}
  if(route==='/music/request'){
   calls.read++;const id=url.searchParams.get('id');status=404;data={ok:false,code:'NOT_FOUND',error:'Музыка не найдена.'};
   if(read==='pending'){status=200;data={ok:true,request:{id,status:'pending',heldMicro:30000000,outputs:[]}};}
   if(read==='auth'){status=503;data={ok:false,code:'AUTH_UNAVAILABLE',error:'Не удалось проверить вход.'};}
   if(read==='generic404')data={ok:false,error:'Not Found'};
  }
  if(route==='/music/recover'){
   calls.recover++;expect(req.method()).toBe('POST');const {id}=req.postDataJSON();
   data={ok:true,request:{id,status:recover==='pending'?'pending':'failed',heldMicro:recover==='pending'?30000000:0,outputs:[],error:recover==='pending'?'':'Запрос не был запущен и закрыт без списания баллов.'}};
   if(recover==='error'){status=503;data={ok:false,code:'INTERNAL',error:'Сверка временно недоступна.'};}
  }
  await r.fulfill({status,json:data});
 });
 await page.goto('/');await page.evaluate(email=>{currentUser={email};sessionStorage.setItem('business-ai-test2-auth-token','fixture');render();},email);
 return calls;
}
const create=page=>page.locator('[data-music-form] [type=submit]');
async function open(page){await page.locator('.unified-grid [data-unified-tool=song]').click();await expect(page.locator('[data-music-model]')).toContainText('Suno');}
test('failed authentication followed by safe closure unlocks music without a second generation',async({page})=>{
 const calls=await setup(page);await open(page);await page.locator('[name=prompt]').fill('Песня о море');await create(page).click();
 await expect(create(page)).toBeEnabled();await expect(page.locator('.music-tracks')).toContainText('закрыт без списания');expect(calls.generate).toBe(1);expect(calls.recover).toBe(1);
 expect(await page.evaluate(()=>BUSINESS_MUSIC.isBusy())).toBeFalsy();await page.reload();await page.evaluate(email=>{currentUser={email};render();},email);await open(page);await expect(create(page)).toBeEnabled();await expect(page.locator('[name=prompt]')).toHaveValue('Песня о море');expect(calls.generate).toBe(1);
 // Only the user's next explicit submit creates a fresh ID.
 await create(page).click();await expect.poll(()=>calls.generate).toBe(2);expect(calls.ids[0]).not.toBe(calls.ids[1]);
});
test('old stuck draft is recovered when the music section is reopened',async({page})=>{
 const calls=await setup(page);await page.evaluate(email=>BUSINESS_DEVICE_DRAFTS.set('music',{draft:{model:'suno/generate',prompt:'Сохранённая песня'},job:{id:'legacy-music-request-1234',status:'uncertain'}},email),email);await open(page);await expect(create(page)).toBeEnabled();await expect(page.locator('[name=prompt]')).toHaveValue('Сохранённая песня');expect(calls.generate).toBe(0);expect(calls.recover).toBe(1);
});
for(const mode of ['pending','auth','generic404'])test('unconfirmed or existing request stays protected: '+mode,async({page})=>{
 const calls=await setup(page,{read:mode});await open(page);await page.locator('[name=prompt]').fill('Песня');await create(page).click();await expect.poll(()=>calls.read).toBeGreaterThan(0);await expect(create(page)).toBeDisabled();expect(calls.generate).toBe(1);expect(calls.recover).toBe(0);
});
for(const state of ['error','pending'])test('failed closure or a create found during reconciliation never unlocks: '+state,async({page})=>{
 const calls=await setup(page,{recover:state});await open(page);await page.locator('[name=prompt]').fill('Песня');await create(page).click();await expect.poll(()=>calls.recover).toBe(1);await expect(create(page)).toBeDisabled();expect(calls.generate).toBe(1);
});
test('quote failure unlocks without sending a generation or recovery request',async({page})=>{
 const calls=await setup(page,{quoteError:true});await open(page);await page.locator('[name=prompt]').fill('Песня');await create(page).click();await expect(page.locator('[data-music-form] [role=alert]')).toContainText('Не удалось проверить вход');await expect(create(page)).toBeEnabled();expect(calls.generate).toBe(0);expect(calls.recover).toBe(0);
});
