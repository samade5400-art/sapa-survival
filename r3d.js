// Naija Republic v5 — Three.js renderer (low-poly, procedural; no external assets)
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const K=0.05; // 2D world units -> metres
const QS={low:{pr:1,sh:0,npc:10,tpx:256,far:150,aa:false,an:2},med:{pr:1.5,sh:1024,npc:18,tpx:512,far:220,aa:true,an:4},high:{pr:2,sh:2048,npc:26,tpx:768,far:300,aa:true,an:8}};
import {build3D,frame3D} from './city.js?v=7';
let rd,scene,camera,hemi,dirL,pl,sky,sunM,moonM,stars,waterMat,D,Q='med',iscene=null,iInfo=null,player=null,marker,CITY=null,flash=0;
const bmats=[],solids=[],ray=new THREE.Raycaster();let wpM,cdist=11;const cam={yaw:0,pitch:.5,dist:14};
const MC={};const lam=c=>MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c}));
const BMC={};const basic=c=>BMC[c]||(BMC[c]=new THREE.MeshBasicMaterial({color:c}));
const GC={};const boxG=(w,h,d)=>{const k=w+'_'+h+'_'+d;return GC[k]||(GC[k]=new THREE.BoxGeometry(w,h,d))};
function box(p,w,h,d,c,x=0,y=0,z=0,m){const o=new THREE.Mesh(boxG(w,h,d),m||(typeof c==='string'?lam(c):c));o.position.set(x,y,z);p&&p.add(o);return o}
function cyl(p,r1,r2,h,c,x=0,y=0,z=0,s=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s),typeof c==='string'?lam(c):c);o.position.set(x,y,z);p&&p.add(o);return o}
function ctex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}
// coloured geometry part for merging
function part(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0){g=g.index?g.toNonIndexed():g.clone();g.deleteAttribute('uv');const col=new THREE.Color(c),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b}g.setAttribute('color',new THREE.BufferAttribute(a,3));
 const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz,'YXZ')),new THREE.Vector3(1,1,1));g.applyMatrix4(m);return g}
const VC=new THREE.MeshLambertMaterial({vertexColors:true});
function prism(w,h,d){const A=[-w/2,0,-d/2],B=[-w/2,0,d/2],C=[-w/2,h,0],A2=[w/2,0,-d/2],B2=[w/2,0,d/2],C2=[w/2,h,0];
 const f=[B,B2,C2,B,C2,C,A2,A,C,A2,C,C2,B,A,C,A2,B2,C2].flat();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(f,3));g.computeVertexNormals();return g}

export const R={cam,get q(){return Q},
 async init(canvas,q){Q=QS[q]?q:'med';const s=QS[Q];
  rd=new THREE.WebGLRenderer({canvas,antialias:s.aa,powerPreference:'high-performance'});rd.setPixelRatio(Math.min(devicePixelRatio||1,s.pr));rd.setSize(innerWidth,innerHeight,false);
  rd.shadowMap.enabled=!!s.sh;rd.shadowMap.type=THREE.PCFShadowMap;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,900);
  scene.fog=new THREE.Fog('#cfeaff',70,220);
  hemi=new THREE.HemisphereLight('#cfe8ff','#8a7a50',1.3);scene.add(hemi);
  dirL=new THREE.DirectionalLight('#fff3dd',2.4);dirL.castShadow=!!s.sh;const sc=dirL.shadow.camera;sc.left=sc.bottom=-28;sc.right=sc.top=28;sc.near=1;sc.far=140;dirL.shadow.mapSize.set(s.sh||512,s.sh||512);dirL.shadow.bias=-.0008;scene.add(dirL,dirL.target);
  pl=new THREE.PointLight('#ffd9a0',0,14,1.6);scene.add(pl);
  // sky dome
  sky=new THREE.Mesh(new THREE.SphereGeometry(450,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color('#3d9cff')},bot:{value:new THREE.Color('#d6efff')}},
   vertexShader:'varying float vy;void main(){vy=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform vec3 top;uniform vec3 bot;varying float vy;void main(){gl_FragColor=vec4(mix(bot,top,smoothstep(-.05,.5,vy)),1.);}'}));sky.renderOrder=-1;scene.add(sky);
  sunM=new THREE.Mesh(new THREE.SphereGeometry(14,16,8),new THREE.MeshBasicMaterial({color:'#fff2a8',fog:false}));moonM=new THREE.Mesh(new THREE.SphereGeometry(9,16,8),new THREE.MeshBasicMaterial({color:'#e8eeff',fog:false}));scene.add(sunM,moonM);
  const sp=[];for(let i=0;i<500;i++){const a=Math.random()*6.28,b=Math.random()*1.3+.15;sp.push(Math.cos(a)*Math.cos(b)*420,Math.sin(b)*420,Math.sin(a)*Math.cos(b)*420)}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));stars=new THREE.Points(sg,new THREE.PointsMaterial({color:'#fff',size:1.6,sizeAttenuation:false,fog:false,transparent:true}));scene.add(stars);
  addEventListener('resize',()=>{rd.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
 },
 setQuality(q){if(!QS[q])return;Q=q;const s=QS[q];rd.setPixelRatio(Math.min(devicePixelRatio||1,s.pr));rd.setSize(innerWidth,innerHeight,false);rd.shadowMap.enabled=!!s.sh;dirL.castShadow=!!s.sh;
  if(s.sh){dirL.shadow.mapSize.set(s.sh,s.sh);if(dirL.shadow.map){dirL.shadow.map.dispose();dirL.shadow.map=null}}
  scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}});},
 get npcMax(){return QS[Q].npc},get q(){return Q},
 // ---------- world ----------
 async build(d,prog){D=d;const {B,WW,WH}=d;await prog(55);
  waterMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},n:{value:0},r:{value:0}},vertexShader:'varying vec3 w;void main(){vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
   fragmentShader:'uniform float t;uniform float n;uniform float r;varying vec3 w;void main(){float s=sin(w.x*.55+t*1.3)*sin(w.z*.7-t*1.1)+.5*sin((w.x+w.z)*1.4+t*2.1);vec3 c=mix(vec3(.03,.36,.42),vec3(.16,.6,.66),.5+.3*s);c=mix(c,vec3(.3,.36,.38),r*.5);c+=smoothstep(1.05,1.4,s)*.3;c*=mix(1.,.2,n);gl_FragColor=vec4(c,1.);}'});
  const wm=new THREE.Mesh(new THREE.PlaneGeometry(WW*K+1600,WH*K+1600),waterMat);wm.rotation.x=-Math.PI/2;wm.position.set(WW*K/2,-.4,WH*K/2);scene.add(wm);await prog(62);
  for(const b of B)this.building(b);await prog(72);
  const api={scene,lam,ctex,part,VC,prism,makeAvatar,animate,geo:(t,c)=>this.geo(t,c),tpx:()=>QS[Q].tpx,aniso:()=>QS[Q].an,npcMax:()=>QS[Q].npc};this.api=api;
  CITY=build3D(api);await prog(86);CITY.ensureTiles(d.spawn.x,d.spawn.y,true);await prog(95);
  player=new THREE.Group();scene.add(player);
  marker=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,4),new THREE.MeshBasicMaterial({color:'#ffd400'}));marker.rotation.x=Math.PI;scene.add(marker);
  wpM=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,60,10,1,true),new THREE.MeshBasicMaterial({color:'#ff1744',transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));wpM.position.y=30;wpM.visible=false;scene.add(wpM)
 },
 preload(x,y){if(CITY)CITY.ensureTiles(x,y,true)},
 building(b){const sideW=b.side==='e'||b.side==='w',x=b.x*K,z=b.y*K,w=(sideW?b.h:b.w)*K,d=(sideW?b.w:b.h)*K,h=3+b.H*.085,G=new THREE.Group();G.position.set(x+b.w*K/2,0,z+b.h*K/2);G.rotation.y={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2}[b.side||'s'];scene.add(G);
  if(this.special(b,G,w,d,h))return;
  const glass=['bank','tech','studio','hospital','club'].includes(b.kind)||b.id==='flat',winC=b.kind==='club'?'#7b1fa2':glass?'#4fc3f7':'#5d4037';
  const face=(W,door)=>{const px=48,cw=Math.min(1024,Math.round(W*px)),ch=Math.min(1024,Math.round(h*px)),sx=cw/W,sy=ch/h;let em;
   const t=ctex(cw,ch,(c)=>{c.fillStyle=b.col;c.fillRect(0,0,cw,ch);c.fillStyle='rgba(0,0,0,.08)';for(let i=0;i<40;i++)c.fillRect(Math.random()*cw,Math.random()*ch,20,3);
    c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,ch-.4*sy,cw,.4*sy);
    const e=document.createElement('canvas');e.width=cw;e.height=ch;const ec=e.getContext('2d');ec.fillStyle='#000';ec.fillRect(0,0,cw,ch);
    for(let fy=0;fy*3+1.1<h-.8;fy++)for(let wx=1;wx+1<W;wx+=2.2){if(door&&fy===0&&Math.abs(wx+.6-W/2)<1.6)continue;const X=wx*sx,Y=ch-(fy*3+2.4)*sy,WW_=1.2*sx,HH=1.3*sy;
     c.fillStyle='#222';c.fillRect(X-2,Y-2,WW_+4,HH+4);c.fillStyle=winC;c.fillRect(X,Y,WW_,HH);if(!glass){c.fillStyle='rgba(255,255,255,.15)';c.fillRect(X+WW_/2-1,Y,2,HH)}else{c.fillStyle='rgba(255,255,255,.35)';c.fillRect(X,Y,WW_*.3,HH)}
     if(Math.random()<.75){ec.fillStyle=b.kind==='club'?'#e040fb':'#ffcc66';ec.fillRect(X,Y,WW_,HH)}}
    if(door){c.fillStyle='#3e2723';c.fillRect(cw/2-.7*sx,ch-2.3*sy,1.4*sx,2.3*sy);c.fillStyle='#ffd400';c.fillRect(cw/2+.4*sx,ch-1.2*sy,4,4);ec.fillStyle='#553311';ec.fillRect(cw/2-.7*sx,ch-2.3*sy,1.4*sx,2.3*sy)}
    em=new THREE.CanvasTexture(e);em.colorSpace=THREE.SRGBColorSpace});
   const m=new THREE.MeshLambertMaterial({map:t,emissiveMap:em,emissive:'#ffffff',emissiveIntensity:0});bmats.push({m,b});return m};
  const roofM=lam(b.roof),fr=face(w,true),sd=face(d,false),top=lam(b.kind==='market'?'#8d6e63':'#9e9e9e');
  let mh=h;if(b.kind==='park'){mh=3.2}if(b.kind==='beach'){this.gate(G,w,d,b);return}
  const body=new THREE.Mesh(boxG(w,mh,d),[sd,sd,top,top,fr,sd]);body.position.y=mh/2;body.castShadow=body.receiveShadow=true;G.add(body);solids.push(body);
  // sign
  const lab=b.sign||b.lab[0].split(' (')[0],sw=Math.min(w*.9,Math.max(4,lab.length*.42));
  const st=ctex(512,96,(c)=>{c.fillStyle=b.kind==='club'?'#120024':'#111';c.fillRect(0,0,512,96);c.strokeStyle=b.kind==='club'?'#e040fb':'#ffd400';c.lineWidth=8;c.strokeRect(4,4,504,88);c.fillStyle=b.kind==='club'?'#e040fb':b.kind==='hospital'?'#ff5252':'#ffd400';c.font='900 52px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(lab,256,50,490)});
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(sw,sw*96/512),new THREE.MeshBasicMaterial({map:st}));sg.position.set(0,Math.min(mh-.5,3.1),d/2+.06);G.add(sg);bmats.push({sign:sg.material,b});
  // roofs
  if(['home','buka','market'].includes(b.kind)&&b.id!=='flat'){
   if(b.kind==='market'){const cols=['#e53935','#fdd835','#43a047','#1e88e5','#fb8c00','#e53935'];for(let i=0;i<6;i++){const r=new THREE.Mesh(prism(w/6+.05,1.6,d+.6),new THREE.MeshLambertMaterial({color:cols[i],side:THREE.DoubleSide}));r.position.set(-w/2+w/12+i*w/6,mh,0);r.rotation.y=0;r.castShadow=true;G.add(r)}
    for(let i=0;i<5;i++){const a=box(G,w/6*.8,.08,1.6,cols[i],-w/2+w/12+i*w/6,2.6,d/2+.8);a.rotation.x=.35}}
   else{const zinc=ctex(64,64,(c)=>{c.fillStyle=b.roof;c.fillRect(0,0,64,64);for(let i=0;i<64;i+=8){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(i,0,3,64)}c.fillStyle='rgba(120,60,20,.35)';c.fillRect(10,20,20,14)},1);zinc.repeat.set(w/1.5,1);
    const r=new THREE.Mesh(prism(d+.8,2.2,w+.6),new THREE.MeshLambertMaterial({map:zinc,side:THREE.DoubleSide}));r.rotation.y=Math.PI/2;r.position.y=mh;r.castShadow=true;G.add(r)}}
  else if(b.kind==='worship'){const dm=new THREE.Mesh(new THREE.SphereGeometry(w*.18,12,6,0,6.29,0,1.57),lam('#43a047'));dm.position.set(-w*.22,mh,0);dm.castShadow=true;G.add(dm);cyl(G,.45,.55,6,'#fafafa',-w*.45,mh+3,-d*.35);cyl(G,.6,.6,.8,'#43a047',-w*.45,mh+6.2,-d*.35).geometry=new THREE.ConeGeometry(.6,1.4,8);
   box(G,2.2,5,2.2,'#e3f2fd',w*.28,mh+2.5,0).castShadow=true;const sp=cyl(G,0,0,0,'#1565c0',w*.28,mh+6.2,0);sp.geometry=new THREE.ConeGeometry(1.6,2.4,4);box(G,.2,1.6,.2,'#ffd400',w*.28,mh+8,0);box(G,.9,.2,.2,'#ffd400',w*.28,mh+8.2,0)}
  else if(b.kind==='park'){box(G,w+2.4,.3,d+5,'#ffd400',0,4.4,1.5).castShadow=true;for(const sx of [-1,1])for(const sz of [-1,1])box(G,.3,4.4,.3,'#333',sx*(w/2+1),2.2,sz*(d/2+1.8)+1.5);
   const dn=new THREE.Mesh(this.danfoGeo(),VC);dn.position.set(-w*.2,0,d/2+3.2);dn.castShadow=true;G.add(dn)}
  else{box(G,w+.3,.5,d+.3,b.roof,0,mh+.25,0).castShadow=true;if(b.kind!=='fuel'){cyl(G,.8,.8,1.6,'#212121',w*.3,mh+1.3,-d*.2);box(G,1,.7,.8,'#cfd8dc',-w*.25,mh+.85,-d*.25)}
   if(b.kind==='hospital'){box(G,.9,3,.4,'#e53935',0,mh+2,0);box(G,3,.9,.4,'#e53935',0,mh+2,0)}
   if(b.kind==='club'){const n=new THREE.MeshBasicMaterial({color:'#e040fb'});box(G,w+.4,.15,.15,null,0,mh-.1,d/2+.12,n);box(G,w+.4,.15,.15,null,0,.2,d/2+.12,n);bmats.push({neon:n,b})}
   if(b.kind==='fuel'){const cz=d/2+2.2;box(G,w+1,.35,4.6,'#0b7a3e',0,4.6,cz).castShadow=true;box(G,w+1.05,.12,4.65,'#ffd400',0,4.4,cz);for(const sx of [-1,1]){box(G,.3,4.4,.3,'#eee',sx*w*.35,2.2,cz);box(G,.6,1.4,.4,'#c62828',sx*w*.2,.7,cz);box(G,.45,.3,.42,'#fff',sx*w*.2,1.1,cz)}}}
 },
 gate(G,w,d,b){for(const s of [-1,1])box(G,.8,4.5,.8,'#00838f',s*w*.4,2.25,0).castShadow=true;box(G,w*.9,.8,.9,'#00838f',0,4.6,0);
  const st=ctex(512,96,c=>{c.fillStyle='#ffe082';c.fillRect(0,0,512,96);c.fillStyle='#004d40';c.font='900 54px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ELEGUSHY BEACH',256,50,490)});const sg=new THREE.Mesh(new THREE.PlaneGeometry(w*.85,w*.85*96/512),new THREE.MeshBasicMaterial({map:st}));sg.position.set(0,4.6,.47);G.add(sg);
  for(let i=0;i<5;i++){const u=cyl(G,.04,.04,2.4,'#fff',-6+i*3,1.2,8+i%2*3);const c=cyl(G,0,0,0,['#e53935','#fdd835','#1e88e5'][i%3],-6+i*3,2.4,8+i%2*3);c.geometry=new THREE.ConeGeometry(1.4,.7,8)}},
 special(b,G,w,d,h){const k=b.kind,sign=(txt,bg,fg,W,y,z)=>{const t=ctex(512,96,c=>{c.fillStyle=bg;c.fillRect(0,0,512,96);c.fillStyle=fg;c.font='900 52px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,256,50,490)});const m=new THREE.Mesh(new THREE.PlaneGeometry(W,W*96/512),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));m.position.set(0,y,z);G.add(m);bmats.push({sign:m.material,b});return m};
  if(k==='brt'){for(const sx of [-1,1])box(G,.12,2.6,.12,'#90a4ae',sx*(d*.5-.2)*0+sx*1.6,1.3,0);const r=box(G,4,.15,2.2,'#1565c0',0,2.65,.2);r.castShadow=true;box(G,3,.08,.5,'#90a4ae',0,.5,-.3);box(G,3.4,.9,.06,null,0,1.6,-.85,new THREE.MeshLambertMaterial({color:'#b3e5fc',transparent:true,opacity:.45}));
   const s=sign('BRT  '+b.lab[0].split('— ')[1],'#0d47a1','#fff',3.6,3.05,.2);s.position.z=1.32;return true}
  if(k==='jetty'||k==='boat'){const hut=box(G,w,2.8,d,'#8d6e63',0,1.4,0);hut.castShadow=true;solids.push(hut);const rf=new THREE.Mesh(prism(w+.8,1.2,d+.8),lam(k==='boat'?'#795548':'#1565c0'));rf.position.y=2.8;G.add(rf);
   for(let i=0;i<10;i++)box(G,2.4,.12,1,'#a1887f',0,.05,-d/2-.5-i*1.05);for(let i=0;i<5;i++)for(const sx of [-1.1,1.1])box(G,.18,1.6,.18,'#5d4037',sx,-.6,-d/2-1-i*2.2);
   const bt=new THREE.Mesh(this.geo(k==='boat'?'canoe':'ferry'),VC);bt.position.set(k==='boat'?2:4.2,-.3,-d/2-8);bt.rotation.y=Math.PI/2;G.add(bt);
   sign(k==='boat'?'CANOE RIDES':'FERRY',k==='boat'?'#4e342e':'#0277bd','#fff',Math.min(w*.95,3.2),2.2,d/2+.05);return true}
  if(k==='stadium'){const ring=(rx,rz,y0,y1,c,open)=>{const g=new THREE.CylinderGeometry(1,1,y1-y0,40,1,open);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));m.scale.set(rx,1,rz);m.position.y=(y0+y1)/2;m.castShadow=m.receiveShadow=true;G.add(m);return m};
   const s1=ring(w/2,d/2,0,13,'#b0bec5',true);solids.push(s1);ring(w/2-2.5,d/2-2.5,0,9,'#1e88e5',true);ring(w/2-5,d/2-5,0,5,'#fdd835',true);ring(w/2-.3,d/2-.3,12.6,13.6,'#eceff1',true);
   const pt=new THREE.Mesh(new THREE.PlaneGeometry(w*.55,d*.6),new THREE.MeshLambertMaterial({map:ctex(256,256,c=>{c.fillStyle='#2e7d32';c.fillRect(0,0,256,256);for(let i=0;i<8;i++){c.fillStyle=i%2?'#388e3c':'#2e7d32';c.fillRect(0,i*32,256,32)}c.strokeStyle='#fff';c.lineWidth=4;c.strokeRect(10,10,236,236);c.beginPath();c.moveTo(10,128);c.lineTo(246,128);c.stroke();c.beginPath();c.arc(128,128,30,0,7);c.stroke()})}));pt.rotation.x=-Math.PI/2;pt.position.y=.05;G.add(pt);
   for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){box(G,.6,24,.6,'#90a4ae',sx*w*.42,12,sz*d*.42);box(G,3,1.6,.4,'#eceff1',sx*w*.42,24,sz*d*.42)}
   sign('NATIONAL STADIUM','#1b5e20','#fff',14,10,d/2+.2);box(G,4,3,1,'#455a64',0,1.5,d/2+.2);return true}
  if(k==='airport'){const t=box(G,w,h*.55,d,'#cfd8dc',0,h*.275,0);t.castShadow=true;solids.push(t);box(G,w*.98,h*.3,d*1.02,null,0,h*.3,0,new THREE.MeshLambertMaterial({color:'#4fc3f7',emissive:'#ffcc66',emissiveIntensity:0}));
   const rf=box(G,w+4,.6,d+6,'#eceff1',0,h*.55+.3,0);rf.castShadow=true;cyl(G,1.6,2,22,'#eceff1',w/2-4,11,-d/2+4);box(G,6,3,6,null,w/2-4,23.5,-d/2+4,new THREE.MeshLambertMaterial({color:'#26c6da',transparent:true,opacity:.85}));
   sign('MURTALA INTERNATIONAL AIRPORT','#0d47a1','#fff',Math.min(w*.8,28),h*.45,d/2+.15);this.plane(b);return true}
  if(k==='dealer'){const g2=box(G,w,h*.5,d,null,0,h*.25,0,new THREE.MeshLambertMaterial({color:'#b3e5fc',transparent:true,opacity:.6}));solids.push(g2);box(G,w+.4,.5,d+.4,'#263238',0,h*.5+.25,0);
   ['#e53935','#fafafa','#212121'].forEach((c,i)=>{const m=new THREE.Mesh(this.geo('car',c),VC);m.position.set(-w/3+i*w/3,0,d/2+3.4);m.rotation.y=Math.PI/2*(i%2?1:-1)*0+.3;m.castShadow=true;G.add(m)});
   for(let i=0;i<8;i++){const f=box(G,.06,4.5,.06,'#999',-w/2+i*w/7,2.25,d/2+6.5);const fl=box(G,.6,.4,.02,['#e53935','#fdd835','#1e88e5'][i%3],-w/2+i*w/7+.3,4.2,d/2+6.5)}
   sign('GIDI MOTORS — TOKUNBO','#263238','#ffd400',Math.min(w*.9,12),h*.5+1.4,d/2+.25);return true}
  if(k==='repair'){const t=box(G,w,h,d,'#ffcc80',0,h/2,0);t.castShadow=t.receiveShadow=true;solids.push(t);box(G,w+.3,.5,d+.3,'#37474f',0,h+.25,0);
   const lab=['PHONE REPAIRS','LAPTOP DOCTOR','UK USED PHONES','ACCESSORIES','FLASH & UNLOCK','SCREEN 1HR'];for(let fl=0;fl<2;fl++)for(let i=0;i<3;i++){const s=sign(lab[(fl*3+i)%6],['#c62828','#1565c0','#2e7d32','#6a1b9a','#ef6c00','#00838f'][(fl*3+i)%6],'#fff',w/3.3,1.4+fl*3.2,d/2+.06);s.position.x=-w/3+i*w/3}
   for(let i=0;i<5;i++){box(G,1.6,.08,1.2,['#e53935','#fdd835','#1e88e5'][i%3],-w/2+2+i*(w-4)/4,2.4,d/2+.7).rotation.x=.3}sign('COMPUTER VILLAGE','#111','#ffd400',Math.min(w*.9,16),h-1,d/2+.08);return true}
  return false},
 plane(b){const g=new THREE.Group(),wm=lam('#fafafa');cyl(g,1.6,1.6,26,'#fafafa',0,3,0,12).rotation.z=Math.PI/2;const n=cyl(g,0,1.6,4,'#fafafa',15,3,0,12);n.rotation.z=-Math.PI/2;box(g,6,.3,30,'#eceff1',1,2.5,0);box(g,3,.25,10,'#eceff1',-11,3.4,0);box(g,3,5,.3,'#1b5e20',-11.5,6,0);
  box(g,26,.5,3.3,'#1b5e20',0,3.4,0).scale.set(1,.3,1.02);for(const z of [-1,1])cyl(g,.7,.7,2.4,'#90a4ae',2,1.7,z*5,10).rotation.z=Math.PI/2;g.position.set(330*20*K,0,28*20*K);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g)},
 geo(t,c){const k=t+(c||'');this._geo=this._geo||{};if(this._geo[k])return this._geo[k];const B3=(w,h,d)=>new THREE.BoxGeometry(w,h,d),P=[],wh=new THREE.CylinderGeometry(.34,.34,.24,10);let g;
  if(t==='danfo')g=this.danfoGeo();else if(t==='okada')g=this.okadaGeo();
  else if(t==='car'||t==='taxi'){const C2=t==='taxi'?'#26a65b':c||'#e53935',L=4.4,W=1.8;P.push(part(B3(L,.7,W),C2,0,.6,0),part(B3(L*.55,.6,W*.92),C2,-.2,1.2,0),part(B3(L*.56,.48,W*.94),'#1f2d33',-.2,1.22,0),part(B3(L*.3,.08,W*.9),C2,-.2,1.52,0));
   for(const s of [-1,1])P.push(part(B3(.05,.14,.32),'#fffde7',L/2+.02,.7,s*.6),part(B3(.05,.12,.32),'#e53935',-L/2-.02,.7,s*.6));P.push(part(B3(.1,.2,W*1.02),'#222',L/2,.36,0),part(B3(.1,.2,W*1.02),'#222',-L/2,.36,0));
   if(t==='taxi')P.push(part(B3(.6,.22,.3),'#fff',-.2,1.66,0));for(const sx of [-1,1])for(const sz of [-1,1])P.push(part(wh,'#151515',sx*L*.32,.34,sz*W/2,Math.PI/2));g=mergeGeometries(P)}
  else if(t==='keke'){P.push(part(B3(2.2,.5,1.3),'#2e7d32',0,.55,0),part(B3(1.4,.9,1.3),'#fdd835',-.3,1.25,0),part(B3(.06,.9,1.2),'#1f2d33',.5,1.3,0),part(B3(2.3,.08,1.4),'#111',-.1,1.95,0),part(B3(.5,.5,.3),'#1565c0',.6,1.1,0));
   for(const [x,z] of [[.9,0],[-.7,.6],[-.7,-.6]])P.push(part(new THREE.CylinderGeometry(.27,.27,.18,10),'#151515',x,.27,z,Math.PI/2));g=mergeGeometries(P)}
  else if(t==='brt'){const L=11,W=2.5;P.push(part(B3(L,1.2,W),'#1565c0',0,1,0),part(B3(L*.98,1.1,W*.98),'#1e88e5',0,2.15,0),part(B3(L*.96,.8,W*1.0),'#1f2d33',0,2.2,0),part(B3(L*.9,.15,W*.9),'#eceff1',0,2.8,0),part(B3(.06,.3,W*.6),'#fff',L/2+.02,2.55,0));
   for(const s of [-1,1])P.push(part(B3(.05,.16,.4),'#fffde7',L/2+.02,.85,s*.85));for(const x of [-3.6,3.6])for(const z of [-1,1])P.push(part(new THREE.CylinderGeometry(.48,.48,.3,10),'#151515',x,.48,z*W/2,Math.PI/2));g=mergeGeometries(P)}
  else if(t==='ferry'){P.push(part(B3(8,1.2,3),'#fafafa',0,.6,0),part(B3(1.6,1.2,2.6),'#fafafa',4.6,.6,0),part(B3(7,.12,3.1),'#0277bd',0,1.25,0),part(B3(5,1.4,2.6),'#4fc3f7',-.6,1.95,0),part(B3(5.6,.12,3.1),'#0277bd',-.6,2.7,0),part(B3(8,.2,3.05),'#e53935',0,.3,0));g=mergeGeometries(P)}
  else if(t==='canoe'){P.push(part(B3(5,.5,1),'#5d4037',0,.25,0),part(B3(4.6,.12,.8),'#3e2723',0,.52,0),part(new THREE.ConeGeometry(.5,1,4),'#5d4037',2.9,.3,0,0,0,-Math.PI/2),part(new THREE.ConeGeometry(.5,1,4),'#5d4037',-2.9,.3,0,0,0,Math.PI/2),part(B3(.25,1,.25),'#1565c0',-1.6,1,0),part(B3(.2,.2,.2),'#5a3825',-1.6,1.6,0),part(B3(.06,2.4,.06),'#8d6e63',-1.2,1.2,.3,0,0,.6));g=mergeGeometries(P)}
  else g=this.danfoGeo();return this._geo[k]=g},
 danfoGeo(){if(this._dg)return this._dg;const L=4.2,W=1.7,P=[],Y='#ffd400';
  P.push(part(new THREE.BoxGeometry(L,1,W),Y,0,.85,0),part(new THREE.BoxGeometry(L*.94,.85,W*.96),Y,-.1,1.75,0),part(new THREE.BoxGeometry(L*.95,.48,W*.98),'#1f2d33',-.1,1.78,0),part(new THREE.BoxGeometry(L*.94,.16,W*.96),Y,-.1,2.12,0));
  for(const y of [1.02,1.22])P.push(part(new THREE.BoxGeometry(L*1.01,.09,W*1.01),'#111',0,y,0));
  P.push(part(new THREE.BoxGeometry(.06,.55,W*.86),'#1f2d33',L*.46,1.75,0),part(new THREE.BoxGeometry(.1,.25,W*1.02),'#222',L/2,.45,0),part(new THREE.BoxGeometry(.1,.25,W*1.02),'#222',-L/2,.45,0));
  for(const s of [-1,1])P.push(part(new THREE.BoxGeometry(.05,.16,.3),'#fffde7',L/2+.03,.85,s*.55),part(new THREE.BoxGeometry(.05,.14,.3),'#e53935',-L/2-.03,.85,s*.55));
  P.push(part(new THREE.BoxGeometry(L*.6,.08,W*.8),'#555',-.1,2.26,0));
  const wh=new THREE.CylinderGeometry(.38,.38,.26,10);for(const sx of [-1,1])for(const sz of [-1,1])P.push(part(wh,'#151515',sx*L*.32,.38,sz*W/2,Math.PI/2));
  return this._dg=mergeGeometries(P)},
 okadaGeo(){if(this._og)return this._og;const P=[],wh=new THREE.CylinderGeometry(.32,.32,.1,10);
  P.push(part(wh,'#111',.6,.32,0,Math.PI/2),part(wh,'#111',-.6,.32,0,Math.PI/2),part(new THREE.BoxGeometry(1.1,.35,.28),'#c62828',0,.62,0),part(new THREE.BoxGeometry(.6,.12,.3),'#111',-.15,.86,0),part(new THREE.BoxGeometry(.06,.5,.6),'#888',.55,1,0),
   part(new THREE.BoxGeometry(.28,.6,.4),'#1565c0',-.15,1.25,0),part(new THREE.BoxGeometry(.24,.24,.24),'#5a3825',-.1,1.7,0),part(new THREE.BoxGeometry(.28,.18,.28),'#fdd835',-.1,1.84,0),part(new THREE.BoxGeometry(.5,.12,.12),'#263238',.15,1.35,.15),part(new THREE.BoxGeometry(.5,.12,.12),'#263238',.15,1.35,-.15),
   part(new THREE.BoxGeometry(.12,.5,.14),'#263238',-.05,.85,.2),part(new THREE.BoxGeometry(.12,.5,.14),'#263238',-.05,.85,-.2));return this._og=mergeGeometries(P)},
 addRemote(lk){const a=makeAvatar(lk);a.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(a);return a},
 removeRemote(a){if(a)scene.remove(a)},
 animRemote(a,ph,anim,tm){animX(a,ph,anim,tm)},
 setLook(lk){if(!player)return;player.clear();const a=makeAvatar(lk);player.add(a);player.userData.av=a},
 // ---------- interiors ----------
 enterInterior(sp){iscene=new THREE.Scene();iscene.background=new THREE.Color('#0d0d12');const {w,d}=sp;const anim=[],cols=[],npcs=[],acts=[];
  const ih=new THREE.HemisphereLight('#fff6e8','#3a3020',1.1),il=new THREE.PointLight(sp.lampC||'#ffe0b0',sp.lampI??25,Math.max(w,d)*1.6,1.2);il.position.set(0,2.9,0);iscene.add(ih,il);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:floorTex(sp.floor,sp.fpat,w,d)}));fl.rotation.x=-Math.PI/2;iscene.add(fl);
  const wt=c=>ctex(256,128,(g)=>{g.fillStyle=c;g.fillRect(0,0,256,128);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,112,256,16);if(sp.tier===0){g.fillStyle='rgba(90,60,30,.12)';for(let i=0;i<6;i++){g.beginPath();g.ellipse(Math.random()*256,20+Math.random()*80,14+Math.random()*20,8+Math.random()*10,0,0,7);g.fill()}}},1);
  const H=3.4;[[0,-d/2,0,w],[0,d/2,Math.PI,w],[-w/2,0,Math.PI/2,d],[w/2,0,-Math.PI/2,d]].forEach(([x,z,r,L])=>{const t=wt(sp.wall);t.repeat.set(L/4,1);const m=new THREE.Mesh(new THREE.PlaneGeometry(L,H),new THREE.MeshLambertMaterial({map:t}));m.position.set(x,H/2,z);m.rotation.y=r;iscene.add(m)});
  // exit door on front wall
  const dr=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.3),lam('#4e342e'));dr.position.set(0,1.15,d/2-.03);dr.rotation.y=Math.PI;iscene.add(dr);const ex=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),new THREE.MeshBasicMaterial({map:ctex(128,40,g=>{g.fillStyle='#0b7a3e';g.fillRect(0,0,128,40);g.fillStyle='#fff';g.font='900 28px system-ui';g.textAlign='center';g.fillText('EXIT',64,30)})}));ex.position.set(0,2.6,d/2-.1);ex.rotation.y=Math.PI;iscene.add(ex);
  // back-wall sign
  if(sp.title){const t=ctex(512,96,g=>{g.fillStyle='#111';g.fillRect(0,0,512,96);g.fillStyle='#ffd400';g.font='900 50px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(sp.title,256,50,490)});const m=new THREE.Mesh(new THREE.PlaneGeometry(4,.75),new THREE.MeshBasicMaterial({map:t}));m.position.set(0,2.85,-d/2+.06);iscene.add(m)}
  for(const it of sp.items){const fn=FURN[it.t];if(!fn){if(it.act)acts.push({x:it.x,z:it.z,r:it.r||1.3,act:it.act});continue}const g=new THREE.Group();const r=fn(g,it,sp,anim)||{};g.position.set(it.x,0,it.z);g.rotation.y=it.ry||0;iscene.add(g);
   const f=r.f||[0,0];if(f[0]){const sw=Math.abs(Math.sin(it.ry||0))>.5;cols.push({x:it.x,z:it.z,hw:(sw?f[1]:f[0])/2+.25,hd:(sw?f[0]:f[1])/2+.25})}
   if(it.act)acts.push({x:it.x,z:it.z,r:it.r||Math.max(f[0],f[1])/2+1.1,act:it.act})}
  if(sp.kind==='club'){const n=8,tm=new THREE.InstancedMesh(new THREE.BoxGeometry(.95,.04,.95),new THREE.MeshBasicMaterial({color:'#fff'}),n*n),m4=new THREE.Matrix4(),c=new THREE.Color();
   for(let i=0;i<n*n;i++){m4.makeTranslation((i%n-n/2+.5),.02,Math.floor(i/n)-n/2+.5+.5);tm.setMatrixAt(i,m4);tm.setColorAt(i,c.setHSL(i/n/n,1,.5))}iscene.add(tm);
   const L2=[0,1,2].map(i=>{const p=new THREE.PointLight(['#ff00ff','#00e5ff','#ffea00'][i],18,14,1);p.position.y=2.6;iscene.add(p);return p});anim.push(t=>{const beat=Math.floor(t*2.1);for(let i=0;i<n*n;i++)tm.setColorAt(i,c.setHSL(((i*7+beat*13)%n)/n,1,((i+beat)%3===0)?.55:.12));tm.instanceColor.needsUpdate=true;L2.forEach((p,i)=>{p.position.x=Math.sin(t*1.3+i*2)*w*.3;p.position.z=Math.cos(t*1.1+i*2)*d*.3})})}
  for(const n of sp.npcs||[]){const a=makeAvatar(n.look,true);a.position.set(n.x,0,n.z);a.rotation.y=n.ry||0;iscene.add(a);npcs.push({a,n,ph:Math.random()*6})}
  const ip=new THREE.Group();iscene.add(ip);if(player.userData.av)ip.add(player.userData.av);
  iInfo={sp,anim,npcs,ip,il,ih};cam.dist=Math.min(cam.dist,8);return {cols,acts}},
 exitInterior(){if(player.userData.av)player.add(player.userData.av);iscene=null;iInfo=null},
 setInteriorPower(bo,gen){if(!iInfo)return;const sp=iInfo.sp;sp.bo=bo;sp.gen=gen;const lit=!bo||sp.powered;iInfo.il.intensity=lit?(sp.lampI??25):5;iInfo.il.color.set(lit?(sp.lampC||'#ffe0b0'):'#ff9a40');iInfo.ih.intensity=lit?1.1:.25},
 screen(x,y,z){const v=new THREE.Vector3(x,y,z).project(camera);return{x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,vis:v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1}},
 // ---------- per frame ----------
 frame(dt,st){const tm=st.tm,P=st.p;
  const av=player&&player.userData.av;if(player)player.visible=!st.hideP;
  // animate player
  if(av){const host=iscene?iInfo.ip:player;host.position.set(P.x,0,P.z);if(!st.dead){host.rotation.set(0,P.ry,0);av.position.y=0;av.rotation.set(0,0,0);(P.anim&&P.anim!=='idle'&&!P.moving)?animX(av,P.ph,P.anim,tm):animate(av,P.ph,P.moving?1:0,tm)}
   else{const k=Math.min(1,st.dead.t/0.9);host.position.x+=st.dead.dx*k*3.5;host.position.z+=st.dead.dz*k*3.5;av.position.y=Math.sin(k*Math.PI)*1.6+.15*k;av.rotation.x=-k*Math.PI/2;av.rotation.z=k*1.2;const u=av.userData;u.arms[0].rotation.z=k*2;u.arms[1].rotation.z=-k*2;u.legs[0].rotation.x=k*.6}}
  const tgt=new THREE.Vector3(P.x,1.3,P.z);if(st.dead)tgt.set(P.x+st.dead.dx*3,1,P.z+st.dead.dz*3);
  let yaw=cam.yaw,pitch=cam.pitch,dist=cam.dist;if(st.title){yaw=tm*.06;pitch=.35;dist=26;tgt.set(P.x,4,P.z)}
  if(iscene){const s=iInfo.sp;dist=Math.min(dist,Math.max(s.w,s.d)*.75);pitch=Math.max(pitch,.55)}
  camera.fov=camera.aspect<.8?68:55;camera.updateProjectionMatrix();marker.scale.setScalar(iscene?.6:1);
  if(!iscene&&!st.title){const dir=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));ray.set(tgt,dir);ray.far=dist;const h=ray.intersectObjects(solids,false)[0];const want=h?Math.max(2.2,h.distance-.5):dist;cdist+=(want-cdist)*Math.min(1,want<cdist?.5:.08);dist=Math.min(dist,cdist)}
  camera.position.set(tgt.x+Math.sin(yaw)*Math.cos(pitch)*dist,tgt.y+Math.sin(pitch)*dist,tgt.z+Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(tgt);if(st.cine){camera.position.fromArray(st.cine.p);camera.lookAt(st.cine.l[0],st.cine.l[1],st.cine.l[2])}
  if(wpM){if(st.wp&&!iscene){wpM.visible=true;wpM.position.x=st.wp[0];wpM.position.z=st.wp[1];wpM.material.opacity=.2+Math.sin(tm*3)*.08}else wpM.visible=false}
  {const host=iscene||scene;if(marker.parent!==host)host.add(marker);if(st.marker){marker.visible=true;marker.position.set(st.marker[0],(st.marker[2]||2.9)+Math.sin(tm*4)*.2,st.marker[1]);marker.rotation.y=tm*2}else marker.visible=false}
  if(iscene){for(const f of iInfo.anim)f(tm,dt);for(const o of iInfo.npcs){o.ph+=dt*(o.n.dance?9:2);animate(o.a,o.ph,0,tm);if(o.n.dance){o.a.position.y=Math.abs(Math.sin(o.ph))*.25;o.a.userData.arms.forEach((a,i)=>a.rotation.x=-2.4+Math.sin(o.ph+i)*.5);o.a.rotation.y+=dt*.6}}
   rd.render(iscene,camera);return}
  // sky & light
  const h=st.h,nf=st.nf,bo=st.bo,a=(h-6)/12*Math.PI,sd=new THREE.Vector3(Math.cos(a)*.8,Math.sin(a),-.45).normalize();
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  sunM.position.copy(camera.position).addScaledVector(sd,380);moonM.position.copy(camera.position).addScaledVector(sd,-380);sunM.visible=sd.y>-.1;moonM.visible=sd.y<.1;
  const dusk=Math.max(0,1-Math.abs(h-18.3)/1.6)+Math.max(0,1-Math.abs(h-6)/1.3),dark=bo?Math.min(1,nf*1.15+.0):nf;
  const top=new THREE.Color('#3d9cff').lerp(new THREE.Color('#ff8a50'),dusk*.5).lerp(new THREE.Color(bo?'#03040c':'#0a1236'),dark),bot=new THREE.Color('#d6efff').lerp(new THREE.Color('#ffb070'),dusk*.7).lerp(new THREE.Color(bo?'#080a14':'#1d2a5a'),dark);
  const wx=st.wx||{rain:0,haze:0,wet:0,flash:0},gray=new THREE.Color('#8d979e'),hzc=new THREE.Color('#dcc196');top.lerp(gray,wx.rain*.75*(1-dark*.6)).lerp(hzc,wx.haze*.45*(1-dark));bot.lerp(gray,wx.rain*.7*(1-dark*.6)).lerp(hzc,wx.haze*.8*(1-dark));if(wx.flash>0){top.lerp(new THREE.Color('#e8eaff'),wx.flash*.6);bot.lerp(new THREE.Color('#ffffff'),wx.flash*.6)}
  const far=QS[Q].far*(1-wx.haze*.55)*(1-wx.rain*.4);scene.fog.near=far*.22;scene.fog.far=far;
  sky.material.uniforms.top.value.copy(top);sky.material.uniforms.bot.value.copy(bot);scene.fog.color.copy(bot);stars.material.opacity=nf;
  hemi.intensity=(1.35*(1-nf)+(bo?.12:.32)*nf)*(1-wx.rain*.3)+wx.flash*2.5;hemi.color.set(nf>.5?'#8090ff':'#cfe8ff');
  const ld=sd.y>0?sd:sd.clone().negate();dirL.position.copy(tgt).addScaledVector(ld,60);dirL.target.position.copy(tgt);dirL.intensity=(sd.y>0?2.5*Math.min(1,sd.y*3)*(1-dusk*.3):(bo?.15:.35)*nf)*(1-wx.rain*.7)*(1-wx.haze*.35);dirL.color.set(sd.y>0?(dusk>.3?'#ffb27a':'#fff3dd'):'#9fb4ff');
  pl.position.set(P.x,2.2,P.z);pl.intensity=nf*(bo?9:4);
  waterMat.uniforms.t.value=tm;waterMat.uniforms.r.value=wx.rain;waterMat.uniforms.n.value=nf*(bo?.9:.75);
  for(const o of bmats){const pw=!bo||o.b.gen;if(o.m)o.m.emissiveIntensity=pw?nf*.9:0;if(o.sign)o.sign.color.set(nf>.3&&!pw?'#555':nf>.3?'#ddd':'#fff');if(o.neon)o.neon.color.set(nf>.3?(Math.sin(tm*4)>0?'#e040fb':'#7c4dff'):'#7b1fa2')}
  frame3D(CITY,this.api,dt,{x:P.x/K,y:P.z/K,cx:tgt.x,cz:tgt.z,camP:camera.position,nf,bo,wet:wx.wet,rain:wx.rain,far,extra:st.extra});
  rd.render(scene,camera)},
 interiorMarker(){},
 info(){return rd.info.render},
 camInfo(){const d=new THREE.Vector3();camera.getWorldDirection(d);const f=Math.hypot(d.x,d.z)||1;return{x:camera.position.x,y:camera.position.y,z:camera.position.z,fx:d.x/f,fz:d.z/f}}
};
function floorTex(c,pat,w,d){const t=ctex(128,128,g=>{g.fillStyle=c;g.fillRect(0,0,128,128);if(pat==='tile'){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,128,2);g.fillRect(0,0,2,128)}else if(pat==='wood'){g.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<128;i+=16)g.fillRect(0,i,128,2)}else{g.fillStyle='rgba(0,0,0,.1)';for(let i=0;i<300;i++)g.fillRect(Math.random()*128,Math.random()*128,2,2)}},1);t.repeat.set(w/2,d/2);return t}
// ---------- avatars ----------
export function makeAvatar(lk,npc){const g=new THREE.Group(),bw=lk.body?.56:.44,u={legs:[],arms:[]},pant=npc?'#37474f':'#263238',B3=(w,h,d)=>new THREE.BoxGeometry(w,h,d),HC='#1b1b1b';
 for(const s of [-1,1]){const L=new THREE.Mesh(mergeGeometries([part(B3(.17,.8,.2),pant,0,-.4,0),part(B3(.19,.12,.3),'#111',0,-.8,.04)]),VC);L.position.set(s*bw*.24,.86,0);g.add(L);u.legs.push(L);
  const A=new THREE.Mesh(mergeGeometries([part(B3(.13,.36,.15),lk.out,0,-.17,0),part(B3(.11,.32,.12),lk.skin,0,-.5,0)]),VC);A.position.set(s*(bw/2+.08),1.44,0);g.add(A);u.arms.push(A)}
 const ico=(r,sx,sy,sz)=>new THREE.IcosahedronGeometry(r,1).scale(sx,sy,sz);
 const P=[part(B3(bw,.64,.3),lk.out,0,0,0),part(B3(bw*1.02,.08,.31),'#111',0,-.29,0),part(ico(.2,1,1,1),lk.skin,0,.55,0)];for(const s of [-1,1])P.push(part(B3(.045,.055,.02),'#111',s*.075,.57,.19));
 const hh=lk.hair|0;
 if(hh===0)P.push(part(ico(.207,1,.72,1),HC,0,.58,-.015));
 else if(hh===1)P.push(part(ico(.3,1,1,1),HC,0,.69,-.06));
 else if(hh===2){P.push(part(ico(.21,1,.75,1),HC,0,.59,-.02));for(let i=0;i<7;i++){const a=-1.6+i*.53;P.push(part(B3(.04,.42,.04),HC,Math.sin(a)*.19,.38,Math.cos(a)*-.19))}}
 else if(hh===3)P.push(part(new THREE.CylinderGeometry(.215,.215,.14,10),lk.out,0,.69,0),part(B3(.26,.03,.2),lk.out,0,.64,.22));
 else P.push(part(ico(.27,1.05,.72,1),lk.out,0,.73,-.02),part(B3(.14,.14,.1),lk.out,.16,.85,-.05));
 const body=new THREE.Mesh(mergeGeometries(P),VC);body.position.y=1.17;g.add(body);u.body=body;
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData=u;return g}
function animate(a,ph,mv,tm){const u=a.userData,s=Math.sin(ph)*.7*mv;u.legs[0].rotation.x=s;u.legs[1].rotation.x=-s;u.arms[0].rotation.x=-s*.85;u.arms[1].rotation.x=s*.85;u.arms[0].rotation.z=u.arms[1].rotation.z=0;
 a.position.y=mv?Math.abs(Math.cos(ph))*.05:0;u.body.scale.y=mv?1:1+Math.sin(tm*2.2+ph)*.015}
export function animX(a,ph,anim,tm){const u=a.userData;if(anim==='walk'){animate(a,ph,1,tm);return}animate(a,ph,0,tm);
 if(anim==='dance'){a.position.y=Math.abs(Math.sin(tm*9))*.22;u.arms.forEach((r,i)=>{r.rotation.x=-2.5+Math.sin(tm*9+i*3)*.5});u.legs[0].rotation.x=Math.sin(tm*9)*.5;u.legs[1].rotation.x=-Math.sin(tm*9)*.5}
 else if(anim==='wave'){u.arms[1].rotation.z=2.6+Math.sin(tm*10)*.35}
 else if(anim==='kneel'){a.position.y=-.35;u.legs.forEach(l=>l.rotation.x=-1.4);u.arms.forEach(r=>r.rotation.x=-.4)}}
// ---------- interior furniture ----------
const F=(f)=>({f});
const FURN={
 bed(g,it,sp){const t=sp.tier;if(t===0){box(g,1,.2,2,'#d7ccc8',0,.1,0);box(g,.6,.12,.35,'#fff',0,.26,-.75);box(g,1,.06,1.1,'#8e24aa',0,.23,.35);return F([1.1,2.1])}
  const W=t===2?1.9:1.4;box(g,W,.4,2.1,t===2?'#3e2723':'#6d4c41',0,.2,0);box(g,W-.1,.22,2,'#fafafa',0,.51,0);box(g,W-.08,.07,1.2,t===2?'#c9a227':'#1e88e5',0,.64,.35);box(g,W*.35,.14,.4,'#fff',-W*.22,.68,-.72);box(g,W*.35,.14,.4,'#fff',W*.22,.68,-.72);box(g,W,.95,.1,t===2?'#3e2723':'#6d4c41',0,.48,-1.05);return F([W+.1,2.2])},
 fan(g,it,sp,an){cyl(g,.18,.22,.06,'#eee',0,.03,0);cyl(g,.03,.03,1.2,'#ddd',0,.6,0);const h=new THREE.Group();h.position.set(0,1.25,0);g.add(h);cyl(h,.12,.12,.12,'#eee',0,0,0).rotation.x=Math.PI/2;const bl=new THREE.Group();bl.position.z=.1;h.add(bl);for(let i=0;i<3;i++){const b=box(bl,.08,.32,.01,'#4fc3f7',0,.16,0);const p=new THREE.Group();p.add(b);p.rotation.z=i*2.09;bl.add(p)}
  an.push((t,dt)=>{bl.rotation.z+=dt*(sp.bo&&!sp.gen?0:14);h.rotation.y=Math.sin(t*.7)*.6});return F([.45,.45])},
 tv(g,it,sp,an){const big=sp.tier===2;box(g,big?2:1.2,.5,.45,'#5d4037',0,.25,0);const W=big?1.7:.8,H=big?.95:.55;box(g,W+.06,H+.06,.06,'#111',0,.5+H/2+.05,0);const s=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({color:'#4fc3f7'}));s.position.set(0,.5+H/2+.05,.035);g.add(s);
  an.push(t=>{const on=!sp.bo||sp.gen;s.material.color.setHSL(on?(Math.floor(t*1.5)%5)/5:0,on?.6:0,on?.55:.04)});return F([big?2:1.2,.5])},
 gen(g){box(g,.75,.5,.5,'#c62828',0,.3,0);box(g,.6,.08,.4,'#222',0,.6,0);cyl(g,.04,.04,.25,'#555',.3,.7,0);box(g,.8,.06,.55,'#333',0,.03,0);return F([.8,.6])},
 table(g){box(g,1,.06,.7,'#8d6e63',0,.75,0);for(const x of [-.42,.42])for(const z of [-.28,.28])box(g,.06,.75,.06,'#5d4037',x,.37,z);box(g,.3,.04,.22,'#fff',.15,.8,0);box(g,.25,.05,.18,'#1565c0',-.2,.8,.05);return F([1,.7])},
 wardrobe(g,it,sp){box(g,1.3,2.1,.6,sp.tier===2?'#eceff1':'#795548',0,1.05,0);box(g,.02,1.9,.02,'#333',0,1.05,.31);return F([1.3,.6])},
 sofa(g){box(g,2.1,.45,.85,'#455a64',0,.25,0);box(g,2.1,.55,.2,'#455a64',0,.7,-.33);for(const s of [-1,1])box(g,.2,.6,.85,'#37474f',s*1,.35,0);box(g,.5,.25,.12,'#ffd400',-.5,.6,-.2);return F([2.1,.85])},
 plant(g){cyl(g,.22,.18,.4,'#8d6e63',0,.2,0);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),lam('#2e7d32'));m.position.y=.85;g.add(m);return F([.5,.5])},
 rug(g,it,sp){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),lam(sp.tier===2?'#b71c1c':'#ff8f00'));m.rotation.x=-Math.PI/2;m.position.y=.01;g.add(m);return F([0,0])},
 ac(g){box(g,1,.32,.25,'#fafafa',0,2.6,0);return F([0,0])},
 fridge(g){box(g,.7,1.7,.7,'#eceff1',0,.85,0);box(g,.04,.4,.04,'#999',.25,1.2,.36);return F([.7,.7])},
 lantern(g,it,sp,an){box(g,.2,.3,.2,'#ffb300',0,.95,0);return F([0,0])},
 counter(g,it,sp){const c=it.c||'#6d4c41';box(g,it.w||3,1,.7,c,0,.5,0);box(g,(it.w||3)+.1,.06,.8,'#a1887f',0,1.03,0);return F([it.w||3,.8])},
 pot(g){box(g,.8,.4,.8,'#5d4037',0,.2,0);cyl(g,.35,.3,.45,'#424242',0,.62,0,10);cyl(g,.36,.36,.04,'#ff7043',0,.86,0,10);return F([.8,.8])},
 bench(g){box(g,2.2,.07,.42,'#8d6e63',0,.45,0);for(const x of [-.95,.95])box(g,.08,.45,.38,'#5d4037',x,.22,0);return F([2.2,.45])},
 btable(g){box(g,2.2,.06,.85,'#a1887f',0,.75,0);for(const x of [-1,1])box(g,.07,.75,.7,'#6d4c41',x,.37,0);for(let i=0;i<3;i++){cyl(g,.16,.12,.07,'#fff',-.7+i*.7,.82,0,10);cyl(g,.12,.12,.05,['#e65100','#2e7d32','#fdd835'][i],-.7+i*.7,.86,0,10)}return F([2.2,.85])},
 desk(g){box(g,1.6,.06,.8,'#eceff1',0,.75,0);for(const x of [-.75,.75])box(g,.06,.75,.7,'#90a4ae',x,.37,0);box(g,.38,.02,.26,'#90a4ae',0,.79,.05);const s=box(g,.38,.25,.015,null,0,.92,-.08,new THREE.MeshBasicMaterial({color:'#64b5f6'}));s.rotation.x=-.2;box(g,.5,.5,.5,'#263238',0,.25,.7);box(g,.5,.5,.07,'#263238',0,.75,.95);return F([1.6,1.3])},
 coffee(g){box(g,.8,1,.5,'#3e2723',0,.5,0);box(g,.4,.45,.35,'#111',0,1.22,0);box(g,.12,.1,.12,'#fff',0,1.05,.15);return F([.8,.5])},
 teller(g){box(g,3.2,1.05,.7,'#0d47a1',0,.52,0);box(g,3.3,.06,.8,'#cfd8dc',0,1.07,0);const gl=box(g,3.2,.8,.04,null,0,1.5,0,new THREE.MeshLambertMaterial({color:'#b3e5fc',transparent:true,opacity:.35}));return F([3.3,.8])},
 atm(g){box(g,.85,1.75,.6,'#0d47a1',0,.87,0);box(g,.55,.35,.02,null,0,1.3,.31,new THREE.MeshBasicMaterial({color:'#4fc3f7'}));box(g,.4,.08,.08,'#111',0,1,.32);box(g,.85,.25,.62,'#ffd400',0,1.85,0);return F([.85,.6])},
 stall(g,it){const c=it.c||'#e53935';box(g,2,.8,1,'#8d6e63',0,.4,0);for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),lam(['#e53935','#fdd835','#43a047','#ff7043','#8e24aa'][(i+it.x*3|0)%5]));m.position.set(-.8+(i%5)*.4,.92,-.2+Math.floor(i/5)*.4);g.add(m)}
  for(const x of [-.95,.95])box(g,.06,2.3,.06,'#5d4037',x,1.15,-.45);const cn=box(g,2.3,.06,1.4,c,0,2.3,0);cn.rotation.x=.12;return F([2,1])},
 dj(g,it,sp,an){box(g,2.4,1.1,.9,'#212121',0,.55,0);const p=box(g,2.3,.5,.02,null,0,.6,.46,new THREE.MeshBasicMaterial({color:'#e040fb'}));for(const x of [-.6,.6])cyl(g,.25,.25,.05,'#555',x,1.13,0,12);for(const s of [-1,1]){box(g,.8,1.7,.7,'#111',s*1.8,.85,0);for(const y of [.5,1.25])cyl(g,.25,.25,.02,'#444',s*1.8,y,.36,12).rotation.x=Math.PI/2}
  an.push(t=>p.material.color.setHSL((t*.3)%1,1,.5));return F([4.4,1])},
 bar(g){box(g,3.6,1.05,.7,'#311b92',0,.52,0);box(g,3.7,.06,.8,'#111',0,1.07,0);box(g,3.6,1.6,.3,'#1a1a1a',0,1.6,-1.2);for(let i=0;i<9;i++)cyl(g,.05,.06,.32,['#2e7d32','#fdd835','#e53935'][i%3],-1.6+i*.4,1.6,-1.1,6);return F([3.7,.8])},
 pew(g){box(g,2.6,.08,.45,'#6d4c41',0,.45,0);box(g,2.6,.55,.07,'#6d4c41',0,.75,-.2);for(const x of [-1.2,1.2])box(g,.08,.45,.45,'#4e342e',x,.22,0);return F([2.6,.5])},
 altar(g,it){box(g,1.8,1,.8,'#fafafa',0,.5,0);box(g,1.9,.05,.9,it.c||'#1565c0',0,1.02,0);box(g,.12,1.4,.12,'#ffd400',0,1.75,-.2);box(g,.7,.12,.12,'#ffd400',0,2.05,-.2);return F([1.8,.8])},
 mihrab(g){box(g,1.6,2.6,.2,'#43a047',0,1.3,0);box(g,1.1,2,.05,'#1b5e20',0,1.1,.11);for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.6),lam(['#2e7d32','#c62828','#1565c0','#6a1b9a'][i]));m.rotation.x=-Math.PI/2;m.position.set(-1.8+i*1.2,.01,1.6);g.add(m)}return F([1.6,.3])},
 shelf(g){box(g,2,1.8,.5,'#8d6e63',0,.9,0);for(let r=0;r<3;r++)for(let i=0;i<6;i++)box(g,.22,.28,.2,['#e53935','#1e88e5','#fdd835','#43a047','#fff','#fb8c00'][(i+r)%6],-.8+i*.32,.35+r*.55,.08);return F([2,.5])},
 hbed(g){box(g,1,.55,2,'#b0bec5',0,.3,0);box(g,.95,.15,1.95,'#fafafa',0,.62,0);box(g,.95,.05,1.1,'#81d4fa',0,.71,.4);box(g,.5,.12,.3,'#fff',0,.75,-.75);cyl(g,.02,.02,1.8,'#999',.65,.9,-.8);box(g,.15,.25,.05,'#e1f5fe',.65,1.75,-.8);return F([1.1,2.1])},
 mic(g){cyl(g,.2,.2,.04,'#222',0,.02,0);cyl(g,.02,.02,1.5,'#333',0,.75,0);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,1),lam('#999'));m.position.y=1.55;g.add(m);return F([.4,.4])},
 console(g){box(g,2,.85,.9,'#263238',0,.42,0);for(let i=0;i<10;i++)box(g,.06,.03,.25,['#e53935','#43a047','#fdd835'][i%3],-.8+i*.18,.87,0);for(const x of [-.6,.6])box(g,.7,.45,.04,null,x,1.25,-.35,new THREE.MeshBasicMaterial({color:'#7c4dff'}));return F([2,.9])},
 speaker(g){box(g,.7,1.6,.6,'#111',0,.8,0);cyl(g,.22,.22,.02,'#555',0,1.1,.31,12).rotation.x=Math.PI/2;return F([.7,.6])},
 goal(g){const w=lam('#fafafa');for(const x of [-2.6,2.6])box(g,.12,2.2,.12,w,x,1.1,0);box(g,5.3,.12,.12,w,0,2.2,0);const n=new THREE.Mesh(new THREE.PlaneGeometry(5.2,2.2),new THREE.MeshLambertMaterial({color:'#eeeeee',transparent:true,opacity:.35,side:THREE.DoubleSide}));n.position.set(0,1.1,-.6);g.add(n);
  const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,1),lam('#ffffff'));ball.position.set(0,.17,3.4);g.add(ball);return F([5.4,1])},
 board(g,it,sp,an){box(g,4.2,1.6,.15,'#111',0,2.6,0);const t=ctex(512,192,c=>{c.fillStyle='#000';c.fillRect(0,0,512,192);c.font='700 26px monospace';c.fillStyle='#ffd400';['DEPARTURES','LOS → LHR  ON TIME','LOS → YYZ  BOARDING','LOS → DXB  DELAYED','LOS → ACC  ON TIME'].forEach((l,i)=>c.fillText(l,16,32+i*36))});const m=new THREE.Mesh(new THREE.PlaneGeometry(4,1.45),new THREE.MeshBasicMaterial({map:t}));m.position.set(0,2.6,.09);g.add(m);for(const x of [-1.8,1.8])box(g,.1,1.9,.1,'#555',x,.95,0);return F([4.2,.3])},
 gate(g){box(g,.25,2.6,.25,'#90a4ae',-1.1,1.3,0);box(g,.25,2.6,.25,'#90a4ae',1.1,1.3,0);box(g,2.5,.4,.3,'#0d47a1',0,2.7,0);box(g,.8,1,.5,'#cfd8dc',-1.6,.5,.4);return F([0,0])},
 carshow(g,it){box(g,5,.08,2.6,'#b0bec5',0,.04,0);const m=new THREE.Mesh(R.geo('car',it.c||'#e53935'),VC);m.position.y=.08;m.rotation.y=.4;g.add(m);return F([4.6,2.2])},
 pump(g){box(g,.6,1.5,.4,'#c62828',0,.75,0);box(g,.45,.3,.02,'#fff',0,1.2,.21);return F([.6,.4])},
};
