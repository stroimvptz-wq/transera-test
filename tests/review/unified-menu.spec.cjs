const {test,expect}=require('playwright/test');
test('full public menu, nine model choices, mobile drawer and honest placeholders',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://functions.yandexcloud.net/**',r=>r.fulfill({json:{ok:true,history:[],options:[]}}));
 await page.goto('/');await expect(page.locator('#landing')).toBeHidden();
 const cards=page.locator('.unified-grid > button');await expect(cards).toHaveCount(9);
 await expect(cards).toHaveText(['Бизнес AI','Создать картинку','Создать пост','Создать видео','Оживить фото','Создать ролик','Создать песню','Документы','Транспорт, склад и финансы']);
 await page.locator('.unified-grid [data-unified-tool=chat]').click();await expect(page.locator('[data-model-dialog] .model-cards article')).toHaveCount(9);await expect(page.locator('[data-model-dialog]')).toContainText('За 1 млн токенов');await page.locator('[data-model-dialog] [data-close]').click();
 await page.locator('.unified-grid [data-unified-tool=clip]').click();await expect(page.locator('[data-model-dialog]')).toContainText('Функция готовится');await page.keyboard.press('Escape');
 for(const width of [1440,390]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/review-screens/new-home-'+width+'.png',fullPage:true});}
 await page.locator('[data-nav-toggle]').click();await expect(page.locator('#business-nav-links')).toBeVisible();await page.locator('#business-nav-links [data-unified-tool=documents]').click();await expect(page.locator('#business-nav-links')).toBeHidden();expect(errors).toEqual([]);
});
test('dedicated tools use model dialogs and retain independent video/photo drafts',async({page})=>{
 const options=require('./final-options.json');const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://functions.yandexcloud.net/**',r=>r.fulfill({json:{ok:true,enabled:true,history:[],options,requests:[]}}));await page.goto('/');
 await page.locator('.unified-grid [data-unified-tool=posts]').click();await expect(page.locator('[data-choose-post-model]')).toBeVisible();await page.locator('[data-choose-post-model]').click();await expect(page.locator('[data-model-dialog] article')).toHaveCount(9);await page.locator('[data-model-dialog] [data-select="claude-haiku-5.5"]').click();await expect(page.locator('[data-choose-post-model]')).toHaveText('Claude Haiku 5.5');await expect(page.locator('[name=modelSearch]')).toHaveCount(0);await expect(page.locator('[name=modelSort]')).toHaveCount(0);
 await page.locator('[data-nav-toggle]').click();await page.locator('#business-nav-links [data-unified-tool=video]').click();await page.locator('[name=prompt]').fill('Видео: море');
 await page.locator('[data-nav-toggle]').click();await page.locator('#business-nav-links [data-unified-tool=animate]').click();await expect(page.locator('[name=reference]')).toBeVisible();await page.locator('[name=prompt]').fill('Оживить: волны');
 await page.locator('[data-nav-toggle]').click();await page.locator('#business-nav-links [data-unified-tool=video]').click();await expect(page.locator('[name=prompt]')).toHaveValue('Видео: море');await expect(page.locator('[name=reference]')).toHaveCount(0);
 await page.locator('[data-choose-media-model]').click();await expect(page.locator('[data-model-dialog] article').first()).toBeVisible();await page.keyboard.press('Escape');expect(errors).toEqual([]);
});
test('logged-in menu keeps all public tools, shows balance/payment and mail is confined to Profile',async({page})=>{
 await page.route('https://functions.yandexcloud.net/**',r=>r.fulfill({json:{ok:true,walletVersion:2,balanceMicro:662800000,availableMicro:662800000,heldMicro:0,user:{email:'review@example.test',name:'Сергей'},verified:true,accounts:[],emails:[],history:[],ledger:[],options:[],requests:[],mail:{connected:false},generationEnabled:true,capabilities:['chat','speech']}}));await page.goto('/');await page.evaluate(()=>{currentUser={email:'review@example.test',name:'Сергей'};sessionStorage.setItem('business-ai-test2-auth-token','fixture');render();});
 await expect(page.locator('.unified-grid > button')).toHaveCount(9);await expect(page.locator('[data-home-payment]')).toBeVisible();await expect(page.locator('#content .ai-quota')).toContainText('662,8');
 await page.locator('[data-home-payment]').click();await expect(page.locator('[data-ai-topup="2000"]')).toContainText('2400');await expect(page.locator('[data-ai-topup="3000"]')).toContainText('4000');await expect(page.locator('#account-mail')).toBeHidden();
 await page.locator('[data-account-tab=profile]').click();await expect(page.locator('#account-mail')).toBeVisible();await expect(page.locator('#account-mail')).toHaveCount(1);
 await page.locator('[data-account-tab=appearance]').click();await expect(page.locator('#account-mail')).toBeHidden();
});
