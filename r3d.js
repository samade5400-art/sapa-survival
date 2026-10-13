// Sapa Survival v3 — Three.js renderer (low-poly, procedural; no external assets)
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const K=0.05; // 2D world units -> metres
const QS={low:{pr:1,sh:0,npc:12,ts:.45,aa:false},med:{pr:1.5,sh:1024,npc:22,ts:.6,aa:true},high:{pr:2,sh:2048,npc:34,ts:.7,aa:true}};
let rd,scene,camera,hemi,dirL,pl,sky,sunM,moonM,stars,waterMat,D,Q='med',iscene=null,iInfo=null,player=null,marker,lampBulbs,lampGlow,genGlow,npcAv=[],busM=[];
const bmats=[];const cam={yaw:0,pitch:.5,dist:14};
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
  scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.needsUpdate=true)}});npcAv.forEach((a,i)=>a.visible=i<s.npc)},
 get npcMax(){return QS[Q].npc},
 // ---------- world ----------
 async build(d,prog){D=d;const {B,WW,WH,SEA,RY,RH}=d;await prog(55);
  // ground texture from the 2D map painter
  const ts=QS[Q].ts,gc=document.createElement('canvas');gc.width=Math.round(WW*ts);gc.height=Math.round(WH*ts);const g=gc.getContext('2d');g.scale(ts,ts);d.drawStatic(g);
  g.globalCompositeOperation='destination-out';g.fillRect(0,SEA,WW,WH);for(const x of [1400,3000]){g.fillRect(x,0,200,RY-24);g.fillRect(x,RY+RH+24,200,SEA-RY-RH-24)}
  const gt=new THREE.CanvasTexture(gc);gt.colorSpace=THREE.SRGBColorSpace;gt.anisotropy=8;
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(WW*K,WH*K),new THREE.MeshLambertMaterial({map:gt,alphaTest:.5}));gm.rotation.x=-Math.PI/2;gm.position.set(WW*K/2,0,WH*K/2);gm.receiveShadow=true;scene.add(gm);await prog(65);
  // mainland around the map
  const ml=lam('#7cb342');[[WW*K/2,-150,WW*K+600,300],[-150,SEA*K/2,300,SEA*K],[WW*K+150,SEA*K/2,300,SEA*K]].forEach(([x,z,w,h])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),ml);m.rotation.x=-Math.PI/2;m.position.set(x,-.02,z);m.receiveShadow=true;scene.add(m)});
  // animated lagoon / sea
  waterMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},n:{value:0}},vertexShader:'varying vec3 w;void main(){vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
   fragmentShader:'uniform float t;uniform float n;varying vec3 w;void main(){float s=sin(w.x*.55+t*1.3)*sin(w.z*.7-t*1.1)+.5*sin((w.x+w.z)*1.4+t*2.1);vec3 c=mix(vec3(.02,.42,.55),vec3(.2,.72,.8),.5+.3*s);c+=smoothstep(1.05,1.4,s)*.35;c*=mix(1.,.2,n);float f=smoothstep(120.,320.,length(w.xz-cameraPosition.xz));c=mix(c,mix(vec3(.75,.9,1.),vec3(.04,.06,.16),n),f*.7);gl_FragColor=vec4(c,1.);}'});
  const wm=new THREE.Mesh(new THREE.PlaneGeometry(1400,900,1,1),waterMat);wm.rotation.x=-Math.PI/2;wm.position.set(WW*K/2,-.25,WH*K/2+200);scene.add(wm);
  // bridges
  for(const x of [1400,3000])for(const zz of [RY-24,RY+RH+24]){box(scene,200*K,.9,.15,'#9e9e9e',(x+100)*K,.45,zz*K);for(let i=0;i<=4;i++)box(scene,.3,1.2,.3,'#757575',(x+i*50)*K,.6,zz*K)}
  await prog(72);
  for(const b of B)this.building(b);await prog(85);
  this.props();this.vehicles();this.npcs();await prog(95);
  player=new THREE.Group();scene.add(player);
  marker=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,4),new THREE.MeshBasicMaterial({color:'#ffd400'}));marker.rotation.x=Math.PI;scene.add(marker);
 },
 building(b){const x=b.x*K,z=b.y*K,w=b.w*K,d=b.h*K,h=3+b.H*.085,G=new THREE.Group();G.position.set(x+w/2,0,z+d/2);scene.add(G);
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
  const body=new THREE.Mesh(boxG(w,mh,d),[sd,sd,top,top,fr,sd]);body.position.y=mh/2;body.castShadow=body.receiveShadow=true;G.add(body);
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
 props(){const {PALMS,LAMPS}=D,m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3(),p=new THREE.Vector3();
  const tg=new THREE.CylinderGeometry(.13,.24,6,6);tg.translate(0,3,0);const lv=[];for(let i=0;i<7;i++){const a=i/7*6.28;lv.push(part(new THREE.BoxGeometry(.5,.06,2.8),'#2e7d32',Math.sin(a)*1.25,6.05,Math.cos(a)*1.25,.38,a,0))}
  // fix leaf tilt: rotate each leaf around its own yaw
  const lg=mergeGeometries(lv.map((g,i)=>g));lg.computeVertexNormals();
  const tr=new THREE.InstancedMesh(tg,lam('#8d6e63'),PALMS.length),lf=new THREE.InstancedMesh(lg,VC,PALMS.length);tr.castShadow=lf.castShadow=true;
  PALMS.forEach((pm,i)=>{const sc=pm.s*1.1;e.set((Math.random()-.5)*.12,Math.random()*6,(Math.random()-.5)*.12);q.setFromEuler(e);s.set(sc,sc,sc);p.set(pm.x*K,0,pm.y*K);m4.compose(p,q,s);tr.setMatrixAt(i,m4);lf.setMatrixAt(i,m4)});scene.add(tr,lf);
  const pg=new THREE.CylinderGeometry(.07,.1,4.6,5);pg.translate(0,2.3,0);const poles=new THREE.InstancedMesh(pg,lam('#455a64'),LAMPS.length);
  lampBulbs=new THREE.InstancedMesh(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color:'#fff59d'}),LAMPS.length);
  const glowT=ctex(64,64,(c)=>{const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,220,140,.9)');gr.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=gr;c.fillRect(0,0,64,64)});
  const gmat=new THREE.MeshBasicMaterial({map:glowT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});const gg=new THREE.PlaneGeometry(7,7);gg.rotateX(-Math.PI/2);
  lampGlow=new THREE.InstancedMesh(gg,gmat,LAMPS.length);
  LAMPS.forEach((l,i)=>{const dz=l.y<D.RY?1:-1;m4.makeTranslation(l.x*K,0,l.y*K);poles.setMatrixAt(i,m4);m4.makeTranslation(l.x*K,4.6,l.y*K+dz*.3);lampBulbs.setMatrixAt(i,m4);m4.makeTranslation(l.x*K,.04,l.y*K+dz*1.2);lampGlow.setMatrixAt(i,m4)});
  scene.add(poles,lampBulbs,lampGlow);
  const gp=D.GEN;genGlow=new THREE.InstancedMesh(new THREE.PlaneGeometry(12,12).rotateX(-Math.PI/2),gmat,gp.length);gp.forEach((o,i)=>{m4.makeTranslation(o.x*K,.05,o.y*K);genGlow.setMatrixAt(i,m4)});scene.add(genGlow);
 },
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
 vehicles(){for(const v of D.BUS){const m=new THREE.Mesh(v.ok?this.okadaGeo():this.danfoGeo(),VC);m.castShadow=true;scene.add(m);busM.push(m)}},
 npcs(){D.NPC.forEach((n,i)=>{const a=makeAvatar(n.look,true);a.visible=i<QS[Q].npc;scene.add(a);npcAv.push(a)})},
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
  const av=player&&player.userData.av;
  // animate player
  if(av){const host=iscene?iInfo.ip:player;host.position.set(P.x,0,P.z);if(!st.dead){host.rotation.set(0,P.ry,0);av.position.y=0;av.rotation.set(0,0,0);animate(av,P.ph,P.moving?1:0,tm)}
   else{const k=Math.min(1,st.dead.t/0.9);host.position.x+=st.dead.dx*k*3.5;host.position.z+=st.dead.dz*k*3.5;av.position.y=Math.sin(k*Math.PI)*1.6+.15*k;av.rotation.x=-k*Math.PI/2;av.rotation.z=k*1.2;const u=av.userData;u.arms[0].rotation.z=k*2;u.arms[1].rotation.z=-k*2;u.legs[0].rotation.x=k*.6}}
  const tgt=new THREE.Vector3(P.x,1.3,P.z);if(st.dead)tgt.set(P.x+st.dead.dx*3,1,P.z+st.dead.dz*3);
  let yaw=cam.yaw,pitch=cam.pitch,dist=cam.dist;if(st.title){yaw=tm*.06;pitch=.35;dist=26;tgt.set(P.x,4,P.z)}
  if(iscene){const s=iInfo.sp;dist=Math.min(dist,Math.max(s.w,s.d)*.75);pitch=Math.max(pitch,.55)}
  camera.fov=camera.aspect<.8?68:55;camera.updateProjectionMatrix();marker.scale.setScalar(iscene?.6:1);
  camera.position.set(tgt.x+Math.sin(yaw)*Math.cos(pitch)*dist,tgt.y+Math.sin(pitch)*dist,tgt.z+Math.cos(yaw)*Math.cos(pitch)*dist);camera.lookAt(tgt);
  {const host=iscene||scene;if(marker.parent!==host)host.add(marker);if(st.marker){marker.visible=true;marker.position.set(st.marker[0],(st.marker[2]||2.9)+Math.sin(tm*4)*.2,st.marker[1]);marker.rotation.y=tm*2}else marker.visible=false}
  if(iscene){for(const f of iInfo.anim)f(tm,dt);for(const o of iInfo.npcs){o.ph+=dt*(o.n.dance?9:2);animate(o.a,o.ph,0,tm);if(o.n.dance){o.a.position.y=Math.abs(Math.sin(o.ph))*.25;o.a.userData.arms.forEach((a,i)=>a.rotation.x=-2.4+Math.sin(o.ph+i)*.5);o.a.rotation.y+=dt*.6}}
   rd.render(iscene,camera);return}
  // sky & light
  const h=st.h,nf=st.nf,bo=st.bo,a=(h-6)/12*Math.PI,sd=new THREE.Vector3(Math.cos(a)*.8,Math.sin(a),-.45).normalize();
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  sunM.position.copy(camera.position).addScaledVector(sd,380);moonM.position.copy(camera.position).addScaledVector(sd,-380);sunM.visible=sd.y>-.1;moonM.visible=sd.y<.1;
  const dusk=Math.max(0,1-Math.abs(h-18.3)/1.6)+Math.max(0,1-Math.abs(h-6)/1.3),dark=bo?Math.min(1,nf*1.15+.0):nf;
  const top=new THREE.Color('#3d9cff').lerp(new THREE.Color('#ff8a50'),dusk*.5).lerp(new THREE.Color(bo?'#03040c':'#0a1236'),dark),bot=new THREE.Color('#d6efff').lerp(new THREE.Color('#ffb070'),dusk*.7).lerp(new THREE.Color(bo?'#080a14':'#1d2a5a'),dark);
  sky.material.uniforms.top.value.copy(top);sky.material.uniforms.bot.value.copy(bot);scene.fog.color.copy(bot);stars.material.opacity=nf;
  hemi.intensity=1.35*(1-nf)+(bo?.12:.32)*nf;hemi.color.set(nf>.5?'#8090ff':'#cfe8ff');
  const ld=sd.y>0?sd:sd.clone().negate();dirL.position.copy(tgt).addScaledVector(ld,60);dirL.target.position.copy(tgt);dirL.intensity=sd.y>0?2.5*Math.min(1,sd.y*3)*(1-dusk*.3):(bo?.15:.35)*nf;dirL.color.set(sd.y>0?(dusk>.3?'#ffb27a':'#fff3dd'):'#9fb4ff');
  pl.position.set(P.x,2.2,P.z);pl.intensity=nf*(bo?9:4);
  waterMat.uniforms.t.value=tm;waterMat.uniforms.n.value=nf*(bo?.9:.75);
  const lampsOn=nf>.3&&!bo;lampBulbs.material.color.set(lampsOn?'#fff59d':'#555');lampGlow.visible=lampsOn;genGlow.visible=nf>.3;
  for(const o of bmats){const pw=!bo||o.b.gen;if(o.m)o.m.emissiveIntensity=pw?nf*.9:0;if(o.sign)o.sign.color.set(nf>.3&&!pw?'#555':nf>.3?'#ddd':'#fff');if(o.neon)o.neon.color.set(nf>.3?(Math.sin(tm*4)>0?'#e040fb':'#7c4dff'):'#7b1fa2')}
  // npcs, vehicles
  const nm=QS[Q].npc;D.NPC.forEach((n,i)=>{if(i>=nm)return;const a=npcAv[i];a.position.set(n.x*K,0,n.y*K);a.rotation.y=n.ry||0;animate(a,n.ph,1,tm)});
  D.BUS.forEach((v,i)=>{const [x,y]=D.busPos(v),m=busM[i];m.position.set(x*K,0,y*K);m.rotation.y=v.h?(v.sp>0?0:Math.PI):(v.sp>0?-Math.PI/2:Math.PI/2)});
  rd.render(scene,camera)},
 interiorMarker(){},
 info(){return rd.info.render}
};
function floorTex(c,pat,w,d){const t=ctex(128,128,g=>{g.fillStyle=c;g.fillRect(0,0,128,128);if(pat==='tile'){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,0,128,2);g.fillRect(0,0,2,128)}else if(pat==='wood'){g.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<128;i+=16)g.fillRect(0,i,128,2)}else{g.fillStyle='rgba(0,0,0,.1)';for(let i=0;i<300;i++)g.fillRect(Math.random()*128,Math.random()*128,2,2)}},1);t.repeat.set(w/2,d/2);return t}
// ---------- avatars ----------
export function makeAvatar(lk,npc){const g=new THREE.Group(),sk=lam(lk.skin),out=lam(lk.out),pant=lam(npc?'#37474f':'#263238'),hairM=lam('#1b1b1b'),bw=lk.body?.56:.44,u={legs:[],arms:[]};
 for(const s of [-1,1]){const L=new THREE.Group();L.position.set(s*bw*.24,.86,0);box(L,.17,.8,.2,pant,0,-.4,0);box(L,.19,.12,.3,'#111',0,-.8,.04);g.add(L);u.legs.push(L);
  const A=new THREE.Group();A.position.set(s*(bw/2+.08),1.44,0);box(A,.13,.36,.15,out,0,-.17,0);box(A,.11,.32,.12,sk,0,-.5,0);g.add(A);u.arms.push(A)}
 u.body=box(g,bw,.64,.3,out,0,1.17,0);box(g,bw*1.02,.08,.31,'#111',0,.88,0);
 const hd=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),sk);hd.position.y=1.72;g.add(hd);for(const s of [-1,1])box(g,.045,.055,.02,'#111',s*.075,1.74,.19);
 const hh=lk.hair|0;
 if(hh===0){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.207,1),hairM);m.position.set(0,1.75,-.015);m.scale.set(1,.72,1);g.add(m)}
 else if(hh===1){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),hairM);m.position.set(0,1.86,-.06);g.add(m)}
 else if(hh===2){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.21,1),hairM);m.position.set(0,1.76,-.02);m.scale.set(1,.75,1);g.add(m);for(let i=0;i<7;i++){const a=-1.6+i*.53;box(g,.04,.42,.04,hairM,Math.sin(a)*.19,1.55,Math.cos(a)*-.19)}}
 else if(hh===3){cyl(g,.215,.215,.14,out,0,1.86,0,10);box(g,.26,.03,.2,out,0,1.81,.22)}
 else{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,1),out);m.position.set(0,1.9,-.02);m.scale.set(1.05,.72,1);g.add(m);box(g,.14,.14,.1,out,.16,2.02,-.05)}
 g.traverse(o=>{if(o.isMesh)o.castShadow=!npc||true});g.userData=u;return g}
function animate(a,ph,mv,tm){const u=a.userData,s=Math.sin(ph)*.7*mv;u.legs[0].rotation.x=s;u.legs[1].rotation.x=-s;u.arms[0].rotation.x=-s*.85;u.arms[1].rotation.x=s*.85;u.arms[0].rotation.z=u.arms[1].rotation.z=0;
 a.position.y=mv?Math.abs(Math.cos(ph))*.05:0;u.body.scale.y=mv?1:1+Math.sin(tm*2.2+ph)*.015}
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
 pump(g){box(g,.6,1.5,.4,'#c62828',0,.75,0);box(g,.45,.3,.02,'#fff',0,1.2,.21);return F([.6,.4])},
};
