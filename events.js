// Sapa Survival event cards. Effects: m=Money(₦) e=Energy p=Peace r=Respect f=Family Pressure (higher = worse)
// Format: [id, emoji, EN text, Pidgin text, [[EN choice, Pidgin choice, effects], ...]]
const RAW = [
["danfo","🚌","You're late for work. How do you get there?","You don late for work. How you wan take reach office?",[
 ["Squeeze into a danfo","Enter danfo, squeeze am",{m:-800,e:-12,p:-5}],["Book a Bolt","Book Bolt",{m:-6500,e:-2,p:4}],["Okada through traffic","Jump okada, fly pass traffic",{m:-2000,e:-6,p:-10,r:2}]]],
["nepa","💡","NEPA took light. It's hot and your phone is at 4%.","NEPA don take light. Heat dey, phone dey 4%.",[
 ["Buy fuel for the gen","Buy fuel put for gen",{m:-9000,p:6,e:4}],["Sleep in the heat","Sleep inside heat like that",{e:-15,p:-8}],["Charge at a neighbour's","Go charge for neighbour house",{r:-4,p:2,e:-3}]]],
["landlord","🏠","Landlord wants 2 years' rent upfront 'because of the economy'.","Landlord say make you pay 2 years rent sharp sharp 'because of economy'.",[
 ["Beg for 1 year","Beg am make e collect 1 year",{m:-40000,p:-8,r:-3}],["Pay part, promise the rest","Pay small, promise the rest",{m:-25000,p:-12}],["Start house-hunting","Start to find another house",{e:-15,p:-6,m:-5000}]]],
["asoebi","👗","Your cousin's wedding: aso-ebi is ₦45,000.","Your cousin wedding don land: aso-ebi na ₦45,000.",[
 ["Buy it, family first","Buy am, family first",{m:-45000,r:8,f:-8}],["Wear your old agbada","Wear your old agbada",{r:-6,f:6}],["'I'll be travelling'","Talk say you go travel",{p:-4,f:10}]]],
["pos","🚨","SMS: 'Your BVN is blocked. Click link to unblock.'","SMS land: 'Your BVN don block. Click link make e open.'",[
 ["Delete it, call the bank","Delete am, call bank yourself",{p:4,e:-3}],["Click the link","Click the link",{m:-30000,p:-20}],["Forward it to family as a warning","Forward am give family make dem shine eye",{r:5,f:-3}]]],
["blacktax","👴","Uncle from the village: 'The roof is leaking, send something.'","Uncle from village call: 'Roof dey leak o, send something.'",[
 ["Send ₦30k","Send ₦30k",{m:-30000,f:-15,r:5}],["Send ₦10k with prayers","Send ₦10k plus prayer",{m:-10000,f:-5}],["'Network is bad'","'Network no good, I no dey hear you'",{f:12,p:-5}]]],
["lastma","👮","LASTMA stops your Bolt driver and he asks you to 'help him'.","LASTMA stop your Bolt driver, driver dey beg make you 'help am'.",[
 ["Chip in ₦2k","Add ₦2k",{m:-2000,p:-3}],["Get down and trek","Comot, trek go",{e:-12,p:-2}],["Calmly wait it out","Siddon calm, wait am",{e:-4,p:-6,r:2}]]],
["owambe","🎉","Saturday owambe! Free jollof, but you must spray money.","Saturday owambe! Free jollof dey, but you must spray.",[
 ["Go and spray ₦10k","Go spray ₦10k",{m:-10000,r:10,p:8,e:-8}],["Go, eat, dance, no spray","Go chop, dance, no spray",{r:-5,p:6,e:-6}],["Stay home and rest","Stay house rest body",{e:12,r:-3}]]],
["data","📶","Your data finished in the middle of a meeting.","Data finish for middle of meeting.",[
 ["Buy the monthly bundle","Buy monthly bundle",{m:-8000,p:4}],["Buy daily ₦500","Buy daily ₦500",{m:-500,p:-2}],["Beg a colleague for hotspot","Beg colleague for hotspot",{r:-4}]]],
["asuu","📚","ASUU strike again. Your sister is home and needs 'small upkeep'.","ASUU don strike again. Your sister dey house, she need 'small upkeep'.",[
 ["Give ₦15k","Give am ₦15k",{m:-15000,f:-8,r:3}],["Enroll her in a free online course","Register am for free online course",{e:-5,f:-3,r:4}],["Tell her to find work","Tell am make she find work",{f:8,p:-4}]]],
["fuelhike","⛽","Fuel price jumped overnight. Transport fares doubled.","Fuel price don jump overnight. Transport don double.",[
 ["Work from home if you can","Work from house if e possible",{e:4,r:-2,p:2}],["Pay the new fare","Pay the new fare",{m:-5000,p:-4}],["Trek half the way","Trek half way",{e:-15,m:-1000}]]],
["sallah","🐏","Festive season! Everyone expects ram, rice or a hamper.","Festive season don land! Everybody dey expect ram, rice or hamper.",[
 ["Buy a big bag of rice for family","Buy big bag of rice for family",{m:-40000,f:-15,r:8,p:5}],["Send greetings and ₦5k","Send greeting plus ₦5k",{m:-5000,f:3}],["Switch off your phone","Off your phone",{f:12,p:-5,r:-4}]]],
["hustle","💻","A friend offers weekend gig: editing videos for ₦35k.","Your guy offer weekend work: edit video for ₦35k.",[
 ["Take it","Collect am",{m:35000,e:-18,p:-3}],["Negotiate ₦50k","Price am ₦50k",{m:20000,e:-12,r:3}],["Decline, you need rest","Decline, body need rest",{e:8}]]],
["generator","🔧","Your generator refuses to start.","Your gen no gree start.",[
 ["Call the mechanic","Call mechanic",{m:-7000,p:4}],["Watch YouTube and fix it","Watch YouTube, fix am yourself",{e:-10,r:4,p:2}],["Forget it, sleep in darkness","Leave am, sleep for dark",{p:-8,e:-5}]]],
["traffic","🚗","Third Mainland Bridge is locked. 3 hours in traffic.","Third Mainland Bridge don lock. 3 hours for traffic.",[
 ["Buy gala and Lacasera","Buy gala and Lacasera",{m:-1000,p:3,e:-6}],["Make calls, work from the car","Do work for inside motor",{e:-8,r:3}],["Sleep in the bus","Sleep for inside bus",{e:2,p:-4}]]],
["wedding","💍","Your friend wants you as groomsman/bridesmaid. Outfit + contributions.","Your padi want make you be groomsman/bridesmaid. Outfit plus contribution.",[
 ["Accept proudly","Gree with pride",{m:-35000,r:12,p:5}],["Accept but only outfit","Gree, but na only outfit",{m:-20000,r:4}],["Politely decline","Decline am with respect",{r:-6,p:-2}]]],
["phone","📱","Your phone screen cracked.","Your phone screen don crack.",[
 ["Fix at Computer Village","Go fix am for Computer Village",{m:-15000,e:-8}],["Use it like that","Dey use am like that",{p:-6,r:-3}],["Buy a new phone on credit","Buy new phone on credit",{m:-60000,r:6,p:2}]]],
["church","⛪","Thanksgiving Sunday: special offering for the new building.","Thanksgiving Sunday: special offering for new building.",[
 ["Give ₦10k","Drop ₦10k",{m:-10000,p:8,r:5}],["Give what you can","Give wetin you fit",{m:-2000,p:4}],["Watch the service online","Watch service online",{e:6,r:-2}]]],
["market","🛒","Prices at the market jumped. Tomatoes now cost gold.","Market price don jump. Tomato don turn gold.",[
 ["Buy for the whole month","Buy for the whole month",{m:-35000,p:6}],["Buy small, cook beans","Buy small, cook beans",{m:-8000,e:-3}],["Survive on noodles","Manage indomie",{m:-3000,e:-8,p:-4}]]],
["boss","👔","Your boss asks you to stay late without overtime.","Oga say make you stay late, no overtime money.",[
 ["Stay and impress","Stay, impress am",{e:-15,r:8}],["Leave at closing time","Comot when time reach",{r:-5,p:6}],["Stay, but bill him for transport","Stay, but collect transport money",{e:-12,m:3000,r:2}]]],
["salaryLate","💸","Salary is delayed by a week. 'System issue'.","Salary don delay one week. Dem say 'na system issue'.",[
 ["Borrow from a friend","Borrow from your padi",{m:20000,r:-5,p:-4}],["Tighten belt","Tighten belt",{e:-8,p:-8}],["Take a quick loan app","Take loan app money",{m:30000,p:-15}]]],
["loanapp","📲","The loan app is threatening to message all your contacts.","Loan app dey threaten say dem go message all your contacts.",[
 ["Pay back with interest","Pay dem back with interest",{m:-40000,p:6}],["Report them to FCCPC","Report dem give FCCPC",{e:-6,p:4,r:3}],["Ignore","Ignore dem",{p:-15,r:-8}]]],
["gym","🏋️","New Year energy: gym membership is ₦20k.","New year energy: gym na ₦20k.",[
 ["Sign up","Register",{m:-20000,e:10,p:5}],["Jog on the street","Jog for street",{e:5,p:3}],["Next month, by God's grace","Next month, by God grace",{p:-2}]]],
["beggar","🙏","A man at the bus stop says he needs ₦1,500 to get home.","One man for bus stop say e need ₦1,500 to reach house.",[
 ["Give him","Give am",{m:-1500,p:4}],["Buy him food instead","Buy am food instead",{m:-1000,p:5,r:2}],["Walk away","Waka pass",{p:-2}]]],
["flood","🌧️","Heavy rain. Your street is now a river.","Heavy rain don fall. Your street don turn river.",[
 ["Pay a wheelbarrow ride","Pay wheelbarrow carry you",{m:-1000,p:2}],["Wade through","Waka inside water",{e:-10,p:-6}],["Call in sick","Call office say you sick",{r:-4,e:6}]]],
["mumcall","👩🏾","Mum: 'When are you bringing a spouse home?'","Mama: 'When you go bring wife/husband come house?'",[
 ["'Soon, Mummy'","'Soon, Mummy'",{f:-3,p:-3}],["'Focus on my career first'","'Make I first face my career'",{f:6,r:2}],["Change the topic to her health","Change topic, ask about her health",{f:-2,p:2}]]],
["dstv","📺","DSTV expired just before the big match.","DSTV don expire just before big match.",[
 ["Renew","Renew am",{m:-15000,p:8}],["Watch at the viewing centre","Go watch for viewing centre",{m:-500,p:5,e:-4}],["Stream on a dodgy site","Stream for one shady site",{p:-4,e:-2}]]],
["bank","🏦","Bank charges ate ₦3,000 from your account. For 'card maintenance'.","Bank don chop ₦3,000 from your account. Dem call am 'card maintenance'.",[
 ["Complain at the branch","Go complain for branch",{e:-10,m:3000,p:-2}],["Switch to a digital bank","Change go digital bank",{e:-4,p:4}],["Sigh and move on","Sigh, move on",{m:-3000,p:-4}]]],
["japa","✈️","Your friend just got a Canada visa. 'Japa with me!'","Your guy don get Canada visa. 'Make we japa!'",[
 ["Start IELTS prep","Start IELTS prep",{m:-10000,e:-8,p:5}],["Celebrate them","Celebrate am",{m:-5000,r:5,p:3}],["'Nigeria will be great'","'Naija go better'",{p:-3,r:2}]]],
["neighbour","🔊","Neighbour's speakers are blasting at 2am.","Neighbour speaker dey blast for 2am.",[
 ["Knock and complain","Knock, complain",{r:2,p:2,e:-3}],["Earplugs","Use earplug",{m:-1000,e:-4}],["Join the party","Join the party",{e:-10,p:6,r:4}]]],
["pastry","🍔","Office colleagues order Chicken Republic. 'You dey?'","Office people dey order Chicken Republic. 'You dey?'",[
 ["Yes, order big","Yes, order big",{m:-5000,p:4,r:3}],["Bring your food from home","Bring food from house",{r:-2,e:-2}],["Skip lunch","Skip lunch",{e:-8}]]],
["blessing","🎁","Old schoolmate sends you ₦20k 'just because'.","Your old schoolmate send you ₦20k 'just because'.",[
 ["Say thanks and save it","Thank am, save am",{m:20000,p:6}],["Treat yourself","Enjoy yourself",{m:12000,p:10}],["Share some with Mum","Share small with Mama",{m:12000,f:-8,r:3}]]],
["refund","💰","Your old office finally paid your pending allowance!","Your old office don finally pay your allowance wey dem hold!",[
 ["Save it all","Save am all",{m:40000,p:8}],["Pay off debts","Clear your debt",{m:25000,p:12,r:4}],["Send home","Send am go house",{m:15000,f:-12}]]],
["meter","⚡","Prepaid meter officials want a 'settlement' to install.","Meter people want 'settlement' before dem install.",[
 ["Pay the settlement","Pay the settlement",{m:-10000,p:-2}],["Insist on the official process","Insist on proper process",{e:-10,p:-4,r:3}],["Stay on estimated billing","Stay for estimated bill",{m:-6000,p:-6}]]],
["rice","🍛","Your Sunday jollof is the talk of the compound.","Your Sunday jollof dey make compound dey talk.",[
 ["Start selling plates","Start to sell plate",{m:15000,e:-15,r:5}],["Feed the neighbours","Share for neighbours",{m:-4000,r:10,p:5}],["Eat it all yourself","Chop am all yourself",{p:8,e:6}]]],
["scamDM","🕵️","DM: 'Invest ₦50k, get ₦200k in a week!'","DM: 'Put ₦50k, collect ₦200k for one week!'",[
 ["Block and report","Block and report",{p:4}],["Try with ₦5k 'to test'","Try ₦5k 'to test am'",{m:-5000,p:-6}],["Expose them on your status","Expose dem for your status",{r:6,e:-3}]]],
["hospital","🏥","Malaria. You feel weak.","Malaria don catch you. Body weak.",[
 ["Go to the hospital","Go hospital",{m:-12000,e:15,p:4}],["Pharmacy self-medication","Buy drug for chemist",{m:-3000,e:6}],["Agbo and prayer","Agbo plus prayer",{m:-500,e:-5,p:-3}]]],
["ajo","🤝","Market women's ajo: contribute ₦10k weekly, collect big later.","Market women ajo: put ₦10k every week, collect big later.",[
 ["Join","Join",{m:-10000,p:4,r:3}],["Not now","No be now",{}],["Start your own ajo","Start your own ajo",{e:-8,r:6}]]],
["bday","🎂","It's your birthday! Friends want you to 'set the table'.","Na your birthday! Friends say make you 'set table'.",[
 ["Throw a small party","Do small party",{m:-25000,r:10,p:8}],["Quiet dinner with one friend","Small dinner with one padi",{m:-6000,p:8}],["Pretend you forgot","Do like say you forget",{r:-4,p:-2}]]],
["exam","📝","Your little brother's WAEC fees are due.","Your small brother WAEC fees don due.",[
 ["Pay it all","Pay everything",{m:-25000,f:-15,r:5}],["Split with siblings","Share am with your siblings",{m:-10000,f:-6}],["'Let Daddy handle it'","'Make Daddy handle am'",{f:12}]]],
["generatorFumes","☠️","Neighbour runs a gen beside your window all night.","Neighbour put gen for your window side all night.",[
 ["Talk to them kindly","Talk to dem with respect",{p:4,r:3,e:-2}],["Report to landlord","Report give landlord",{p:2,r:-2}],["Ignore it","Ignore am",{e:-10,p:-6}]]],
["promo","📈","There's an internal promotion opening.","Promotion space don open for office.",[
 ["Apply and prepare hard","Apply, prepare well",{e:-12,r:10,m:10000}],["Let someone else take it","Leave am for another person",{p:3,r:-3}],["Lobby the boss with gifts","Use gift lobby oga",{m:-8000,r:6,p:-3}]]],
["checkpoint","🚔","Police checkpoint: 'Show us your phone.'","Police checkpoint: 'Bring your phone make we check.'",[
 ["Calmly know your rights","Calm down, know your rights",{p:-4,r:4,e:-4}],["Hand it over","Give dem",{p:-10}],["Settle quickly","Settle dem sharp",{m:-3000,p:-6}]]],
["power","🔋","Power bank sale: ₦18k for 20,000mAh.","Power bank dey sale: ₦18k for 20,000mAh.",[
 ["Buy it","Buy am",{m:-18000,p:6,e:4}],["Buy a cheaper fake one","Buy cheap fake one",{m:-6000,p:-4}],["Skip","Skip am",{}]]],
["crypto","🪙","Colleague swears a new meme coin will 100x.","Colleague swear say new meme coin go 100x.",[
 ["Throw in ₦10k","Throw ₦10k",{m:-10000,p:-3}],["Read up first","Read about am first",{e:-4,r:2}],["Laugh it off","Laugh am off",{p:2}]]],
["water","🚰","Borehole pump spoilt. No water in the compound.","Borehole pump don spoil. Water no dey compound.",[
 ["Contribute for repairs","Contribute for repair",{m:-6000,r:5,p:3}],["Buy jerry cans from mai ruwa","Buy jerrycan from mai ruwa",{m:-2500,e:-4}],["Fetch from the next street","Go fetch for next street",{e:-14}]]],
["uber","🚕","Bolt driver cancels for the fifth time.","Bolt driver cancel for the fifth time.",[
 ["Keep trying","Dey try am",{p:-6,e:-4}],["Take keke","Enter keke",{m:-1500,e:-4}],["Go back home","Go back house",{r:-4,e:4}]]],
["wifi","📡","A neighbour offers to share Wi‑Fi for ₦5k a month.","Neighbour say make una share Wi‑Fi for ₦5k every month.",[
 ["Deal!","Deal!",{m:-5000,p:6}],["Negotiate ₦3k","Price am ₦3k",{m:-3000,p:4,r:-1}],["Stick to your data","Stay with your data",{}]]],
["clothes","👞","Your only work shoes tore at the sole.","Your only work shoe don tear for down.",[
 ["Buy new ones","Buy new one",{m:-15000,r:4}],["Go to the cobbler","Carry am go cobbler",{m:-1000,e:-2}],["Use superglue","Use superglue",{r:-4,p:-2}]]],
["groupchat","💬","Family WhatsApp group: 'Who will host Christmas?'","Family WhatsApp group: 'Who go host Christmas?'",[
 ["Volunteer","Volunteer",{m:-30000,f:-15,r:10}],["Offer to bring drinks","Promise to bring drinks",{m:-8000,f:-5}],["Mute the group","Mute the group",{f:8,p:4}]]],
["thief","🎒","Someone tried to snatch your phone at Oshodi.","One person try snatch your phone for Oshodi.",[
 ["Hold it tight and shout","Hold am tight, shout",{p:-6,r:4,e:-4}],["Let it go, safety first","Leave am, life first",{m:-50000,p:-10}],["You had it in your inner pocket","E dey your inner pocket",{p:2,r:2}]]],
["freebie","🎟️","Free tech event with lunch and networking at Yaba.","Free tech event with lunch and networking for Yaba.",[
 ["Go and network","Go network",{e:-8,r:8,p:4}],["Go just for the lunch","Go just for the food",{m:1000,p:3}],["Stay in bed","Stay for bed",{e:8}]]],
["rentRise","📃","Agent fee, legal fee, caution fee… for a new flat.","Agent fee, legal fee, caution fee… for new house.",[
 ["Pay all and move","Pay everything, move",{m:-50000,p:10}],["Stay where you are","Stay where you dey",{p:-4}],["Negotiate agent fee down","Price agent fee down",{m:-30000,e:-8,r:3}]]],
["kidSchool","🎒","Your niece's school fees: Mum says 'you're the one with a job'.","Your niece school fees: Mama say 'na you get work'.",[
 ["Pay half","Pay half",{m:-20000,f:-10}],["Pay full","Pay full",{m:-40000,f:-18,r:6}],["Explain your budget","Explain your budget",{f:6,p:2}]]],
["tailor","🧵","The tailor says your outfit 'will be ready tomorrow'… for the fourth time.","Tailor say your cloth 'go ready tomorrow'… for the fourth time.",[
 ["Camp at the shop","Siddon for the shop",{e:-10,p:-4}],["Wear something else","Wear another thing",{r:-3}],["Laugh, it's Lagos","Laugh, na Lagos",{p:2}]]],
["shortage","🍞","Bread price went up again.","Bread price don go up again.",[
 ["Switch to yam","Change to yam",{m:-1500,e:2}],["Pay it","Pay am",{m:-2000}],["Skip breakfast","Skip breakfast",{e:-6}]]],
["contentDeal","🎥","A small brand offers ₦25k to post about their product.","Small brand wan pay ₦25k make you post their product.",[
 ["Accept honestly with #ad","Gree, put #ad",{m:25000,r:3}],["Accept, hide that it's paid","Gree, hide say na paid",{m:25000,r:-8,p:-4}],["Decline, not your style","Decline, no be your style",{r:2}]]],
["gossip","🗣️","Colleagues gossiping about your 'new car' (it's a borrowed one).","Colleague dey gossip about your 'new motor' (na borrow motor).",[
 ["Clarify it's borrowed","Clear am say na borrow",{r:-2,p:4}],["Enjoy the rumour","Enjoy the rumour",{r:6,p:-3}],["Ignore them","Ignore dem",{}]]],
["grandma","👵🏾","Grandma is visiting Lagos for a week.","Grandma dey come Lagos for one week.",[
 ["Host her happily","Host am well well",{m:-15000,f:-15,p:6}],["Book her a hotel","Book hotel for am",{m:-30000,f:-5,r:4}],["Say your place is too small","Talk say your house too small",{f:12,p:-4}]]],
["pension","🧾","HR says you can increase your pension contribution.","HR say you fit increase your pension contribution.",[
 ["Increase it","Increase am",{m:-5000,p:6}],["Keep it as is","Leave am like that",{}],["Ask what pension is","Ask wetin be pension",{r:-2,p:2}]]],
["generousBoss","🥳","Your boss gives everyone a ₦15k 'end of quarter' bonus!","Oga give everybody ₦15k 'end of quarter' bonus!",[
 ["Save it","Save am",{m:15000,p:5}],["Buy suya for the team","Buy suya for the team",{m:8000,r:8,p:5}],["Send half home","Send half go house",{m:7500,f:-8}]]],
["keke","🛺","Keke driver says he has no change for your ₦1000.","Keke driver say e no get change for your ₦1000.",[
 ["Let him keep it","Make e keep am",{m:-700,p:-2}],["Wait while he finds change","Wait make e find change",{e:-4}],["Buy something to break it","Buy something make e break",{m:-300,p:2}]]],
["generatorThief","🔦","Gen thieves are active in your area.","Gen thief dey operate for your area.",[
 ["Buy a chain and padlock","Buy chain and padlock",{m:-4000,p:6}],["Join the vigilante levy","Pay vigilante levy",{m:-3000,r:4,p:4}],["Pray over it","Pray for am",{p:-4}]]],
["mtnPromo","📞","Network gives you 'double data' bonus by mistake.","Network give you 'double data' bonus by mistake.",[
 ["Use it to upskill online","Use am learn new skill",{e:-6,r:5,p:4}],["Binge-watch everything","Watch film anyhow",{p:8,e:4}],["Sell hotspot to neighbours","Sell hotspot give neighbours",{m:3000,r:-2}]]],
["dinner","🍷","A date suggests a fancy Lekki restaurant.","Your date say make una go one fancy Lekki restaurant.",[
 ["Go and pay","Go, pay",{m:-30000,r:6,p:4}],["Suggest a cozy buka","Suggest one fine buka",{m:-6000,p:5}],["Split the bill","Share the bill",{m:-15000,p:3}]]]
];
const EVENTS = RAW.map(([id,emoji,en,pg,choices])=>({id,emoji,text:{en,pg},choices:choices.map(([ce,cp,fx])=>({text:{en:ce,pg:cp},fx}))}));
if (typeof module!=='undefined') module.exports = EVENTS;
