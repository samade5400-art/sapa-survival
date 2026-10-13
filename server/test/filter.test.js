import {check,checkName} from '../src/filter.js';import assert from 'node:assert';
const bad=['call me 08031234567','my line na 0803 123 4567','+234 803 123 4567','zero eight zero three one two three four five six seven','send to 0123456789 GTB','visit www.scam.com','go to scam dot com','https://x.io','0x52908400098527886E0F7030069857D2E4169EE','bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq','double your money in 24hrs','abeg send otp','chat me on WhatsApp','fuck you','f*ck you','you be ashawo','@scammer_ng','my acc no is'];
const good=['How far my guy','I just buy jollof for 3000','Wetin dey happen for VI?','Na wa o, NEPA don take light','see you for Yaba market','I get 50000 for bank'];
let f=0;for(const t of bad){const r=check(t);if(r.ok){console.log('MISSED',t);f++}else console.log('blocked',r.reason.padEnd(16),t)}
for(const t of good){const r=check(t);if(!r.ok){console.log('FALSE+',r.reason,t);f++}}
for(const [n,ok] of [['Tunde',true],['Ada_99',true],['admin',false],['08031234567',false],['fuckboy',false],['<script>',false]])if(checkName(n).ok!==ok){console.log('NAME',n);f++}
console.log(f?f+' FAIL':'ALL PASS');process.exit(f?1:0);
