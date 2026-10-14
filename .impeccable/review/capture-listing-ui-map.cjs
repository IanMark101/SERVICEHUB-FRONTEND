// Intercepted fixtures only. No account, listing, message or payment is changed.
const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const base='http://localhost:3107';
const realPhoto=JSON.parse(fs.readFileSync('.impeccable/review/listing-ui-photo-fixture.json','utf8'));
const photos=[{...realPhoto,id:'qa-photo-1'},{...realPhoto,id:'qa-photo-2'},{...realPhoto,id:'qa-photo-3'}];
const category={id:'qa-category',name:'Computer & Laptop Repair',isActive:true};
const point={latitude:10.263845,longitude:123.952051,label:'Gabi, Cordova, Cebu'};
const service={id:'qa-service',providerId:'qa-provider',title:'LAPTOP REPAIR SERVICE',description:'Laptop diagnosis, charging-port repair and replacement parts. I explain the required work and final price before booking.\n\n'+ 'LongDescription'.repeat(30),price:null,priceType:'BY_AGREEMENT',estimatedDurationMins:60,status:'ACTIVE',isAvailable:true,paymentMethods:{cash:false,gcash:true},serviceLocationMode:'BOTH',latitude:point.latitude,longitude:point.longitude,locationLabel:point.label,publicMapPin:true,coverageRadiusKm:10,provider:{id:'qa-provider',name:'Ian Buenaflor',verificationStatus:'APPROVED',trustScore:70},category,photos};
const pin={id:service.id,title:service.title,providerName:service.provider.name,label:point.label,area:{latitude:point.latitude,longitude:point.longitude,approximate:false}};
const inquiry={id:'qa-inquiry',seekerId:'qa-seeker',targetProviderId:'qa-provider',targetServiceId:service.id,preferredPaymentMethod:null,title:service.title,description:'My laptop stopped charging and will not turn on. Please check the charging port and battery. The photos show the damage.\n\n'+ 'LongUnbrokenDescription'.repeat(20),budgetMin:0,budgetMax:0,urgency:'Flexible Schedule',serviceLocationMode:'PROVIDER_VISITS',paymentMethods:{cash:true,gcash:true},status:'OPEN',createdAt:new Date().toISOString(),seeker:{id:'qa-seeker',name:'Ana Reyes'},category,photos};
const publicRequest={...inquiry,id:'qa-public-request',targetProviderId:null,targetServiceId:null,budgetMin:500,budgetMax:2000,title:'LAPTOP CHARGING PORT REPAIR',latitude:point.latitude,longitude:point.longitude,locationLabel:point.label};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function snapshot(page,name,width,theme,results){
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('article img')].map(img => {
   img.loading='eager';
   return img.complete ? Promise.resolve() : new Promise(resolve => { img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,6000); });
 })); });
 await wait(150);
 const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth, cards:[...document.querySelectorAll('article')].map(el=>({width:el.clientWidth,scroll:el.scrollWidth})),dialogs:[...document.querySelectorAll('[role="dialog"]')].map(el=>({width:el.clientWidth,scroll:el.scrollWidth}))}));
 assert.equal(overflow.page,false); assert.ok(overflow.cards.every(item=>item.scroll<=item.width+1)); assert.ok(overflow.dialogs.every(item=>item.scroll<=item.width+1));
 await page.screenshot({path:`.impeccable/review/listing-ui-${name}-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
 results.push({name,width,theme,overflow});
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}); const results=[];
 try {
  for(const [width,theme] of (process.env.QA_MAP_DEBUG ? [[1440,'light']] : [[1440,'light'],[768,'light'],[390,'dark']])) for(const story of (process.env.QA_MAP_DEBUG || process.env.QA_MAP_ONLY ? ['map'] : ['inquiry','manager','map','location','provider-save'])) {
   const workspace=story==='map'?'seeker':'provider', id=`qa-${workspace}`;
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   let nearbyCalls=0, delayDiscovery=false, discoveryFinished=false;
   const token=`${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:id,role:'user',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
   await page.addInitScript(({workspace,theme,id,point})=>{localStorage.setItem('workspaceRole',workspace);localStorage.setItem('theme',theme);localStorage.setItem(`servicehub:marketplace-location:${id}:${workspace}`,JSON.stringify({point,radiusKm:10}));},{workspace,theme,id,point});
   await context.routeWebSocket('**/socket.io/**',socket=>socket.close());await page.route('**/socket.io/**',route=>route.abort());
   await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url()),p=url.pathname;
    const body={success:true,data:[],pagination:{page:1,limit:6,total:0,totalPages:1}};
    if(['/api/auth/me','/api/auth/session','/api/auth/refresh'].includes(p))body.data={authenticated:true,accessToken:token,user:{id,role:'user',name:'QA Member',email:'qa@example.test',emailVerified:true,verificationStatus:'APPROVED',moderationStatus:'ACTIVE',onboardingStatus:'COMPLETED',trustScore:70}};
    else if(p==='/api/categories')body.data=[category];
    else if(p==='/api/services/mine'||p==='/api/services')body.data=story==='location'?[]:[service];
    else if(p==='/api/services/qa-service')body.data=service;
    else if(p==='/api/requests')body.data=story==='inquiry'?[inquiry]:story==='provider-save'?[publicRequest]:[];
    else if(p==='/api/requests/qa-public-request')body.data=publicRequest;
    else if(p==='/api/locations/search')body.data=[point];
    else if(p==='/api/locations/reverse')body.data={label:'Gabi, Cordova, Cebu'};
    else if(p==='/api/auth/gcash-number')body.data={gcashNumber:null};
    else if(p==='/api/services/nearby'){
      nearbyCalls++; if(delayDiscovery){await wait(2500);discoveryFinished=true;}
      body.data={items:[service],mapPins:[pin],pagination:{page:1,limit:6,total:1,totalPages:1}};
    } else if(p==='/api/requests/nearby')body.data={items:[publicRequest],mapPins:[],pagination:{page:1,limit:6,total:1,totalPages:1}};
    else if(p.includes('summary'))body.data={summary:null,reason:'No completed reviews yet.'};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)}).catch(()=>{});
   });
   try {
    if(story==='inquiry'){
      await page.goto(base+'/provider/incoming-requests',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Accept & set price'}).waitFor();
      assert.equal(await page.getByRole('button',{name:'Accept & set price'}).evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(4, 120, 87)');
      await snapshot(page,'inquiry',width,theme,results);await page.getByText('Inquiry details',{exact:true}).click();await page.getByRole('button',{name:'Next photo'}).click();await snapshot(page,'inquiry-photos',width,theme,results);
    } else if(story==='manager'){
      await page.goto(base+'/provider/service-manager',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:service.title}).waitFor();
      assert.equal(await page.getByText('Cash',{exact:true}).count(),0);
      await snapshot(page,'manager',width,theme,results);await page.getByRole('button',{name:'View 3 listing photos'}).click();await page.getByRole('button',{name:'Next photo'}).click();await snapshot(page,'manager-photos',width,theme,results);
    } else if(story==='map'){
      await page.goto(base+'/seeker/seek-services',{waitUntil:'domcontentloaded'});await page.locator('[data-marketplace-card]').waitFor();
      await page.getByRole('button',{name:'Save listing',exact:true}).click();const toast=page.getByRole('status').filter({hasText:'Listing saved'});await toast.waitFor();
      assert.equal(await toast.getAttribute('data-feedback-tone'),'seeker');const color=await toast.locator('.servicehub-toast__icon').evaluate(el=>getComputedStyle(el).color);assert.ok(!['rgb(4, 120, 87)','rgb(110, 231, 183)'].includes(color));
      await snapshot(page,'seeker-save',width,theme,results);
      delayDiscovery=true;const before=Date.now();await page.locator('[data-marketplace-location] > button').click();const dialog=page.getByRole('dialog',{name:'Change search location'});
      await dialog.locator('[data-map-result]').waitFor();const markerDelay=Date.now()-before;assert.equal(discoveryFinished,false,'Cached markers should appear before delayed discovery completes');
      if(process.env.QA_MAP_DEBUG) await page.evaluate(()=>{window.mapClicks=[];document.addEventListener('pointerdown',event=>window.mapClicks.push({target:event.target.outerHTML.slice(0,400),x:event.clientX,y:event.clientY,parent:event.target.closest('.leaflet-marker-icon')?.outerHTML.slice(0,550)}),true);});
      await dialog.locator('[data-map-result]').click();
      if(process.env.QA_MAP_DEBUG) { await wait(250);console.log(JSON.stringify({trace:await page.evaluate(()=>window.mapClicks),markerDelay,popups:await page.locator('.leaflet-popup-content').allTextContents(),confirmation:await page.getByLabel('Confirm location').allTextContents(),icons:await page.locator('.leaflet-marker-icon').evaluateAll(els=>els.map(el=>({title:el.title,z:el.style.zIndex,rect:el.getBoundingClientRect().toJSON()})))})); }
      await dialog.getByText('Exact public pin · Shared by the provider',{exact:true}).waitFor();
      const coords=await dialog.locator('[data-map-result]').evaluate(el=>{const map=el.closest('.leaflet-container');const icon=el.closest('.leaflet-marker-icon');const center={x:icon.getBoundingClientRect().left+22-map.getBoundingClientRect().left,y:icon.getBoundingClientRect().top+22-map.getBoundingClientRect().top};return {center,transform:icon.style.transform};});
      await snapshot(page,'map',width,theme,results);results.push({name:'cached-marker-timing',width,theme,markerDelay,discoveryCalls:nearbyCalls,discoveryFinished,coords});
    } else if(story==='location'){
      await page.goto(base+'/provider/offer-services',{waitUntil:'domcontentloaded'});
      await page.getByRole('textbox',{name:'Service name',exact:true}).fill(service.title);await page.getByRole('textbox',{name:'What is included?',exact:true}).fill('I diagnose and repair laptop hardware safely.');await page.getByRole('combobox',{name:'Service category',exact:true}).selectOption(category.id);await page.getByRole('button',{name:'Next',exact:true}).click();
      await page.locator('[data-wizard-step="1"] summary').click();await page.getByRole('button',{name:'Use map instead',exact:true}).click();const map=page.getByRole('region',{name:/Location selection map/});await map.locator('.leaflet-control-zoom-in').waitFor();await map.click({position:{x:Math.min(180,width/3),y:130}});
      await page.getByRole('button',{name:'Use this location',exact:true}).waitFor();await page.getByRole('button',{name:'Use this location',exact:true}).click();
      await page.getByRole('checkbox',{name:/Show this exact pin on the public map/}).waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('input')].some(el=>el.value==='Gabi, Cordova, Cebu'));
      const consent=page.getByRole('checkbox',{name:/Show this exact pin on the public map/});assert.equal(await consent.isChecked(),false);await consent.check();await snapshot(page,'location-autofill-consent',width,theme,results);
    } else {
      await page.goto(base+'/provider/browse-services',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Save listing',exact:true}).click();const toast=page.getByRole('status').filter({hasText:'Listing saved'});await toast.waitFor();
      assert.equal(await toast.getAttribute('data-feedback-tone'),'provider');assert.ok(['rgb(4, 120, 87)','rgb(110, 231, 183)'].includes(await toast.locator('.servicehub-toast__icon').evaluate(el=>getComputedStyle(el).color)));await snapshot(page,'provider-save',width,theme,results);
    }
    assert.deepEqual(errors,[]);
   } catch(error) { results.push({story,width,theme,error:error.message,pageErrors:errors});await page.screenshot({path:`.impeccable/review/listing-ui-${story}-${width}-${theme}-error.png`,fullPage:true}).catch(()=>{}); }
   await context.close();
  }
 } finally { await browser.close();fs.writeFileSync(`.impeccable/review/listing-ui-map${process.env.QA_MAP_DEBUG ? '-debug' : process.env.QA_MAP_ONLY ? '-confirmed' : ''}-review.json`,JSON.stringify(results,null,2)); }
 const failures=results.filter(item=>item.error);console.log(JSON.stringify({captures:results.filter(item=>item.overflow).length,markerTimings:results.filter(item=>item.markerDelay!=null),failures}));if(failures.length)process.exit(1);
})().catch(error=>{console.error(error);process.exit(1);});
