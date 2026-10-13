// Naija Republic v5 — Story mode "From Face-Me-I-Face-You to Lekki": chapters, quests, dialogue trees, cutscene, endings.
export function makeStory(G){
const $=s=>document.querySelector(s);const tr=(e,p)=>G.tr(e,p),L=a=>Array.isArray(a)?tr(a[0],a[1]):(typeof a==='function'?a():a);
const st=()=>G.S&&G.S.story&&G.S.story.on?G.S.story:null;const F=()=>st().F;const rel=(k,d)=>{const s=st();if(s)s.rel[k]=Math.max(-5,Math.min(10,(s.rel[k]||0)+d))};
const WHO={tunde:['🧢','Tunde','#1e88e5'],mama:['👩🏾‍🍳','Mama Shitta','#2e7d32'],landlord:['👴🏾','Baba Landlord','#6d4c41'],uncle:['📞','Uncle Bayo','#8e24aa'],boss:['👔','',''],amaka:['👩🏾','Amaka','#d81b60'],mum:['🙏🏾',tr('Mum (text message)','Mama (text message)'),'#ef6c00'],cond:['🚌',tr('Conductor','Conductor'),'#f9a825'],pos:['🏧',tr('POS Agent','POS Man'),'#455a64'],dj:['🎧','DJ Spinz','#ff4081'],nar:['🌅','Lagos','#111'],you:['🙂','','#0b7a3e']};
const BOSS={tech:['Oga Femi','#1b3a5c'],bank:['Mrs Coker','#0d47a1'],trade:['Alhaja Basirat','#c62828'],ent:['DJ Spinz','#ff4081']};
const LOOK={tunde:{skin:'#5a3825',out:'#1e88e5',hair:3,body:1},landlord:{skin:'#3b2219',out:'#fafafa',hair:4,body:1},amaka:{skin:'#7a4b2e',out:'#d81b60',hair:2,body:0},boss:{skin:'#5a3825',out:'#212121',hair:0,body:1},dj:{skin:'#3b2219',out:'#ff4081',hair:1,body:1}};
const nw=()=>G.S.money+G.S.save-G.S.debt;
const jobLoc=()=>({tech:'tech',bank:'bank',trade:'market',ent:'studio'})[st().job]||'tech';
const homeB=()=>G.HOMES[G.S.home].b;
// ---------------- dialogue ----------------
let dq=null;const D={};
function talk(id,done){const n=D[id];if(!n){done&&done();return}const sp=n.who==='boss'?['👔',BOSS[st().job||'tech'][0],BOSS[st().job||'tech'][1]]:WHO[n.who];
 const box=$('#dlg');box.classList.remove('hide');document.body.classList.add('lbx');G.AU.click();if(n.tense)S.tense=1;
 const cs=(n.c||[{t:['Continue ▶','Continue ▶']}]).map(c=>({...c,dis:c.req&&!c.req()}));
 box.innerHTML=`<div class="dwho" style="background:${sp[2]}">${sp[0]} ${sp[1]||G.S.look.name}</div><div class="dtx">${L(n.t)}</div><div class="dch">${cs.map((c,i)=>`<button data-c="${i}" ${c.dis?'disabled':''}>${L(c.t)}${c.hint?`<small>${L(c.hint)}</small>`:''}</button>`).join('')}</div>`;
 box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=cs[+b.dataset.c];if(c.dis)return;if(c.fx)G.fx(c.fx);if(c.rel)for(const k in c.rel)rel(k,c.rel[k]);let nx=c.go;if(c.f){const r=c.f();if(typeof r==='string')nx=r}G.fix();G.save();G.hud();
  if(nx)talk(nx,done);else{box.classList.add('hide');document.body.classList.remove('lbx');S.tense=0;done&&done();check()}})}
const say=(who,t,go,extra={})=>({who,t,c:[{t:['Continue ▶','Continue ▶'],go}],...extra});
// Tunde
D.t_meet={who:'tunde',t:["AHHH! You don land! Welcome to face-me-I-face-you. Toilet is shared, light belongs to NEPA, but the vibes? Premium.","AHHH! You don land! Welcome to face-me-I-face-you. Toilet na shared, light na NEPA own, but the vibes? Premium."],
 c:[{t:['Thanks bro, I owe you one 🙏🏾','Thank you my guy, I owe you 🙏🏾'],rel:{tunde:2},go:'t_meet2'},{t:['Where is the AC?','Where the AC dey?'],fx:{p:3},rel:{tunde:1},go:'t_ac'},{t:['Lagos is scary o…','Lagos dey fear me o…'],go:'t_meet2'}]};
D.t_ac={who:'tunde',t:["AC? 😂 The AC is that window. Open it and pray for breeze.","AC? 😂 Na that window be AC. Open am, pray for breeze."],c:[{t:['😂 Okay o','😂 Okay o'],go:'t_meet2'}]};
D.t_meet2=say('tunde',["Fear doesn't pay rent. Go greet Mama Shitta next door — she will feed you before Lagos eats you.","Fear no dey pay rent. Go greet Mama Shitta for next door — she go feed you before Lagos chop you."],null);
D.t_idle={who:'tunde',t:()=>[['Mama Shitta buka is right beside us. Go chop!','Mama Shitta buka dey beside us. Go chop!'],["Tech Hub, Market, Bank or Studio — pick a hustle. Money no dey fall from sky.","Tech Hub, Market, Bank or Studio — pick one hustle. Money no dey fall from sky."],["Baba Landlord has been looking for you o. Hide your face!","Baba Landlord dey find you o. Hide your face!"],["You are blowing! Don't forget us when you reach Lekki.","You don dey blow! No forget us when you reach Lekki."],["Whatever you choose, I'm proud of you.","Anything wey you choose, I proud of you."]][Math.min(4,st().ch-1)],c:[{t:['👍🏾','👍🏾']}]};
D.t_decide={who:'tunde',t:["So… what is the plan? You can stay and hustle until Lekki, japa to Canada, or go back to the village. No wrong answer.","So… wetin be the plan? You fit stay hustle reach Lekki, japa go Canada, or go back village. No wrong answer."],
 c:[{t:['🏙️ Lekki Big Boss or nothing!','🏙️ Lekki Big Boss or nothing!'],hint:['Move into a Lekki flat + throw a VIP party','Enter Lekki flat + do VIP party'],f:()=>{st().path='boss';G.toast('🏙️ '+tr('Path chosen: Lekki Big Boss','Path: Lekki Big Boss'))}},
  {t:['✈️ Japa to Canada','✈️ Japa go Canada'],hint:['IELTS + ₦800k proof of funds','IELTS + ₦800k proof of funds'],f:()=>{st().path='japa';G.toast('✈️ '+tr('Path chosen: Japa','Path: Japa'))}},
  {t:['🏡 Go back to the village','🏡 Go back village'],hint:['Mum is waiting','Mama dey wait'],f:()=>{st().path='village';G.toast('🏡 '+tr('Path chosen: Village','Path: Village'))}},{t:['Let me think small…','Make I think small…']}]};
// Mama Shitta
D.m_meet={who:'mama',t:["Ah-ah! New face! You are Tunde's friend? Sit down jare. First plate is half price for new people.","Ah-ah! New face! You be Tunde friend? Siddon jare. First plate na half price for new people."],
 c:[{t:['Thank you ma! 🙏🏾','Thank you ma! 🙏🏾'],rel:{mama:2},fx:{p:3}},{t:['Ma, can I pay later?','Mama, I fit pay later?'],go:'m_credit'},{t:["I'm on a diet","I dey diet"],go:'m_diet'}]};
D.m_credit={who:'mama',t:["'Pay later' is Lagos' favourite song. Okay, this one plate is on me. Next time, cash!","'Pay later' na Lagos favourite song. Okay, this one plate na my own. Next time, cash!"],c:[{t:['God bless you ma!','God bless you ma!'],rel:{mama:1},f:()=>{G.stat('hunger',40);F().ate=1;G.toast('🍲 +🍲40')}}]};
D.m_diet={who:'mama',t:["Diet? In Lagos? You will learn. Sapa will put you on diet by itself.","Diet? For Lagos? You go learn. Sapa go put you for diet by himself."],c:[{t:['😅 Okay, give me amala','😅 Okay, bring amala'],fx:{r:1}}]};
// Boss
D.b_meet={who:'boss',t:["You want work? Everybody wants work. What can you do?","You want work? Everybody want work. Wetin you sabi do?"],
 c:[{t:["I'm a fast learner, I'll give my best!","I dey learn fast, I go give am my best!"],rel:{boss:2},f:()=>hire()},{t:["My uncle knows your oga's oga…","My uncle know your oga oga…"],rel:{boss:-1},fx:{r:2},f:()=>{hire();return 'b_conn'}},{t:["Honestly? I'll learn anything.","True true? I go learn anything."],fx:{p:3},rel:{boss:1},f:()=>hire()}]};
D.b_conn=say('boss',["Connection, eh? Fine. But here, results speak. Start tomorrow… I mean, start now.","Connection abi? Fine. But for here, result dey talk. Start now now."],null);
D.b_promo=say('boss',["I've been watching you. You work hard. Congratulations on your promotion!","I don dey watch you. You dey work well. Congrats on your promotion!"],null);
// Landlord
D.l_meet={who:'landlord',tense:1,t:["Ehen! My tenant! Economy has changed. From today rent is TWO YEARS upfront: ₦200,000. Pay, or pack your load.","Ehen! My tenant! Economy don change. From today rent na TWO YEARS upfront: ₦200,000. Pay, or pack your load."],
 c:[{t:['💸 Pay ₦200,000','💸 Pay ₦200,000'],req:()=>G.S.money>=200000,hint:['Rent sorted for 2 years','Rent go settle for 2 years'],f:()=>{G.pay(200000);G.S.rentDue=Math.max(G.S.rentDue,G.day())+728;st().c.landlord='paid';F().landlord=1;rel('landlord',2);G.AU.coin();return 'l_paid'}},
  {t:['🤝 Negotiate','🤝 Negotiate'],go:'l_neg'},
  {t:['📦 Move to a self-contain','📦 Pack go self-contain'],req:()=>G.S.money>=150000&&G.S.respect>=8&&G.S.home===0,hint:['₦150,000 fee, needs ⭐8','₦150,000 fee, need ⭐8'],f:()=>{G.pay(150000);G.S.home=1;G.S.rentDue=G.day()+7;st().c.landlord='moved';F().landlord=1;G.stat('respect',5);return 'l_moved'}},
  {t:['🙏🏾 Beg Baba','🙏🏾 Beg Baba'],go:'l_beg'}]};
D.l_neg={who:'landlord',tense:1,t:["Negotiate ke? Convince me. Quick, my favourite programme is starting.","Negotiate ke? Convince me sharp sharp, my programme don dey start."],
 c:[{t:["Baba, I'm a hard worker. Let me pay 6 months (₦60,000).","Baba, I dey work hard. Make I pay 6 months (₦60,000)."],req:()=>G.S.money>=60000&&(G.S.respect>=12||(st().rel.mama||0)>=2),hint:['Needs ⭐12 or Mama Shitta to vouch for you','Need ⭐12 or Mama Shitta to vouch'],f:()=>{G.pay(60000);G.S.rentDue=Math.max(G.S.rentDue,G.day())+182;st().c.landlord='negotiated';F().landlord=1;rel('landlord',1);return 'l_ok'}},
  {t:['Tunde, abeg help me talk!','Tunde, abeg help me beg am!'],req:()=>(st().rel.tunde||0)>=2&&G.S.money>=40000,hint:['Needs a good friendship with Tunde + ₦40,000','Need Tunde as padi + ₦40,000'],f:()=>{G.pay(40000);G.S.rentDue=Math.max(G.S.rentDue,G.day())+91;st().c.landlord='tunde';F().landlord=1;rel('tunde',1);return 'l_tunde'}},
  {t:['Back','Back'],fx:{p:-4},go:'l_meet'}]};
D.l_beg={who:'landlord',tense:1,t:["Hmm. You remind me of my son. Fine — ₦100,000 for one year. Final.","Hmm. You resemble my pikin. Fine — ₦100,000 for one year. Final."],c:[{t:['Pay ₦100,000','Pay ₦100,000'],req:()=>G.S.money>=100000,f:()=>{G.pay(100000);G.S.rentDue=Math.max(G.S.rentDue,G.day())+364;st().c.landlord='begged';F().landlord=1;G.stat('peace',-4);return 'l_ok'}},{t:['I no get am… (back)','I no get am… (back)'],fx:{p:-6},go:'l_meet'}]};
D.l_paid=say('landlord',["Ehen! This is why I like you. You are now my favourite tenant. 🫡","Ehen! Na why I like you. You be my favourite tenant now. 🫡"],null);
D.l_ok=say('landlord',["Okay. Don't let me hear NEPA bill complaint from you!","Okay. No let me hear NEPA bill complain from your mouth!"],null);
D.l_tunde={who:'tunde',t:["Baba, this one is a good person, she/he even helped me pay light bill! ₦40k for 3 months, abeg.","Baba, this one na better person, e even help me pay light bill! ₦40k for 3 months, abeg."],c:[{t:['🙏🏾','🙏🏾'],go:'l_ok'}]};
D.l_moved=say('landlord',["Self-contain? Big man! Okay o, go well.","Self-contain? Big man! Okay o, waka well."],null);
// POS scam
D.p_meet={who:'pos',tense:1,t:["Customer! Your transfer for the stock failed o. Pay again, ₦5,000. Network.","Customer! Your transfer for the market stock fail o. Pay again, ₦5,000. Na network."],
 c:[{t:['📱 Show your bank alert','📱 Show am your bank alert'],fx:{r:3},f:()=>{st().c.pos='receipt';F().pos=1;return 'p_caught'}},{t:['💸 Just pay again','💸 Just pay again'],req:()=>G.S.money>=5000,fx:{m:-5000,p:-5},f:()=>{st().c.pos='paid';F().pos=1}},
  {t:['📞 Call Amaka (she works in fintech)','📞 Call Amaka (she dey fintech)'],req:()=>(st().rel.amaka||0)>=1,rel:{amaka:1},fx:{r:5},f:()=>{st().c.pos='amaka';F().pos=1;return 'p_amaka'}},{t:['📣 Shout for the crowd!','📣 Shout make crowd gather!'],fx:{e:-5,r:4},f:()=>{st().c.pos='crowd';F().pos=1;return 'p_caught'}}]};
D.p_caught=say('pos',["Ehn… e-e-e be like say e don enter sha. My mistake. 😅","Ehn… e be like say e don enter sha. My mistake. 😅"],null);
D.p_amaka=say('amaka',["(on the phone) Tell him the session ID is right there on your app. He is lying. Report him to the bank!","(for phone) Tell am say session ID dey your app. Him dey lie. Report am for bank!"],null);
// Amaka
D.a_meet={who:'amaka',t:["Hi! You're new in Yaba? I'm Amaka — product designer by day, unofficial Yaba tour guide by night.","Hi! You be new person for Yaba? I be Amaka — product designer for day, Yaba tour guide for night."],
 c:[{t:['Nice to meet you! Show me around sometime?','Nice to meet you! Show me around one day?'],rel:{amaka:2},fx:{p:4}},{t:['Do you know any jobs?','You know any work?'],rel:{amaka:1},go:'a_job'},{t:['Just passing, bye!','Just dey pass, bye!']}]};
D.a_job=say('amaka',["Tech Hub hires interns. Market pays daily. Just don't sell your soul to a crypto 'mentor'. 😂","Tech Hub dey hire interns. Market dey pay daily. Just no sell your soul give crypto 'mentor'. 😂"],null);
D.a_2={who:'amaka',t:["Lagos is hard, but sunsets at the beach make it worth it. How are you holding up?","Lagos hard, but sunset for beach make am worth am. How you dey hold body?"],c:[{t:["Better now that we're talking 😊","Better now wey we dey talk 😊"],rel:{amaka:2},fx:{p:6}},{t:["Tired, but I'm pushing","I tire, but I dey push"],rel:{amaka:1},fx:{p:3}}]};
// Uncle
D.u_call={who:'uncle',t:["My dear! Your cousin Kunle's school fees — ₦50,000. You are now the Lagos big person of the family!","My pikin! Your cousin Kunle school fees — ₦50,000. You be Lagos big person for family now!"],
 c:[{t:['💸 Send ₦50,000','💸 Send ₦50,000'],req:()=>G.S.money>=50000,fx:{m:-50000,r:6,p:2},rel:{uncle:3},f:()=>{st().c.uncle='paid'}},{t:['💸 Send ₦10,000 "small small"','💸 Send ₦10,000 "small small"'],req:()=>G.S.money>=10000,fx:{m:-10000,r:2},rel:{uncle:1},f:()=>{st().c.uncle='some'}},
  {t:['📶 "Uncle… network is bad… hello?"','📶 "Uncle… network bad… hello?"'],fx:{p:-3},rel:{uncle:-2},f:()=>{st().c.uncle='dodged'}}]};
// DJ Spinz studio side quest
D.d_meet={who:'dj',t:["My hype man didn't show up! You fit hype the crowd for my live session? I'll pay ₦15,000.","My hype man no show! You fit hype crowd for my live session? I go pay ₦15,000."],c:[{t:["Let's GOOO! 🎤","Make we GOOO! 🎤"],req:()=>G.S.energy>=20,hint:['Needs ⚡20','Need ⚡20'],fx:{e:-15,r:6},f:()=>{G.earn(15000);F().studio=1;G.AU.coin();return 'd_done'}},{t:['Not today','No be today']}]};
D.d_done=say('dj',["The crowd went MAD! You're a natural. Come back anytime.","Crowd don craze! You get am for blood. Come back anytime."],null);
// ---------------- chapters ----------------
const CH=[
 {n:['Arrival','Arrival'],o:[{id:'room',t:["Find Tunde's room (Your Room, Yaba)","Find Tunde room (Your Room, Yaba)"],g:'room',d:()=>F().tunde},{id:'mama',t:['Meet Mama Shitta at her buka','Greet Mama Shitta for her buka'],g:'buka',d:()=>F().mama},{id:'eat',t:['Eat something at the buka','Chop something for buka'],g:'buka',d:()=>F().ate}]},
 {n:['Hustle','Hustle'],o:[{id:'job',t:['Get a job: Tech Hub, Market, Bank or Studio','Find work: Tech Hub, Market, Bank or Studio'],g:'tech',d:()=>F().job},{id:'shifts',t:()=>tr(`Complete 3 work shifts (${Math.min(3,G.S.shifts-st().s0)}/3)`,`Do 3 shifts (${Math.min(3,G.S.shifts-st().s0)}/3)`),g:jobLoc,d:()=>G.S.shifts-st().s0>=3},{id:'fuel',t:['Beat NEPA: buy fuel for your gen','Beat NEPA: buy fuel for gen'],g:'fuel',d:()=>F().fuel}]},
 {n:['Landlord Wahala','Landlord Wahala'],o:[{id:'landlord',t:['Baba Landlord is waiting in your room…','Baba Landlord dey wait for your room…'],g:homeB,d:()=>F().landlord},{id:'pos',t:['Buy stock at the market','Buy stock for market'],g:'market',d:()=>F().pos}]},
 {n:['Blow','Blow'],o:[{id:'promo',t:['Get promoted at work','Collect promotion for work'],g:jobLoc,d:()=>Object.values(G.S.car).some(c=>c.lv>=1)},{id:'kwilox',t:['Celebrate at Kwilox Club (9pm–4am)','Go flex for Kwilox (9pm–4am)'],g:'club',d:()=>F().kwilox},{id:'uncle',t:["Answer Uncle Bayo's call","Pick Uncle Bayo call"],g:null,d:()=>F().uncle},{id:'studio',opt:1,t:['(Optional) Help DJ Spinz at Lekki Vibes Studio','(Optional) Help DJ Spinz for Lekki Vibes Studio'],g:'studio',d:()=>F().studio},{id:'amaka',opt:1,t:['(Optional) Hang out with Amaka (Tech Hub by day)','(Optional) Hang with Amaka (Tech Hub for day)'],g:'tech',d:()=>F().amaka2}]},
 {n:['Big Decision','Big Decision'],o:[{id:'decide',t:['Talk to Tunde about your future','Talk to Tunde about your future'],g:homeB,d:()=>!!st().path},
  {id:'flat',p:'boss',t:['Move into a Lekki Phase 1 flat','Enter Lekki Phase 1 flat'],g:'flat',d:()=>G.S.home===2},{id:'vip',p:'boss',t:['Throw a VIP party at Kwilox','Do VIP party for Kwilox'],g:'club',d:()=>F().vip},
  {id:'ielts',p:'japa',t:['Pay for IELTS at Yabacon Tech Hub (₦120,000)','Pay IELTS for Yabacon Tech Hub (₦120,000)'],g:'tech',d:()=>F().ielts},{id:'pof',p:'japa',t:()=>tr(`Proof of funds: ₦800,000 in savings (${G.N(G.S.save)})`,`Proof of funds: ₦800,000 for savings (${G.N(G.S.save)})`),g:'bank',d:()=>G.S.save>=800000||F().flew},{id:'fly',p:'japa',t:['Fly out from the Japa gate at Murtala Airport (Ikeja)','Comot from Japa gate for Murtala Airport (Ikeja)'],g:'airport',d:()=>F().flew},
  {id:'bus',p:'village',t:['Take the bus home from Yaba Park','Enter bus go village for Yaba Park'],g:'park0',d:()=>F().home}]}];
const objs=()=>{const s=st();return CH[s.ch-1].o.filter(o=>!o.p||o.p===s.path)};
const cur=()=>{const s=st();if(!s||s.ending&&s.ch>5)return null;return objs().find(o=>!o.opt&&!o.d())||null};
function hire(){if(!st().job)st().job=st().pend||'tech';F().job=1;G.toast('💼 '+tr('You got the job!','You don get work!'))}
function check(){const s=st();if(!s||s.ending)return;
 if(G.S.homeless||nw()<-150000&&G.S.money<2000){ending('sapa');return}
 if(s.ch<=5&&!cur()){if(s.ch===5){const p=s.path;if(p)ending(p);return}s.ch++;if(s.ch===2)s.s0=G.S.shifts;chapterCard();G.save()}}
function chapterCard(){const s=st();const c=$('#chap');c.innerHTML=`<small>${tr('Chapter','Chapter')} ${s.ch}</small><b>${L(CH[s.ch-1].n)}</b>`;c.classList.remove('hide');c.classList.remove('go');void c.offsetWidth;c.classList.add('go');G.AU.coin();setTimeout(()=>c.classList.add('hide'),3200)}
// ---------------- cutscene ----------------
let cine=null;
function intro(done){const pk=G.BY.park0.door,K=G.K,px=pk.x*K,pz=(pk.y-24)*K;G.S.t=Math.floor(G.S.t/1440)*1440+6.5*60;G.S.lh=Math.floor(G.S.t/60);
 const shots=[{a:[px+40,30,pz-70],b:[px+10,22,pz-40],l:[px,0,pz+10],d:5,line:['nar',["Lagos. Eko o ni baje. 6:30am, Monday.","Lagos. Eko o ni baje. 6:30am, Monday."]]},
  {a:[px-30,6,pz-12],b:[px-8,4,pz-8],l:[px-2,1.5,pz+3],d:4.5,line:['cond',["Yaba! Yaba! Last bus stop! Everybody comot! Mind your head!","Yaba! Yaba! Last bus stop! Everybody comot! Mind your head!"]]},
  {a:[px+4,2.6,pz-7],b:[px+1.5,2.1,pz-4.2],l:[px,1.4,pz],d:4,line:['mum',["My child, Lagos is not easy. Remember where you come from. I'm praying for you every day. ₦50,000 is all we have — use it well. — Mama","My pikin, Lagos no easy. Remember where you come from. I dey pray for you every day. Na ₦50,000 we get — use am well. — Mama"]]},
  {a:[px+1.5,2.1,pz-4.2],b:[px-3,6,pz-10],l:[px,1.4,pz],d:4,line:['tunde',["(text) Welcome to Lagos!!! My room is near Mama Shitta's buka in Yaba. Find me, I've cleared space for you on the mattress. 😂","(text) Welcome to Lagos!!! My room dey near Mama Shitta buka for Yaba. Find me, I don clear space for you for mattress. 😂"]]}];
 document.body.classList.add('lbx');$('#cine').classList.remove('hide');let i=-1,t0=0;
 const next=()=>{i++;if(i>=shots.length){end();return}const s=shots[i];t0=performance.now();cine={s,get k(){return Math.min(1,(performance.now()-t0)/1000/s.d)}};const w=WHO[s.line[0]];
  $('#cine').innerHTML=`<div class="cl"><div class="dwho" style="background:${w[2]}">${w[0]} ${w[1]}</div><div class="dtx">${L(s.line[1])}</div><div class="dch"><button id="cNext">${i<shots.length-1?tr('Next ▶','Next ▶'):tr('Start ▶','Start ▶')}</button><button id="cSkip" class="alt">${tr('Skip intro ⏭','Skip ⏭')}</button></div></div>`;
  $('#cNext').onclick=()=>{G.AU.click();next()};$('#cSkip').onclick=end};
 const end=()=>{if(!cine&&i>=shots.length)return;cine=null;i=shots.length;$('#cine').classList.add('hide');document.body.classList.remove('lbx');st().intro=1;G.save();chapterCard();done&&done()};next()}
const cam=()=>{if(!cine)return null;const s=cine.s,k=cine.k,e=k*k*(3-2*k);return{p:s.a.map((v,j)=>v+(s.b[j]-v)*e),l:s.l}};
// ---------------- uncle call ----------------
function call(){const c=$('#call');c.classList.remove('hide');G.AU.ring(true);c.innerHTML=`<div class="callc"><div class="em">📞</div><b>Uncle Bayo</b><p>${tr('calling…','dey call…')}</p><div class="row"><button id="cAns">✅ ${tr('Answer','Pick')}</button><button id="cDec" class="alt">❌ ${tr('Decline','Cancel')}</button></div></div>`;
 const stop=()=>{G.AU.ring(false);c.classList.add('hide')};$('#cAns').onclick=()=>{stop();talk('u_call',()=>{F().uncle=1;check()})};$('#cDec').onclick=()=>{stop();rel('uncle',-2);st().c.uncle='declined';F().uncle=1;G.toast(tr('📵 Uncle Bayo is not happy with you.','📵 Uncle Bayo don vex.'));G.save();check()}}
// ---------------- endings ----------------
const END={boss:['🏙️',["Lekki Big Boss","Lekki Big Boss"],["From a shared mattress in Yaba to your own Lekki Phase 1 flat. The VIP party at Kwilox was the talk of Instagram. Mama Shitta sends jollof by dispatch rider now.","From shared mattress for Yaba to your own Lekki Phase 1 flat. VIP party for Kwilox scatter Instagram. Mama Shitta dey send jollof by dispatch rider now."]],
 japa:['✈️',["Japa to Canada","Japa go Canada"],["IELTS: passed. Proof of funds: sorted. You wave goodbye to Lagos from the airport bus. It's cold in Toronto, but every Sunday you video-call Tunde and Mama Shitta.","IELTS: you pass. Proof of funds: e don set. You wave Lagos bye from airport bus. Toronto cold well well, but every Sunday you dey video call Tunde and Mama Shitta."]],
 village:['🏡',["Back to the Village","Back to Village"],["You took the bus home with stories, savings and a new confidence. Mum cried, then cooked. Lagos taught you; now you'll build something at home.","You enter bus go home with story, savings and new confidence. Mama cry, then cook. Lagos don teach you; now you go build something for home."]],
 sapa:['💸',["Sapa Wins (for now)","Sapa Don Win (for now)"],["Evicted and broke, you sleep at the motor park counting what went wrong. But Lagos always gives a second chance… free roam continues. Rise again!","Dem pursue you, pocket don dry, you dey sleep for motor park. But Lagos dey always give second chance… free roam continue. Stand up again!"]]};
function ending(k){const s=st();if(!s||s.ending)return;s.ending=k;s.ch=6;G.save();G.AU.setTrack(k==='sapa'?'tense':'title');
 const e=END[k],r=s.rel;let extra='';if((r.amaka||0)>=4)extra+=tr(' Amaka is by your side — best friends for life (maybe more 😊).',' Amaka dey your side — padi for life (maybe more 😊).');if((r.tunde||0)>=3)extra+=tr(' Tunde says you are his brother from another mother.',' Tunde say you be him brother from another mother.');if(s.c.uncle==='paid')extra+=tr(' Cousin Kunle graduated thanks to you.',' Cousin Kunle graduate because of you.');
 const o=$('#ending');o.classList.remove('hide');const days=G.day();
 o.innerHTML=`<div class="ecard"><div class="em">${e[0]}</div><small>${tr('ENDING','ENDING')}</small><h1>${L(e[1])}</h1><p>${L(e[2])}${extra}</p>
 <p class="sm">${G.S.look.name} · ${tr('Day','Day')} ${days} · ${tr('Net worth','Net worth')} ${nw()<0?'−':''}${G.N(Math.abs(nw()))} · 🚌×${G.S.deaths|0}</p>
 <div class="credits"><b>${tr('A game by','A game by')} Naija Republic</b><br><small>${tr('Music & sounds generated live in your browser. Thanks for playing!','Music & sound dey generate for your browser. Thank you for playing!')}</small></div>
 <button id="eShare">📤 ${tr('Share my ending','Share my ending')}</button><button id="eCont" class="alt">🌍 ${tr('Continue in free roam','Continue free roam')}</button></div>`;
 $('#eShare').onclick=()=>share(k);$('#eCont').onclick=()=>{o.classList.add('hide');G.hud()}}
function card(k){const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d'),e=END[k];const gr=g.createLinearGradient(0,0,0,1350);gr.addColorStop(0,'#ffd400');gr.addColorStop(1,'#0b7a3e');g.fillStyle=gr;g.fillRect(0,0,1080,1350);
 g.fillStyle='#111';g.fillRect(60,60,960,1230);g.fillStyle='#ffd400';g.textAlign='center';g.font='900 90px system-ui';g.fillText('SAPA SURVIVAL',540,200);g.font='900 40px system-ui';g.fillStyle='#fff';g.fillText('FROM FACE-ME-I-FACE-YOU TO LEKKI',540,260);
 g.font='200px system-ui';g.fillText(e[0],540,520);g.fillStyle='#ffd400';g.font='900 76px system-ui';g.fillText(L(e[1]),540,660);g.fillStyle='#fff';g.font='700 44px system-ui';g.fillText(`${G.S.look.name} · Day ${G.day()}`,540,760);g.fillText(`Net worth ${G.N(nw())}`,540,830);g.fillText(`Hit by danfo: ${G.S.deaths|0}×`,540,900);
 g.font='700 36px system-ui';g.fillStyle='#ffd400';g.fillText('A game by Naija Republic',540,1120);g.fillStyle='#bbb';g.fillText('Play free in your browser',540,1190);return c}
async function share(k){const c=card(k),txt=tr(`I got the "${L(END[k][1])}" ending in Naija Republic: Sapa Survival! 🇳🇬`,`I don reach "${L(END[k][1])}" ending for Naija Republic: Sapa Survival! 🇳🇬`)+' '+location.origin+location.pathname;
 try{const b=await new Promise(r=>c.toBlob(r,'image/png'));const f=new File([b],'sapa-ending.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:txt});return}}catch(e){}
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='sapa-ending.png';a.click();try{navigator.clipboard&&navigator.clipboard.writeText(txt)}catch(e){}G.toast(tr('Share card downloaded ✅','Share card don download ✅'))}
// ---------------- public API ----------------
const S={tense:0,
 fresh:()=>({on:1,ch:1,F:{},rel:{tunde:0,mama:0,amaka:0,boss:0,landlord:0,uncle:0},c:{},s0:0,ending:null,intro:0}),
 intro,get cine(){return cam()},talk,check,ending,card,
 get on(){return !!st()},get ch(){return st()?st().ch:0},
 ev(n,d){const s=st();if(!s||s.ch>5&&n!=='enter')return;const f=s.F;
  if(n==='ate')f.ate=1;if(n==='fuel')f.fuel=1;if(n==='club'){f.kwilox=s.ch>=4?1:f.kwilox;if(d&&s.path==='boss')f.vip=1}if(n==='evicted'){check()}
  if(n==='promo'&&s.ch===4)talk('b_promo');
  if(n==='enter'){const b=d;
   if(b.id===homeB()&&s.ch===1&&!f.tunde){setTimeout(()=>talk('t_meet',()=>{f.tunde=1;check()}),450)}
   else if(b.id==='buka'&&!f.mama){setTimeout(()=>talk('m_meet',()=>{f.mama=1;check()}),450)}
   else if(s.ch===2&&!f.job&&['tech','bank','market','studio'].includes(b.id)){s.pend={tech:'tech',bank:'bank',market:'trade',studio:'ent'}[b.id];s.job=null;setTimeout(()=>talk('b_meet',check),450)}
   else if(s.ch===3&&!f.landlord&&b.id===homeB()){setTimeout(()=>talk('l_meet',check),450)}
   else if(s.ch===3&&f.landlord&&!f.pos&&b.id==='market'){setTimeout(()=>talk('p_meet',check),450)}}
  check()},
 tick(dt){const s=st();if(!s)return;if(s.ch===4&&!s.F.uncle&&G.free()&&!G.inside()){s.ut=(s.ut||0)+dt;if(s.ut>25){s.ut=0;call()}}if(Math.random()<.02)check()},
 extra(b,sp){const s=st();if(!s)return;const add=(id,x,z,ry,act,look)=>{sp.npcs.push({x,z,ry,look:look||LOOK[id],say:null});sp.items.push({t:'talk',x,z:z+.2,r:1.6,act})};
  if(b.id===homeB()&&!(s.ch===3&&!s.F.landlord))add('tunde',.4,-.7,0,{l:tr('💬 Talk to Tunde','💬 Yarn with Tunde'),f:()=>talk(s.ch===5&&!s.path?'t_decide':'t_idle')});
  if(b.id===homeB()&&s.ch===3&&!s.F.landlord)add('landlord',-.4,-.3,0,{l:tr('💬 Talk to Baba Landlord','💬 Talk to Baba Landlord'),f:()=>talk('l_meet',check)});
  if(b.id==='tech'&&s.ch>=2){const h=G.hour();if(h>=8&&h<19)add('amaka',-5,1.6,Math.PI/2,{l:tr('💬 Talk to Amaka','💬 Yarn with Amaka'),f:()=>{if(!s.F.amaka){talk('a_meet',()=>{s.F.amaka=1})}else talk('a_2',()=>{s.F.amaka2=1;check()})}})}
  if(b.id==='club'&&s.F.amaka)add('amaka',3.5,3.6,Math.PI,{l:tr('💬 Dance with Amaka','💬 Dance with Amaka'),f:()=>{rel('amaka',1);G.stat('peace',5);G.toast('💃🏾 +☮️5');s.F.amaka2=1;check()}});
  if(b.id==='studio'&&s.ch>=4&&!s.F.studio)add('dj',2.6,-.6,0,{l:tr('💬 Talk to DJ Spinz','💬 Talk to DJ Spinz'),f:()=>talk('d_meet',check)});
  if(b.id==='airport'&&s.ch===5&&s.path==='japa'&&!s.F.flew)sp.items.push({t:'talk',x:5.6,z:-.2,r:1.8,act:{l:tr('✈️ Japa gate → Canada','✈️ Japa gate → Canada'),f:()=>{if(!(s.F.ielts&&G.S.save>=800000))return G.toast(tr('Gate agent: IELTS + ₦800k proof of funds first!','Gate agent: IELTS + ₦800k proof of funds first!'));s.F.flew=1;check()}}});
  if(b.id==='tech'&&s.path==='japa'&&!s.F.ielts)sp.items.push({t:'talk',x:5.3,z:2.6,r:1.6,act:{l:tr('📝 Pay for IELTS (₦120,000)','📝 Pay IELTS (₦120,000)'),f:()=>{if(!G.pay(120000))return G.toast(tr('Not enough money','Money no reach'));s.F.ielts=1;G.toast('📝 IELTS ✅ Band 8!');G.AU.coin();check()}}})},
 parkActs(b){const s=st();if(!s||s.ch!==5)return[];const a=[];
  if(s.path==='village'&&b.id==='park0')a.push({l:'🏡 '+tr('Bus back to the village','Bus go village'),s:tr('Mum is waiting','Mama dey wait'),f:()=>{s.F.home=1;G.closeModal();check();return 'keep'}});return a},
 target(){const o=cur();if(!o||!o.g)return null;return typeof o.g==='function'?o.g():o.g},
 tracker(){const s=st();if(!s)return'';if(s.ending)return`<b>🏁 ${L(END[s.ending][1])}</b><small>${tr('Free roam','Free roam')}</small>`;const o=cur();return`<b>${tr('Ch','Ch')}${s.ch} · ${L(CH[s.ch-1].n)}</b><small>${o?L(o.t):''}</small>`},
 log(){const s=st();if(!s)return`<p>${tr('Free roam — no story active. Start a new Story from the title screen.','Free roam — story no dey on. Start Story from title screen.')}</p>`;const H=k=>'❤️'.repeat(Math.max(0,Math.min(5,Math.ceil((s.rel[k]||0)/2))))||'🤍';
  return CH.map((c,i)=>{const n=i+1;if(n>s.ch)return`<p>🔒 ${tr('Chapter','Chapter')} ${n}: ???</p>`;return`<p><b>${n<s.ch?'✅':'▶️'} ${tr('Chapter','Chapter')} ${n}: ${L(c.n)}</b></p><ul>${c.o.filter(o=>!o.p||o.p===s.path).map(o=>`<li>${o.d()?'✅':'⬜'} ${L(o.t)}</li>`).join('')}</ul>`}).join('')+
  (s.ending?`<p><b>🏁 ${L(END[s.ending][1])}</b></p>`:'')+`<p><b>${tr('Relationships','Your people')}</b></p><table>${['tunde','mama','amaka','boss','landlord','uncle'].map(k=>`<tr><td>${WHO[k][0]} ${k==='boss'?(BOSS[s.job||'tech'][0]):WHO[k][1]}</td><td>${H(k)}</td></tr>`).join('')}</table>`},
 dlgOpen:()=>!$('#dlg').classList.contains('hide')||!$('#cine').classList.contains('hide')||!$('#call').classList.contains('hide')||!$('#ending').classList.contains('hide'),
 _call:call,CH};
return S}
