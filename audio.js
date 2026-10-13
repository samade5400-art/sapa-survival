// Sapa Survival v4 — procedural WebAudio: music engine (5 original loops), district ambience, positional SFX. No samples.
const mf=m=>440*Math.pow(2,(m-69)/12);
export function makeAudio(SET){
const A={ctx:null,cur:null,club:0,dist:null,loops:{},T:{},
 unlock(){if(!this._el){try{const e=this._el=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');e.setAttribute('playsinline','');e.loop=false;const p=e.play();p&&p.catch(()=>{})}catch(e){}}
  if(this.ctx&&this.ctx.state!=='running'){try{this.ctx.resume()}catch(e){}}
  if(this.ctx){try{const b=this.ctx.createBuffer(1,1,22050),s=this.ctx.createBufferSource();s.buffer=b;s.connect(this.ctx.destination);s.start(0)}catch(e){}}},
 init(){if(this.ctx){this.unlock();return}try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.ctx=new C({latencyHint:'playback'});this.unlock();
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);this.master=c.createGain();this.master.connect(comp);
  this.mus=c.createGain();this.sfx=c.createGain();this.amb=c.createGain();[this.mus,this.sfx,this.amb].forEach(g=>g.connect(this.master));this.vol();
  this.nb=this.noiseBuf(2);for(const k in TR){const g=c.createGain();g.gain.value=0;g.connect(this.mus);const t={k,g,lv:0,tg:0,next:0,step:0,...TR[k]};
   if(k==='amapiano'){t.inG=c.createGain();t.outG=c.createGain();t.outG.gain.value=0;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;g.disconnect();g.connect(t.inG);g.connect(lp);lp.connect(t.outG);t.inG.connect(this.mus);t.outG.connect(this.mus)}this.T[k]=t}
  this.ambient();if(this.want){const w=this.want;this.cur=null;this.setTrack(w)}this.renderAll()}catch(e){console.warn('audio',e);this.ctx=null}},
 // pre-render each loop offline into a seamless looping AudioBuffer (reliable; no JS timing needed)
 async renderAll(){const order=[this.want||'title','city','amapiano','calm','tense','title'];for(const k of [...new Set(order)]){try{await this.renderTrack(k)}catch(e){console.warn('render',k,e)}}},
 async renderTrack(k){const t=this.T[k];if(!t||t.buf)return;const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!OC)return;const sr=22050,sd=60/t.bpm/4,steps=16*8,len=Math.ceil(steps*sd*sr);
  const off=new OC(2,len,sr),R={ctx:off,osc:this.osc,nz:this.nz};R.nb=this.noiseBuf.call({ctx:off},2);const bus=off.createGain();bus.connect(off.destination);
  for(let i=0;i<steps;i++){try{t.fn.call(R,i,i*sd+.001,bus,sd)}catch(e){}}const buf=await off.startRendering();let pk=0;for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a}}
  t.buf=buf;const src=this.ctx.createBufferSource();src.buffer=buf;src.loop=true;const ng=this.ctx.createGain();ng.gain.value=pk>0?.85/pk:1;src.connect(ng);ng.connect(t.g);src.start();t.src=src;this.rendered=(this.rendered||0)+1},
 test(){this.init();if(!this.ctx)return'no audio support';const t=this.ctx.currentTime;[60,64,67,72].forEach((m,i)=>this.osc('triangle',mf(m),t+i*.12,.6,.35,this.mus,{lp:3000}));return this.ctx.state},
 vol(){if(!this.ctx)return;const m=SET.snd?1:0,t=this.ctx.currentTime;this.master.gain.setTargetAtTime(m*.9,t,.05);this.mus.gain.setTargetAtTime(+(SET.vm??.8),t,.05);this.sfx.gain.setTargetAtTime(SET.vs??.8,t,.05);this.amb.gain.setTargetAtTime(SET.va??.6,t,.05)},
 on(){this.vol()},
 get state(){return this.ctx?this.ctx.state:'none'},
 noiseBuf(d){const c=this.ctx,n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;return b},
 // ---- primitives ----
 osc(type,f,t,d,v,dest,o={}){const c=this.ctx,os=c.createOscillator(),g=c.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.gt||d));if(o.det)os.detune.value=o.det;
  const a=o.a||.005;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);let n=os;
  if(o.lp){const f=c.createBiquadFilter();f.type=o.bp?'bandpass':'lowpass';f.frequency.value=o.lp;f.Q.value=o.q||1;os.connect(f);n=f}n.connect(g);g.connect(dest);os.start(t);os.stop(t+d+.05);return os},
 nz(t,d,v,dest,f=3000,type='bandpass',q=1){const c=this.ctx,s=c.createBufferSource();s.buffer=this.nb;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+d+.05)},
 pan(pos){const c=this.ctx,p=c.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=5;p.rolloffFactor=1.3;p.maxDistance=200;
  if(p.positionX){p.positionX.value=pos[0];p.positionY.value=pos[1]||1;p.positionZ.value=pos[2]}else p.setPosition(pos[0],pos[1]||1,pos[2]);p.connect(this.sfx);return p},
 listen(x,y,z,fx,fz){const l=this.ctx&&this.ctx.listener;if(!l)return;if(l.positionX){l.positionX.value=x;l.positionY.value=y;l.positionZ.value=z;l.forwardX.value=fx;l.forwardY.value=0;l.forwardZ.value=fz;l.upX.value=0;l.upY.value=1;l.upZ.value=0}else{l.setPosition(x,y,z);l.setOrientation(fx,0,fz,0,1,0)}},
 // ---- sfx ----
 ok(){return this.ctx&&SET.snd},
 tone(f,d,type='square',v=.15,t0=0,f2){if(!this.ok())return;this.osc(type,f,this.ctx.currentTime+t0,d,v,this.sfx,{f2})},
 noise(d,v=.3,fq=800,t0=0){if(!this.ok())return;this.nz(this.ctx.currentTime+t0,d,v,this.sfx,fq,'lowpass')},
 horn(v=1,pos){if(!this.ok())return;const d=pos?this.pan(pos):this.sfx,t=this.ctx.currentTime;v*=.12;for(const o of [0,.38]){this.osc('sawtooth',392,t+o,.3,v,d,{lp:2400});this.osc('sawtooth',494,t+o,.3,v*.8,d,{lp:2400})}},
 crash(){if(!this.ok())return;const t=this.ctx.currentTime;this.nz(t,.8,.9,this.sfx,1500,'lowpass');this.osc('square',140,t,.5,.25,this.sfx,{f2:40});this.nz(t+.1,.4,.4,this.sfx,5000,'highpass')},
 click(){this.tone(880,.05,'square',.04)},coin(){this.tone(988,.08,'square',.06);this.tone(1319,.18,'square',.06,.08)},
 door(){this.tone(220,.15,'triangle',.15);this.tone(165,.2,'triangle',.12,.12);this.noise(.15,.15,600,.05)},
 step(){if(!this.ok())return;this.nz(this.ctx.currentTime,.06,.12,this.sfx,500+Math.random()*200,'lowpass')},
 shout(pos){if(!this.ok())return;const c=this.ctx,t=c.currentTime,d=this.pan(pos);const sy=[[230,300],[290,250],[260,190]];sy.forEach(([a,b],i)=>{for(const fm of [750,1250]){const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(a,t+i*.22);o.frequency.linearRampToValueAtTime(b,t+i*.22+.2);f.type='bandpass';f.frequency.value=fm*(i===1?1.15:1);f.Q.value=6;g.gain.setValueAtTime(.0001,t+i*.22);g.gain.exponentialRampToValueAtTime(.35,t+i*.22+.03);g.gain.exponentialRampToValueAtTime(.0001,t+i*.22+.21);o.connect(f);f.connect(g);g.connect(d);o.start(t+i*.22);o.stop(t+i*.22+.25)}})},
 ring(on){clearInterval(this.ri);this.ringing=on;if(!on)return;const r=()=>{if(!this.ok())return;const t=this.ctx.currentTime;for(let i=0;i<8;i++)this.osc('square',i%2?1046:1318,t+i*.09,.08,.07,this.sfx,{lp:3000})};r();this.ri=setInterval(r,1600)},
 // continuous positional loops (okada engines, generators)
 setLoop(key,on,pos,kind){if(!this.ctx)return;let L=this.loops[key];if(!on||!SET.snd){if(L){L.g.gain.setTargetAtTime(0,this.ctx.currentTime,.1)}return}
  if(!L){const c=this.ctx,p=this.pan(pos),g=c.createGain();g.gain.value=0;g.connect(p);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='gen'?260:700;f.connect(g);
   const o1=c.createOscillator(),o2=c.createOscillator();o1.type='sawtooth';o2.type='square';o1.frequency.value=kind==='gen'?50:58;o2.frequency.value=kind==='gen'?100.5:117;o1.connect(f);o2.connect(f);
   const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=kind==='gen'?7:13;lg.gain.value=kind==='gen'?2:9;lfo.connect(lg);lg.connect(o1.frequency);o1.start();o2.start();lfo.start();L=this.loops[key]={g,p,o1,kind}}
  const P=L.p;if(P.positionX){P.positionX.value=pos[0];P.positionY.value=1;P.positionZ.value=pos[2]}else P.setPosition(pos[0],1,pos[2]);L.g.gain.setTargetAtTime(kind==='gen'?.12:.1,this.ctx.currentTime,.1)},
 // ---- music ----
 setTrack(k){this.want=k;if(!this.ctx||this.cur===k)return;this.cur=k;for(const n in this.T)this.T[n].tg=n===k?1:0},
 setClub(v){this.club=v},
 // ---- ambience ----
 ambient(){const c=this.ctx,mk=(type,f,q,v)=>{const s=c.createBufferSource();s.buffer=this.nb;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=0;const out=c.createGain();out.gain.value=v;s.connect(fl);fl.connect(g);g.connect(out);out.connect(this.amb);s.start();return{g,fl,out}};
  this.AM={crowd:mk('bandpass',700,.6,.14),traffic:mk('lowpass',180,.7,.22),wind:mk('bandpass',900,2,.1),waves:mk('lowpass',650,.5,.2)};
  const lfo=(f,dest,amt,base)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=amt;o.connect(g);g.connect(dest);o.start();dest.value=base};
  lfo(.11,this.AM.waves.out.gain,.14,.18);lfo(.07,this.AM.wind.fl.frequency,500,900);lfo(.3,this.AM.crowd.out.gain,.04,.12)},
 setDistrict(d){if(!this.ctx||this.dist===d)return;this.dist=d;const t=this.ctx.currentTime,G={yaba:{crowd:1,traffic:.5,wind:0,waves:0},vi:{crowd:.35,traffic:1,wind:.8,waves:.1},lekki:{crowd:.2,traffic:.35,wind:.5,waves:1},in:{crowd:.12,traffic:.12,wind:0,waves:0},title:{crowd:.4,traffic:.3,wind:.2,waves:.2}}[d]||{};
  for(const k in this.AM)this.AM[k].g.gain.setTargetAtTime(G[k]||0,t,.8)},
 tick(){const c=this.ctx;if(!c||c.state!=='running')return;const now=c.currentTime;
  for(const k in this.T){const t=this.T[k];let tg=t.tg;if(k==='amapiano'&&this.club>0&&this.cur!=='amapiano')tg=1;
   if(k==='amapiano'){t.inG.gain.setTargetAtTime(this.cur==='amapiano'?1:0,now,.4);t.outG.gain.setTargetAtTime(this.cur==='amapiano'?0:this.club*.9,now,.4)}
   let lvl=tg;if(k==='city'&&this.club>0)lvl*=1-this.club*.6;t.g.gain.setTargetAtTime(lvl*t.v,now,.6);t.lv+=(tg-t.lv)*.02;
   if(t.buf||(tg<=0&&t.lv<.01)){t.next=0;continue}const sd=60/t.bpm/4;if(t.next<now)t.next=now+.06;while(t.next<now+.3){try{t.fn.call(this,t.step,t.next,t.g,sd)}catch(e){}t.step++;t.next+=sd}}
  if(this.dist==='yaba'&&Math.random()<.003)this.horn(.25);if(this.dist==='lekki'&&Math.random()<.01){const t=now,f=2200+Math.random()*1500;for(let i=0;i<3;i++)this.osc('sine',f,t+i*.09,.07,.05,this.amb,{f2:f*1.3})}}
};
// ---- instruments ----
const kick=(A,t,d,v=.8)=>A.osc('sine',130,t,.28,v,d,{f2:42,gt:.12});
const rim=(A,t,d,v=.2)=>A.nz(t,.035,v,d,2200,'bandpass',4);
const shk=(A,t,d,v=.07)=>A.nz(t,.04,v,d,7000,'highpass');
const clap=(A,t,d,v=.25)=>{for(const o of [0,.012,.025])A.nz(t+o,.12,v,d,1400,'bandpass',1.5)};
const logd=(A,t,d,m,v=.5)=>{A.osc('sine',mf(m),t,.42,v,d,{f2:mf(m)*.62,gt:.3});A.osc('triangle',mf(m+12),t,.12,v*.25,d,{lp:900})};
const tdrum=(A,t,d,a,b,v=.25)=>A.osc('triangle',a,t,.22,v,d,{f2:b,gt:.15,lp:1200});
const bass=(A,t,d,m,dur,v=.3)=>A.osc('sawtooth',mf(m),t,dur,v,d,{lp:420,q:3,a:.01});
const chord=(A,t,d,ms,dur,v=.05,type='triangle',lp=2200)=>ms.forEach(m=>A.osc(type,mf(m),t,dur,v,d,{lp,a:.008}));
const piano=(A,t,d,ms,dur=.7,v=.06)=>ms.forEach(m=>{A.osc('triangle',mf(m),t,dur,v,d,{lp:2600});A.osc('sine',mf(m+12),t,dur*.6,v*.4,d)});
const pluck=(A,t,d,m,v=.08)=>A.osc('triangle',mf(m),t,.35,v,d,{lp:1800,bp:1,q:1.2,a:.003});
const flute=(A,t,d,m,dur,v=.05)=>{const o=A.osc('sine',mf(m),t,dur,v,d,{a:.04});const c=A.ctx,l=c.createOscillator(),g=c.createGain();l.frequency.value=5.5;g.gain.value=6;l.connect(g);g.connect(o.frequency);l.start(t);l.stop(t+dur)};
const bell=(A,t,d,f,v=.06)=>A.osc('sine',f,t,.15,v,d);
// progressions (midi roots)
const AMIN=[[57,60,64],[53,57,60],[60,64,67],[55,59,62]],AMR=[45,41,48,43];
const TR={
 city:{bpm:105,v:.9,fn(s,t,d,sd){const b=s>>4,x=s&15,ch=b&3;if([0,7,10].includes(x))kick(this,t,d);if(x===4||x===12)rim(this,t,d,.25);shk(this,t+(x&1?sd*.12:0),d,x%4===2?.09:.05);
   if(x===2||x===9)tdrum(this,t,d,190,270);if((b&3)===3&&x>=12)tdrum(this,t,d,240,160+x*8,.2);
   if([0,3,6,10,13].includes(x))bass(this,t,d,AMR[ch]+(x===6?7:x===10?12:0),sd*1.6);if([2,6,10,14].includes(x))chord(this,t,d,AMIN[ch].map(m=>m+12),sd*.9,.035);
   if((b&7)>=4&&x%4===0){const pen=[69,72,74,76,79];flute(this,t,d,pen[(b*3+x)%5],sd*3,.035)}}},
 amapiano:{bpm:112,v:.9,fn(s,t,d,sd){const b=s>>4,x=s&15,ch=b&3,P=[[62,65,69,72],[55,59,62,65],[60,64,67,71],[57,60,64,67]],R=[38,43,36,45];
   if(x%4===0)kick(this,t,d,.55);if(x===8)clap(this,t,d,.18);shk(this,t+(x&1?sd*.25:0),d,x&1?.06:.04);
   if([3,6,10,14].includes(x))logd(this,t,d,R[ch]+(x===10?7:x===14?5:0),.55);if(x===0||x===6||x===10)piano(this,t,d,P[ch],x===0?.9:.35,.045);if(x===12&&b&1)bell(this,t,d,1568,.03)}},
 calm:{bpm:96,v:.8,fn(s,t,d,sd){const b=s>>4,x=s&15,ch=b&3,C=[[60,64,67],[65,69,72],[67,71,74],[60,64,67]],R=[36,41,43,36];
   if(x%2===0){const n=C[ch][[0,1,2,1,0,2,1,2][x/2]]+12;pluck(this,t,d,n,.07)}if(x===3||x===11)pluck(this,t,d,C[ch][2]+24,.04);if(x===0||x===6||x===8)bass(this,t,d,R[ch],sd*2.2,.18);
   if(x%4===2)shk(this,t,d,.03);if([0,3,6,10,12].includes(x))bell(this,t,d,x===0?880:660,.025)}},
 tense:{bpm:80,v:.9,fn(s,t,d,sd){const b=s>>4,x=s&15;if(x===0){for(const m of [33,34,45])this.osc('sawtooth',mf(m),t,sd*16,.05,d,{lp:320,a:.4})}if(x===0||x===3)kick(this,t,d,.5);if(x===8&&b&1)this.osc('sine',mf(82+(b&2)),t,.6,.03,d);if(x%2===1)shk(this,t,d,.02)}},
 title:{bpm:100,v:.9,fn(s,t,d,sd){const b=s>>4,x=s&15,ch=b&3;if([0,7,10].includes(x))kick(this,t,d,.7);if(x===4||x===12)clap(this,t,d,.12);shk(this,t,d,x%4===2?.08:.04);
   if([0,3,6,10].includes(x))bass(this,t,d,AMR[ch]+(x===6?7:0),sd*1.8,.25);if(x===0||x===8)chord(this,t,d,AMIN[ch].map(m=>m+12),sd*7,.03,'triangle',1600);
   const mel=[76,74,72,69,72,74,76,79,81,79,76,74,72,74,72,69];if(x%2===0)flute(this,t,d,mel[(b%2)*8+x/2],sd*1.8,.04);if(x===14&&(b&3)===3)tdrum(this,t,d,200,300)}}};
return A}
