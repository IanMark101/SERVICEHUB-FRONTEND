// Intercepted fixtures only: no live accounts, messages, bookings or payments.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base='http://localhost:3107';
const category={id:'qa-category',name:'Computer & Laptop Repair',isActive:true};
const location={latitude:10.258,longitude:123.95,label:'Cordova, Cebu'};
const service={id:'qa-service',providerId:'qa-provider',title:'LAPTOP REPAIR SERVICE',description:'Laptop diagnosis and repair. I review the work before proposing a final price.',price:null,priceType:'BY_AGREEMENT',estimatedDurationMins:60,status:'ACTIVE',isAvailable:true,paymentMethods:{cash:true,gcash:true},serviceLocationMode:'BOTH',latitude:location.latitude,longitude:location.longitude,locationLabel:'Cordova workshop',coverageRadiusKm:10,provider:{id:'qa-provider',name:'Ian Buenaflor',verificationStatus:'APPROVED',trustScore:70},category,photos:[]};
const request={id:'qa-inquiry',seekerId:'qa-seeker',targetProviderId:'qa-provider',targetServiceId:'qa-service',preferredPaymentMethod:null,title:service.title,description:'The laptop will not turn on. Please diagnose and repair the charging port.',budgetMin:0,budgetMax:0,urgency:'Flexible Schedule',serviceLocationMode:'SEEKER_VISITS',paymentMethods:{cash:true,gcash:true},status:'OPEN',createdAt:'2026-10-14T04:00:00Z',seeker:{id:'qa-seeker',name:'Client'},category,photos:[]};
const offer={id:'qa-offer',requestId:request.id,providerId:'qa-provider',serviceId:service.id,offeredPrice:1250,estimatedDuration:60,message:'Charging port repair, including parts and labor.',serviceLocationMode:'SEEKER_VISITS',venueLabel:'Cordova workshop',status:'PENDING',createdAt:'2026-10-14T04:10:00Z',provider:service.provider,request,service};
async function check(page,story,width,theme){
  await page.evaluate(()=>document.fonts.ready);
  const dialog=page.getByRole('dialog');
  if(await dialog.count()){
    const box=await dialog.boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+.5&&box.y+box.height<=900.5);
    assert.equal(await dialog.evaluate(el=>el.scrollWidth>el.clientWidth),false);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`.impeccable/review/agreement-${story}-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
 try{
  for(const [width,theme] of [[1440,'light'],[768,'light'],[390,'dark']])for(const story of ['listing','request','reply','approve']){
   const provider=['listing','reply'].includes(story);const id=provider?'qa-provider':'qa-seeker';const workspace=provider?'provider':'seeker';
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(12000);const writes=[],errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(({workspace,theme})=>{localStorage.setItem('workspaceRole',workspace);localStorage.setItem('theme',theme);},{workspace,theme});
   await context.routeWebSocket('**/socket.io/**',socket=>socket.close());await page.route('**/socket.io/**',route=>route.abort());
   const token=`${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:id,role:'user',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
   await page.route('**/api/**',async route=>{
    const p=new URL(route.request().url()).pathname,method=route.request().method(),payload=route.request().postDataJSON();
    if(method!=='GET'&&!p.startsWith('/api/auth/'))writes.push({p,payload});
    const body={success:true,data:[],pagination:{page:1,limit:12,total:0,totalPages:1}};
    if(['/api/auth/me','/api/auth/session','/api/auth/refresh'].includes(p))body.data={authenticated:true,accessToken:token,user:{id,role:'user',name:'QA Member',email:'qa@example.test',emailVerified:true,verificationStatus:'APPROVED',moderationStatus:'ACTIVE',onboardingStatus:'COMPLETED',trustScore:70}};
    else if(p==='/api/categories')body.data=[category];
    else if(p==='/api/services/mine')body.data=story==='listing'?[]:[service];
    else if(p==='/api/services')body.data=[service];
    else if(p==='/api/services/qa-service')body.data=service;
    else if(p==='/api/locations/search')body.data=[location];
    else if(p==='/api/auth/gcash-number')body.data={gcashNumber:null};
    else if(p==='/api/requests')body.data=story==='reply'||story==='approve'?[request]:[];
    else if(p==='/api/requests/listing-inquiry')body.data=request;
    else if(p==='/api/offers/received')body.data=story==='approve'?[offer]:[];
    else if(p==='/api/offers'&&method==='POST')body.data={...offer,...payload};
    else if(p==='/api/bookings/direct-from-offer')body.data={id:'qa-booking',status:'ACCEPTED'};
    else if(p.includes('summary'))body.data={summary:'No completed reviews yet.',source:'computed'};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
   });
   if(story==='listing'){
    await page.goto(base+'/provider/offer-services',{waitUntil:'domcontentloaded'});
    await page.getByRole('textbox',{name:'Service name',exact:true}).fill('Laptop repair services');
    await page.getByRole('textbox',{name:'What is included?',exact:true}).fill(service.description);
    await page.getByRole('combobox',{name:'Service category',exact:true}).selectOption(category.id);
    await page.getByRole('button',{name:'Next',exact:true}).click();
    await page.locator('[data-wizard-step="1"] summary').click();
    await page.getByRole('textbox',{name:'Find a city or barangay',exact:true}).fill('Cordova');await page.getByRole('button',{name:'Search',exact:true}).click();
    await page.getByRole('button',{name:'Cordova, Cebu',exact:true}).click();await page.getByRole('combobox',{name:'How far will you travel? (required)',exact:true}).selectOption('10');
    await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('combobox',{name:'How do you charge?',exact:true}).selectOption('BY_AGREEMENT');
    assert.equal(await page.getByRole('spinbutton',{name:'Service price (₱)',exact:true}).count(),0);
    await check(page,story,width,theme);assert.equal(writes.length,0);
   }else if(story==='request'){
    await page.goto(base+'/seeker/seek-services?serviceId=qa-service',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Request service',exact:true}).click();
    await page.getByRole('button',{name:'Next',exact:true}).click();await page.locator('#booking-form-error').waitFor();
    await page.getByRole('textbox',{name:'Describe the work needed',exact:true}).fill(request.description);
    await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('radio',{name:/You go to the provider/}).check();
    await page.getByRole('button',{name:'Review request',exact:true}).click();assert.equal(await page.getByRole('button',{name:'GCash',exact:true}).count(),0);
    await check(page,story,width,theme);assert.equal(writes.length,0);
    await page.getByRole('button',{name:'Send service request',exact:true}).click();await page.getByRole('status').filter({hasText:'Service request sent'}).waitFor();
    assert.deepEqual(writes,[{p:'/api/requests/listing-inquiry',payload:{serviceId:'qa-service',message:request.description,serviceLocationMode:'SEEKER_VISITS'}}]);
   }else if(story==='reply'){
    await page.goto(base+'/provider/incoming-requests',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Accept & set price',exact:true}).click();
    await page.getByRole('spinbutton',{name:'Final total (₱)',exact:true}).fill('1250');await page.getByRole('textbox',{name:'What is included in this price?',exact:true}).fill(offer.message);
    await check(page,story,width,theme);assert.equal(writes.length,0);
    await page.getByRole('button',{name:'Send price for approval',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
    assert.equal(writes.length,1);assert.equal(writes[0].p,'/api/offers');assert.equal(writes[0].payload.offeredPrice,1250);assert.equal(writes[0].payload.requestId,'qa-inquiry');
   }else{
    await page.goto(base+'/seeker/incoming-offers',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Accept Offer',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Confirm price & booking',exact:true});await dialog.waitFor();assert.ok((await dialog.textContent()).includes('₱1,250'));
    await check(page,story,width,theme);assert.equal(writes.length,0);
    await page.getByRole('button',{name:'On-site Cash',exact:true}).click();await dialog.waitFor({state:'hidden'});
    assert.equal(writes.length,1);assert.deepEqual(writes[0],{p:'/api/bookings/direct-from-offer',payload:{offerId:'qa-offer'}});
   }
   assert.deepEqual(errors,[]);results.push({story,width,theme,errors,writes});await context.close();
  }
 }finally{await browser.close();fs.writeFileSync('.impeccable/review/price-agreement-review.json',JSON.stringify(results,null,2));}
 console.log(JSON.stringify({views:results.length,overflow:false,pageErrors:0}));
})().catch(error=>{console.error(error);process.exit(1);});
