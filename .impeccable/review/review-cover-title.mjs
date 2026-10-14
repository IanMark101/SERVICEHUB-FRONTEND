import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://127.0.0.1:3000';
const photo={id:'cover',url:base+'/images/hero-presenter.png',width:1200,height:1800};
const category={id:'qa-category',name:'Computer & Laptop Repair',isActive:true};
const user={id:'qa-user',role:'user',name:'QA Provider',email:'qa@example.test',emailVerified:true,verificationStatus:'APPROVED',moderationStatus:'ACTIVE',onboardingStatus:'COMPLETED',trustScore:70};
const common={description:'Laptop diagnostics and repair.',category,locationLabel:'Alegria, Cordova, Cebu',status:'ACTIVE',distanceKm:1.2,paymentMethods:{cash:true,gcash:false},photos:[photo]};
const service={...common,id:'qa-photo',providerId:user.id,provider:user,title:'COMPUTER REPAIR',price:null,priceType:'BY_AGREEMENT',estimatedDurationMins:120,isAvailable:true,serviceLocationMode:'EITHER',coverageRadiusKm:30};
const services=[service,{...service,id:'qa-wide',title:'LAPTOP REPAIR',photos:[{...photo,id:'wide',url:base+'/images/servicehub-hero.png'}]},{...service,id:'qa-none',title:'NO PHOTO LISTING',photos:[]}];
const requests=services.map((item,index)=>({...common,id:'qa-request-'+index,seekerId:'qa-other',seeker:{...user,id:'qa-other',name:'QA Seeker'},title:item.title,photos:item.photos,budget:2500,urgency:'THIS_WEEK',status:'OPEN',serviceLocationMode:'EITHER',createdAt:new Date().toISOString()}));
const token=`${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:user.id,role:'user',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
const browser=await chromium.launch({channel:'msedge',headless:true});const results=[];
let context;let page;let currentTheme='light';const errors=[];
try{
 for(const [role,width,theme] of [['seeker',1440,'light'],['seeker',827,'light'],['seeker',390,'light'],['seeker',1440,'dark'],['seeker',390,'dark']]){
  if(!context){
  context=await browser.newContext({viewport:{width,height:1000},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
  page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({role,theme})=>{localStorage.setItem('workspaceRole',role);localStorage.setItem('theme',theme);localStorage.setItem(`servicehub:marketplace-location:qa-user:${role}`,JSON.stringify({point:{latitude:10.26,longitude:123.95,label:'Cordova, Cebu'},radiusKm:10}));},{role,theme});
  await context.routeWebSocket('**/socket.io/**',socket=>socket.close());await page.route('**/socket.io/**',route=>route.abort());
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname;let data=[];
   if(['/api/auth/me','/api/auth/session','/api/auth/refresh'].includes(path))data={authenticated:true,accessToken:token,user};
   else if(path==='/api/services/nearby'||path==='/api/requests/nearby')data={items:path.includes('services')?services:requests,mapPins:[],pagination:{page:1,limit:6,total:3,totalPages:1}};
   else if(path==='/api/services'||path==='/api/services/mine')data=services;
   else if(path==='/api/categories')data=[category];
   else if(path==='/api/auth/gcash-number')data={gcashNumber:null};
   else if(path==='/api/bookings/my-engagements')data={bookings:[],completedServices:[]};
   await route.fulfill({json:{success:true,data,pagination:{page:1,total:0,totalPages:1}}});
  });
  await page.goto(base+(role==='seeker'?'/seeker/seek-services':'/provider/browse-services'),{waitUntil:'domcontentloaded'});
  }else{
    await page.setViewportSize({width,height:1000});
    if(theme!==currentTheme){await page.getByRole('button',{name:'Switch to dark mode'}).click();currentTheme=theme;await page.locator('html.dark').waitFor();}
  }
  const card=page.getByRole('article',{name:'COMPUTER REPAIR',exact:true});await card.waitFor();
  await page.locator('[data-marketplace-card] img').evaluateAll(images=>images.forEach(image=>image.loading='eager'));
  await page.locator('[data-marketplace-card] header img').evaluateAll(async images=>Promise.all(images.map(image=>image.decode())));
  await page.evaluate(()=>document.fonts.ready);
  const states=await page.locator('[data-marketplace-card]').evaluateAll(cards=>cards.map(card=>{
   const header=card.querySelector('header');const title=header.querySelector('h3');const shade=getComputedStyle(header.firstElementChild,'::after');
   return {title:title.textContent,hasPhoto:header.dataset.photo,color:getComputedStyle(title).color,textShadow:getComputedStyle(title).textShadow,shade:shade.backgroundImage,shadeContent:shade.content,width:card.clientWidth,scrollWidth:card.scrollWidth};
  }));
  for(const state of states){if(state.hasPhoto==='true'){assert.equal(state.color,'rgb(255, 255, 255)');assert.notEqual(state.textShadow,'none');assert.ok(state.shade.includes('0.94')&&state.shade.includes('0.68'));assert.equal(state.shadeContent,'""');}else{assert.equal(state.textShadow,'none');if(theme==='light')assert.notEqual(state.color,'rgb(255, 255, 255)');}}
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await card.locator('header').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const titleBox=await card.getByRole('heading',{name:'COMPUTER REPAIR',exact:true}).boundingBox();
  assert.ok(titleBox.y>80&&titleBox.y+titleBox.height<1000,'Target title must be fully visible in capture');
  await page.screenshot({path:`.impeccable/review/cover-title-${role}-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
  assert.deepEqual(errors,[]);results.push({role,width,theme,states,errors:[...errors]});
 }
 fs.writeFileSync('.impeccable/review/cover-title-review.json',JSON.stringify({passed:true,scope:'Only photo-backed listing title color and text shadow. Existing shade retained. Synthetic API data; no listing changes.',results},null,2));console.log(JSON.stringify({passed:true,captures:results.length}));
}finally{await browser.close();}
