// Naija Republic v5 — open-world Lagos life-sim. Three.js via importmap, no build step.
import {R,K,MODELS} from './r3d.js?v=10';
import {makeNet} from './online.js?v=10';
import {makeAudio} from './audio.js?v=10';
import {makeStory} from './story.js?v=10';
import * as CT from './city.js?v=10';
const $=s=>document.querySelector(s);
const cv=$('#cv');
const SAVE='sapa_world_v5',MAXM=1e9;
const {WW,WH,B,BY,AREAS,blocked,water,PARKS,BRT,JETTIES,HUBS}=CT;
const SET=Object.assign({q:innerWidth<760?'med':'high',snd:1,mus:1,lang:'en',vm:.8,vs:.8,va:.5},(()=>{try{return JSON.parse(localStorage.getItem('sapa_settings'))||{}}catch(e){return{}}})());
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

// ---------- World data (map lives in city.js) ----------
const areaI=()=>CT.areaAt(S.p.x,S.p.y),areaName=i=>AREAS[i].n;
const CARS=[{id:'corolla',n:['Tokunbo Corolla','Tokunbo Corolla'],p:850000,v:22,a:4.2,c:'#e53935'},{id:'jeep',n:['Big Boy Jeep','Big Boy Jeep'],p:2400000,v:28,a:5.4,c:'#212121'}];
const outP=(b,k=20)=>({x:b.door.x+b.out[0]*k,y:b.door.y+b.out[1]*k});
const HOMES=[{n:['Face-me-I-face-you room','Face-me-I-face-you'],rent:10000,fee:0,b:'room',sleep:.7},{n:['Self-contain','Self-contain'],rent:35000,fee:150000,b:'room',sleep:.9,rq:8},{n:['Lekki flat','Lekki flat'],rent:120000,fee:900000,b:'flat',sleep:1,rq:30}];
const CAR={
 tech:{loc:'tech',em:'💻',n:['Tech','Tech'],t:[['Intern','Intern'],['Junior Dev','Junior Dev'],['Senior Dev','Senior Dev'],['CTO','Oga CTO']],pay:[8000,18000,35000,70000],hrs:[8,18],tasks:[['Fix bug','Fix bug','🐛'],['Push code','Push code','🚀'],['Reply Slack','Answer Slack','💬'],['Write test','Write test','🧪'],['Deploy','Deploy am','☁️']]},
 bank:{loc:'bank',em:'🏦',n:['Banking','Banking'],t:[['Teller','Teller'],['Account Officer','Account Officer'],['Branch Manager','Branch Manager'],['MD','Oga MD']],pay:[10000,20000,40000,80000],hrs:[8,17],tasks:[['Count cash','Count money','💵'],['Open account','Open account','🧾'],['Stop fraud','Stop 419','🚨'],['Call customer','Call customer','📞'],['Approve loan','Approve loan','✅']]},
 trade:{loc:'market',em:'🛍️',n:['Trading','Trading'],t:[['Hawker','Hawker'],['Stall Owner','Shop Owner'],['Wholesaler','Wholesaler'],['Importer','Big Importer']],pay:[6000,15000,30000,65000],hrs:[7,19],tasks:[['Price goods','Price am','🏷️'],['Pack goods','Pack market','📦'],['Collect cash','Collect money','💰'],['Call buyers','Shout for customer','📣'],['Check stock','Check stock','📋']]},
 fix:{loc:'cvillage',em:'📱',n:['Phone Repair','Phone Repair'],t:[['Apprentice','Apprentice'],['Repairer','Repairer'],['Shop Owner','Shop Owner'],['Phone Plug','Phone Plug']],pay:[7000,16000,32000,60000],hrs:[8,19],tasks:[['Change screen','Change screen','📱'],['Flash phone','Flash phone','⚡'],['New battery','New battery','🔋'],['Fix charging port','Fix port','🔌']]},
 ent:{loc:'studio',em:'🎤',n:['Entertainment','Entertainment'],t:[['Hype Man','Hype Man'],['Skit Maker','Skit Maker'],['DJ','DJ'],['Superstar','Superstar']],pay:[7000,16000,40000,90000],hrs:[12,23],tasks:[['Drop beat','Drop beat','🎧'],['Shoot skit','Shoot skit','🎬'],['Hype crowd','Hype crowd','🙌'],['Post reel','Post reel','📱'],['Edit video','Edit video','✂️']]}};
const XPN=[0,10,25,50],RQN=[0,10,25,45];
const GOODS=[['pepper','🌶️',['Pepper basket','Basket of pepper'],3000],['phone','🔌',['Phone accessories','Phone accessories'],6000],['ankara','👗',['Ankara bundle','Ankara bundle'],9000],['rice','🍚',['Bag of rice','Bag of rice'],60000]];
const MKF={market:[1.12,1.15,.85,.9],omarket:[.85,.82,1.12,1.06]};
const goodPrice=(i,mk)=>Math.round(GOODS[i][3]*(0.75+0.5*hash(day()*7+i))*((MKF[mk]||[1,1,1,1])[i])/50)*50;

// ---------- State ----------
function fresh(look,bg){return{v:5,wx:{k:'sun',until:1440*0+480+240},myCar:null,gps:null,deaths:0,tut:0,lang:(S&&S.lang)||'en',look,money:bg==='nepo'?500000:50000,debt:bg==='nepo'?0:100000,save:0,energy:90,hunger:80,peace:70,respect:bg==='nepo'?12:2,
 t:7*60,lh:7,p:{x:BY.room.door.x,y:BY.room.door.y+20,dir:0},home:0,homeless:false,rentDue:8,fuel:0,bo:0,boEnd:0,car:{tech:{lv:0,xp:0},bank:{lv:0,xp:0},trade:{lv:0,xp:0},ent:{lv:0,xp:0},fix:{lv:0,xp:0}},inv:[0,0,0,0],bg,shifts:0,log:[]}}
const day=()=>S?Math.floor(S.t/1440)+1:1;
const hour=()=>S?(S.t/60)%24:12;
function fix(){if(!S)return;['money','debt','save'].forEach(k=>{if(!okNum(S[k]))S[k]=0;S[k]=Math.round(cl(S[k],0,MAXM))});
 ['energy','hunger','peace','respect'].forEach(k=>{if(!okNum(S[k]))S[k]=50;S[k]=cl(S[k],0,100)});
 S.deaths=Math.max(0,S.deaths|0);S.tut=S.tut|0;S.fuel=cl(okNum(S.fuel)?S.fuel:0,0,20);S.home=cl(S.home|0,0,2);S.inv=(Array.isArray(S.inv)?S.inv:[]).slice(0,4).map(v=>cl(v|0,0,10));while(S.inv.length<4)S.inv.push(0);
 if(!okNum(S.t)||S.t<0)S.t=420;for(const k in CAR){const c=S.car[k]||(S.car[k]={lv:0,xp:0});c.lv=cl(c.lv|0,0,3);c.xp=cl(c.xp|0,0,999)}
 if(!S.wx||typeof S.wx!=='object')S.wx={k:'sun',until:0};if(S.myCar){const c=S.myCar;if(!CARS.some(q=>q.id===c.m)||!okNum(c.x)||!okNum(c.y))S.myCar=null;else{c.fuel=cl(okNum(c.fuel)?c.fuel:0,0,50);c.hp=cl(okNum(c.hp)?c.hp:100,0,100);c.h=okNum(c.h)?c.h:0}}
 if(S.gps&&!(okNum(S.gps.x)&&okNum(S.gps.y)))S.gps=null;
 if(!okNum(S.p.x)||!okNum(S.p.y)||blocked(S.p.x,S.p.y)){S.p.x=BY.room.door.x;S.p.y=BY.room.door.y+20}}
// all money flows through these two
function pay(n,tag){if(!okNum(n)||n<0||n>MAXM)return false;n=Math.round(n);if(S.money<n)return false;S.money-=n;fix();if(S.online&&NET&&n>0){if(tag&&tag.startsWith('food:'))NET.buy(tag.slice(5));else NET.spend(n,tag||'misc')}return true}
function earn(n,tag){if(!okNum(n)||n<0)return;if(S.online){if(tag&&tag.startsWith('job:')){const [,k,sc]=tag.split(':');NET.job(k,+sc)}else if(n>0)toast(tr('Online prototype: only job pay is credited by the server','Online test: na only work money server dey pay'));return}S.money=Math.min(MAXM,S.money+Math.round(Math.min(n,5e6)));fix()}
function stat(k,d){if(okNum(d))S[k]=cl(S[k]+d,0,100)}
function save(){if(S&&S.look&&!S.online)try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&s.v===5&&s.look&&s.p&&s.car){S=s;fix();return true}}catch(e){}
 for(const [k,v] of [['sapa_world_v3',3],['sapa_world_v2',2]])try{const s=JSON.parse(localStorage.getItem(k));if(s&&s.v===v&&s.look&&s.p&&s.car){if(v===2){s.deaths=0;s.tut=0}s.v=5;S=s;S.p={x:0,y:0,dir:0};fix();
  const h=HOMES[S.home],b=BY[(h&&!S.homeless)?h.b:'room'],o=outP(b);S.p.x=o.x;S.p.y=o.y;save();setTimeout(()=>toast(tr('Your old save moved into the new open-world Lagos ✅','We carry your old save enter the new big Lagos ✅')),1500);return true}}catch(e){}return false}
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
const GEN=B.filter(b=>b.gen).map(b=>({x:b.door.x,y:b.door.y}));
const genOn=()=>S&&S.genT>S.t;

// ---------- Audio (audio.js) ----------
const AU=makeAudio(SET);
const _unl=()=>{AU.init();sndBan()};['pointerdown','pointerup','touchend','click','keydown'].forEach(e=>addEventListener(e,_unl,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AU.ctx&&AU.ctx.state!=='running')try{AU.ctx.resume()}catch(e){}});
function musBtn(){const b=document.getElementById('musBtn');if(!b)return;const on=SET.snd&&SET.mus!==0;b.textContent=on?'🎵':'🔇';b.classList.toggle('off',!on);b.title=on?'Music on (tap to turn off)':'Music off (tap to turn on)'}
{const b=document.getElementById('musBtn');if(b){b.addEventListener('click',e=>{e.stopPropagation();AU.init();if(!SET.snd){SET.snd=1;SET.mus=1}else SET.mus=SET.mus===0?1:0;saveSet();AU.vol();musBtn();toast&&toast(SET.mus?'🎵 Music on':'🔇 Music off')});musBtn()}}
function sndBan(){const b=document.getElementById('sndBan');if(!b)return;const ok=AU.ctx&&AU.ctx.state==='running';b.classList.toggle('hide',!!ok||!SET.snd)}
setInterval(sndBan,1000);

// ---------- Speech bubbles ----------
const BUB=[];
function say(txt,x,y,z,dur=3){if(BUB.length>5){BUB[0].el.remove();BUB.shift()}const el=document.createElement('div');el.className='bub';el.textContent=txt;$('#bubs').appendChild(el);BUB.push({el,x,y,z,t:dur})}
function bubTick(dt){for(let i=BUB.length-1;i>=0;i--){const b=BUB[i];b.t-=dt;const s=R.screen(b.x,b.y,b.z);if(b.t<=0){b.el.remove();BUB.splice(i,1);continue}b.el.style.display=s.vis?'block':'none';b.el.style.transform=`translate(${s.x}px,${s.y}px) translate(-50%,-100%)`;b.el.style.opacity=Math.min(1,b.t*2)}}
const CHAT=[['How far, my guy?','How far, my guy?'],['Sapa will not catch me this year!','Sapa no go catch me this year!'],['NEPA took the light again o','NEPA don take light again o'],['Excuse me, I am rushing!','Abeg shift, I dey rush!'],['This traffic is something else','This traffic na wa o'],['Who has a charger?','Who get charger?'],['Cold pure water! ₦50!','Pure water! Cold one! ₦50!'],['God is running Lagos','Na God dey run Lagos'],['Watch out for danfo o!','Shine your eye for danfo o!'],['Japa or stay? Hmm.','Japa or stay? Hmm.']];
const COND=[['Oshodi! Oshodi! Enter with your change!','Oshodi! Oshodi! Enter with your change!'],['Yaba! Ikeja! CMS! Wole wole!','Yaba! Ikeja! CMS! Wole wole!'],['Obalende! VI! Lekki! One chance!','Obalende! VI! Lekki! One chance remain!'],['CMS! Obalende! One more chance!','CMS! Obalende! One chance remain!'],['Lekki! Ajah! Move, move!','Lekki! Ajah! Wole, wole!']];

// ---------- Input ----------
const keys={};let joy=null,near=null,nearAct=null;const ptrs=new Map();let pinch=0;
const touchy=('ontouchstart' in window)||matchMedia('(pointer:coarse)').matches;
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();keys[k]=1;if((k==='e'||k===' '||k==='enter')&&uiFree()&&(near||nearAct)){e.preventDefault();interact()}if(k==='p'&&uiFree())openPhone();if(k==='escape'){closeModal();closePhone();closeMap()}if(k==='m'&&S&&S.look&&!IN&&!DEAD){vis('#map')?closeMap():(uiFree()&&openMap())}if(k==='f'&&uiFree()&&(DRV||(near&&near.kind==='car')))carToggle();if(k==='h'&&DRV)AU.horn(1,[S.myCar.x*K,1,S.myCar.y*K]);if(k==='t'&&uiFree()&&!IN)hailP()
 if(k==='q')R.cam.yaw+=.3;if(k==='r')R.cam.yaw-=.3});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
const jEl=$('#joy'),jK=jEl.firstElementChild;
// v6 controls: tap/click-to-move (default), press-and-hold or drag = walk toward finger, two-finger / right-edge / mouse drag = camera.
// Classic virtual joystick is optional (Settings -> Controls).
let MT=null,HOLD=null;const useJoy=()=>!!SET.joy;
function camDrag(p,e){R.cam.yaw-=(e.clientX-p.x)*.008;R.cam.pitch=cl(R.cam.pitch+(e.clientY-p.y)*.005,.1,1.3)}
cv.addEventListener('pointerdown',e=>{if(!uiFree())return;try{cv.setPointerCapture(e.pointerId)}catch(_){}
 const isT=e.pointerType==='touch'||(e.pointerType!=='mouse'&&touchy);
 if(useJoy()&&isT&&e.clientX<innerWidth*.5&&!joy){joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};jEl.style.display='block';jEl.style.left=e.clientX-60+'px';jEl.style.top=e.clientY-60+'px';jK.style.transform='';return}
 const p={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),isT,cam:(!isT&&e.button===2)||(isT&&e.clientX>innerWidth*.88)||useJoy(),mv:0};ptrs.set(e.pointerId,p);
 if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);HOLD=null;for(const q of ptrs.values())q.multi=1}else if(isT&&!p.cam)HOLD={id:e.pointerId,p,on:0}});
cv.addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){let dx=e.clientX-joy.x,dy=e.clientY-joy.y;const m=Math.hypot(dx,dy),mx=45;if(m>mx){dx*=mx/m;dy*=mx/m}joy.dx=dx/mx;joy.dy=dy/mx;jK.style.transform=`translate(${dx}px,${dy}px)`;return}
 const p=ptrs.get(e.pointerId);if(!p)return;const moved=Math.hypot(e.clientX-p.sx,e.clientY-p.sy);if(moved>12)p.mv=1;
 if(ptrs.size===2){const [a,b]=[...ptrs.values()];const ox=p.x;p.x=e.clientX;p.y=e.clientY;const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0)R.cam.dist=cl(R.cam.dist*pinch/d,4,24);pinch=d;R.cam.yaw-=(e.clientX-ox)*.004;return}
 if(p.cam||(!p.isT&&e.buttons&&p.mv)){p.cam=1;camDrag(p,e)}else if(HOLD&&HOLD.id===e.pointerId&&p.mv){HOLD.on=1;MT=null;R.setTap(null)}
 p.x=e.clientX;p.y=e.clientY});
const pEnd=e=>{if(joy&&e.pointerId===joy.id){joy=null;jEl.style.display='none'}const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);pinch=0;
 const wasHold=HOLD&&HOLD.id===e.pointerId&&HOLD.on;if(HOLD&&HOLD.id===e.pointerId)HOLD=null;
 if(e.type==='pointerup'&&p&&!p.mv&&!p.multi&&!wasHold&&!(p.cam&&!p.isT&&e.button===2)&&performance.now()-p.t<450&&uiFree()&&!useJoy())tapAt(e.clientX,e.clientY)};
cv.addEventListener('pointerup',pEnd);cv.addEventListener('pointercancel',pEnd);
// tap: walk to ground point; if it is on/near a door, car or interior station, walk there then interact
function tapAt(cx,cy){if(DRV||RIDE||DEAD)return;const g=R.pick(cx,cy);if(!g)return;let tgt=null,x,y;
 if(IN){x=g.x;y=g.z;let bd=1.6;for(const a of IN.acts){const d=Math.hypot(a.x-x,a.z-y);if(d<Math.max(bd,a.r*.8)){bd=d;tgt=a}}if(tgt){x=tgt.x;y=tgt.z}}
 else{x=g.x/K;y=g.z/K;let bd=70;for(const b of B){const d=Math.hypot(b.door.x-x,b.door.y-y);if(d<bd){bd=d;tgt=b}}
  if(S.myCar){const d=Math.hypot(S.myCar.x-x,S.myCar.y-y);if(d<60&&(!tgt||d<bd))tgt={id:'mycar',door:{x:S.myCar.x,y:S.myCar.y}}}if(tgt){x=tgt.door.x;y=tgt.door.y}}
 if(tgt&&(IN?nearAct===tgt:(near&&near.id===tgt.id))){MT=null;R.setTap(null);interact();return}
 MT={x,y,tgt,t:0,best:1e9,bt:0,inn:!!IN};R.setTap(IN?{x,z:y}:{x:x*K,z:y*K})}
// convert a world-space direction (x,z) into camera-relative stick input
function dirToInput(fx,fz){const yaw=R.cam.yaw,c=Math.cos(yaw),s=Math.sin(yaw);return [fx*c-fz*s,fx*s+fz*c]}
function autoInput(dt){if(HOLD){const p=HOLD.p;if(!HOLD.on&&performance.now()-p.t>260){HOLD.on=1;MT=null;R.setTap(null)}
  if(HOLD.on){const P=IN?{x:IN.p.x,z:IN.p.z}:{x:S.p.x*K,z:S.p.y*K},sc=R.screen(P.x,1,P.z);let dx=p.x-sc.x,dy=p.y-sc.y;const m=Math.hypot(dx,dy);if(m<18)return null;return [dx/m,dy/m]}}
 if(MT&&MT.inn!==!!IN){MT=null;R.setTap(null)}if(!MT)return null;const px=IN?IN.p.x:S.p.x,py=IN?IN.p.z:S.p.y,u=IN?1:1/K,dx=MT.x-px,dy=MT.y-py,d=Math.hypot(dx,dy);
 const tg=MT.tgt,arr=tg?(IN?nearAct===tg:(near&&near.id===tg.id&&d<45)):d<(IN?.35:12);
 if(arr||d<(IN?.25:8)){const t=MT.tgt;MT=null;R.setTap(null);if(t&&(IN?nearAct===t:(near&&near.id===t.id)))interact();return null}
 MT.t+=dt;if(d<MT.best-(IN?.2:4)){MT.best=d;MT.bt=MT.t}if(MT.t-MT.bt>2.2){MT=null;R.setTap(null);return null}
 // simple steering: probe ahead and swing left/right around obstacles
 let fx=dx/d,fz=dy/d;const look=IN?.6:14,blk=IN?(x,z)=>{const sw=IN.sp.w/2-.35,sd=IN.sp.d/2-.35;return Math.abs(x)>sw||Math.abs(z)>sd||IN.cols.some(c=>Math.abs(x-c.x)<c.hw&&Math.abs(z-c.z)<c.hd)}:(x,y)=>blocked(x,y);
 if(blk(px+fx*look,py+fz*look)){const a0=Math.atan2(fz,fx);MT.side=MT.side||1;let ok=0;for(const da of [.5,1,1.5,2.1]){for(const sg of [MT.side,-MT.side]){const a=a0+da*sg,ax=Math.cos(a),az=Math.sin(a);if(!blk(px+ax*look,py+az*look)){fx=ax;fz=az;MT.side=sg;ok=1;break}}if(ok)break}}
 return dirToInput(fx,fz)}
cv.addEventListener('wheel',e=>{e.preventDefault();R.cam.dist=cl(R.cam.dist*(1+e.deltaY*.001),4,24)},{passive:false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
const vis=id=>!$(id).classList.contains('hide');
const uiFree=()=>S&&S.look&&!vis('#map')&&!vis('#modal')&&!vis('#phone')&&!vis('#creator')&&!vis('#title')&&!DEAD&&!fading&&!vis('#death')&&!STORY.dlgOpen();

// ---------- Update ----------
let evT=45,lastDist=-1,saveT=0,tm=0,IN=null,DEAD=null,fading=false,chatT=3,condT=2,hawkT=4;const PR={ry:0,ph:0,moving:false,veh:0};
let RIDE=null,DRV=null,SPR=false;const WX={rain:0,haze:0,wet:0,flash:0};const DP={};
function worldTick(dt){if(!S||!S.look){CT.simTick(dt,{p:{x:-1e7,y:-1e7},foot:false,hour:16.5,wet:0});CT.hawkTick(dt);return}
 const live=!IN&&!DEAD&&!vis('#title');
 CT.simTick(dt,{p:S.p,foot:live&&!DRV&&!RIDE,car:DRV&&S.myCar?{x:S.myCar.x,y:S.myCar.y,sp:DRV.v*20,h:S.myCar.h}:null,hour:hour(),wet:WX.wet,
  onHit:v=>die(v),onHonk:v=>{AU.horn(1,[v.x*K,1.2,v.y*K]);if(Math.random()<.5)say(v.t==='okada'||v.t==='keke'?tr('Pim pim! Clear the road!','Pim pim! Comot for road!'):tr('PAAAP! Are you mad? Move!','PAAAP! You dey craze? Shift!'),v.x*K,2.8,v.y*K,1.8)},
  push:(v,lat)=>{const s=Math.sign(lat)||1,nx=S.p.x-v.dy*s*7,ny=S.p.y+v.dx*s*7;if(!blocked(nx,ny)){S.p.x=nx;S.p.y=ny}}});CT.hawkTick(dt)}
function lerpA(a,b,t){let d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*Math.min(1,t)}
// ----- weather: sun / harmattan haze / rain with puddles & flooding -----
function weatherTick(dt){const w=S.wx;if(S.t>=w.until){const r=Math.random(),h=hour();w.k=r<.3?'rain':r<.48?'haze':'sun';if(w.k==='haze'&&h>14)w.k='sun';w.until=S.t+120+Math.random()*300;if(w.k==='rain')toast(tr('🌧️ Rain is coming! Roads will flood — find cover or take a ride.','🌧️ Rain don come! Road go flood — find shade or enter motor.'));if(w.k==='haze')toast(tr('🌫️ Harmattan haze — dusty, cool and hard to see far.','🌫️ Harmattan don land — dust everywhere.'))}
 const tr2=w.k==='rain'?1:0,th=w.k==='haze'?1:0;WX.rain+=(tr2-WX.rain)*Math.min(1,dt*.25);WX.haze+=(th-WX.haze)*Math.min(1,dt*.2);
 if(WX.rain>.3)WX.wet=Math.min(1,WX.wet+dt*.035*WX.rain);else WX.wet=Math.max(0,WX.wet-dt*.006);
 WX.flash=Math.max(0,WX.flash-dt*4);if(WX.rain>.75&&Math.random()<dt*.05&&!IN){WX.flash=1;setTimeout(()=>AU.thunder&&AU.thunder(),400+Math.random()*900)}}
function setWx(k){S.wx={k,until:S.t+240};if(k==='rain'){WX.rain=.9;WX.wet=.8}else if(k==='haze'){WX.haze=.9;WX.rain=0}else{WX.rain=0;WX.haze=0;WX.wet=0}}
function inputVec(dt){let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(joy&&Math.hypot(joy.dx,joy.dy)>.15){mx=joy.dx;my=joy.dy}
 const gp=navigator.getGamepads&&[...navigator.getGamepads()].find(Boolean);if(gp){const a=gp.axes;if(Math.hypot(a[0],a[1])>.2){mx=a[0];my=a[1]}if(Math.abs(a[2])>.2)R.cam.yaw-=a[2]*dt*2.5;if(Math.abs(a[3])>.2)R.cam.pitch=cl(R.cam.pitch+a[3]*dt*1.5,.1,1.3);if(gp.buttons[0]&&gp.buttons[0].pressed&&!gp._a&&(near||nearAct))interact();gp._a=gp.buttons[0]&&gp.buttons[0].pressed}
 if(Math.hypot(mx,my)>.15){if(MT){MT=null;R.setTap(null)}}else if(S&&S.look&&!DRV&&!RIDE){const ai=autoInput(dt);if(ai){mx=ai[0];my=ai[1]}}
 return [mx,my]}
function update(dt){
 if(DEAD){DEAD.t+=dt;if(DEAD.t>1.4&&!DEAD.shown){DEAD.shown=1;showDeath()}return}
 if(!uiFree())return;
 S.t+=dt*1.5;hourTicks();weatherTick(dt);
 let [mx,my]=inputVec(dt);
 if(RIDE){rideTick(dt);near=null;nearAct=null;saveT+=dt;return}
 if(DRV){driveTick(dt,mx,my);near=null;nearAct=null;saveT+=dt;if(saveT>8){saveT=0;save()}return}
 const m=Math.hypot(mx,my);PR.moving=false;PR.veh=0;
 if(m>.1){if(m>1){mx/=m;my/=m}const yaw=R.cam.yaw,fx=mx*Math.cos(yaw)+my*Math.sin(yaw),fz=-mx*Math.sin(yaw)+my*Math.cos(yaw);PR.ry=lerpA(PR.ry,Math.atan2(fx,fz),dt*12);PR.moving=true;
  const sprint=(keys.shift||SPR)&&S.energy>8,walk=keys.alt||keys.c||(joy&&m<.55),gait=sprint?2:walk?0:1,flood=!IN&&CT.inFlood(S.p.x,S.p.y)&&WX.wet>.6;PR.gait=gait;
  const _st=Math.floor(PR.ph/Math.PI);PR.ph+=dt*[6.5,10.5,14.5][gait];if(Math.floor(PR.ph/Math.PI)!==_st){AU.step();if(flood&&Math.random()<.5)AU.noise(.12,.12,1400)}
  if(IN){const sp=(S.energy<10?2.4:[1.8,3.6,4.6][gait])*dt,p=IN.p,sw=IN.sp.w/2-.35,sd=IN.sp.d/2-.35;const bl=(x,z)=>Math.abs(x)>sw||Math.abs(z)>sd||IN.cols.some(c=>Math.abs(x-c.x)<c.hw&&Math.abs(z-c.z)<c.hd);
   const nx=p.x+fx*sp,nz=p.z+fz*sp;if(!bl(nx,p.z))p.x=nx;if(!bl(p.x,nz))p.z=nz}
  else{const ms=S.energy<10?2.2:[1.7,3.6,6.3][gait],sp=ms*20*dt*(flood?.55:1),p=S.p;const nx=p.x+fx*sp,ny=p.y+fz*sp;if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny;S.walked=(S.walked||0)+sp;
   if(gait===2)stat('energy',-dt*.22);
   evT-=dt;if(evT<=0){evT=60+Math.random()*60;if(Math.random()<.5){streetEvent();return}}}}
 near=null;nearAct=null;
 if(IN){let bd=9;for(const a of IN.acts){const d=Math.hypot(a.x-IN.p.x,a.z-IN.p.z);if(d<a.r&&d/a.r<bd){bd=d/a.r;nearAct=a}}
  chatT-=dt;if(chatT<=0&&IN.sp.npcs.length){chatT=5+Math.random()*4;const n=IN.sp.npcs[Math.floor(Math.random()*IN.sp.npcs.length)];if(n.say)say(L(n.say),n.x,2.3,n.z,3)}}
 else{let bd=52;for(const b of B){const d=Math.hypot(b.door.x-S.p.x,b.door.y-S.p.y);if(d<bd){bd=d;near=b}}
  if(S.myCar&&!near){const c=S.myCar,d=Math.hypot(c.x-S.p.x,c.y-S.p.y);if(d<80)near={id:'mycar',kind:'car',door:{x:c.x,y:c.y},lab:[tr('Your car','Your motor'),tr('Your car','Your motor')]}}
  if(S.gps&&Math.hypot(S.gps.x-S.p.x,S.gps.y-S.p.y)<500){S.gps=null;toast(tr('📍 You have arrived!','📍 You don reach!'))}
  const di=areaI();if(di!==lastDist){if(lastDist>=0)toast('📍 '+areaName(di));lastDist=di;STORY.ev('area',AREAS[di].id)}
  chatT-=dt;if(chatT<=0){chatT=3.5+Math.random()*3;let bn=null,bdd=420;for(const n of CT.PEDS){if(n.hid)continue;const d=Math.hypot(n.x-S.p.x,n.y-S.p.y);if(d<bdd&&Math.random()<.6){bdd=d;bn=n}}if(bn)say(L(CHAT[Math.floor(Math.random()*CHAT.length)]),bn.x*K,2.3,bn.y*K,3)}
  hawkT-=dt;if(hawkT<=0){hawkT=3+Math.random()*3;for(const w of CT.HAWK)if(w.on&&Math.hypot(w.x-S.p.x,w.y-S.p.y)<500){say(w.wares,w.x*K,2.4,w.y*K,2.6);AU.shout&&AU.shout([w.x*K,1.6,w.y*K]);break}}
  condT-=dt;if(condT<=0){condT=4.5;PARKS.forEach((id,i)=>{const b=BY[id],o=outP(b,60);if(Math.hypot(o.x-S.p.x,o.y-S.p.y)<500){say(L(COND[i]),o.x*K,2.6,o.y*K,3);AU.shout([o.x*K,1.6,o.y*K])}})}}
 if(S.energy<=0)faint();
 saveT+=dt;if(saveT>8){saveT=0;save()}}
// ----- own car: simple arcade physics -----
function carModel(){return CARS.find(q=>q.id===(S.myCar&&S.myCar.m))||CARS[0]}
function carToggle(){if(RIDE||IN)return;if(DRV){const c=S.myCar,rx=-Math.cos(c.h),ry=Math.sin(c.h);let ok=false;for(const s of [-1,1,0]){const x=c.x+(s?rx*s*48:-Math.sin(c.h)*80),y=c.y+(s?ry*s*48:-Math.cos(c.h)*80);if(!blocked(x,y)){S.p.x=x;S.p.y=y;ok=true;break}}
  if(!ok&&Math.abs(DRV.v)<.5){S.p.x=c.x;S.p.y=c.y}if(!ok&&Math.abs(DRV.v)>=.5)return toast(tr('Stop the car first.','Stop the motor first.'));DRV=null;PR.veh=0;$('#drive').classList.add('hide');AU.setLoop('myCar',false);AU.door();save();hud();return}
 const c=S.myCar;if(!c)return;if(Math.hypot(c.x-S.p.x,c.y-S.p.y)>90)return toast(tr('Walk to your car first.','Waka reach your motor first.'));if(c.hp<=0)return toast(tr('Your car is wrecked. Tow it at Gidi Motors (Ikeja).','Your motor don scatter. Tow am for Gidi Motors (Ikeja).'));
 DRV={v:0};PR.veh=1;$('#drive').classList.remove('hide');AU.door();R.cam.pitch=.32;R.cam.dist=10;toast(touchy?tr('🚗 ⏫ gas · ⏬ brake/reverse · ◀ ▶ steer · 🚪 exit','🚗 ⏫ gas · ⏬ brake · ◀ ▶ steer · 🚪 comot'):tr('🚗 W/S gas & brake · A/D steer · Space handbrake · H horn · F exit','🚗 W/S gas & brake · A/D steer · Space brake · H horn · F comot'));STORY.ev('drive')}
function driveTick(dt,mx,my){const c=S.myCar,M=carModel();let thr=(keys.w||keys.arrowup||DP.gas)?1:0,rev=(keys.s||keys.arrowdown||DP.brake)?1:0,steer=((keys.d||keys.arrowright||DP.right)?1:0)-((keys.a||keys.arrowleft||DP.left)?1:0),hb=keys[' ']?1:0;
 if(joy&&Math.hypot(joy.dx,joy.dy)>.15){steer=joy.dx;thr=Math.max(0,-joy.dy);rev=joy.dy>.35?1:0}
 if(c.fuel<=0&&thr){thr=0;if(!DRV.ft){DRV.ft=1;toast(tr('⛽ Out of fuel! Push to a fuel station… or call Gidi Motors.','⛽ Fuel don finish! Find fuel station.'))}}
 let v=DRV.v;const flood=CT.inFlood(c.x,c.y)&&WX.wet>.6,vmax=M.v*(flood?.4:1)*(WX.wet>.5?.9:1)*(c.hp<30?.6:1);
 if(thr)v+=M.a*thr*dt*(v<0?3:1)*(1-Math.max(0,v)/vmax*.6);if(rev){if(v>.3)v-=10*dt;else v-=2.6*dt}if(hb)v-=Math.sign(v)*Math.min(Math.abs(v),12*dt);
 if(!thr&&!rev)v-=Math.sign(v)*Math.min(Math.abs(v),(.5+Math.abs(v)*.08)*dt);v=cl(v,-5,vmax);
 const turn=steer*1.7*cl(v/6,-1,1)*(1-Math.min(.45,Math.abs(v)/60));c.h-=turn*dt;
 const sp=v*20*dt,fx=Math.sin(c.h),fy=Math.cos(c.h),nx=c.x+fx*sp,ny=c.y+fy*sp,rx=-fy,ry=fx;
 const hitW=[[44,18],[44,-18],[-44,18],[-44,-18],[46,0]].some(([a,b])=>CT.blockedCar(nx+fx*a+rx*b,ny+fy*a+ry*b));
 let hitV=null;for(const o of CT.VEH){if(!o.act)continue;const dx=o.x-nx,dy=o.y-ny;if(Math.abs(dx)>140||Math.abs(dy)>140)continue;const al=dx*fx+dy*fy,lt=dx*rx+dy*ry;if(Math.abs(al)<44+o.L*.45&&Math.abs(lt)<18+o.W*.45){hitV=o;break}}
 if(hitW||hitV){const rel=hitV?Math.abs(v-(hitV.sp/20)*(hitV.dx*fx+hitV.dy*fy)):Math.abs(v);if(hitV)hitV.sp=0;
  if(rel>14){c.hp=Math.max(0,c.hp-rel*3.5);AU.crash();DRV.v=0;const d={t:'crash',dx:fx,dy:fy};carToggleForce();die(d);return}
  if(rel>2.5){c.hp=Math.max(0,c.hp-rel*1.6);AU.crash&&AU.noise(.35,.5,500);toast(tr(`💥 Kpa! Car damage ${c.hp|0}%`,`💥 Kpa! Motor damage ${c.hp|0}%`));if(hitV)say(tr('Are you blind?! You will pay for this!','You no get eye?! You go pay o!'),hitV.x*K,2.6,hitV.y*K,2.5)}v=-v*.25}
 else{c.x=nx;c.y=ny;c.fuel=Math.max(0,c.fuel-Math.abs(sp)/8000)}
 DRV.v=v;S.p.x=c.x;S.p.y=c.y;PR.ry=c.h;PR.moving=false;PR.veh=1;
 if(!ptrs.size){R.cam.yaw=lerpA(R.cam.yaw,c.h+Math.PI,dt*(v<0?.8:2.4));R.cam.pitch+=(.3-R.cam.pitch)*Math.min(1,dt*2)}
 AU.setLoop('myCar',true,[c.x*K,1,c.y*K],'gen');
 $('#spd').innerHTML=`<b>${Math.round(Math.abs(v)*3.6)}</b> km/h<small>⛽ ${c.fuel.toFixed(1)}L · 🔧 ${c.hp|0}%</small>`;
 const di=areaI();if(di!==lastDist){toast('📍 '+areaName(di));lastDist=di}}
function carToggleForce(){if(!DRV)return;DRV=null;PR.veh=0;$('#drive').classList.add('hide');AU.setLoop('myCar',false)}
// ----- rides: danfo / BRT / keke / okada / Bolt taxi / ferry / canoe -----
const MODE={danfo:{vt:'danfo',v:11,n:['Danfo','Danfo'],em:'🚌'},brt:{vt:'brt',v:12,n:['BRT bus','BRT bus'],em:'🚍'},keke:{vt:'keke',v:8,n:['Keke','Keke'],em:'🛺'},okada:{vt:'okada',v:13,n:['Okada','Okada'],em:'🏍️'},taxi:{vt:'taxi',v:14,n:['Bolt-style taxi','Bolt-style taxi'],em:'🚕'},ferry:{vt:'ferry',v:9,n:['Ferry','Ferry'],em:'⛴️',water:1},canoe:{vt:'canoe',v:3.5,n:['Canoe','Canoe'],em:'🛶',water:1}};
function roadPath(ax,ay,bx,by,avoidBr){const a=CT.nearestNode(ax,ay),b=CT.nearestNode(bx,by),ns=CT.route(a,b,avoidBr);const lane=ns.length>1?CT.EDGES.find(e=>(e.a===ns[0]&&e.b===ns[1])||(e.b===ns[0]&&e.a===ns[1])):null;const P=CT.pathPts(ns,lane?lane.w*.25:60);P.unshift([ax,ay]);P.push([bx,by]);return{P,ns}}
function startRide(mode,o){const M=MODE[mode];closeModal();closePhone();if(DRV)return toast(tr('Park your car first.','Park your motor first.'));let P,ns=null;
 if(M.water)P=o.path;else{const r=roadPath(S.p.x,S.p.y,o.to.x,o.to.y,mode==='keke'||mode==='okada');P=r.P;ns=r.ns}
 const len=CT.plLen(P);RIDE={mode,M,P,ns,d:0,len,sp:M.v*20,to:o.to,toB:o.toB||null,name:o.name,view:0,crash:mode==='okada'&&Math.random()<.07?.35+Math.random()*.5:0,min:o.min||Math.round(6+len/20/9),loop:o.loop,end:o.end,hold:0};
 PR.veh=1;$('#ride').classList.remove('hide');$('#act').classList.add('hide');AU.door();R.cam.pitch=.3;R.cam.dist=mode==='okada'||mode==='keke'?7:10;
 toast(`${M.em} ${L(M.n)} → ${o.name}`);STORY.ev('ride',mode);hud()}
function rideTick(dt){const r=RIDE;let sp=r.sp*(r.skip?6:1);
 // stop at red lights on the road route
 if(r.ns&&!r.skip){let acc=Math.hypot(r.P[1][0]-r.P[0][0],r.P[1][1]-r.P[0][1]);for(let i=1;i<r.P.length-1;i++){const n=CT.NODES[r.ns[i-1]];const ahead=acc-r.d;if(ahead>0&&ahead<20*14){if(n&&n.light&&ahead>20*6){const nx=r.P[i+1][0]-r.P[i][0],ny=r.P[i+1][1]-r.P[i][1],px=r.P[i][0]-r.P[i-1][0],py=r.P[i][1]-r.P[i-1][1];const st=CT.lightState(n,Math.abs(px)>Math.abs(py),CT.SIM.T);if(st!=='g'){sp=Math.min(sp,Math.max(0,(ahead-20*7))*1.4)}}break}acc+=Math.hypot(r.P[i+1][0]-r.P[i][0],r.P[i+1][1]-r.P[i][1])}
  if(CT.SIM.rush&&r.mode!=='okada')sp*=.55}
 r.d=Math.min(r.len,r.d+sp*dt);const q=CT.plAt(r.P,r.d);r.x=q.x;r.y=q.y;r.h=lerpA(r.h==null?q.h:r.h,q.h,dt*5);S.p.x=q.x;S.p.y=q.y;PR.ry=r.h;
 if(!ptrs.size){if(r.view){R.cam.yaw=lerpA(R.cam.yaw,r.h+Math.PI/2,dt*3);R.cam.pitch+=(.06-R.cam.pitch)*Math.min(1,dt*3)}else{R.cam.yaw=lerpA(R.cam.yaw,r.h+Math.PI,dt*2);R.cam.pitch+=(.3-R.cam.pitch)*Math.min(1,dt*2)}}
 $('#rtxt').textContent=`${r.M.em} ${L(r.M.n)} → ${r.name} · ${Math.max(0,Math.round((r.len-r.d)/20))}m`;
 r.ct=(r.ct||0)-dt;if(r.ct<=0){r.ct=6+Math.random()*5;const lines=r.mode==='danfo'?[tr('Conductor: "Owa o! Who dey drop for front?"','Conductor: "Owa o! Who dey drop for front?"'),tr('Conductor: "Your change dey with me, no vex!"','Conductor: "Your change dey with me, no vex!"')]:r.mode==='okada'?[tr('Okada man: "Hold me well o!"','Okada man: "Hold me well o!"')]:r.mode==='taxi'?[tr('Driver: "AC is working, oga."','Driver: "AC dey work, oga."')]:r.mode==='ferry'||r.mode==='canoe'?[tr('Boatman: "Wear your life jacket!"','Boatman: "Wear your life jacket!"')]:[tr('Driver: "Next stop!"','Driver: "Next stop!"')];say(lines[Math.floor(Math.random()*lines.length)],q.x*K,3,q.y*K,3)}
 if(r.crash&&r.d>=r.len*r.crash){const d={t:'okadacrash',dx:Math.sin(q.h),dy:Math.cos(q.h)};endRide(true);die(d);return}
 if(r.d>=r.len)endRide()}
function endRide(aborted){const r=RIDE;if(!r)return;RIDE=null;PR.veh=0;$('#ride').classList.add('hide');
 if(!aborted){adv(r.min);stat('energy',r.mode==='danfo'?-4:-1);let p=r.toB?outP(r.toB,26):{x:r.to.x,y:r.to.y};if(blocked(p.x,p.y)){const n=CT.NODES[CT.nearestNode(p.x,p.y)];p={x:n.x+90,y:n.y+90};if(blocked(p.x,p.y))p={x:n.x+40,y:n.y-130}}if(!blocked(p.x,p.y)){S.p.x=p.x;S.p.y=p.y}
  toast('📍 '+r.name);if(r.end)r.end();AU.door()}fix();save();hud()}
$('#rskip').onclick=()=>{if(!RIDE)return;if(S.online){RIDE.skip=1;return}RIDE.d=RIDE.len;rideTick(0)};$('#rview').onclick=()=>{if(RIDE)RIDE.view^=1};
const bindHold=(id,k)=>{const el=$(id);if(!el)return;const on=e=>{e.preventDefault();DP[k]=1},off=e=>{DP[k]=0};el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointerleave',off);el.addEventListener('pointercancel',off)};
bindHold('#dG','gas');bindHold('#dB','brake');bindHold('#dL','left');bindHold('#dR','right');
$('#dX').onclick=()=>carToggle();$('#dH').onclick=()=>{if(S&&S.myCar)AU.horn(1,[S.myCar.x*K,1,S.myCar.y*K])};
$('#runBtn').onclick=()=>{SPR=!SPR;$('#runBtn').classList.toggle('on',SPR);toast(SPR?tr('🏃 Sprint ON (uses energy)','🏃 Run ON (e dey use energy)'):tr('🚶 Sprint off','🚶 Run off'))};
$('#mapBtn').onclick=()=>openMap();$('#hailBtn').onclick=()=>hailP();

// ---------- Death & hospital ----------
function die(v){if(DEAD)return;if(RIDE)endRide(true);carToggleForce();DEAD={t:0,dx:v.dx||0,dz:v.dy||0,by:v.t||'danfo'};AU.crash();closeModal();closePhone();closeMap();joy=null;jEl.style.display='none';$('#act').classList.add('hide');PR.moving=false}
const bill=()=>Math.min(60000,25000+5000*(S.deaths|0));
function showDeath(){const k=DEAD.by,VN={okada:['an okada','Okada'],keke:['a keke','Keke'],danfo:['a danfo','Danfo'],car:['a car','Motor'],brt:['a BRT bus','BRT bus'],taxi:['a taxi','Taxi']},cr=k==='crash'||k==='okadacrash';const d=$('#death');d.classList.remove('hide');
 const msg=k==='crash'?tr('You crashed your car at high speed.','You crash your motor with speed.'):k==='okadacrash'?tr('Your okada skidded and crashed. Helmet saved your life.','Okada don skid and fall. Na helmet save you.'):tr(`You were hit by ${(VN[k]||VN.danfo)[0]}.`,`${(VN[k]||VN.danfo)[1]} don jam you.`);
 d.innerHTML=`<div class="dcard"><div class="em">${cr?'💥🚗':'💥🚌'}</div><h1>${cr?tr('Accident!','Accident!'):tr('You don get jam!','You don get jam!')}</h1><p>${msg}</p>
 <p class="sm">${tr('Times hit so far','How many times you don jam')}: <b>${(S.deaths|0)+1}</b></p>
 <button id="respawn">🏥 ${tr('Wake up at General Hospital','Wake up for General Hospital')}<small>${tr('Bill','Bill')} ${N(bill())} · ${tr('unpaid part goes to debt','wetin remain go enter debt')} · ⚡60</small></button>
 <button id="gover" class="alt">💀 ${tr('Game over — start a new life','Game over — start new life')}</button></div>`;
 $('#respawn').onclick=respawn;$('#gover').onclick=gameOver}
function respawn(){const b=bill(),paid=Math.min(S.money,b);pay(paid);S.debt=Math.min(5e6,S.debt+(b-paid));S.deaths=(S.deaths|0)+1;S.energy=60;stat('peace',-12);adv(6*60);
 const d=outP(BY.hospital,16);S.p.x=d.x;S.p.y=d.y;DEAD=null;$('#death').classList.add('hide');fix();save();hud();toast(tr(`🏥 Doctors patched you up. Bill: ${N(b)}${b>paid?' (part added to debt)':''}`,`🏥 Doctor don patch you. Bill: ${N(b)}${b>paid?' (the rest enter debt)':''}`));AU.door()}
function gameOver(){const d=$('#death');d.innerHTML=`<div class="dcard"><div class="em">🪦</div><h1>${tr('Game over','Game don end')}</h1><p>${S.look.name} · ${tr('Day','Day')} ${day()} · ${N(S.money+S.save-S.debt)} ${tr('net worth','net worth')}</p><button id="again">🔁 ${tr('New character','New person')}</button></div>`;
 $('#again').onclick=()=>{localStorage.removeItem(SAVE);const lang=S.lang;S={lang};DEAD=null;d.classList.add('hide');creator()}}
function hospitalP(b){panel(()=>({em:'🏥',title:L(b.lab),text:tr(`Nurse: "Welcome. You have been brought in ${S.deaths|0} time(s)."`,`Nurse: "You don come here ${S.deaths|0} time(s) o. Shine your eye for road!"`),acts:[
 {l:tr('🩺 Check-up ','🩺 Check-up ')+N(3000),s:'+☮️8 +⚡8',dis:S.money<3000,f:()=>{if(pay(3000)){stat('peace',8);stat('energy',8);adv(30)}}},
 {l:tr('🛏️ Rest in the ward (4h) ','🛏️ Rest for ward (4h) ')+N(5000),s:'+⚡40',dis:S.money<5000,f:()=>{if(pay(5000)){stat('energy',40);adv(240)}}}]}))}

// ---------- Interiors ----------
const NL=(skin,out,hair,body=0)=>({skin,out,hair,body});
function fade(cb){fading=true;const f=$('#fade');f.classList.add('on');setTimeout(()=>{try{cb()}finally{setTimeout(()=>{f.classList.remove('on');fading=false},80)}},360)}
function interact(){AU.click();if(IN){if(nearAct)nearAct.act.f();fix();save();hud();return}if(!near)return;const b=near;
 if(b.kind==='car')return carToggle();if(['park','beach','brt','jetty','boat'].includes(b.kind))return placePanel(b);
 if(b.kind==='club'){const hr=hour();if(!(hr>=21||hr<4)){toast(tr('🚫 Bouncer: "Club opens 9pm. Come back later!"','🚫 Bouncer: "Club never open. Come back 9pm!"'));say(tr('We open 9pm!','We dey open 9pm!'),b.door.x*K,2.6,b.door.y*K,2.5);return}}
 enterBuilding(b)}
function enterBuilding(b){if(DRV)carToggle();AU.door();fade(()=>{const sp=interiorSpec(b);sp.bo=S.bo&&!b.gen&&!genOn();const r=R.enterInterior(sp);IN={b,sp,cols:r.cols,acts:r.acts,p:{x:0,z:sp.d/2-1.3}};PR.ry=Math.PI;R.cam.yaw=0;R.cam.pitch=Math.max(R.cam.pitch,.6);
  R.setInteriorPower(sp.bo,genOn());chatT=1;hud();toast('🚪 '+L(b.lab).split(' (')[0]);STORY.ev('enter',b)})}
function leaveInterior(now){if(!IN)return;const go=()=>{if(!IN)return;R.exitInterior();const d=outP(IN.b,14);S.p.x=d.x;S.p.y=d.y;PR.ry=Math.atan2(IN.b.out[0],IN.b.out[1]);IN=null;nearAct=null;hud()};if(now)go();else{AU.door();fade(go)}}
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
 else if(k==='repair'){const it=[-3.6,0,3.6].map((x,i)=>({t:'counter',x,z:-2.5,w:2.6,c:['#c62828','#1565c0','#2e7d32'][i],act:{l:tr('🔧 Repair phones (work)','🔧 Repair phone (work)'),f:()=>workP(b)},r:1.9}));
  it.push({t:'shelf',x:-4.6,z:-4.1},{t:'shelf',x:0,z:-4.1},{t:'shelf',x:4.6,z:-4.1},{t:'counter',x:4.3,z:1.8,w:2.2,c:'#6a1b9a',act:{l:tr('📱 Buy UK-used phone ','📱 Buy UK-used phone ')+N(45000),f:()=>{if(pay(45000,'item:phone')){stat('respect',3);stat('peace',4);toast('📱 +⭐3 +☮️4')}}}});
  sp={w:12,d:9,wall:'#fff3e0',floor:'#cfd8dc',fpat:'tile',items:it,npcs:[{x:-3.6,z:-3.2,look:M('#3b2219','#1565c0',3),say:['Na screen? I go change am in 1 hour!','Na screen? I go change am 1 hour!']},{x:0,z:-3.2,look:M('#7a4b2e','#fdd835',0,1),say:['UK used! Clean! No scratch!','UK used! Clean! No scratch!']},{x:3.6,z:-3.2,look:M('#5a3825','#e53935',1)},{x:-1.5,z:0,ry:Math.PI,look:M('#a0673f','#8e24aa',2),say:['My phone fell inside gutter…','My phone fall inside gutter…']}]}}
 else if(k==='stadium')sp={w:16,d:12,wall:'#1b5e20',floor:'#2e7d32',fpat:'tile',powered:1,lampI:30,items:[{t:'goal',x:0,z:-5.4,act:{l:tr('⚽ Take 5 penalties (−⚡12)','⚽ Shoot 5 penalty (−⚡12)'),f:()=>penalty(b)},r:3.2},{t:'bench',x:-5.5,z:3.8},{t:'bench',x:5.5,z:3.8},
  {t:'counter',x:5.6,z:-.6,w:2.2,c:'#fdd835',act:{l:tr('🎟️ Watch a league match ','🎟️ Watch league match ')+N(3000),f:()=>{if(pay(3000,'fun:match')){stat('peace',15);stat('respect',2);adv(120);toast('⚽ GOOOAL! +☮️15')}}}}],
  npcs:[{x:0,z:-4.9,look:M('#3b2219','#fdd835',1),say:['Keeper: You no fit score me!','Keeper: You no fit score me!']},{x:-5.5,z:3.3,look:M('#7a4b2e','#43a047',3),say:['Up Eagles!!!','Up Eagles!!!']},{x:5.5,z:3.3,look:M('#5a3825','#fff',4,1)}]};
 else if(k==='airport')sp={w:16,d:10,wall:'#eceff1',floor:'#e0e0e0',fpat:'tile',powered:1,lampI:30,items:[{t:'counter',x:-4,z:-3,w:4,c:'#0d47a1',act:{l:tr('🛂 Check-in desk','🛂 Check-in desk'),f:()=>airportP(b)},r:2.6},{t:'board',x:2,z:-4.7},{t:'gate',x:6,z:-1.5},{t:'bench',x:-4,z:1.6},{t:'bench',x:0,z:1.6},{t:'bench',x:4,z:2.6},{t:'plant',x:-7.2,z:-4.2}],
  npcs:[{x:-4,z:-3.7,look:M('#5a3825','#0d47a1',0,1),say:['Passport and ticket, please.','Passport and ticket abeg.']},{x:0,z:1,ry:Math.PI,look:M('#7a4b2e','#fb8c00',2),say:['Toronto, here I come!','Toronto, I dey come!']},{x:6,z:-.6,look:M('#3b2219','#263238',3)}]};
 else if(k==='dealer')sp={w:14,d:10,wall:'#e0f7fa',floor:'#eceff1',fpat:'tile',powered:1,items:[{t:'carshow',x:-3.4,z:-1.4,c:'#e53935',act:{l:tr('🚗 Look at the cars','🚗 Check the motors'),f:()=>dealerP(b)},r:3.2},{t:'carshow',x:3.4,z:-1.4,c:'#212121',act:{l:tr('🚙 Look at the jeep','🚙 Check the jeep'),f:()=>dealerP(b)},r:3.2},{t:'counter',x:0,z:-4,w:3,c:'#263238',act:{l:tr('💼 Sales desk (buy / repair / tow)','💼 Sales desk (buy / repair / tow)'),f:()=>dealerP(b)}}],
  npcs:[{x:0,z:-4.6,look:M('#3b2219','#263238',3,1),say:['Oga, this one is Belgium-clean!','Oga, this one na Belgium-clean!']},{x:-1,z:1.6,ry:Math.PI,look:M('#a0673f','#e53935',1)}]};
 sp.kind=k;sp.title=title;STORY.extra(b,sp);sp.items.push(Object.assign(exit,{x:0,z:sp.d/2-.4,r:1.4}));sp.wall=sp.wall||'#eee';sp.floor=sp.floor||'#999';if(sp.tier==null)sp.tier=1;return sp}
function clubDance(){if(!(S.clubT>S.t))return toast(tr('Pay entry at the bar first.','Pay gate fee for bar first.'));if((S.dances|0)>=3&&S.danceT===S.clubT)return toast(tr('Your legs are done for tonight!','Your leg don tire for tonight!'));if(S.energy<8)return toast(tr('Too tired to dance.','You don tire to dance.'));
 if(S.danceT!==S.clubT){S.danceT=S.clubT;S.dances=0}S.dances++;stat('respect',3);stat('peace',3);stat('energy',-8);adv(20);say(tr(`DJ: Make some noise for ${S.look.name}!`,`DJ: Shout for ${S.look.name}!`),0,2.6,-4.6,3);toast('💃 +⭐3 +☮️3')}

// ---------- Tutorial ----------
const TIPS=[()=>touchy?(SET.joy?tr('👈 Drag the LEFT side to walk. 👉 Drag the RIGHT side to turn the camera. Pinch to zoom.','👈 Drag LEFT side to waka. 👉 Drag RIGHT side to turn camera. Pinch to zoom.'):tr('👆 Tap the ground to walk there (tap a door to go inside). Hold your finger to keep walking that way. Two fingers or the right edge turn the camera; pinch to zoom.','👆 Tap ground to waka go there (tap door to enter). Hold finger to dey waka. Two fingers or right edge turn camera; pinch to zoom.')):tr('WASD / arrows or click the ground to walk (click a door to go in). Drag the mouse to turn the camera, scroll to zoom.','WASD / arrow or click ground to waka. Drag mouse turn camera, scroll to zoom.'),
 ()=>tr('Walk to a door with the yellow arrow and press the button (or E) to go inside.','Waka reach door wey get yellow arrow, press button (or E) enter inside.'),
 ()=>tr('🚌 Danfos and okadas WILL hit you. Cross at the white zebra crossings — drivers stop there.','🚌 Danfo and okada go jam you o! Cross for zebra — dem go stop.'),
 ()=>tr('📱 Your phone has stats, bank, settings and the Sapa Challenge. Pay rent at your room!','📱 Your phone get stats, bank, settings and Sapa Challenge. Pay rent for your room!')];
let tipTm=null;function nextTip(d=1500){clearTimeout(tipTm);if(!S||S.tut>=TIPS.length)return;tipTm=setTimeout(()=>{if(!S||!TIPS[S.tut])return;if(!uiFree()){nextTip(3000);return}$('#tip').innerHTML=`<b>💡 ${tr('Tip','Tip')} ${S.tut+1}/${TIPS.length}</b><p>${TIPS[S.tut]()}</p><button id="tipOk">${tr('Got it','I don hear')}</button>`;$('#tip').classList.remove('hide');$('#tipOk').onclick=()=>{$('#tip').classList.add('hide');S.tut++;save();nextTip(6000)}},d)}

// ---------- Minimap ----------
const mm=$('#mini'),mg=mm.getContext('2d');
function drawMini(){const s=mm.width,sc=s/3200,cx=S.p.x,cy=S.p.y;mg.setTransform(1,0,0,1,0,0);mg.fillStyle='#2a9fc0';mg.fillRect(0,0,s,s);mg.save();mg.translate(s/2,s/2);mg.rotate(R.cam.yaw);mg.scale(sc,sc);mg.translate(-cx,-cy);
 mg.imageSmoothingEnabled=true;mg.drawImage(CT.OV,0,0,WW,WH);
 for(const v of CT.VEH){if(!v.act||Math.abs(v.x-cx)>1800||Math.abs(v.y-cy)>1800)continue;mg.fillStyle=v.t==='danfo'?'#ffd400':v.t==='brt'?'#1e88e5':'#fafafa';mg.fillRect(v.x-30,v.y-30,60,60)}
 if(S.myCar){mg.fillStyle='#ff4081';mg.beginPath();mg.arc(S.myCar.x,S.myCar.y,70,0,7);mg.fill()}
 const pin=(x,y,c)=>{const dx=cl(x-cx,-1500,1500),dy=cl(y-cy,-1500,1500);mg.fillStyle=c;mg.strokeStyle='#fff';mg.lineWidth=40;mg.beginPath();mg.arc(cx+dx,cy+dy,110,0,7);mg.fill();mg.stroke()};
 {const tg=STORY.on&&STORY.target();if(tg&&BY[tg])pin(BY[tg].door.x,BY[tg].door.y,'#ffd400')}if(S.gps)pin(S.gps.x,S.gps.y,'#ff1744');mg.restore();
 mg.fillStyle='#fff';mg.strokeStyle='#111';mg.lineWidth=2;mg.save();mg.translate(s/2,s/2);mg.rotate(R.cam.yaw-PR.ry+Math.PI);mg.beginPath();mg.moveTo(0,-8);mg.lineTo(6,6);mg.lineTo(-6,6);mg.closePath();mg.fill();mg.stroke();mg.restore();
 mg.fillStyle='#111';mg.font='900 11px system-ui';mg.textAlign='center';mg.fillText('N',s/2+Math.sin(R.cam.yaw)*(s/2-9),s/2-Math.cos(R.cam.yaw)*(s/2-9)+4)}
$('#mini').onclick=()=>openMap();
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
function faint(){if(IN)leaveInterior(true);S.energy=25;const fee=Math.min(5000,S.money);pay(fee);adv(6*60);const h=HOMES[S.home];if(!S.homeless){const d=outP(BY[h.b]);S.p.x=d.x;S.p.y=d.y}
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
 const nf=nightF();$('#clock').innerHTML=`<b>${fmtT()}</b> ${S.bo?'🕯️':''}${S.wx.k==='rain'?'🌧️':S.wx.k==='haze'?'🌫️':nf>.5?'🌙':'☀️'}<small>${tr('Day','Day')} ${day()}</small>`;
 $('#where').textContent=IN?'🚪 '+L(IN.b.lab).split(' (')[0]:'📍 '+areaName(areaI())+(S.bo?' · ⚡'+tr('NEPA','NEPA'):'')+(CT.SIM.rush&&!IN?' · 🚗 '+tr('rush hour','go-slow'):'');
 const a=$('#act');if(uiFree()&&!RIDE&&!DRV&&(nearAct||near)){a.classList.remove('hide');a.textContent=nearAct?nearAct.act.l:near.kind==='car'?tr('🚗 Drive your car','🚗 Drive your motor'):({park:'🚌 ',beach:'🏖️ ',brt:'🚍 ',jetty:'⛴️ ',boat:'🛶 '}[near.kind]||'🚪 ')+tr('Enter ','Enter ')+L(near.lab).split(' (')[0]}else a.classList.add('hide');
 const ob=$('#obj');if(STORY.on){ob.classList.remove('hide');const tg=STORY.target(),tb=tg&&BY[tg];let ar='';if(tb){if(IN&&IN.b===tb)ar='📍';else if(!IN){const dx=tb.door.x-S.p.x,dz=tb.door.y-S.p.y,y=R.cam.yaw,sx=dx*Math.cos(y)-dz*Math.sin(y),su=-dx*Math.sin(y)-dz*Math.cos(y);ar=`<i class="wa" style="transform:rotate(${Math.atan2(sx,su)}rad)">⬆</i><em>${Math.round(Math.hypot(dx,dz)*K)}m</em>`}}ob.innerHTML=`<div>${STORY.tracker()}</div>${ar}`}else ob.classList.add('hide');
 {const gi=$('#gpsI');if(S.gps&&!IN){const dx=S.gps.x-S.p.x,dz=S.gps.y-S.p.y,y=R.cam.yaw,sx=dx*Math.cos(y)-dz*Math.sin(y),su=-dx*Math.sin(y)-dz*Math.cos(y);gi.classList.remove('hide');gi.innerHTML=`📍 <i class="wa" style="transform:rotate(${Math.atan2(sx,su)}rad)">⬆</i> ${Math.round(Math.hypot(dx,dz)*K)}m`}else gi.classList.add('hide')}
 ['#mapBtn','#hailBtn','#runBtn'].forEach(id=>$(id).classList.toggle('hide',!!IN||!!RIDE||!!DRV));
 if(!IN)drawMini();$('#mini').style.visibility=IN?'hidden':'';
 if(IN)R.setInteriorPower(S.bo&&!IN.b.gen&&!IN.sp.powered&&!genOn(),genOn())}
$('#act').onclick=()=>{if(uiFree()&&(near||nearAct))interact()};

// ---------- Locations ----------
function placePanel(near){const k=near.kind;({home:homeP,buka:bukaP,tech:workP,bank:bankP,market:marketP,club:clubP,park:parkP,worship:worshipP,beach:beachP,fuel:fuelP,studio:workP,hospital:hospitalP,brt:brtP,jetty:jettyP,boat:boatP,repair:workP,dealer:dealerP,airport:airportP,stadium:penalty})[k](near)}
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
 panel(()=>({em:'🍲',title:L(b.lab),text:tr('What will you eat?','Wetin you wan chop?'),acts:F.map(f=>({l:`${f[0]} ${L(f[1])} — ${N(f[2])}`,s:`+🍲${f[3]} +☮️${f[4]}`,dis:S.money<f[2]||S.hunger>=98,f:()=>{if(pay(f[2],'food:'+(b.id==='buka'?'buka':'suya')+':'+F.indexOf(f))){STORY.ev('ate');AU.coin();stat('hunger',f[3]);stat('peace',f[4]);stat('energy',3);adv(20)}}}))}))}
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
 function done(){const p=Math.round(C.pay[S.online?0:c.lv]*(0.4+0.6*score/6));earn(p,'job:'+k+':'+score);c.xp=Math.min(999,c.xp+score);stat('energy',-25);stat('hunger',-15);adv(8*60);S.shifts++;setTimeout(()=>STORY.ev('shift',k),50);let promo='';
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
function marketP(b){panel(()=>{const acts=[];GOODS.forEach((g,i)=>{const p=goodPrice(i,b.id),sp=Math.round(p*.92);
  acts.push({l:`${g[1]} ${tr('Buy','Buy')} ${L(g[2])} — ${N(p)}`,s:tr(`You have ${S.inv[i]}/10 · sell price ${N(sp)}`,`You get ${S.inv[i]}/10 · sell price ${N(sp)}`),dis:S.money<p||S.inv[i]>=10,f:()=>{if(S.inv[i]<10&&pay(p))S.inv[i]++}});
  if(S.inv[i]>0)acts.push({l:`${g[1]} ${tr('Sell','Sell')} 1 — ${N(sp)}`,alt:1,f:()=>{if(S.inv[i]>0){S.inv[i]--;earn(sp)}}})});
 return{em:'🛍️',title:L(b.lab),text:tr("Prices change daily. Tip: Oshodi is cheap for pepper & phone accessories; The CMS market is cheap for ankara & rice. Buy low, sell high!",'Price dey change every day. Oshodi cheap for pepper & phone things; The CMS market cheap for ankara & rice. Buy cheap, sell when e cost!'),acts:workPActs(b).concat(acts)}})}
function clubP(b){panel(()=>{const hr=hour(),open=hr>=21||hr<4;return{em:'🪩',title:L(b.lab),text:open?tr('The DJ is on fire. Who you be?','DJ dey burst brain. Who you be?'):tr('Opens 9pm – 4am.','E dey open 9pm – 4am.'),acts:[
 {l:tr('🎟️ Regular entry ','🎟️ Regular gate ')+N(10000),s:'+⭐5 +☮️6 −⚡15',dis:!open||S.money<10000||S.energy<15,f:()=>{if(pay(10000)){stat('respect',5);stat('peace',6);stat('energy',-15);adv(120);S.clubT=S.t+180;STORY.ev('club',0);clubEvent()}}},
 {l:tr('🍾 VIP table ','🍾 VIP table ')+N(80000),s:'+⭐18 +☮️10 −⚡20',dis:!open||S.money<80000||S.energy<20,f:()=>{if(pay(80000)){stat('respect',18);stat('peace',10);stat('energy',-20);adv(180);S.clubT=S.t+240;STORY.ev('club',1);clubEvent()}}}]}})}
function clubEvent(){const r=Math.random();if(r<.15){earn(20000);toast(tr('💸 A celebrity sprayed you ₦20,000!','💸 Celebrity spray you ₦20,000!'))}else if(r<.28){pay(Math.min(S.money,15000));stat('peace',-10);toast(tr('📵 Your phone got "missing". Paid ₦15,000 to replace.','📵 Dem japa with your phone. ₦15k don go.'))}else if(r<.38){stat('respect',8);toast(tr('🎤 You got called on stage!','🎤 Dem call you enter stage!'))}}
// ---------- Travel panels ----------
const mDist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)/20;
const fareRoad=(mode,m)=>Math.round(({danfo:300+m*1.4,brt:700,keke:200+m*1.2,okada:300+m*1.6,taxi:900+m*3.2})[mode]/50)*50;
function parkP(b){panel(()=>{const acts=PARKS.filter(id=>id!==b.id).map(id=>{const t=BY[id],m=mDist(b.door,t.door),f=fareRoad('danfo',m),nm=L(t.lab).split(' (')[0];
  return{l:`🚌 ${tr('Danfo to','Danfo go')} ${nm} — ${N(f)}`,s:tr(`${Math.round(m)} m · ride with a view, or skip`,`${Math.round(m)} m · siddon look road, or skip`),dis:S.money<f,f:()=>{if(pay(f,'fare:'+id)){startRide('danfo',{to:t.door,toB:t,name:nm})}}}});
 if(S.homeless)acts.push({l:tr('🪑 Sleep on a bench','🪑 Sleep for bench'),s:'+⚡35 −☮️10',f:()=>{adv(6*60);stat('energy',35);stat('peace',-10)}});
 acts.push(...STORY.parkActs(b));return{em:'🚌',title:L(b.lab),text:tr('"Oshodi! Obalende! Enter with your change!" Danfos leave when full.','"Oshodi! Obalende! Enter with your change o!"'),acts}})}
function brtP(b){panel(()=>({em:'🚍',title:L(b.lab),text:tr('Blue BRT: Ikeja ⇄ Oshodi ⇄ Yaba ⇄ Ebute-Metta ⇄ CMS. Flat fare ₦700, air-conditioned.','BRT: Ikeja ⇄ Oshodi ⇄ Yaba ⇄ Ebute-Metta ⇄ CMS. ₦700 flat, AC dey.'),
 acts:BRT.filter(id=>id!==b.id).map(id=>{const t=BY[id],nm=t.lab[0].split('— ')[1];return{l:`🚍 BRT → ${nm} — ${N(700)}`,s:`${Math.round(mDist(b.door,t.door))} m`,dis:S.money<700,f:()=>{if(pay(700,'fare:brt')){startRide('brt',{to:t.door,toB:t,name:'BRT '+nm})}}}})}))}
function jettyP(b){panel(()=>({em:'⛴️',title:L(b.lab),text:tr('Lagoon ferry — beat the go-slow on water. Life jackets compulsory!','Ferry for lagoon — beat go-slow for water. Wear life jacket!'),
 acts:JETTIES.filter(id=>id!==b.id).map(id=>{const t=BY[id],nm=L(t.lab);return{l:`⛴️ ${tr('Ferry to','Ferry go')} ${nm} — ${N(1500)}`,s:tr('Cross the lagoon (~10 min)','Cross lagoon (~10 min)'),dis:S.money<1500,f:()=>{if(pay(1500,'fare:ferry')){startRide('ferry',{path:CT.ferryPath(b.id,id),to:t.door,toB:t,name:nm,min:12})}}}})}))}
function boatP(b){panel(()=>({em:'🛶',title:L(b.lab),text:tr('Makoko: the city on water. Canoes glide between stilt houses.','Makoko: city wey dey on top water. Canoe dey pass between house.'),acts:[
 {l:tr('🛶 Canoe ride around Makoko ','🛶 Canoe ride round Makoko ')+N(2000),s:'+☮️18 (20 min)',dis:S.money<2000,f:()=>{if(pay(2000,'fare:canoe')){startRide('canoe',{path:CT.CANOE,to:b.door,toB:b,name:'Makoko',min:20,end:()=>{stat('peace',18);toast('🛶 +☮️18')}})}}},
 {l:tr('🐟 Buy fresh fish (smoked) ','🐟 Buy fresh fish (smoked) ')+N(2500),s:'+🍲35',dis:S.money<2500,f:()=>{if(pay(2500,'food:fish')){stat('hunger',35);AU.coin()}}}]}))}
function hailP(){if(!S||IN||RIDE||DRV)return;const dests=B.filter(b=>!['brt'].includes(b.kind)).map(b=>({b,m:mDist(S.p,b.door)})).filter(o=>o.m>40).sort((a,b)=>a.m-b.m);
 if(S.gps)dests.unshift({b:null,m:mDist(S.p,S.gps),gps:1});
 const onRd=!!CT.onRoadW(S.p.x,S.p.y,60);
 panel(()=>({em:'🚕',title:tr('Hail a ride','Stop motor'),text:onRd?tr('Pick a destination. Keke: short trips, no bridges. Okada: fast but risky. Bolt-style taxi: anywhere, comfy.','Choose where you dey go. Keke: short trip. Okada: fast but e get risk. Taxi: anywhere.'):tr('Stand by the roadside to hail a ride.','Stand for roadside make you stop motor.'),
  acts:onRd?dests.slice(0,8).flatMap(o=>{const nm=o.gps?tr('📍 Your GPS pin','📍 Your GPS pin'):L(o.b.lab).split(' (')[0],to=o.gps?S.gps:o.b.door,out=[];
   const mk=(mode,em)=>{const f=fareRoad(mode,o.m);out.push({l:`${em} ${nm} — ${N(f)}`,s:`${L(MODE[mode].n)} · ${Math.round(o.m)} m${mode==='okada'?' · '+tr('⚠️ risky','⚠️ e get risk'):''}`,dis:S.money<f,f:()=>{if(pay(f,'fare:'+mode))startRide(mode,{to,toB:o.b,name:nm})}})};
   if(o.m<450)mk('keke','🛺');if(o.m<700)mk('okada','🏍️');mk('taxi','🚕');return out}):[]}))}
// fast travel between transport hubs (map screen)
const atHub=()=>S&&!IN&&HUBS.map(id=>BY[id]).find(b=>Math.hypot(b.door.x-S.p.x,b.door.y-S.p.y)<160);
function fastTravel(id){const h=atHub(),t=BY[id];if(!h||!t||h===t)return false;const m=mDist(h.door,t.door),f=Math.round((400+m*1.2)/50)*50;if(!pay(f,'fare:fast'))return toast(tr('Not enough money for the fare.','Money no reach for fare.')),false;
 closeMap();fade(()=>{adv(Math.round(10+m/12));const o=outP(t,26);S.p.x=o.x;S.p.y=o.y;R.preload(S.p.x,S.p.y);stat('energy',-3);hud();save();toast(`🚌 ${tr('Arrived at','You don reach')} ${L(t.lab).split(' (')[0]}`)});return true}
// ---------- Dealership, airport, stadium ----------
function dealerP(b){panel(()=>{const c=S.myCar,acts=CARS.map(M=>({l:`🚗 ${tr('Buy','Buy')} ${L(M.n)} — ${N(M.p)}`,s:tr(`Top speed ${Math.round(M.v*3.6)} km/h · comes with 20L`,`Top speed ${Math.round(M.v*3.6)} km/h · 20L fuel dey inside`)+(c?tr(' · trade-in old car 50%',' · we go buy your old one 50%'):''),
  dis:S.money+(c?Math.round(carModel().p*.5):0)<M.p||(c&&c.m===M.id),f:()=>{const tradeIn=c?Math.round(carModel().p*.5):0;if(tradeIn)earn(tradeIn,'car:trade');if(pay(M.p,'car:'+M.id)){const o=outP(b,90);S.myCar={m:M.id,x:o.x,y:o.y,h:Math.PI/2,fuel:20,hp:100};stat('respect',M.id==='jeep'?20:10);toast(tr('🔑 Your car is parked outside! Walk to it and press Drive.','🔑 Your motor dey outside! Waka reach am press Drive.'));AU.coin();STORY.ev('car')}}}));
  if(c){const rep=Math.round((100-c.hp)*1500/50)*50;acts.push({l:tr('🔧 Repair car ','🔧 Repair motor ')+N(rep),s:`${c.hp|0}% → 100%`,dis:c.hp>=100||S.money<rep,f:()=>{if(pay(rep,'car:fix')){c.hp=100;toast('🔧 '+tr('Good as new (almost)','E don correct'))}}});
   acts.push({l:tr('🚛 Tow my car here ','🚛 Tow my motor come here ')+N(5000),s:tr('If it is stuck or wrecked somewhere','If e jam or scatter somewhere'),dis:S.money<5000,f:()=>{if(pay(5000,'car:tow')){const o=outP(b,90);Object.assign(c,{x:o.x,y:o.y,h:Math.PI/2});toast('🚛 '+tr('Towed to the lot','E don reach lot'))}}})}
  return{em:'🚗',title:L(b.lab),text:tr('"Tokunbo, clean, no accident history… we promise!" Fuel up at any station.','"Tokunbo, clean, no accident… we promise!" Buy fuel for any station.'),acts}})}
function airportP(b){panel(()=>({em:'✈️',title:L(b.lab),text:tr('Departures: London, Toronto, Dubai, Accra. Everybody wants to japa.','Departures: London, Toronto, Dubai, Accra. Everybody wan japa.'),acts:[
 {l:tr('👀 Watch planes take off (30 min)','👀 Watch plane dey fly (30 min)'),s:'+☮️6',f:()=>{stat('peace',6);adv(30)}},
 {l:tr('🎫 Ticket abroad ','🎫 Ticket abroad ')+N(2500000),s:STORY.on?tr('Story: use the Japa gate in chapter 5','Story: use Japa gate for chapter 5'):tr('Visa required — not in free roam','You need visa — no be free roam'),dis:true,f:()=>{}},
 {l:tr('🧃 Airport snack ','🧃 Airport snack ')+N(4000),s:'+🍲20 (airport prices!)',dis:S.money<4000,f:()=>{if(pay(4000,'food:snack'))stat('hunger',20)}}]}))}
let PK=null;
function penalty(b){if(PK&&PK.n>=5)PK=null;if(!PK){if(S.energy<12)return toast(tr('Too tired to play.','You don tire.'));stat('energy',-12);adv(30);PK={n:0,g:0,log:''}}
 panel(()=>{if(!PK)return null;const done=PK.n>=5;const kick=dir=>{const kd=Math.random()<.4?1:Math.floor(Math.random()*3),miss=Math.random()<.1,goal=!miss&&kd!==dir;PK.n++;if(goal){PK.g++;AU.coin()}else AU.noise(.3,.3,300);PK.log+=goal?'⚽':'❌';
   if(PK.n>=5){const g=PK.g;if(g>=4){stat('respect',8);stat('peace',10);earn(5000,'bonus:scout');toast(tr('🏆 A scout noticed you! +₦5,000','🏆 Scout don see you! +₦5,000'))}else if(g===3){stat('respect',4);stat('peace',6)}else stat('peace',2)}return 'keep'};
  return{em:'⚽',title:tr('Penalty shootout','Penalty shootout'),text:`${tr('Kick','Kick')} ${Math.min(5,PK.n+1)}/5 · ${PK.log||'—'} · ${tr('Goals','Goals')}: ${PK.g}`+(done?'<br><b>'+(PK.g>=4?tr('Legend! Super Eagles material!','Legend! Super Eagles material!'):PK.g===3?tr('Not bad!','E no bad!'):tr('The keeper laughed at you.','Goalkeeper laugh you.'))+'</b>':''),
   acts:done?[{l:tr('🔁 Play again (−⚡12)','🔁 Play again (−⚡12)'),f:()=>{PK=null;penalty(b);return 'keep'}}]:[{l:'⬅️ '+tr('Shoot left','Shoot left'),f:()=>kick(0)},{l:'⬆️ '+tr('Shoot middle','Shoot middle'),f:()=>kick(1)},{l:'➡️ '+tr('Shoot right','Shoot right'),f:()=>kick(2)}]}})}
// ---------- Map screen (full map, GPS waypoint, hub fast travel) ----------
const mpc=$('#mapc'),mpg=mpc.getContext('2d');let MP={z:1,cx:WW/2,cy:WH/2,drag:null};
const HUBI=id=>BY[id].kind==='park'?'🚌':BY[id].kind==='brt'?'🚍':BY[id].kind==='jetty'?'⛴️':'✈️';
function openMap(){if(!S||IN)return;closeModal();closePhone();$('#map').classList.remove('hide');MP.z=innerWidth<700?1.6:1;MP.cx=S.p.x;MP.cy=S.p.y;drawMap();mapList()}
function closeMap(){$('#map').classList.add('hide')}
function mapXf(){const W=mpc.width=innerWidth*Math.min(2,devicePixelRatio||1),H=mpc.height=innerHeight*Math.min(2,devicePixelRatio||1),base=Math.min(W/WW,H/WH)*.95,sc=base*MP.z;return{W,H,sc,ox:W/2-MP.cx*sc,oy:H/2-MP.cy*sc}}
function drawMap(){const X=mapXf(),g=mpg,dpr=X.W/innerWidth;g.setTransform(1,0,0,1,0,0);g.fillStyle='#1e88a8';g.fillRect(0,0,X.W,X.H);g.setTransform(X.sc,0,0,X.sc,X.ox,X.oy);g.imageSmoothingEnabled=true;g.drawImage(CT.OV,0,0,WW,WH);
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2/X.sc;for(const b of CT.BRIDGES){g.beginPath();g.moveTo(b.x0,b.y0);g.lineTo(b.x1,b.y1);g.stroke()}
 if(S.gps){const r=roadPath(S.p.x,S.p.y,S.gps.x,S.gps.y).P;g.strokeStyle='#ff1744';g.lineWidth=5/X.sc*dpr;g.setLineDash([12/X.sc,8/X.sc]);g.beginPath();r.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.setLineDash([])}
 g.setTransform(1,0,0,1,0,0);const P=(x,y)=>[x*X.sc+X.ox,y*X.sc+X.oy],f=s=>`900 ${s*dpr}px system-ui`;g.textAlign='center';g.textBaseline='middle';
 for(const a of AREAS){if(a.id==='lagoon')continue;const [x,y]=P((Math.max(0,a.r[0])+Math.min(WW,a.r[2]))/2,(Math.max(0,a.r[1])+Math.min(WH,a.r[3]))/2);g.font=f(13);g.fillStyle='rgba(0,0,0,.55)';g.fillText(a.n.toUpperCase(),x+1,y+1);g.fillStyle='#fff';g.fillText(a.n.toUpperCase(),x,y)}
 {g.font=f(12);g.fillStyle='rgba(255,255,255,.65)';g.fillText('LAGOS LAGOON',...P(12000,5600));g.fillText('ATLANTIC OCEAN',...P(13000,13600))}
 const hub=atHub();for(const b of B){const [x,y]=P(b.door.x,b.door.y),isH=HUBS.includes(b.id);g.font=f(isH?17:12);g.fillText(isH?HUBI(b.id):b.kind==='hospital'?'🏥':b.kind==='home'?'🏠':b.kind==='fuel'?'⛽':'•',x,y);
  if(MP.z>1.3||isH){g.font=`700 ${10*dpr}px system-ui`;g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=3*dpr;const t=L(b.lab).split(' (')[0];g.strokeText(t,x,y+14*dpr);g.fillText(t,x,y+14*dpr)}}
 const tg=STORY.on&&STORY.target();if(tg&&BY[tg]){const [x,y]=P(BY[tg].door.x,BY[tg].door.y);g.strokeStyle='#ffd400';g.lineWidth=3*dpr;g.beginPath();g.arc(x,y,16*dpr,0,7);g.stroke()}
 if(S.gps){const [x,y]=P(S.gps.x,S.gps.y);g.font=f(22);g.fillText('📍',x,y-10*dpr)}
 if(S.myCar){const [x,y]=P(S.myCar.x,S.myCar.y);g.font=f(15);g.fillText('🚗',x,y)}
 {const [x,y]=P(S.p.x,S.p.y);g.save();g.translate(x,y);g.rotate(-PR.ry+Math.PI);g.fillStyle='#ffd400';g.strokeStyle='#111';g.lineWidth=2*dpr;g.beginPath();g.moveTo(0,-11*dpr);g.lineTo(8*dpr,8*dpr);g.lineTo(-8*dpr,8*dpr);g.closePath();g.fill();g.stroke();g.restore()}
 $('#mhint').textContent=hub?tr(`At ${L(hub.lab).split(' (')[0]} — tap a hub below to fast travel`,`You dey ${L(hub.lab).split(' (')[0]} — tap hub make you fast travel`):tr('Tap the map to drop a GPS pin. Fast travel works from 🚌 🚍 ⛴️ hubs.','Tap map to drop GPS pin. Fast travel na from 🚌 🚍 ⛴️ hubs.')}
function mapList(){const hub=atHub(),el=$('#mlist');if(!hub){el.innerHTML=S.gps?`<button id="mclr">❌ ${tr('Clear GPS pin','Clear GPS pin')}</button>`:'';const c=$('#mclr');if(c)c.onclick=()=>{S.gps=null;drawMap();mapList()};return}
 el.innerHTML=HUBS.filter(id=>id!==hub.id).map(id=>{const m=mDist(hub.door,BY[id].door),f=Math.round((400+m*1.2)/50)*50;return`<button data-ft="${id}">${HUBI(id)} ${L(BY[id].lab).split(' (')[0]} <small>${N(f)}</small></button>`}).join('');
 el.querySelectorAll('[data-ft]').forEach(b=>b.onclick=()=>fastTravel(b.dataset.ft))}
mpc.addEventListener('pointerdown',e=>{MP.drag={x:e.clientX,y:e.clientY,cx:MP.cx,cy:MP.cy,moved:0}});
mpc.addEventListener('pointermove',e=>{if(!MP.drag)return;const X=mapXf(),dpr=X.W/innerWidth,dx=(e.clientX-MP.drag.x)*dpr/X.sc,dy=(e.clientY-MP.drag.y)*dpr/X.sc;if(Math.hypot(e.clientX-MP.drag.x,e.clientY-MP.drag.y)>6)MP.drag.moved=1;if(MP.drag.moved){MP.cx=MP.drag.cx-dx;MP.cy=MP.drag.cy-dy;drawMap()}});
mpc.addEventListener('pointerup',e=>{const d=MP.drag;MP.drag=null;if(!d||d.moved)return;const X=mapXf(),dpr=X.W/innerWidth,wx=(e.clientX*dpr-X.ox)/X.sc,wy=(e.clientY*dpr-X.oy)/X.sc;
 const hub=atHub();if(hub){const h=HUBS.map(id=>BY[id]).find(b=>Math.hypot(b.door.x-wx,b.door.y-wy)*X.sc/dpr<22);if(h&&h!==hub){fastTravel(h.id);return}}
 if(wx>0&&wy>0&&wx<WW&&wy<WH){S.gps={x:wx,y:wy};toast(tr('📍 GPS pin set — follow the red beam','📍 GPS pin don set — follow red light'));drawMap();mapList()}});
mpc.addEventListener('wheel',e=>{e.preventDefault();MP.z=cl(MP.z*(e.deltaY<0?1.15:.87),.8,6);drawMap()},{passive:false});
$('#mzoom').onclick=()=>{MP.z=MP.z>=3?1:MP.z*1.7;drawMap()};$('#mclose').onclick=closeMap;$('#mme').onclick=()=>{MP.cx=S.p.x;MP.cy=S.p.y;drawMap()};
function worshipP(b){panel(()=>({em:'🕌⛪',title:L(b.lab),text:tr('A quiet place to reset.','Quiet place to rest your mind.'),acts:[{l:tr('🙏 Pray / reflect (1h)','🙏 Pray small (1h)'),s:'+☮️15',f:()=>{stat('peace',15);adv(60)}},{l:tr('🎁 Give offering ','🎁 Drop offering ')+N(1000),s:'+⭐2 +☮️4',dis:S.money<1000,f:()=>{if(pay(1000)){stat('respect',2);stat('peace',4)}}}]}))}
function beachP(b){panel(()=>({em:'🏖️',title:L(b.lab),text:tr('Waves, horses, loud speakers. Peace.','Wave, horse, speaker dey blast. Peace.'),acts:[{l:tr('🌊 Chill at the beach ','🌊 Chill for beach ')+N(2000),s:'+☮️25 +⚡5 (2h)',dis:S.money<2000,f:()=>{if(pay(2000)){stat('peace',25);stat('energy',5);adv(120)}}},{l:tr('🐎 Horse ride ','🐎 Ride horse ')+N(5000),s:'+☮️12 +⭐3',dis:S.money<5000,f:()=>{if(pay(5000)){stat('peace',12);stat('respect',3);adv(30)}}},{l:tr('🍢 Beach suya ','🍢 Beach suya ')+N(2500),s:'+🍲30',dis:S.money<2500,f:()=>{if(pay(2500)){stat('hunger',30);adv(15)}}}]}))}
function fuelP(b){const P=1200;panel(()=>({em:'⛽',title:L(b.lab),text:tr(`Petrol ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For your gen when NEPA strikes.`,`Fuel ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For gen when NEPA take light.`),acts:[1,5].map(q=>({l:`⛽ ${tr('Buy','Buy')} ${q}L — ${N(P*q)}`,dis:S.money<P*q||S.fuel+q>20,f:()=>{if(S.fuel+q<=20&&pay(P*q)){S.fuel+=q;STORY.ev('fuel');AU.coin()}}})).concat((()=>{const c=S.myCar;if(!c||Math.hypot(c.x-b.door.x,c.y-b.door.y)>700)return[];const need=Math.ceil(40-c.fuel);return[{l:`🚗 ${tr('Fill car tank','Fill motor tank')} (${need}L) — ${N(need*P)}`,s:`⛽ ${c.fuel.toFixed(1)}L / 40L`,dis:need<1||S.money<need*P,f:()=>{const n=Math.min(need,Math.floor(S.money/P));if(n>0&&pay(n*P,'fuel:car')){c.fuel+=n;AU.coin();STORY.ev('fuel')}}}]})())}))}

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
 else{bd.innerHTML=`<div class="acts"><p><b>🎮 ${tr('Graphics','Graphics')}</b></p><div class="row">${['low','med','high'].map(q=>`<button class="opt ${SET.q===q?'on':''}" data-q="${q}">${q==='low'?tr('Low (fast)','Low (fast)'):q==='med'?tr('Medium','Medium'):tr('High','High')}</button>`).join('')}</div><p><b>🔊 ${tr('Audio','Audio')}</b></p>${[['vm','🎵',tr('Music','Music')],['vs','💥',tr('Sound effects','Sound effects')],['va','🌆',tr('Ambience','Ambience')]].map(([k,e,n])=>`<label class="sl">${e} ${n}<input type="range" min="0" max="1" step="0.05" value="${SET[k]??.7}" data-v="${k}"></label>`).join('')}<p><b>🕹️ ${tr('Controls','Controls')}</b></p><button id="joyT">${SET.joy?tr('🕹️ Joystick ON — switch to tap-to-move','🕹️ Joystick ON — change to tap-to-waka'):tr('👆 Tap-to-move ON — switch to joystick','👆 Tap-to-waka ON — change to joystick')}</button><button id="mtest">🎵 ${tr('Test music','Test music')}</button><button id="snd">${SET.snd?'🔇 '+tr('Mute all','Mute everything'):'🔊 '+tr('Unmute','Unmute')}</button><button id="lng">🌐 ${tr('Language: English → switch to Pidgin','Language: Pidgin → switch to English')}</button><button id="sv">💾 ${tr('Save now','Save am now')}</button><button id="rs" class="alt">🗑️ ${tr('Reset game (new character)','Start again (new person)')}</button></div><p style="font-size:12px">${tr('Single-player. Saved on this device only. No chat, no real-money purchases.','Na only you dey play. E save for this phone only. No chat, no real money.')}</p>`;
  $('#lng').onclick=()=>{S.lang=S.lang==='pg'?'en':'pg';SET.lang=S.lang;saveSet();save();drawPhone();hud()};bd.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{SET.q=b.dataset.q;saveSet();R.setQuality(SET.q);drawPhone()});$('#joyT').onclick=()=>{SET.joy=SET.joy?0:1;saveSet();drawPhone();toast(SET.joy?tr('🕹️ Joystick: drag left side to walk','🕹️ Joystick: drag left side to waka'):tr('👆 Tap the ground to walk; hold to keep walking; two fingers or right edge to turn camera','👆 Tap ground to waka; hold to continue; two fingers or right edge to turn camera'))};$('#mtest').onclick=()=>{const st=AU.test(),d=AU.diag;toast('🎵 Audio: '+st+' · '+d.rendered+' loops'+(d.elTrack?' · playing '+d.elTrack+(d.elPaused?' (paused)':''):'')+(d.err?' · '+d.err:''))};$('#snd').onclick=()=>{SET.snd=SET.snd?0:1;saveSet();AU.init();AU.vol();musBtn();drawPhone()};bd.querySelectorAll('[data-v]').forEach(i=>i.oninput=()=>{SET[i.dataset.v]=+i.value;saveSet();AU.init();AU.vol()});$('#sv').onclick=()=>{save();toast(tr('Saved ✅','E don save ✅'))};
  $('#rs').onclick=()=>{if(confirm(tr('Delete your save and start over?','You sure say make we clear everything?'))){localStorage.removeItem(SAVE);const lang=S.lang;S={lang};if(IN)leaveInterior(true);closePhone();creator()}}}}
// ---------- Character creator ----------

const SKINS=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59','#e0ac69'],OUTS=['#0b7a3e','#e53935','#1e88e5','#fdd835','#8e24aa','#fb8c00','#212121','#ffffff'];
const HAIRS=[['Low cut','Low cut'],['Afro','Afro'],['Braids','Braids'],['Cap','Face cap'],['Headwrap','Gele/wrap']];
let ck={name:'',skin:SKINS[2],out:OUTS[0],hair:0,body:0},cbg='nepo';
function creator(){$('#title').classList.add('hide');$('#creator').classList.remove('hide');$('#hud').classList.add('hide');$('#phoneBtn').classList.add('hide');const cr=$('#cr');
 cr.innerHTML=`<div class="card"><h2>🇳🇬 Sapa Survival <span style="color:#0b7a3e">3D</span></h2><p>${tr('Create your Lagosian. Hustle, chop, pay rent, survive NEPA.','Create your Lagos person. Hustle, chop, pay rent, survive NEPA.')}</p>
 <canvas id="pv" width="240" height="150" style="width:120px;height:75px;display:block;margin:4px auto"></canvas>
 <input id="nm" maxlength="14" placeholder="${tr('Your name','Your name')}" value="${ck.name}">
 <p>${tr('Style','Style')}</p><div class="row" id="mdl">${MODELS.map(([v,n])=>`<button class="opt ${(ck.model||'')===v?'on':''}" data-v="${v}">${n}</button>`).join('')}</div>
 <p>${tr('Skin tone','Skin colour')}</p><div class="row" id="sk">${SKINS.map(c=>`<button class="sw ${c===ck.skin?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Outfit colour','Cloth colour')}</p><div class="row" id="oc">${OUTS.map(c=>`<button class="sw ${c===ck.out?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Hair / head','Hair / head')}</p><div class="row" id="hr">${HAIRS.map((h,i)=>`<button class="opt ${i===ck.hair?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Build','Body')}</p><div class="row" id="bdy">${[['Slim','Slim'],['Broad','Broad']].map((h,i)=>`<button class="opt ${i===ck.body?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Background','Background')}</p><div class="row" id="bgc">${STORYMODE?`<button class="opt ${cbg==='nepo'?'on':''}" data-v="nepo">🙏🏾 ${tr('Easy','Easy')}<br><small>₦50,000 + ${tr("Mum's prayers",'Mama prayers')}</small></button><button class="opt ${cbg==='lapo'?'on':''}" data-v="lapo">📝 ${tr('Hard','Hard')}<br><small>₦50,000 + ₦100k Lapo ${tr('debt','debt')}</small></button>`:`<button class="opt ${cbg==='nepo'?'on':''}" data-v="nepo">👑 Nepo Baby<br><small>₦500,000</small></button><button class="opt ${cbg==='lapo'?'on':''}" data-v="lapo">📝 Lapo Loan<br><small>₦50,000 + ₦100k ${tr('debt','debt')}</small></button>`}</div>
 <div class="row"><button class="opt" id="clang">🌐 ${S&&S.lang==='pg'?'English':'Pidgin'}</button></div></div><div class="acts"><button id="go">🚶 ${tr('Enter Lagos','Enter Lagos')}</button></div>`;
 const pv=$('#pv').getContext('2d');const dp=()=>{pv.clearRect(0,0,240,150);pv.fillStyle='#e8d29a';pv.fillRect(0,0,240,150);drawAvatar(pv,120,135,ck,0,0,2.2)};dp();
 $('#nm').oninput=e=>ck.name=e.target.value;
 [['mdl','model'],['sk','skin'],['oc','out'],['hr','hair'],['bdy','body']].forEach(([id,k])=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{ck[k]=k==='hair'||k==='body'?+b.dataset.v:b.dataset.v;$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));dp()}));
 $('#bgc').querySelectorAll('button').forEach(b=>b.onclick=()=>{cbg=b.dataset.v;$('#bgc').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
 $('#clang').onclick=()=>{S=S||{};S.lang=S.lang==='pg'?'en':'pg';SET.lang=S.lang;saveSet();creator()};
 $('#go').onclick=()=>{const name=(ck.name||'').replace(/[<>&"']/g,'').trim().slice(0,14)||'Tunde';S=fresh({...ck,name},cbg);if(STORYMODE){S.story=STORY.fresh();S.money=50000;S.debt=cbg==='lapo'?100000:0;S.respect=2;if(cbg==='nepo')S.peace=85;const d=BY.park0.door;S.p.x=d.x;S.p.y=d.y+20;S.tut=0;fix();save();start(true);STORY.intro(()=>{hud();nextTip(800)});return}fix();save();start();toast(cbg==='nepo'?tr('Daddy\'s money landed. Don\'t waste it!','Papa money don land. No waste am!'):tr('Lapo loan landed. Repay at the bank in VI!','Lapo loan don land. Pay back for bank for VI!'))}}
function goOnline(){NET.openJoin(S&&S.look,look=>{const lang=SET.lang;const keepP=S&&S.online?null:{...(S&&S.p||{})};const sp=NET._spawn;S=fresh(look,'nepo');S.lang=lang;S.online=true;S.debt=0;S.tut=TIPS.length;S.money=netMoney;if(sp){S.p.x=sp.x;S.p.y=sp.y}fix();start(true);NET.show();toast(tr('🟢 Online! Be nice. Chat is filtered.','🟢 You don enter online! Behave. Chat get filter.'))})}
let netMoney=50000;
function start(noTip){$('#creator').classList.add('hide');$('#title').classList.add('hide');R.setLook(S.look);if(NET.on)NET.setLook(S.look);DEAD=null;$('#hud').classList.remove('hide');$('#phoneBtn').classList.remove('hide');lastDist=-1;hud();if(S.tut<TIPS.length&&!noTip)nextTip(1200);if(S.story&&S.story.on&&!S.story.intro&&!noTip)STORY.intro(()=>hud())}

// ---------- Title / loading / boot ----------
function showTitle(){const has=load();const t=$('#title');t.classList.remove('hide');
 t.innerHTML=`<div class="tcard"><div class="logo">SAPA<br>SURVIVAL<span>3D LAGOS LIFE</span></div><p>${tr('Hustle in Yaba, VI & Lekki. Pay rent. Survive NEPA. Dodge danfo.','Hustle for Yaba, VI & Lekki. Pay rent. Survive NEPA. Dodge danfo.')}</p>
 ${has?`<button id="tCont">▶ ${tr('Continue','Continue')} — ${S.look.name}, ${tr('Day','Day')} ${day()}</button>`:''}<button id="tStory" class="${has?'alt':''}">📖 ${tr('New Story','New Story')}<small>${tr('From Face-Me-I-Face-You to Lekki','From Face-Me-I-Face-You to Lekki')}</small></button><button id="tNew" class="alt">🌍 ${tr('New Free Roam','New Free Roam')}</button><button id="tOnline" class="online">🟢 ${tr('Play Online','Play Online')}<small>${tr('Shared Lagos · up to 50 players · chat (beta)','Shared Lagos · reach 50 people · chat (beta)')}</small></button>
 <div class="row">${['low','med','high'].map(q=>`<button class="opt ${SET.q===q?'on':''}" data-q="${q}">${q==='low'?'⚡ Low':q==='med'?'Medium':'✨ High'}</button>`).join('')}</div>
 <div class="row"><button class="opt" id="tSnd">${SET.snd?'🔊':'🔇'} ${tr('Sound','Sound')}</button><button class="opt" id="tLng">🌐 ${tr('Pidgin','English')}</button></div><p class="sm">${tr('Story & Free Roam: single-player, saved on this device · Online: beta, no login','Story & Free Roam: na only you · Online: beta, no login')}</p></div>`;
 if(has)$('#tCont').onclick=()=>{AU.init();start()};
 const nw_=story=>{AU.init();if(has&&!confirm(tr('Start a new life? Your current save will be replaced when you enter Lagos.','Start new life? Your old save go clear when you enter Lagos.')))return;const lang=(S&&S.lang)||SET.lang;S={lang};STORYMODE=story;creator()};$('#tStory').onclick=()=>nw_(true);$('#tOnline').onclick=()=>{AU.init();goOnline()};$('#tNew').onclick=()=>nw_(false);
 t.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{SET.q=b.dataset.q;saveSet();R.setQuality(SET.q);showTitle()});
 $('#tSnd').onclick=()=>{SET.snd=SET.snd?0:1;saveSet();AU.init();AU.vol();musBtn();showTitle()};$('#tLng').onclick=()=>{SET.lang=SET.lang==='pg'?'en':'pg';if(S)S.lang=SET.lang;saveSet();showTitle()}}
const prog=p=>{$('#lbar').style.width=p+'%';$('#lpct').textContent=Math.round(p)+'%';return new Promise(r=>setTimeout(r,16))};
let last=performance.now(),hudT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;tm+=dt;
 try{worldTick(dt);const playing=S&&S.look&&!vis('#title');if(playing)update(dt);
  const title=!playing;const pp=IN?{x:IN.p.x,z:IN.p.z}:(S&&S.p&&S.look?{x:S.p.x*K,z:S.p.y*K}:{x:BY.tech.door.x*K,z:(BY.tech.door.y+60)*K});
  const extra=[];if(S&&S.look){if(S.myCar){const c=S.myCar;extra.push({k:'mycar',t:'car',c:carModel().c,x:c.x,y:c.y,h:c.h,roll:c.hp<=0?.25:0})}if(RIDE)extra.push({k:'ride',t:RIDE.M.vt,c:null,x:RIDE.x||S.p.x,y:RIDE.y||S.p.y,h:RIDE.h||0,yo:RIDE.M.water?-.35:0})}
  if(NET.on)NET.frame(dt,tm);let mk=null;if(playing&&!DEAD){if(IN&&nearAct)mk=[nearAct.x,nearAct.z,2.3];else if(near&&!RIDE&&!DRV)mk=[near.door.x*K,near.door.y*K,near.kind==='car'?2.6:2.4]}
  R.tapPulse();R.frame(dt,{tm,p:{...pp,ry:PR.ry,ph:PR.ph,moving:PR.moving,gait:PR.gait,anim:NET.on?NET.localAnim():'idle'},h:S&&S.look?hour():16.8,nf:S&&S.look?nightF():0,bo:S&&S.look?S.bo:0,dead:DEAD,marker:mk,hideP:!!(RIDE||DRV)&&!DEAD,extra,wx:WX,title:title&&!vis('#creator')||(title&&!(S&&S.look)),cine:STORY.cine,wp:(playing&&!IN&&S.gps)?[S.gps.x*K,S.gps.y*K]:(playing&&!IN&&STORY.on&&STORY.target()&&BY[STORY.target()])?[BY[STORY.target()].door.x*K,BY[STORY.target()].door.y*K]:null});
  audioFrame(playing);
  bubTick(dt);AU.tick();if(playing){STORY.tick(dt);hudT+=dt;if(hudT>.25){hudT=0;hud()}}
  fpsN++;}catch(e){console.error(e)}requestAnimationFrame(loop)}
let fpsN=0;
function audioFrame(playing){if(!AU.ctx)return;const ci=R.camInfo();AU.listen(ci.x,ci.y,ci.z,ci.fx,ci.fz);
 let tk='city',club=0,dist='title';
 if(!playing)tk='title';else{const ai=AREAS[areaI()].id;dist=IN?'in':CT.AMB[ai]||'yaba';
  if(DEAD||STORY.tense)tk='tense';else if(IN){tk=IN.b.kind==='club'?'amapiano':['home','worship'].includes(IN.b.kind)?'calm':'city'}else{if(CT.isBeach(S.p.x,S.p.y)||RIDE&&RIDE.M.water)tk='calm';const h=hour(),cd=BY.club.door,dd=Math.hypot(S.p.x-cd.x,S.p.y-cd.y);if((h>=21||h<4)&&dd<700)club=1-dd/700}
  if(!IN){const ok=CT.VEH.filter(v=>v.act&&v.t==='okada').map(v=>({x:v.x,y:v.y,d:Math.hypot(v.x-S.p.x,v.y-S.p.y)})).sort((a,b)=>a.d-b.d);for(let i=0;i<2;i++){const o=ok[i];AU.setLoop('ok'+i,o&&o.d<800,o?[o.x*K,1,o.y*K]:[0,0,0],'okada')}
   GEN.forEach((g,i)=>AU.setLoop('gen'+i,!!S.bo&&Math.hypot(g.x-S.p.x,g.y-S.p.y)<900,[g.x*K,1,g.y*K],'gen'))}else{['ok0','ok1','myCar',...GEN.map((g,i)=>'gen'+i)].forEach(k=>AU.setLoop(k,false));AU.setLoop('genH',genOn()&&IN.b.kind==='home',[IN.sp.w/2-1,1,IN.sp.d/2-1],'gen')}
  if(!DRV)AU.setLoop('myCar',false)}
 AU.setRain&&AU.setRain(playing&&!IN?WX.rain:playing?WX.rain*.25:0);AU.setTrack(tk);AU.setClub(club);AU.setDistrict(dist)}
let STORYMODE=false;
const STORY=makeStory({get S(){return S},tr,N,toast,pay,earn,stat,adv,save,fix,hud,BY,K,AU,HOMES,day,hour,closeModal,free:()=>S&&S.look&&!vis('#modal')&&!vis('#phone')&&!DEAD&&!fading&&!STORY.dlgOpen()&&!vis('#title')&&!vis('#creator'),inside:()=>!!IN,
 fx:f=>{if(f.m<0)pay(Math.min(S.money,-f.m));if(f.m>0)earn(f.m);stat('energy',f.e);stat('peace',f.p);stat('respect',f.r)}});
async function boot(){try{await prog(20);await R.init(cv,SET.q);await prog(45);CT.initSim(R.q==='low'?40:R.q==='med'?64:90,R.q==='low'?70:R.q==='med'?110:150);await R.build({B,WW,WH,spawn:BY.tech.door},prog);await prog(100);
 setTimeout(()=>{$('#load').classList.add('hide');showTitle()},200);requestAnimationFrame(loop)}catch(e){console.error(e);$('#lmsg').textContent='Could not start 3D: '+e.message+'. Try another browser or enable WebGL.'}}
addEventListener('visibilitychange',()=>document.hidden&&S&&S.look&&save());
const NET=makeNet({get S(){return S},get IN(){return IN},get VEH(){return !!(RIDE||DRV)},get PR(){return PR},tr,toast,AU,uiFree:()=>uiFree(),nearSomething:()=>!!(near||nearAct),setMoney:m=>{netMoney=m;if(S&&S.online){S.money=m;hud()}},back:()=>showTitle(),exitOnline:()=>{if(IN)leaveInterior(true);closeModal();closePhone();S=null;$('#hud').classList.add('hide');$('#phoneBtn').classList.add('hide');showTitle()},
 fallback:why=>{const msg=why==='kicked'?tr('You were removed from the server.','Server don comot you.'):tr('😓 Online server is down. Back to single-player — your offline save is safe.','😓 Server don fall. Make we go back single-player — your save dey safe.');if(IN)leaveInterior(true);closeModal();closePhone();S=null;$('#hud').classList.add('hide');$('#phoneBtn').classList.add('hide');showTitle();toast(msg)}});
// test/debug hooks
window.G={R,get S(){return S},NET,get PR(){return PR},adv,blackout,streetEvent,interact,openPhone,R,
 tp:id=>{if(IN)leaveInterior(true);if(RIDE)endRide(true);carToggleForce();const d=outP(BY[id],10);S.p.x=d.x;S.p.y=d.y;R.preload(S.p.x,S.p.y)},pos:(x,y)=>{if(IN)leaveInterior(true);S.p.x=x*20;S.p.y=y*20;R.preload(S.p.x,S.p.y);return !blocked(S.p.x,S.p.y)},get near(){return near&&near.id},get nearAct(){return nearAct&&nearAct.act.l},get IN(){return IN&&IN.b.id},get DEAD(){return DEAD},B:BY,CT,get RIDE(){return RIDE&&{mode:RIDE.mode,d:RIDE.d,len:RIDE.len}},get DRV(){return DRV&&{v:DRV.v}},WX,setWx,openMap,closeMap,fastTravel,hailP,startRide,carToggle,get area(){return S&&AREAS[areaI()].id},
 giveCar:(m='corolla')=>{const o=outP(BY.dealer,90);S.myCar={m,x:o.x,y:o.y,h:Math.PI/2,fuel:30,hp:100};S.p.x=o.x;S.p.y=o.y-60;return true},key:(k,v)=>{keys[k]=v},
 setHour:h=>{S.t=Math.floor(S.t/1440)*1440+h*60+(h*60<S.t%1440?1440:0);S.lh=Math.floor(S.t/60)},
 enter:id=>{if(IN)leaveInterior(true);const d=outP(BY[id],10);S.p.x=d.x;S.p.y=d.y;near=BY[id];interact()},
 goAct:sub=>{if(!IN)return false;const a=IN.acts.find(a=>a.act.l.includes(sub));if(!a)return false;const dx=-a.x,dz=IN.sp.d/2-1.2-a.z,m=Math.hypot(dx,dz)||1,k=Math.min(a.r*.55,m);IN.p.x=a.x+dx/m*k;IN.p.z=a.z+dz/m*k;return true},dbg:()=>({uiFree:uiFree(),fading,modal:vis('#modal'),phone:vis('#phone'),death:vis('#death'),IN:IN&&IN.b.id,p:IN&&IN.p,na:nearAct&&nearAct.act.l}),
 danfo:(to='park2')=>{const b=BY.park0,t=BY[to],o=outP(b,30);S.p.x=o.x;S.p.y=o.y;startRide('danfo',{to:t.door,toB:t,name:L(t.lab)});return true},
 get fps(){return fpsN},STORY,AU,storyFlag:(k,v=1)=>{S.story.F[k]=v;STORY.check()},setCh:n=>{S.story.ch=n;S.story.s0=S.shifts;STORY.check()},ending:k=>STORY.ending(k),info:()=>R.info()};
boot();
