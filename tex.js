// Procedural facade materials: every facade is painted four times from one layout seed
// (albedo, roughness+metalness, bump, night emission) so the layers line up exactly.
import { THREE, cfg, mulberry32, hashStr, shade } from './core.js';
export const S={}, M={}, FACADE_MATS=[];

export function texSet(key,Wd,Ht,tileW,tileH,draw,opt={}){
  const set={tile:[tileW,tileH]};
  const modes=['color','rm','bump','emit'];if(opt.alpha)modes.push('alpha');
  for(const mode of modes){
    const cv=document.createElement('canvas');cv.width=Wd;cv.height=Ht;
    const ctx=cv.getContext('2d');const seed=hashStr(key);
    if(mode==='alpha'){ctx.fillStyle='#fff';ctx.fillRect(0,0,Wd,Ht)}
    const P={ctx,mode,W:Wd,H:Ht,rng:mulberry32(seed),vr:mulberry32(seed^0x9e3779b9),er:mulberry32(seed^0x85ebca6b),
      style(m){
        if(mode==='color')return m.j?shade(m.c,(this.vr()-0.5)*2*m.j):m.c;
        if(mode==='rm')return`rgb(0,${Math.round((m.r??0.8)*255)},${Math.round((m.m??0)*255)})`;
        if(mode==='bump'){const b=Math.round((m.b??0.5)*255);return`rgb(${b},${b},${b})`}
        if(mode==='alpha'){const a=Math.round((m.a??1)*255);return`rgb(${a},${a},${a})`}
        if(m.e&&this.er()<m.e*0.55){if(m.ec)return m.ec;const t=this.er();return t<0.42?shade('#ffcf8a',(this.er()-0.5)*0.4):t<0.8?shade('#f6efe2',(this.er()-0.5)*0.2):'#cfe2ff'}
        return'#000';
      },
      rect(x,y,w,h,m){if(mode==='alpha'&&m.a===undefined)return;ctx.fillStyle=this.style(m);ctx.fillRect(x,y,w,h);
        if(mode==='color'&&m.grad){const g=ctx.createLinearGradient(x,y,x+w*0.7,y+h);g.addColorStop(0,'rgba(255,255,255,0.16)');g.addColorStop(0.45,'rgba(255,255,255,0.02)');g.addColorStop(1,'rgba(0,0,0,0.14)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)}},
      path(m,fn){if(mode==='alpha'&&m.a===undefined)return;ctx.fillStyle=this.style(m);ctx.beginPath();fn(ctx);ctx.fill()},
      line(x0,y0,x1,y1,w,m){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*w/2,ny=dx/l*w/2;this.path(m,c=>{c.moveTo(x0+nx,y0+ny);c.lineTo(x1+nx,y1+ny);c.lineTo(x1-nx,y1-ny);c.lineTo(x0-nx,y0-ny);c.closePath()})},
      noise(n,alpha){if(mode!=='color'&&mode!=='bump')return;for(let i=0;i<n;i++){const x=this.vr()*Wd,y=this.vr()*Ht,s=1+this.vr()*2.2;ctx.fillStyle=this.vr()<0.5?`rgba(255,255,255,${alpha})`:`rgba(0,0,0,${alpha})`;ctx.fillRect(x,y,s,s)}},
      stain(n){if(mode!=='color')return;for(let i=0;i<n;i++){const x=this.vr()*Wd,w=4+this.vr()*30;const g=ctx.createLinearGradient(0,0,0,Ht);g.addColorStop(0,'rgba(40,35,30,0)');g.addColorStop(1,`rgba(40,35,30,${0.04+this.vr()*0.06})`);ctx.fillStyle=g;ctx.fillRect(x,0,w,Ht)}}
    };
    draw(P,Wd,Ht);
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/tileW,1/tileH);t.anisotropy=cfg.aniso;
    if(mode==='color'||mode==='emit')t.colorSpace=THREE.SRGBColorSpace;
    if(mode!=='alpha')t.userData.mimeType='image/jpeg';
    set[mode]=t;
  }
  return set;
}
const GL=(c,j=0.2,e=0.36)=>({c,j,r:0.07,m:0.9,b:0.12,e,grad:true});
const MT=(c,r=0.8,m=0,b=0.6,j=0.03)=>({c,r,m,b,j});
export function facadeMat(set,o={}){
  const m=new THREE.MeshStandardMaterial({map:set.color,roughnessMap:set.rm,metalnessMap:set.rm,roughness:1,metalness:1,bumpMap:set.bump,bumpScale:o.bump??2,
    emissiveMap:o.flood?null:set.emit,emissive:new THREE.Color(o.flood?0x000000:0xffffff),emissiveIntensity:0,envMapIntensity:o.env??1,vertexColors:true});
  if(o.alpha){m.alphaMap=set.alpha;m.alphaTest=0.5;m.side=THREE.DoubleSide}
  m.userData.nightE=o.nightE??1.15;if(o.flood)m.userData.flood=o.flood;
  FACADE_MATS.push(m);return m;
}
function plainTex(key,size,tile,draw){const cv=document.createElement('canvas');cv.width=cv.height=size;const ctx=cv.getContext('2d');draw(ctx,size,mulberry32(hashStr(key)));const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/tile,1/tile);t.anisotropy=cfg.aniso;t.colorSpace=THREE.SRGBColorSpace;t.userData.mimeType='image/jpeg';return t}
function speckle(c,s,r,base,n,amt){c.fillStyle=base;c.fillRect(0,0,s,s);for(let i=0;i<n;i++){c.fillStyle=r()<0.5?`rgba(255,255,255,${amt*r()})`:`rgba(0,0,0,${amt*r()})`;const z=1+r()*2.5;c.fillRect(r()*s,r()*s,z,z)}}

/* ---------- reusable facade generators ---------- */
// curtain wall: glass panels, spandrel band each floor, mullions
const glassF=(key,c,mull,o={})=>texSet(key,256,384,o.tw??6,o.th??8,(P,Wd,Ht)=>{const e=o.e??0.38;P.rect(0,0,Wd,Ht,GL(c,0.12,0));
  for(let f=0;f<2;f++){for(let b=0;b<4;b++)P.rect(b*64+3,f*192+3,58,150,GL(c,0.16,e));P.rect(0,f*192+153,Wd,39,MT(o.sp||shade(c,-0.28),0.4,0.7,0.4))}
  for(let b=0;b<=4;b++)P.rect(b*64-2,0,4,Ht,MT(mull,0.35,0.9,0.6))});
// continuous vertical stone or metal piers with recessed glass
const pierF=(key,stone,glass,o={})=>texSet(key,256,384,o.tw??6,o.th??8,(P,Wd,Ht)=>{const e=o.e??0.36,pw=64*(o.pier??0.36);P.rect(0,0,Wd,Ht,GL(glass,0.15,0));
  for(let f=0;f<2;f++){for(let b=0;b<4;b++)P.rect(b*64+pw/2,f*192,64-pw,146,GL(glass,0.15,e));P.rect(0,f*192+146,Wd,46,MT(o.sp||shade(glass,-0.35),0.55,0.4,0.35))}
  for(let b=0;b<=4;b++){P.rect(b*64-pw/2,0,pw,Ht,MT(stone,o.sr??0.8,o.sm??0,0.92,0.02));P.rect(b*64+pw/2-2,0,2,Ht,MT(shade(stone,-0.25),0.85,0,0.5))}
  P.noise(1500,0.035)});
// horizontal ribbon windows between opaque bands
const ribbonF=(key,band,glass,o={})=>texSet(key,256,384,o.tw??6,o.th??7.6,(P,Wd,Ht)=>{const e=o.e??0.38,bf=o.bf??0.45;
  for(let f=0;f<2;f++){const gh=192*(1-bf);P.rect(0,f*192,Wd,gh,GL(glass,0.14,0));for(let b=0;b<4;b++)P.rect(b*64+2,f*192+2,60,gh-4,GL(glass,0.16,e));P.rect(0,f*192+gh,Wd,192*bf,MT(band,o.br??0.4,o.bm??0.6,0.7,0.02))}
  for(let b=0;b<=4;b++)P.rect(b*64-1.5,0,3,Ht,MT(o.mull||shade(band,-0.2),0.4,0.8,0.55))});
// masonry with punched windows
const brick=(key,base,mortar,trim,o={})=>texSet(key,384,512,o.tw??9,o.th??12.4,(P,Wd,Ht)=>{const e=o.e??0.28;P.rect(0,0,Wd,Ht,MT(base,0.9,0,0.6,o.j??0.05));
  if(mortar){const mo=MT(mortar,0.95,0,0.44,0.02);for(let y=0;y<Ht;y+=8){P.rect(0,y,Wd,1.3,mo);const off=((y/8)%2)*9;for(let x=off;x<Wd;x+=18)P.rect(x,y,1.3,8,mo)}}
  else for(let y=0;y<Ht;y+=32)P.rect(0,y,Wd,1.4,MT(shade(base,-0.14),0.9,0,0.4));
  P.noise(3500,0.05);P.stain(8);
  for(let f=0;f<4;f++)for(let b=0;b<3;b++){const x0=b*128,y0=f*128;P.rect(x0+36,y0+26,56,80,GL(o.win||'#2a2f33',0.2,e));P.rect(x0+32,y0+20,64,7,MT(trim,0.85,0,0.72));P.rect(x0+34,y0+106,60,6,MT(trim,0.85,0,0.76));P.rect(x0+62,y0+26,4,80,MT('#d6d2ca',0.6,0,0.4))}});

export function buildTextures(){
  const H4=(P,f)=>{for(let fl=0;fl<4;fl++)for(let b=0;b<4;b++)f(b*P.W/4,fl*P.H/4)};
  // Empire State: Indiana limestone, aluminium spandrels, chrome-nickel steel mullion strips
  S.esb=texSet('esb',512,1024,9.6,14.92,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#cdbd9e',0.85,0,0.62,0.04));P.noise(9000,0.055);P.stain(14);
    H4(P,(x0,y0)=>{const wx=x0+30,ww=68;P.rect(wx,y0+20,ww,160,GL('#2b353f',0.25,0.4));P.rect(wx+ww/2-2,y0+20,4,160,MT('#9aa0a3',0.3,1,0.3));P.rect(wx,y0+96,ww,4,MT('#9aa0a3',0.3,1,0.3));
      P.rect(wx,y0+180,ww,76,MT('#8a8780',0.38,0.85,0.42,0.05));for(let k=0;k<3;k++)P.rect(wx+6,y0+192+k*20,ww-12,6,MT('#b8b5ad',0.3,0.9,0.55));
      P.rect(wx-9,y0,6,256,MT('#e6e8ea',0.14,1,0.78,0));P.rect(wx+ww+3,y0,6,256,MT('#e6e8ea',0.14,1,0.78,0))})});
  S.rock=texSet('rock',512,1024,12.8,15.2,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#cdc2aa',0.86,0,0.66,0.035));P.noise(8000,0.05);P.stain(10);
    H4(P,(x0,y0)=>{P.rect(x0+36,y0+16,56,172,GL('#28323b',0.2,0.4));P.rect(x0+36,y0+188,56,68,MT('#4f4c46',0.6,0.25,0.22,0.05));P.rect(x0+62,y0+16,4,172,MT('#55575a',0.4,0.8,0.3));P.rect(x0+36,y0+100,56,3,MT('#55575a',0.4,0.8,0.3))})});
  S.chrysler=texSet('chrysler',512,1024,9.6,15.2,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#e7e3d9',0.85,0,0.62,0.02));
    const mo=MT('#cbc4b6',0.92,0,0.46,0.01);for(let y=0;y<Ht;y+=10){P.rect(0,y,Wd,1.6,mo);const off=((y/10)%2)*12;for(let x=off;x<Wd;x+=24)P.rect(x,y,1.6,10,mo)}P.noise(6000,0.045);P.stain(8);
    H4(P,(x0,y0)=>{P.rect(x0+26,y0,5,256,MT('#8d8b86',0.85,0,0.55));P.rect(x0+97,y0,5,256,MT('#8d8b86',0.85,0,0.55));P.rect(x0+31,y0+22,66,158,GL('#29323a',0.2,0.38));P.rect(x0+62,y0+22,4,158,MT('#6f7275',0.4,0.8,0.3));P.rect(x0+31,y0+180,66,62,MT('#7b7a76',0.8,0,0.48,0.05))})});
  S.steel=texSet('steel',256,256,3,3,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#c3c9ce',0.2,1,0.6,0.03));for(let i=0;i<4;i++){P.rect(i*64,0,2,Ht,MT('#8d949a',0.3,1,0.3));P.rect(0,i*64,Wd,2,MT('#8d949a',0.3,1,0.3))}P.noise(2500,0.05)});
  S.arch=texSet('arch',512,512,1,1,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#cfd5da',0.17,1,0.62,0));const cx=256,cy=Ht*0.84;
    for(let k=0;k<4;k++){const r0=70+k*62,r1=r0+44;P.path(MT('#8b9298',0.28,1,0.85,0),c=>{c.arc(cx,cy,r1+12,Math.PI,0);c.arc(cx,cy,r1+4,0,Math.PI,true)});
      const n=5+k*2;for(let i=0;i<n;i++){const a0=Math.PI+(i+0.12)/n*Math.PI,a1=Math.PI+(i+0.88)/n*Math.PI,am=(a0+a1)/2;
        P.path({...GL('#1d2328',0.12,0.95),ec:'#fff6e4'},c=>{c.moveTo(cx+Math.cos(a0)*r0,cy+Math.sin(a0)*r0);c.lineTo(cx+Math.cos(a1)*r0,cy+Math.sin(a1)*r0);c.lineTo(cx+Math.cos(am)*r1,cy+Math.sin(am)*r1);c.closePath()})}}});
  S.onev=texSet('onev',512,768,6,9,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#3a4b58',0.12,0.42));
    for(let f=0;f<2;f++){const y0=f*384;for(let b=0;b<4;b++)P.rect(b*128+6,y0,116,282,GL('#3a4b58',0.18,0.42));P.rect(0,y0+282,Wd,102,MT('#dccab0',0.62,0,0.6,0.02));for(let x=0;x<Wd;x+=12)P.rect(x,y0+284,4,98,MT('#bba98d',0.7,0,0.35,0.02))}
    for(let b=0;b<=4;b++)P.rect(b*128-3,0,6,Ht,MT('#a3a7aa',0.35,0.9,0.7))});
  S.onevBase=texSet('onevBase',512,512,8,8,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#4b5a63',0.1,0.6));for(let b=0;b<=4;b++)P.rect(b*128-5,0,10,Ht,MT('#7c5e3e',0.42,1,0.8));P.rect(0,0,Wd,14,MT('#7c5e3e',0.42,1,0.8))});
  S.gctSide=texSet('gctSide',256,512,12,24,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#d8cdb5',0.88,0,0.62,0.03));for(let y=0;y<Ht;y+=22)P.rect(0,y,Wd,2,MT('#b9ad94',0.9,0,0.35));P.noise(4000,0.05);
    P.path(GL('#2c3238',0.15,0.7),c=>{c.moveTo(68,440);c.lineTo(68,170);c.arc(128,170,60,Math.PI,0);c.lineTo(188,440);c.closePath()});for(let x=68;x<190;x+=20)P.rect(x,110,3,330,MT('#5a5f63',0.4,1,0.3));for(let y=170;y<440;y+=30)P.rect(68,y,120,3,MT('#5a5f63',0.4,1,0.3))});
  S.gctFront=texSet('gctFront',1024,312,118,36,(P,Wd,Ht)=>{const s=Wd/118,Y=m=>Ht-m*s,X=m=>m*s;
    P.rect(0,0,Wd,Ht,MT('#d9cfb8',0.88,0,0.6,0.03));for(let y=Y(6);y<Ht;y+=11)P.rect(0,y,Wd,2,MT('#b5a990',0.9,0,0.3));P.noise(9000,0.05);
    for(const cx of [39,59,79]){P.path(GL('#262c31',0.1,0.85),c=>{c.moveTo(X(cx-5),Y(6));c.lineTo(X(cx-5),Y(26));c.arc(X(cx),Y(26),5*s,Math.PI,0);c.lineTo(X(cx+5),Y(6));c.closePath()});
      for(let x=cx-5;x<=cx+5;x+=1)P.rect(X(x)-1,Y(31),2,25*s,MT('#4c5156',0.4,1,0.3));for(let y=7.5;y<29;y+=1.6)P.rect(X(cx-5),Y(y),10*s,2,MT('#4c5156',0.4,1,0.3))}
    for(const cx of [29,49,69,89])for(const dx of [-1.3,1.3]){P.rect(X(cx+dx-0.65),Y(27),1.3*s,21*s,MT('#e6dcc6',0.8,0,0.9,0.02));P.rect(X(cx+dx+0.3),Y(27),0.35*s,21*s,MT('#b3a68c',0.85,0,0.7,0.02))}
    P.rect(0,Y(30),Wd,3*s,MT('#e3d9c3',0.8,0,0.85));for(let x=0;x<Wd;x+=9)P.rect(x,Y(27.6),4,6,MT('#b3a68c',0.85,0,0.55));
    for(let x=4;x<118;x+=4.5)P.rect(X(x),Y(34.5),2*s,2.6*s,GL('#2b3036',0.1,0.4));
    for(const [a,b] of [[2,20],[98,116]])for(let fl=0;fl<4;fl++)for(let x=a;x<b;x+=3.2)P.rect(X(x),Y(9+fl*5)-2.6*s,1.7*s,2.6*s,GL('#2b3036',0.12,0.5));
    P.rect(0,Y(6.2),Wd,4,MT('#a99d84',0.9,0,0.3))});
  S.metlife=texSet('metlife',512,512,6,7.8,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#b7b1a5',0.85,0,0.55,0.03));P.noise(5000,0.05);P.stain(12);
    for(let f=0;f<2;f++){const y0=f*256;for(let b=0;b<4;b++){const x0=b*128;P.rect(x0+26,y0+30,76,170,GL('#2a333b',0.18,0.4));P.rect(x0,y0,24,256,MT('#cdc7bb',0.85,0,0.9));P.rect(x0+18,y0,6,256,MT('#8e887d',0.85,0,0.5))}}});
  S.p270=texSet('p270',512,768,6,9.6,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#4d6372',0.14,0.45));for(let f=0;f<2;f++){const y0=f*384;for(let b=0;b<4;b++)P.rect(b*128+5,y0+4,118,320,GL('#4d6372',0.16,0.45));P.rect(0,y0+324,Wd,60,MT('#a8894f',0.4,0.9,0.65))}for(let b=0;b<=4;b++)P.rect(b*128-4,0,8,Ht,MT('#9c7f49',0.4,0.9,0.8))});
  S.white=texSet('white',256,256,4,4,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#a58a55',0.42,0.9,0.6,0.01));P.noise(1500,0.03)});
  S.boa=texSet('boa',512,768,6,8.4,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#62798a',0.1,0.45));
    for(let f=0;f<2;f++){const y0=f*384;for(let b=0;b<4;b++)P.rect(b*128+3,y0+3,122,286,GL('#5d7584',0.12,0.45));const fr=MT('#b8c2c8',0.4,0.5,0.55,0.02);P.rect(0,y0+290,Wd,94,MT('#7d8d97',0.3,0.8,0.5));for(let y=y0+294;y<y0+382;y+=7)for(let x=(y%14?0:3);x<Wd;x+=7)P.rect(x,y,3,3,fr)}
    for(let b=0;b<=4;b++)P.rect(b*128-3,0,6,Ht,MT('#c9cfd3',0.3,1,0.7))});
  S.seagram=texSet('seagram',512,512,8.5,8.2,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#5e4d36',0.08,0.45));
    for(let f=0;f<2;f++){const y0=f*256;for(let k=0;k<6;k++)P.rect(k*85.3+6,y0,74,190,GL('#5b4a33',0.1,0.45));P.rect(0,y0+190,Wd,66,MT('#5b3f26',0.42,1,0.55,0.03))}
    for(let k=0;k<=6;k++)P.rect(k*85.3-5,0,10,Ht,MT('#6e4e30',0.36,1,0.9,0.02))});
  S.p432=texSet('p432',256,256,4.75,4.7,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,{...MT('#eceae4',0.72,0,0.7,0.015),a:1});P.noise(1800,0.04);P.rect(46,45,164,166,{...GL('#26313a',0.18,0.3),a:0});P.rect(46,45,164,4,{...MT('#a6aaad',0.4,1,0.4),a:0})},{alpha:true});
  S.s111tc=texSet('s111tc',512,1024,4.8,10.4,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#2d3338',0.1,0.33));
    for(let b=0;b<4;b++){const cx=b*128+64;for(let y=0;y<Ht;y+=8){const w=64+28*Math.sin(y/Ht*Math.PI*4+b);for(let s=0;s<6;s++){const k=s/5;P.rect(cx-w/2+k*w*5/6,y,w/6+1,8,MT(k<0.5?'#efe4cf':'#c9b99c',0.6,0,0.5+0.4*Math.sin(k*Math.PI),0.01))}}}
    for(let f=0;f<2;f++){P.rect(0,f*512,Wd,26,MT('#7a5935',0.38,1,0.75,0.02));for(let x=0;x<Wd;x+=16)P.rect(x,f*512+6,8,14,MT('#a07a4c',0.35,1,0.85))}});
  S.s111glass=texSet('s111glass',256,512,3,5.2,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#47535e',0.12,0.38));P.rect(0,0,8,Ht,MT('#7a5935',0.38,1,0.7));P.rect(0,Ht-20,Wd,20,MT('#7a5935',0.38,1,0.7))});
  S.cpt=texSet('cpt',512,768,6,9.6,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#3c5163',0.14,0.34));for(let f=0;f<2;f++)P.rect(0,f*384+370,Wd,14,MT('#9aa2a8',0.35,1,0.5));for(let b=0;b<4;b++){P.rect(b*128-7,0,14,Ht,MT('#c9cdd1',0.34,1,0.92,0.01));P.rect(b*128+4,0,3,Ht,MT('#8d9398',0.4,1,0.5))}});
  S.cptBase=texSet('cptBase',512,512,8,8,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#d8d4cc',0.7,0,0.6,0.02));for(let b=0;b<4;b++)P.rect(b*128+10,30,108,420,GL('#4a5a66',0.1,0.75));P.rect(0,450,Wd,62,MT('#bdb8ae',0.8,0,0.5))});
  S.one57=texSet('one57',512,512,12,8.2,(P,Wd,Ht)=>{const sh=['#2c4a6b','#3d6185','#5a7ea3','#86a4bf','#22384f','#47698d'];for(let f=0;f<2;f++)for(let c=0;c<8;c++)P.rect(c*64,f*256,64,256,GL(sh[Math.floor(P.rng()*sh.length)],0.06,0.33));for(let c=0;c<=8;c++)P.rect(c*64-2,0,4,Ht,MT('#9aa3aa',0.35,1,0.6));for(let f=0;f<2;f++)P.rect(0,f*256,Wd,5,MT('#8b949b',0.4,1,0.5))});
  S.uc=texSet('uc',512,512,6,7.6,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#1f2429',0.08,0.42));for(let f=0;f<2;f++)P.rect(0,f*256+190,Wd,66,MT('#26292d',0.5,0.7,0.4));for(let b=0;b<=4;b++)P.rect(b*128-3,0,6,Ht,MT('#d4d8db',0.25,1,0.8))});
  S.classic=texSet('classic',512,512,10,10,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#e2dccf',0.85,0,0.62,0.03));for(let y=0;y<Ht;y+=40)P.rect(0,y,Wd,2,MT('#c4bba9',0.9,0,0.4));P.noise(6000,0.04);
    for(let f=0;f<2;f++)for(let b=0;b<3;b++){const x0=b*170+40,y0=f*256+40;P.path(GL('#2b3035',0.12,0.45),c=>{c.moveTo(x0,y0+190);c.lineTo(x0,y0+45);c.arc(x0+45,y0+45,45,Math.PI,0);c.lineTo(x0+90,y0+190);c.closePath()});P.rect(x0-8,y0+190,106,10,MT('#efe9dd',0.8,0,0.8))}});
  // Hearst diagrid: four-storey triangles of stainless steel over glass
  S.hearst=texSet('hearst',384,1024,12.2,32.8,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#4f6778',0.1,0.4));for(let f=0;f<8;f++){for(let b=0;b<6;b++)P.rect(b*64+2,f*128+2,60,112,GL('#4f6778',0.14,0.4));P.rect(0,f*128+116,Wd,12,MT('#7f8a92',0.35,0.9,0.5))}
    const st=MT('#d3d8dc',0.22,1,0.95,0.01);P.line(0,512,192,0,26,st);P.line(192,0,384,512,26,st);P.line(0,512,192,1024,26,st);P.line(192,1024,384,512,26,st)});
  S.moma=texSet('moma',512,768,20,30,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#2a3138',0.1,0.3));for(let f=0;f<8;f++){for(let b=0;b<8;b++)P.rect(b*64+2,f*96+2,60,84,GL('#2c343c',0.14,0.3));P.rect(0,f*96+88,Wd,8,MT('#1c2126',0.4,0.8,0.4))}
    const st=MT('#3d444b',0.3,1,0.9,0.02);P.line(0,0,512,384,16,st);P.line(512,384,0,768,16,st);P.line(256,0,0,192,10,st);P.line(256,768,512,576,10,st)});
  S.nyt=texSet('nyt',256,512,6,8.4,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,GL('#62737d',0.1,0.36));for(let f=0;f<2;f++)for(let y=0;y<256;y+=5){if(y>84&&y<150)continue;P.rect(0,f*256+y,Wd,2.6,MT('#dadddd',0.5,0.1,0.85,0.01))}for(let b=0;b<=4;b++)P.rect(b*64-1.5,0,3,Ht,MT('#9aa3a8',0.35,0.9,0.6))});
  S.stpat=texSet('stpat',256,512,8,18,(P,Wd,Ht)=>{P.rect(0,0,Wd,Ht,MT('#e3dfd5',0.72,0,0.6,0.02));for(let y=0;y<Ht;y+=24)P.rect(0,y,Wd,1.5,MT('#c9c4b8',0.8,0,0.42));P.noise(3000,0.04);
    P.path({...GL('#27304a',0.3,0.6),ec:'#ffd9a0'},c=>{c.moveTo(84,470);c.lineTo(84,210);c.quadraticCurveTo(88,130,128,96);c.quadraticCurveTo(168,130,172,210);c.lineTo(172,470);c.closePath()});
    P.rect(126,110,4,360,MT('#d6d1c5',0.7,0,0.8));P.rect(84,300,88,4,MT('#d6d1c5',0.7,0,0.8));P.rect(0,0,22,Ht,MT('#efebe2',0.7,0,0.95));P.rect(234,0,22,Ht,MT('#efebe2',0.7,0,0.95))});
  // generator-based sets
  S.citi=ribbonF('citi','#d3d7da','#42586b',{tw:6,th:7.8,bf:0.5,br:0.32,bm:0.85});
  S.lever=ribbonF('lever','#3d6b6e','#6d999c',{tw:5.6,th:7.6,bf:0.42,br:0.12,bm:0.75,mull:'#c7ced0'});
  S.un=glassF('un','#5c8a86','#cfd8d6',{tw:6,th:7.4,sp:'#3f6663'});
  S.att=pierF('att','#c8a99d','#2b3138',{pier:0.52,tw:5.6,th:8});
  S.gm=pierF('gm','#efebe3','#1f252b',{pier:0.42,tw:5,th:8.4,sr:0.6});
  S.f_pier=pierF('fpier','#d6cebd','#28323b',{pier:0.38});
  S.trump=glassF('trump','#3a2f26','#5b4a3a',{sp:'#2b221b'});
  S.solow=glassF('solow','#1b2026','#30363c',{sp:'#15191d'});
  S.dbc=glassF('dbc','#4a6274','#aab4bb');
  S.hy1=glassF('hy1','#5b7f99','#b9c4cc',{e:0.4});
  S.hy2=glassF('hy2','#7d909d','#d0d7db',{e:0.4});
  S.hy3=glassF('hy3','#39566b','#8e9aa3',{e:0.4});
  S.bloom=glassF('bloom','#7f96a3','#dfe4e6');
  S.lime220=brick('lime220','#dbd2bf',null,'#ece5d6',{tw:10,th:16,win:'#2a3038',e:0.3});
  S.lincoln=brick('lincoln','#b89a76','#d2c4ae','#ded3c0',{e:0.32});
  S.chanin=brick('chanin','#b59068','#cdbda6','#d8ccb6',{e:0.32});
  S.fifth500=brick('fifth500','#c9b796','#d9cdb8','#e3dac8',{e:0.32});
  S.ge570=brick('ge570','#b9744e','#cfae97','#d8b79c',{e:0.3});
  S.helmsley=brick('helmsley','#c7b594','#dbcfba','#e6dcc9',{e:0.34});
  S.waldorfG=brick('waldorfG','#b3ada1',null,'#cfc9bd',{e:0.3});
  S.plaza=brick('plaza','#e4dccb',null,'#f1ebde',{e:0.34});
  S.sherry=brick('sherry','#cdbfa5','#ddd2bf','#e6dccb',{e:0.3});
  S.pierre=brick('pierre','#d3c9b6',null,'#e6dfd0',{e:0.3});
  S.paramount=brick('paramount','#c4b08f','#d6c9b3','#e2d7c3',{e:0.34});
  S.carnHall=brick('carnHall','#8b5a3d','#b89a84','#c9a37f',{e:0.4});
  S.cht=brick('cht','#b7754d','#cfae97','#3f6b5c',{e:0.28});
  S.waldorf=brick('waldorf','#874632','#b7a08c','#d6c6a6',{tw:8,e:0.5});
  S.drake=brick('drake','#a98d6c','#cdbfa9','#e2d8c4',{tw:8,e:0.4});
  S.f_brick_red=brick('fbr','#8c5140','#b7a392','#cbbfa8');
  S.f_brick_buff=brick('fbt','#b59a78','#d1c3ad','#ddd2bf');
  S.f_brick_brown=brick('fbb','#735445','#a3907f','#c4b59c');
  S.f_white_brick=brick('fwb','#dcd8cf','#c9c5bc','#eeeae2',{win:'#2c333a',e:0.26});
  S.f_lime=brick('flime','#cbc0aa',null,'#ddd4c1',{e:0.3});
  S.f_intl=ribbonF('fintl','#b9bcba','#4a5a66',{tw:9,th:7,bf:0.4,br:0.55,bm:0.25,e:0.36});
  S.f_gblue=glassF('fgb','#34516c','#8e979e');
  S.f_ggreen=glassF('fgg','#40605b','#8b9693');
  S.f_gsilver=glassF('fgs','#7c8c98','#b9c0c5',{e:0.42});
  S.f_gteal=glassF('fgt','#3f6672','#9aa7ab');
  S.f_dark=glassF('fgd','#272b30','#5b4d3e',{e:0.36});

  /* plain materials */
  const T={};
  T.roof=plainTex('roof',256,10,(c,s,r)=>{speckle(c,s,r,'#6f6d69',5000,0.16);for(let i=0;i<8;i++){c.fillStyle=`rgba(30,30,30,${0.08+r()*0.12})`;c.fillRect(r()*s,r()*s,20+r()*60,20+r()*60)}});
  T.roofL=plainTex('roofL',256,10,(c,s,r)=>{speckle(c,s,r,'#a9a8a3',5000,0.12);for(let i=0;i<6;i++){c.fillStyle=`rgba(60,60,60,${0.06+r()*0.1})`;c.fillRect(r()*s,r()*s,20+r()*50,20+r()*50)}});
  T.asphalt=plainTex('asphalt',512,30,(c,s,r)=>{speckle(c,s,r,'#46464a',30000,0.1);for(let i=0;i<20;i++){c.fillStyle=`rgba(0,0,0,${r()*0.1})`;c.beginPath();c.arc(r()*s,r()*s,10+r()*40,0,7);c.fill()}});
  T.side=plainTex('side',256,3,(c,s,r)=>{speckle(c,s,r,'#a39f97',3500,0.09);c.fillStyle='rgba(60,60,60,.3)';c.fillRect(0,0,s,2);c.fillRect(0,0,2,s)});
  T.grass=plainTex('grass',256,14,(c,s,r)=>{speckle(c,s,r,'#5c7440',9000,0.15);for(let i=0;i<30;i++){c.fillStyle=`rgba(${r()<0.5?'125,112,52':'44,62,32'},${0.08+r()*0.14})`;c.beginPath();c.arc(r()*s,r()*s,8+r()*30,0,7);c.fill()}});
  T.granite=plainTex('granite',256,4,(c,s,r)=>{speckle(c,s,r,'#9a7f73',9000,0.22);c.fillStyle='rgba(40,30,30,.3)';for(let i=0;i<s;i+=64){c.fillRect(0,i,s,1.5);c.fillRect(i,0,1.5,s)}});
  T.copper=plainTex('copper',256,6,(c,s,r)=>{speckle(c,s,r,'#5f9b88',5000,0.18);for(let i=0;i<s;i+=32){c.fillStyle='rgba(30,60,50,.3)';c.fillRect(i,0,2,s)}});
  T.marble=plainTex('marble',256,8,(c,s,r)=>{speckle(c,s,r,'#e8e4dc',3000,0.05);c.strokeStyle='rgba(120,115,105,.16)';for(let i=0;i<10;i++){c.beginPath();let x=r()*s,y=0;c.moveTo(x,y);while(y<s){x+=(r()-0.5)*20;y+=10;c.lineTo(x,y)}c.stroke()}});
  T.wood=plainTex('wood',128,6,(c,s,r)=>{speckle(c,s,r,'#6e665b',1500,0.14);for(let i=0;i<s;i+=10){c.fillStyle='rgba(20,20,20,.25)';c.fillRect(i,0,1,s)}});
  const V={vertexColors:true};
  M.roof=new THREE.MeshStandardMaterial({map:T.roof,roughness:0.95,...V});
  M.roofL=new THREE.MeshStandardMaterial({map:T.roofL,roughness:0.9,...V});
  M.asphalt=new THREE.MeshStandardMaterial({map:T.asphalt,roughness:0.92});
  M.side=new THREE.MeshStandardMaterial({map:T.side,roughness:0.9});
  M.grass=new THREE.MeshStandardMaterial({map:T.grass,roughness:1});
  M.granite=new THREE.MeshStandardMaterial({map:T.granite,roughness:0.55});
  M.copper=new THREE.MeshStandardMaterial({map:T.copper,roughness:0.6,metalness:0.35});
  M.marble=new THREE.MeshStandardMaterial({map:T.marble,roughness:0.6});
  M.trav=new THREE.MeshStandardMaterial({color:0xd9d0bd,roughness:0.75});
  M.pier=new THREE.MeshStandardMaterial({map:T.wood,roughness:0.9});
  M.pool=new THREE.MeshStandardMaterial({color:0x2f4a58,roughness:0.12,metalness:0.2});
  M.ice=new THREE.MeshStandardMaterial({color:0xe3ecf1,roughness:0.15});
  M.steel=facadeMat(S.steel,{bump:1,nightE:0});
  M.steelDark=new THREE.MeshStandardMaterial({color:0x6d747a,roughness:0.35,metalness:1});
  M.whiteSteel=facadeMat(S.white,{nightE:0});
  M.concrete=new THREE.MeshStandardMaterial({color:0xa9a6a0,roughness:0.85});
  M.gold=new THREE.MeshStandardMaterial({color:0xd4a63c,roughness:0.25,metalness:1});
  M.bronze=new THREE.MeshStandardMaterial({color:0x6e4e30,roughness:0.38,metalness:1});
  M.vessel=new THREE.MeshStandardMaterial({color:0xb5673f,roughness:0.28,metalness:1,side:THREE.DoubleSide});
  M.slate=new THREE.MeshStandardMaterial({color:0x4b4f55,roughness:0.7});
  M.hull=new THREE.MeshStandardMaterial({color:0x6f777d,roughness:0.6,metalness:0.4});
  M.glassClear=new THREE.MeshStandardMaterial({color:0x9fb7c4,roughness:0.05,metalness:0.6,transparent:true,opacity:0.45});
  M.lobbyGlass=new THREE.MeshStandardMaterial({color:0x8fa6b3,roughness:0.05,metalness:0.7,emissive:0xffd9a0,emissiveIntensity:0});M.lobbyGlass.userData.nightE=0.6;FACADE_MATS.push(M.lobbyGlass);
  M.lantern=new THREE.MeshStandardMaterial({color:0xe8eef2,roughness:0.3,emissive:0xfff2d6,emissiveIntensity:0});M.lantern.userData.nightE=1.6;FACADE_MATS.push(M.lantern);
  const fm=(k,o)=>M[k]=facadeMat(S[k],o);
  M.esb=facadeMat(S.esb);M.esbTop=facadeMat(S.esb,{flood:'esb'});
  fm('rock');fm('chrysler');M.arch=facadeMat(S.arch,{bump:1.5,nightE:2});
  fm('onev');fm('onevBase');M.onevCrown=facadeMat(S.onev,{flood:'white'});
  fm('metlife');fm('p270');fm('boa');M.boaTop=facadeMat(S.boa,{flood:'white'});
  fm('seagram');fm('p432');M.p432open=facadeMat(S.p432,{alpha:true,nightE:0.4});
  M.s111tc=facadeMat(S.s111tc,{bump:2.5});fm('s111glass');
  fm('cpt');M.cptBase=facadeMat(S.cptBase,{nightE:1.1});M.cptCrown=facadeMat(S.cpt,{flood:'white'});
  for(const k of ['one57','uc','classic','hearst','moma','nyt','stpat','citi','lever','un','att','gm','trump','solow','dbc','hy1','hy2','hy3','bloom','lime220','lincoln','chanin','fifth500','ge570','helmsley','waldorfG','plaza','sherry','pierre','paramount','carnHall','cht','waldorf','drake'])fm(k);
  M.citiTop=facadeMat(S.citi,{flood:'white'});
  M.F={brick_red:facadeMat(S.f_brick_red),brick_buff:facadeMat(S.f_brick_buff),brick_brown:facadeMat(S.f_brick_brown),white_brick:facadeMat(S.f_white_brick),lime:facadeMat(S.f_lime),
    intl:facadeMat(S.f_intl),pier:facadeMat(S.f_pier),gblue:facadeMat(S.f_gblue),ggreen:facadeMat(S.f_ggreen),gsilver:facadeMat(S.f_gsilver),gteal:facadeMat(S.f_gteal),dark:facadeMat(S.f_dark)};
  for(const k in M.F)M.F[k].userData.nightE=1.0;
  // helipad
  const heli=plainTex('heli',256,1,(c,s)=>{c.fillStyle='#3a3d40';c.fillRect(0,0,s,s);c.strokeStyle='#e9e2c9';c.lineWidth=8;c.beginPath();c.arc(128,128,100,0,7);c.stroke();c.fillStyle='#e9e2c9';c.font='bold 120px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('H',128,136)});heli.repeat.set(1,1);
  M.heli=new THREE.MeshStandardMaterial({map:heli,roughness:0.8});
  // Grand Central sculpture group + clock
  const scv=document.createElement('canvas');scv.width=512;scv.height=224;const sc=scv.getContext('2d');
  const ecv=document.createElement('canvas');ecv.width=512;ecv.height=224;const ec=ecv.getContext('2d');ec.fillStyle='#000';ec.fillRect(0,0,512,224);
  sc.fillStyle='#c9bfa6';sc.beginPath();sc.moveTo(30,224);sc.quadraticCurveTo(70,120,150,140);sc.quadraticCurveTo(200,60,256,20);sc.quadraticCurveTo(312,60,362,140);sc.quadraticCurveTo(442,120,482,224);sc.closePath();sc.fill();
  sc.fillStyle='#b3a88e';for(const [x,y,rx,ry] of [[150,150,40,55],[362,150,40,55],[256,90,30,75]]){sc.beginPath();sc.ellipse(x,y,rx,ry,0,0,7);sc.fill()}
  sc.fillStyle='#caa44a';sc.beginPath();sc.arc(256,180,40,0,7);sc.fill();sc.fillStyle='#22406a';sc.beginPath();sc.arc(256,180,33,0,7);sc.fill();sc.fillStyle='#f3e7c6';sc.beginPath();sc.arc(256,180,26,0,7);sc.fill();sc.strokeStyle='#222';sc.lineWidth=3;sc.beginPath();sc.moveTo(256,180);sc.lineTo(256,160);sc.moveTo(256,180);sc.lineTo(270,186);sc.stroke();
  ec.fillStyle='#ffe2a8';ec.beginPath();ec.arc(256,180,30,0,7);ec.fill();
  const stex=new THREE.CanvasTexture(scv);stex.colorSpace=THREE.SRGBColorSpace;const etex=new THREE.CanvasTexture(ecv);etex.colorSpace=THREE.SRGBColorSpace;
  M.sculpt=new THREE.MeshStandardMaterial({map:stex,transparent:true,alphaTest:0.4,roughness:0.85,emissiveMap:etex,emissive:0xffffff,emissiveIntensity:0,side:THREE.DoubleSide});M.sculpt.userData.nightE=1.5;FACADE_MATS.push(M.sculpt);
  // celestial ceiling of the Grand Central concourse
  const cel=document.createElement('canvas');cel.width=1024;cel.height=512;const cc=cel.getContext('2d');const cr=mulberry32(77);
  cc.fillStyle='#5f8f8a';cc.fillRect(0,0,1024,512);const gg=cc.createRadialGradient(512,256,40,512,256,560);gg.addColorStop(0,'rgba(255,255,255,.08)');gg.addColorStop(1,'rgba(0,0,0,.25)');cc.fillStyle=gg;cc.fillRect(0,0,1024,512);
  cc.strokeStyle='rgba(225,190,110,.75)';cc.lineWidth=3;cc.beginPath();cc.moveTo(0,300);cc.bezierCurveTo(300,120,700,120,1024,300);cc.stroke();
  cc.lineWidth=1.2;cc.strokeStyle='rgba(225,195,120,.55)';for(let k=0;k<12;k++){let x=cr()*1024,y=cr()*512;cc.beginPath();cc.moveTo(x,y);for(let i=0;i<5;i++){x+=(cr()-0.5)*120;y+=(cr()-0.5)*90;cc.lineTo(x,y)}cc.stroke()}
  for(let i=0;i<420;i++){const x=cr()*1024,y=cr()*512,r=cr()<0.1?3.5:1.3;cc.fillStyle=cr()<0.15?'#fff6d8':'#e6c171';cc.beginPath();cc.arc(x,y,r,0,7);cc.fill()}
  cc.fillStyle='#1d2422';cc.fillRect(700,330,30,20);
  const celT=new THREE.CanvasTexture(cel);celT.colorSpace=THREE.SRGBColorSpace;
  M.celestial=new THREE.MeshStandardMaterial({map:celT,emissiveMap:celT,emissive:0xffffff,emissiveIntensity:0.35,side:THREE.DoubleSide,roughness:0.8});
  // abstract Times Square screens (no real brands)
  M.ads=[];const words=['BROADWAY','NYC','LIVE','TIMES SQ','OPEN','SHOW','2026','NEW','* * * *','ENCORE'];
  for(let i=0;i<10;i++){const cv=document.createElement('canvas');cv.width=256;cv.height=160;const c=cv.getContext('2d');const r=mulberry32(900+i);
    const h1=Math.floor(r()*360),h2=(h1+90+Math.floor(r()*120))%360;const g=c.createLinearGradient(0,0,256,160);g.addColorStop(0,`hsl(${h1},80%,50%)`);g.addColorStop(1,`hsl(${h2},75%,33%)`);c.fillStyle=g;c.fillRect(0,0,256,160);
    for(let k=0;k<5;k++){c.fillStyle=`hsla(${(h1+k*50)%360},90%,${60+r()*25}%,.5)`;c.beginPath();c.arc(r()*256,r()*160,10+r()*60,0,7);c.fill()}
    c.fillStyle='#fff';c.font=`bold ${28+Math.floor(r()*18)}px sans-serif`;c.textAlign='center';c.fillText(words[i],128,96);
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.userData.mimeType='image/jpeg';
    const m=new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:0.6,roughness:0.5});m.userData.ad=true;FACADE_MATS.push(m);M.ads.push(m)}
  // see-through material for context buildings: floor lines only
  const xc=document.createElement('canvas');xc.width=8;xc.height=64;const xx=xc.getContext('2d');xx.fillStyle='rgba(150,205,255,0.03)';xx.fillRect(0,0,8,64);xx.fillStyle='rgba(165,220,255,0.6)';xx.fillRect(0,0,8,5);
  const xt=new THREE.CanvasTexture(xc);xt.wrapS=xt.wrapT=THREE.RepeatWrapping;xt.repeat.set(1,1/3.7);xt.colorSpace=THREE.SRGBColorSpace;
  M.xray=new THREE.MeshBasicMaterial({map:xt,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true});
  M.xrayRoof=new THREE.MeshBasicMaterial({color:0x9fd0ff,transparent:true,opacity:0.04,depthWrite:false});
}
