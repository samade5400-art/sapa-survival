const GAME_URL=(location.protocol.startsWith('http')?location.origin+location.pathname.replace(/index\.html$/,''):'');
const T={en:{title:'Sapa Survival',sub:'30 Days in Lagos',intro:'Your salary of ₦250,000 just landed. Can you survive 30 days of Lagos wahala?',daily:'Daily Challenge',free:'Free Play',best:'Best score',day:'Day',money:'Money',energy:'Energy',peace:'Peace of Mind',respect:'Respect',family:'Family Pressure',end:'Game Over',won:'You survived 30 days!',lost:'Sapa don win this round…',score:'Score',level:'Sapa Level',share:'Share',again:'Play again',home:'Home',copied:'Copied to clipboard!',reasonMoney:'You stayed broke for 3 days straight.',reasonPeace:'Your peace of mind finished.',daily_note:'Same cards for everyone today'},
pg:{title:'Sapa Survival',sub:'30 Days for Lagos',intro:'Your salary ₦250,000 don land. You fit survive 30 days of Lagos wahala?',daily:'Today Challenge',free:'Free Play',best:'Your best',day:'Day',money:'Money',energy:'Energy',peace:'Peace of Mind',respect:'Respect',family:'Family Pressure',end:'E Don End',won:'You don survive 30 days!',lost:'Sapa don win this round…',score:'Score',level:'Sapa Level',share:'Share am',again:'Play again',home:'Home',copied:'E don copy!',reasonMoney:'You broke reach 3 days straight.',reasonPeace:'Your peace of mind don finish.',daily_note:'Everybody dey get the same card today'}};
const TITLES={en:['Lagos Big Boss','Soft Life Ambassador','Comfortable Citizen','Managing Well','Steady Hustler','Average Lagosian','Feeling the Squeeze','Sapa Is Knocking','Sapa Roommate','Sapa Ambassador','Sapa Generational Champion'],
pg:['Odogwu of Lagos','Soft Life Ambassador','Pesin wey dey enjoy','You dey manage well','Hustler wey no dey tire','Normal Lagos pikin','Belle don dey shake','Sapa dey knock door','Sapa na your roommate','Sapa Ambassador','Sapa don marry you'],
};
let lang=localStorage.getItem('sapa_lang')||'en',S=null;const $=id=>document.getElementById(id),app=document.getElementById('app');
const t=k=>T[lang][k],naira=n=>(n<0?'-':'')+'₦'+Math.abs(Math.round(n)).toLocaleString('en-NG');
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let x=Math.imul(a^a>>>15,1|a);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296}}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
const todayKey=()=>new Date().toLocaleDateString('en-CA');
function start(mode){const seedStr=mode==='daily'?todayKey():String(Date.now()),r=rng(hash(seedStr));
 const deck=[...EVENTS];for(let i=deck.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
 const plan=[];let k=0;for(let d=1;d<=30;d++){const n=r()<0.45?2:1;const day=[];for(let i=0;i<n;i++)day.push(deck[k++%deck.length]);plan.push(day)}
 S={mode,seedStr,day:1,idx:0,plan,m:250000,e:70,p:70,r:50,f:30,broke:0,over:false,log:[],msg:''};render()}
const clamp=v=>Math.max(0,Math.min(100,v));
function choose(ci){const ev=S.plan[S.day-1][S.idx],fx=ev.choices[ci].fx;S.m+=fx.m||0;S.e=clamp(S.e+(fx.e||0));S.p=clamp(S.p+(fx.p||0));S.r=clamp(S.r+(fx.r||0));S.f=clamp(S.f+(fx.f||0));
 S.log.push(ev.id+':'+ci);S.idx++;if(S.idx>=S.plan[S.day-1].length)endDay();if(!S.over)render();beep(ci)}
function endDay(){S.m-=3500;S.e=clamp(S.e+6);S.f=clamp(S.f+1);if(S.e<=0)S.p=clamp(S.p-8);if(S.f>=90)S.p=clamp(S.p-8);if(S.m<0){S.broke++;S.p=clamp(S.p-5)}else S.broke=0;
 S.msg=1;
 if(S.p<=0)return finish('reasonPeace');if(S.broke>=3)return finish('reasonMoney');if(S.day>=30)return finish(null);S.day++;S.idx=0}
function scoreOf(){return Math.max(0,Math.round(S.day*100+S.m/1000+S.p+S.r+S.e-S.f+(S.reason?0:500)))}
function sapaLevel(){let l=10-Math.round((Math.max(0,Math.min(S.m,150000))/150000)*6+(S.p/100)*2+(S.reason?0:2));return Math.max(0,Math.min(10,l))}
function finish(reason){S.over=true;S.reason=reason;S.score=scoreOf();S.level=sapaLevel();const b=+localStorage.getItem('sapa_best')||0;if(S.score>b)localStorage.setItem('sapa_best',S.score);renderEnd()}
function bar(k,v,bad){return `<div class="stat ${bad?'bad':''}">${t(k)} ${v}<div class="bar"><i style="width:${v}%"></i></div></div>`}
function header(){return `<div class="top"><h1>🚌 <span>${t('title')}</span></h1><button class="lang" onclick="toggleLang()">${lang==='en'?'Pidgin':'English'}</button></div>`}
function home(){S=null;app.innerHTML=header()+`<div class="panel"><div class="emoji">🌆</div><p class="sub center">${t('sub')}</p><p>${t('intro')}</p>
 <button id="daily" onclick="start('daily')">📅 ${t('daily')}</button><p class="fx center">${t('daily_note')} (${todayKey()})</p><button class="alt" id="free" onclick="start('free')">🎲 ${t('free')}</button>
 <p class="center"><b>${t('best')}: ${localStorage.getItem('sapa_best')||0}</b></p></div>`}
function render(){if(!S)return home();if(S.over)return renderEnd();const ev=S.plan[S.day-1][S.idx];
 app.innerHTML=header()+`<div class="panel"><div class="day">${t('day')} ${S.day}/30 ${S.mode==='daily'?'📅':'🎲'}</div><div class="stats"><div class="money">💰 ${naira(S.m)}</div>${bar('energy',S.e)}${bar('peace',S.p)}${bar('respect',S.r)}${bar('family',S.f,true)}</div><div class="toast">${S.msg?(lang==='en'?'Food &amp; transport: -₦3,500':'Chop and transport: -₦3,500'):''}</div></div>
 <div class="panel card"><div class="emoji">${ev.emoji}</div><p id="evtext">${ev.text[lang]}</p>${ev.choices.map((c,i)=>`<button class="${i%2?'alt':''}" data-c="${i}" onclick="choose(${i})">${c.text[lang]}</button>`).join('')}</div>`}
function renderEnd(){app.innerHTML=header()+`<div class="panel center" id="end"><h2>${S.reason?t('lost'):t('won')}</h2>${S.reason?`<p>${t(S.reason)}</p>`:''}
 <div>${t('score')}</div><div class="big" id="score">${S.score}</div><div>${t('level')}</div><div class="big">${S.level}/10</div><h3>"${TITLES[lang][S.level]}"</h3>
 <p>💰 ${naira(S.m)} · 📅 ${t('day')} ${S.day}</p><button id="share" onclick="share()">📤 ${t('share')}</button><button class="alt" onclick="start('${S.mode}')">${t('again')}</button><button class="alt" onclick="home()">${t('home')}</button><div class="toast" id="toast"></div></div>`}
function shareText(){const bars=n=>'🟩'.repeat(Math.round(n/20))+'⬜'.repeat(5-Math.round(n/20));
 return `🚌 Sapa Survival ${S.mode==='daily'?S.seedStr:'(free play)'}\n${S.reason?'💀':'🏆'} ${t('day')} ${S.day}/30 · ${t('score')} ${S.score}\n😵 ${t('level')} ${S.level}/10: ${TITLES[lang][S.level]}\n💰 ${naira(S.m)}\n🧘 ${bars(S.p)}\n🔥 ${bars(S.r)}\n#SapaSurvival\n${GAME_URL}`}
function drawCard(){const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
 x.fillStyle='#ffd400';x.fillRect(0,0,1080,1920);x.fillStyle='#ffcc00';for(let i=-1920;i<1080;i+=112){x.beginPath();x.moveTo(i,0);x.lineTo(i+56,0);x.lineTo(i+56+1920,1920);x.lineTo(i+1920,1920);x.fill()}
 x.fillStyle='#0b7a3e';x.fillRect(0,0,1080,300);x.fillStyle='#fff';x.textAlign='center';x.font='900 96px sans-serif';x.fillText('SAPA SURVIVAL',540,170);x.font='700 48px sans-serif';x.fillText(t('sub'),540,250);
 x.fillStyle='#fff';x.strokeStyle='#111';x.lineWidth=12;x.beginPath();x.roundRect(90,400,900,1200,50);x.fill();x.stroke();
 x.fillStyle='#111';x.font='800 60px sans-serif';x.fillText(S.reason?t('lost'):t('won'),540,520);x.font='700 50px sans-serif';x.fillText(t('score'),540,660);
 x.fillStyle='#0b7a3e';x.font='900 200px sans-serif';x.fillText(S.score,540,860);x.fillStyle='#111';x.font='700 50px sans-serif';x.fillText(t('level')+' '+S.level+'/10',540,1000);
 x.fillStyle='#d33';x.font='900 66px sans-serif';x.fillText(TITLES[lang][S.level],540,1110);x.fillStyle='#111';x.font='700 54px sans-serif';x.fillText('💰 '+naira(S.m)+'   📅 '+t('day')+' '+S.day+'/30',540,1260);
 x.font='600 42px sans-serif';x.fillText(S.mode==='daily'?'📅 '+S.seedStr:'🎲 Free play',540,1380);x.font='800 52px sans-serif';x.fillText('#SapaSurvival',540,1760);return c}
async function share(){const c=drawCard(),txt=shareText();window.__lastCard=c;try{await navigator.clipboard.writeText(txt)}catch(e){}
 c.toBlob(async b=>{const file=new File([b],'sapa-survival.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:txt});return}catch(e){}}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='sapa-survival.png';a.click();const tt=$('toast');if(tt)tt.textContent=t('copied')},'image/png')}
function toggleLang(){lang=lang==='en'?'pg':'en';localStorage.setItem('sapa_lang',lang);S?render():home()}
let actx;function beep(i){try{actx=actx||new AudioContext();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=440+i*120;g.gain.value=.05;o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+.08)}catch(e){}}
home();
