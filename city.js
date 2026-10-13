// Naija Republic v5 — open-world Lagos: map data, road graph, traffic, pedestrians, streaming 3D
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const U=20,K=0.05;const u=v=>v*U;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const WW=u(900),WH=u(700);
// ---------- land / water (metres, converted to units) ----------
export const LAND=[[0,0,340,660],[340,0,900,135],[385,455,530,620],[545,440,650,500],[545,515,712,650],[722,440,900,650]].map(r=>r.map(u));
const BEACH=[[385,612,530,620],[545,640,712,650],[722,640,900,650]].map(r=>r.map(u));
export const AREAS=[['ikeja','Ikeja',0,0,175,190,'#cdbb8e'],['airport','Murtala Airport',175,0,440,135,'#b5c07e'],['oworo','Oworonshoki',440,0,900,135,'#bfb58a'],
 ['oshodi','Oshodi',0,190,175,330,'#c4ae84'],['yaba','Yaba',175,135,340,380,'#cbbf95'],['surulere','Surulere',0,330,175,700,'#b9c48a'],['makoko','Ebute-Metta & Makoko',175,380,385,700,'#b9a87c'],
 ['island','Lagos Island (CMS)',385,440,537,630,'#cfc6b0'],['ikoyi','Ikoyi',537,430,652,508,'#9fbf78'],['vi','Victoria Island',537,508,716,700,'#c9c3ad'],['lekki','Lekki Phase 1',716,430,830,700,'#d6c9a0'],['ajah','Ajah',830,430,900,700,'#cbbd8a'],
 ['lagoon','Lagos Lagoon',-999,-999,9999,9999,'#000']].map(([id,n,x0,y0,x1,y1,c])=>({id,n,r:[u(x0),u(y0),u(x1),u(y1)],c}));
export const AMB={ikeja:'yaba',oshodi:'yaba',yaba:'yaba',surulere:'yaba',makoko:'yaba',island:'yaba',airport:'vi',oworo:'yaba',ikoyi:'vi',vi:'vi',lekki:'lekki',ajah:'lekki',lagoon:'lekki'};
export function areaAt(x,y){for(let i=0;i<AREAS.length;i++){const r=AREAS[i].r;if(x>=r[0]&&x<r[2]&&y>=r[1]&&y<r[3])return i}return AREAS.length-1}
// ---------- roads (metres: x0,y0,x1,y1,width,name) ----------
const RD=[[0,60,900,60,14,'Airport Road'],[0,170,340,170,12,'Ikeja Avenue'],[0,260,340,260,12,'Oshodi Road'],[0,360,340,360,12,'Herbert Way'],[0,480,340,480,12,'Surulere Road'],[0,560,530,560,12,'Carter Way'],
 [40,0,40,660,10,'Agege Line'],[110,0,110,660,12,'Ikorodu Road'],[200,60,200,660,12,'Murtala Street'],[280,60,280,660,12,'Herbert Macaulay'],[470,60,470,620,16,'Third Mainland Bridge'],
 [385,480,900,480,12,'Admiralty Link'],[385,604,530,604,10,'Marina'],[410,455,410,620,10,'Broad Street'],
 [590,440,590,650,12,'Awolowo Road'],[545,548,900,548,16,'Lekki-Epe Expressway'],[545,632,900,632,10,'Coast Road'],[650,515,650,650,10,'Adeola Road'],
 [760,440,760,650,12,'Admiralty Way'],[820,440,820,650,10,'Fola Street'],[870,440,870,650,10,'Ajah Road']];
export const ROADS=RD.map(([x0,y0,x1,y1,w,n])=>({x0:u(x0),y0:u(y0),x1:u(x1),y1:u(y1),w:u(w),n,h:y0===y1}));
export const BRIDGES=[[470,135,470,455,16,'Third Mainland Bridge'],[340,560,385,560,12,'Carter Bridge'],[530,480,545,480,12,'Ikoyi Bridge'],[590,500,590,515,12,'Falomo Bridge'],[650,480,722,480,12,'Lekki-Ikoyi Link Bridge'],[712,548,722,548,16,'Lekki Bridge'],[712,632,722,632,10,'Coast Bridge']].map(([x0,y0,x1,y1,w,n])=>({x0:u(x0),y0:u(y0),x1:u(x1),y1:u(y1),w:u(w),n}));
const RB=[[200,360],[590,548],[760,548]].map(p=>p.map(u));
const SWK=u(2.5);// sidewalk width
export function inLand(x,y){for(const r of LAND)if(x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])return true;return false}
function onBridge(x,y,m=SWK){for(const b of BRIDGES){const hw=b.w/2+m;if(b.x0===b.x1){if(Math.abs(x-b.x0)<hw&&y>=b.y0-hw&&y<=b.y1+hw)return b}else if(Math.abs(y-b.y0)<hw&&x>=b.x0-hw&&x<=b.x1+hw)return b}return null}
export function water(x,y){return !inLand(x,y)&&!onBridge(x,y)}
export function onRoadW(x,y,m=0){for(const r of ROADS){const hw=r.w/2+m;if(r.h){if(Math.abs(y-r.y0)<hw&&x>=r.x0-hw&&x<=r.x1+hw)return r}else if(Math.abs(x-r.x0)<hw&&y>=r.y0-hw&&y<=r.y1+hw)return r}for(const c of RB)if(Math.hypot(x-c[0],y-c[1])<u(15)+m)return {rb:1};return null}
export const isBeach=(x,y)=>BEACH.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3]);
// ---------- road graph ----------
export const NODES=[],EDGES=[];
(function graph(){const key=(x,y)=>x+','+y,map={};const node=(x,y)=>{const k=key(x,y);if(map[k]!=null)return map[k];NODES.push({x,y,e:[],id:NODES.length});return map[k]=NODES.length-1};
 const H=ROADS.filter(r=>r.h),V=ROADS.filter(r=>!r.h);
 for(const r of ROADS){const pts=[r.h?r.x0:r.y0,r.h?r.x1:r.y1];for(const o of (r.h?V:H)){if(r.h){if(o.x0>=r.x0&&o.x0<=r.x1&&r.y0>=o.y0&&r.y0<=o.y1)pts.push(o.x0)}else if(o.y0>=r.y0&&o.y0<=r.y1&&r.x0>=o.x0&&r.x0<=o.x1)pts.push(o.y0)}
  const s=[...new Set(pts)].sort((a,b)=>a-b);for(let i=0;i<s.length-1;i++){const a=r.h?node(s[i],r.y0):node(r.x0,s[i]),b=r.h?node(s[i+1],r.y0):node(r.x0,s[i+1]);const A=NODES[a],B=NODES[b],len=Math.hypot(B.x-A.x,B.y-A.y);
   const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;const e={id:EDGES.length,a,b,len,dx:(B.x-A.x)/len,dy:(B.y-A.y)/len,w:r.w,road:r,br:!!onBridge(mx,my,0)&&!inLand(mx,my)};EDGES.push(e);A.e.push(e.id);B.e.push(e.id)}}
 for(const n of NODES){n.rb=RB.some(c=>c[0]===n.x&&c[1]===n.y);const ws=n.e.map(i=>EDGES[i].w);n.light=!n.rb&&n.e.length>=3&&ws.filter(w=>w>=u(12)).length>=3&&inLand(n.x,n.y)?{off:(n.x*7+n.y*13)%20}:null}})();
export const LIGHTS=NODES.filter(n=>n.light);
// light state for an axis at time t (seconds): 'g','a','r'
export function lightState(n,horiz,t){const c=(t+n.light.off)%20;if(horiz)return c<8?'g':c<10?'a':'r';return c>=10&&c<18?'g':c>=18?'a':'r'}
export function nearestNode(x,y,filter){let b=-1,bd=1e18;for(const n of NODES){if(filter&&!filter(n))continue;const d=(n.x-x)**2+(n.y-y)**2;if(d<bd){bd=d;b=n.id}}return b}
export function route(a,b,avoidBridge){const dist=new Float64Array(NODES.length).fill(Infinity),prev=new Int32Array(NODES.length).fill(-1),done=new Uint8Array(NODES.length);dist[a]=0;
 for(;;){let m=-1,md=Infinity;for(let i=0;i<NODES.length;i++)if(!done[i]&&dist[i]<md){md=dist[i];m=i}if(m<0||m===b)break;done[m]=1;
  for(const ei of NODES[m].e){const e=EDGES[ei],o=e.a===m?e.b:e.a,nd=md+e.len*(avoidBridge&&e.br?6:1);if(nd<dist[o]){dist[o]=nd;prev[o]=m}}}
 if(!isFinite(dist[b]))return [a];const p=[b];while(p[0]!==a)p.unshift(prev[p[0]]);return p}
export function pathPts(nodes,lane=0){// polyline in units with right-hand lane offset
 const P=[];for(let i=0;i<nodes.length;i++){const n=NODES[nodes[i]];let ox=0,oy=0;if(lane){const a=NODES[nodes[Math.max(0,i-1)]],b=NODES[nodes[Math.min(nodes.length-1,i+1)]];let dx=b.x-a.x,dy=b.y-a.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;ox=-dy*lane;oy=dx*lane}P.push([n.x+ox,n.y+oy])}return P}
export function plLen(P){let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s}
export function plAt(P,d){for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(d<=l||i===P.length-1){const t=l?Math.min(1,d/l):0;return{x:P[i-1][0]+(P[i][0]-P[i-1][0])*t,y:P[i-1][1]+(P[i][1]-P[i-1][1])*t,h:Math.atan2(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])}}d-=l}const q=P[P.length-1];return{x:q[0],y:q[1],h:0}}
// ---------- landmark buildings (enterable / interactive) ----------
export const B=[];
function bd(id,kind,x0,y0,x1,y1,door,col,roof,lab,H=64){const x=u(x0),y=u(y0),w=u(x1-x0),h=u(y1-y0),o=16;const dp={s:[x+w/2,y+h+o,0,1],n:[x+w/2,y-o,0,-1],e:[x+w+o,y+h/2,1,0],w:[x-o,y+h/2,-1,0]}[door];
 const b={id,kind,x,y,w,h,col,roof,lab,H,side:door,door:{x:dp[0],y:dp[1]},out:[dp[2],dp[3]]};B.push(b);return b}
// Yaba
bd('room','home',212,226,236,250,'s','#d9a066','#8a4b2a',['Your Room (Face-me-I-face-you yard)','Your Room (Face-me-I-face-you)']);
bd('buka','buka',242,232,262,250,'s','#f4e1b0','#2e7d32',['Mama Shitta Amala Spot','Mama Shitta Amala Joint']);
bd('tech','tech',292,214,326,250,'s','#9fd3ff','#1b3a5c',['Yabacon Tech Hub','Yabacon Tech Hub'],90);
bd('park0','park',214,270,240,282,'n','#ffd400','#333',['Yaba Danfo Park','Yaba Motor Park'],40);
bd('worship','worship',248,270,270,292,'n','#fafafa','#1565c0',['Mosque & Church Corner','Mosque & Church Side']);
bd('fuel','fuel',290,270,312,284,'n','#ffffff','#0b7a3e',['Mega Fuel Station Yaba','Fuel Station Yaba'],46);
bd('jetty0','jetty',326,300,336,312,'w','#8d6e63','#1565c0',['Yaba Ferry Jetty','Yaba Ferry Jetty'],30);
bd('brt2','brt',288,196,291,212,'w','#1565c0','#0d47a1',['BRT Stop — Yaba','BRT Stop — Yaba'],30);
// Ikeja
bd('cvillage','repair',50,125,100,160,'s','#ffcc80','#37474f',['Computer Village Plaza','Computer Village'],70);
bd('dealer','dealer',120,125,160,160,'s','#e0f7fa','#263238',['Gidi Motors Tokunbo Lot','Gidi Motors Tokunbo'],56);
bd('fuel2','fuel',120,69,142,82,'n','#ffffff','#c62828',['Eko Petrol Ikeja','Eko Petrol Ikeja'],46);
bd('brt0','brt',113,96,116,112,'w','#1565c0','#0d47a1',['BRT Stop — Ikeja','BRT Stop — Ikeja'],30);
bd('airport','airport',300,72,380,110,'n','#eceff1','#90a4ae',['Murtala International Airport','Murtala Airport (Japa Gate)'],80);
// Oshodi
bd('park3','park',50,268,100,282,'n','#ffd400','#333',['Oshodi Transport Terminal','Oshodi Terminal'],40);
bd('omarket','market',48,200,102,250,'s','#ff8a65','#c62828',['Oshodi Under-Bridge Market','Oshodi Market']);
bd('brt1','brt',113,228,116,244,'w','#1565c0','#0d47a1',['BRT Stop — Oshodi','BRT Stop — Oshodi'],30);
// Surulere / Ebute / Makoko
bd('stadium','stadium',120,372,192,470,'w','#cfd8dc','#2e7d32',['National Stadium Surulere','National Stadium'],70);
bd('makoko','boat',326,418,336,430,'w','#8d6e63','#5d4037',['Makoko Canoe Jetty','Makoko Canoe Jetty'],30);
bd('brt3','brt',288,500,291,516,'w','#1565c0','#0d47a1',['BRT Stop — Ebute-Metta','BRT Stop — Ebute-Metta'],30);
// Lagos Island
bd('market','market',420,490,456,526,'w','#ff8a65','#c62828',['Marina Mega Market','Market (CMS)']);
bd('park4','park',482,490,500,504,'n','#ffd400','#333',['CMS Danfo Park','CMS Motor Park'],40);
bd('brt4','brt',415,500,417.5,514,'w','#1565c0','#0d47a1',['BRT Stop — CMS','BRT Stop — CMS'],30);
// Ikoyi
bd('jetty1','jetty',600,443,610,451,'s','#8d6e63','#1565c0',['Ikoyi Ferry Jetty','Ikoyi Ferry Jetty'],30);
// Victoria Island
bd('bank','bank',598,560,640,582,'n','#cfd8dc','#0d47a1',['Gidi Trust Bank','Gidi Trust Bank'],110);
bd('club','club',660,560,700,582,'n','#311b92','#111',['Kwilox Club','Kwilox Club'],80);
bd('hospital','hospital',548,560,580,582,'n','#fafafa','#b71c1c',['General Hospital Lagos','General Hospital'],100);
bd('buka2','buka',600,519,618,537,'s','#ffe0b2','#e65100',['Suya & Jollof Joint','Suya & Jollof Joint']);
bd('park1','park',660,520,690,537,'s','#ffd400','#333',['VI Danfo Park','VI Motor Park'],40);
// Lekki / Ajah
bd('flat','home',772,500,808,536,'s','#eceff1','#455a64',['Lekki Phase 1 Flats','Lekki Phase 1 Flats'],120);
bd('studio','studio',829,502,860,536,'s','#ff4081','#212121',['Lekki Vibes Studio','Lekki Vibes Studio'],80);
bd('park2','park',770,560,800,575,'n','#ffd400','#333',['Lekki Danfo Park','Lekki Motor Park'],40);
bd('fuel3','fuel',729,560,750,575,'n','#ffffff','#0b7a3e',['Mega Fuel Station Lekki','Fuel Station Lekki'],46);
bd('beach','beach',790,641,810,646,'n','#ffe082','#00838f',['Elegushy Beach Gate','Elegushy Beach Gate'],40);
bd('jetty2','jetty',775,443,785,451,'s','#8d6e63','#1565c0',['Lekki Ferry Jetty','Lekki Ferry Jetty'],30);
export const BY={};B.forEach(b=>BY[b.id]=b);
['fuel','fuel2','fuel3','club','hospital','airport','bank'].forEach(id=>BY[id].gen=1);
export const PARKS=['park0','park3','park4','park1','park2'],BRT=['brt0','brt1','brt2','brt3','brt4'],JETTIES=['jetty0','jetty1','jetty2'];
export const HUBS=[...PARKS,...BRT,...JETTIES,'airport'];
// ferry water paths (metres) between jetties
const FP={'jetty0>jetty1':[[338,306],[346,306],[560,300],[605,425],[605,440]],'jetty0>jetty2':[[338,306],[346,306],[560,300],[780,420],[780,440]],'jetty1>jetty2':[[605,440],[605,420],[780,420],[780,440]]};
export function ferryPath(a,b){let p=FP[a+'>'+b];if(p)return p.map(q=>q.map(u));p=FP[b+'>'+a];return p?p.slice().reverse().map(q=>q.map(u)):null}
export const CANOE=[[338,424],[346,424],[372,398],[382,428],[366,450],[346,440],[346,424],[338,424]].map(q=>q.map(u));
// ---------- filler buildings (procedural, deterministic) ----------
const PROF={ikeja:{t:[['storey',.55],['bung',.25],['shop',.2]],f:[2,4]},oshodi:{t:[['storey',.6],['shop',.4]],f:[2,4]},yaba:{t:[['storey',.6],['bung',.3],['shop',.1]],f:[2,4]},surulere:{t:[['bung',.55],['storey',.45]],f:[1,3]},
 makoko:{t:[['bung',.7],['storey',.3]],f:[1,2]},island:{t:[['tower',.55],['storey',.45]],f:[8,30]},ikoyi:{t:[['storey',.5],['tower',.25],['bung',.25]],f:[3,12]},vi:{t:[['tower',.6],['storey',.4]],f:[6,28]},
 lekki:{t:[['duplex',.7],['storey',.3]],f:[2,3]},ajah:{t:[['bung',.6],['storey',.4]],f:[1,3]},airport:{t:[['storey',1]],f:[1,2]},oworo:{t:[['bung',.6],['storey',.4]],f:[1,3]}};
export const FILL=[];
const GRID=new Map(),GC=u(20);const gk=(i,j)=>i*4096+j;
function gridAdd(r,idx){for(let i=Math.floor(r[0]/GC);i<=Math.floor(r[2]/GC);i++)for(let j=Math.floor(r[1]/GC);j<=Math.floor(r[3]/GC);j++){const k=gk(i,j);let a=GRID.get(k);if(!a)GRID.set(k,a=[]);a.push(idx)}}
const RECTS=[];// all solid rects [x0,y0,x1,y1]
function rectHit(x,y,m=0){const a=GRID.get(gk(Math.floor(x/GC),Math.floor(y/GC)));if(!a)return null;for(const i of a){const r=RECTS[i];if(x>r[0]-m&&x<r[2]+m&&y>r[1]-m&&y<r[3]+m)return r}return null}
function freeRect(r,m){for(let i=Math.floor((r[0]-m)/GC);i<=Math.floor((r[2]+m)/GC);i++)for(let j=Math.floor((r[1]-m)/GC);j<=Math.floor((r[3]+m)/GC);j++){const a=GRID.get(gk(i,j));if(a)for(const k of a){const q=RECTS[k];if(r[0]-m<q[2]&&r[2]+m>q[0]&&r[1]-m<q[3]&&r[3]+m>q[1])return false}}return true}
function rectOk(r){const cs=[[r[0],r[1]],[r[2],r[1]],[r[0],r[3]],[r[2],r[3]],[(r[0]+r[2])/2,(r[1]+r[3])/2]];for(const [x,y] of cs){if(!inLand(x,y)||isBeach(x,y)||onRoadW(x,y,SWK+u(1)))return false}
 // roads crossing through the rect
 for(const rd of ROADS){const hw=rd.w/2+SWK+u(1);if(rd.h){if(rd.y0+hw>r[1]&&rd.y0-hw<r[3]&&rd.x1>r[0]&&rd.x0<r[2])return false}else if(rd.x0+hw>r[0]&&rd.x0-hw<r[2]&&rd.y1>r[1]&&rd.y0<r[3])return false}
 if(r[1]<u(48)&&r[0]>u(190)&&r[2]<u(445))return false;// runway
 return true}
B.forEach(b=>{const r=[b.x,b.y,b.x+b.w,b.y+b.h];RECTS.push(r);gridAdd(r,RECTS.length-1)});
// reserved open spaces (lots, flyover terminal, beach gate)
const RES=[];B.forEach(b=>{const m=b.kind==='park'||b.kind==='fuel'?u(6):u(3);RES.push([b.x-m,b.y-m,b.x+b.w+m,b.y+b.h+m])});
const TS=u(100);export const NTX=Math.ceil(WW/TS),NTY=Math.ceil(WH/TS);
const RUNWAY=[200,18,430,38].map(u);
const FLY={x0:u(-60),x1:u(150),r1:u(190),y:u(225),h:8,w:u(11)};
RES.push([FLY.x1,FLY.y-u(7),FLY.r1,FLY.y+u(7)]);
(function genFill(){const r=rng(2026);const PAL=['#e8d5b0','#f2e6c9','#d9c3a0','#c9e4ca','#f7d9c4','#e6e6e6','#cfd8dc','#ffe0b2','#d7ccc8','#b3e5fc','#fff3c4','#f8bbd0','#dcedc8'],GL=['#8fb8d8','#7fbfb6','#a8b8c4','#9cc9a4','#6f93b8','#c9d6e0'];
 const pick=t=>{let x=r(),a=0;for(const [k,p] of t){a+=p;if(x<a)return k}return t[0][0]};
 for(const rd of ROADS)for(const side of [-1,1]){const L=rd.h?rd.x1-rd.x0:rd.y1-rd.y0;let t=u(4)+r()*u(6);
  while(t<L-u(6)){const ax=rd.h?rd.x0+t:rd.x0,ay=rd.h?rd.y0:rd.y0+t,ar=AREAS[areaAt(ax+(rd.h?0:side*u(15)),ay+(rd.h?side*u(15):0))].id,P=PROF[ar];if(!P){t+=u(20);continue}
   const ty=pick(P.t),tower=ty==='tower';const fw=u(tower?10+r()*12:ty==='shop'?6+r()*6:8+r()*10),dp=u(tower?10+r()*12:ty==='bung'?9+r()*5:10+r()*10);
   let placed=0;for(let row=0;row<(tower?1:2);row++){if(row&&r()<.45)break;const sb=rd.w/2+SWK+u(1.5)+(row?dp+u(3):0),d2=row?u(8+r()*6):dp;
    let rc;if(rd.h){const y=rd.y0+side*sb;rc=side>0?[ax,y,ax+fw,y+d2]:[ax,y-d2,ax+fw,y]}else{const x=rd.x0+side*sb;rc=side>0?[x,ay,x+d2,ay+fw]:[x-d2,ay,x,ay+fw]}
    if(!rectOk(rc)||!freeRect(rc,u(1.5)))continue;if(RES.some(q=>rc[0]<q[2]&&rc[2]>q[0]&&rc[1]<q[3]&&rc[3]>q[1]))continue;
    const fl=Math.round(P.f[0]+r()*(P.f[1]-P.f[0])*(tower?r():1)),h=ty==='bung'?3.6+r()*.8:ty==='duplex'?6.8:ty==='shop'?3.4:fl*3.2+.4;
    const f={x0:rc[0],y0:rc[1],x1:rc[2],y1:rc[3],t:ty==='shop'?'storey':ty,h:tower?Math.max(24,h):h,c:tower?GL[Math.floor(r()*GL.length)]:PAL[Math.floor(r()*PAL.length)],a:ar,tank:ty==='storey'&&r()<.6,face:rd.h?(side>0?'n':'s'):(side>0?'w':'e'),shop:ty==='shop'};
    FILL.push(f);RECTS.push(rc);gridAdd(rc,RECTS.length-1);placed=1}
   t+=placed?fw+u(2+r()*5):u(3)}}
 // infill: compounds behind the street frontage
 for(let k=0;k<9000;k++){const x=r()*WW,y=r()*WH,ai=areaAt(x,y),ar=AREAS[ai].id,P=PROF[ar];if(!P)continue;const ty=pick(P.t),tower=ty==='tower';
  const w=u(tower?10+r()*12:7+r()*9),d=u(tower?10+r()*12:7+r()*8),rc=[x,y,x+w,y+d];if(!rectOk(rc)||!freeRect(rc,u(2.5))||RES.some(q=>rc[0]<q[2]&&rc[2]>q[0]&&rc[1]<q[3]&&rc[3]>q[1]))continue;
  const fl=Math.round(P.f[0]+r()*(P.f[1]-P.f[0])*(tower?r():1)),h=ty==='bung'?3.6+r()*.8:ty==='duplex'?6.8:ty==='shop'?3.4:fl*3.2+.4;
  FILL.push({x0:rc[0],y0:rc[1],x1:rc[2],y1:rc[3],t:ty==='shop'?'storey':ty,h:tower?Math.max(24,h):h,c:tower?GL[Math.floor(r()*GL.length)]:PAL[Math.floor(r()*PAL.length)],a:ar,tank:ty==='storey'&&r()<.6});RECTS.push(rc);gridAdd(rc,RECTS.length-1)}})();
export function blocked(x,y){if(x<10||y<10||x>WW-10||y>WH-10||water(x,y))return true;return !!rectHit(x,y,6)}
export function blockedCar(x,y){if(x<10||y<10||x>WW-10||y>WH-10||water(x,y))return true;return !!rectHit(x,y,2)}
// ---------- 2D painter (tiles, overview map) ----------
export function paint(g,x0,y0,x1,y1,detail){const r=rng((x0*31+y0*17)|0),hit=q=>q[0]<x1&&q[2]>x0&&q[1]<y1&&q[3]>y0;
 for(const L of LAND){if(!hit(L))continue;for(const A of AREAS){if(A.id==='lagoon')continue;const a=[Math.max(L[0],A.r[0]),Math.max(L[1],A.r[1]),Math.min(L[2],A.r[2]),Math.min(L[3],A.r[3])];if(a[2]>a[0]&&a[3]>a[1]&&hit(a)){g.fillStyle=A.c;g.fillRect(a[0],a[1],a[2]-a[0],a[3]-a[1])}}}
 if(detail){for(let i=0;i<70;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);if(!inLand(x,y)||onRoadW(x,y,SWK))continue;const ai=AREAS[areaAt(x,y)].id,green=['ikoyi','surulere','airport','lekki'].includes(ai);
   g.fillStyle=green||r()<.4?`rgba(${90+r()*40|0},${140+r()*40|0},${50+r()*30|0},.55)`:`rgba(${150+r()*30|0},${120+r()*20|0},${80|0},.35)`;g.beginPath();g.ellipse(x,y,u(2+r()*7),u(1.5+r()*4),r()*3,0,7);g.fill()}}
 g.fillStyle='#ecd9a2';for(const q of BEACH)if(hit(q)){g.fillRect(q[0],q[1],q[2]-q[0],q[3]-q[1]+u(3))}
 if(hit(RUNWAY)){g.fillStyle='#4a4a4c';g.fillRect(RUNWAY[0],RUNWAY[1],RUNWAY[2]-RUNWAY[0],RUNWAY[3]-RUNWAY[1]);g.fillStyle='#eee';for(let x=RUNWAY[0]+u(10);x<RUNWAY[2]-u(10);x+=u(18))g.fillRect(x,(RUNWAY[1]+RUNWAY[3])/2-u(.4),u(9),u(.8));g.fillStyle='#5a5a5c';g.fillRect(u(330),RUNWAY[3],u(12),u(60-38-7))}
 // lots in front of landmark doors
 for(const b of B){if(!['park','fuel','market','airport','stadium','dealer','repair','hospital','bank'].includes(b.kind))continue;const m=u(b.kind==='park'?6:4),q=[b.x-m,b.y-m,b.x+b.w+m,b.y+b.h+m];if(!hit(q))continue;g.fillStyle=b.kind==='market'?'#a89a86':'#8f8f8f';g.fillRect(q[0],q[1],q[2]-q[0],q[3]-q[1])}
 const rs=ROADS.filter(rd=>hit([Math.min(rd.x0,rd.x1)-u(12),Math.min(rd.y0,rd.y1)-u(12),Math.max(rd.x0,rd.x1)+u(12),Math.max(rd.y0,rd.y1)+u(12)]));
 const rr=(rd,hw,c)=>{g.fillStyle=c;if(rd.h)g.fillRect(rd.x0-hw,rd.y0-hw,rd.x1-rd.x0+2*hw,2*hw);else g.fillRect(rd.x0-hw,rd.y0-hw,2*hw,rd.y1-rd.y0+2*hw)};
 for(const rd of rs)rr(rd,rd.w/2+SWK,'#b9b2a3');
 if(detail)for(const rd of rs){g.fillStyle='rgba(0,0,0,.18)';const hw=rd.w/2+SWK;for(let k=0;k<(rd.h?rd.x1-rd.x0:rd.y1-rd.y0);k+=u(1.6)){if(rd.h){g.fillRect(rd.x0+k,rd.y0-hw,u(.06),SWK);g.fillRect(rd.x0+k,rd.y0+rd.w/2,u(.06),SWK)}else{g.fillRect(rd.x0-hw,rd.y0+k,SWK,u(.06));g.fillRect(rd.x0+rd.w/2,rd.y0+k,SWK,u(.06))}}}
 for(const rd of rs)rr(rd,rd.w/2+u(.45),'#2b2b2b');// gutter
 for(const rd of rs)rr(rd,rd.w/2,'#46464a');
 for(const c of RB){g.fillStyle='#46464a';g.beginPath();g.arc(c[0],c[1],u(15),0,7);g.fill()}
 if(detail){for(const rd of rs){const rr2=rng((rd.x0+rd.y0*3)|0),L=rd.h?rd.x1-rd.x0:rd.y1-rd.y0;
   g.fillStyle='rgba(255,255,255,.035)';for(let i=0;i<L/u(3);i++){const t=rr2()*L,o=(rr2()-.5)*rd.w;g.fillRect(rd.h?rd.x0+t:rd.x0+o,rd.h?rd.y0+o:rd.y0+t,u(1+rr2()*3),u(.3))}
   const dash=(off,c,dl,gap,wd)=>{g.fillStyle=c;for(let t=0;t<L;t+=dl+gap){if(rd.h)g.fillRect(rd.x0+t,rd.y0+off-wd/2,dl,wd);else g.fillRect(rd.x0+off-wd/2,rd.y0+t,wd,dl)}};
   if(rd.w>=u(16)){dash(-u(.25),'#f2c230',L,0,u(.18));dash(u(.25),'#f2c230',L,0,u(.18));dash(-rd.w/4,'#e8e8e8',u(3),u(6),u(.15));dash(rd.w/4,'#e8e8e8',u(3),u(6),u(.15))}else dash(0,rd.w>=u(12)?'#f2c230':'#dcdcdc',u(3),u(5),u(.18));
   dash(-rd.w/2+u(.35),'#d9d9d9',L,0,u(.14));dash(rd.w/2-u(.35),'#d9d9d9',L,0,u(.14));
   for(let i=0;i<L/u(28);i++){const t=rr2()*L,o=(rr2()-.5)*rd.w*.8;g.fillStyle='#2a2522';g.beginPath();g.ellipse(rd.h?rd.x0+t:rd.x0+o,rd.h?rd.y0+o:rd.y0+t,u(.5+rr2()*.9),u(.35+rr2()*.5),rr2()*3,0,7);g.fill();g.fillStyle='rgba(60,50,40,.5)';g.beginPath();g.ellipse(rd.h?rd.x0+t+u(.2):rd.x0+o+u(.2),rd.h?rd.y0+o:rd.y0+t,u(.3),u(.2),0,0,7);g.fill()}}
  // junction boxes, zebras, stop lines
  for(const n of NODES){if(n.x<x0-u(20)||n.x>x1+u(20)||n.y<y0-u(20)||n.y>y1+u(20)||n.e.length<3||n.rb)continue;let hw=0,vw=0;for(const ei of n.e){const e=EDGES[ei];if(Math.abs(e.dx)>.5)hw=Math.max(hw,e.w/2);else vw=Math.max(vw,e.w/2)}
   g.fillStyle='#46464a';g.fillRect(n.x-vw,n.y-hw,vw*2,hw*2);
   if(n.light){g.fillStyle='#ececec';for(const ei of n.e){const e=EDGES[ei],sgn=e.a===n.id?1:-1,hz=Math.abs(e.dx)>.5,W=e.w;for(let k=-W/2+u(.5);k<W/2-u(.3);k+=u(1.1)){if(hz)g.fillRect(n.x+sgn*(vw+u(.6)),n.y+k,sgn*u(3),u(.55));else g.fillRect(n.x+k,n.y+sgn*(hw+u(.6)),u(.55),sgn*u(3))}
     if(hz)g.fillRect(n.x+sgn*(vw+u(4)),n.y+(sgn>0?0:-W/2),u(.4)*sgn,W/2);else g.fillRect(n.x+(sgn>0?-W/2:0),n.y+sgn*(hw+u(4)),W/2,u(.4)*sgn)}}}
 }
 for(const c of RB){g.fillStyle='#7cb342';g.beginPath();g.arc(c[0],c[1],u(7),0,7);g.fill();g.strokeStyle='#eee';g.lineWidth=u(.5);g.stroke()}
 if(!detail){g.fillStyle='#ffd400';for(const b of B){g.fillStyle=b.kind==='park'?'#ffd400':b.kind==='brt'?'#1e88e5':b.kind==='jetty'||b.kind==='boat'?'#00acc1':b.kind==='hospital'?'#e53935':b.roof;g.fillRect(b.x,b.y,Math.max(b.w,u(4)),Math.max(b.h,u(4)))}
  g.fillStyle='rgba(60,50,40,.35)';for(const f of FILL)g.fillRect(f.x0,f.y0,f.x1-f.x0,f.y1-f.y0)}
}
export const OV=(()=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=900;c.height=700;const g=c.getContext('2d');g.scale(900/WW,700/WH);paint(g,0,0,WW,WH,false);return c})();
// ---------- traffic + pedestrian simulation ----------
export const VT={danfo:{L:4.4,W:1.9,v:12.5},car:{L:4.4,W:1.8,v:14.5},keke:{L:2.7,W:1.4,v:8.5},okada:{L:2,W:.8,v:14},brt:{L:11,W:2.5,v:11.5},taxi:{L:4.4,W:1.8,v:14}};
export const VEH=[],PEDS=[];
const CARC=['#e53935','#1e88e5','#fafafa','#212121','#9e9e9e','#43a047','#fb8c00','#6d4c41'];
const SK=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59'],OC=['#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#fb8c00','#00897b','#fff','#795548','#f06292'];
const laneOff=e=>e.w>=u(16)?e.w*.31:e.w*.25;
export function initSim(nV,nP){VEH.length=0;PEDS.length=0;const r=rng(99);const pickE=()=>EDGES[Math.floor(r()*EDGES.length)];
 for(let i=0;i<nV;i++){const x=r(),t=x<.36?'car':x<.66?'danfo':x<.8?'keke':x<.95?'okada':'brt';let e=pickE();if((t==='keke'||t==='okada')&&e.br)e=pickE();
  VEH.push({id:i,t,e:e.id,dir:r()<.5?1:-1,s:r()*e.len,sp:0,vm:VT[t].v*U*(.85+r()*.3),L:VT[t].L*U,W:VT[t].W*U,c:t==='car'?CARC[i%CARC.length]:null,hc:0,act:true,x:0,y:0,h:0,ph:r()*6})}
 for(let i=0;i<nP;i++){const e=pickE();PEDS.push({id:i,e:e.id,dir:r()<.5?1:-1,s:r()*e.len,side:r()<.5?1:-1,sp:(1.1+r()*.6)*U,home:Math.floor(r()*NODES.length),work:Math.floor(r()*NODES.length),idle:0,ph:r()*6,
  look:{skin:SK[i%5],out:OC[(i*3)%OC.length],hair:i%5,body:i%2},x:0,y:0,h:0,hid:false,nt:r()})}
 posAll()}
function vpos(v){const E=EDGES[v.e],A=NODES[v.dir>0?E.a:E.b],dx=E.dx*v.dir,dy=E.dy*v.dir,lo=laneOff(E);v.x=A.x+dx*v.s-dy*lo;v.y=A.y+dy*v.s+dx*lo;v.h=Math.atan2(dx,dy);v.dx=dx;v.dy=dy}
function ppos(p){const E=EDGES[p.e],A=NODES[p.dir>0?E.a:E.b],dx=E.dx*p.dir,dy=E.dy*p.dir,lo=(E.w/2+u(1.25))*p.side;p.x=A.x+dx*p.s-dy*lo;p.y=A.y+dy*p.s+dx*lo;p.h=Math.atan2(dx,dy)}
function posAll(){VEH.forEach(vpos);PEDS.forEach(ppos)}
function nextEdge(cur,node,avoidBr,r,target){const n=NODES[node],opts=n.e.filter(i=>i!==cur);if(!opts.length)return cur;let o=opts;if(avoidBr){const nb=opts.filter(i=>!EDGES[i].br);if(nb.length)o=nb}
 if(target!=null&&Math.random()<.75){let best=o[0],bd=1e18;for(const i of o){const E=EDGES[i],m=NODES[E.a===node?E.b:E.a],d=(m.x-NODES[target].x)**2+(m.y-NODES[target].y)**2;if(d<bd){bd=d;best=i}}return best}
 const ce=EDGES[cur];const straight=o.find(i=>Math.abs(EDGES[i].dx)===Math.abs(ce.dx));if(straight!=null&&Math.random()<.5)return straight;return o[Math.floor(Math.random()*o.length)]}
export const SIM={T:0,rush:0,jam:0};
// ctx:{p:{x,y},foot:bool,car:{x,y,sp,h}|null,hour,wet,onHit(v),onHonk(v),noKill}
export function simTick(dt,ctx){SIM.T+=dt;const T=SIM.T,h=ctx.hour,rush=(h>=7&&h<10)||(h>=16.5&&h<20)?1:0;SIM.rush=rush;
 const act=rush?1:h>=22||h<5?.35:.72,vf=(rush?.42:1)*(ctx.wet>.5?.78:1);
 const lanes=new Map();for(const v of VEH){v.act=(v.id/VEH.length)<act;if(!v.act)continue;const k=v.e*2+(v.dir>0?1:0);let a=lanes.get(k);if(!a)lanes.set(k,a=[]);a.push(v)}
 for(const a of lanes.values())a.sort((p,q)=>p.s-q.s);
 const P=ctx.p;let slow=0,cnt=0;
 for(const a of lanes.values())for(let i=0;i<a.length;i++){const v=a[i],E=EDGES[v.e],end=NODES[v.dir>0?E.b:E.a];let tgt=v.vm*vf;
  const ld=a[i+1];if(ld){const gap=ld.s-v.s-(ld.L+v.L)/2;const safe=u(2)+v.sp*1.1;if(gap<safe)tgt=Math.min(tgt,gap<u(1.2)?0:ld.sp*Math.max(0,gap/safe))}
  // lights & roundabouts
  if(end.light){const hz=Math.abs(E.dx)>.5,st=lightState(end,hz,T);const stopS=E.len-u(10);const need=stopS-v.s;if(st!=='g'&&need>-u(1)&&!(st==='a'&&need<u(3))){tgt=Math.min(tgt,need<u(.8)?0:Math.sqrt(2*u(5)*need))}}
  if(end.rb&&E.len-v.s<u(22))tgt=Math.min(tgt,v.vm*.45);
  // player on foot / in car ahead
  const ox=P.x-v.x,oy=P.y-v.y,al=ox*v.dx+oy*v.dy,lat=-ox*v.dy+oy*v.dx;
  if(ctx.foot&&!ctx.noKill){if(al>0&&al<u(9)+v.sp*.9&&Math.abs(lat)<u(2.3)){const nearJ=NODES.some?(Math.hypot(end.x-P.x,end.y-P.y)<u(13)):false;tgt=Math.min(tgt,al<u(5)||nearJ?0:v.sp*.35);if(v.hc<=0){v.hc=3.5;ctx.onHonk&&ctx.onHonk(v)}}
   if(Math.abs(al)<v.L/2+u(.35)&&Math.abs(lat)<v.W/2+u(.35)){if(v.sp>u(2.6))ctx.onHit&&ctx.onHit(v);else ctx.push&&ctx.push(v,lat)}}
  if(ctx.car){const c=ctx.car,cx=c.x-v.x,cy=c.y-v.y,ca=cx*v.dx+cy*v.dy,cl2=-cx*v.dy+cy*v.dx;if(ca>0&&ca<u(14)&&Math.abs(cl2)<u(2.4)){const gap=ca-v.L/2-u(2.4);tgt=Math.min(tgt,gap<u(1.5)?0:Math.max(0,c.sp)*.9);if(v.hc<=0&&c.sp<u(1)){v.hc=6;ctx.onHonk&&ctx.onHonk(v)}}}
  v.hc-=dt;const acc=tgt>v.sp?u(2.6):u(8);v.sp+=Math.max(-acc*dt,Math.min(acc*dt,tgt-v.sp));if(v.sp<0)v.sp=0;v.s+=v.sp*dt;
  if(v.s>=E.len){const nid=v.dir>0?E.b:E.a,ne=nextEdge(v.e,nid,v.t==='keke'||v.t==='okada',null,null),N=EDGES[ne];v.s-=E.len;if(ne===v.e)v.dir=-v.dir;else{v.e=ne;v.dir=N.a===nid?1:-1}}
  vpos(v);v.ph+=v.sp*dt*.05;if(Math.hypot(ox,oy)<u(120)){slow+=v.sp<u(2)?1:0;cnt++}}
 SIM.jam=cnt?slow/cnt:0;
 // pedestrians
 const night=h>=22||h<5,goWork=h>=7&&h<17;
 for(const p of PEDS){p.hid=night&&p.nt<.65;if(p.hid)continue;if(p.idle>0){p.idle-=dt;continue}const E=EDGES[p.e];p.s+=p.sp*dt*(ctx.wet>.5?1.3:1);p.ph+=dt*7;
  if(p.s>=E.len){const nid=p.dir>0?E.b:E.a,tg=goWork?p.work:p.home;if(nid===tg){p.idle=20+Math.random()*80;p.work=goWork?Math.floor(Math.random()*NODES.length):p.work}
   const ne=nextEdge(p.e,nid,false,null,nid===tg?null:tg),N=EDGES[ne];p.s-=E.len;if(ne===p.e){p.dir=-p.dir;p.side=-p.side}else{p.e=ne;p.dir=N.a===nid?1:-1;if(Math.random()<.2)p.side=-p.side}}
  ppos(p)}}
// hawkers: walk between stopped cars at busy junctions during go-slow
export const HAWK=[];(function(){const hs=LIGHTS.filter(n=>{const a=AREAS[areaAt(n.x,n.y)].id;return ['oshodi','yaba','ikeja','surulere','island','makoko'].includes(a)}).slice(0,8);const r=rng(5);
 hs.forEach((n,i)=>{for(let k=0;k<2;k++){const e=EDGES[n.e[(i+k)%n.e.length]];HAWK.push({n,e,sgn:e.a===n.id?1:-1,o:u(8)+r()*u(25),sp:u(.8),dir:1,look:{skin:SK[(i+k)%5],out:['#fdd835','#e53935','#43a047','#1e88e5'][(i+k)%4],hair:4,body:0},x:0,y:0,h:0,ph:r()*6,wares:['Gala! Gala!','Pure water ₦50!','Plantain chips!','Phone charger!','Gala & Lacasera!','Agege bread!'][(i*2+k)%6]})}})})();
export function hawkTick(dt){const on=SIM.rush||SIM.jam>.4;for(const w of HAWK){w.on=on;if(!on)continue;w.o+=w.sp*w.dir*dt;if(w.o>u(36))w.dir=-1;if(w.o<u(8))w.dir=1;const e=w.e;w.x=w.n.x+e.dx*w.sgn*w.o;w.y=w.n.y+e.dy*w.sgn*w.o;w.h=Math.atan2(e.dx*w.sgn*w.dir,e.dy*w.sgn*w.dir);w.ph+=dt*6}}
// ---------- 3D ----------
function worldUV(m,mod){m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
 {mat4 MI=modelMatrix;
 #ifdef USE_INSTANCING
 MI=modelMatrix*instanceMatrix;
 #endif
 vec4 wq=MI*vec4(position,1.);vec3 nq=normalize(mat3(MI)*normal);vec2 q=abs(nq.x)>.5?vec2(wq.z,wq.y):vec2(wq.x,wq.y);if(abs(nq.y)>.5)q=vec2(.25,.25);
 vMapUv=q/vec2(${mod[0].toFixed(2)},${mod[1].toFixed(2)});
 #ifdef USE_EMISSIVEMAP
 vEmissiveMapUv=vMapUv;
 #endif
 }`)};m.customProgramCacheKey=()=>'wuv'+mod.join('_')}
export function build3D(A){const {scene,lam,ctex,part,VC,prism}=A,X=v=>v*K;const m4=new THREE.Matrix4(),qt=new THREE.Quaternion(),eu=new THREE.Euler(),pv=new THREE.Vector3(),sv=new THREE.Vector3(),col=new THREE.Color();
 const put=(im,i,x,y,z,ry,sx,sy,sz)=>{eu.set(0,ry||0,0);qt.setFromEuler(eu);pv.set(x,y,z);sv.set(sx,sy,sz);m4.compose(pv,qt,sv);im.setMatrixAt(i,m4)};
 const C={tiles:new Map(),queue:[],fill:[],veh:new Map(),avs:[],wet:0};
 // ----- ground: overview + streamed tiles + outer land -----
 const ovT=new THREE.CanvasTexture(OV);ovT.colorSpace=THREE.SRGBColorSpace;
 const ovM=new THREE.Mesh(new THREE.PlaneGeometry(X(WW),X(WH)).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:ovT,alphaTest:.5,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}));ovM.position.set(X(WW)/2,-.09,X(WH)/2);ovM.receiveShadow=true;scene.add(ovM);
 const outer=lam('#b8ad86');[[X(WW)/2,-200,X(WW)+800,400],[-200,X(u(330)),400,X(u(660))+800]].forEach(([x,z,w,h])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h).rotateX(-Math.PI/2),outer);m.position.set(x,-.12,z);scene.add(m)});
 const tileGeo=new THREE.PlaneGeometry(X(TS),X(TS)).rotateX(-Math.PI/2);
 function makeTile(tx,ty){const px=A.tpx(),c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d'),s=px/TS;g.setTransform(s,0,0,s,-tx*TS*s,-ty*TS*s);paint(g,tx*TS,ty*TS,(tx+1)*TS,(ty+1)*TS,true);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=A.aniso();const m=new THREE.Mesh(tileGeo,new THREE.MeshLambertMaterial({map:t,alphaTest:.5}));m.position.set(X((tx+.5)*TS),0,X((ty+.5)*TS));m.receiveShadow=true;scene.add(m);return {m,t}}
 C.ensureTiles=(x,y,all)=>{const tx=Math.floor(x/TS),ty=Math.floor(y/TS),R=2;const want=new Set();for(let i=tx-R;i<=tx+R;i++)for(let j=ty-R;j<=ty+R;j++)if(i>=0&&j>=0&&i<NTX&&j<NTY)want.add(i+','+j);
  for(const [k,o] of C.tiles){const [i,j]=k.split(',').map(Number);if(Math.abs(i-tx)>R+1||Math.abs(j-ty)>R+1){scene.remove(o.m);o.t.dispose();o.m.material.dispose();C.tiles.delete(k)}}
  const miss=[...want].filter(k=>!C.tiles.has(k)).sort((a,b)=>{const [ai,aj]=a.split(',').map(Number),[bi,bj]=b.split(',').map(Number);return (Math.abs(ai-tx)+Math.abs(aj-ty))-(Math.abs(bi-tx)+Math.abs(bj-ty))});
  let n=all?99:1;for(const k of miss){if(n--<=0)break;const [i,j]=k.split(',').map(Number);C.tiles.set(k,makeTile(i,j))}return miss.length};
 // ----- filler buildings: instanced per 100 m chunk, world-space window textures -----
 const facade=(glass,em)=>ctex(256,256,g=>{const M=64;if(!em){g.fillStyle=glass?'#e9eef2':'#f3efe6';g.fillRect(0,0,256,256);if(!glass){g.fillStyle='rgba(0,0,0,.05)';for(let i=0;i<300;i++)g.fillRect(Math.random()*256,Math.random()*256,3+Math.random()*8,2)}}else{g.fillStyle='#000';g.fillRect(0,0,256,256)}
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*M,y=j*M,lit=Math.random()<.55,warm=Math.random()<.7?'#ffcf7a':'#cfe6ff';
   if(glass){if(!em){g.fillStyle='#5f7f96';g.fillRect(x+3,y+10,M-6,M-18);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+3,y+10,(M-6)*.4,M-18);g.fillStyle='#3d4a55';g.fillRect(x+M/2-1,y+10,2,M-18)}else if(lit){g.fillStyle=warm;g.fillRect(x+3,y+10,M-6,M-18)}}
   else{if(!em){g.fillStyle='#59544c';g.fillRect(x+17,y+15,30,30);g.fillStyle='#34414c';g.fillRect(x+19,y+17,26,26);g.fillStyle='rgba(30,30,30,.8)';for(let k=0;k<5;k++)g.fillRect(x+20+k*6,y+17,1.5,26);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+15,y+46,34,3)}else if(lit){g.fillStyle=warm;g.fillRect(x+19,y+17,26,26)}}}},true);
 const mP=new THREE.MeshLambertMaterial({map:facade(0,0),emissiveMap:facade(0,1),emissive:'#ffffff',emissiveIntensity:0});worldUV(mP,[12,12.8]);
 const mG=new THREE.MeshLambertMaterial({map:facade(1,0),emissiveMap:facade(1,1),emissive:'#ffffff',emissiveIntensity:0});worldUV(mG,[12,12.8]);
 const mR=new THREE.MeshLambertMaterial({color:'#ffffff',side:THREE.DoubleSide}),mT=new THREE.MeshLambertMaterial({color:'#ffffff'});C.mP=mP;C.mG=mG;
 const boxU=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),roofU=prism(1,1,1),tankU=new THREE.CylinderGeometry(.5,.5,1,10).translate(0,.5,0);
 const groups=new Map();for(const f of FILL){const k=Math.floor((f.x0+f.x1)/2/TS)+','+Math.floor((f.y0+f.y1)/2/TS);let a=groups.get(k);if(!a)groups.set(k,a=[]);a.push(f)}
 const ZINC=['#8a8a8a','#9b5a2e','#6d7b88','#7b3f2a','#a9a9a9','#a83c2b','#5f6a5a'];
 for(const [k,fs] of groups){const [tx,ty]=k.split(',').map(Number),G=new THREE.Group();G.userData.c=[X((tx+.5)*TS),X((ty+.5)*TS)];scene.add(G);C.fill.push(G);const r=rng(tx*100+ty);
  const pl=fs.filter(f=>f.t!=='tower'),gl=fs.filter(f=>f.t==='tower'),rf=fs.filter(f=>f.t==='bung'||f.t==='duplex'),tk=fs.filter(f=>f.tank||f.t==='tower');
  const mk=(geo,mat,list,fn)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((f,i)=>{fn(im,i,f)});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=im.receiveShadow=true;im.computeBoundingSphere();G.add(im)};
  const W=f=>X(f.x1-f.x0),D=f=>X(f.y1-f.y0),cx=f=>X((f.x0+f.x1)/2),cz=f=>X((f.y0+f.y1)/2);
  mk(boxU,mP,pl,(im,i,f)=>{put(im,i,cx(f),0,cz(f),0,W(f),f.h,D(f));im.setColorAt(i,col.set(f.c))});
  mk(boxU,mG,gl,(im,i,f)=>{put(im,i,cx(f),0,cz(f),0,W(f),f.h,D(f));im.setColorAt(i,col.set(f.c))});
  mk(roofU,mR,rf,(im,i,f)=>{const w=W(f),d=D(f),rh=f.t==='duplex'?2.2:1.6;if(w>=d)put(im,i,cx(f),f.h,cz(f),0,w+.7,rh,d+.7);else put(im,i,cx(f),f.h,cz(f),Math.PI/2,d+.7,rh,w+.7);im.setColorAt(i,col.set(f.t==='duplex'?(r()<.6?'#a83c2b':'#4e5b66'):ZINC[Math.floor(r()*ZINC.length)]))});
  mk(tankU,mT,tk,(im,i,f)=>{const tw=f.t==='tower';put(im,i,cx(f)+(r()-.5)*W(f)*.5,f.h,cz(f)+(r()-.5)*D(f)*.5,0,tw?3:1.4,tw?2.6:1.5,tw?3:1.4);im.setColorAt(i,col.set(tw?'#9e9e9e':r()<.75?'#1c1c1c':'#1565c0'))})}
 // ----- bridges -----
 const conc=lam('#a7a39b'),dark=lam('#77736b');const pillars=[];
 for(const b of BRIDGES){const hz=b.y0===b.y1,len=X(hz?b.x1-b.x0:b.y1-b.y0)+1,w=X(b.w+2*SWK),cx=X((b.x0+b.x1)/2),cz=X((b.y0+b.y1)/2);
  const dk=new THREE.Mesh(new THREE.BoxGeometry(hz?len:w,1,hz?w:len),conc);dk.position.set(cx,-.52,cz);dk.receiveShadow=true;scene.add(dk);
  for(const sg of [-1,1]){const pa=new THREE.Mesh(new THREE.BoxGeometry(hz?len:.3,1,hz?.3:len),dark);pa.position.set(cx+(hz?0:sg*w/2),.5,cz+(hz?sg*w/2:0));pa.castShadow=true;scene.add(pa)}
  for(let t=10;t<len-5;t+=22)for(const sg of [-.3,.3])pillars.push([hz?X(b.x0)+t:cx+sg*w,hz?cz+sg*w:X(b.y0)+t])}
 {const pg=new THREE.CylinderGeometry(.9,1.1,8,8).translate(0,-4.5,0),im=new THREE.InstancedMesh(pg,dark,pillars.length);pillars.forEach((p,i)=>put(im,i,p[0],0,p[1],0,1,1,1));scene.add(im)}
 {// cable-stayed pylon on the Lekki-Ikoyi link
  const b=BRIDGES.find(q=>q.n.startsWith('Lekki-Ikoyi')),px=X((b.x0+b.x1)/2),pz=X(b.y0),w=X(b.w)/2+1.6,H=48,wm=lam('#eceff1');
  for(const s of [-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(1.4,H,1.4),wm);l.position.set(px,H/2-.5,pz+s*w);l.castShadow=true;scene.add(l)}const cb=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.4,2*w+1.4),wm);cb.position.set(px,H-4,pz);scene.add(cb);
  const pts=[];for(const s of [-1,1])for(let i=1;i<=9;i++)for(const d of [-1,1]){pts.push(px,H-2-i*1.6,pz+s*w,px+d*i*3.6,.9,pz+s*(w-.4))}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:'#f5f5f5'})));
  const sig=ctex(512,96,g=>{g.fillStyle='#0d47a1';g.fillRect(0,0,512,96);g.fillStyle='#fff';g.font='900 46px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('LEKKI-IKOYI LINK',256,50)});const sm=new THREE.Mesh(new THREE.PlaneGeometry(2*w,2*w*96/512),new THREE.MeshBasicMaterial({map:sig,side:THREE.DoubleSide}));sm.position.set(px+.8,H-4,pz);sm.rotation.y=Math.PI/2;scene.add(sm)}
 {// Oshodi flyover with market under it
  const y=X(FLY.y),w=X(FLY.w),L=X(FLY.x1-FLY.x0),dk=new THREE.Mesh(new THREE.BoxGeometry(L,1,w),conc);dk.position.set(X(FLY.x0)+L/2,FLY.h,y);dk.castShadow=dk.receiveShadow=true;scene.add(dk);
  const rl=X(FLY.r1-FLY.x1),ang=Math.atan2(FLY.h,rl),rp=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(rl,FLY.h),1,w),conc);rp.position.set(X(FLY.x1)+rl/2,FLY.h/2,y);rp.rotation.z=-ang;rp.castShadow=true;scene.add(rp);
  for(const sg of [-1,1]){const pa=new THREE.Mesh(new THREE.BoxGeometry(L,1,.3),dark);pa.position.set(X(FLY.x0)+L/2,FLY.h+1,y+sg*w/2);scene.add(pa)}
  const pg=new THREE.CylinderGeometry(.7,.7,FLY.h,8).translate(0,FLY.h/2,0),n=Math.floor(L/18),im=new THREE.InstancedMesh(pg,dark,n);for(let i=0;i<n;i++)put(im,i,X(FLY.x0)+9+i*18,0,y,0,1,1,1);scene.add(im);
  const sg=ctex(512,96,g=>{g.fillStyle='#1b5e20';g.fillRect(0,0,512,96);g.fillStyle='#fff';g.font='900 44px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('OSHODI — WELCOME',256,50)});const sm=new THREE.Mesh(new THREE.PlaneGeometry(9,1.7),new THREE.MeshBasicMaterial({map:sg,side:THREE.DoubleSide}));sm.position.set(X(u(75)),FLY.h-1.2,y+w/2+.05);scene.add(sm)}
 // ----- props -----
 const r=rng(11),PALM=[],LAMP=[],POLE=[],STALL=[],STILT=[],CANOEp=[];
 const freeSpot=(x,y,m=u(1.5))=>inLand(x,y)&&!onRoadW(x,y,u(.2))&&!rectHit(x,y,m);
 for(const rd of ROADS){const L=rd.h?rd.x1-rd.x0:rd.y1-rd.y0,ar=t=>AREAS[areaAt(rd.h?rd.x0+t:rd.x0,rd.h?rd.y0:rd.y0+t)].id,sp=rd.w>=u(12)?u(32):u(40);
  for(let t=u(6),k=0;t<L;t+=sp,k++){const sd=k%2?1:-1,o=rd.w/2+SWK-u(.4),x=rd.h?rd.x0+t:rd.x0+sd*o,y=rd.h?rd.y0+sd*o:rd.y0+t;if(onBridge(x,y,0)||inLand(x,y))LAMP.push([x,y,rd.h?0:1,-sd])}
  for(let t=u(10);t<L;t+=u(36)){const a=ar(t);if(['vi','ikoyi','island','lekki'].includes(a))continue;const o=rd.w/2+SWK-u(.25),x=rd.h?rd.x0+t:rd.x0-o,y=rd.h?rd.y0-o:rd.y0+t;if(inLand(x,y)&&!onBridge(x,y,0))POLE.push([x,y,rd.h])}
  for(let t=u(14);t<L;t+=u(20)){const a=ar(t);if(!['vi','ikoyi','lekki','ajah','airport'].includes(a)&&r()>.25)continue;for(const sd of [-1,1]){const o=rd.w/2+SWK+u(1.4),x=rd.h?rd.x0+t+u(8):rd.x0+sd*o,y=rd.h?rd.y0+sd*o:rd.y0+t+u(8);if(freeSpot(x,y))PALM.push([x,y,.9+r()*.4])}}}
 for(let i=0;i<1400&&PALM.length<520;i++){const x=r()*WW,y=r()*WH;if(!freeSpot(x,y,u(3)))continue;const a=AREAS[areaAt(x,y)].id;if(['island','oshodi'].includes(a)&&r()<.8)continue;PALM.push([x,y,.8+r()*.5])}
 for(const q of BEACH)for(let x=q[0]+u(4);x<q[2];x+=u(9))PALM.push([x,q[1]+u(2),1+r()*.3]);
 {const tg=new THREE.CylinderGeometry(.13,.24,6,6).translate(0,3,0),lv=[];for(let i=0;i<7;i++){const a=i/7*6.28,g=part(new THREE.BoxGeometry(.5,.06,2.8),i%2?'#2e7d32':'#388e3c',0,0,1.25,0,0,0);g.rotateX(.35);g.rotateY(a);g.translate(0,6.05,0);lv.push(g)}
  const lg=mergeGeometries(lv),tr=new THREE.InstancedMesh(tg,lam('#8d6e63'),PALM.length),lf=new THREE.InstancedMesh(lg,VC,PALM.length);tr.castShadow=lf.castShadow=true;
  PALM.forEach((p,i)=>{eu.set((r()-.5)*.14,r()*6,(r()-.5)*.14);qt.setFromEuler(eu);pv.set(X(p[0]),0,X(p[1]));sv.setScalar(p[2]*1.1);m4.compose(pv,qt,sv);tr.setMatrixAt(i,m4);lf.setMatrixAt(i,m4)});scene.add(tr,lf)}
 {const pg=new THREE.CylinderGeometry(.07,.11,6.5,5).translate(0,3.25,0),poles=new THREE.InstancedMesh(pg,lam('#546e7a'),LAMP.length),ag=new THREE.BoxGeometry(1.6,.08,.08).translate(.8,0,0),arms=new THREE.InstancedMesh(ag,lam('#546e7a'),LAMP.length);
  C.bulbs=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.12,.3),new THREE.MeshBasicMaterial({color:'#fff59d'}),LAMP.length);
  const gt=ctex(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,214,140,.85)');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
  C.gmat=new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});C.glow=new THREE.InstancedMesh(new THREE.PlaneGeometry(8,8).rotateX(-Math.PI/2),C.gmat,LAMP.length);
  LAMP.forEach((l,i)=>{const x=X(l[0]),z=X(l[1]),ry=l[2]?(l[3]>0?0:Math.PI):(l[3]>0?-Math.PI/2:Math.PI/2);put(poles,i,x,0,z,0,1,1,1);put(arms,i,x,6.4,z,ry,1,1,1);const ax=Math.cos(ry)*1.5,az=-Math.sin(ry)*1.5;put(C.bulbs,i,x+ax,6.35,z+az,ry,1,1,1);put(C.glow,i,x+ax*1.3,.06,z+az*1.3,0,1,1,1)});scene.add(poles,arms,C.bulbs,C.glow)}
 {const pg=new THREE.CylinderGeometry(.1,.14,8,5).translate(0,4,0),im=new THREE.InstancedMesh(pg,lam('#6d5a45'),POLE.length),xg=new THREE.BoxGeometry(1.6,.1,.1),xb=new THREE.InstancedMesh(xg,lam('#5d4c3a'),POLE.length),pts=[];
  POLE.forEach((p,i)=>{put(im,i,X(p[0]),0,X(p[1]),0,1,1,1);put(xb,i,X(p[0]),7.6,X(p[1]),p[2]?Math.PI/2:0,1,1,1);const nx=POLE[i+1];if(nx&&nx[2]===p[2]&&Math.hypot(nx[0]-p[0],nx[1]-p[1])<u(40))for(const o of [-.7,.7]){const ox=p[2]?0:o,oz=p[2]?o:0;let lx=X(p[0])+ox,ly=7.6,lz=X(p[1])+oz;for(let s=1;s<=4;s++){const t=s/4,x=X(p[0]+(nx[0]-p[0])*t)+ox,z=X(p[1]+(nx[1]-p[1])*t)+oz,y=7.6-Math.sin(t*Math.PI)*.6;pts.push(lx,ly,lz,x,y,z);lx=x;ly=y;lz=z}}});
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));scene.add(im,xb,new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:'#222'})))}
 // traffic lights: 2 heads per junction (one per axis)
 {const heads=[];for(const n of LIGHTS){let hw=0,vw=0;for(const ei of n.e){const e=EDGES[ei];if(Math.abs(e.dx)>.5)hw=Math.max(hw,e.w/2);else vw=Math.max(vw,e.w/2)}
   heads.push({n,hz:1,x:n.x+vw+u(1),y:n.y+hw+u(1)},{n,hz:0,x:n.x-vw-u(1),y:n.y-hw-u(1)},{n,hz:1,x:n.x-vw-u(1),y:n.y-hw-u(1),b:1},{n,hz:0,x:n.x+vw+u(1),y:n.y+hw+u(1),b:1})}
  C.heads=heads;const pg=new THREE.CylinderGeometry(.08,.08,4,5).translate(0,2,0),hg=new THREE.BoxGeometry(.4,1.2,.4),poles=new THREE.InstancedMesh(pg,lam('#263238'),heads.length),hb=new THREE.InstancedMesh(hg,lam('#111'),heads.length);
  C.lb=new THREE.InstancedMesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:'#ffffff'}),heads.length*3);
  heads.forEach((h,i)=>{const x=X(h.x),z=X(h.y),fx=h.hz?(h.x>h.n.x?.25:-.25):0,fz=h.hz?0:(h.y>h.n.y?.25:-.25);const yy=h.b?2.6:4.2;put(poles,i,x,0,z,0,1,h.b?.75:1.05,1);put(hb,i,x,yy,z,0,1,1,1);
   for(let k=0;k<3;k++){put(C.lb,i*3+k,x+fx,yy+.38-k*.38,z+fz,0,1,1,1);C.lb.setColorAt(i*3+k,col.set('#222'))}});scene.add(poles,hb,C.lb)}
 // billboards with fictional ads
 {const ADS=[['GIDI MOBILE','Data wey no dey finish','#6a1b9a'],['EKO JOLLOF CUBES','Taste of party rice','#c62828'],['SUPERGEN 5000','When NEPA fail you','#ef6c00'],['LAGOS COOL WATER','Pure, cold, sharp','#0277bd'],['NAIJA REPUBLIC BANK','Your money, safe-ish','#1b5e20'],['JAPA VISA CONSULT','Canada? UK? Talk to us','#283593'],['BIG BOY NOODLES','5 minutes, full belle','#f9a825'],['OGA PAINT','Paint your house, no wahala','#00838f'],['SHARP SHARP LOANS','Read the terms o!','#4e342e'],['VOTE HON. NOBODY','Roads, light, water','#2e7d32'],['MAMA PUT DELIVERY','Amala reach your door','#d84315'],['LEKKI GARDENS ESTATE','Own your land today','#5d4037']];
  const spots=[[115,140],[115,300],[205,110],[205,420],[285,320],[95,520],[476,300,1],[476,180,1],[540,470],[600,540],[700,540],[740,470],[880,540],[60,52],[400,52],[640,52]].map(p=>[u(p[0]),u(p[1]),p[2]]);
  spots.forEach((s,i)=>{const ad=ADS[i%ADS.length],t=ctex(512,256,g=>{g.fillStyle=ad[2];g.fillRect(0,0,512,256);g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(420,60,140,0,7);g.fill();g.fillStyle='#fff';g.font='900 64px system-ui';g.textAlign='center';g.fillText(ad[0],256,120,490);g.font='600 34px system-ui';g.fillText(ad[1],256,185,480);g.strokeStyle='#fff';g.lineWidth=8;g.strokeRect(6,6,500,244)});
   const G2=new THREE.Group(),bm=new THREE.Mesh(new THREE.PlaneGeometry(9,4.5),new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide,emissive:'#ffffff',emissiveMap:t,emissiveIntensity:0}));bm.position.y=9;G2.add(bm);C.bill=C.bill||[];C.bill.push(bm.material);
   for(const sx of [-3,3]){const p=new THREE.Mesh(new THREE.BoxGeometry(.3,7,.3),lam('#455a64'));p.position.set(sx,3.5,0);G2.add(p)}G2.position.set(X(s[0]),s[2]?-1:0,X(s[1]));G2.rotation.y=s[2]?Math.PI/2:(i%2?0:Math.PI*.15);scene.add(G2)})}
 // stalls, POS kiosks, suya stands
 {const add=(x,y,k)=>{if(!inLand(x,y)||onRoadW(x,y,u(.5))||rectHit(x,y,u(.8)))return;STALL.push([x,y,k])};
  for(let x=u(-10);x<FLY.x1;x+=u(5.5))for(const o of [-u(3.5),u(3.5)])add(x,FLY.y+o,r()<.85?0:1);
  for(let x=u(48);x<u(160);x+=u(6))add(x,u(166-9.5),r()<.6?0:1);for(let y=u(488);y<u(552);y+=u(6))add(u(462),y,0);
  for(const id of PARKS){const b=BY[id];for(let i=0;i<5;i++)add(b.door.x+(r()-.5)*u(30),b.door.y+b.out[1]*u(9.5)+(r()-.5)*u(2),i%3===0?2:i%3===1?1:0)}
  for(let i=0;i<500&&STALL.length<200;i++){const rd=ROADS[Math.floor(r()*ROADS.length)],t=r(),sd=r()<.5?-1:1,o=rd.w/2+SWK+u(1.2),x=rd.h?rd.x0+(rd.x1-rd.x0)*t:rd.x0+sd*o,y=rd.h?rd.y0+sd*o:rd.y0+(rd.y1-rd.y0)*t;add(x,y,Math.floor(r()*3))}
  const tg=new THREE.BoxGeometry(1.8,.85,1).translate(0,.42,0),ug=new THREE.ConeGeometry(1.5,.6,8).translate(0,2.3,0),sg=new THREE.CylinderGeometry(.03,.03,2.2,4).translate(0,1.1,0);
  const posT=ctex(128,64,g=>{g.fillStyle='#ffd400';g.fillRect(0,0,128,64);g.fillStyle='#0d47a1';g.font='900 38px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('POS ✓',64,34)});
  const tb=new THREE.InstancedMesh(tg,new THREE.MeshLambertMaterial({color:'#fff'}),STALL.length),um=new THREE.InstancedMesh(ug,new THREE.MeshLambertMaterial({color:'#fff'}),STALL.length),st=new THREE.InstancedMesh(sg,lam('#555'),STALL.length);
  const pos=STALL.filter(s=>s[2]===1),ps=new THREE.InstancedMesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:posT,side:THREE.DoubleSide}),Math.max(1,pos.length));
  const suya=STALL.filter(s=>s[2]===2);C.suya=suya;C.ember=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.08,.5),new THREE.MeshBasicMaterial({color:'#ff5722'}),Math.max(1,suya.length));
  const UC=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00','#ffffff','#8e24aa'];let pi=0,si=0;
  STALL.forEach((s,i)=>{const x=X(s[0]),z=X(s[1]),ry=r()*3;put(tb,i,x,0,z,ry,1,1,1);tb.setColorAt(i,col.set(s[2]===1?'#0d47a1':s[2]===2?'#3e2723':'#8d6e63'));put(um,i,x,0,z,0,1,1,1);um.setColorAt(i,col.set(s[2]===1?'#ffd400':UC[i%UC.length]));put(st,i,x,0,z,0,1,1,1);
   if(s[2]===1)put(ps,pi++,x,1.25,z,ry,1,1,1);if(s[2]===2)put(C.ember,si++,x,.9,z,ry,1,1,1)});scene.add(tb,um,st,ps,C.ember);C.STALL=STALL}
 // Makoko stilt houses + canoes
 {for(let x=u(344);x<u(381);x+=u(6.5))for(let y=u(386);y<u(452);y+=u(7)){const jx=x+(r()-.5)*u(2.5),jy=y+(r()-.5)*u(2.5);if(r()<.22||!water(jx,jy))continue;let near=false;for(let i=0;i<CANOE.length-1;i++){const a=CANOE[i],b=CANOE[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),t=Math.max(0,Math.min(1,((jx-a[0])*(b[0]-a[0])+(jy-a[1])*(b[1]-a[1]))/(l*l))),d=Math.hypot(jx-a[0]-(b[0]-a[0])*t,jy-a[1]-(b[1]-a[1])*t);if(d<u(4))near=true}if(near)continue;STILT.push([jx,jy])}
  const hg=new THREE.BoxGeometry(4,2.6,3.6).translate(0,2.9,0),sg=mergeGeometries([[-1.7,-1.5],[1.7,-1.5],[-1.7,1.5],[1.7,1.5]].map(([x,z])=>new THREE.CylinderGeometry(.09,.09,2.2,4).translate(x,.6,z))),rg=prism(4.6,1.3,4.2).translate(0,4.2,0),dg=new THREE.BoxGeometry(5,.12,1.4).translate(0,1.6,2.4);
  const H1=new THREE.InstancedMesh(hg,new THREE.MeshLambertMaterial({color:'#fff'}),STILT.length),S1=new THREE.InstancedMesh(sg,lam('#4e342e'),STILT.length),R1=new THREE.InstancedMesh(rg,new THREE.MeshLambertMaterial({color:'#fff',side:THREE.DoubleSide}),STILT.length),D1=new THREE.InstancedMesh(dg,lam('#6d4c41'),STILT.length);
  STILT.forEach((p,i)=>{const ry=(r()-.5)*.5;for(const im of [H1,S1,R1,D1])put(im,i,X(p[0]),-.3,X(p[1]),ry,1,1,1);H1.setColorAt(i,col.set(['#8d6e63','#a1887f','#795548','#6d4c41','#bcaaa4'][i%5]));R1.setColorAt(i,col.set(ZINC[i%ZINC.length]))});H1.castShadow=R1.castShadow=true;scene.add(H1,S1,R1,D1);
  const cg=A.geo('canoe'),cn=new THREE.InstancedMesh(cg,VC,14);for(let i=0;i<14;i++){const p=STILT[(i*5)%Math.max(1,STILT.length)]||[u(360),u(420)];put(cn,i,X(p[0])+2.6,-.3,X(p[1])+2.6,r()*6,1,1,1)}scene.add(cn)}
 // puddles + flood sheets for rain
 {const PU=[];for(let i=0;i<900&&PU.length<240;i++){const rd=ROADS[Math.floor(r()*ROADS.length)],t=r(),o=(r()-.5)*(rd.w+SWK*2),x=rd.h?rd.x0+(rd.x1-rd.x0)*t:rd.x0+o,y=rd.h?rd.y0+o:rd.y0+(rd.y1-rd.y0)*t;if(inLand(x,y))PU.push([x,y,1+r()*2.5,.6+r()*1.2])}
  C.puM=new THREE.MeshPhongMaterial({color:'#5b6670',shininess:90,specular:'#ffffff',transparent:true,opacity:0,depthWrite:false});const pu=new THREE.InstancedMesh(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),C.puM,PU.length);PU.forEach((p,i)=>put(pu,i,X(p[0]),.03,X(p[1]),r()*3,p[2],1,p[3]));scene.add(pu);
  C.flM=new THREE.MeshPhongMaterial({color:'#6d5f45',shininess:60,transparent:true,opacity:.72,depthWrite:false});C.flood=FLOOD.map(f=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(X(f[2]-f[0]),X(f[3]-f[1])).rotateX(-Math.PI/2),C.flM);m.position.set(X((f[0]+f[2])/2),.06,X((f[1]+f[3])/2));m.visible=false;scene.add(m);return m})}
 // rain
 {const N=1600,pos=new Float32Array(N*6);for(let i=0;i<N;i++){const x=(Math.random()-.5)*60,y=Math.random()*30,z=(Math.random()-.5)*60;pos.set([x,y,z,x+.05,y-.7,z],i*6)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  C.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#cfd8dc',transparent:true,opacity:.55}));C.rain.frustumCulled=false;C.rain.visible=false;scene.add(C.rain)}
 // avatars pool for pedestrians/hawkers
 for(let i=0;i<A.npcMax();i++){const a=A.makeAvatar(PEDS[i%PEDS.length]?PEDS[i%PEDS.length].look:{skin:'#5a3825',out:'#e53935',hair:0,body:0},true);a.visible=false;a.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(a);C.avs.push({a,p:null})}
 return C}
export const FLOOD=[[200,290,280,352],[210,500,330,552],[388,596,528,612],[120,480,200,500]].map(r=>r.map(u));
export const inFlood=(x,y)=>FLOOD.some(f=>x>f[0]&&x<f[2]&&y>f[1]&&y<f[3]);
const LCOL={r:['#ff1a1a','#3a2a00','#002a00'],a:['#3a0000','#ffb300','#002a00'],g:['#3a0000','#3a2a00','#22ff55']};
export function frame3D(C,A,dt,st){const X=v=>v*K,col=new THREE.Color();C.ensureTiles(st.x,st.y);C.tm=(C.tm||0)+dt;
 const far2=(st.far+90)**2;for(const G of C.fill){const dx=G.userData.c[0]-st.cx,dz=G.userData.c[1]-st.cz;G.visible=dx*dx+dz*dz<far2}
 const nf=st.nf,bo=st.bo;C.mP.emissiveIntensity=nf*(bo?.07:.8);C.mG.emissiveIntensity=nf*(bo?.45:.9);
 const lampsOn=nf>.3&&!bo;C.bulbs.material.color.set(lampsOn?'#fff59d':'#5a5a5a');C.glow.visible=lampsOn;(C.bill||[]).forEach(m=>m.emissiveIntensity=nf*(bo?.15:.55));
 C.ember.material.color.setHSL(.04,1,.45+Math.sin(C.tm*9)*.08);
 C.lt=(C.lt||0)-dt;if(C.lt<=0){C.lt=.2;C.heads.forEach((h,i)=>{const s=lightState(h.n,!!h.hz,SIM.T),L=LCOL[s];for(let k=0;k<3;k++)C.lb.setColorAt(i*3+k,col.set(L[k]))});C.lb.instanceColor.needsUpdate=true}
 // AI vehicles
 for(const v of VEH){let m=C.veh.get(v.id);const vis=v.act&&Math.abs(v.x-st.x)<u(170)&&Math.abs(v.y-st.y)<u(170);if(!vis){if(m)m.visible=false;continue}
  if(!m){m=new THREE.Mesh(A.geo(v.t,v.c),A.VC);m.castShadow=true;A.scene.add(m);C.veh.set(v.id,m)}m.visible=true;m.position.set(X(v.x),0,X(v.y));m.rotation.y=v.h-Math.PI/2}
 // special vehicles (player car, ride vehicle)
 C.x2=C.x2||new Map();const seen=new Set();for(const e of st.extra||[]){seen.add(e.k);let m=C.x2.get(e.k);if(!m||m.userData.t!==e.t+e.c){if(m)A.scene.remove(m);m=new THREE.Mesh(A.geo(e.t,e.c),A.VC);m.castShadow=true;m.userData.t=e.t+e.c;A.scene.add(m);C.x2.set(e.k,m)}
  m.visible=true;m.position.set(X(e.x),e.yo||0,X(e.y));m.rotation.set(0,e.h-Math.PI/2,e.roll||0)}for(const [k,m] of C.x2)if(!seen.has(k))m.visible=false;
 // pedestrian avatar pool
 C.pt=(C.pt||0)-dt;if(C.pt<=0){C.pt=.35;const R2=u(75)**2,cand=[];for(const p of PEDS){if(p.hid)continue;const d=(p.x-st.x)**2+(p.y-st.y)**2;if(d<R2)cand.push([d,p])}for(const w of HAWK){if(!w.on)continue;const d=(w.x-st.x)**2+(w.y-st.y)**2;if(d<R2)cand.push([d*.5,w])}
  cand.sort((a,b)=>a[0]-b[0]);const keep=new Set(cand.slice(0,C.avs.length).map(c=>c[1]));for(const s of C.avs)if(s.p&&!keep.has(s.p))s.p=null;const used=new Set(C.avs.map(s=>s.p).filter(Boolean));
  for(const p of keep){if(used.has(p))continue;const s=C.avs.find(q=>!q.p);if(s)s.p=p}}
 for(const s of C.avs){const p=s.p;if(!p||p.hid||(p.wares&&!p.on)){s.a.visible=false;continue}s.a.visible=true;s.a.position.set(X(p.x),0,X(p.y));s.a.rotation.y=p.h;A.animate(s.a,p.ph,p.idle>0?0:1,C.tm)}
 // weather
 const wet=st.wet||0,rain=st.rain||0;C.puM.opacity=Math.min(.8,wet*.9);for(const m of C.flood)m.visible=wet>.6;C.flM.opacity=Math.min(.75,(wet-.6)*2.5);
 for(const [,o] of C.tiles)o.m.material.color.setScalar(1-wet*.3);
 C.rain.visible=rain>.05;if(C.rain.visible){const P=C.rain.geometry.attributes.position,a=P.array,fall=22*dt;for(let i=0;i<a.length;i+=6){a[i+1]-=fall;a[i+4]-=fall;if(a[i+1]<0){const x=(Math.random()-.5)*60,z=(Math.random()-.5)*60,y=26+Math.random()*4;a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=x+.06;a[i+4]=y-.8;a[i+5]=z}}P.needsUpdate=true;
  C.rain.position.set(st.camP.x,Math.max(0,st.camP.y-18),st.camP.z);C.rain.material.opacity=.25+rain*.4;C.rain.geometry.setDrawRange(0,Math.floor(a.length/3*Math.min(1,rain+.1)))}}
// minimap / full map helpers
export function mapRect(){return [0,0,WW,WH]}
