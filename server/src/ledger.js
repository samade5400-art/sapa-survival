// Append-only, hash-chained wallet ledger (JSON lines). Balances are rebuilt from the ledger at boot.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export class Ledger{
 constructor(dir){this.dir=dir;fs.mkdirSync(dir,{recursive:true});this.file=path.join(dir,'ledger.jsonl');this.bal=new Map();this.seq=0;this.prev='GENESIS';
  if(fs.existsSync(this.file))for(const line of fs.readFileSync(this.file,'utf8').split('\n')){if(!line.trim())continue;try{const e=JSON.parse(line);this.bal.set(e.wallet,e.balance);this.seq=e.seq;this.prev=e.hash}catch(err){console.error('ledger: bad line skipped')}}}
 balance(w){return this.bal.get(w)}
 has(w){return this.bal.has(w)}
 // amount: +credit / -debit (integer naira). Returns entry or null if insufficient funds.
 post(wallet,amount,type,reason,meta={}){amount=Math.round(amount);if(!Number.isFinite(amount))return null;const cur=this.bal.get(wallet)||0,nb=cur+amount;if(nb<0)return null;
  const e={seq:++this.seq,ts:new Date().toISOString(),wallet,type,amount,balance:nb,reason:String(reason).slice(0,60),meta,prev:this.prev};
  e.hash=crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0,32);
  fs.appendFileSync(this.file,JSON.stringify(e)+'\n');this.prev=e.hash;this.bal.set(wallet,nb);return e}
 verify(){let prev='GENESIS',n=0;for(const line of fs.readFileSync(this.file,'utf8').split('\n')){if(!line.trim())continue;const e=JSON.parse(line),h=e.hash;delete e.hash;if(e.prev!==prev||crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0,32)!==h)return{ok:false,at:e.seq};prev=h;n++}return{ok:true,entries:n}}}
