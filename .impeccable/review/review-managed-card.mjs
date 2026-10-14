import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = 'http://127.0.0.1:3107';
const portrait = '/images/hero-presenter.png';
const photos = [
  { id:'portrait', url:base+portrait, width:1200, height:1800 },
  { id:'wide', url:base+'/images/servicehub-hero.png', width:1600, height:900 },
  { id:'second-portrait', url:base+'/images/hero-presenter-casual.png', width:4828, height:5140 },
];
const category = { id:'qa-category', name:'Computer & Laptop Repair', isActive:true };
const primary = { id:'qa-managed', providerId:'qa-provider', title:'COMPUTER REPAIR', description:'Laptop diagnostics, hardware repair and replacement parts. Tell me what happened so I can explain the work and final price before booking.', price:null, priceType:'BY_AGREEMENT', estimatedDurationMins:120, status:'ACTIVE', isAvailable:true, paymentMethods:{cash:true,gcash:true}, serviceLocationMode:'PROVIDER_VISITS', locationLabel:'Alegria, Cordova, Cebu', coverageRadiusKm:30, publicMapPin:true, provider:{id:'qa-provider',name:'QA Provider',verificationStatus:'APPROVED',trustScore:70}, category, photos };
const listings = [primary,
  {...primary,id:'qa-no-photo',title:'LAPTOP MAINTENANCE',photos:[],priceType:'FIXED',price:1500,isAvailable:false,description:'Clean fans, check the battery and apply thermal paste. Parts are quoted separately before any work starts.'},
  {...primary,id:'qa-failed-photo',title:'PARTS REPLACEMENT',photos:[{id:'missing',url:base+'/qa-missing.jpg',width:900,height:1200}],priceType:'PER_PROJECT',price:700,description:'LongDescription'.repeat(45)},
];
const token=`${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(JSON.stringify({sub:'qa-provider',role:'user',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try {
  for(const [width,theme] of [[1440,'light'],[1440,'dark'],[1175,'light'],[768,'light'],[390,'light'],[390,'dark']]) {
    const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
    const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(({theme})=>{localStorage.setItem('workspaceRole','provider');localStorage.setItem('theme',theme);},{theme});
    await context.routeWebSocket('**/socket.io/**',socket=>socket.close());
    await page.route('**/socket.io/**',route=>route.abort());
    await page.route('**/api/**',async route=>{
      const path=new URL(route.request().url()).pathname;
      let data=[];
      if(['/api/auth/me','/api/auth/session','/api/auth/refresh'].includes(path))data={authenticated:true,accessToken:token,user:{id:'qa-provider',role:'user',name:'QA Provider',email:'qa@example.test',emailVerified:true,verificationStatus:'APPROVED',moderationStatus:'ACTIVE',onboardingStatus:'COMPLETED',trustScore:70}};
      else if(['/api/services','/api/services/mine'].includes(path))data=listings;
      else if(path==='/api/categories')data=[category];
      else if(path==='/api/auth/gcash-number')data={gcashNumber:null};
      else if(path==='/api/bookings/my-engagements')data={bookings:[],completedServices:[]};
      await route.fulfill({json:{success:true,data,pagination:{page:1,total:0,totalPages:1}}});
    });
    await page.goto(base+'/provider/service-manager',{waitUntil:'domcontentloaded'});
    const card=page.getByRole('article',{name:primary.title,exact:true});await card.waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('article img').evaluateAll(images=>images.forEach(image=>{image.loading='eager';}));
    async function capture(name) {
      await page.evaluate(()=>window.scrollTo(0,0));
      await card.evaluate(el=>{
        for(let parent=el.parentElement;parent;parent=parent.parentElement){
          if(/auto|scroll/.test(getComputedStyle(parent).overflowY))parent.scrollTop=0;
        }
      });
      await card.locator('img').evaluateAll(async images=>{
        await Promise.all(images.map(async image=>{await image.decode();assertPhoto(image);}));
        function assertPhoto(image){if(!image.naturalWidth||!image.naturalHeight)throw new Error(`Unloaded photo: ${image.currentSrc}`);}
      });
      const dimensions=await card.evaluate(el=>{
        const stage=el.querySelector('[data-presentation="managed"] > div:nth-child(2)');
        const image=stage?.querySelector('img');
        return {cardHeight:el.getBoundingClientRect().height,cardWidth:el.clientWidth,cardScroll:el.scrollWidth,stageHeight:stage?.getBoundingClientRect().height,imageHeight:image?.getBoundingClientRect().height,imageNaturalWidth:image?.naturalWidth,pageOverflow:document.documentElement.scrollWidth>innerWidth};
      });
      assert.equal(dimensions.pageOverflow,false);assert.ok(dimensions.cardScroll<=dimensions.cardWidth+1);
      assert.ok(dimensions.stageHeight<=281);assert.ok(dimensions.imageHeight<=dimensions.stageHeight+1);
      await page.screenshot({path:`.impeccable/review/managed-card-${name}-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
      results.push({name,width,theme,dimensions,errors:[...errors]});
    }
    await capture('default');
    await card.getByRole('button',{name:'Next photo'}).click();
    await card.getByAltText('COMPUTER REPAIR — photo 2 of 3').waitFor();
    assert.equal(await card.locator('[data-presentation="managed"]').count(),1);
    await capture('second-photo');
    await card.getByRole('button',{name:'Show photo 3'}).click();
    await card.getByRole('button',{name:'Next photo'}).focus();await page.keyboard.press('ArrowRight');
    await card.getByText('Photo 1 of 3',{exact:true}).waitFor();
    if(width<=768){
      await card.getByRole('switch').scrollIntoViewIfNeeded();
      await page.screenshot({path:`.impeccable/review/managed-card-controls-${width}-${theme}.png`,fullPage:true,animations:'disabled'});
      results.push({name:'controls',width,theme,errors:[...errors]});
    }
    if(width===1440&&theme==='light'){
      const emptyCard=page.getByRole('article',{name:'LAPTOP MAINTENANCE',exact:true});
      await emptyCard.scrollIntoViewIfNeeded();
      await page.screenshot({path:'.impeccable/review/managed-card-no-photos-1440-light.png',fullPage:true,animations:'disabled'});
      const failedCard=page.getByRole('article',{name:'PARTS REPLACEMENT',exact:true});
      await failedCard.scrollIntoViewIfNeeded();
      await failedCard.getByText('Photo unavailable. Please try again later.').waitFor();
      await page.screenshot({path:'.impeccable/review/managed-card-failed-photo-1440-light.png',fullPage:true,animations:'disabled'});
    }
    const longCard=page.getByRole('article',{name:'PARTS REPLACEMENT',exact:true});
    await longCard.getByRole('button',{name:'Read full description'}).click();
    assert.equal(await longCard.getByRole('button',{name:'Show less'}).getAttribute('aria-expanded'),'true');
    await card.getByRole('button',{name:'Edit',exact:true}).click();await page.getByRole('dialog',{name:'Edit Service Listing'}).waitFor();
    await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Edit Service Listing'}).waitFor({state:'hidden'});
    await card.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('dialog').waitFor();
    await page.getByRole('button',{name:'Cancel',exact:true}).click();
    assert.deepEqual(errors,[]);
    await context.close();
  }
  fs.writeFileSync('.impeccable/review/managed-card-review.json',JSON.stringify({passed:true,fixture:'Intercepted synthetic QA listings with existing repo photos; no application data changed.',results},null,2));
  console.log(JSON.stringify({passed:true,captures:results.length,results},null,2));
} finally {await browser.close();}
