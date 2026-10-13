// Naija Republic chat safety filter (Phase 0). Pure functions, no network.
const NUMW={zero:'0',oh:'0',o:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10'};
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i','|':'i','+':'t'};
export const norm=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
const deleet=s=>s.replace(/[013457@$!|+]/g,c=>LEET[c]).replace(/[^a-z\s]/g,'').replace(/(.)\1{2,}/g,'$1$1');
const squash=s=>deleet(s).replace(/\s+/g,'');
const URL_RE=[/https?:\/\//i,/\bwww\s*\./i,/\b[a-z0-9-]{2,}\s*(\.|\(dot\)|\[dot\]|\bdot\b)\s*(com|ng|net|org|io|xyz|me|ly|gg|app|link|co|info|biz|site|online|shop|top|tk)\b/i,/\b(t\.me|wa\.me|bit\.ly|tinyurl|goo\.gl|linktr\.ee)\b/i,/\bdot\s*com\b/i];
const PHONE_RE=[/(\+|00)\s*2\s*3\s*4/,/(?<!\d)0[789][01]\d{8}(?!\d)/];
const CRYPTO_RE=[/\bbc1[a-z0-9]{25,60}\b/i,/\b0x[a-f0-9]{40}\b/i,/\b(bc1|[13])[a-km-zA-HJ-NP-Z1-9]{25,39}\b/,/\bT[1-9A-HJ-NP-Za-km-z]{33}\b/,/\b(usdt|trc20|erc20|seed phrase|wallet address)\b/i];
const CONTACT=['whatsapp','watsapp','whatsap','telegram','snapchat','instagram','tiktok handle','dm me','inbox me','chat me up','call me on','text me on','my number','your number','drop number','drop your number','send your number','send me your number','add me on','my handle','my ig'];
const SCAM=['double your money','double ur money','invest 10k','invest and get','get 50k','loan app','send your otp','send otp','your otp','otp code','customer care','customer service agent','bvn','your pin','atm pin','account number','acct number','acc no','send money','send me money','forex','binary option','ponzi','mmm','crypto investment','guaranteed profit','returns daily','yahoo boy','yahoo plus','pay me first','processing fee','claim your prize','you have won','free money','sugar mummy','sugar daddy','hook up','hookup','make i double','i go double am','abeg send otp','send am for my account','na legit','legit plug','plug dey','oya invest'];
const BAD=['fuck','fck','fuk','shit','bitch','btch','pussy','dick','cock','cunt','nigga','nigger','whore','slut','porn','nude','nudes','naked','sex','sexy','horny','boobs','blowjob','dickhead','bastard','motherfucker','ashawo','ashewo','olosho','oloshi','toto','prick','penis','vagina','rape','kill yourself','kys'];
const BADW=new Set(BAD.filter(w=>!w.includes(' ')));
function digitsRun(s){// spelled numbers -> digits, then longest run of digits allowing space . - ( ) / _ separators
 const t=norm(s).replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,w=>NUMW[w]).replace(/[oO](?=\d)|(?<=\d)[oO]/g,'0');
 let best=0;for(const m of t.matchAll(/\d(?:[\s.\-()\/_]*\d)*/g)){const n=m[0].replace(/\D/g,'').length;if(n>best)best=n}return best}
export function check(text){
 if(typeof text!=='string')return{ok:false,reason:'invalid'};
 const raw=text.replace(/[\u0000-\u001f\u200b-\u200f\u2028-\u202e\ufeff]/g,'').trim();
 if(!raw)return{ok:false,reason:'empty'};if(raw.length>140)return{ok:false,reason:'too_long'};
 const n=norm(raw),d=deleet(n),sq=squash(n);
 if(URL_RE.some(r=>r.test(n)))return{ok:false,reason:'link'};
 if(PHONE_RE.some(r=>r.test(n.replace(/[\s.\-()]/g,''))))return{ok:false,reason:'phone'};
 if(CRYPTO_RE.some(r=>r.test(raw)))return{ok:false,reason:'crypto'};
 const dr=digitsRun(raw);if(dr>=10)return{ok:false,reason:'account_or_phone'};if(dr>=7)return{ok:false,reason:'phone'};
 if(/@[a-z0-9_.]{3,}/i.test(raw))return{ok:false,reason:'handle'};
 if(CONTACT.some(p=>d.includes(p)||sq.includes(p.replace(/\s/g,''))))return{ok:false,reason:'contact'};
 if(SCAM.some(p=>d.includes(p)||(p.length>6&&sq.includes(p.replace(/\s/g,'')))))return{ok:false,reason:'scam'};
 const words=d.split(/\s+/);if(words.some(w=>BADW.has(w)||BADW.has(w.replace(/s$/,'')))||BAD.some(w=>w.includes(' ')&&d.includes(w))||['fuck','nigger','nigga','motherfucker','blowjob','pussy','cunt'].some(w=>sq.includes(w)))return{ok:false,reason:'language'};
 return{ok:true,text:raw}}
const RESERVED=/(admin|moderator|\bmod\b|official|staff|support|system|grok|naija ?republic)/i;
export function checkName(name){
 if(typeof name!=='string')return{ok:false,reason:'invalid'};const n=name.replace(/\s+/g,' ').trim();
 if(!/^[A-Za-z0-9 _.\-]{2,14}$/.test(n))return{ok:false,reason:'chars'};
 if(RESERVED.test(n))return{ok:false,reason:'reserved'};if((n.match(/\d/g)||[]).length>4)return{ok:false,reason:'digits'};
 const c=check(n);if(!c.ok)return c;return{ok:true,name:n}}
export const QUICK=[['👋 How far?','👋 How far?'],['Wetin dey happen?','Wetin dey happen?'],['Na wa o!','Na wa o!'],['Oya come!','Oya come!'],['E choke! 🔥','E choke! 🔥'],['No vex 🙏','No vex 🙏'],['Abeg 🙏','Abeg 🙏'],['We move! 💪','We move! 💪'],['God when? 😩','God when? 😩'],['Sapa don catch me 😭','Sapa don catch me 😭'],['Follow me!','Follow me!'],['Thank you o!','Thank you o!']].map(x=>x[0]);
export const EMOTES=['wave','dance','zanku','greet','kneel','laugh'];
