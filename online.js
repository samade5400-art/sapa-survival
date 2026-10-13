// Naija Republic Phase 0 — online layer for Sapa Survival (Colyseus client). Single-player code paths are untouched when NET.on is false.
import {R,K} from './r3d.js?v=7';
const $=s=>document.querySelector(s);
export const DEFAULT_SERVER='wss://naija-republic-server.onrender.com';
const CLIENT_URL='https://cdn.jsdelivr.net/npm/colyseus.js@0.16.22/+esm';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const REASON={link:'Links are not allowed',phone:'Phone numbers are not allowed',account_or_phone:'Phone/bank account numbers are not allowed',crypto:'Crypto wallets are not allowed',handle:'@handles are not allowed',contact:'Sharing contacts (WhatsApp, Telegram, numbers) is not allowed',scam:'That looks like a scam message',language:'Watch your language',too_long:'Message too long',empty:'Empty message',rate:'Slow down small (max 1 msg / 2s)',slow:'District chat is slow mode',trust:'New players can only use quick phrases for now',invalid:'Invalid'};
const PG={phone:'No phone number for here o',link:'No link for here o',scam:'Wetin be this? E resemble scam',rate:'Calm down small',language:'Mind your mouth'};
export function getServer(){const q=new URLSearchParams(location.search).get('server');if(q){ls('nr_server',q);return q}return ls('nr_server')||DEFAULT_SERVER}
const deviceId=()=>{let d=ls('nr_device');if(!d||!/^[a-f0-9]{32}$/.test(d)){d=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');ls('nr_device',d)}return d};
export function makeNet(ctx){
 let client=null,room=null,me=null,hello=null,joinedAt=0,sendT=0,last={},tab='near',emT=0,emA='idle',reconnecting=false,closedByUser=false,ch='near';
 const remotes=new Map(),log=[],mute=new Set(ls('nr_mute')||[]),block=new Set(ls('nr_block')||[]),bubbles=[];
 const N={on:false,get room(){return room},get me(){return me},remotes,log,get count(){return room?room.state.players.size:0}};
 // ---------- UI ----------
 const ui=document.createElement('div');ui.id='net';ui.className='hide';ui.innerHTML=`<div id="netHud" class="pill"></div>
  <div id="chat"><div class="ctabs"><button data-c="near" class="on">📍 Near</button><button data-c="district">🏙️ District</button><button id="cPl">👥</button><button id="cMin">▾</button><button id="cExit" title="Leave online">⏏</button></div>
  <div id="clog"></div><div id="cqp"></div><div class="crow"><input id="cin" maxlength="140" placeholder="Talk…" autocomplete="off"><button id="csend">➤</button><button id="cqb">💬</button><button id="ceb">💃</button></div><div id="ctrust" class="hide"></div></div>
  <div id="cpl" class="hide"></div><div id="netNames"></div>`;document.body.appendChild(ui);
 const clog=$('#clog'),cin=$('#cin');
 ui.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ch=b.dataset.c;ui.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b));drawLog()});
 $('#cExit').onclick=()=>{if(confirm('Leave online Lagos?')){N.leave();ctx.exitOnline()}};
 $('#cMin').onclick=()=>{$('#chat').classList.toggle('min')};
 $('#cqb').onclick=()=>{const q=$('#cqp');q.dataset.k=q.dataset.k==='q'?'':'q';drawQP()};$('#ceb').onclick=()=>{const q=$('#cqp');q.dataset.k=q.dataset.k==='e'?'':'e';drawQP()};
 function drawQP(){const q=$('#cqp'),k=q.dataset.k;if(!hello||!k){q.innerHTML='';return}
  q.innerHTML=k==='q'?hello.quick.map((t,i)=>`<button data-q="${i}">${esc(t)}</button>`).join(''):hello.emotes.map(e=>`<button data-e="${e}">${({wave:'👋',dance:'💃',zanku:'🕺',greet:'🙇',kneel:'🧎',laugh:'😂'})[e]||''} ${e}</button>`).join('');
  q.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{room&&room.send('qp',{ch,i:+b.dataset.q});q.dataset.k='';drawQP()});
  q.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{N.emote(b.dataset.e);q.dataset.k='';drawQP()})}
 const send=()=>{const t=cin.value.trim();if(!t||!room)return;room.send('chat',{ch,text:t});cin.value='';cin.blur()};
 $('#csend').onclick=send;cin.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')send();if(e.key==='Escape')cin.blur()});cin.addEventListener('keyup',e=>e.stopPropagation());
 addEventListener('keydown',e=>{if(N.on&&e.key==='Enter'&&document.activeElement!==cin&&ctx.uiFree()&&!ctx.nearSomething()){cin.focus();e.preventDefault()}});
 $('#cPl').onclick=()=>{const p=$('#cpl');p.classList.toggle('hide');drawPlayers()};
 function drawPlayers(){const p=$('#cpl');if(p.classList.contains('hide')||!room)return;const rows=[];room.state.players.forEach((pl,id)=>{if(id===me)return;rows.push(`<div class="prow"><b>${esc(pl.name)}</b><small>${pl.district.toUpperCase()}</small><button data-m="${id}">${mute.has(pl.name)?'🔈 Unmute':'🔇 Mute'}</button><button data-b="${id}">${block.has(pl.name)?'✅ Unblock':'⛔ Block'}</button><button data-r="${id}">🚩 Report</button></div>`)});
  p.innerHTML=`<div class="phd">👥 ${room.state.players.size} online <button id="cplx">✕</button></div>${rows.join('')||'<p>Nobody else here yet. Share the link!</p>'}`;$('#cplx').onclick=()=>p.classList.add('hide');
  const nm=id=>{const q=room.state.players.get(id);return q&&q.name};
  p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const n=nm(b.dataset.m);if(!n)return;mute.has(n)?mute.delete(n):mute.add(n);ls('nr_mute',[...mute]);drawPlayers();drawLog()});
  p.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const n=nm(b.dataset.m||b.dataset.b);if(!n)return;block.has(n)?block.delete(n):block.add(n);ls('nr_block',[...block]);drawPlayers();drawLog()});
  p.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=prompt('Report '+nm(b.dataset.r)+' — what happened? (scam, insult, sharing numbers…)','scam');if(r!=null){room.send('report',{target:b.dataset.r,reason:r});}})}
 function addLog(m){log.push(m);if(log.length>80)log.shift();drawLog()}
 function drawLog(){clog.innerHTML=log.filter(m=>!(m.name&&(mute.has(m.name)||block.has(m.name)))&&(m.sys||m.ch===ch||(ch==='near'&&m.ch==='district'&&false))).slice(-30).map(m=>m.sys?`<p class="sys">${esc(m.text)}</p>`:`<p><b${m.from===me?' class="me"':''}>${esc(m.name)}:</b> ${esc(m.text)}</p>`).join('');clog.scrollTop=1e9}
 function sys(t){addLog({sys:1,text:t})}
 function bubble(id,text){const el=document.createElement('div');el.className='bub nbub';el.textContent=text;$('#bubs').appendChild(el);bubbles.filter(b=>b.id===id).forEach(b=>b.t=0);bubbles.push({id,el,t:5})}
 // ---------- join flow ----------
 N.openJoin=(look,onJoined)=>{const m=$('#creator'),cr=$('#cr');const sv=getServer(),saved=ls('nr_profile')||{};$('#title').classList.add('hide');m.classList.remove('hide');
  const SK=['#3b2219','#5a3825','#7a4b2e','#a0673f','#c68b59','#e0ac69'],OU=['#0b7a3e','#e53935','#1e88e5','#fdd835','#8e24aa','#fb8c00','#212121','#ffffff'];
  const lk=Object.assign({skin:SK[2],out:OU[0],hair:0,body:0},look||{},saved.look||{});
  const draw=()=>{cr.innerHTML=`<div class="card"><h2>🌍 Play Online <small style="font-size:12px;color:#0b7a3e">Naija Republic beta</small></h2><p>Share one Lagos with up to 50 players. Chat is filtered: no numbers, links or scams. Be nice.</p>
   <label class="sl">Nickname<input id="nNm" maxlength="14" value="${esc(saved.name||'')}" placeholder="e.g. Tunde"></label>
   <p><b>Skin</b></p><div class="row sw">${SK.map(c=>`<button class="opt ${lk.skin===c?'on':''}" data-sk="${c}" style="background:${c}">&nbsp;</button>`).join('')}</div>
   <p><b>Outfit</b></p><div class="row sw">${OU.map(c=>`<button class="opt ${lk.out===c?'on':''}" data-ou="${c}" style="background:${c}">&nbsp;</button>`).join('')}</div>
   <p><b>Hair</b></p><div class="row">${['Low cut','Afro','Braids','Cap','Wrap'].map((h,i)=>`<button class="opt ${lk.hair===i?'on':''}" data-h="${i}">${h}</button>`).join('')}</div>
   <div class="row"><button class="opt ${lk.body?'':'on'}" data-bd="0">Slim</button><button class="opt ${lk.body?'on':''}" data-bd="1">Broad</button></div>
   <details><summary style="font-size:12px">Server</summary><input id="nSv" value="${esc(sv)}" style="width:100%;font-size:12px"></details><p id="nErr" style="color:#c62828;font-weight:800"></p></div>
   <div class="acts"><button id="nGo">🚀 Join Lagos</button><button id="nBack" class="alt">⬅ Back</button></div><p class="sm" style="font-size:11px">Online mode uses a separate server wallet (₦50,000 starter). Your single-player save is not touched. Prototype: progress may be reset.</p>`;
   cr.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{lk.skin=b.dataset.sk;keep();draw()});cr.querySelectorAll('[data-ou]').forEach(b=>b.onclick=()=>{lk.out=b.dataset.ou;keep();draw()});
   cr.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{lk.hair=+b.dataset.h;keep();draw()});cr.querySelectorAll('[data-bd]').forEach(b=>b.onclick=()=>{lk.body=+b.dataset.bd;keep();draw()});
   $('#nBack').onclick=()=>{m.classList.add('hide');ctx.back()};
   $('#nGo').onclick=async()=>{keep();const name=$('#nNm').value.replace(/[<>&"']/g,'').trim();if(name.length<2){$('#nErr').textContent='Pick a nickname (2–14 letters)';return}
    const url=$('#nSv').value.trim();ls('nr_server',url);$('#nGo').disabled=true;$('#nErr').textContent='Connecting…';
    try{await N.connect(url,name,lk);ls('nr_profile',{name,look:lk});m.classList.add('hide');onJoined({...lk,name})}catch(e){$('#nGo').disabled=false;$('#nErr').textContent=errText(e)}}};
  const keep=()=>{const n=$('#nNm');saved.name=n?n.value:saved.name};draw()};
 const errText=e=>{const s=String(e&&e.message||e);if(s.includes('bad_name'))return 'That nickname is not allowed. Try another (letters/numbers only, no contacts).';if(s.includes('already_online'))return 'You are already online in another tab.';if(/full|locked/i.test(s))return 'Lagos is full (50 players). Try again soon.';return '😓 Server no dey answer ('+s.slice(0,80)+'). Play single-player for now, or try again later.'};
 N.connect=async(url,name,look)=>{const mod=await import(CLIENT_URL);client=new mod.Client(url);
  const opts={name,look,device:deviceId()};room=await Promise.race([client.joinOrCreate('lagos',opts),new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),12000))]);wire(room);N.on=true;closedByUser=false;
  await new Promise(r=>{const t=setInterval(()=>{if(hello){clearInterval(t);r()}},50);setTimeout(()=>{clearInterval(t);r()},4000)})};
 function wire(r){me=r.sessionId;
  r.onMessage('hello',m=>{hello=m;joinedAt=Date.now()-0;ctx.setMoney(m.balance);N._spawn={x:m.x,y:m.y};if(ctx.S&&ctx.S.online&&Number.isFinite(m.x)){ctx.S.p.x=m.x;ctx.S.p.y=m.y}sys('✅ You don land for Lagos. '+(m.trustSecs?`New players: quick phrases only for the first ${m.trustSecs>=60?Math.round(m.trustSecs/60)+' min':m.trustSecs+'s'}.`:''));drawQP()});
  r.onMessage('chat',m=>{if(block.has(m.name)||mute.has(m.name))return;addLog(m);if(m.ch==='near')bubble(m.from,m.text);ctx.AU&&ctx.AU.coin&&0});
  r.onMessage('blocked',m=>{const t='🚫 '+(REASON[m.reason]||m.reason)+(m.wait?` (${m.wait}s)`:'');sys(t);ctx.toast(ctx.tr(t,'🚫 '+(PG[m.reason]||REASON[m.reason]||m.reason)))});
  r.onMessage('sys',m=>{const t=m.k==='reported'?'🚩 Report sent. Thank you — moderators will review.':m.k==='report_wait'?'Wait small before another report.':m.text||'';sys(t);ctx.toast(t)});
  r.onMessage('wallet',m=>{ctx.setMoney(m.balance);if(m.err==='cooldown')ctx.toast(`⏳ Server: next paid shift in ${m.wait}s`);else if(m.err==='not_at_work')ctx.toast('Server: you must be at your workplace');else if(m.err)ctx.toast('Server wallet: '+m.err);else if(m.delta>0)ctx.toast(`🏦 Server paid you ₦${m.delta.toLocaleString()}`)});
  r.onMessage('correct',m=>{if(ctx.S&&ctx.S.online){ctx.S.p.x=m.x;ctx.S.p.y=m.y}});r.onMessage('emote',m=>{const o=remotes.get(m.from);if(o){o.em=m.id;o.emT=3}});r.onMessage('pong',()=>{});
  r.onLeave(async code=>{remotes.forEach(o=>{R.removeRemote(o.a);o.np.remove()});remotes.clear();if(closedByUser||code===1000||code===4000){return}
   if(code===4001){sys('Kicked for flooding.');N.fail('kicked');return}reconnect()})}
 async function reconnect(){if(reconnecting)return;reconnecting=true;sys('📶 Connection lost. Reconnecting…');ctx.toast('📶 Network shake. Reconnecting…');const tok=room&&room.reconnectionToken;
  for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,800*(i+1)));try{room=await client.reconnect(tok);wire(room);reconnecting=false;sys('✅ Reconnected');return}catch(e){}}
  try{const p=ls('nr_profile');room=await client.joinOrCreate('lagos',{name:p.name,look:p.look,device:deviceId()});wire(room);reconnecting=false;sys('✅ Rejoined');return}catch(e){}
  reconnecting=false;N.fail('down')}
 N.fail=why=>{N.on=false;room=null;ui.classList.add('hide');ctx.fallback(why)};
 N.leave=()=>{closedByUser=true;try{room&&room.leave(true)}catch(e){}room=null;N.on=false;remotes.forEach(o=>{R.removeRemote(o.a);o.np.remove()});remotes.clear();bubbles.forEach(b=>b.el.remove());bubbles.length=0;ui.classList.add('hide');log.length=0};
 N.show=()=>{ui.classList.remove('hide');drawLog()};
 N.emote=id=>{if(!room)return;room.send('emote',{id});emA={dance:'dance',zanku:'dance',wave:'wave',greet:'kneel',kneel:'kneel',laugh:'wave'}[id]||'wave';emT=3};
 N.localAnim=()=>emT>0?emA:'idle';
 N.job=(career,score)=>room&&room.send('job',{career,score});N.buy=item=>room&&room.send('buy',{item});N.spend=(amount,reason)=>room&&room.send('spend',{amount,reason});
 // ---------- per frame ----------
 N.frame=(dt,tm)=>{if(!N.on||!room)return;const S=ctx.S,IN=ctx.IN,PR=ctx.PR;emT-=dt;
  sendT-=dt;if(sendT<=0){sendT=.1;const st={x:Math.round(S.p.x*10)/10,y:Math.round(S.p.y*10)/10,ry:Math.round(PR.ry*100)/100,anim:PR.moving?'walk':N.localAnim(),ins:IN?IN.b.id:'',v:ctx.VEH?1:0};if(st.x!==last.x||st.y!==last.y||st.ry!==last.ry||st.anim!==last.anim||st.ins!==last.ins){room.send('move',st);last=st}}
  const seen=new Set();room.state.players.forEach((p,id)=>{if(id===me)return;seen.add(id);let o=remotes.get(id);
   if(!o){o={a:R.addRemote({skin:p.skin,out:p.out,hair:p.hair,body:p.body,name:p.name}),x:p.x,y:p.y,ry:p.ry,ph:0,em:null,emT:0,np:document.createElement('div')};o.np.className='np';o.np.textContent=p.name;$('#netNames').appendChild(o.np);remotes.set(id,o)}
   const d=Math.hypot(p.x-o.x,p.y-o.y);if(d>300){o.x=p.x;o.y=p.y}else{const k=Math.min(1,dt*10);o.x+=(p.x-o.x)*k;o.y+=(p.y-o.y)*k}
   let dr=((p.ry-o.ry+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;o.ry+=dr*Math.min(1,dt*12);o.emT-=dt;
   const moving=d>1.5||p.anim==='walk';if(moving)o.ph+=dt*11;const anim=moving?'walk':(o.emT>0?({dance:'dance',zanku:'dance',greet:'kneel',kneel:'kneel'})[o.em]||'wave':p.anim);
   const hidden=!!p.ins||!!IN||block.has(p.name);o.a.visible=!hidden;o.a.position.set(o.x*K,0,o.y*K);o.a.rotation.y=o.ry;R.animRemote(o.a,o.ph,anim,tm);
   const sc=R.screen(o.x*K,2.25,o.y*K),far=Math.hypot(p.x-S.p.x,p.y-S.p.y)>700;o.np.style.display=hidden||!sc.vis||far?'none':'block';o.np.style.transform=`translate(${sc.x}px,${sc.y}px) translate(-50%,-100%)`});
  remotes.forEach((o,id)=>{if(!seen.has(id)){R.removeRemote(o.a);o.np.remove();remotes.delete(id)}});
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];b.t-=dt;let wx,wz;if(b.id===me){if(IN){b.el.style.display='none';if(b.t<=0){b.el.remove();bubbles.splice(i,1)}continue}wx=S.p.x;wz=S.p.y}else{const o=remotes.get(b.id);if(!o||!o.a.visible){b.t=Math.min(b.t,0)}else{wx=o.x;wz=o.y}}
   if(b.t<=0){b.el.remove();bubbles.splice(i,1);continue}const sc=R.screen(wx*K,2.8,wz*K);b.el.style.display=sc.vis?'block':'none';b.el.style.transform=`translate(${sc.x}px,${sc.y}px) translate(-50%,-100%)`;b.el.style.opacity=Math.min(1,b.t)}
  const tl=hello?Math.max(0,Math.ceil(hello.trustSecs-(Date.now()-joinedAt)/1000)):0,tr=$('#ctrust');if(tl>0){tr.classList.remove('hide');tr.textContent=`🔒 Typing unlocks in ${Math.floor(tl/60)}:${String(tl%60).padStart(2,'0')} — use 💬 quick phrases`;cin.disabled=true}else if(!tr.classList.contains('hide')){tr.classList.add('hide');cin.disabled=false}
  $('#netHud').textContent=`🟢 ${room.state.players.size} online · ${['Yaba','VI','Lekki'][S.p.x<1500?0:S.p.x<3100?1:2]}`;
  if(Math.random()<.02)drawPlayers()};
 window.NET=N;return N}
