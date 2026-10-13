// Sapa Survival v3 — 3D Lagos World. Single-player life-sim. Three.js via importmap, no build step.
import {R,K} from './r3d.js?v=5';
import {makeAudio} from './audio.js?v=5';
import {makeStory} from './story.js?v=5';
const $=s=>document.querySelector(s);
const cv=$('#cv');
const SAVE='sapa_world_v3',MAXM=1e9,WW=4600,WH=1400,RY=560,RH=100,SHORE=1150,SEA=1220;
const DIST=[{id:'yaba',ox:0,n:['Yaba','Yaba']},{id:'vi',ox:1600,n:['Victoria Island','VI']},{id:'lekki',ox:3200,n:['Lekki','Lekki']}];
const SET=Object.assign({q:innerWidth<760?'med':'high',snd:1,lang:'en',vm:.8,vs:.8,va:.5},(()=>{try{return JSON.parse(localStorage.getItem('sapa_settings'))||{}}catch(e){return{}}})());
['vm','vs','va'].forEach(k=>{if(!(typeof SET[k]==='number'&&SET[k]>=0&&SET[k]<=1))SET[k]=k==='va'?.5:.8});if(SET.snd!==0)SET.snd=1;
const saveSet=()=>{try{localStorage.setItem('sapa_settings',JSON.stringify(SET))}catch(e){}};
let S=null;
const tr=(e,p)=>(((S&&S.lang)||SET.lang)==='pg')?p:e;
const L=a=>Array.isArray(a)?tr(a[0],a[1]):a;
const N=n=>'₦'+Math.round(n).toLocaleString('en-US');
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const okNum=n=>typeof n==='number'&&Number.isFinite(n);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=n=>rng(n*9973+17)();
const ZEB=[300,1000,1900,2620,3700,4350];

// ---------- World data ----------
const B=[];
function bd(id,kind,d,x,y,w,h,col,roof,lab,H=64){const b={id,kind,d,x,y,w,h,col,roof,lab,H,door:{x:x+w/2,y:y+h+16}};B.push(b);return b}
bd('room','home',0,80,180,240,170,'#d9a066','#8a4b2a',['Your Room (Face-me-I-face-you yard)','Your Room (Face-me-I-face-you)']);
bd('buka','buka',0,420,220,200,130,'#f4e1b0','#2e7d32',['Mama Shitta Amala Spot','Mama Shitta Amala Joint']);
bd('tech','tech',0,820,140,300,210,'#9fd3ff','#1b3a5c',['Yabacon Tech Hub','Yabacon Tech Hub'],90);
bd('park0','park',0,1180,250,180,100,'#ffd400','#333',['Yaba Danfo Park','Yaba Motor Park'],40);
bd('market','market',0,100,760,380,200,'#ff8a65','#c62828',['Balogun-style Market','Market (Balogun style)']);
bd('fuel','fuel',0,820,760,220,130,'#ffffff','#0b7a3e',['Mega Fuel Station','Fuel Station'],46);
bd('worship','worship',0,1120,740,220,190,'#fafafa','#1565c0',['Mosque & Church Corner','Mosque & Church Side']);
bd('bank','bank',1,1680,120,280,230,'#cfd8dc','#0d47a1',['Gidi Trust Bank','Gidi Trust Bank'],110);
bd('buka2','buka',1,1700,780,200,130,'#ffe0b2','#e65100',['Suya & Jollof Joint','Suya & Jollof Joint']);
bd('club','club',1,2400,180,280,170,'#311b92','#111',['Kwilox Club','Kwilox Club'],80);
bd('park1','park',1,2780,250,170,100,'#ffd400','#333',['VI Danfo Park','VI Motor Park'],40);
bd('flat','home',2,3280,140,280,210,'#eceff1','#455a64',['Lekki Phase 1 Flats','Lekki Phase 1 Flats'],120);
bd('studio','studio',2,3980,170,260,180,'#ff4081','#212121',['Lekki Vibes Studio','Lekki Vibes Studio'],80);
bd('park2','park',2,3300,780,170,100,'#ffd400','#333',['Lekki Danfo Park','Lekki Motor Park'],40);
bd('hospital','hospital',1,2420,770,270,170,'#fafafa','#b71c1c',['General Hospital Lagos','General Hospital'],100);
bd('beach','beach',2,4040,960,140,70,'#ffe082','#00838f',['Elegushy Beach Gate','Elegushy Beach Gate'],40);
const BY={};B.forEach(b=>BY[b.id]=b);
const HOMES=[{n:['Face-me-I-face-you room','Face-me-I-face-you'],rent:10000,fee:0,b:'room',sleep:.7},{n:['Self-contain','Self-contain'],rent:35000,fee:150000,b:'room',sleep:.9,rq:8},{n:['Lekki flat','Lekki flat'],rent:120000,fee:900000,b:'flat',sleep:1,rq:30}];
const CAR={
 tech:{loc:'tech',em:'💻',n:['Tech','Tech'],t:[['Intern','Intern'],['Junior Dev','Junior Dev'],['Senior Dev','Senior Dev'],['CTO','Oga CTO']],pay:[8000,18000,35000,70000],hrs:[8,18],tasks:[['Fix bug','Fix bug','🐛'],['Push code','Push code','🚀'],['Reply Slack','Answer Slack','💬'],['Write test','Write test','🧪'],['Deploy','Deploy am','☁️']]},
 bank:{loc:'bank',em:'🏦',n:['Banking','Banking'],t:[['Teller','Teller'],['Account Officer','Account Officer'],['Branch Manager','Branch Manager'],['MD','Oga MD']],pay:[10000,20000,40000,80000],hrs:[8,17],tasks:[['Count cash','Count money','💵'],['Open account','Open account','🧾'],['Stop fraud','Stop 419','🚨'],['Call customer','Call customer','📞'],['Approve loan','Approve loan','✅']]},
 trade:{loc:'market',em:'🛍️',n:['Trading','Trading'],t:[['Hawker','Hawker'],['Stall Owner','Shop Owner'],['Wholesaler','Wholesaler'],['Importer','Big Importer']],pay:[6000,15000,30000,65000],hrs:[7,19],tasks:[['Price goods','Price am','🏷️'],['Pack goods','Pack market','📦'],['Collect cash','Collect money','💰'],['Call buyers','Shout for customer','📣'],['Check stock','Check stock','📋']]},
 ent:{loc:'studio',em:'🎤',n:['Entertainment','Entertainment'],t:[['Hype Man','Hype Man'],['Skit Maker','Skit Maker'],['DJ','DJ'],['Superstar','Superstar']],pay:[7000,16000,40000,90000],hrs:[12,23],tasks:[['Drop beat','Drop beat','🎧'],['Shoot skit','Shoot skit','🎬'],['Hype crowd','Hype crowd','🙌'],['Post reel','Post reel','📱'],['Edit video','Edit video','✂️']]}};
const XPN=[0,10,25,50],RQN=[0,10,25,45];
const GOODS=[['pepper','🌶️',['Pepper basket','Basket of pepper'],3000],['phone','🔌',['Phone accessories','Phone accessories'],6000],['ankara','👗',['Ankara bundle','Ankara bundle'],9000],['rice','🍚',['Bag of rice','Bag of rice'],60000]];
const goodPrice=i=>Math.round(GOODS[i][3]*(0.75+0.5*hash(day()*7+i))/50)*50;
const FARE=[[0,1000,1800],[1000,0,800],[1800,800,0]];

// ---------- State ----------
function fresh(look,bg){return{v:3,deaths:0,tut:0,lang:(S&&S.lang)||'en',look,money:bg==='nepo'?500000:50000,debt:bg==='nepo'?0:100000,save:0,energy:90,hunger:80,peace:70,respect:bg==='nepo'?12:2,
 t:7*60,lh:7,p:{x:BY.room.door.x,y:BY.room.door.y+20,dir:0},home:0,homeless:false,rentDue:8,fuel:0,bo:0,boEnd:0,car:{tech:{lv:0,xp:0},bank:{lv:0,xp:0},trade:{lv:0,xp:0},ent:{lv:0,xp:0}},inv:[0,0,0,0],bg,shifts:0,log:[]}}
const day=()=>S?Math.floor(S.t/1440)+1:1;
const hour=()=>S?(S.t/60)%24:12;
function fix(){if(!S)return;['money','debt','save'].forEach(k=>{if(!okNum(S[k]))S[k]=0;S[k]=Math.round(cl(S[k],0,MAXM))});
 ['energy','hunger','peace','respect'].forEach(k=>{if(!okNum(S[k]))S[k]=50;S[k]=cl(S[k],0,100)});
 S.deaths=Math.max(0,S.deaths|0);S.tut=S.tut|0;S.fuel=cl(okNum(S.fuel)?S.fuel:0,0,20);S.home=cl(S.home|0,0,2);S.inv=(Array.isArray(S.inv)?S.inv:[]).slice(0,4).map(v=>cl(v|0,0,10));while(S.inv.length<4)S.inv.push(0);
 if(!okNum(S.t)||S.t<0)S.t=420;for(const k in CAR){const c=S.car[k]||(S.car[k]={lv:0,xp:0});c.lv=cl(c.lv|0,0,3);c.xp=cl(c.xp|0,0,999)}
 if(!okNum(S.p.x)||!okNum(S.p.y)||blocked(S.p.x,S.p.y)){S.p.x=BY.room.door.x;S.p.y=BY.room.door.y+20}}
// all money flows through these two
function pay(n){if(!okNum(n)||n<0||n>MAXM)return false;n=Math.round(n);if(S.money<n)return false;S.money-=n;fix();return true}
function earn(n){if(!okNum(n)||n<0)return;S.money=Math.min(MAXM,S.money+Math.round(Math.min(n,5e6)));fix()}
function stat(k,d){if(okNum(d))S[k]=cl(S[k]+d,0,100)}
function save(){if(S&&S.look)try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&s.v===3&&s.look&&s.p&&s.car){S=s;fix();return true}}catch(e){}
 try{const s=JSON.parse(localStorage.getItem('sapa_world_v2'));if(s&&s.v===2&&s.look&&s.p&&s.car){s.v=3;s.deaths=0;s.tut=0;S=s;fix();save();setTimeout(()=>toast(tr('Your v2 save was carried into 3D Lagos ✅','We carry your old save enter 3D Lagos ✅')),1500);return true}}catch(e){}return false}
// ---------- Geometry ----------
const inGap=x=>(x>1400&&x<1600)||(x>3000&&x<3200);
function water(x,y){return y>SEA||(inGap(x)&&!(y>RY&&y<RY+RH))}
function blocked(x,y){if(x<10||y<10||x>WW-10||y>WH-10||water(x,y))return true;for(const b of B)if(x>b.x-8&&x<b.x+b.w+8&&y>b.y-4&&y<b.y+b.h+6)return true;return false}
const vroad=d=>DIST[d].ox+640;
const distAt=x=>x<1500?0:x<3100?1:2;
// palms, lamps, npcs, danfos
const PALMS=[],LAMPS=[],NPC=[],BUS=[];
(function gen(){const r=rng(42);let k=0;while(PALMS.length<130&&k++<5000){const x=r()*WW,y=40+r()*(SEA-60);const vr=vroad(distAt(x));
 if(water(x,y)||blocked(x,y+4)||blocked(x,y-30)||(y>RY-30&&y<RY+RH+30)||(x>vr-30&&x<vr+110))continue;if(y>SHORE-20&&y<SHORE+4)continue;if(B.some(b=>x>b.x-40&&x<b.x+b.w+40&&y>b.y-20&&y<b.y+b.h+100))continue;if(ZEB.some(z=>Math.abs(z-x)<60))continue;PALMS.push({x,y,s:.8+r()*.5})}
 for(let x=60;x<WW;x+=180)if(!inGap(x)){LAMPS.push({x,y:RY-14});LAMPS.push({x:x+90,y:RY+RH+14})}
 const sk=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59'],oc=['#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#fb8c00','#00897b','#fff'];
 for(let i=0;i<34;i++){const d=i%3,ox=DIST[d].ox,v=r()<.5;let a,b;
  if(v){const x=vroad(d)+(r()<.5?-14:94);a={x,y:30+r()*400};b={x,y:a.y+300+r()*300}}else{const y=r()<.5?RY-12:RY+RH+12;a={x:ox+20+r()*500,y};b={x:a.x+300+r()*500,y}}
  b.y=Math.min(b.y,SHORE-10);NPC.push({x:a.x,y:a.y,a,b,to:1,sp:28+r()*30,look:{skin:sk[i%5],out:oc[(i*3)%8],hair:i%5,body:i%2},ph:r()*6})}
 const bc=['#ffd400','#ffd400','#ffd400','#ffca28'];
 for(let i=0;i<6;i++)BUS.push({h:true,lane:i%2,x:r()*WW,sp:(i%2?1:-1)*(110+r()*50),c:bc[i%4]});for(let i=0;i<4;i++)BUS.push({h:true,ok:1,lane:i%2,x:r()*WW,sp:(i%2?1:-1)*(150+r()*50)});
 for(let d=0;d<3;d++)for(let j=0;j<2;j++)BUS.push({h:false,lane:j,d,y:r()*SHORE,sp:(j?-1:1)*(90+r()*40),c:'#ffd400'})})();
function drawStatic(g){const r=rng(7);
 g.fillStyle='#e8d29a';g.fillRect(0,0,WW,WH);
 for(let i=0;i<500;i++){g.fillStyle=i%3?'#9ccc65':'#7cb342';g.beginPath();g.ellipse(r()*WW,r()*SHORE,20+r()*60,12+r()*30,0,0,7);g.fill()}
 g.fillStyle='#f6e3a8';g.fillRect(0,SHORE,WW,SEA-SHORE);g.fillStyle='#ffe9b0';g.fillRect(3200,SHORE-120,1400,120);
 const wg=g.createLinearGradient(0,SEA,0,WH);wg.addColorStop(0,'#26c6da');wg.addColorStop(1,'#00838f');g.fillStyle=wg;g.fillRect(0,SEA,WW,WH-SEA);
 g.fillStyle='#29b6f6';g.fillRect(1400,0,200,SEA);g.fillRect(3000,0,200,SEA);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,SEA,WW,4);
 // roads
 g.fillStyle='#bdbdbd';g.fillRect(0,RY-24,WW,RH+48);g.fillStyle='#424242';g.fillRect(0,RY,WW,RH);
 g.fillStyle='#8d6e63';[1400,3000].forEach(x=>{g.fillRect(x,RY-24,200,6);g.fillRect(x,RY+RH+18,200,6)});
 for(let d=0;d<3;d++){const x=vroad(d);g.fillStyle='#bdbdbd';g.fillRect(x-24,0,128,SHORE);g.fillStyle='#424242';g.fillRect(x,0,80,SHORE)}
 g.fillStyle='#ffd400';for(let x=0;x<WW;x+=48)g.fillRect(x,RY+RH/2-2,26,4);
 for(let d=0;d<3;d++){const x=vroad(d);for(let y=0;y<SHORE;y+=48)if(y<RY||y>RY+RH)g.fillRect(x+38,y,4,26);
  g.fillStyle='#fff';g.fillStyle='#ffd400'}
 // zebra crossings
 g.fillStyle='#fafafa';for(const zx of ZEB)for(let i=0;i<7;i++)g.fillRect(zx-30,RY+4+i*13.5,60,8);
 for(let d=0;d<3;d++){const x=vroad(d);for(const zy of [RY-120,RY+RH+120])for(let i=0;i<6;i++)g.fillRect(x+4+i*13,zy-25,8,50)}
 // lots
 g.fillStyle='#9e9e9e';['park0','park1','park2','fuel','hospital'].forEach(id=>{const b=BY[id];g.fillRect(b.x-20,b.y+b.h,b.w+40,60)});
 g.fillStyle='#d7ccc8';const m=BY.market;g.fillRect(m.x-10,m.y+m.h,m.w+20,40);
 g.font='900 40px system-ui';g.fillStyle='rgba(0,0,0,.12)';g.textAlign='center';DIST.forEach(d=>g.fillText(d.n[0].toUpperCase(),d.ox+700,RY+RH+80));
 g.font='900 26px system-ui';g.fillStyle='rgba(255,255,255,.5)';g.fillText('LAGOS LAGOON',2300,1320);}
function drawAvatar(g,x,y,lk,dir,ph,sc=1){g.save();g.translate(x,y);g.scale(sc,sc);const bw=lk.body?19:15,sw=Math.sin(ph)*3;
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,0,11,4,0,0,7);g.fill();
 g.fillStyle='#263238';g.fillRect(-6,-12+sw*.3,5,12-sw*.3);g.fillRect(1,-12-sw*.3,5,12+sw*.3);
 g.fillStyle=lk.out;rr(g,-bw/2,-30,bw,19,5);g.fillStyle=lk.skin;g.fillRect(-bw/2-4,-28+sw,4,12);g.fillRect(bw/2,-28-sw,4,12);
 g.fillStyle=lk.skin;g.beginPath();g.arc(0,-39,9,0,7);g.fill();
 const hc='#1b1b1b';g.fillStyle=hc;
 if(lk.hair===1){g.beginPath();g.arc(0,-43,11,Math.PI*.9,Math.PI*2.1);g.fill()}
 else if(lk.hair===0){g.beginPath();g.arc(0,-40,9.3,Math.PI*1.05,Math.PI*1.95);g.fill()}
 else if(lk.hair===2){g.beginPath();g.arc(0,-41,9.5,Math.PI,0);g.fill();for(let i=-8;i<=8;i+=4)g.fillRect(i-1,-41,2,13)}
 else if(lk.hair===3){g.fillStyle=lk.out;g.beginPath();g.arc(0,-41,9.5,Math.PI,0);g.fill();g.fillRect(dir===2?-14:-3,-42,dir===1?14:dir===2?12:10,3)}
 else {g.fillStyle=lk.out;g.beginPath();g.ellipse(0,-46,12,7,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-10,-47,20,2)}
 if(dir!==3){g.fillStyle='#111';const o=dir===1?3:dir===2?-3:0;g.fillRect(-4+o,-39,2,3);g.fillRect(2+o,-39,2,3)}
 g.restore()}
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h);g.fill()}
function nightF(){const h=hour();if(h>=19||h<5)return 1;if(h>=17)return (h-17)/2;if(h<7)return 1-(h-5)/2;return 0}
['fuel','club','hospital'].forEach(id=>BY[id].gen=1);
const GEN=['fuel','club','hospital'].map(id=>({x:BY[id].door.x,y:BY[id].door.y}));
function busPos(b){if(b.h)return[b.x,RY+(b.lane?RH*.73:RH*.27)];return[vroad(b.d)+(b.lane?60:20),b.y]}
const genOn=()=>S&&S.genT>S.t;

// ---------- Audio (audio.js) ----------
const AU=makeAudio(SET);
const _unl=()=>{AU.init();sndBan()};['pointerdown','pointerup','touchend','click','keydown'].forEach(e=>addEventListener(e,_unl,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AU.ctx&&AU.ctx.state!=='running')try{AU.ctx.resume()}catch(e){}});
function sndBan(){const b=document.getElementById('sndBan');if(!b)return;const ok=AU.ctx&&AU.ctx.state==='running';b.classList.toggle('hide',!!ok||!SET.snd)}
setInterval(sndBan,1000);

// ---------- Speech bubbles ----------
const BUB=[];
function say(txt,x,y,z,dur=3){if(BUB.length>5){BUB[0].el.remove();BUB.shift()}const el=document.createElement('div');el.className='bub';el.textContent=txt;$('#bubs').appendChild(el);BUB.push({el,x,y,z,t:dur})}
function bubTick(dt){for(let i=BUB.length-1;i>=0;i--){const b=BUB[i];b.t-=dt;const s=R.screen(b.x,b.y,b.z);if(b.t<=0){b.el.remove();BUB.splice(i,1);continue}b.el.style.display=s.vis?'block':'none';b.el.style.transform=`translate(${s.x}px,${s.y}px) translate(-50%,-100%)`;b.el.style.opacity=Math.min(1,b.t*2)}}
const CHAT=[['How far, my guy?','How far, my guy?'],['Sapa will not catch me this year!','Sapa no go catch me this year!'],['NEPA took the light again o','NEPA don take light again o'],['Excuse me, I am rushing!','Abeg shift, I dey rush!'],['This traffic is something else','This traffic na wa o'],['Who has a charger?','Who get charger?'],['Cold pure water! ₦50!','Pure water! Cold one! ₦50!'],['God is running Lagos','Na God dey run Lagos'],['Watch out for danfo o!','Shine your eye for danfo o!'],['Japa or stay? Hmm.','Japa or stay? Hmm.']];
const COND=[['Oshodi! Oshodi! Enter with your change!','Oshodi! Oshodi! Enter with your change!'],['CMS! Obalende! One more chance!','CMS! Obalende! One chance remain!'],['Lekki! Ajah! Move, move!','Lekki! Ajah! Wole, wole!']];

// ---------- Input ----------
const keys={};let joy=null,near=null,nearAct=null;const ptrs=new Map();let pinch=0;
const touchy=('ontouchstart' in window)||matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;if((k==='e'||k===' '||k==='enter')&&uiFree()&&(near||nearAct)){e.preventDefault();interact()}if(k==='p'&&uiFree())openPhone();if(k==='escape'){closeModal();closePhone()}
 if(k==='q')R.cam.yaw+=.3;if(k==='r')R.cam.yaw-=.3});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
const jEl=$('#joy'),jK=jEl.firstElementChild;
cv.addEventListener('pointerdown',e=>{if(!uiFree())return;try{cv.setPointerCapture(e.pointerId)}catch(_){}
 if((e.pointerType==='touch'||touchy)&&e.clientX<innerWidth*.5&&!joy){joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};jEl.style.display='block';jEl.style.left=e.clientX-60+'px';jEl.style.top=e.clientY-60+'px';jK.style.transform=''}
 else{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}}});
cv.addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){let dx=e.clientX-joy.x,dy=e.clientY-joy.y;const m=Math.hypot(dx,dy),mx=45;if(m>mx){dx*=mx/m;dy*=mx/m}joy.dx=dx/mx;joy.dy=dy/mx;jK.style.transform=`translate(${dx}px,${dy}px)`;return}
 const p=ptrs.get(e.pointerId);if(!p)return;if(ptrs.size===1){R.cam.yaw-=(e.clientX-p.x)*.008;R.cam.pitch=cl(R.cam.pitch+(e.clientY-p.y)*.005,.1,1.3)}
 p.x=e.clientX;p.y=e.clientY;if(ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)R.cam.dist=cl(R.cam.dist*pinch/d,4,24);pinch=d}});
const pEnd=e=>{if(joy&&e.pointerId===joy.id){joy=null;jEl.style.display='none'}ptrs.delete(e.pointerId);pinch=0};cv.addEventListener('pointerup',pEnd);cv.addEventListener('pointercancel',pEnd);
cv.addEventListener('wheel',e=>{e.preventDefault();R.cam.dist=cl(R.cam.dist*(1+e.deltaY*.001),4,24)},{passive:false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
const vis=id=>!$(id).classList.contains('hide');
const uiFree=()=>S&&S.look&&!vis('#modal')&&!vis('#phone')&&!vis('#creator')&&!vis('#title')&&!DEAD&&!fading&&!vis('#death')&&!STORY.dlgOpen();

// ---------- Update ----------
let evT=45,lastDist=-1,saveT=0,tm=0,IN=null,DEAD=null,fading=false,chatT=3,condT=2;const PR={ry:0,ph:0,moving:false};
function worldTick(dt){
 for(const n of NPC){const t=n.to?n.b:n.a,dx=t.x-n.x,dy=t.y-n.y,m=Math.hypot(dx,dy);if(m<2)n.to^=1;else{n.x+=dx/m*n.sp*dt;n.y+=dy/m*n.sp*dt;n.ph+=dt*8;n.ry=Math.atan2(dx,dy)}}
 const live=S&&S.look&&!IN&&!DEAD&&!vis('#title');
 for(const v of BUS){if(v.base==null){v.base=v.sp;v.cur=Math.abs(v.sp)}const [x,y]=busPos(v),dir=Math.sign(v.base);let tgt=Math.abs(v.base);
  if(live){const p=S.p,along=(v.h?p.x-x:p.y-y)*dir,perp=Math.abs(v.h?p.y-y:p.x-x);
   if(along>0&&along<190&&perp<34){const onZ=v.h?ZEB.some(z=>Math.abs(p.x-z)<34):(Math.abs(p.y-(RY-120))<28||Math.abs(p.y-(RY+RH+120))<28);tgt*=onZ?0:(v.ok?.75:.5);
    if((v.hc||0)<=0){v.hc=3.2;AU.horn(1,[x*K,1.2,y*K]);say(v.ok?tr('Pim pim! Clear the road!','Pim pim! Comot for road!'):tr('PAAAP! Are you mad? Move!','PAAAP! You dey craze? Shift!'),x*K,2.8,y*K,1.8)}}
   const hl=v.ok?20:44,hw=v.ok?9:20,da=v.h?p.x-x:p.y-y,dp=v.h?p.y-y:p.x-x;
   if(Math.abs(da)<hl+6&&Math.abs(dp)<hw+6){if(v.cur>45){die(v);}else{const s=Math.sign(dp)||1;if(v.h)p.y=y+s*(hw+7);else p.x=x+s*(hw+7)}}}
  for(const o of BUS){if(o===v||o.h!==v.h||o.lane!==v.lane||(!v.h&&o.d!==v.d)||Math.sign(o.base)!==dir)continue;const [ox,oy]=busPos(o),ah=(v.h?ox-x:oy-y)*dir;if(ah>0&&ah<130){tgt=Math.min(tgt,ah<75?0:o.cur)}}
  v.hc=(v.hc||0)-dt;v.cur+=(tgt-v.cur)*Math.min(1,dt*(tgt<v.cur?3:1.2));v.sp=dir*v.cur;
  if(v.h){v.x+=v.sp*dt;if(v.x>WW+60)v.x=-60;if(v.x<-60)v.x=WW+60}else{v.y+=v.sp*dt;if(v.y>SHORE)v.y=-40;if(v.y<-40)v.y=SHORE}}}
function lerpA(a,b,t){let d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*Math.min(1,t)}
function update(dt){
 if(DEAD){DEAD.t+=dt;if(DEAD.t>1.4&&!DEAD.shown){DEAD.shown=1;showDeath()}return}
 if(!uiFree())return;
 S.t+=dt*1.5;hourTicks();
 let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(joy&&Math.hypot(joy.dx,joy.dy)>.15){mx=joy.dx;my=joy.dy}
 const gp=navigator.getGamepads&&[...navigator.getGamepads()].find(Boolean);if(gp){const a=gp.axes;if(Math.hypot(a[0],a[1])>.2){mx=a[0];my=a[1]}if(Math.abs(a[2])>.2)R.cam.yaw-=a[2]*dt*2.5;if(Math.abs(a[3])>.2)R.cam.pitch=cl(R.cam.pitch+a[3]*dt*1.5,.1,1.3);if(gp.buttons[0]&&gp.buttons[0].pressed&&!gp._a&&(near||nearAct))interact();gp._a=gp.buttons[0]&&gp.buttons[0].pressed}
 const m=Math.hypot(mx,my);PR.moving=false;
 if(m>.1){if(m>1){mx/=m;my/=m}const yaw=R.cam.yaw,fx=mx*Math.cos(yaw)+my*Math.sin(yaw),fz=-mx*Math.sin(yaw)+my*Math.cos(yaw);PR.ry=lerpA(PR.ry,Math.atan2(fx,fz),dt*12);PR.moving=true;const _st=Math.floor(PR.ph/Math.PI);PR.ph+=dt*11;if(Math.floor(PR.ph/Math.PI)!==_st)AU.step();
  if(IN){const sp=(S.energy<10?2.4:3.6)*dt,p=IN.p,sw=IN.sp.w/2-.35,sd=IN.sp.d/2-.35;const bl=(x,z)=>Math.abs(x)>sw||Math.abs(z)>sd||IN.cols.some(c=>Math.abs(x-c.x)<c.hw&&Math.abs(z-c.z)<c.hd);
   const nx=p.x+fx*sp,nz=p.z+fz*sp;if(!bl(nx,p.z))p.x=nx;if(!bl(p.x,nz))p.z=nz}
  else{const sp=(S.energy<10?70:115)*dt,p=S.p;const nx=p.x+fx*sp,ny=p.y+fz*sp;if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny;S.walked=(S.walked||0)+sp;
   evT-=dt;if(evT<=0){evT=60+Math.random()*60;if(Math.random()<.5){streetEvent();return}}}}
 near=null;nearAct=null;
 if(IN){let bd=9;for(const a of IN.acts){const d=Math.hypot(a.x-IN.p.x,a.z-IN.p.z);if(d<a.r&&d/a.r<bd){bd=d/a.r;nearAct=a}}
  chatT-=dt;if(chatT<=0&&IN.sp.npcs.length){chatT=5+Math.random()*4;const n=IN.sp.npcs[Math.floor(Math.random()*IN.sp.npcs.length)];if(n.say)say(L(n.say),n.x,2.3,n.z,3)}}
 else{let bd=52;for(const b of B){const d=Math.hypot(b.door.x-S.p.x,b.door.y-S.p.y);if(d<bd){bd=d;near=b}}
  const di=distAt(S.p.x);if(di!==lastDist){if(lastDist>=0)toast('📍 '+L(DIST[di].n));lastDist=di}
  chatT-=dt;if(chatT<=0){chatT=3.5+Math.random()*3;let bn=null,bdd=420;NPC.forEach((n,i)=>{if(i>=R.npcMax)return;const d=Math.hypot(n.x-S.p.x,n.y-S.p.y);if(d<bdd&&Math.random()<.6){bdd=d;bn=n}});if(bn)say(L(CHAT[Math.floor(Math.random()*CHAT.length)]),bn.x*K,2.3,bn.y*K,3)}
  condT-=dt;if(condT<=0){condT=4.5;for(let i=0;i<3;i++){const d=BY['park'+i].door;if(Math.hypot(d.x-S.p.x,d.y-S.p.y)<500){say(L(COND[i]),d.x*K-2,2.6,(d.y+40)*K,3);AU.shout([d.x*K-2,1.6,(d.y+40)*K])}}}}
 if(S.energy<=0)faint();
 saveT+=dt;if(saveT>8){saveT=0;save()}}

// ---------- Death & hospital ----------
function die(v){if(DEAD)return;const dx=v.h?Math.sign(v.sp):0,dz=v.h?0:Math.sign(v.sp);DEAD={t:0,dx,dz,by:v.ok?'okada':'danfo'};AU.crash();closeModal();closePhone();joy=null;jEl.style.display='none';$('#act').classList.add('hide');PR.moving=false}
const bill=()=>Math.min(60000,25000+5000*(S.deaths|0));
function showDeath(){const by=DEAD.by==='okada'?tr('an okada','okada'):tr('a danfo','danfo');const d=$('#death');d.classList.remove('hide');
 d.innerHTML=`<div class="dcard"><div class="em">💥🚌</div><h1>${tr('You don get jam!','You don get jam!')}</h1><p>${tr(`You were hit by ${by}.`,`${by==='okada'?'Okada':'Danfo'} don jam you.`)}</p>
 <p class="sm">${tr('Times hit so far','How many times you don jam')}: <b>${(S.deaths|0)+1}</b></p>
 <button id="respawn">🏥 ${tr('Wake up at General Hospital','Wake up for General Hospital')}<small>${tr('Bill','Bill')} ${N(bill())} · ${tr('unpaid part goes to debt','wetin remain go enter debt')} · ⚡60</small></button>
 <button id="gover" class="alt">💀 ${tr('Game over — start a new life','Game over — start new life')}</button></div>`;
 $('#respawn').onclick=respawn;$('#gover').onclick=gameOver}
function respawn(){const b=bill(),paid=Math.min(S.money,b);pay(paid);S.debt=Math.min(5e6,S.debt+(b-paid));S.deaths=(S.deaths|0)+1;S.energy=60;stat('peace',-12);adv(6*60);
 const d=BY.hospital.door;S.p.x=d.x;S.p.y=d.y+16;DEAD=null;$('#death').classList.add('hide');fix();save();hud();toast(tr(`🏥 Doctors patched you up. Bill: ${N(b)}${b>paid?' (part added to debt)':''}`,`🏥 Doctor don patch you. Bill: ${N(b)}${b>paid?' (the rest enter debt)':''}`));AU.door()}
function gameOver(){const d=$('#death');d.innerHTML=`<div class="dcard"><div class="em">🪦</div><h1>${tr('Game over','Game don end')}</h1><p>${S.look.name} · ${tr('Day','Day')} ${day()} · ${N(S.money+S.save-S.debt)} ${tr('net worth','net worth')}</p><button id="again">🔁 ${tr('New character','New person')}</button></div>`;
 $('#again').onclick=()=>{localStorage.removeItem(SAVE);const lang=S.lang;S={lang};DEAD=null;d.classList.add('hide');creator()}}
function hospitalP(b){panel(()=>({em:'🏥',title:L(b.lab),text:tr(`Nurse: "Welcome. You have been brought in ${S.deaths|0} time(s)."`,`Nurse: "You don come here ${S.deaths|0} time(s) o. Shine your eye for road!"`),acts:[
 {l:tr('🩺 Check-up ','🩺 Check-up ')+N(3000),s:'+☮️8 +⚡8',dis:S.money<3000,f:()=>{if(pay(3000)){stat('peace',8);stat('energy',8);adv(30)}}},
 {l:tr('🛏️ Rest in the ward (4h) ','🛏️ Rest for ward (4h) ')+N(5000),s:'+⚡40',dis:S.money<5000,f:()=>{if(pay(5000)){stat('energy',40);adv(240)}}}]}))}

// ---------- Interiors ----------
const NL=(skin,out,hair,body=0)=>({skin,out,hair,body});
function fade(cb){fading=true;const f=$('#fade');f.classList.add('on');setTimeout(()=>{try{cb()}finally{setTimeout(()=>{f.classList.remove('on');fading=false},80)}},360)}
function interact(){AU.click();if(IN){if(nearAct)nearAct.act.f();fix();save();hud();return}if(!near)return;const b=near;
 if(b.kind==='park'||b.kind==='beach')return placePanel(b);
 if(b.kind==='club'){const hr=hour();if(!(hr>=21||hr<4)){toast(tr('🚫 Bouncer: "Club opens 9pm. Come back later!"','🚫 Bouncer: "Club never open. Come back 9pm!"'));say(tr('We open 9pm!','We dey open 9pm!'),b.door.x*K,2.6,b.door.y*K,2.5);return}}
 enterBuilding(b)}
function enterBuilding(b){AU.door();fade(()=>{const sp=interiorSpec(b);sp.bo=S.bo&&!b.gen&&!genOn();const r=R.enterInterior(sp);IN={b,sp,cols:r.cols,acts:r.acts,p:{x:0,z:sp.d/2-1.3}};PR.ry=Math.PI;R.cam.yaw=0;R.cam.pitch=Math.max(R.cam.pitch,.6);
  R.setInteriorPower(sp.bo,genOn());chatT=1;hud();toast('🚪 '+L(b.lab).split(' (')[0]);STORY.ev('enter',b)})}
function leaveInterior(now){if(!IN)return;const go=()=>{if(!IN)return;R.exitInterior();const d=IN.b.door;S.p.x=d.x;S.p.y=d.y+14;IN=null;PR.ry=0;nearAct=null;hud()};if(now)go();else{AU.door();fade(go)}}
function doSleep(){fade(()=>{sleep();fix();save();hud()})}
const watchTV={l:tr('📺 Watch TV (30 min)','📺 Watch TV small'),f:()=>{if(S.bo&&!genOn())return toast(tr('No light, no TV. NEPA!','No light, no TV. NEPA o!'));stat('peace',4);adv(30);toast('📺 '+tr('Nollywood marathon','Nollywood film')+' +☮️4')}};
const genAct={l:tr('🔌 Start generator (1L fuel)','🔌 On gen (1L fuel)'),f:()=>{if(!S.bo)return toast(tr('There is light. No need for gen.','Light dey. No need gen.'));if(S.fuel<1)return toast(tr('No fuel! Buy at the fuel station.','No fuel! Go buy for fuel station.'));S.fuel--;S.genT=S.t+120;stat('peace',6);R.setInteriorPower(false,true);AU.noise(1.2,.25,250);toast(tr('🔌 Gen is roaring! Light for 2 hours.','🔌 Gen don start! Light for 2 hours.'))}};
function interiorSpec(b){const k=b.kind,title=L(b.lab).split(' (')[0],exit={t:'exit',act:{l:tr('🚪 Exit to street','🚪 Comot go outside'),f:()=>leaveInterior()}},M=NL;let sp;
 const shop=f=>({l:f[0],f:f[1]});
 if(k==='home'){const mine=!S.homeless&&HOMES[S.home].b===b.id,tier=b.id==='flat'?2:(mine&&S.home===1?1:0);
  const bedAct={l:mine?tr('😴 Sleep','😴 Sleep'):tr('🔑 Talk to the agent about this place','🔑 Talk to agent'),f:()=>mine?doSleep():homeP(b)};
  const rent={l:tr('🏠 Rent & house matters','🏠 House rent matter'),f:()=>homeP(b)};
  if(tier===0)sp={w:5.6,d:5.6,items:[{t:'bed',x:-1.6,z:-1.4,act:bedAct},{t:'fan',x:2.3,z:-2.3},{t:'tv',x:1.1,z:-2.4,act:watchTV},{t:'gen',x:2.2,z:1.1,act:genAct},{t:'table',x:-1.7,z:1.2,act:rent},{t:'lantern',x:-1.9,z:1.2}],npcs:[]};
  else if(tier===1)sp={w:7.2,d:6.6,items:[{t:'rug',x:.6,z:-.4},{t:'bed',x:-2.3,z:-1.9,act:bedAct},{t:'wardrobe',x:-.3,z:-2.95},{t:'tv',x:1.8,z:-3,act:watchTV},{t:'fan',x:3.1,z:-2.8},{t:'table',x:2.4,z:.7,act:rent},{t:'gen',x:3.1,z:2.4,act:genAct},{t:'plant',x:-3.1,z:2.6}],npcs:[]};
  else sp={w:10,d:9,items:[{t:'rug',x:2.5,z:-2.6},{t:'bed',x:-3.5,z:-3,act:bedAct},{t:'wardrobe',x:-1.4,z:-4.1},{t:'tv',x:2.5,z:-4.15,act:watchTV},{t:'sofa',x:2.5,z:-1.6,ry:Math.PI},{t:'plant',x:4.5,z:-4},{t:'fridge',x:4.5,z:2.6,act:{l:tr('🥤 Cold drink from fridge','🥤 Cold drink'),f:()=>{stat('energy',3);stat('peace',2);adv(10);toast('🥤 Ahh!')}}},{t:'table',x:-3,z:1.6,act:rent},{t:'ac',x:0,z:-4.35},{t:'gen',x:-4.3,z:3.6,act:genAct},{t:'plant',x:-4.5,z:-.5}],npcs:mine?[]:[{x:-2,z:1.6,ry:0,look:M('#7a4b2e','#212121',3,1),say:['This one na premium, sir.','This one na premium o.']}]};
  Object.assign(sp,{tier,wall:tier===2?'#eceff1':tier===1?'#b3d4c6':'#c9a77c',floor:tier===2?'#d7ccc8':tier===1?'#90a4ae':'#8d6e63',fpat:tier===2?'wood':tier===1?'tile':'',lampI:tier===0?14:24});}
 else if(k==='buka'){const b2=b.id==='buka2';sp={w:9,d:7.5,wall:b2?'#ffe0b2':'#f4e1b0',floor:'#a1887f',items:[{t:'counter',x:0,z:-2.3,w:4,c:b2?'#e65100':'#2e7d32',act:{l:tr('🍲 Order food','🍲 Order food'),f:()=>bukaP(b)},r:2.6},{t:'pot',x:-1.3,z:-3.2},{t:'pot',x:0,z:-3.2},{t:'pot',x:1.3,z:-3.2},{t:'btable',x:-2.5,z:.5},{t:'btable',x:2.5,z:.5},{t:'bench',x:-2.5,z:1.35},{t:'bench',x:2.5,z:1.35},{t:'bench',x:-2.5,z:-.35},{t:'bench',x:2.5,z:-.35}],
  npcs:[{x:0,z:-2.95,look:M('#5a3825',b2?'#e65100':'#8e24aa',4,1),say:b2?['Fresh suya! Extra pepper?','Suya dey! You want extra pepper?']:['Come and chop! Amala is hot!','Come chop! Amala dey hot!']},{x:-3.7,z:.5,ry:Math.PI/2,look:M('#3b2219','#1e88e5',0)},{x:3.7,z:.6,ry:-Math.PI/2,look:M('#a0673f','#fdd835',2)}]}}
 else if(k==='tech'){const it=[];[-3.6,0,3.6].forEach(x=>[-2.4,.8].forEach(z=>it.push({t:'desk',x,z,act:{l:tr('💻 Work at desk','💻 Work for desk'),f:()=>workP(b)}})));it.push({t:'coffee',x:5.3,z:-3.9,act:{l:tr('☕ Free coffee','☕ Free coffee'),f:()=>{stat('energy',5);stat('peace',2);adv(30);toast('☕ +⚡5')}}},{t:'plant',x:-5.4,z:-3.9},{t:'plant',x:-5.4,z:2.8});
  sp={w:12,d:9,wall:'#e3f2fd',floor:'#cfd8dc',fpat:'tile',items:it,npcs:[{x:-3.6,z:-1.6,ry:Math.PI,look:M('#7a4b2e','#212121',1)},{x:3.6,z:1.6,ry:Math.PI,look:M('#c68b59','#1e88e5',0,1)},{x:0,z:-1.6,ry:Math.PI,look:M('#3b2219','#43a047',2),say:['Who pushed to main on Friday?!','Who push to main on Friday?!']},{x:4.6,z:-3.4,look:M('#5a3825','#fb8c00',3),say:['Standup in 5 minutes!','Standup in 5 minutes o!']}]}}
 else if(k==='bank')sp={w:12,d:9,wall:'#eceff1',floor:'#b0bec5',fpat:'tile',items:[{t:'teller',x:0,z:-2.6,act:{l:tr('🏦 Talk to teller','🏦 Meet teller'),f:()=>bankP(b)},r:2.8},{t:'atm',x:5,z:-3.9,act:{l:tr('🏧 ATM: withdraw ₦10,000','🏧 ATM: collect ₦10,000'),f:()=>{if(S.save<=0)return toast(tr('ATM: Insufficient funds in savings.','ATM: Your savings don dry.'));const w=Math.min(10000,S.save);S.save-=w;earn(w);AU.coin();toast('🏧 +'+N(w))}}},{t:'plant',x:-5.4,z:-3.9},{t:'bench',x:-3,z:1.6},{t:'bench',x:3,z:1.6}],
  npcs:[{x:-1,z:-3.3,look:M('#5a3825','#0d47a1',0,1),say:['Next customer, please!','Next customer abeg!']},{x:1,z:-3.3,look:M('#a0673f','#0d47a1',4)},{x:0,z:-1.3,ry:Math.PI,look:M('#3b2219','#fdd835',1)},{x:4.8,z:3,look:M('#7a4b2e','#212121',3,1),say:['Security: no phone calls inside!','Security: no phone call for inside!']}]};
 else if(k==='market'){const it=[],np=[],cols=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00','#8e24aa'];let i=0;for(const z of [-3,.6])for(const x of [-4,0,4]){it.push({t:'stall',x,z,c:cols[i],act:{l:tr('🛍️ Trade at stall','🛍️ Buy & sell'),f:()=>marketP(b)}});np.push({x,z:z-.9,look:M(['#3b2219','#7a4b2e','#5a3825'][i%3],cols[(i+2)%6],[4,0,2,3,4,1][i],i%2),say:i%2?['Customer! Come and price!','Customer! Come price am!']:['Fine pepper! Cheap cheap!','Fine pepper! E cheap!']});i++}
  sp={w:13,d:10,wall:'#d7ccc8',floor:'#bcaaa4',items:it,npcs:np}}
 else if(k==='club'){const dancers=[];for(let i=0;i<7;i++)dancers.push({x:-3+(i%4)*2+(i>3?1:0),z:-1.5+Math.floor(i/4)*2.4,look:NL(['#3b2219','#7a4b2e','#c68b59','#5a3825'][i%4],['#e040fb','#00e5ff','#fdd835','#e53935','#fff'][i%5],i%5,i%2),dance:1,say:i===2?['Gbese! Gbese!','Gbese! Gbese!']:i===5?['DJ, play Burna!','DJ, play Burna!']:null});
  sp={w:12,d:11,wall:'#1a0033',floor:'#111',lampI:4,lampC:'#b388ff',powered:1,items:[{t:'dj',x:0,z:-4.6,act:{l:tr('🎧 Dance by the DJ','🎧 Dance near DJ'),f:clubDance},r:3},{t:'bar',x:-5.2,z:.5,ry:Math.PI/2,act:{l:tr('🍾 Bar: entry & VIP','🍾 Bar: gate & VIP'),f:()=>clubP(b)},r:2.4},{t:'speaker',x:-5.3,z:-4.9},{t:'speaker',x:5.3,z:-4.9},{t:'speaker',x:5.3,z:3}],
  npcs:dancers.concat([{x:0,z:-5.2,look:NL('#3b2219','#212121',3,1),say:['Make some noise!!!','Make una shout!!!']}])}}
 else if(k==='worship')sp={w:11,d:10,wall:'#fafafa',floor:'#d7ccc8',fpat:'wood',items:[{t:'altar',x:2.6,z:-3.9,act:{l:tr('⛪ Pray / give at the altar','⛪ Pray / drop offering'),f:()=>worshipP(b)}},{t:'mihrab',x:-2.8,z:-4.85,act:{l:tr('🕌 Pray / reflect','🕌 Pray small'),f:()=>worshipP(b)},r:2.2},{t:'pew',x:2.6,z:-1.4},{t:'pew',x:2.6,z:.4},{t:'pew',x:2.6,z:2.2}],npcs:[{x:2.6,z:-4.6,look:NL('#5a3825','#fafafa',0,1),say:['God will provide, my child.','God go provide, my pikin.']},{x:-2.8,z:-4.2,ry:Math.PI,look:NL('#7a4b2e','#fafafa',3)}]};
 else if(k==='fuel')sp={w:8,d:7,wall:'#e8f5e9',floor:'#cfd8dc',fpat:'tile',powered:1,items:[{t:'counter',x:0,z:-1.9,w:3,c:'#0b7a3e',act:{l:tr('⛽ Buy fuel for your gen','⛽ Buy fuel for gen'),f:()=>fuelP(b)},r:2.3},{t:'shelf',x:-2.5,z:-3.2},{t:'shelf',x:2.5,z:-3.2},{t:'fridge',x:3.5,z:.6}],npcs:[{x:0,z:-2.6,look:NL('#3b2219','#0b7a3e',3,1),say:['Fuel dey! No queue today.','Fuel dey! No queue today.']}]};
 else if(k==='studio')sp={w:10,d:8,wall:'#2b2b2b',floor:'#37474f',lampC:'#ff80ab',items:[{t:'console',x:0,z:-2.6,act:{l:tr('🎚️ Work a session','🎚️ Do session'),f:()=>workP(b)}},{t:'mic',x:-2.7,z:-.6,act:{l:tr('🎤 Hype on the mic (work)','🎤 Hype for mic (work)'),f:()=>workP(b)}},{t:'speaker',x:-4.4,z:-3.4},{t:'speaker',x:4.4,z:-3.4},{t:'sofa',x:2.5,z:2.6,ry:Math.PI}],npcs:[{x:0,z:-3.4,look:NL('#5a3825','#ff4081',1),say:['Run am back one more time!','Run am back one more time!']}]};
 else if(k==='hospital')sp={w:12,d:9,wall:'#e0f7fa',floor:'#eceff1',fpat:'tile',powered:1,items:[{t:'counter',x:0,z:-2.4,w:3.4,c:'#fafafa',act:{l:tr('🏥 Reception','🏥 Reception'),f:()=>hospitalP(b)},r:2.6},{t:'hbed',x:-4.8,z:-2.6,act:{l:tr('🛏️ Rest in ward','🛏️ Rest for ward'),f:()=>hospitalP(b)}},{t:'hbed',x:-4.8,z:.6},{t:'hbed',x:4.8,z:-2.6},{t:'hbed',x:4.8,z:.6},{t:'plant',x:-5.4,z:3.6}],npcs:[{x:0,z:-3.1,look:NL('#7a4b2e','#ffffff',4),say:['Shine your eye for road o!','Shine your eye for road o!']},{x:4.8,z:.6,look:NL('#3b2219','#90caf9',0),say:['Okada jam me for Lekki...','Okada jam me for Lekki...']}]};
 sp.kind=k;sp.title=title;STORY.extra(b,sp);sp.items.push(Object.assign(exit,{x:0,z:sp.d/2-.4,r:1.4}));sp.wall=sp.wall||'#eee';sp.floor=sp.floor||'#999';if(sp.tier==null)sp.tier=1;return sp}
function clubDance(){if(!(S.clubT>S.t))return toast(tr('Pay entry at the bar first.','Pay gate fee for bar first.'));if((S.dances|0)>=3&&S.danceT===S.clubT)return toast(tr('Your legs are done for tonight!','Your leg don tire for tonight!'));if(S.energy<8)return toast(tr('Too tired to dance.','You don tire to dance.'));
 if(S.danceT!==S.clubT){S.danceT=S.clubT;S.dances=0}S.dances++;stat('respect',3);stat('peace',3);stat('energy',-8);adv(20);say(tr(`DJ: Make some noise for ${S.look.name}!`,`DJ: Shout for ${S.look.name}!`),0,2.6,-4.6,3);toast('💃 +⭐3 +☮️3')}

// ---------- Tutorial ----------
const TIPS=[()=>touchy?tr('👈 Drag the LEFT side to walk. 👉 Drag the RIGHT side to turn the camera. Pinch to zoom.','👈 Drag LEFT side to waka. 👉 Drag RIGHT side to turn camera. Pinch to zoom.'):tr('WASD / arrows to walk. Drag the mouse to turn the camera, scroll to zoom. Q/R also rotate.','WASD / arrow to waka. Drag mouse turn camera, scroll to zoom.'),
 ()=>tr('Walk to a door with the yellow arrow and press the button (or E) to go inside.','Waka reach door wey get yellow arrow, press button (or E) enter inside.'),
 ()=>tr('🚌 Danfos and okadas WILL hit you. Cross at the white zebra crossings — drivers stop there.','🚌 Danfo and okada go jam you o! Cross for zebra — dem go stop.'),
 ()=>tr('📱 Your phone has stats, bank, settings and the Sapa Challenge. Pay rent at your room!','📱 Your phone get stats, bank, settings and Sapa Challenge. Pay rent for your room!')];
let tipTm=null;function nextTip(d=1500){clearTimeout(tipTm);if(!S||S.tut>=TIPS.length)return;tipTm=setTimeout(()=>{if(!S||!TIPS[S.tut])return;if(!uiFree()){nextTip(3000);return}$('#tip').innerHTML=`<b>💡 ${tr('Tip','Tip')} ${S.tut+1}/${TIPS.length}</b><p>${TIPS[S.tut]()}</p><button id="tipOk">${tr('Got it','I don hear')}</button>`;$('#tip').classList.remove('hide');$('#tipOk').onclick=()=>{$('#tip').classList.add('hide');S.tut++;save();nextTip(6000)}},d)}

// ---------- Minimap ----------
const mm=$('#mini'),mg=mm.getContext('2d');
function drawMini(){const s=mm.width,sc=s/900,cx=S.p.x,cy=S.p.y;mg.setTransform(1,0,0,1,0,0);mg.fillStyle='#8bc34a';mg.fillRect(0,0,s,s);mg.save();mg.translate(s/2,s/2);mg.rotate(R.cam.yaw);mg.scale(sc,sc);mg.translate(-cx,-cy);
 mg.fillStyle='#29b6f6';mg.fillRect(-2000,SEA,9000,2000);mg.fillRect(1400,-500,200,SEA+500);mg.fillRect(3000,-500,200,SEA+500);mg.fillStyle='#ffe082';mg.fillRect(-2000,SHORE,9000,SEA-SHORE);
 mg.fillStyle='#555';mg.fillRect(-2000,RY,9000,RH);for(let d=0;d<3;d++)mg.fillRect(vroad(d),0,80,SHORE);
 for(const b of B){mg.fillStyle=b.kind==='hospital'?'#e53935':b.kind==='park'?'#ffd400':b.roof;mg.fillRect(b.x,b.y,b.w,b.h)}
 mg.fillStyle='#ffd400';for(const v of BUS){const [x,y]=busPos(v);mg.fillRect(x-25,y-12,50,24)}{const tg=STORY.on&&STORY.target();if(tg&&BY[tg]){const d=BY[tg].door;const dx=cl(d.x-cx,-430,430),dy=cl(d.y-cy,-430,430);mg.fillStyle='#ff1744';mg.strokeStyle='#fff';mg.lineWidth=14;mg.beginPath();mg.arc(cx+dx,cy+dy,38,0,7);mg.fill();mg.stroke()}}mg.restore();
 mg.fillStyle='#fff';mg.strokeStyle='#111';mg.lineWidth=2;mg.save();mg.translate(s/2,s/2);mg.rotate(R.cam.yaw-PR.ry+Math.PI);mg.beginPath();mg.moveTo(0,-8);mg.lineTo(6,6);mg.lineTo(-6,6);mg.closePath();mg.fill();mg.stroke();mg.restore();
 mg.fillStyle='#111';mg.font='900 11px system-ui';mg.textAlign='center';mg.fillText('N',s/2+Math.sin(R.cam.yaw)*(s/2-9),s/2-Math.cos(R.cam.yaw)*(s/2-9)+4)}

let evTdummy=0;
function hourTicks(){let g=0;while(Math.floor(S.t/60)>S.lh&&g++<400){S.lh++;hourTick()}}
function adv(min){S.t+=min;hourTicks()}
function hourTick(){const hr=S.lh%24;stat('hunger',-3);stat('energy',-1.5);if(S.hunger<=0){stat('energy',-3);stat('peace',-2)}
 if(S.bo&&S.lh>=S.boEnd){S.bo=0;toast(tr('💡 Light don come back! UP NEPA!','💡 Light don come back! UP NEPA!'))}
 else if(!S.bo){const night=hr>=19||hr<5;if(Math.random()<(night?.28:.04))blackout(2+Math.floor(Math.random()*4))}
 if(hr===0)dayTick()}
function blackout(h){S.bo=1;S.boEnd=S.lh+h;stat('peace',-4);toast(tr('⚡ NEPA has taken the light!','⚡ NEPA don take light!'))}
function dayTick(){const d=day(),over=d-S.rentDue;
 if(d%7===1){if(S.debt>0){S.debt=Math.min(5e6,Math.round(S.debt*1.05));toast(tr('Loan interest added (5%)','Loan interest don add (5%)'))}if(S.save>0)S.save=Math.min(MAXM,Math.round(S.save*1.01))}
 if(S.debt>0)stat('peace',-1);
 if(!S.homeless&&over>=7){if(S.home>0){S.home=0;S.rentDue=d+7;toast(tr('🚪 EVICTED! Landlord threw your things out. Back to face-me-I-face-you.','🚪 Landlord don pursue you! You don go back face-me-I-face-you.'))}else{S.homeless=true;toast(tr('🚪 EVICTED! You are now homeless — sleep at a danfo park.','🚪 Dem don pursue you comot! Go sleep for motor park.'))}stat('peace',-25);stat('respect',-10);STORY.ev('evicted')}
 else if(!S.homeless&&over>=3)toast(tr('⚠️ Rent overdue! Landlord says pay or pack.','⚠️ Rent don pass! Landlord say pay or pack.'));fix();save()}
function faint(){if(IN)leaveInterior(true);S.energy=25;const fee=Math.min(5000,S.money);pay(fee);adv(6*60);const h=HOMES[S.home];if(!S.homeless){const d=BY[h.b].door;S.p.x=d.x;S.p.y=d.y+20}
 toast(tr(`😵 You collapsed! Clinic bill ${N(fee)}.`,`😵 You faint! Clinic collect ${N(fee)}.`))}
let tT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),2800)}
let cur=null;
function panel(fn){cur=fn;$('#modal').classList.remove('hide');drawPanel()}
function drawPanel(){if(!cur)return;const P=cur();if(!P){closeModal();return}const sh=$('#sheet');
 sh.innerHTML=`<div class="card"><div class="em">${P.em||''}</div><h2>${P.title}</h2>${P.text?`<p>${P.text}</p>`:''}${statLine()}</div><div class="acts">${P.acts.map((a,i)=>`<button data-a="${i}" ${a.dis?'disabled':''} class="${a.alt?'alt':''}">${a.l}${a.s?`<small>${a.s}</small>`:''}</button>`).join('')}<button class="alt" data-a="x">${tr('⬅ Leave','⬅ Comot')}</button></div>`;
 sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='x')return closeModal();const ac=P.acts[+a];if(ac.dis)return;const r=ac.f();fix();save();hud();if(r!=='keep')drawPanel()})}
function closeModal(){cur=null;$('#modal').classList.add('hide')}
function statLine(){return `<p style="font-size:13px">💰 ${N(S.money)} · ⚡${S.energy|0} · 🍲${S.hunger|0} · ☮️${S.peace|0} · ⭐${S.respect|0}</p>`}
const fmtT=()=>{const h=Math.floor(hour()),m=Math.floor(S.t%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`};
// ---------- HUD ----------
function hud(){if(!S||!S.look)return;const bar=(e,k,c)=>`<div class="st ${S[k]<25?'low':''}" title="${k}"><span>${e}</span><s><i style="width:${S[k]}%;background:${c}"></i></s></div>`;
 $('#hl').innerHTML=`<div class="money">💰 ${N(S.money)}</div><div class="bars">${bar('⚡','energy','#fbc02d')}${bar('🍲','hunger','#ef6c00')}${bar('☮️','peace','#29b6f6')}${bar('⭐','respect','#ab47bc')}</div>`;
 const nf=nightF();$('#clock').innerHTML=`<b>${fmtT()}</b> ${S.bo?'🕯️':nf>.5?'🌙':'☀️'}<small>${tr('Day','Day')} ${day()}</small>`;
 $('#where').textContent=IN?'🚪 '+L(IN.b.lab).split(' (')[0]:'📍 '+L(DIST[distAt(S.p.x)].n)+(S.bo?' · ⚡'+tr('NEPA','NEPA'):'');
 const a=$('#act');if(uiFree()&&(nearAct||near)){a.classList.remove('hide');a.textContent=nearAct?nearAct.act.l:(near.kind==='park'?'🚌 ':near.kind==='beach'?'🏖️ ':'🚪 ')+tr('Enter ','Enter ')+L(near.lab).split(' (')[0]}else a.classList.add('hide');
 const ob=$('#obj');if(STORY.on){ob.classList.remove('hide');const tg=STORY.target(),tb=tg&&BY[tg];let ar='';if(tb){if(IN&&IN.b===tb)ar='📍';else if(!IN){const dx=tb.door.x-S.p.x,dz=tb.door.y-S.p.y,y=R.cam.yaw,sx=dx*Math.cos(y)-dz*Math.sin(y),su=-dx*Math.sin(y)-dz*Math.cos(y);ar=`<i class="wa" style="transform:rotate(${Math.atan2(sx,su)}rad)">⬆</i><em>${Math.round(Math.hypot(dx,dz)*K)}m</em>`}}ob.innerHTML=`<div>${STORY.tracker()}</div>${ar}`}else ob.classList.add('hide');
 if(!IN)drawMini();$('#mini').style.visibility=IN?'hidden':'';
 if(IN)R.setInteriorPower(S.bo&&!IN.b.gen&&!IN.sp.powered&&!genOn(),genOn())}
$('#act').onclick=()=>{if(uiFree()&&(near||nearAct))interact()};

// ---------- Locations ----------
function placePanel(near){const k=near.kind;({home:homeP,buka:bukaP,tech:workP,bank:bankP,market:marketP,club:clubP,park:parkP,worship:worshipP,beach:beachP,fuel:fuelP,studio:workP,hospital:hospitalP})[k](near)}
const need=(e,h)=>S.energy>=e&&(h==null||S.hunger>=h);
function homeP(b){panel(()=>{const isHome=!S.homeless&&HOMES[S.home].b===b.id,h=HOMES[S.home],acts=[];
 if(isHome){acts.push({l:tr('😴 Sleep till morning','😴 Sleep till morning'),s:S.bo?(S.fuel>=4?tr('Blackout: gen will use 4L fuel','Light no dey: gen go use 4L'):tr('Blackout & no fuel: hot night, poor rest','No light, no fuel: heat go worry you')):tr('Restore energy','Restore energy'),f:sleep});
  acts.push({l:tr('🏠 Pay weekly rent','🏠 Pay house rent')+` (${N(h.rent)})`,s:tr(`Paid until day ${S.rentDue}`,`You don pay reach day ${S.rentDue}`)+(day()>S.rentDue?' ⚠️ '+tr('OVERDUE','E DON PASS'):''),dis:S.money<h.rent||S.rentDue>day()+21,f:()=>{if(pay(h.rent)){S.rentDue+=7;toast(tr('Rent paid ✅','Rent don pay ✅'))}}});
  if(S.bo&&S.fuel>=1)acts.push({l:tr('🔌 Run generator 1 hour (1L)','🔌 On gen 1 hour (1L)'),s:'+☮️6',f:()=>{S.fuel--;stat('peace',6);adv(60)}})}
 else if(S.homeless&&b.id==='room')acts.push({l:tr('🔑 Rent face-me-I-face-you again','🔑 Rent face-me-I-face-you again')+` (${N(HOMES[0].rent*2)})`,s:tr('2 weeks upfront','2 weeks upfront'),dis:S.money<HOMES[0].rent*2,f:()=>{if(pay(HOMES[0].rent*2)){S.homeless=false;S.home=0;S.rentDue=day()+14;toast(tr('You have a roof again!','You don get house again!'))}}});
 HOMES.forEach((o,i)=>{if(i>S.home&&o.b===b.id&&!S.homeless)acts.push({l:tr('⬆️ Move to ','⬆️ Pack enter ')+L(o.n)+` (${N(o.fee)})`,s:tr(`Agent + caution fee. Rent ${N(o.rent)}/week. Needs ⭐${o.rq}`,`Agent + caution. Rent ${N(o.rent)}/week. Need ⭐${o.rq}`),dis:S.money<o.fee||S.respect<o.rq,f:()=>{if(S.respect>=o.rq&&pay(o.fee)){S.home=i;S.rentDue=day()+7;stat('peace',15);stat('respect',8);toast('🎉 '+L(o.n)+'!')}}})});
 return{em:'🏠',title:L(b.lab),text:isHome?tr(`Your home: ${L(h.n)}. Rent ${N(h.rent)}/week.`,`Your house: ${L(h.n)}. Rent ${N(h.rent)}/week.`):tr('Not your current home.','No be your house now.'),acts}})}
function sleep(){const h=HOMES[S.home];let q=h.sleep;if(S.bo){if(S.fuel>=4)S.fuel-=4;else{q*=.55;stat('peace',-8)}}
 const hr=hour(),hrs=hr<7?7-hr:Math.min(10,31-hr);adv(Math.max(6,hrs)*60);S.energy=cl(S.energy+100*q,0,100);stat('peace',S.home*4+2);toast(tr('Good morning! ☀️','Good morning o! ☀️'))}
function bukaP(b){const F=b.id==='buka'?[['🍲',['Amala + ewedu + gbegiri','Amala, ewedu, gbegiri'],1500,40,2],['🍛',['Jollof rice + chicken','Jollof + chicken'],3000,55,5],['💧',['Pure water','Pure water'],50,3,1]]:[['🍢',['Suya stick','Suya'],2000,25,4],['🍛',['Party jollof','Party jollof'],3500,55,5],['🥤',['Zobo','Zobo'],500,8,2]];
 panel(()=>({em:'🍲',title:L(b.lab),text:tr('What will you eat?','Wetin you wan chop?'),acts:F.map(f=>({l:`${f[0]} ${L(f[1])} — ${N(f[2])}`,s:`+🍲${f[3]} +☮️${f[4]}`,dis:S.money<f[2]||S.hunger>=98,f:()=>{if(pay(f[2])){STORY.ev('ate');AU.coin();stat('hunger',f[3]);stat('peace',f[4]);stat('energy',3);adv(20)}}}))}))}
function carFor(b){return Object.keys(CAR).find(k=>CAR[k].loc===b.id)}
function workP(b){const k=carFor(b),C=CAR[k];panel(()=>{const c=S.car[k],hr=hour(),open=hr>=C.hrs[0]&&hr<C.hrs[1],nx=c.lv<3?tr(`Next promotion: ${XPN[c.lv+1]} XP & ⭐${RQN[c.lv+1]}`,`Next promotion: ${XPN[c.lv+1]} XP & ⭐${RQN[c.lv+1]}`):tr('Top of the ladder!','You don reach top!');
 const acts=[{l:`${C.em} ${tr('Work an 8-hour shift','Do 8-hour shift')}`,s:open?tr(`Pay up to ${N(C.pay[c.lv])} · needs ⚡25 🍲10`,`Pay reach ${N(C.pay[c.lv])} · need ⚡25 🍲10`):tr(`Closed. Open ${C.hrs[0]}:00–${C.hrs[1]}:00`,`E don close. E dey open ${C.hrs[0]}:00–${C.hrs[1]}:00`),dis:!open||!need(25,10),f:()=>{shift(k);return 'keep'}}];
 if(b.kind==='tech')acts.push({l:tr('☕ Free coffee & Wi-Fi','☕ Free coffee & Wi-Fi'),s:'+⚡5 +☮️2 (30 min)',f:()=>{stat('energy',5);stat('peace',2);adv(30)}});
 return{em:C.em,title:L(b.lab),text:`${L(C.n)}: <b>${L(C.t[c.lv])}</b> · XP ${c.xp}. ${nx}`,acts}})}
// shift mini-game: tap the matching task fast
function shift(k){const C=CAR[k],c=S.car[k];let round=0,score=0,tmr;const sh=$('#sheet');
 function next(){if(round>=6)return done();round++;const pool=[...C.tasks].sort(()=>Math.random()-.5).slice(0,3),ans=pool[Math.floor(Math.random()*3)];
  sh.innerHTML=`<div class="card"><h2>${C.em} ${tr('Shift','Shift')} ${round}/6 · ✅${score}</h2><p style="font-size:22px">${tr('Quick!','Sharp sharp!')} ${L(ans)}</p><div class="timer"><i id="tb" style="width:100%"></i></div></div><div class="grid3">${pool.map((t,i)=>`<button data-t="${i}">${t[2]}<br>${L(t)}</button>`).join('')}</div>`;
  requestAnimationFrame(()=>{const tb=$('#tb');if(tb){tb.style.transitionDuration='2.6s';tb.style.width='0%'}});
  tmr=setTimeout(next,2600);sh.querySelectorAll('[data-t]').forEach(bt=>bt.onclick=()=>{clearTimeout(tmr);if(pool[+bt.dataset.t]===ans)score++;next()})}
 function done(){const p=Math.round(C.pay[c.lv]*(0.4+0.6*score/6));earn(p);c.xp=Math.min(999,c.xp+score);stat('energy',-25);stat('hunger',-15);adv(8*60);S.shifts++;setTimeout(()=>STORY.ev('shift',k),50);let promo='';
  if(c.lv<3&&c.xp>=XPN[c.lv+1]&&S.respect>=RQN[c.lv+1]){c.lv++;stat('respect',6);setTimeout(()=>STORY.ev('promo'),900);promo=`<p>🎉 ${tr('PROMOTED to','Dem PROMOTE you to')} <b>${L(C.t[c.lv])}</b>!</p>`}
  fix();save();hud();sh.innerHTML=`<div class="card"><div class="em">💼</div><h2>${tr('Shift done!','Shift don finish!')}</h2><p>${score}/6 ${tr('tasks','tasks')} · ${tr('Earned','You collect')} <b>${N(p)}</b> · +${score} XP</p>${promo}${statLine()}</div><div class="acts"><button id="sd">OK</button></div>`;$('#sd').onclick=()=>drawPanel()}
 next()}
function bankP(b){panel(()=>{const lim=Math.max(0,50000*(1+Object.values(S.car).reduce((a,c)=>a+c.lv,0))-S.debt),dep=Math.min(S.money,50000),wd=Math.min(S.save,50000),rp=Math.min(S.money,S.debt);
 const acts=[{l:tr('💳 Deposit ','💳 Save ')+N(dep),s:tr('1% weekly interest','1% interest every week'),dis:dep<=0,f:()=>{if(pay(dep))S.save+=dep}},
 {l:tr('💵 Withdraw ','💵 Collect ')+N(wd),dis:wd<=0,f:()=>{const w=Math.min(wd,S.save);S.save-=w;earn(w)}},
 {l:tr('📝 Take loan ','📝 Collect loan ')+N(Math.min(50000,lim)),s:tr(`5%/week interest. Limit left ${N(lim)}`,`5%/week interest. Remain ${N(lim)}`),dis:lim<1000,f:()=>{const a=Math.min(50000,lim);S.debt+=a;earn(a);stat('peace',-3)}},
 {l:tr('✅ Repay ','✅ Pay back ')+N(rp),dis:rp<=0,f:()=>{const r=Math.min(rp,S.debt);if(pay(r))S.debt-=r}}];
 const W=workPActs(b);return{em:'🏦',title:L(b.lab),text:tr(`Savings ${N(S.save)} · Debt ${N(S.debt)}`,`Savings ${N(S.save)} · Debt ${N(S.debt)}`),acts:acts.concat(W)}})}
function workPActs(b){const k=carFor(b);if(!k)return[];const C=CAR[k],c=S.car[k],hr=hour(),open=hr>=C.hrs[0]&&hr<C.hrs[1];
 return[{l:`${C.em} ${tr('Work shift as','Work shift as')} ${L(C.t[c.lv])}`,s:open?tr(`Pay up to ${N(C.pay[c.lv])} · XP ${c.xp}/${XPN[Math.min(3,c.lv+1)]} ⭐${RQN[Math.min(3,c.lv+1)]}`,`Pay reach ${N(C.pay[c.lv])} · XP ${c.xp}/${XPN[Math.min(3,c.lv+1)]} ⭐${RQN[Math.min(3,c.lv+1)]}`):tr(`Closed. ${C.hrs[0]}:00–${C.hrs[1]}:00`,`E don close. ${C.hrs[0]}:00–${C.hrs[1]}:00`),dis:!open||!need(25,10),f:()=>{shift(k);return 'keep'}}]}
function marketP(b){panel(()=>{const acts=[];GOODS.forEach((g,i)=>{const p=goodPrice(i),sp=Math.round(p*.92);
  acts.push({l:`${g[1]} ${tr('Buy','Buy')} ${L(g[2])} — ${N(p)}`,s:tr(`You have ${S.inv[i]}/10 · sell price ${N(sp)}`,`You get ${S.inv[i]}/10 · sell price ${N(sp)}`),dis:S.money<p||S.inv[i]>=10,f:()=>{if(S.inv[i]<10&&pay(p))S.inv[i]++}});
  if(S.inv[i]>0)acts.push({l:`${g[1]} ${tr('Sell','Sell')} 1 — ${N(sp)}`,alt:1,f:()=>{if(S.inv[i]>0){S.inv[i]--;earn(sp)}}})});
 return{em:'🛍️',title:L(b.lab),text:tr("Prices change every day. Buy low today, sell high another day.",'Price dey change every day. Buy cheap, sell when e cost.'),acts:workPActs(b).concat(acts)}})}
function clubP(b){panel(()=>{const hr=hour(),open=hr>=21||hr<4;return{em:'🪩',title:L(b.lab),text:open?tr('The DJ is on fire. Who you be?','DJ dey burst brain. Who you be?'):tr('Opens 9pm – 4am.','E dey open 9pm – 4am.'),acts:[
 {l:tr('🎟️ Regular entry ','🎟️ Regular gate ')+N(10000),s:'+⭐5 +☮️6 −⚡15',dis:!open||S.money<10000||S.energy<15,f:()=>{if(pay(10000)){stat('respect',5);stat('peace',6);stat('energy',-15);adv(120);S.clubT=S.t+180;STORY.ev('club',0);clubEvent()}}},
 {l:tr('🍾 VIP table ','🍾 VIP table ')+N(80000),s:'+⭐18 +☮️10 −⚡20',dis:!open||S.money<80000||S.energy<20,f:()=>{if(pay(80000)){stat('respect',18);stat('peace',10);stat('energy',-20);adv(180);S.clubT=S.t+240;STORY.ev('club',1);clubEvent()}}}]}})}
function clubEvent(){const r=Math.random();if(r<.15){earn(20000);toast(tr('💸 A celebrity sprayed you ₦20,000!','💸 Celebrity spray you ₦20,000!'))}else if(r<.28){pay(Math.min(S.money,15000));stat('peace',-10);toast(tr('📵 Your phone got "missing". Paid ₦15,000 to replace.','📵 Dem japa with your phone. ₦15k don go.'))}else if(r<.38){stat('respect',8);toast(tr('🎤 You got called on stage!','🎤 Dem call you enter stage!'))}}
function parkP(b){panel(()=>{const from=b.d,acts=DIST.map((d,i)=>i===from?null:{l:`🚌 ${tr('Danfo to','Danfo go')} ${L(d.n)} — ${N(FARE[from][i])}`,s:tr('~40 min, squeeze inside','~40 min, squeeze body'),dis:S.money<FARE[from][i],f:()=>{if(pay(FARE[from][i])){adv(40);stat('energy',-4);const t=BY['park'+i].door;S.p.x=t.x;S.p.y=t.y+24;closeModal();toast('📍 '+L(d.n));return 'keep'}}}).filter(Boolean);
 if(S.homeless)acts.push({l:tr('🪑 Sleep on a bench','🪑 Sleep for bench'),s:'+⚡35 −☮️10',f:()=>{adv(6*60);stat('energy',35);stat('peace',-10)}});
 acts.push(...STORY.parkActs(b));return{em:'🚌',title:L(b.lab),text:tr('"Oshodi! Obalende! Enter with your change!"','"Oshodi! Obalende! Enter with your change o!"'),acts}})}
function worshipP(b){panel(()=>({em:'🕌⛪',title:L(b.lab),text:tr('A quiet place to reset.','Quiet place to rest your mind.'),acts:[{l:tr('🙏 Pray / reflect (1h)','🙏 Pray small (1h)'),s:'+☮️15',f:()=>{stat('peace',15);adv(60)}},{l:tr('🎁 Give offering ','🎁 Drop offering ')+N(1000),s:'+⭐2 +☮️4',dis:S.money<1000,f:()=>{if(pay(1000)){stat('respect',2);stat('peace',4)}}}]}))}
function beachP(b){panel(()=>({em:'🏖️',title:L(b.lab),text:tr('Waves, horses, loud speakers. Peace.','Wave, horse, speaker dey blast. Peace.'),acts:[{l:tr('🌊 Chill at the beach ','🌊 Chill for beach ')+N(2000),s:'+☮️25 +⚡5 (2h)',dis:S.money<2000,f:()=>{if(pay(2000)){stat('peace',25);stat('energy',5);adv(120)}}},{l:tr('🐎 Horse ride ','🐎 Ride horse ')+N(5000),s:'+☮️12 +⭐3',dis:S.money<5000,f:()=>{if(pay(5000)){stat('peace',12);stat('respect',3);adv(30)}}},{l:tr('🍢 Beach suya ','🍢 Beach suya ')+N(2500),s:'+🍲30',dis:S.money<2500,f:()=>{if(pay(2500)){stat('hunger',30);adv(15)}}}]}))}
function fuelP(b){const P=1200;panel(()=>({em:'⛽',title:L(b.lab),text:tr(`Petrol ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For your gen when NEPA strikes.`,`Fuel ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For gen when NEPA take light.`),acts:[1,5].map(q=>({l:`⛽ ${tr('Buy','Buy')} ${q}L — ${N(P*q)}`,dis:S.money<P*q||S.fuel+q>20,f:()=>{if(S.fuel+q<=20&&pay(P*q)){S.fuel+=q;STORY.ev('fuel');AU.coin()}}}))}))}

// ---------- Street events ----------
const STREET=[
 {id:'agbero',emoji:'🧾',text:{en:"Agbero blocks you: 'Owo ticket! ₦1,000 for this road.'",pg:"Agbero block you: 'Owo ticket! Drop ₦1,000 for this road.'"},choices:[{text:{en:'Pay ₦1,000',pg:'Pay ₦1,000'},fx:{m:-1000,p:-2}},{text:{en:'Argue small',pg:'Argue am small'},fx:{p:-8,r:3,e:-5}},{text:{en:'Run!',pg:'Japa!'},fx:{e:-10}}]},
 {id:'areaboys',emoji:'🧢',text:{en:"Area boys: 'Bros, anything for the boys?'",pg:"Area boys: 'Chairman, anything for the boys?'"},choices:[{text:{en:'Give ₦2,000',pg:'Give ₦2,000'},fx:{m:-2000,r:4}},{text:{en:'Greet them well, keep moving',pg:'Greet dem well, waka pass'},fx:{p:-2,r:1}},{text:{en:'Ignore them',pg:'Ignore dem'},fx:{p:-6,r:-3}}]},
 {id:'posagent',emoji:'🏧',text:{en:"POS agent: 'Your transfer failed, pay again.' Your bank app says it went through.",pg:"POS man: 'Transfer fail, pay again.' But your bank app talk say e don go."},choices:[{text:{en:'Show your receipt',pg:'Show am receipt'},fx:{p:-3,r:3}},{text:{en:'Just pay again',pg:'Just pay again'},fx:{m:-5000}},{text:{en:'Call a crowd',pg:'Shout make people gather'},fx:{e:-5,r:5,p:-5}}]}];
const POOL=STREET.concat((typeof EVENTS!=='undefined'?EVENTS:[]).filter(e=>['lastma','pos','owambe','hustle','data','danfo'].includes(e.id)));
function streetEvent(ev){ev=ev||POOL[Math.floor(Math.random()*POOL.length)];
 panel(()=>({em:ev.emoji,title:tr('Street wahala!','Street wahala!'),text:ev.text[S.lang==='pg'?'pg':'en'],acts:ev.choices.map(c=>{const f=c.fx,m=f.m||0;return{l:c.text[S.lang==='pg'?'pg':'en'],s:fxs(f)+(m<0&&S.money<-m?' — '+tr("can't afford","you no get"):''),dis:m<0&&S.money<-m,f:()=>{if(m<0&&!pay(-m))return;if(m>0)earn(m);stat('energy',f.e);stat('peace',f.p);stat('respect',f.r);if(f.f)stat('peace',-f.f/2);adv(30);closeModal();return 'keep'}}})}))}
const fxs=f=>[f.m?(f.m>0?'+':'−')+N(Math.abs(f.m)):'',f.e?`⚡${f.e>0?'+':''}${f.e}`:'',f.p?`☮️${f.p>0?'+':''}${f.p}`:'',f.r?`⭐${f.r>0?'+':''}${f.r}`:''].filter(Boolean).join(' ');
// ---------- Phone ----------
let tab='stats';
function openPhone(t){if(t)tab=t;$('#phone').classList.remove('hide');drawPhone()}
function closePhone(){$('#phone').classList.add('hide');$('#phBody').innerHTML=''}
$('#phClose').onclick=closePhone;$('#phoneBtn').onclick=()=>uiFree()&&openPhone();
function drawPhone(){const T=[['stats','📊',tr('Stats','Stats')],['bank','🏦',tr('Bank','Bank')],['quest','📜',tr('Quests','Quests')],['sapa','🎴','Sapa'],['set','⚙️',tr('Settings','Settings')]];
 $('#tabs').innerHTML=T.map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]} ${t[2]}</button>`).join('');$('#tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;drawPhone()});
 $('#phTitle').textContent=`📱 ${S.look.name} · ${fmtT()}`;const bd=$('#phBody');
 if(tab==='stats'){const h=HOMES[S.home],nw=S.money+S.save-S.debt;bd.innerHTML=`<table><tr><td>💰 ${tr('Cash','Cash')}</td><td>${N(S.money)}</td></tr><tr><td>🏦 ${tr('Savings','Savings')}</td><td>${N(S.save)}</td></tr><tr><td>📝 ${tr('Debt','Debt')}</td><td>${N(S.debt)}</td></tr><tr><td>📈 ${tr('Net worth','Net worth')}</td><td>${nw<0?'−':''}${N(Math.abs(nw))}</td></tr><tr><td>🏠 ${tr('Home','House')}</td><td>${S.homeless?tr('Homeless','No house'):L(h.n)}</td></tr><tr><td>📅 ${tr('Rent paid until','Rent pay reach')}</td><td>${tr('Day','Day')} ${S.rentDue}</td></tr><tr><td>🏥 ${tr('Times hit by vehicles','Times wey motor jam you')}</td><td>${S.deaths|0}</td></tr><tr><td>⛽ ${tr('Fuel','Fuel')}</td><td>${S.fuel} L</td></tr><tr><td>💡 NEPA</td><td>${S.bo?tr('Blackout','No light'):tr('Light dey','Light dey')}</td></tr>
  ${Object.keys(CAR).map(k=>`<tr><td>${CAR[k].em} ${L(CAR[k].n)}</td><td>${L(CAR[k].t[S.car[k].lv])} · ${S.car[k].xp}XP</td></tr>`).join('')}
  ${['energy','hunger','peace','respect'].map(k=>`<tr><td>${k}</td><td>${S[k]|0}/100</td></tr>`).join('')}</table><p style="font-size:12px">${tr('Tip: work at Tech Hub (Yaba), Bank (VI), Market (Yaba) or Studio (Lekki). Danfo parks connect districts.','Tip: work for Tech Hub (Yaba), Bank (VI), Market (Yaba) or Studio (Lekki). Motor park go carry you anywhere.')}</p>`}
 else if(tab==='bank')bd.innerHTML=`<div class="card"><h2>🏦 ${N(S.save)}</h2><p>${tr('Savings','Savings')} · ${tr('Debt','Debt')} ${N(S.debt)}</p><p style="font-size:13px">${tr('Deposits, withdrawals and loans are done in person at Gidi Trust Bank (Victoria Island). Interest is applied weekly.','Go Gidi Trust Bank for VI to save, collect or borrow. Interest dey enter every week.')}</p></div>`;
 else if(tab==='quest')bd.innerHTML=`<div class="qlog">${STORY.log()}</div>`;
 else if(tab==='sapa')bd.innerHTML=`<iframe id="sapaFrame" src="challenge/index.html" title="Sapa Challenge"></iframe>`;
 else{bd.innerHTML=`<div class="acts"><p><b>🎮 ${tr('Graphics','Graphics')}</b></p><div class="row">${['low','med','high'].map(q=>`<button class="opt ${SET.q===q?'on':''}" data-q="${q}">${q==='low'?tr('Low (fast)','Low (fast)'):q==='med'?tr('Medium','Medium'):tr('High','High')}</button>`).join('')}</div><p><b>🔊 ${tr('Audio','Audio')}</b></p>${[['vm','🎵',tr('Music','Music')],['vs','💥',tr('Sound effects','Sound effects')],['va','🌆',tr('Ambience','Ambience')]].map(([k,e,n])=>`<label class="sl">${e} ${n}<input type="range" min="0" max="1" step="0.05" value="${SET[k]??.7}" data-v="${k}"></label>`).join('')}<button id="mtest">🎵 ${tr('Test music','Test music')}</button><button id="snd">${SET.snd?'🔇 '+tr('Mute all','Mute everything'):'🔊 '+tr('Unmute','Unmute')}</button><button id="lng">🌐 ${tr('Language: English → switch to Pidgin','Language: Pidgin → switch to English')}</button><button id="sv">💾 ${tr('Save now','Save am now')}</button><button id="rs" class="alt">🗑️ ${tr('Reset game (new character)','Start again (new person)')}</button></div><p style="font-size:12px">${tr('Single-player. Saved on this device only. No chat, no real-money purchases.','Na only you dey play. E save for this phone only. No chat, no real money.')}</p>`;
  $('#lng').onclick=()=>{S.lang=S.lang==='pg'?'en':'pg';SET.lang=S.lang;saveSet();save();drawPhone();hud()};bd.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{SET.q=b.dataset.q;saveSet();R.setQuality(SET.q);drawPhone()});$('#mtest').onclick=()=>{const st=AU.test();toast('🎵 Audio: '+st+(AU.rendered?' · '+AU.rendered+' loops ready':''))};$('#snd').onclick=()=>{SET.snd=SET.snd?0:1;saveSet();AU.init();AU.vol();drawPhone()};bd.querySelectorAll('[data-v]').forEach(i=>i.oninput=()=>{SET[i.dataset.v]=+i.value;saveSet();AU.init();AU.vol()});$('#sv').onclick=()=>{save();toast(tr('Saved ✅','E don save ✅'))};
  $('#rs').onclick=()=>{if(confirm(tr('Delete your save and start over?','You sure say make we clear everything?'))){localStorage.removeItem(SAVE);const lang=S.lang;S={lang};if(IN)leaveInterior(true);closePhone();creator()}}}}
// ---------- Character creator ----------

const SKINS=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59','#e0ac69'],OUTS=['#0b7a3e','#e53935','#1e88e5','#fdd835','#8e24aa','#fb8c00','#212121','#ffffff'];
const HAIRS=[['Low cut','Low cut'],['Afro','Afro'],['Braids','Braids'],['Cap','Face cap'],['Headwrap','Gele/wrap']];
let ck={name:'',skin:SKINS[2],out:OUTS[0],hair:0,body:0},cbg='nepo';
function creator(){$('#title').classList.add('hide');$('#creator').classList.remove('hide');$('#hud').classList.add('hide');$('#phoneBtn').classList.add('hide');const cr=$('#cr');
 cr.innerHTML=`<div class="card"><h2>🇳🇬 Sapa Survival <span style="color:#0b7a3e">3D</span></h2><p>${tr('Create your Lagosian. Hustle, chop, pay rent, survive NEPA.','Create your Lagos person. Hustle, chop, pay rent, survive NEPA.')}</p>
 <canvas id="pv" width="240" height="150" style="width:120px;height:75px;display:block;margin:4px auto"></canvas>
 <input id="nm" maxlength="14" placeholder="${tr('Your name','Your name')}" value="${ck.name}">
 <p>${tr('Skin tone','Skin colour')}</p><div class="row" id="sk">${SKINS.map(c=>`<button class="sw ${c===ck.skin?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Outfit colour','Cloth colour')}</p><div class="row" id="oc">${OUTS.map(c=>`<button class="sw ${c===ck.out?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Hair / head','Hair / head')}</p><div class="row" id="hr">${HAIRS.map((h,i)=>`<button class="opt ${i===ck.hair?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Build','Body')}</p><div class="row" id="bdy">${[['Slim','Slim'],['Broad','Broad']].map((h,i)=>`<button class="opt ${i===ck.body?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Background','Background')}</p><div class="row" id="bgc">${STORYMODE?`<button class="opt ${cbg==='nepo'?'on':''}" data-v="nepo">🙏🏾 ${tr('Easy','Easy')}<br><small>₦50,000 + ${tr("Mum's prayers",'Mama prayers')}</small></button><button class="opt ${cbg==='lapo'?'on':''}" data-v="lapo">📝 ${tr('Hard','Hard')}<br><small>₦50,000 + ₦100k Lapo ${tr('debt','debt')}</small></button>`:`<button class="opt ${cbg==='nepo'?'on':''}" data-v="nepo">👑 Nepo Baby<br><small>₦500,000</small></button><button class="opt ${cbg==='lapo'?'on':''}" data-v="lapo">📝 Lapo Loan<br><small>₦50,000 + ₦100k ${tr('debt','debt')}</small></button>`}</div>
 <div class="row"><button class="opt" id="clang">🌐 ${S&&S.lang==='pg'?'English':'Pidgin'}</button></div></div><div class="acts"><button id="go">🚶 ${tr('Enter Lagos','Enter Lagos')}</button></div>`;
 const pv=$('#pv').getContext('2d');const dp=()=>{pv.clearRect(0,0,240,150);pv.fillStyle='#e8d29a';pv.fillRect(0,0,240,150);drawAvatar(pv,120,135,ck,0,0,2.2)};dp();
 $('#nm').oninput=e=>ck.name=e.target.value;
 [['sk','skin'],['oc','out'],['hr','hair'],['bdy','body']].forEach(([id,k])=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{ck[k]=k==='hair'||k==='body'?+b.dataset.v:b.dataset.v;$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));dp()}));
 $('#bgc').querySelectorAll('button').forEach(b=>b.onclick=()=>{cbg=b.dataset.v;$('#bgc').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
 $('#clang').onclick=()=>{S=S||{};S.lang=S.lang==='pg'?'en':'pg';SET.lang=S.lang;saveSet();creator()};
 $('#go').onclick=()=>{const name=(ck.name||'').replace(/[<>&"']/g,'').trim().slice(0,14)||'Tunde';S=fresh({...ck,name},cbg);if(STORYMODE){S.story=STORY.fresh();S.money=50000;S.debt=cbg==='lapo'?100000:0;S.respect=2;if(cbg==='nepo')S.peace=85;const d=BY.park0.door;S.p.x=d.x;S.p.y=d.y+20;S.tut=0;fix();save();start(true);STORY.intro(()=>{hud();nextTip(800)});return}fix();save();start();toast(cbg==='nepo'?tr('Daddy\'s money landed. Don\'t waste it!','Papa money don land. No waste am!'):tr('Lapo loan landed. Repay at the bank in VI!','Lapo loan don land. Pay back for bank for VI!'))}}
function start(noTip){$('#creator').classList.add('hide');$('#title').classList.add('hide');R.setLook(S.look);DEAD=null;$('#hud').classList.remove('hide');$('#phoneBtn').classList.remove('hide');lastDist=-1;hud();if(S.tut<TIPS.length&&!noTip)nextTip(1200);if(S.story&&S.story.on&&!S.story.intro&&!noTip)STORY.intro(()=>hud())}

// ---------- Title / loading / boot ----------
function showTitle(){const has=load();const t=$('#title');t.classList.remove('hide');
 t.innerHTML=`<div class="tcard"><div class="logo">SAPA<br>SURVIVAL<span>3D LAGOS LIFE</span></div><p>${tr('Hustle in Yaba, VI & Lekki. Pay rent. Survive NEPA. Dodge danfo.','Hustle for Yaba, VI & Lekki. Pay rent. Survive NEPA. Dodge danfo.')}</p>
 ${has?`<button id="tCont">▶ ${tr('Continue','Continue')} — ${S.look.name}, ${tr('Day','Day')} ${day()}</button>`:''}<button id="tStory" class="${has?'alt':''}">📖 ${tr('New Story','New Story')}<small>${tr('From Face-Me-I-Face-You to Lekki','From Face-Me-I-Face-You to Lekki')}</small></button><button id="tNew" class="alt">🌍 ${tr('New Free Roam','New Free Roam')}</button>
 <div class="row">${['low','med','high'].map(q=>`<button class="opt ${SET.q===q?'on':''}" data-q="${q}">${q==='low'?'⚡ Low':q==='med'?'Medium':'✨ High'}</button>`).join('')}</div>
 <div class="row"><button class="opt" id="tSnd">${SET.snd?'🔊':'🔇'} ${tr('Sound','Sound')}</button><button class="opt" id="tLng">🌐 ${tr('Pidgin','English')}</button></div><p class="sm">${tr('Single-player · saves on this device · no login','Na only you · e save for this phone · no login')}</p></div>`;
 if(has)$('#tCont').onclick=()=>{AU.init();start()};
 const nw_=story=>{AU.init();if(has&&!confirm(tr('Start a new life? Your current save will be replaced when you enter Lagos.','Start new life? Your old save go clear when you enter Lagos.')))return;const lang=(S&&S.lang)||SET.lang;S={lang};STORYMODE=story;creator()};$('#tStory').onclick=()=>nw_(true);$('#tNew').onclick=()=>nw_(false);
 t.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{SET.q=b.dataset.q;saveSet();R.setQuality(SET.q);showTitle()});
 $('#tSnd').onclick=()=>{SET.snd=SET.snd?0:1;saveSet();AU.init();AU.vol();showTitle()};$('#tLng').onclick=()=>{SET.lang=SET.lang==='pg'?'en':'pg';if(S)S.lang=SET.lang;saveSet();showTitle()}}
const prog=p=>{$('#lbar').style.width=p+'%';$('#lpct').textContent=Math.round(p)+'%';return new Promise(r=>setTimeout(r,16))};
let last=performance.now(),hudT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;tm+=dt;
 try{worldTick(dt);const playing=S&&S.look&&!vis('#title');if(playing)update(dt);
  const title=!playing;const pp=IN?{x:IN.p.x,z:IN.p.z}:(S&&S.p&&S.look?{x:S.p.x*K,z:S.p.y*K}:{x:BY.tech.door.x*K,z:(RY+50)*K});
  let mk=null;if(playing&&!DEAD){if(IN&&nearAct)mk=[nearAct.x,nearAct.z,2.3];else if(near)mk=[near.door.x*K,(near.door.y+4)*K,2.4]}
  R.frame(dt,{tm,p:{...pp,ry:PR.ry,ph:PR.ph,moving:PR.moving},h:S&&S.look?hour():16.8,nf:S&&S.look?nightF():0,bo:S&&S.look?S.bo:0,dead:DEAD,marker:mk,title:title&&!vis('#creator')||(title&&!(S&&S.look)),cine:STORY.cine,wp:(playing&&!IN&&STORY.on&&STORY.target()&&BY[STORY.target()])?[BY[STORY.target()].door.x*K,BY[STORY.target()].door.y*K]:null});
  audioFrame(playing);
  bubTick(dt);AU.tick();if(playing){STORY.tick(dt);hudT+=dt;if(hudT>.25){hudT=0;hud()}}
  fpsN++;}catch(e){console.error(e)}requestAnimationFrame(loop)}
let fpsN=0;
function audioFrame(playing){if(!AU.ctx)return;const ci=R.camInfo();AU.listen(ci.x,ci.y,ci.z,ci.fx,ci.fz);
 let tk='city',club=0,dist='title';
 if(!playing)tk='title';else{dist=IN?'in':DIST[distAt(S.p.x)].id;
  if(DEAD||STORY.tense)tk='tense';else if(IN){tk=IN.b.kind==='club'?'amapiano':['home','worship'].includes(IN.b.kind)?'calm':'city'}else{if(S.p.x>3850&&S.p.y>850)tk='calm';const h=hour(),cd=BY.club.door,dd=Math.hypot(S.p.x-cd.x,S.p.y-cd.y);if((h>=21||h<4)&&dd<700)club=1-dd/700}
  if(!IN){const ok=BUS.filter(v=>v.ok).map(v=>{const [x,y]=busPos(v);return{x,y,d:Math.hypot(x-S.p.x,y-S.p.y)}}).sort((a,b)=>a.d-b.d);for(let i=0;i<2;i++){const o=ok[i];AU.setLoop('ok'+i,o&&o.d<800,o?[o.x*K,1,o.y*K]:[0,0,0],'okada')}
   GEN.forEach((g,i)=>AU.setLoop('gen'+i,!!S.bo&&Math.hypot(g.x-S.p.x,g.y-S.p.y)<900,[g.x*K,1,g.y*K],'gen'))}else{['ok0','ok1','gen0','gen1','gen2'].forEach(k=>AU.setLoop(k,false));AU.setLoop('genH',genOn()&&IN.b.kind==='home',[IN.sp.w/2-1,1,IN.sp.d/2-1],'gen')}}
 AU.setTrack(tk);AU.setClub(club);AU.setDistrict(dist)}
let STORYMODE=false;
const STORY=makeStory({get S(){return S},tr,N,toast,pay,earn,stat,adv,save,fix,hud,BY,K,AU,HOMES,day,hour,closeModal,free:()=>S&&S.look&&!vis('#modal')&&!vis('#phone')&&!DEAD&&!fading&&!STORY.dlgOpen()&&!vis('#title')&&!vis('#creator'),inside:()=>!!IN,
 fx:f=>{if(f.m<0)pay(Math.min(S.money,-f.m));if(f.m>0)earn(f.m);stat('energy',f.e);stat('peace',f.p);stat('respect',f.r)}});
async function boot(){try{await prog(20);await R.init(cv,SET.q);await prog(45);await R.build({B,WW,WH,SEA,RY,RH,PALMS,LAMPS,NPC,BUS,busPos,drawStatic,GEN},prog);await prog(100);
 setTimeout(()=>{$('#load').classList.add('hide');showTitle()},200);requestAnimationFrame(loop)}catch(e){console.error(e);$('#lmsg').textContent='Could not start 3D: '+e.message+'. Try another browser or enable WebGL.'}}
addEventListener('visibilitychange',()=>document.hidden&&S&&S.look&&save());
// test/debug hooks
window.G={get S(){return S},adv,blackout,streetEvent,interact,openPhone,R,
 tp:id=>{if(IN)leaveInterior(true);const d=BY[id].door;S.p.x=d.x;S.p.y=d.y+10},get near(){return near&&near.id},get nearAct(){return nearAct&&nearAct.act.l},get IN(){return IN&&IN.b.id},get DEAD(){return DEAD},B:BY,BUS,
 setHour:h=>{S.t=Math.floor(S.t/1440)*1440+h*60+(h*60<S.t%1440?1440:0);S.lh=Math.floor(S.t/60)},
 enter:id=>{if(IN)leaveInterior(true);const d=BY[id].door;S.p.x=d.x;S.p.y=d.y+10;near=BY[id];interact()},
 goAct:sub=>{if(!IN)return false;const a=IN.acts.find(a=>a.act.l.includes(sub));if(!a)return false;const dx=-a.x,dz=IN.sp.d/2-1.2-a.z,m=Math.hypot(dx,dz)||1,k=Math.min(a.r*.55,m);IN.p.x=a.x+dx/m*k;IN.p.z=a.z+dz/m*k;return true},dbg:()=>({uiFree:uiFree(),fading,modal:vis('#modal'),phone:vis('#phone'),death:vis('#death'),IN:IN&&IN.b.id,p:IN&&IN.p,na:nearAct&&nearAct.act.l}),
 danfo:()=>{const v=BUS.find(v=>v.h&&!v.ok&&v.lane===0);S.p.x=600;S.p.y=RY+RH*.27;v.x=S.p.x-Math.sign(v.base||v.sp)*260;v.cur=Math.abs(v.base||v.sp);return true},
 get fps(){return fpsN},STORY,AU,storyFlag:(k,v=1)=>{S.story.F[k]=v;STORY.check()},setCh:n=>{S.story.ch=n;S.story.s0=S.shifts;STORY.check()},ending:k=>STORY.ending(k),info:()=>R.info()};
boot();
