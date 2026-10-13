import {Room} from 'colyseus';import {Schema,MapSchema,defineTypes} from '@colyseus/schema';
import fs from 'node:fs';import path from 'node:path';import {check,checkName,QUICK,EMOTES} from './filter.js';
export class Player extends Schema{constructor(){super();this.name='';this.skin='#7a4b2e';this.out='#0b7a3e';this.hair=0;this.body=0;this.district='yaba';this.x=0;this.y=0;this.ry=0;this.anim='idle';this.ins='';this.model='';this.lv=0;}}
defineTypes(Player,{name:'string',skin:'string',out:'string',hair:'uint8',body:'uint8',district:'string',x:'float32',y:'float32',ry:'float32',anim:'string',ins:'string',model:'string',lv:'uint16'});
export class LagosState extends Schema{constructor(){super();this.players=new MapSchema();}}
defineTypes(LagosState,{players:{map:Player}});
const env=(k,d)=>process.env[k]!=null?+process.env[k]:d;
export const CFG={MAX:env('MAX_PLAYERS',50),TRUST_SECS:env('TRUST_SECS',120),DISTRICT_SLOW:env('DISTRICT_SLOW_SECS',30),JOB_COOLDOWN:env('JOB_COOLDOWN_SECS',90),NEAR:400,SPEED:115,START:50000};
let WORLD={WW:18000,WH:14000,areas:[]};try{WORLD=JSON.parse(fs.readFileSync(new URL('../world.json',import.meta.url)))}catch(e){console.warn('world.json missing')}
export const DIST=(x,y=0)=>{for(const a of WORLD.areas){const r=a.r;if(x>=r[0]&&x<r[2]&&y>=r[1]&&y<r[3])return a.id}return 'lagoon'};
const HEX=/^#[0-9a-f]{6}$/i;
export const MODELS=['casual','hoodie','business','woman1','woman2'];
export function applyLook(p,lk){lk=lk&&typeof lk==='object'?lk:{};p.skin=HEX.test(lk.skin)?lk.skin:'#7a4b2e';p.out=HEX.test(lk.out)?lk.out:'#0b7a3e';p.hair=Math.max(0,Math.min(4,lk.hair|0));p.body=lk.body?1:0;p.model=MODELS.includes(lk.model)?lk.model:'';p.lv=(p.lv+1)&0xffff}
const CAREER={tech:{b:'tech',pay:8000},bank:{b:'bank',pay:10000},trade:{b:'market',pay:6000},fix:{b:'cvillage',pay:7000},ent:{b:'studio',pay:7000}};
const MENU={'buka:0':1500,'buka:1':3000,'buka:2':50,'suya:0':2000,'suya:1':3500,'suya:2':500};
let ANCH={};try{ANCH=JSON.parse(fs.readFileSync(new URL('../anchors.json',import.meta.url)))}catch(e){console.warn('anchors.json missing: teleports limited to spawn')}
const SPAWN=ANCH.spawn||{x:4000,y:3200};
export function makeRoom(ledger,dataDir){
 const log=(f,o)=>fs.appendFile(path.join(dataDir,f),JSON.stringify({ts:new Date().toISOString(),...o})+'\n',()=>{});
 return class LagosRoom extends Room{
 onCreate(){this.maxClients=CFG.MAX;this.setState(new LagosState());this.meta=new Map();this.setPatchRate(100);this.autoDispose=true;
  const on=(t,f)=>this.onMessage(t,(c,m)=>{const M=this.meta.get(c.sessionId);if(!M||!this.budget(c,M))return;try{f(c,M,m||{})}catch(e){console.error(t,e)}});
  on('move',(c,M,m)=>this.move(c,M,m));on('chat',(c,M,m)=>this.chat(c,M,m,false));on('qp',(c,M,m)=>this.chat(c,M,m,true));
  on('emote',(c,M,m)=>{if(!EMOTES.includes(m.id)||Date.now()-M.lastEm<1500)return;M.lastEm=Date.now();const p=this.state.players.get(c.sessionId);this.near(p).forEach(o=>o.send('emote',{from:c.sessionId,id:m.id}))});
  on('job',(c,M,m)=>this.job(c,M,m));on('buy',(c,M,m)=>this.buy(c,M,m));on('spend',(c,M,m)=>this.spend(c,M,m));
  on('report',(c,M,m)=>{const t=this.meta.get(m.target);if(Date.now()-M.lastRep<10000)return c.send('sys',{k:'report_wait'});M.lastRep=Date.now();
   log('reports.jsonl',{room:this.roomId,reporter:{id:c.sessionId,name:M.name,dev:M.dev},target:{id:m.target,name:t?t.name:'(left)',dev:t?t.dev:null},reason:String(m.reason||'').slice(0,80),last:t?t.hist.slice(-50):[]});c.send('sys',{k:'reported'})});
  on('look',(c,M,m)=>{const now=Date.now();if(now-(M.lastLook||0)<1000)return;M.lastLook=now;const p=this.state.players.get(c.sessionId);if(p)applyLook(p,m.look||m)});
  on('ping',(c)=>c.send('pong',{t:Date.now()}));}
 budget(c,M){const now=Date.now();if(now-M.win>1000){M.win=now;M.cnt=0}if(++M.cnt>40){if(++M.strikes>5){log('moderation.jsonl',{kick:'flood',dev:M.dev,name:M.name});c.leave(4001)}return false}return true}
 onAuth(c,o){const n=checkName(o&&o.name);if(!n.ok)throw new Error('bad_name:'+n.reason);if(!o.device||!/^[a-f0-9]{16,64}$/.test(o.device))throw new Error('bad_device');
  for(const [,M] of this.meta)if(M.dev===o.device)throw new Error('already_online');return true}
 onJoin(c,o){const n=checkName(o.name).name,lk=o.look||{},p=new Player();p.name=n;applyLook(p,lk);
  p.x=SPAWN.x+(Math.random()-.5)*16;p.y=SPAWN.y+(Math.random()-.5)*16;p.district=DIST(p.x,p.y);this.state.players.set(c.sessionId,p);
  const dev=o.device;if(!ledger.has(dev))ledger.post(dev,CFG.START,'grant','starter_wallet',{name:n});
  this.meta.set(c.sessionId,{dev,name:n,joined:Date.now(),lastMove:Date.now(),win:0,cnt:0,strikes:0,chatT:[],lastDist:0,lastEm:0,lastRep:0,lastJob:0,lastTp:0,hist:[]});
  c.send('hello',{you:c.sessionId,x:p.x,y:p.y,trustSecs:CFG.TRUST_SECS,districtSlow:CFG.DISTRICT_SLOW,quick:QUICK,emotes:EMOTES,balance:ledger.balance(dev),max:CFG.MAX});
  log('sessions.jsonl',{join:n,dev,room:this.roomId})}
 async onLeave(c,consented){if(!consented){try{await this.allowReconnection(c,20);return}catch(e){}}const M=this.meta.get(c.sessionId);this.state.players.delete(c.sessionId);this.meta.delete(c.sessionId);if(M)log('sessions.jsonl',{leave:M.name,dev:M.dev,room:this.roomId})}
 move(c,M,m){const p=this.state.players.get(c.sessionId),x=+m.x,y=+m.y,now=Date.now();if(!Number.isFinite(x)||!Number.isFinite(y))return;
  const dt=Math.min(2,(now-M.lastMove)/1000),d=Math.hypot(x-p.x,y-p.y),max=(m.v?2000:CFG.SPEED*1.6)*dt+(m.v?60:25);
  const inb=x>=-200&&x<=WORLD.WW+200&&y>=-200&&y<=WORLD.WH+200;let ok=inb&&d<=max;
  if(!ok&&inb&&now-M.lastTp>8000){const a=Object.values(ANCH).find(a=>Math.hypot(a.x-x,a.y-y)<90);if(a){ok=true;M.lastTp=now}}
  if(!ok){c.send('correct',{x:p.x,y:p.y});M.lastMove=now;return}
  p.x=x;p.y=y;p.ry=Number.isFinite(+m.ry)?+m.ry:0;p.anim=['idle','walk','dance','wave','kneel'].includes(m.anim)?m.anim:'idle';p.ins=typeof m.ins==='string'?m.ins.slice(0,16):'';p.district=DIST(x,y);M.lastMove=now}
 near(p,dist=CFG.NEAR){return this.clients.filter(o=>{const q=this.state.players.get(o.sessionId);return q&&q.ins===p.ins&&Math.hypot(q.x-p.x,q.y-p.y)<=dist})}
 chat(c,M,m,quick){const p=this.state.players.get(c.sessionId),now=Date.now(),ch=m.ch==='district'?'district':'near';let text;
  M.chatT=M.chatT.filter(t=>now-t<10000);if(M.chatT.length>=5||(M.chatT.length&&now-M.chatT[M.chatT.length-1]<2000))return c.send('blocked',{reason:'rate'});
  if(ch==='district'&&now-M.lastDist<CFG.DISTRICT_SLOW*1000)return c.send('blocked',{reason:'slow',wait:Math.ceil((CFG.DISTRICT_SLOW*1000-(now-M.lastDist))/1000)});
  if(quick){text=QUICK[m.i|0];if(!text)return}else{
   if((now-M.joined)/1000<CFG.TRUST_SECS)return c.send('blocked',{reason:'trust',wait:Math.ceil(CFG.TRUST_SECS-(now-M.joined)/1000)});
   const r=check(m.text);M.hist.push({ts:now,ch,text:String(m.text).slice(0,140),blocked:r.ok?null:r.reason});if(M.hist.length>60)M.hist.shift();
   if(!r.ok){log('moderation.jsonl',{blocked:r.reason,dev:M.dev,name:M.name,text:String(m.text).slice(0,140)});return c.send('blocked',{reason:r.reason})}text=r.text}
  if(quick){M.hist.push({ts:now,ch,text,qp:1});if(M.hist.length>60)M.hist.shift()}
  M.chatT.push(now);if(ch==='district')M.lastDist=now;
  const msg={from:c.sessionId,name:p.name,ch,text,qp:quick?1:0,d:p.district};
  const to=ch==='near'?this.near(p):this.clients.filter(o=>{const q=this.state.players.get(o.sessionId);return q&&q.district===p.district});to.forEach(o=>o.send('chat',msg))}
 wallet(c,M,e,extra={}){c.send('wallet',{balance:ledger.balance(M.dev),delta:e?e.amount:0,reason:e?e.reason:'',seq:e?e.seq:0,...extra})}
 job(c,M,m){const C=CAREER[m.career],p=this.state.players.get(c.sessionId),now=Date.now();if(!C)return;
  const a=ANCH[C.b];if(!(p.ins===C.b||(a&&Math.hypot(a.x-p.x,a.y-p.y)<250)))return this.wallet(c,M,null,{err:'not_at_work'});
  if(now-M.lastJob<CFG.JOB_COOLDOWN*1000)return this.wallet(c,M,null,{err:'cooldown',wait:Math.ceil((CFG.JOB_COOLDOWN*1000-(now-M.lastJob))/1000)});
  const sc=Math.max(0,Math.min(6,m.score|0)),amt=Math.round(C.pay*(0.4+0.6*sc/6));M.lastJob=now;this.wallet(c,M,ledger.post(M.dev,amt,'job','job:'+m.career,{score:sc,room:this.roomId}))}
 buy(c,M,m){const price=MENU[m.item];if(!price)return this.wallet(c,M,null,{err:'unknown_item'});const e=ledger.post(M.dev,-price,'purchase','food:'+m.item,{room:this.roomId});this.wallet(c,M,e,e?{}:{err:'insufficient'})}
 spend(c,M,m){const a=Math.round(+m.amount);if(!(a>0&&a<=1e6))return this.wallet(c,M,null,{err:'bad_amount'});const e=ledger.post(M.dev,-a,'spend',String(m.reason||'misc').replace(/[^a-z0-9:_-]/gi,'').slice(0,40),{room:this.roomId});this.wallet(c,M,e,e?{}:{err:'insufficient'})}
}}
