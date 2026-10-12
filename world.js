'use strict';
// Sapa Survival v2 — Lagos World. Single-player 2D top-down life-sim. No build step.
const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');
const lc=document.createElement('canvas'),lx=lc.getContext('2d');
let W=0,H=0,DPR=1,Z=1;
const SAVE='sapa_world_v2',MAXM=1e9,WW=4600,WH=1400,RY=560,RH=100,SHORE=1150,SEA=1220;
const DIST=[{id:'yaba',ox:0,n:['Yaba','Yaba']},{id:'vi',ox:1600,n:['Victoria Island','VI']},{id:'lekki',ox:3200,n:['Lekki','Lekki']}];
let S=null;
const tr=(e,p)=>(S&&S.lang==='pg')?p:e;
const L=a=>Array.isArray(a)?tr(a[0],a[1]):a;
const N=n=>'₦'+Math.round(n).toLocaleString('en-US');
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const okNum=n=>typeof n==='number'&&Number.isFinite(n);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=n=>rng(n*9973+17)();

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
function fresh(look,bg){return{v:2,lang:(S&&S.lang)||'en',look,money:bg==='nepo'?500000:50000,debt:bg==='nepo'?0:100000,save:0,energy:90,hunger:80,peace:70,respect:bg==='nepo'?12:2,
 t:7*60,lh:7,p:{x:BY.room.door.x,y:BY.room.door.y+20,dir:0},home:0,homeless:false,rentDue:8,fuel:0,bo:0,boEnd:0,car:{tech:{lv:0,xp:0},bank:{lv:0,xp:0},trade:{lv:0,xp:0},ent:{lv:0,xp:0}},inv:[0,0,0,0],bg,shifts:0,log:[]}}
const day=()=>S?Math.floor(S.t/1440)+1:1;
const hour=()=>S?(S.t/60)%24:12;
function fix(){if(!S)return;['money','debt','save'].forEach(k=>{if(!okNum(S[k]))S[k]=0;S[k]=Math.round(cl(S[k],0,MAXM))});
 ['energy','hunger','peace','respect'].forEach(k=>{if(!okNum(S[k]))S[k]=50;S[k]=cl(S[k],0,100)});
 S.fuel=cl(okNum(S.fuel)?S.fuel:0,0,20);S.home=cl(S.home|0,0,2);S.inv=(Array.isArray(S.inv)?S.inv:[]).slice(0,4).map(v=>cl(v|0,0,10));while(S.inv.length<4)S.inv.push(0);
 if(!okNum(S.t)||S.t<0)S.t=420;for(const k in CAR){const c=S.car[k]||(S.car[k]={lv:0,xp:0});c.lv=cl(c.lv|0,0,3);c.xp=cl(c.xp|0,0,999)}
 if(!okNum(S.p.x)||!okNum(S.p.y)||blocked(S.p.x,S.p.y)){S.p.x=BY.room.door.x;S.p.y=BY.room.door.y+20}}
// all money flows through these two
function pay(n){if(!okNum(n)||n<0||n>MAXM)return false;n=Math.round(n);if(S.money<n)return false;S.money-=n;fix();return true}
function earn(n){if(!okNum(n)||n<0)return;S.money=Math.min(MAXM,S.money+Math.round(Math.min(n,5e6)));fix()}
function stat(k,d){if(okNum(d))S[k]=cl(S[k]+d,0,100)}
function save(){if(S&&S.look)try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&s.v===2&&s.look&&s.p&&s.car){S=s;fix();return true}}catch(e){}return false}

// ---------- Geometry ----------
const inGap=x=>(x>1400&&x<1600)||(x>3000&&x<3200);
function water(x,y){return y>SEA||(inGap(x)&&!(y>RY&&y<RY+RH))}
function blocked(x,y){if(x<10||y<10||x>WW-10||y>WH-10||water(x,y))return true;for(const b of B)if(x>b.x-8&&x<b.x+b.w+8&&y>b.y-4&&y<b.y+b.h+6)return true;return false}
const vroad=d=>DIST[d].ox+640;
const distAt=x=>x<1500?0:x<3100?1:2;

// palms, lamps, npcs, danfos
const PALMS=[],LAMPS=[],NPC=[],BUS=[];
(function gen(){const r=rng(42);let k=0;while(PALMS.length<130&&k++<5000){const x=r()*WW,y=40+r()*(SEA-60);const vr=vroad(distAt(x));
 if(water(x,y)||blocked(x,y+4)||blocked(x,y-30)||(y>RY-30&&y<RY+RH+30)||(x>vr-30&&x<vr+110))continue;if(y>SHORE-20&&y<SHORE+4)continue;if(B.some(b=>x>b.x-40&&x<b.x+b.w+40&&y>b.y-20&&y<b.y+b.h+100))continue;PALMS.push({x,y,s:.8+r()*.5})}
 for(let x=60;x<WW;x+=180)if(!inGap(x)){LAMPS.push({x,y:RY-14});LAMPS.push({x:x+90,y:RY+RH+14})}
 const sk=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59'],oc=['#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#fb8c00','#00897b','#fff'];
 for(let i=0;i<34;i++){const d=i%3,ox=DIST[d].ox,v=r()<.5;let a,b;
  if(v){const x=vroad(d)+(r()<.5?-14:94);a={x,y:30+r()*400};b={x,y:a.y+300+r()*300}}else{const y=r()<.5?RY-12:RY+RH+12;a={x:ox+20+r()*500,y};b={x:a.x+300+r()*500,y}}
  b.y=Math.min(b.y,SHORE-10);NPC.push({x:a.x,y:a.y,a,b,to:1,sp:28+r()*30,look:{skin:sk[i%5],out:oc[(i*3)%8],hair:i%5,body:i%2},ph:r()*6})}
 const bc=['#ffd400','#ffd400','#ffd400','#ffca28'];
 for(let i=0;i<5;i++)BUS.push({h:true,lane:i%2,x:r()*WW,sp:(i%2?1:-1)*(110+r()*50),c:bc[i%4]});
 for(let d=0;d<3;d++)for(let j=0;j<2;j++)BUS.push({h:false,lane:j,d,y:r()*SHORE,sp:(j?-1:1)*(90+r()*40),c:'#ffd400'})})();

// ---------- Sprites ----------
const SPR={};
function bsprite(b){if(SPR[b.id])return SPR[b.id];const s=2,c=document.createElement('canvas');c.width=b.w*s;c.height=(b.h+b.H)*s;const g=c.getContext('2d');g.scale(s,s);
 const w=b.w,h=b.h,HH=b.H;
 if(b.kind==='market'){g.fillStyle='#bcaaa4';g.fillRect(0,h*.4,w,h*.6+HH);const cols=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00'];for(let i=0;i<6;i++){const x=6+i*(w-12)/6;g.fillStyle=cols[i%5];g.fillRect(x,h*.15,(w-12)/6-6,h*.55);g.fillStyle='rgba(255,255,255,.5)';for(let j=0;j<4;j++)g.fillRect(x+j*14,h*.15,7,h*.55)}
 } else {g.fillStyle=b.roof;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,0,w,h/2);g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2);
  if(b.kind==='home'&&b.id==='room'){g.strokeStyle='rgba(0,0,0,.25)';for(let x=10;x<w;x+=14){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}}
  if(b.kind==='worship'){g.fillStyle='#43a047';g.beginPath();g.arc(w*.3,h*.5,26,0,7);g.fill();g.fillStyle='#fff';g.fillRect(w*.72-4,h*.2,8,40);g.fillRect(w*.72-14,h*.2+10,28,8)}
  if(b.kind==='bank'||b.kind==='tech'){g.fillStyle='rgba(255,255,255,.2)';for(let i=12;i<w-12;i+=30)g.fillRect(i,12,18,h-24)}}
 g.fillStyle=b.col;g.fillRect(0,h,w,HH);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,h,w,5);
 const win=b.kind==='club'?'#e040fb':b.kind==='bank'||b.kind==='tech'||b.id==='flat'?'#4fc3f7':'#5d4037';
 if(HH>45){g.fillStyle=win;const rows=Math.floor((HH-40)/26)+1;for(let r=0;r<rows;r++)for(let x=12;x<w-28;x+=34){if(Math.abs(x+9-w/2)<26)continue;g.fillRect(x,h+10+r*26,18,15)}}
 g.fillStyle='#3e2723';g.fillRect(w/2-14,h+HH-32,28,32);g.fillStyle='#ffd400';g.fillRect(w/2+6,h+HH-17,3,3);
 const lab=b.lab[0].split(' (')[0];g.font='800 11px system-ui,sans-serif';const tw=Math.min(w-8,g.measureText(lab).width+12);
 g.fillStyle=b.kind==='club'?'#e040fb':'#111';g.fillRect(w/2-tw/2,h+2,tw,16);g.fillStyle=b.kind==='club'?'#111':'#ffd400';g.textAlign='center';g.textBaseline='middle';g.fillText(lab,w/2,h+10,tw-6);
 return SPR[b.id]=c}

// ---------- Static chunks ----------
const CH=400,CS=1.5,chunks=new Map();
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
  g.fillStyle='#fff';for(let i=0;i<6;i++)g.fillRect(x+4+i*13,RY-22,8,20);g.fillStyle='#ffd400'}
 // lots
 g.fillStyle='#9e9e9e';['park0','park1','park2','fuel'].forEach(id=>{const b=BY[id];g.fillRect(b.x-20,b.y+b.h,b.w+40,60)});
 g.fillStyle='#d7ccc8';const m=BY.market;g.fillRect(m.x-10,m.y+m.h,m.w+20,40);
 g.font='900 40px system-ui';g.fillStyle='rgba(0,0,0,.12)';g.textAlign='center';DIST.forEach(d=>g.fillText(d.n[0].toUpperCase(),d.ox+700,RY+RH+80));
 g.font='900 26px system-ui';g.fillStyle='rgba(255,255,255,.5)';g.fillText('LAGOS LAGOON',2300,1320);}
function chunk(i,j){const k=i+','+j;let c=chunks.get(k);if(c){chunks.delete(k);chunks.set(k,c);return c}
 c=document.createElement('canvas');c.width=c.height=CH*CS;const g=c.getContext('2d');g.setTransform(CS,0,0,CS,-i*CH*CS,-j*CH*CS);drawStatic(g);chunks.set(k,c);
 if(chunks.size>20)chunks.delete(chunks.keys().next().value);return c}

// ---------- Drawing ----------
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
function drawPalm(g,p){const s=p.s;g.save();g.translate(p.x,p.y);g.scale(s,s);g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(4,0,16,5,0,0,7);g.fill();
 g.strokeStyle='#8d6e63';g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(8,-30,2,-60);g.stroke();
 g.fillStyle='#2e7d32';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.beginPath();g.ellipse(2+Math.cos(a)*16,-62+Math.sin(a)*8,18,6,a,0,7);g.fill()}g.fillStyle='#5d4037';g.beginPath();g.arc(2,-60,4,0,7);g.fill();g.restore()}
function drawBus(g,b,x,y){g.save();g.translate(x,y);if(!b.h)g.rotate(Math.PI/2);if(b.sp<0)g.scale(-1,1);
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-27,6,56,8);g.fillStyle=b.c;rr(g,-28,-14,56,26,5);g.fillStyle='#111';g.fillRect(-28,-2,56,3);g.fillRect(-28,6,56,2);
 g.fillStyle='#90caf9';g.fillRect(16,-11,9,20);for(let i=-22;i<12;i+=10)g.fillRect(i,-12,7,7);g.restore()}
function drawLamp(g,l){g.fillStyle='#455a64';g.fillRect(l.x-1.5,l.y-34,3,34);g.fillStyle=(S.bo||nightF()<.2)?'#90a4ae':'#fff59d';g.beginPath();g.arc(l.x,l.y-36,4,0,7);g.fill()}
function nightF(){const h=hour();if(h>=19||h<5)return 1;if(h>=17)return (h-17)/2;if(h<7)return 1-(h-5)/2;return 0}

let cam={x:0,y:0},tm=0;
function render(){const vw=W/Z,vh=H/Z;cam.x=cl(S.p.x-vw/2,0,Math.max(0,WW-vw));cam.y=cl(S.p.y-vh/2-20,0,Math.max(0,WH-vh));
 ctx.setTransform(DPR*Z,0,0,DPR*Z,-cam.x*DPR*Z,-cam.y*DPR*Z);
 for(let i=Math.floor(cam.x/CH);i<=Math.floor((cam.x+vw)/CH);i++)for(let j=Math.floor(cam.y/CH);j<=Math.floor((cam.y+vh)/CH);j++)if(i>=0&&j>=0&&i*CH<WW&&j*CH<WH)ctx.drawImage(chunk(i,j),i*CH,j*CH,CH,CH);
 // water shimmer
 ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;for(let y=Math.max(SEA+20,Math.floor(cam.y/40)*40);y<cam.y+vh;y+=40)for(let x=Math.floor(cam.x/90)*90;x<cam.x+vw;x+=90){const o=Math.sin(tm*1.5+x*.05+y)*12;ctx.beginPath();ctx.moveTo(x+o,y);ctx.quadraticCurveTo(x+o+12,y-5,x+o+24,y);ctx.stroke()}
 const vis=(x,y,m=120)=>x>cam.x-m&&x<cam.x+vw+m&&y>cam.y-m&&y<cam.y+vh+200;
 const list=[];
 for(const b of B)if(vis(b.x+b.w/2,b.y+b.h/2,b.w))list.push([b.y+b.h,0,b]);
 for(const p of PALMS)if(vis(p.x,p.y))list.push([p.y,1,p]);
 for(const l of LAMPS)if(vis(l.x,l.y))list.push([l.y,2,l]);
 for(const n of NPC)if(vis(n.x,n.y))list.push([n.y,3,n]);
 for(const b of BUS){const [x,y]=busPos(b);if(vis(x,y))list.push([y+12,4,b,x,y])}
 list.push([S.p.y,5]);list.sort((a,b)=>a[0]-b[0]);
 for(const it of list){const k=it[1],o=it[2];
  if(k===0){const s=bsprite(o);ctx.drawImage(s,o.x,o.y-o.H,o.w,o.h+o.H)}
  else if(k===1)drawPalm(ctx,o);else if(k===2)drawLamp(ctx,o);
  else if(k===3)drawAvatar(ctx,o.x,o.y,o.look,o.dir||0,o.ph);else if(k===4)drawBus(ctx,o,it[3],it[4]);
  else drawAvatar(ctx,S.p.x,S.p.y,S.look,S.p.dir,S.p.ph||0)}
 // door markers
 if(near){const d=near.door;ctx.fillStyle='#ffd400';ctx.strokeStyle='#111';ctx.lineWidth=2;const bob=Math.sin(tm*5)*3;ctx.beginPath();ctx.moveTo(d.x-8,d.y-20+bob);ctx.lineTo(d.x+8,d.y-20+bob);ctx.lineTo(d.x,d.y-10+bob);ctx.closePath();ctx.fill();ctx.stroke()}
 // name
 ctx.font='800 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#111';ctx.fillText(S.look.name,S.p.x,S.p.y-56);
 // lighting
 const nf=nightF(),dark=nf*(S.bo?.78:.55)+(S.bo&&!nf?.12:0);
 ctx.setTransform(DPR,0,0,DPR,0,0);
 const h=hour();if(h>=16.5&&h<19.5&&!S.bo){ctx.fillStyle=`rgba(255,120,30,${.18*Math.sin((h-16.5)/3*Math.PI)})`;ctx.fillRect(0,0,W,H)}
 if(dark>0.02){const q=.5;if(lc.width!==Math.ceil(W*q)){lc.width=Math.ceil(W*q);lc.height=Math.ceil(H*q)}
  lx.globalCompositeOperation='source-over';lx.clearRect(0,0,lc.width,lc.height);lx.fillStyle=`rgba(8,12,40,${dark})`;lx.fillRect(0,0,lc.width,lc.height);
  lx.globalCompositeOperation='destination-out';const sc=Z*q;
  const glow=(x,y,r,a)=>{const X=(x-cam.x)*sc,Y=(y-cam.y)*sc,R=r*sc;if(X<-R||Y<-R||X>lc.width+R||Y>lc.height+R)return;const gr=lx.createRadialGradient(X,Y,0,X,Y,R);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=gr;lx.fillRect(X-R,Y-R,R*2,R*2)};
  if(!S.bo){for(const l of LAMPS)glow(l.x,l.y-30,110,.85);for(const b of B)glow(b.door.x,b.door.y-20,90,.8)}else{glow(BY.fuel.door.x,BY.fuel.door.y,140,.9);glow(BY.club.door.x,BY.club.door.y,110,.7)}
  glow(S.p.x,S.p.y-20,S.bo?85:60,.9);for(const b of BUS){const [x,y]=busPos(b);glow(x,y,60,.6)}
  ctx.drawImage(lc,0,0,W,H)}}
function busPos(b){if(b.h)return[b.x,RY+(b.lane?RH*.73:RH*.27)];return[vroad(b.d)+(b.lane?60:20),b.y]}

// ---------- Input ----------
const keys={};let joy=null,near=null;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if((e.key==='e'||e.key===' '||e.key==='Enter')&&uiFree()&&near){e.preventDefault();interact()}if(e.key==='p'&&uiFree())openPhone();if(e.key==='Escape'){closeModal();closePhone()}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
const jEl=$('#joy'),jK=jEl.firstElementChild;
cv.addEventListener('pointerdown',e=>{if(!uiFree())return;joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};jEl.style.display='block';jEl.style.left=e.clientX-60+'px';jEl.style.top=e.clientY-60+'px';jK.style.transform='';cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!joy||e.pointerId!==joy.id)return;let dx=e.clientX-joy.x,dy=e.clientY-joy.y;const m=Math.hypot(dx,dy),mx=45;if(m>mx){dx*=mx/m;dy*=mx/m}joy.dx=dx/mx;joy.dy=dy/mx;jK.style.transform=`translate(${dx}px,${dy}px)`});
const jEnd=e=>{if(joy&&e.pointerId===joy.id){joy=null;jEl.style.display='none'}};cv.addEventListener('pointerup',jEnd);cv.addEventListener('pointercancel',jEnd);
const uiFree=()=>S&&S.look&&$('#modal').classList.contains('hide')&&$('#phone').classList.contains('hide')&&$('#creator').classList.contains('hide');

// ---------- Update ----------
let evT=45,lastDist=-1,saveT=0;
function update(dt){tm+=dt;
 for(const n of NPC){const t=n.to?n.b:n.a,dx=t.x-n.x,dy=t.y-n.y,m=Math.hypot(dx,dy);if(m<2)n.to^=1;else{n.x+=dx/m*n.sp*dt;n.y+=dy/m*n.sp*dt;n.ph+=dt*8;n.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:2):(dy>0?0:3)}}
 for(const b of BUS){if(b.h){b.x+=b.sp*dt;if(b.x>WW+60)b.x=-60;if(b.x<-60)b.x=WW+60}else{b.y+=b.sp*dt;if(b.y>SHORE)b.y=-40;if(b.y<-40)b.y=SHORE}}
 if(!uiFree())return;
 S.t+=dt*1.5;hourTicks();
 let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(joy&&Math.hypot(joy.dx,joy.dy)>.15){mx=joy.dx;my=joy.dy}
 const m=Math.hypot(mx,my);if(m>0){if(m>1){mx/=m;my/=m}const sp=(S.energy<10?95:155)*dt,p=S.p;
  const nx=p.x+mx*sp,ny=p.y+my*sp;if(!blocked(nx,p.y))p.x=nx;if(!blocked(p.x,ny))p.y=ny;
  p.ph=(p.ph||0)+dt*11;p.dir=Math.abs(mx)>Math.abs(my)?(mx>0?1:2):(my>0?0:3);S.walked=(S.walked||0)+sp;
  evT-=dt;if(evT<=0){evT=50+Math.random()*60;if(Math.random()<.6){streetEvent();return}}}
 near=null;let bd=52;for(const b of B){const d=Math.hypot(b.door.x-S.p.x,b.door.y-S.p.y);if(d<bd){bd=d;near=b}}
 const di=distAt(S.p.x);if(di!==lastDist){if(lastDist>=0)toast('📍 '+L(DIST[di].n));lastDist=di}
 if(S.energy<=0)faint();
 saveT+=dt;if(saveT>8){saveT=0;save()}}
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
 if(!S.homeless&&over>=7){if(S.home>0){S.home=0;S.rentDue=d+7;toast(tr('🚪 EVICTED! Landlord threw your things out. Back to face-me-I-face-you.','🚪 Landlord don pursue you! You don go back face-me-I-face-you.'))}else{S.homeless=true;toast(tr('🚪 EVICTED! You are now homeless — sleep at a danfo park.','🚪 Dem don pursue you comot! Go sleep for motor park.'))}stat('peace',-25);stat('respect',-10)}
 else if(!S.homeless&&over>=3)toast(tr('⚠️ Rent overdue! Landlord says pay or pack.','⚠️ Rent don pass! Landlord say pay or pack.'));fix();save()}
function faint(){S.energy=25;const fee=Math.min(5000,S.money);pay(fee);adv(6*60);const h=HOMES[S.home];if(!S.homeless){const d=BY[h.b].door;S.p.x=d.x;S.p.y=d.y+20}
 toast(tr(`😵 You collapsed! Clinic bill ${N(fee)}.`,`😵 You faint! Clinic collect ${N(fee)}.`))}

// ---------- UI helpers ----------
let tT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),2800)}
let cur=null;
function panel(fn){cur=fn;$('#modal').classList.remove('hide');drawPanel()}
function drawPanel(){if(!cur)return;const P=cur();if(!P){closeModal();return}const sh=$('#sheet');
 sh.innerHTML=`<div class="card"><div class="em">${P.em||''}</div><h2>${P.title}</h2>${P.text?`<p>${P.text}</p>`:''}${statLine()}</div><div class="acts">${P.acts.map((a,i)=>`<button data-a="${i}" ${a.dis?'disabled':''} class="${a.alt?'alt':''}">${a.l}${a.s?`<small>${a.s}</small>`:''}</button>`).join('')}<button class="alt" data-a="x">${tr('⬅ Leave','⬅ Comot')}</button></div>`;
 sh.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='x')return closeModal();const ac=P.acts[+a];if(ac.dis)return;const r=ac.f();fix();save();hud();if(r!=='keep')drawPanel()})}
function closeModal(){cur=null;$('#modal').classList.add('hide')}
function statLine(){return `<p style="font-size:13px">💰 ${N(S.money)} · ⚡${S.energy|0} · 🍲${S.hunger|0} · ☮️${S.peace|0} · ⭐${S.respect|0}</p>`}
const fmtT=()=>{const h=Math.floor(hour()),m=Math.floor(S.t%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`};
function hud(){if(!S||!S.look)return;const bar=(e,k)=>`<span class="b ${S[k]<25?'low':''}">${e}<s><i style="width:${S[k]}%"></i></s></span>`;
 $('#hud').innerHTML=`<span class="pill m">${N(S.money)}</span><span class="pill">${tr('Day','Day')} ${day()} · ${fmtT()} ${S.bo?'🕯️':nightF()>.5?'🌙':'☀️'}</span><span class="pill bars">${bar('⚡','energy')}${bar('🍲','hunger')}${bar('☮️','peace')}${bar('⭐','respect')}</span>`;
 const a=$('#act');if(near&&uiFree()){a.classList.remove('hide');a.textContent=(near.kind==='park'?'🚌 ':'🚪 ')+L(near.lab).split(' (')[0]}else a.classList.add('hide')}
$('#act').onclick=()=>{if(near&&uiFree())interact()};

// ---------- Locations ----------
function interact(){const k=near.kind;({home:homeP,buka:bukaP,tech:workP,bank:bankP,market:marketP,club:clubP,park:parkP,worship:worshipP,beach:beachP,fuel:fuelP,studio:workP})[k](near)}
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
 panel(()=>({em:'🍲',title:L(b.lab),text:tr('What will you eat?','Wetin you wan chop?'),acts:F.map(f=>({l:`${f[0]} ${L(f[1])} — ${N(f[2])}`,s:`+🍲${f[3]} +☮️${f[4]}`,dis:S.money<f[2]||S.hunger>=98,f:()=>{if(pay(f[2])){stat('hunger',f[3]);stat('peace',f[4]);stat('energy',3);adv(20)}}}))}))}
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
 function done(){const p=Math.round(C.pay[c.lv]*(0.4+0.6*score/6));earn(p);c.xp=Math.min(999,c.xp+score);stat('energy',-25);stat('hunger',-15);adv(8*60);S.shifts++;let promo='';
  if(c.lv<3&&c.xp>=XPN[c.lv+1]&&S.respect>=RQN[c.lv+1]){c.lv++;stat('respect',6);promo=`<p>🎉 ${tr('PROMOTED to','Dem PROMOTE you to')} <b>${L(C.t[c.lv])}</b>!</p>`}
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
 {l:tr('🎟️ Regular entry ','🎟️ Regular gate ')+N(10000),s:'+⭐5 +☮️6 −⚡15',dis:!open||S.money<10000||S.energy<15,f:()=>{if(pay(10000)){stat('respect',5);stat('peace',6);stat('energy',-15);adv(120);clubEvent()}}},
 {l:tr('🍾 VIP table ','🍾 VIP table ')+N(80000),s:'+⭐18 +☮️10 −⚡20',dis:!open||S.money<80000||S.energy<20,f:()=>{if(pay(80000)){stat('respect',18);stat('peace',10);stat('energy',-20);adv(180);clubEvent()}}}]}})}
function clubEvent(){const r=Math.random();if(r<.15){earn(20000);toast(tr('💸 A celebrity sprayed you ₦20,000!','💸 Celebrity spray you ₦20,000!'))}else if(r<.28){pay(Math.min(S.money,15000));stat('peace',-10);toast(tr('📵 Your phone got "missing". Paid ₦15,000 to replace.','📵 Dem japa with your phone. ₦15k don go.'))}else if(r<.38){stat('respect',8);toast(tr('🎤 You got called on stage!','🎤 Dem call you enter stage!'))}}
function parkP(b){panel(()=>{const from=b.d,acts=DIST.map((d,i)=>i===from?null:{l:`🚌 ${tr('Danfo to','Danfo go')} ${L(d.n)} — ${N(FARE[from][i])}`,s:tr('~40 min, squeeze inside','~40 min, squeeze body'),dis:S.money<FARE[from][i],f:()=>{if(pay(FARE[from][i])){adv(40);stat('energy',-4);const t=BY['park'+i].door;S.p.x=t.x;S.p.y=t.y+24;closeModal();toast('📍 '+L(d.n));return 'keep'}}}).filter(Boolean);
 if(S.homeless)acts.push({l:tr('🪑 Sleep on a bench','🪑 Sleep for bench'),s:'+⚡35 −☮️10',f:()=>{adv(6*60);stat('energy',35);stat('peace',-10)}});
 return{em:'🚌',title:L(b.lab),text:tr('"Oshodi! Obalende! Enter with your change!"','"Oshodi! Obalende! Enter with your change o!"'),acts}})}
function worshipP(b){panel(()=>({em:'🕌⛪',title:L(b.lab),text:tr('A quiet place to reset.','Quiet place to rest your mind.'),acts:[{l:tr('🙏 Pray / reflect (1h)','🙏 Pray small (1h)'),s:'+☮️15',f:()=>{stat('peace',15);adv(60)}},{l:tr('🎁 Give offering ','🎁 Drop offering ')+N(1000),s:'+⭐2 +☮️4',dis:S.money<1000,f:()=>{if(pay(1000)){stat('respect',2);stat('peace',4)}}}]}))}
function beachP(b){panel(()=>({em:'🏖️',title:L(b.lab),text:tr('Waves, horses, loud speakers. Peace.','Wave, horse, speaker dey blast. Peace.'),acts:[{l:tr('🌊 Chill at the beach ','🌊 Chill for beach ')+N(2000),s:'+☮️25 +⚡5 (2h)',dis:S.money<2000,f:()=>{if(pay(2000)){stat('peace',25);stat('energy',5);adv(120)}}},{l:tr('🐎 Horse ride ','🐎 Ride horse ')+N(5000),s:'+☮️12 +⭐3',dis:S.money<5000,f:()=>{if(pay(5000)){stat('peace',12);stat('respect',3);adv(30)}}},{l:tr('🍢 Beach suya ','🍢 Beach suya ')+N(2500),s:'+🍲30',dis:S.money<2500,f:()=>{if(pay(2500)){stat('hunger',30);adv(15)}}}]}))}
function fuelP(b){const P=1200;panel(()=>({em:'⛽',title:L(b.lab),text:tr(`Petrol ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For your gen when NEPA strikes.`,`Fuel ${N(P)}/L. Jerrycan: ${S.fuel}/20 L. For gen when NEPA take light.`),acts:[1,5].map(q=>({l:`⛽ ${tr('Buy','Buy')} ${q}L — ${N(P*q)}`,dis:S.money<P*q||S.fuel+q>20,f:()=>{if(S.fuel+q<=20&&pay(P*q))S.fuel+=q}}))}))}

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
function drawPhone(){const T=[['stats','📊',tr('Stats','Stats')],['bank','🏦',tr('Bank','Bank')],['sapa','🎴','Sapa Challenge'],['set','⚙️',tr('Settings','Settings')]];
 $('#tabs').innerHTML=T.map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]} ${t[2]}</button>`).join('');$('#tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;drawPhone()});
 $('#phTitle').textContent=`📱 ${S.look.name} · ${fmtT()}`;const bd=$('#phBody');
 if(tab==='stats'){const h=HOMES[S.home],nw=S.money+S.save-S.debt;bd.innerHTML=`<table><tr><td>💰 ${tr('Cash','Cash')}</td><td>${N(S.money)}</td></tr><tr><td>🏦 ${tr('Savings','Savings')}</td><td>${N(S.save)}</td></tr><tr><td>📝 ${tr('Debt','Debt')}</td><td>${N(S.debt)}</td></tr><tr><td>📈 ${tr('Net worth','Net worth')}</td><td>${nw<0?'−':''}${N(Math.abs(nw))}</td></tr><tr><td>🏠 ${tr('Home','House')}</td><td>${S.homeless?tr('Homeless','No house'):L(h.n)}</td></tr><tr><td>📅 ${tr('Rent paid until','Rent pay reach')}</td><td>${tr('Day','Day')} ${S.rentDue}</td></tr><tr><td>⛽ ${tr('Fuel','Fuel')}</td><td>${S.fuel} L</td></tr><tr><td>💡 NEPA</td><td>${S.bo?tr('Blackout','No light'):tr('Light dey','Light dey')}</td></tr>
  ${Object.keys(CAR).map(k=>`<tr><td>${CAR[k].em} ${L(CAR[k].n)}</td><td>${L(CAR[k].t[S.car[k].lv])} · ${S.car[k].xp}XP</td></tr>`).join('')}
  ${['energy','hunger','peace','respect'].map(k=>`<tr><td>${k}</td><td>${S[k]|0}/100</td></tr>`).join('')}</table><p style="font-size:12px">${tr('Tip: work at Tech Hub (Yaba), Bank (VI), Market (Yaba) or Studio (Lekki). Danfo parks connect districts.','Tip: work for Tech Hub (Yaba), Bank (VI), Market (Yaba) or Studio (Lekki). Motor park go carry you anywhere.')}</p>`}
 else if(tab==='bank')bd.innerHTML=`<div class="card"><h2>🏦 ${N(S.save)}</h2><p>${tr('Savings','Savings')} · ${tr('Debt','Debt')} ${N(S.debt)}</p><p style="font-size:13px">${tr('Deposits, withdrawals and loans are done in person at Gidi Trust Bank (Victoria Island). Interest is applied weekly.','Go Gidi Trust Bank for VI to save, collect or borrow. Interest dey enter every week.')}</p></div>`;
 else if(tab==='sapa')bd.innerHTML=`<iframe id="sapaFrame" src="challenge/index.html" title="Sapa Challenge"></iframe>`;
 else{bd.innerHTML=`<div class="acts"><button id="lng">🌐 ${tr('Language: English → switch to Pidgin','Language: Pidgin → switch to English')}</button><button id="sv">💾 ${tr('Save now','Save am now')}</button><button id="rs" class="alt">🗑️ ${tr('Reset game (new character)','Start again (new person)')}</button></div><p style="font-size:12px">${tr('Single-player. Saved on this device only. No chat, no real-money purchases.','Na only you dey play. E save for this phone only. No chat, no real money.')}</p>`;
  $('#lng').onclick=()=>{S.lang=S.lang==='pg'?'en':'pg';save();drawPhone();hud()};$('#sv').onclick=()=>{save();toast(tr('Saved ✅','E don save ✅'))};
  $('#rs').onclick=()=>{if(confirm(tr('Delete your save and start over?','You sure say make we clear everything?'))){localStorage.removeItem(SAVE);const lang=S.lang;S={lang};closePhone();creator()}}}}

// ---------- Character creator ----------
const SKINS=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59','#e0ac69'],OUTS=['#0b7a3e','#e53935','#1e88e5','#fdd835','#8e24aa','#fb8c00','#212121','#ffffff'];
const HAIRS=[['Low cut','Low cut'],['Afro','Afro'],['Braids','Braids'],['Cap','Face cap'],['Headwrap','Gele/wrap']];
let ck={name:'',skin:SKINS[2],out:OUTS[0],hair:0,body:0},cbg='nepo';
function creator(){$('#creator').classList.remove('hide');$('#hud').classList.add('hide');$('#phoneBtn').classList.add('hide');const cr=$('#cr');
 cr.innerHTML=`<div class="card"><h2>🇳🇬 Sapa Survival: <span style="color:#0b7a3e">Lagos World</span></h2><p>${tr('Create your Lagosian. Hustle, chop, pay rent, survive NEPA.','Create your Lagos person. Hustle, chop, pay rent, survive NEPA.')}</p>
 <canvas id="pv" width="240" height="150" style="width:120px;height:75px;display:block;margin:4px auto"></canvas>
 <input id="nm" maxlength="14" placeholder="${tr('Your name','Your name')}" value="${ck.name}">
 <p>${tr('Skin tone','Skin colour')}</p><div class="row" id="sk">${SKINS.map(c=>`<button class="sw ${c===ck.skin?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Outfit colour','Cloth colour')}</p><div class="row" id="oc">${OUTS.map(c=>`<button class="sw ${c===ck.out?'on':''}" style="background:${c}" data-v="${c}"></button>`).join('')}</div>
 <p>${tr('Hair / head','Hair / head')}</p><div class="row" id="hr">${HAIRS.map((h,i)=>`<button class="opt ${i===ck.hair?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Build','Body')}</p><div class="row" id="bdy">${[['Slim','Slim'],['Broad','Broad']].map((h,i)=>`<button class="opt ${i===ck.body?'on':''}" data-v="${i}">${L(h)}</button>`).join('')}</div>
 <p>${tr('Background','Background')}</p><div class="row" id="bgc"><button class="opt ${cbg==='nepo'?'on':''}" data-v="nepo">👑 Nepo Baby<br><small>₦500,000</small></button><button class="opt ${cbg==='lapo'?'on':''}" data-v="lapo">📝 Lapo Loan<br><small>₦50,000 + ₦100k ${tr('debt','debt')}</small></button></div>
 <div class="row"><button class="opt" id="clang">🌐 ${S&&S.lang==='pg'?'English':'Pidgin'}</button></div></div><div class="acts"><button id="go">🚶 ${tr('Enter Lagos','Enter Lagos')}</button></div>`;
 const pv=$('#pv').getContext('2d');const dp=()=>{pv.clearRect(0,0,240,150);pv.fillStyle='#e8d29a';pv.fillRect(0,0,240,150);drawAvatar(pv,120,135,ck,0,0,2.2)};dp();
 $('#nm').oninput=e=>ck.name=e.target.value;
 [['sk','skin'],['oc','out'],['hr','hair'],['bdy','body']].forEach(([id,k])=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{ck[k]=k==='hair'||k==='body'?+b.dataset.v:b.dataset.v;$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));dp()}));
 $('#bgc').querySelectorAll('button').forEach(b=>b.onclick=()=>{cbg=b.dataset.v;$('#bgc').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
 $('#clang').onclick=()=>{S=S||{};S.lang=S.lang==='pg'?'en':'pg';creator()};
 $('#go').onclick=()=>{const name=(ck.name||'').replace(/[<>&"']/g,'').trim().slice(0,14)||'Tunde';S=fresh({...ck,name},cbg);fix();save();start();toast(cbg==='nepo'?tr('Daddy\'s money landed. Don\'t waste it!','Papa money don land. No waste am!'):tr('Lapo loan landed. Repay at the bank in VI!','Lapo loan don land. Pay back for bank for VI!'))}}
function start(){$('#creator').classList.add('hide');$('#hud').classList.remove('hide');$('#phoneBtn').classList.remove('hide');lastDist=-1;hud()}

// ---------- Boot ----------
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;Z=cl(Math.min(W,H)/430,.85,1.6)}
addEventListener('resize',resize);resize();
let last=performance.now(),hudT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(S&&S.look){update(dt);render();hudT+=dt;if(hudT>.25){hudT=0;hud()}}requestAnimationFrame(loop)}
if(load())start();else{S=null;creator()}
requestAnimationFrame(loop);
addEventListener('visibilitychange',()=>document.hidden&&save());
// test/debug hooks
window.G={get S(){return S},adv,blackout,streetEvent,interact,openPhone,tp:id=>{const d=BY[id].door;S.p.x=d.x;S.p.y=d.y+10},get near(){return near&&near.id},B:BY};
