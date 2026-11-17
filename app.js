import { THREE, cfg, rnd, rr, pick, clamp, smooth, R, C, CIRC, centroid, insetPoly, lerpPoly, polyBox, polyArea, prismInto, capInto, bufGeo, groupGeo, ensureColor, ao,
  toLL, GEO, AVES, vS, wS, ub, shoreE, shoreW, SHORE_PTS, SHORE_WPTS, SHORE_W } from './core.js';
import { S, M, FACADE_MATS, buildTextures } from './tex.js';
import { DEF } from './buildings.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const $=s=>document.querySelector(s);
const loadBar=$('#loading .pb i'),loadMsg=$('#loading .msg');
const tick=(p,msg)=>{loadBar.style.width=(p*100)+'%';loadMsg.textContent=msg;return new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)))};

/* ============================ renderer ============================ */
const app=$('#app');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.62;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.localClippingEnabled=true;
app.appendChild(renderer.domElement);
const labelRenderer=new CSS2DRenderer();labelRenderer.setSize(innerWidth,innerHeight);labelRenderer.domElement.className='labels';app.appendChild(labelRenderer.domElement);
cfg.aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,3,60000);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=0.07;controls.maxPolarAngle=Math.PI*0.493;controls.minDistance=25;controls.maxDistance=9000;controls.screenSpacePanning=false;

const rt=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:4});
const composer=new EffectComposer(renderer,rt);composer.setPixelRatio(Math.min(devicePixelRatio,2));
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.0,0.35,0.9);composer.addPass(bloom);
composer.addPass(new OutputPass());
composer.addPass(new ShaderPass({uniforms:{tDiffuse:{value:null},amt:{value:0.26}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float amt;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float v=1.0-smoothstep(0.3,0.9,length(vUv-0.5));c.rgb*=mix(1.0-amt,1.0,v);gl_FragColor=c;}'}));

// The city group is rotated so that world -Z is true north and world +X is true east.
const city=new THREE.Group();city.rotation.y=-GEO.bearing*Math.PI/180;scene.add(city);city.updateMatrixWorld(true);
const W=(u,y,v)=>city.localToWorld(new THREE.Vector3(u,y,-v));
const CTX=new THREE.Group();city.add(CTX);

/* ============================ landmark builder ============================ */
const LM={},LMS=[],PICK=[],LABELS=[];
const isLit=m=>m.userData.nightE!==undefined||m.userData.flood||m.userData.ad;
function stamp(c){c.userData.wasT=c.transparent;c.userData.wasO=c.opacity;c.userData.wasS=c.side;c.userData.wasD=c.depthWrite;return c}
class Bld{
  constructor(L){this.L=L;this.root=new THREE.Group();this.shell=new THREE.Group();this.root.add(this.shell);this.tiers=[];this.parts=[];this.mats=new Map();this.own=[];this.since=0}
  m(mat){let c=this.mats.get(mat);if(!c){c=stamp(mat.clone());if(isLit(mat))FACADE_MATS.push(c);this.mats.set(mat,c)}return c}
  add(mesh){ensureColor(mesh.geometry);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.lm=this.L.id;if(this.since)mesh.userData.since=this.since;this.shell.add(mesh);PICK.push(mesh);return mesh}
  part(bot,y0,y1,to){this.parts.push({bot,to,y0,y1})}
  tier(bot,y0,y1,mat,o={}){const out={};prismInto(out,bot,y0,y1,o);const mats=[this.m(mat),this.m(o.roof||M.roof),...(o.extra||[]).map(x=>this.m(x))];const mesh=new THREE.Mesh(groupGeo(out),mats);this.add(mesh);
    this.part(bot,y0,y1,o.to);if(!o.noFloors)this.tiers.push({bot,to:o.to||bot,y0,y1,fh:o.fh});return mesh}
  pyr(bot,y0,y1,mat,k=0.05){const c=centroid(bot);return this.tier(bot,y0,y1,mat,{to:bot.map(([x,z])=>[c[0]+(x-c[0])*k,c[1]+(z-c[1])*k]),noFloors:true,roof:mat})}
  plate(bot,y,mat){const out={};prismInto(out,bot,y,y+0.3,{capMat:0});const mesh=new THREE.Mesh(bufGeo(out[0]),this.m(mat));this.add(mesh);mesh.castShadow=false;return mesh}
  box(w,h,d,x,y,z,mat,ry=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.m(mat));mesh.position.set(x,y+h/2,z);mesh.rotation.y=ry;return this.add(mesh)}
  cyl(rt,rb,h,x,y,z,mat,seg=16){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),this.m(mat));mesh.position.set(x,y+h/2,z);return this.add(mesh)}
  cone(r,h,x,y,z,mat,seg=8){const mesh=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),this.m(mat));mesh.position.set(x,y+h/2,z);mesh.rotation.y=Math.PI/seg;return this.add(mesh)}
  sphere(r,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),this.m(mat));mesh.position.set(x,y,z);return this.add(mesh)}
  strut(a,b,r,mat){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,A.distanceTo(B),10),this.m(mat));mesh.position.copy(A).add(B).multiplyScalar(0.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());return this.add(mesh)}
  faceBox(w,h,d,x,y,z,faces){const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    const mats=faces.map((f,i)=>{if(f.isMaterial)return this.m(f);const m=f.mat.clone();for(const k of ['map','roughnessMap','metalnessMap','bumpMap','emissiveMap'])if(m[k]){const t=m[k].clone();t.repeat.set(dims[i][0]/f.set.tile[0],dims[i][1]/f.set.tile[1]);t.needsUpdate=true;m[k]=t}stamp(m);FACADE_MATS.push(m);this.own.push(m);return m});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);mesh.position.set(x,y+h/2,z);return this.add(mesh)}
  allMats(){return[...this.mats.values(),...this.own]}
}
function buildLandmarks(){
  for(const L of DEF){const B=new Bld(L);L.bld=B;L.build(B);L.box=new THREE.Box3().setFromObject(B.shell);B.root.position.set(L.u,0,-L.v);city.add(B.root);LM[L.id]=L;LMS.push(L);L.root=B.root;L.ll=toLL(L.u,L.v);L.I=L.I||{};
    if(!L.lots)L.lots=[[L.u+L.box.min.x-2,L.u+L.box.max.x+2,L.v-L.box.max.z-2,L.v-L.box.min.z+2]];
    const d=document.createElement('div');d.className='lbl'+(L.ghost?' ghost':'')+(L.tier===2?' minor':'');d.textContent=L.name;d.onclick=e=>{e.stopPropagation();select(L.id,true)};
    const lo=new CSS2DObject(d);const c=L.box.getCenter(new THREE.Vector3());const top=L.tier===1||L.ghost?Math.max(L.box.max.y,0):Math.min(L.box.max.y,L.h);
    lo.position.set(L.id==='rock'?15:L.id==='hy'?46:L.id==='tsq'?72:c.x*0.3,top+6,L.id==='hy'||L.id==='rock'||L.id==='tsq'?0:c.z*0.3);lo.userData.want=true;lo.userData.L=L;B.root.add(lo);L.label=lo;L.labelEl=d;LABELS.push(lo)}
}

/* ============================ ground, water, park ============================ */
const groundMats=[];let farMat;
function addPlane(u0,u1,v0,v1,y,mat,parent=city){const g=new THREE.PlaneGeometry(u1-u0,v1-v0);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(u1-u0),uv.getY(i)*(v1-v0));const m=new THREE.Mesh(g,mat);m.rotation.x=-Math.PI/2;m.position.set((u0+u1)/2,y,-(v0+v1)/2);m.receiveShadow=true;parent.add(m);return m}
function slab(poly,y0,y1,mat,cast=false){const o=prismInto({},poly,y0,y1,{capMat:0});const m=new THREE.Mesh(bufGeo(o[0]),mat);m.receiveShadow=true;m.castShadow=cast;city.add(m);return m}
function waterNormal(){const n=256,cv=document.createElement('canvas');cv.width=cv.height=n;const c=cv.getContext('2d'),im=c.createImageData(n,n),k=2*Math.PI/n;
  const h=(x,y)=>Math.sin(k*(3*x+y))+0.6*Math.sin(k*(7*x-5*y)+1)+0.4*Math.sin(k*(-11*x+13*y)+2)+0.25*Math.sin(k*(23*x+17*y)+4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(h(x+1,y)-h(x-1,y))*1.4,dy=(h(x,y+1)-h(x,y-1))*1.4,l=Math.hypot(dx,dy,1),i=(y*n+x)*4;im.data[i]=(-dx/l*0.5+0.5)*255;im.data[i+1]=(-dy/l*0.5+0.5)*255;im.data[i+2]=(1/l*0.5+0.5)*255;im.data[i+3]=255}
  c.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(330,330);return t}
const inPark=(u,v)=>u>-846&&u<-13&&v>vS(59)+13;
const PARKW=[[-200,-60,2045,2130],[-560,-260,3080,3330],[-700,-150,4350,4950]];
const PARKOPEN=[[-700,-470,2430,2700],[-760,-560,2150,2330],[-520,-280,3900,4150],[-245,-155,2185,2255]];
function buildBase(){
  M.water=new THREE.MeshStandardMaterial({color:0x1b3442,roughness:0.14,metalness:0.6,normalMap:waterNormal(),normalScale:new THREE.Vector2(0.08,0.08)});
  const w=new THREE.Mesh(new THREE.PlaneGeometry(60000,60000),M.water);w.rotation.x=-Math.PI/2;w.position.y=-2.2;scene.add(w);
  groundMats.push(M.asphalt,M.side,M.grass);
  // Manhattan between the Hudson bulkhead and the East River shore
  const land=[...SHORE_WPTS.map(([v,u])=>[u,-v]),...SHORE_PTS.slice().reverse().map(([v,u])=>[u,-v])];slab(land,-6,0,M.asphalt);
  // sidewalks: one raised pad per block
  const sw={};
  for(let n=5;n<96;n++){const v0=vS(n)+wS(n)/2,v1=vS(n+1)-wS(n+1)/2,vm=(v0+v1)/2;
    for(let i=0;i<AVES.length;i++){const u0=Math.max(AVES[i].u+AVES[i].w/2,shoreW(vm)+22),u1=i<AVES.length-1?AVES[i+1].u-AVES[i+1].w/2:shoreE(vm)-26;if(u1-u0<30)continue;if(inPark(u0+5,v0+5)&&inPark(u1-5,v0+5))continue;
      prismInto(sw,R(u1-u0,v1-v0,(u0+u1)/2,-vm),0,0.18,{capMat:0})}}
  const swm=new THREE.Mesh(bufGeo(sw[0]),M.side);swm.receiveShadow=true;city.add(swm);
  const bw={p:[],n:[],t:[],c:[]};for(let v=-900;v<2040;v+=40){const a=ub(v),b=ub(v+40);capInto(bw,[[a-12,-v],[a+12,-v],[b+12,-v-40],[b-12,-v-40]],0.22,1)}
  const bwm=new THREE.Mesh(bufGeo(bw),M.asphalt);bwm.receiveShadow=true;city.add(bwm);
  slab(CIRC(34,32,-859,-2012),0,0.26,M.side);
  // Central Park
  addPlane(-844,-15,vS(59)+15,7600,0.25,M.grass);
  const lawn=new THREE.MeshStandardMaterial({color:0x6c8647,roughness:1});
  for(const [u0,u1,v0,v1] of PARKOPEN.slice(0,3))slab(CIRC(1,24).map(([x,z])=>[(u0+u1)/2+x*(u1-u0)/2,-(v0+v1)/2+z*(v1-v0)/2]),0.25,0.34,lawn);
  for(const [u0,u1,v0,v1] of PARKW)slab(CIRC(1,20).map(([x,z])=>[(u0+u1)/2+x*(u1-u0)/2*(1+0.15*Math.sin(z*5)),-(v0+v1)/2+z*(v1-v0)/2]),0.25,0.36,M.pool);
  addPlane(-235,-165,2192,2248,0.4,M.ice);
  const path=new THREE.MeshStandardMaterial({color:0xb5ad9c,roughness:1});
  for(const u of [-806,-52])addPlane(u-4,u+4,2050,7500,0.31,path);addPlane(-806,-52,2046,2054,0.31,path);addPlane(-844,-15,2496,2506,0.31,path);addPlane(-336,-326,2590,2960,0.31,path);
  // Hudson piers and the carrier at Pier 86
  for(const v of [-420,-300,-180,-60,60,180,300,560,644,800,1090,1210,1330,1500,1700]){slab(R(215,26,SHORE_W-107,-v),-3,1.1,M.pier,true);if(rnd()<0.5)slab(R(150,18,SHORE_W-100,-v),1.1,8,M.roofL,true)}
  slab([[SHORE_W-250,-966-17],[SHORE_W-20,-966-17],[SHORE_W-8,-966],[SHORE_W-20,-966+17],[SHORE_W-250,-966+17],[SHORE_W-268,-966]],-2,14,M.hull,true);slab(R(40,9,SHORE_W-150,-966-10),14,30,M.hull,true);
  // Roosevelt Island, Queens and New Jersey as hazy backdrop
  farMat=new THREE.MeshStandardMaterial({color:0x8f8c86,roughness:0.95,vertexColors:true});
  const farLand=new THREE.MeshStandardMaterial({color:0x7d7f78,roughness:1});
  const far={},tall={};const fb=(u,v,sx,sz,h,o=far)=>prismInto(o,R(sx,sz,u,-v),0,h,{capMat:0});
  slab([[1700,-350],[1820,-600],[1850,-3300],[1760,-3700],[1690,-3300],[1670,-600]],-6,1.5,M.grass);
  for(let i=0;i<46;i++)fb(rr(1705,1800),rr(700,3200),rr(18,40),rr(30,70),rnd()<0.2?rr(45,70):rr(12,35));
  const EB=[[9500,2500],[3000,2150],[0,2090],[-800,2250],[-1700,2900],[-3200,3050],[-4600,1750],[-5700,1250],[-9000,1000]];const eastEdge=v=>{for(let i=0;i<EB.length-1;i++)if(v<=EB[i][0]&&v>=EB[i+1][0]){const t=(v-EB[i][0])/(EB[i+1][0]-EB[i][0]);return EB[i][1]+(EB[i+1][1]-EB[i][1])*t}return 2500};
  slab([...EB.map(([v,u])=>[u,-v]),[14000,9000],[14000,-9500]],-6,1.2,farLand);slab(R(11000,19000,-3260-5500,-500),-6,1.2,farLand);
  slab(R(520,19000,-3700,-500),1.2,48,new THREE.MeshStandardMaterial({color:0x545a48,roughness:1}));
  for(let i=0;i<2600;i++){const q=rnd()<0.55;const v=rr(-8500,9000),u=q?eastEdge(v)+40+Math.pow(rnd(),1.4)*5500:rr(-8000,-3290);const onRidge=!q&&u<-3440&&u>-3960;const s=rr(22,60);
    const tl=q&&u<eastEdge(v)+700&&v>100&&v<1700&&rnd()<0.2;if(tl)fb(u,v,rr(28,40),rr(28,40),rr(90,230),tall);else fb(u,v,s,s*rr(0.6,1.5),(rnd()<0.05?rr(40,90):rr(8,26))+(onRidge?48:0))}
  // Manhattan south of the detailed area, ending in the downtown skyline about 5 km away
  for(let i=0;i<1500;i++){const v=rr(-5650,vS(5)-10),a=shoreW(v)+40,b=shoreE(v)-40;if(b-a<60)continue;const u=rr(a,b),s=rr(22,55);fb(u,v,s,s*rr(0.6,1.4),rnd()<0.06?rr(45,110):rr(12,34))}
  for(let i=0;i<70;i++){const v=rr(-5550,-4250),u=rr(Math.max(-560,shoreW(v)+60),Math.min(420,shoreE(v)-60));fb(u,v,rr(30,50),rr(30,50),rr(110,290),tall)}
  fb(-208,-4654,58,58,417,tall);fb(-208,-4654,5,5,541,tall);fb(-330,-4560,50,50,329,tall);fb(-120,-4720,48,48,298,tall);
  const fm=new THREE.Mesh(bufGeo(far[0]),farMat);city.add(fm);const tm=new THREE.Mesh(bufGeo(tall[0]),farMat);tm.userData.start=1972;tm.userData.end=9999;CTX.add(tm);
  // Queensboro Bridge (1909), heavily simplified
  const qb=new THREE.Group(),vq=vS(59.6),zq=-vq;const deck=new THREE.Mesh(new THREE.BoxGeometry(1420,3.5,27),M.steelDark);deck.position.set(838+710,40,zq);qb.add(deck);
  const stone=new THREE.MeshStandardMaterial({color:0x8d8a83,roughness:0.9});const piers=[1400,1690,1830,2110];
  for(const u of piers){const p=new THREE.Mesh(new THREE.BoxGeometry(16,105,32),stone);p.position.set(u,50,zq);p.castShadow=true;qb.add(p)}
  const lp=[];const span=(a,b)=>{const n=24;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,y=t=>42+56*Math.abs(Math.cos(t*Math.PI));for(const z of [-13,13]){lp.push(a+(b-a)*t0,y(t0),zq+z,a+(b-a)*t1,y(t1),zq+z);if(i%2==0)lp.push(a+(b-a)*t0,y(t0),zq+z,a+(b-a)*t0,42,zq+z)}}};
  span(1040,1400);span(1400,1690);span(1690,1830);span(1830,2110);span(2110,2380);
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));qb.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x5d646b})));city.add(qb);
}
function buildTrees(){
  const tp=[];const blocked=(u,v)=>PARKW.concat(PARKOPEN).some(([a,b,c,d])=>{const x=(u-(a+b)/2)/((b-a)/2+6),y=(v-(c+d)/2)/((d-c)/2+6);return x*x+y*y<1})||Math.abs(u+806)<7||Math.abs(u+52)<7||Math.abs(v-2501)<8;
  for(let i=0;i<9000;i++){const u=rr(-838,-21),v=2032+Math.pow(rnd(),1.25)*4800;if(blocked(u,v))continue;tp.push([u,v,rr(0.8,1.5)])}
  for(let i=0;i<110;i++){const s=rnd()<0.5;tp.push([rr(-290,-124),s?rr(505,518):rr(604,618),rr(0.7,1)])}
  for(let i=0;i<260;i++)tp.push([rr(1705,1805),rr(450,3500),rr(0.6,1.1)]);
  for(let i=0;i<50;i++)tp.push([rr(1180,1280),rr(960,1090),rr(0.6,0.9)]);
  for(let n=10;n<70;n++)for(const a of AVES)for(let k=0;k<2;k++)if(rnd()<0.55){const u=a.u+(rnd()<0.5?-1:1)*(a.w/2+1.6),v=vS(n)+rr(14,66);if(!inPark(u,v)&&u<shoreE(v)-30&&u>shoreW(v)+20)tp.push([u,v,rr(0.4,0.65)])}
  const crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.6,1),new THREE.MeshStandardMaterial({roughness:0.95,flatShading:true}),tp.length);
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25,0.35,4,6),new THREE.MeshStandardMaterial({color:0x4b3a2c,roughness:1}),tp.length);
  const pal=['#c7772d','#d6a03c','#a44a2c','#6f7d35','#516b31','#b5862f','#8a5c2d','#59712f','#c9903a','#7d8a3a'];const mt=new THREE.Matrix4(),col=new THREE.Color(),q=new THREE.Quaternion(),e=new THREE.Euler();
  tp.forEach(([u,v,s],i)=>{e.set(0,rnd()*6,0);q.setFromEuler(e);mt.compose(new THREE.Vector3(u,7.2*s,-v),q,new THREE.Vector3(s*rr(0.85,1.25),s*rr(0.8,1.15),s*rr(0.85,1.25)));crown.setMatrixAt(i,mt);crown.setColorAt(i,col.set(pick(pal)));mt.compose(new THREE.Vector3(u,2*s,-v),q.identity(),new THREE.Vector3(s,s,s));trunk.setMatrixAt(i,mt)});
  crown.castShadow=true;crown.receiveShadow=true;city.add(crown,trunk);
}

/* ============================ context buildings ============================ */
const BUCKETS=new Map(),WT=new Map(),BILL=[];
const LIGHTROOF={gblue:1,ggreen:1,gsilver:1,gteal:1,white_brick:1,intl:1,pier:1};
function bucket(style,start,end){const k=style+'|'+start+'|'+end;if(!BUCKETS.has(k))BUCKETS.set(k,{style,start,end,out:{}});return BUCKETS.get(k)}
function styleFor(year,h){if(year<1945)return h>90?pick(['lime','brick_buff','brick_buff','brick_brown','lime']):pick(['brick_red','brick_red','brick_buff','brick_brown','lime','brick_buff']);
  if(year<1980)return h>100?pick(['intl','pier','pier','dark','gsilver','intl']):pick(['white_brick','white_brick','intl','brick_buff','pier']);
  return h>60?pick(['gblue','gblue','ggreen','gsilver','gteal','dark','pier']):pick(['white_brick','gblue','brick_buff','gsilver'])}
function addFiller(u0,u1,v0,v1,h,year,end=9999,style){
  const w=u1-u0,d=v1-v0,cu=(u0+u1)/2,cz=-(v0+v1)/2;style=style||styleFor(year,h);
  const b=bucket(style,Math.floor(year/10)*10,end),o={uOff:rnd()*20};
  const P=(sw,sd,y0,y1)=>prismInto(b.out,R(w*sw,d*sd,cu,cz),y0,y1,o);let topW=w,topD=d;
  if(year<1945&&h>55){const hs=[0,h*rr(0.45,0.6),h*rr(0.72,0.82)];if(h>120)hs.push(h*rr(0.88,0.93));hs.push(h);let s=1;
    for(let i=0;i<hs.length-1;i++){P(s,s,hs[i],hs[i+1]);topW=w*s;topD=d*s;s=Math.max(0.3,s*(1-rr(0.12,0.2)))}
    if(h>95&&rnd()<0.45){const k=Math.min(topW,topD)*0.8;prismInto(b.out,R(k,k,cu,cz),h,h+rr(8,18),{to:R(1,1,cu,cz),capMat:2,edgeMat:()=>2});return}}
  else if(year>=1945&&year<1980&&h>70&&rnd()<0.6){const ph=rr(12,28);P(1,1,0,ph);const al=w>d,sw=al?rr(0.78,0.95):rr(0.5,0.72),sd=al?rr(0.5,0.72):rr(0.78,0.95);P(sw,sd,ph,h);topW=w*sw;topD=d*sd}
  else if(year>=1980&&h>110){const r=rnd();if(r<0.35)prismInto(b.out,C(w,d,Math.min(w,d)*0.18,cu,cz),0,h,o);else if(r<0.7){const h1=h*rr(0.78,0.9);P(1,1,0,h1);P(0.82,0.82,h1,h);topW=w*0.82;topD=d*0.82}else P(1,1,0,h)}
  else P(1,1,0,h);
  if(year>=1950&&h>30&&rnd()<0.6)prismInto(b.out,R(topW*rr(0.3,0.5),topD*rr(0.3,0.5),cu+rr(-2,2),cz),h,h+rr(3,6.5),{capMat:1,edgeMat:()=>1});
  else if(year<1960&&h<130&&topW>9&&rnd()<0.5){const dec=Math.floor(year/10)*10,k=dec+'|'+end;if(!WT.has(k))WT.set(k,{start:dec,end,list:[]});WT.get(k).list.push([cu+rr(-topW/4,topW/4),h,cz+rr(-topD/5,topD/5)])}
}
function dens(u,v){const g=(cu,cv,su,sv)=>Math.exp(-(((u-cu)/su)**2)-(((v-cv)/sv)**2));
  let d=1.0*g(300,1050,290,620)+0.9*g(-330,1280,170,430)+0.8*g(-560,830,210,300)+0.65*g(-200,1890,620,120)+0.5*g(-560,-60,300,230)+0.5*g(640,1500,130,700)+0.45*g(-1300,650,420,80)+0.3*g(950,1200,250,1300)+0.32*g(60,-900,330,260)+0.25*g(-100,-1700,500,300)+0.07;
  if(u<-1134)d*=0.55;return Math.min(1,d)}
function buildFillers(){
  const excl=[[-905,-815,1972,2052]];for(const L of DEF)if(!L.ghost)for(const l of L.lots)excl.push(l);
  const hit=(u0,u1,v0,v1)=>excl.some(e=>u0<e[1]&&u1>e[0]&&v0<e[3]&&v1>e[2]);
  for(let n=5;n<92;n++){const v0=vS(n)+wS(n)/2+3,v1=vS(n+1)-wS(n+1)/2-3,mid=(v0+v1)/2,uptown=n>=59,farN=n>=72||n<24;
    for(let i=0;i<AVES.length;i++){const u0=Math.max(AVES[i].u+AVES[i].w/2+3,shoreW(mid)+26),u1=i<AVES.length-1?AVES[i+1].u-AVES[i+1].w/2-3:shoreE(mid)-30;if(u1-u0<28)continue;if(inPark(u0+5,v0+5)&&inPark(u1-5,v0+5))continue;
      let x=u0;while(x<u1-6){const near=(x-u0<45||u1-x<45);let w=near?rr(22,42):(farN?rr(16,34):rr(8,24));if(u1-(x+w)<9)w=u1-x;const a=x,b=x+w;x=b;
        const cu=(a+b)/2,dn=uptown?(near?0.28:0):dens(cu,mid);const merged=rnd()<0.06+0.4*dn*(near?1:0.45);
        for(const [r0,r1] of merged?[[v0,v1]]:[[v0,mid-0.3],[mid+0.3,v1]]){const ua=a+0.3,ubb=b-0.3;if(ubb-ua<7)continue;
          const vc=(r0+r1)/2,bc=ub(vc);if(vc<2040&&Math.abs(cu-bc)<(w/2+13))continue;if(hit(ua,ubb,r0,r1))continue;
          let h;if(uptown)h=near?28+rnd()*38+rnd()*rnd()*60:15+rnd()*8;
          else if(merged)h=38+rnd()*40+dn*Math.pow(rnd(),1.25)*175;else h=near?20+rnd()*26+dn*Math.pow(rnd(),1.7)*150:12+rnd()*12+dn*Math.pow(rnd(),3)*100;
          let year;if(h>150)year=1960+rnd()*63;else if(h>90)year=rnd()<0.42?1923+rnd()*9:1955+rnd()*67;else if(h>40)year=rnd()<0.6?1900+rnd()*38:1950+rnd()*65;else year=1880+rnd()*75;
          if(uptown&&h>40)year=rnd()<0.7?1910+rnd()*25:1955+rnd()*50;
          addFiller(ua,ubb,r0,r1,h,Math.floor(year));
          if(vc>650&&vc<1020&&Math.abs(cu-bc)<95&&h>18){const face=cu<bc?1:-1,bh=rr(7,16),y=rr(6,Math.max(7,Math.min(h-bh-2,30)));BILL.push({u:cu+face*(w/2-0.1),v:vc,y:y+bh/2,w:Math.min(rr(10,20),(r1-r0)*0.9),h:bh,face})}
        }}}}
  // older low-rise fabric that stood on landmark lots before the landmark was built
  for(const L of DEF){if(L.ghost||L.nopre||L.year<1900)continue;for(const [u0,u1,v0,v1] of L.lots){let x=u0+1;while(x<u1-6){let w=rr(10,22);if(u1-(x+w)<8)w=u1-x-1;
    const dd=v1-v0>70?[[v0+1,(v0+v1)/2-1],[(v0+v1)/2+1,v1-1]]:[[v0+1,v1-1]];for(const [a,b] of dd)addFiller(x+0.3,x+w-0.3,a,b,rr(14,36),1880+Math.floor(rnd()*20),L.preEnd||L.year,pick(['brick_red','brick_buff','brick_brown','lime']));x+=w}}}
  for(const b of BUCKETS.values()){b.mats=[M.F[b.style],LIGHTROOF[b.style]?M.roofL:M.roof,M.copper];const m=new THREE.Mesh(groupGeo(b.out),b.mats);m.castShadow=true;m.receiveShadow=true;m.userData.start=b.start;m.userData.end=b.end;b.mesh=m;CTX.add(m)}
  const tankG=new THREE.CylinderGeometry(2.1,2.1,4.2,12),roofG=new THREE.ConeGeometry(2.4,1.8,12),legG=new THREE.BoxGeometry(3.2,2.4,3.2);
  const tankM=new THREE.MeshStandardMaterial({color:0x6b5240,roughness:0.95}),roofM=new THREE.MeshStandardMaterial({color:0x3d3b39,roughness:0.8}),legM=new THREE.MeshStandardMaterial({color:0x2c2c2c,roughness:0.8});
  for(const w of WT.values()){const n=w.list.length,g=new THREE.Group(),it=new THREE.InstancedMesh(tankG,tankM,n),ir=new THREE.InstancedMesh(roofG,roofM,n),il=new THREE.InstancedMesh(legG,legM,n),mt=new THREE.Matrix4();
    w.list.forEach(([x,y,z],i)=>{mt.makeTranslation(x,y+4.5,z);it.setMatrixAt(i,mt);mt.makeTranslation(x,y+7.5,z);ir.setMatrixAt(i,mt);mt.makeTranslation(x,y+1.2,z);il.setMatrixAt(i,mt)});
    it.castShadow=true;g.add(it,ir,il);g.userData.start=w.start;g.userData.end=w.end;g.userData.wt=true;CTX.add(g)}
  const bg=new THREE.Group();bg.userData.start=1990;bg.userData.end=9999;bg.userData.wt=true;CTX.add(bg);
  for(const b of BILL){const m=new THREE.Mesh(new THREE.PlaneGeometry(b.w,b.h),pick(M.ads));m.position.set(b.u+b.face*0.3,b.y,-b.v);m.rotation.y=b.face>0?Math.PI/2:-Math.PI/2;bg.add(m)}
}

/* ============================ interiors (schematic) ============================ */
const KC={lobby:'#5fc6ff',obs:'#f2c14e',mech:'#ff8a3d',tmd:'#ff4d4d',amen:'#b48cff',hist:'#ff5fa2',retail:'#59e0a0'};
const KN={lobby:'Lobby / public',obs:'Observation',mech:'Plant / structure',tmd:'Damper',amen:'Amenity',hist:'History',retail:'Retail / transit'};
const ELEV=[];
function tierAt(L,y){for(const T of L.bld.tiers)if(y>=T.y0-0.01&&y<T.y1)return lerpPoly(T.bot,T.to,(y-T.y0)/(T.y1-T.y0));return null}
function buildInterior(L){
  const I=L.I,g=new THREE.Group();g.visible=false;L.root.add(g);L.interior=g;L.ilabels=[];const tiers=L.bld.tiers;
  const concrete=I.colMat==='concrete'||/concrete/i.test(L.struct||'')&&!/steel/i.test(L.struct||'');
  const sl={},lines=[];let floors=0;
  for(const T of tiers){const fh=T.fh||I.fh||4;for(let y=T.y0;y<T.y1-0.6;y+=fh){const p=insetPoly(lerpPoly(T.bot,T.to,(y-T.y0)/(T.y1-T.y0)),0.5);prismInto(sl,p,y,y+0.32,{bottom:true});for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];lines.push(a[0],y+0.34,a[1],b[0],y+0.34,b[1])}floors++}}
  if(sl[0]){const sm=new THREE.Mesh(groupGeo(sl),[new THREE.MeshStandardMaterial({color:0xd8d3ca,roughness:0.9}),new THREE.MeshStandardMaterial({color:0xe9e4db,roughness:0.9,side:THREE.DoubleSide})]);sm.castShadow=true;sm.receiveShadow=true;g.add(sm);
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x5e5a54})))}
  const col=I.col===undefined?8.5:I.col;
  if(col&&tiers.length){const cp=[];for(const T of tiers){const p=insetPoly(lerpPoly(T.bot,T.to,0.5),1.3);for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/col));for(let k=0;k<n;k++){const t=k/n;cp.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,T.y0,T.y1])}}}
    const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:concrete?0xbdb9b1:0xb4553b,roughness:0.7,metalness:concrete?0:0.4}),cp.length),mt=new THREE.Matrix4();
    cp.forEach(([x,z,y0,y1],i)=>{mt.compose(new THREE.Vector3(x,(y0+y1)/2,z),new THREE.Quaternion(),new THREE.Vector3(0.75,y1-y0,0.75));cm.setMatrixAt(i,mt)});cm.castShadow=true;g.add(cm);L.colKind=concrete?'Concrete columns':'Steel columns';L.colColor=concrete?'#bdb9b1':'#b4553b'}
  // core: taken from the data where given, otherwise sized from the tallest tier
  let c=I.core;
  if(!c&&!I.nocore&&tiers.length){let best=tiers[0];for(const T of tiers)if(T.y1>best.y1||(T.y1===best.y1&&Math.abs(polyArea(T.bot))>Math.abs(polyArea(best.bot))))best=T;
    let main=best;for(const T of tiers){const bb=polyBox(T.bot),tb=polyBox(best.bot);if(Math.abs(bb.cx-tb.cx)<tb.w/2+2&&Math.abs(bb.cz-tb.cz)<tb.d/2+2&&T.y1>100&&T.y0<main.y0)main=T}
    const tb=polyBox(best.to);c={w:Math.max(7,Math.min(30,tb.w*0.42)),d:Math.max(7,Math.min(30,tb.d*0.42)),x:tb.cx,z:tb.cz,y1:best.y1,auto:true}}
  if(c){const cx=c.x||0,cz=c.z||0,y0=c.y0||0,cg=new THREE.BoxGeometry(c.w,c.y1-y0,c.d);const core=new THREE.Mesh(cg,new THREE.MeshStandardMaterial({color:0x8f979e,transparent:true,opacity:0.28,depthWrite:false,roughness:0.8}));core.position.set(cx,(c.y1+y0)/2,cz);g.add(core);
    const el=new THREE.LineSegments(new THREE.EdgesGeometry(cg),new THREE.LineBasicMaterial({color:0x4f5a63}));el.position.copy(core.position);g.add(el);
    const n=I.shafts||clamp(Math.round(c.y1/22),2,20),nx=Math.max(1,Math.round(Math.sqrt(n*c.w/c.d))),nz=Math.max(1,Math.ceil(n/nx));
    const zones=I.zones||(c.y1>120?[[y0,c.y1*0.4],[y0,c.y1*0.72],[y0,c.y1]]:[[y0,c.y1]]);const cars=[],sl2=[];
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const k=ix*nz+iz;if(k>=n)break;const x=cx-c.w/2+(ix+0.5)*c.w/nx,z=cz-c.d/2+(iz+0.5)*c.d/nz,zn=zones[k%zones.length];sl2.push(x,zn[0],z,x,zn[1],z);cars.push({x,z,a:zn[0]+1,b:zn[1]-3,y:rr(zn[0],zn[1]-3),dir:rnd()<0.5?1:-1,sp:rr(5,9),wait:rnd()*3})}
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sl2,3));g.add(new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xffd34d,transparent:true,opacity:0.35})));
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(Math.min(2.6,c.w/nx*0.7),3,Math.min(2.6,c.d/nz*0.7)),new THREE.MeshStandardMaterial({color:0xffd34d,emissive:0xffa000,emissiveIntensity:0.8}),cars.length);g.add(im);ELEV.push({L,im,cars});L.hasCore=true}
  for(const s of I.special||[]){let p;if(s.box)p=R(s.box[0],s.box[1],s.x||0,s.z||0);else{p=tierAt(L,s.y+0.1);p=p?insetPoly(p,0.8):R(20,20)}
    const o=prismInto({},p,s.y,s.y+s.h,{bottom:true}),colr=new THREE.Color(KC[s.k]);
    const mm=new THREE.Mesh(groupGeo(o),new THREE.MeshBasicMaterial({color:colr,transparent:true,opacity:0.33,depthWrite:false,side:THREE.DoubleSide}));g.add(mm);
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(mm.geometry),new THREE.LineBasicMaterial({color:colr})));
    if(s.t){const d=document.createElement('div');d.className='ilbl';d.style.setProperty('--c',KC[s.k]);d.textContent=s.t;const lo=new CSS2DObject(d),cc=centroid(p);lo.position.set(cc[0],s.y+s.h/2,cc[1]);lo.center.set(-0.08,0.5);lo.userData.want=false;g.add(lo);L.ilabels.push(lo);LABELS.push(lo)}}
  if(L.id==='gct'){const fl=new THREE.Mesh(new THREE.PlaneGeometry(84,37),new THREE.MeshStandardMaterial({color:0xd8ccb2,roughness:0.35}));fl.rotation.x=-Math.PI/2;fl.position.y=0.3;g.add(fl);
    const ce=new THREE.Mesh(new THREE.PlaneGeometry(84,37),M.celestial.clone());ce.rotation.x=Math.PI/2;ce.position.y=36.5;g.add(ce);
    const bo=new THREE.Mesh(new THREE.CylinderGeometry(4,4,3.4,24),M.gold.clone());bo.position.y=1.9;g.add(bo);
    for(const [y,n,wd] of [[-10,41,100],[-18,26,70]]){const lp=[];for(let i=0;i<n;i++){const x=-wd/2+i*wd/(n-1);lp.push(x,y,40,x,y,-420)}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xc9c2b4})));
      for(let i=0;i<n;i+=2){const pl=new THREE.Mesh(new THREE.BoxGeometry(wd/(n-1)*0.7,1,300),new THREE.MeshStandardMaterial({color:0x9a958c}));pl.position.set(-wd/2+(i+0.5)*wd/(n-1),y+0.5,-110);g.add(pl)}}}
  if(I.walls){for(const T of tiers){const d=Math.abs(T.bot[2][1]-T.bot[0][1]),cz=(T.bot[2][1]+T.bot[0][1])/2;for(const sx of [-1,1]){const wl=new THREE.Mesh(new THREE.BoxGeometry(1.4,T.y1-T.y0,d-1),new THREE.MeshStandardMaterial({color:0xa9b0b6,transparent:true,opacity:0.55,depthWrite:false}));wl.position.set(sx*8.2,(T.y0+T.y1)/2,cz);g.add(wl)}}
    const d=document.createElement('div');d.className='ilbl';d.style.setProperty('--c','#9fb3c4');d.textContent='Concrete shear walls on the east and west sides';const lo=new CSS2DObject(d);lo.position.set(9,160,0);lo.center.set(-0.08,0.5);lo.userData.want=false;g.add(lo);L.ilabels.push(lo);LABELS.push(lo)}
  L.floorsModel=floors;
}

/* ============================ traffic & street lights ============================ */
const TR={cars:[]};let STREET;
function streetSegs(n){return n>=60?[[-1930,-862],[2,1067]]:[[Math.max(-1930,shoreW(vS(n))+30),1067]]}
function aveRange(a){if(a.n==='6th'||a.n==='7th')return[[-2200,2005]];if(a.n==='Park')return[[-1600,vS(40)+6],[vS(46)+12,2900]];if(a.n==='12th')return[[-900,2300]];if(a.n==='11th')return[[-1500,2900]];return[[-2200,2900]]}
function buildTraffic(){
  const lanes=[],dirs={'12th':0,'11th':-1,'10th':1,'9th':-1,'8th':1,'7th':-1,'6th':1,'5th':-1,Madison:1,Park:0,Lexington:-1,'3rd':1,'2nd':-1,'1st':1};
  for(const a of AVES)for(const [mn,mx] of aveRange(a)){const d=dirs[a.n],hw=a.w/2-4;if(d===0)for(const o of [-hw,-hw+5,hw-5,hw])lanes.push({ax:'v',c:a.u+o,min:mn,max:mx,dir:o<0?-1:1});else for(const o of [-8,-3,3,8])lanes.push({ax:'v',c:a.u+o,min:mn,max:mx,dir:d})}
  for(let n=14;n<68;n++)for(const [mn,mx] of streetSegs(n)){if([34,42,57].includes(n))for(const o of [-9,-4,4,9])lanes.push({ax:'u',c:vS(n)+o,min:mn,max:mx,dir:o<0?-1:1});else lanes.push({ax:'u',c:vS(n)+(n%2?-3:3),min:mn,max:mx,dir:n%2?-1:1,sparse:true})}
  for(const l of lanes){const len=l.max-l.min,cnt=Math.floor(len/(l.sparse?240:55)*rr(0.7,1.2));for(let i=0;i<cnt;i++)TR.cars.push({l,p:l.min+rnd()*len,sp:rr(7,14)*(l.sparse?0.7:1)})}
  const n=TR.cars.length;TR.im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,1.5,4.6),new THREE.MeshStandardMaterial({roughness:0.35,metalness:0.4}),n);
  const cols=['#f2c230','#f2c230','#f2c230','#1d1f22','#e6e6e6','#7c8288','#2d3e57','#8b1d1d','#3a3d40'],col=new THREE.Color();for(let i=0;i<n;i++)TR.im.setColorAt(i,col.set(pick(cols)));city.add(TR.im);
  const mk=c=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*6),3));const p=new THREE.Points(g,new THREE.PointsMaterial({color:c,size:2.6,sizeAttenuation:true,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));p.frustumCulled=false;city.add(p);return p};
  TR.head=mk(new THREE.Color(3,2.8,2.3));TR.tail=mk(new THREE.Color(3,0.2,0.12));
  const lp=[];for(const a of AVES)for(const [mn,mx] of aveRange(a))for(const o of [-a.w/2+1.5,a.w/2-1.5])lp.push(a.u+o,0.4,-mn,a.u+o,0.4,-mx);
  for(let n=8;n<72;n++){const v=vS(n);for(const o of [-wS(n)/2+1.2,wS(n)/2-1.2])for(const [a,b] of streetSegs(n))lp.push(a,0.4,-(v+o),b,0.4,-(v+o))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));STREET=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:new THREE.Color(1.6,1.05,0.5),transparent:true,opacity:0,toneMapped:false,depthWrite:false}));city.add(STREET);
}
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_qU=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
function updateTraffic(dt){if(!TR.im.visible)return;const hp=TR.head.geometry.attributes.position.array,tp=TR.tail.geometry.attributes.position.array;
  TR.cars.forEach((c,i)=>{const l=c.l;c.p+=c.sp*dt*l.dir;if(c.p>l.max)c.p=l.min;if(c.p<l.min)c.p=l.max;let x,z,fx,fz;if(l.ax==='v'){x=l.c;z=-c.p;fx=0;fz=-l.dir}else{x=c.p;z=-l.c;fx=l.dir;fz=0}
    _v.set(x,0.95,z);_m4.compose(_v,l.ax==='v'?_q.identity():_qU,_s);TR.im.setMatrixAt(i,_m4);const j=i*6,ox=fz?0.6:0,oz=fx?0.6:0;
    hp[j]=x+fx*2.4+ox;hp[j+1]=0.9;hp[j+2]=z+fz*2.4+oz;hp[j+3]=x+fx*2.4-ox;hp[j+4]=0.9;hp[j+5]=z+fz*2.4-oz;
    tp[j]=x-fx*2.4+ox;tp[j+1]=0.9;tp[j+2]=z-fz*2.4+oz;tp[j+3]=x-fx*2.4-ox;tp[j+4]=0.9;tp[j+5]=z-fz*2.4-oz});
  TR.im.instanceMatrix.needsUpdate=true;TR.head.geometry.attributes.position.needsUpdate=true;TR.tail.geometry.attributes.position.needsUpdate=true}

/* ============================ sky, sun, time ============================ */
// Gradient sky with a sun glow. The fog takes the horizon colour, so distant land dissolves into the sky.
const skyU={zen:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunCol:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},glow:{value:0}};
const mkSky=r=>new THREE.Mesh(new THREE.SphereGeometry(r,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform vec3 zen,hor,sunCol,sunDir;uniform float glow;varying vec3 vDir;
   void main(){vec3 d=normalize(vDir);float h=clamp(d.y,0.0,1.0);vec3 c=mix(zen,hor,pow(1.0-h,3.2));
   float s=max(dot(d,sunDir),0.0);float az=max(dot(normalize(d.xz+1e-5),normalize(sunDir.xz+1e-5)),0.0);
   c+=sunCol*glow*(pow(az,3.0)*pow(1.0-h,6.0)*0.9+pow(s,10.0)*0.35);c+=sunCol*pow(s,900.0)*14.0;
   if(d.y<0.0)c=mix(hor,hor*0.55,clamp(-d.y*5.0,0.0,1.0));gl_FragColor=vec4(c,1.0);}`}));
const sky=mkSky(42000);sky.frustumCulled=false;scene.add(sky);
const envScene=new THREE.Scene();envScene.add(mkSky(5000));
const pmrem=new THREE.PMREMGenerator(renderer);let envRT=null,envTimer=null;
const sun=new THREE.DirectionalLight(0xffffff,3);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
{const sc=sun.shadow.camera;sc.left=-2100;sc.right=2100;sc.top=2100;sc.bottom=-2100;sc.near=100;sc.far=11000;sun.shadow.bias=-0.0004;sun.shadow.normalBias=1.4}
scene.add(sun);const sunTarget=new THREE.Object3D();scene.add(sunTarget);sun.target=sunTarget;
const hemi=new THREE.HemisphereLight(0xbfd6ff,0x4a4036,0.6);scene.add(hemi);
scene.fog=new THREE.Fog(0xb7c6d3,5200,23000);
const stars=(()=>{const n=2500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.asin(Math.random()*0.98+0.02);p[i*3]=Math.cos(a)*Math.cos(e)*30000;p[i*3+1]=Math.sin(e)*30000;p[i*3+2]=Math.sin(a)*Math.cos(e)*30000}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(s);return s})();
let NIGHT=0;
function applyTime(h){
  const el=58*Math.sin(Math.PI*(h-6.3)/12.4),az=(90+(h-6)*15)*Math.PI/180,er=el*Math.PI/180;
  const dir=new THREE.Vector3(Math.sin(az)*Math.cos(er),Math.sin(er),-Math.cos(az)*Math.cos(er));
  skyU.sunDir.value.copy(dir);
  const c=W(-200,0,950);sunTarget.position.copy(c);sun.position.copy(c).addScaledVector(dir,6000);
  NIGHT=smooth(2,-9,el);const dusk=smooth(30,4,el)*(1-NIGHT);
  sun.intensity=4.3*smooth(-1,14,el);sun.color.setRGB(1,1-0.36*dusk,1-0.66*dusk);
  hemi.intensity=0.36+0.06*(1-NIGHT);hemi.color.setRGB(0.84-0.5*NIGHT,0.89-0.48*NIGHT,1-0.4*NIGHT);hemi.groundColor.setRGB(0.3*(1-NIGHT)+0.06,0.26*(1-NIGHT)+0.05,0.22*(1-NIGHT)+0.06);
  const day=1-NIGHT,L3=(a,b,c)=>new THREE.Color().setRGB(...a).lerp(new THREE.Color().setRGB(...b),dusk).lerp(new THREE.Color().setRGB(...c),NIGHT);
  skyU.zen.value.copy(L3([0.13,0.33,0.86],[0.15,0.29,0.70],[0.006,0.010,0.028]));skyU.hor.value.copy(L3([0.74,0.90,1.12],[1.08,0.84,0.66],[0.035,0.045,0.085]));
  skyU.sunCol.value.setRGB(1,0.62+0.3*(1-dusk),0.34+0.56*(1-dusk)).multiplyScalar(day);skyU.glow.value=0.35+dusk*1.5;
  scene.fog.color.copy(skyU.hor.value).multiplyScalar(0.9);
  renderer.toneMappingExposure=0.6+NIGHT*0.05;stars.material.opacity=NIGHT;
  for(const m of FACADE_MATS){if(m.userData.ad){m.emissiveIntensity=0.55+NIGHT*1.5;continue}if(m.userData.flood)continue;m.emissiveIntensity=NIGHT*(m.userData.nightE??1)}
  if(STREET)STREET.material.opacity=NIGHT*0.55;if(TR.head){TR.head.material.opacity=NIGHT;TR.tail.material.opacity=NIGHT}
  bloom.strength=NIGHT*0.55;bloom.enabled=NIGHT>0.02;
  clearTimeout(envTimer);envTimer=setTimeout(()=>{const n=pmrem.fromScene(envScene,0,1,20000);scene.environmentIntensity=1;if(envRT)envRT.dispose();envRT=n;scene.environment=n.texture},60);
  const hh=Math.floor(h),mm=Math.floor((h-hh)*60);$('#timeV').textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function updateFlood(t){for(const m of FACADE_MATS){const f=m.userData.flood;if(!f)continue;if(f==='esb'){const hsl=[[0,0,0.85],[0.6,0.85,0.5],[0.0,0.85,0.5],[0.12,0.9,0.55],[0.33,0.7,0.45]];m.emissive.setHSL(...hsl[Math.floor((t*0.05)%1*hsl.length)]);m.emissiveIntensity=NIGHT*0.5}else{m.emissive.setRGB(1,0.96,0.9);m.emissiveIntensity=NIGHT*0.32}}}

/* ============================ year filter ============================ */
let YEAR=2026;
const EVENTS=[[1891,'Carnegie Hall opens'],[1897,'The combined Waldorf-Astoria is the largest hotel in the world'],[1904,'The Times moves to Longacre Square, renamed Times Square'],[1907,'The Plaza opens'],[1910,'Pennsylvania Station opens'],[1911,'New York Public Library opens'],[1913,'Grand Central Terminal opens; the tracks go underground'],[1929,'Chrysler\'s spire is raised in secret; the old Waldorf is demolished'],[1930,'Chrysler Building opens as the world\'s tallest'],[1931,'Empire State Building opens'],[1933,'30 Rockefeller Plaza is completed'],[1945,'A B-25 bomber hits the Empire State Building'],[1952,'UN Headquarters and Lever House: the glass slab arrives'],[1958,'Seagram Building sets the model for the modern plaza tower'],[1963,'Pan Am Building opens; demolition of Penn Station begins'],[1968,'Madison Square Garden and the GM Building open'],[1977,'Citicorp Center opens on four stilts'],[1978,'Supreme Court ruling saves Grand Central'],[1984,'AT&T Building: postmodernism on Madison Avenue'],[2007,'New York Times Building opens; the Drake Hotel is demolished'],[2009,'Bank of America Tower, first LEED Platinum skyscraper'],[2014,'One57 starts Billionaires\' Row'],[2015,'432 Park Avenue is completed'],[2019,'Hudson Yards opens; Union Carbide demolition begins'],[2020,'One Vanderbilt and Central Park Tower'],[2021,'111 West 57th Street is completed'],[2025,'270 Park Avenue opens']];
function applyYear(y){YEAR=y;$('#yearV').textContent=y;
  for(const L of LMS){const vis=y>=L.year&&(!L.end||y<L.end);L.root.visible=vis;L.label.userData.want=vis;for(const m of L.bld.shell.children)if(m.userData.since)m.visible=y>=m.userData.since;const it=document.querySelector(`.item[data-id="${L.id}"]`);if(it)it.classList.toggle('dim',!vis)}
  for(const o of CTX.children)if(o.userData.start!==undefined)o.visible=y>=o.userData.start&&y<o.userData.end&&!((XALL||SLICE)&&o.userData.wt);
  const ev=$('#events');if(y<2026&&!SLICE){const near=EVENTS.filter(e=>e[0]<=y&&e[0]>y-12).slice(-2);ev.style.display=near.length?'block':'none';ev.innerHTML=near.map(e=>`<div><b>${e[0]}</b>${e[1]}</div>`).join('')}else ev.style.display='none';
}

/* ============================ see-through state ============================ */
let SEL=null,TAB='overview',SECTION=false,XRAY=false,CUT=0.55,AXIS='auto',XALL=false,SLICE=false,SLICEAX='v',SLICEPOS=0.45;
const clipPlane=new THREE.Plane(),gPlane=new THREE.Plane();
function updatePlane(L){const b=L.box;L.root.updateMatrixWorld();const cl=L.root.worldToLocal(camera.position.clone());const ax=AXIS==='auto'?(Math.abs(cl.x)>=Math.abs(cl.z)?'x':'z'):AXIS,sgn=(ax==='x'?cl.x:cl.z)>=0?1:-1;
  const lo=ax==='x'?b.min.x:b.min.z,hi=ax==='x'?b.max.x:b.max.z,pos=sgn>0?lo-1+(hi-lo+2)*CUT:hi+1-(hi-lo+2)*CUT;
  const n=(ax==='x'?new THREE.Vector3(-sgn,0,0):new THREE.Vector3(0,0,-sgn)).transformDirection(L.root.matrixWorld),p=L.root.localToWorld(ax==='x'?new THREE.Vector3(pos,0,0):new THREE.Vector3(0,0,pos));clipPlane.setFromNormalAndCoplanarPoint(n,p)}
function updateGPlane(){const cl=city.worldToLocal(camera.position.clone());let n,p;
  if(SLICEAX==='v'){const v=-560+SLICEPOS*3300,s=(-cl.z)<v?1:-1;n=new THREE.Vector3(0,0,-s);p=new THREE.Vector3(0,0,-v)}else{const u=-2000+SLICEPOS*3400,s=cl.x<u?1:-1;n=new THREE.Vector3(s,0,0);p=new THREE.Vector3(u,0,0)}
  gPlane.setFromNormalAndCoplanarPoint(n.transformDirection(city.matrixWorld),city.localToWorld(p))}
const modeOf=L=>XALL||(SEL===L.id&&XRAY)?'x':(SEL===L.id&&SECTION)?'cut':'n';
function refresh(){
  for(const L of LMS){const mode=modeOf(L),key=mode+(SLICE?'s':'');const need=mode!=='n'||SLICE;if(need&&!L.interior)buildInterior(L);
    if(L._key!==key||(L.interior&&!L._ik)){L._key=key;L._ik=!!L.interior;const cpl=mode==='cut'?(SLICE?[clipPlane,gPlane]:[clipPlane]):(SLICE?[gPlane]:null);for(const m of L.bld.allMats()){const u=m.userData;
        if(mode==='x'){m.transparent=true;m.opacity=0.1;m.depthWrite=false;m.side=u.wasS}
        else{m.transparent=u.wasT;m.opacity=u.wasO;m.depthWrite=u.wasD;m.side=mode==='cut'||SLICE?THREE.DoubleSide:u.wasS}m.clippingPlanes=cpl;m.needsUpdate=true}
      if(L.interior){L.interior.visible=need;L.interior.traverse(o=>{if(!o.material)return;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.clippingPlanes=cpl;m.needsUpdate=true}})}}
    for(const lo of L.ilabels||[])lo.userData.want=need&&SEL===L.id}
  for(const b of BUCKETS.values())b.mesh.material=XALL?[M.xray,M.xrayRoof,M.xrayRoof]:b.mats;
  for(const m of [...Object.values(M.F),M.roof,M.roofL,M.copper,M.xray,M.xrayRoof])if(m.userData._sl!==SLICE){m.userData._sl=SLICE;m.clippingPlanes=SLICE?[gPlane]:null;if(m.userData.nightE!==undefined)m.side=SLICE?THREE.DoubleSide:THREE.FrontSide;m.needsUpdate=true}
  const L=SEL&&LM[SEL],under=L&&L.I.underground&&modeOf(L)!=='n';for(const m of groundMats){if(m.transparent!==!!under){m.transparent=!!under;m.opacity=under?0.35:1;m.depthWrite=!under;m.needsUpdate=true}}
  if(L&&modeOf(L)==='cut')updatePlane(L);if(SLICE)updateGPlane();
  for(const o of CTX.children)if(o.userData.wt)o.visible=!XALL&&!SLICE&&YEAR>=o.userData.start&&YEAR<o.userData.end;
  $('#slice').style.display=SLICE?'flex':'none';$('#sliceLbl').textContent=SLICEAX==='v'?'Cut along a street':'Cut along an avenue';
}

/* ============================ georeferenced export ============================ */
const r2=x=>Math.round(x*100)/100;
function ring(L,poly){const pts=poly.map(([x,z])=>toLL(L.u+x,L.v-z).map(n=>+n.toFixed(7)));let a=0;for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;a+=pts[i][0]*pts[j][1]-pts[j][0]*pts[i][1]}if(a<0)pts.reverse();pts.push(pts[0]);return[pts]}
function geojson(ids,withGhosts=false){const F=[];
  for(const L of LMS){if(ids?!ids.includes(L.id):(L.ghost&&!withGhosts))continue;
    F.push({type:'Feature',properties:{id:L.id,kind:'landmark',name:L.name,name_zh:L.zh,address:L.addr,year_built:L.year,...(L.end?{year_demolished:L.end}:{}),height_m:L.h,floors:L.floors,architect:L.arch,structure:L.struct,facade:L.facade,model_heading_deg:GEO.bearing},geometry:{type:'Point',coordinates:L.ll.map(n=>+n.toFixed(7))}});
    L.bld.parts.forEach((p,i)=>F.push({type:'Feature',properties:{id:L.id,kind:'part',name:L.name,part:i,base_height:r2(p.y0),height:r2(p.y1),min_height:r2(p.y0),tapered:!!p.to,year_built:L.year,...(L.end?{year_demolished:L.end}:{})},geometry:{type:'Polygon',coordinates:ring(L,p.bot)}}))}
  return{type:'FeatureCollection',name:'midtown_manhattan_landmarks',description:'Approximate footprints by building part with base_height and height in metres above local ground. WGS84 lon/lat. Positions are derived from the street grid: about 30 m from published coordinates on average, 60 m at worst. Ground elevation is not included.',features:F}}
async function copyText(t,btn){const old=btn.textContent;try{await navigator.clipboard.writeText(t);btn.textContent='Copied'}catch(e){btn.textContent='Copy blocked here'}setTimeout(()=>btn.textContent=old,1600)}

/* ============================ UI ============================ */
const selRing=new THREE.Mesh(new THREE.RingGeometry(1,1.07,96),new THREE.MeshBasicMaterial({color:0xd8b56d,transparent:true,opacity:0.8,depthWrite:false,side:THREE.DoubleSide,fog:false}));selRing.rotation.x=-Math.PI/2;selRing.visible=false;city.add(selRing);
const VIEWS={hudson:{n:'Hudson, golden hour',p:[-3250,690,-1050],t:[-150,150,1000],time:17.2},park:{n:'Over Central Park',p:[-470,560,3700],t:[-230,150,1650],time:15.4},east:{n:'East River, morning',p:[2500,330,250],t:[250,150,950],time:8.4},south:{n:'From downtown, dusk',p:[60,480,-1900],t:[-40,170,700],time:18.25},night:{n:'Night',p:[-3100,640,-1200],t:[-250,150,950],time:20.6}};
let FLY=null;
function goView(k){const V=VIEWS[k];FLY={t:0,p0:camera.position.clone(),t0:controls.target.clone(),p1:W(...V.p),t1:W(...V.t)};$('#time').value=V.time;applyTime(V.time)}
function renderList(){const mx=480,a=LMS.filter(l=>l.tier===1).sort((x,y)=>y.h-x.h),b=LMS.filter(l=>l.tier===2).sort((x,y)=>y.h-x.h),g=LMS.filter(l=>l.ghost);
  const it=L=>`<div class="item${L.ghost?' ghost':''}${L.tier===2?' t2':''}${SEL===L.id?' sel':''}" data-id="${L.id}" tabindex="0"><div class="n">${L.name}</div><div class="y">${L.year}${L.end?'-'+L.end:''} · ${L.h} m</div><div class="bar"><i style="width:${Math.max(4,L.h/mx*100)}%"></i></div></div>`;
  $('#list').innerHTML=`<h3>Views</h3><div id="views">${Object.entries(VIEWS).map(([k,v])=>`<button class="btn" data-v="${k}">${v.n}</button>`).join('')}</div><h3>Featured, by height</h3>${a.map(it).join('')}<h3>Also modelled</h3>${b.map(it).join('')}<h3>Vanished (move the year slider)</h3>${g.map(it).join('')}`;
  document.querySelectorAll('.item').forEach(e=>{e.onclick=()=>select(e.dataset.id,true);e.onkeydown=ev=>{if(ev.key==='Enter')select(e.dataset.id,true)}});
  document.querySelectorAll('#views .btn').forEach(e=>e.onclick=()=>{select(null);goView(e.dataset.v)})}
const fmtFloors=L=>typeof L.floors==='number'?`${L.floors}<small> floors</small>`:`<small>${L.floors}</small>`;
const fmtLL=ll=>`${Math.abs(ll[1]).toFixed(5)}°${ll[1]>=0?'N':'S'}, ${Math.abs(ll[0]).toFixed(5)}°${ll[0]>=0?'E':'W'}`;
function renderInfo(){const el=$('#info');
  if(!SEL){const n1=LMS.filter(l=>!l.ghost).length;el.innerHTML=`<div class="hd"><div class="zh">曼哈顿中城</div><h2>Midtown Manhattan skyline</h2><div class="addr">Hudson River to East River, 30th Street to Central Park</div></div>
   <div class="bd intro"><p>${n1} landmark sites are modelled at true height on the real street grid, among several thousand generated context buildings. Every landmark carries a WGS84 position.</p>
   <p><b>Look inside.</b> Select a building and open <b>Inside</b> to cut it open, or use <b>X-ray city</b> and <b>Slice city</b> above to see through everything at once. Floors, cores, moving elevators and columns appear, with key rooms marked.</p>
   <p><b>Time.</b> Drag <b>Time</b> for sunset and night lighting. Drag <b>Year</b> back to 1890 to watch the skyline grow and to bring back demolished buildings such as the first Penn Station.</p>
   <div class="actions"><button class="btn" id="cpAll">Copy GeoJSON of all landmarks</button></div>
   <p class="note">What is real: heights, dates, designers, street positions and the facts in each history. What is approximate: footprints, setback levels and all interiors, which are schematic and not surveyed floor plans. Context buildings are generated stand-ins, not real addresses. Facade materials are painted procedurally, not photographs.</p>
   <div class="src">Data: CTBUH Skyscraper Center, Wikipedia building articles and the list of tallest buildings in New York City, NYC Landmarks Preservation Commission reports, KPF and Skyscraper Museum publications.</div></div>`;
   $('#cpAll').onclick=e=>copyText(JSON.stringify(geojson()),e.target);return}
  const L=LM[SEL],tabs=[['overview','Overview'],['history','History'],['inside','Inside'],['geo','Location']];let bd='';
  if(TAB==='overview')bd=`<div class="kv"><div class="k">Architect</div><div>${L.arch}</div><div class="k">Structure</div><div>${L.struct}</div><div class="k">Facade</div><div>${L.facade}</div><div class="k">Address</div><div>${L.addr}</div>${L.roof&&L.roof!==L.h?`<div class="k">Roof height</div><div>${L.roof} m</div>`:''}</div>`;
  if(TAB==='history')bd=`<ol class="hist">${L.hist.map(([y,t])=>`<li><b>${y}</b>${t}</li>`).join('')}</ol>`;
  if(TAB==='inside'){const on=SECTION||XRAY||XALL||SLICE;if(on&&!L.interior)buildInterior(L);const ks=[...new Set((L.I.special||[]).map(s=>s.k))];
    bd=`<div class="actions"><button class="btn primary${SECTION?' on':''}" id="bSec">${SECTION?'Close the cut':'Cut building open'}</button><button class="btn${XRAY?' on':''}" id="bX">X-ray</button>${SECTION?`<button class="btn" id="bAx">Cut faces: ${AXIS==='auto'?'camera':AXIS==='x'?'east-west':'north-south'}</button>`:''}</div>
    ${on?`<div class="secbox">${SECTION?`<div class="row">Keep <input id="cut" type="range" min="0" max="1" step="0.005" value="${CUT}"></div>`:''}<div class="legend"><span><i style="background:#d8d3ca"></i>Floor slabs</span>${L.hasCore?'<span><i style="background:#8f979e"></i>Core</span><span><i style="background:#ffd34d"></i>Elevators</span>':''}${L.colKind?`<span><i style="background:${L.colColor}"></i>${L.colKind}</span>`:''}${ks.map(k=>`<span><i style="background:${KC[k]}"></i>${KN[k]}</span>`).join('')}</div></div>`:''}
    <ul class="int">${L.inside.map(t=>`<li>${t}</li>`).join('')}</ul><p class="note">Schematic interior: floor levels follow the real floor count and height; core, column and elevator layouts are illustrative${L.I.core||(L.I.special||[]).length?', with named spaces placed from published descriptions':''}.</p>`}
  if(TAB==='geo')bd=`<div class="kv"><div class="k">Latitude</div><div class="mono">${L.ll[1].toFixed(6)}</div><div class="k">Longitude</div><div class="mono">${L.ll[0].toFixed(6)}</div><div class="k">Model origin</div><div>Centre of the building's local axes, at ground level</div><div class="k">Orientation</div><div>Street grid, ${GEO.bearing}° clockwise from true north</div><div class="k">Grid offset</div><div class="mono">${r2(L.u)} m cross-town, ${r2(L.v)} m uptown</div><div class="k">Parts</div><div>${L.bld.parts.length} extrusions</div></div>
    <div class="actions" style="margin-top:14px"><button class="btn" id="cpLL">Copy lat, lon</button><button class="btn" id="cpGJ">Copy GeoJSON for this building</button></div>
    <p class="note">The GeoJSON holds one polygon per building part with <span style="font-family:var(--mono)">base_height</span> and <span style="font-family:var(--mono)">height</span>, ready for extrusion layers in MapLibre, Mapbox, deck.gl or QGIS. Positions come from the street grid and land within about 30 m of published coordinates on average, 60 m at worst; footprints are approximate.</p>`;
  el.innerHTML=`<div class="hd"><div class="zh">${L.zh}</div><h2>${L.name}</h2><div class="addr">${L.addr}</div>
   <div class="stats"><div class="stat"><div class="k">${L.ghost?'Stood':'Completed'}</div><div class="v">${L.year}${L.end?'<small>-'+L.end+'</small>':''}</div></div><div class="stat"><div class="k">Height</div><div class="v">${L.h}<small> m</small></div></div><div class="stat"><div class="k">Floors</div><div class="v">${fmtFloors(L)}</div></div></div>
   <div class="tabs">${tabs.map(([k,t])=>`<div class="tab${TAB===k?' on':''}" data-t="${k}" tabindex="0">${t}</div>`).join('')}</div></div><div class="bd">${bd}</div>`;
  el.querySelectorAll('.tab').forEach(t=>{t.onclick=()=>{TAB=t.dataset.t;renderInfo()};t.onkeydown=e=>{if(e.key==='Enter'){TAB=t.dataset.t;renderInfo()}}});
  const on=(id,fn)=>{const b=$(id);if(b)b.onclick=fn};
  on('#bSec',()=>{SECTION=!SECTION;if(SECTION){XRAY=false;CUT=Math.min(CUT,0.6)}refresh();renderInfo()});on('#bX',()=>{XRAY=!XRAY;if(XRAY)SECTION=false;refresh();renderInfo()});
  on('#bAx',()=>{AXIS=AXIS==='auto'?'x':AXIS==='x'?'z':'auto';refresh();renderInfo()});
  on('#cpLL',e=>copyText(`${L.ll[1].toFixed(6)}, ${L.ll[0].toFixed(6)}`,e.target));on('#cpGJ',e=>copyText(JSON.stringify(geojson([L.id])),e.target));
  const ct=$('#cut');if(ct)ct.oninput=e=>{CUT=+e.target.value;updatePlane(L)};
}
function flyTo(L){const b=L.box,h=Math.min(L.h,b.max.y),ctr=b.getCenter(new THREE.Vector3());const c=W(L.u+ctr.x,h*0.45,L.v-ctr.z);const dir=camera.position.clone().sub(controls.target);dir.y=Math.max(dir.y,dir.length()*(h<120?0.85:0.3));dir.normalize();
  const dist=Math.max(170,h*1.3+Math.max(b.max.x-b.min.x,b.max.z-b.min.z)*1.15);FLY={t:0,p0:camera.position.clone(),t0:controls.target.clone(),p1:c.clone().addScaledVector(dir,dist),t1:c}}
function select(id,fly){if(SEL===id){if(fly&&id)flyTo(LM[id]);return}
  if(SEL)LM[SEL].labelEl.classList.remove('sel');SEL=id;SECTION=false;XRAY=false;
  if(id){const L=LM[id];L.labelEl.classList.add('sel');if(YEAR<L.year||(L.end&&YEAR>=L.end)){const y=L.end?L.end-1:L.year;$('#year').value=y;applyYear(y)}
    const ctr=L.box.getCenter(new THREE.Vector3()),r=Math.max(L.box.max.x-L.box.min.x,L.box.max.z-L.box.min.z)*0.72+12;selRing.scale.setScalar(r);selRing.position.set(L.u+ctr.x,0.7,-L.v+ctr.z);selRing.visible=true;if(fly)flyTo(L)}else selRing.visible=false;
  refresh();document.querySelectorAll('.item').forEach(e=>e.classList.toggle('sel',e.dataset.id===id));renderInfo()}

/* ============================ pointer: pick, hover, coordinates ============================ */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);let down=null,lastMove=0;
const visibleChain=o=>{while(o){if(!o.visible)return false;o=o.parent}return true};
function hitLM(e){ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ptr,camera);const hits=ray.intersectObjects(PICK,false).filter(h=>visibleChain(h.object));return hits.length?LM[hits[0].object.userData.lm]:null}
renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];TOUR=false;$('#tTour').classList.remove('on')});
renderer.domElement.addEventListener('pointerup',e=>{if(!down)return;const d=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(d>5)return;const L=hitLM(e);if(L)select(L.id,true)});
renderer.domElement.addEventListener('pointermove',e=>{const now=performance.now();if(now-lastMove<70||down)return;lastMove=now;const L=hitLM(e),tip=$('#tip');
  if(L){tip.style.display='block';tip.textContent=L.name;tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+12)+'px';renderer.domElement.style.cursor='pointer'}else{tip.style.display='none';renderer.domElement.style.cursor=''}
  const p=ray.ray.intersectPlane(groundPlane,new THREE.Vector3());if(p&&p.distanceTo(camera.position)<20000){const l=city.worldToLocal(p.clone()),ll=toLL(l.x,-l.z);$('#coord').textContent=fmtLL(ll)}});
renderer.domElement.addEventListener('pointerleave',()=>{$('#tip').style.display='none'});

/* ============================ wiring ============================ */
const labelsOn={v:true};let TOUR=false;
$('#time').oninput=e=>applyTime(+e.target.value);$('#year').oninput=e=>applyYear(+e.target.value);
const tg=(id,fn)=>{const b=$(id);b.onclick=()=>{b.classList.toggle('on');fn(b.classList.contains('on'))}};
tg('#tLabels',v=>{labelsOn.v=v});tg('#tPanels',v=>{document.body.classList.toggle('bare',!v)});tg('#tCars',v=>{TR.im.visible=v;TR.head.visible=v;TR.tail.visible=v});tg('#tTour',v=>{TOUR=v});
tg('#tXray',v=>{XALL=v;refresh();if(SEL)renderInfo()});tg('#tSlice',v=>{SLICE=v;refresh();applyYear(YEAR);if(SEL)renderInfo()});
$('#slicePos').oninput=e=>{SLICEPOS=+e.target.value;updateGPlane()};$('#sliceAx').onclick=()=>{SLICEAX=SLICEAX==='v'?'u':'v';refresh()};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);labelRenderer.setSize(innerWidth,innerHeight)});
addEventListener('keydown',e=>{if(e.key==='Escape')select(null)});

/* ============================ loop ============================ */
const clock=new THREE.Clock(),_wp=new THREE.Vector3();
function loop(){const dt=Math.min(clock.getDelta(),0.05),t=clock.elapsedTime;
  if(FLY){FLY.t=Math.min(1,FLY.t+dt/1.6);const k=FLY.t<0.5?4*FLY.t**3:1-(-2*FLY.t+2)**3/2;camera.position.lerpVectors(FLY.p0,FLY.p1,k);controls.target.lerpVectors(FLY.t0,FLY.t1,k);if(FLY.t>=1)FLY=null}
  if(TOUR&&!FLY){const off=camera.position.clone().sub(controls.target);off.applyAxisAngle(new THREE.Vector3(0,1,0),dt*0.05);camera.position.copy(controls.target).add(off)}
  controls.update();updateTraffic(dt);updateFlood(t);
  if(M.water){M.water.normalMap.offset.x=t*0.004;M.water.normalMap.offset.y=t*0.0025}
  for(const E of ELEV){if(!E.L.interior.visible||!E.L.root.visible)continue;E.cars.forEach((c,i)=>{if(c.wait>0)c.wait-=dt;else{c.y+=c.dir*c.sp*dt;if(c.y>c.b){c.y=c.b;c.dir=-1;c.wait=rr(1,3)}if(c.y<c.a){c.y=c.a;c.dir=1;c.wait=rr(1,3)}}_m4.makeTranslation(c.x,c.y+1.5,c.z);E.im.setMatrixAt(i,_m4)});E.im.instanceMatrix.needsUpdate=true}
  if(SEL&&SECTION)updatePlane(LM[SEL]);if(SLICE)updateGPlane();
  if(selRing.visible)selRing.material.opacity=0.45+0.35*Math.sin(t*3);
  for(const lo of LABELS){let v=lo.userData.want&&visibleChain(lo.parent);const L=lo.userData.L;
    if(v&&L){v=labelsOn.v;if(v&&L.tier===2&&SEL!==L.id){L.root.getWorldPosition(_wp);v=_wp.distanceTo(camera.position)<1500}}lo.visible=v}
  const a=Math.atan2(camera.position.x-controls.target.x,camera.position.z-controls.target.z);$('#cneedle').setAttribute('transform',`rotate(${a*180/Math.PI})`);
  composer.render();labelRenderer.render(scene,camera);requestAnimationFrame(loop)}

/* ============================ boot ============================ */
(async()=>{
  await tick(0.05,'Painting facades');buildTextures();
  await tick(0.35,'Laying out the island, rivers and park');buildBase();
  await tick(0.5,'Raising the landmarks');buildLandmarks();
  await tick(0.62,'Filling in the blocks');buildFillers();
  await tick(0.8,'Planting trees, starting traffic');buildTrees();buildTraffic();
  await tick(0.95,'Setting the light');
  const V=VIEWS.hudson;camera.position.copy(W(...V.p));controls.target.copy(W(...V.t));controls.update();
  applyTime(+$('#time').value);renderList();applyYear(2026);refresh();renderInfo();
  window.__APP={THREE,scene,city,camera,controls,LMS,LM,M,GEO,geojson,toLL,select,refresh,buildInterior,goView};
  loop();setTimeout(()=>{const l=$('#loading');l.style.opacity=0;setTimeout(()=>l.remove(),700)},150);
})();
