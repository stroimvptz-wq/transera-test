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
test('music choices replace raw numbers; duration and persona are optional',async({page})=>{await setup(page);await open(page);await expect(page.locator('[data-music-form] .ai-error')).toHaveCount(0);await expect(page.locator('select[name=styleWeight]')).toBeVisible();await expect(page.locator('input[name=styleWeight]')).toHaveCount(0);await expect(page.locator('select[name=vocalGender] option')).toHaveText(['Автоматически','Мужской','Женский']);await page.locator('[name=styleWeight]').selectOption('1');await page.locator('[name=weirdnessConstraint]').selectOption('0.5');await page.locator('[name=customMode]').check();await expect(page.locator('[name=duration]')).toHaveCount(0);await page.locator('[name=durationMode]').selectOption('manual');await page.locator('[name=duration]').fill('120');await expect(page.locator('[name=personaId]')).toBeHidden();await page.locator('[data-music-persona] summary').click();await expect(page.locator('[name=personaId]')).toBeVisible();await expect(page.locator('[data-music-persona]')).toContainText('Для обычной песни ID не нужен');const draft=await page.evaluate(()=>BUSINESS_MUSIC.snapshot().draft);expect(draft.duration).toBe('120');expect(draft.styleWeight).toBe('1');expect(draft.weirdnessConstraint).toBe('0.5');await page.locator('[name=durationMode]').selectOption('auto');await expect(page.locator('[name=duration]')).toHaveCount(0);expect(await page.evaluate(()=>BUSINESS_MUSIC.snapshot().draft.duration)).toBe('');});
test('existing saved numeric settings and manual duration are preserved',async({page})=>{await setup(page);await page.evaluate(email=>BUSINESS_DEVICE_DRAFTS.set('music',{draft:{model:'suno/generate',customMode:true,duration:'125',audioWeight:'0.65',styleWeight:'0.2',prompt:'Текст песни',title:'Песня',style:'Поп'}},email),email);await open(page);await expect(page.locator('[name=durationMode]')).toHaveValue('manual');await expect(page.locator('[name=duration]')).toHaveValue('125');await expect(page.locator('[name=audioWeight]')).toHaveValue('0.65');await expect(page.locator('[name=styleWeight]')).toHaveValue('0.2');await expect(page.locator('[name=audioWeight] option:checked')).toHaveText('Сохранённая настройка');});
test('real music error is visible, empty error box is absent',async({page})=>{await setup(page,{quoteError:true});await open(page);await expect(page.locator('[data-music-form] .ai-error')).toHaveCount(0);await page.locator('[name=prompt]').fill('Песня о море');await create(page).click();await expect(page.locator('[data-music-form] .ai-error')).toBeVisible();await expect(page.locator('[data-music-form] .ai-error')).toContainText('Не удалось проверить вход');});
