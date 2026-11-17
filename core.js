// Shared maths, georeferencing and geometry helpers.
import * as THREE from 'three';
export { THREE };
export const cfg = { aniso: 4 };

/* ---------- random / colour ---------- */
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export const rnd=mulberry32(20261117);
export const rr=(a,b)=>a+(b-a)*rnd();
export const pick=a=>a[Math.floor(rnd()*a.length)];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
export function hexRgb(h){const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
export function shade(hex,k){const c=hexRgb(hex);const f=v=>Math.max(0,Math.min(255,Math.round(k>=0?v+(255-v)*k:v*(1+k))));return'#'+c.map(v=>f(v).toString(16).padStart(2,'0')).join('')}

/* ---------- georeference ----------
   Grid coordinates: u = metres along the cross streets toward the East River (Fifth Avenue = 0),
                     v = metres along the avenues uptown (centre line of 34th Street = 0).
   The Manhattan grid is rotated 29 degrees clockwise from true north. Origin = Fifth Ave x 34th St. */
const D=Math.PI/180;
export const GEO={lat0:40.74845,lon0:-73.98455,bearing:29.0};
const cb=Math.cos(GEO.bearing*D),sb=Math.sin(GEO.bearing*D);
export const M_PER_DEG_LAT=111132.92-559.82*Math.cos(2*GEO.lat0*D)+1.175*Math.cos(4*GEO.lat0*D);
export const M_PER_DEG_LON=111412.84*Math.cos(GEO.lat0*D)-93.5*Math.cos(3*GEO.lat0*D);
export function gridToEN(u,v){return[u*cb+v*sb,-u*sb+v*cb]}
export function toLL(u,v){const[E,N]=gridToEN(u,v);return[GEO.lon0+E/M_PER_DEG_LON,GEO.lat0+N/M_PER_DEG_LAT]}
export function fromLL(lon,lat){const E=(lon-GEO.lon0)*M_PER_DEG_LON,N=(lat-GEO.lat0)*M_PER_DEG_LAT;return[E*cb-N*sb,E*sb+N*cb]}

export const AVES=[{n:'12th',u:-1950,w:36},{n:'11th',u:-1682,w:30},{n:'10th',u:-1408,w:30},{n:'9th',u:-1134,w:30},{n:'8th',u:-859,w:30},{n:'7th',u:-585,w:30},{n:'6th',u:-311,w:30},{n:'5th',u:0,w:30},{n:'Madison',u:155,w:24},{n:'Park',u:311,w:43},{n:'Lexington',u:467,w:24},{n:'3rd',u:622,w:30},{n:'2nd',u:838,w:30},{n:'1st',u:1067,w:30}];
export const vS=n=>(n-34)*80.47;
export const wS=n=>[34,42,57,59,23,72,79].includes(n)?30:18;
// Broadway's diagonal: Herald Sq (6th/34th) -> Times Sq (7th/45th) -> Columbus Circle (8th/59th)
export const ub=v=>v<885?-311-(v/885)*274:v<2012?-585-((v-885)/1127)*274:-859-(v-2012)*0.32;
const SH=[[-5700,120],[-4600,900],[-3200,2300],[-1700,2150],[-800,1500],[0,1300],[650,1310],[1200,1335],[2000,1410],[3000,1500],[7000,1800]];
const WH=[[-5700,-80],[-4650,-620],[-3300,-1150],[-1700,-1850],[-1000,-1985],[7000,-1985]];
const lerpPts=(P,v)=>{if(v<=P[0][0])return P[0][1];for(let i=0;i<P.length-1;i++)if(v<=P[i+1][0]){const t=(v-P[i][0])/(P[i+1][0]-P[i][0]);return P[i][1]+(P[i+1][1]-P[i][1])*t}return P[P.length-1][1]};
export const shoreE=v=>lerpPts(SH,v);
export const shoreW=v=>lerpPts(WH,v);
export const SHORE_PTS=SH,SHORE_WPTS=WH;
export const SHORE_W=-1985;

/* ---------- vectors & polygons (x = east, z = south) ---------- */
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrmz=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
export const centroid=p=>{let x=0,z=0;for(const q of p){x+=q[0];z+=q[1]}return[x/p.length,z/p.length]};
export const R=(w,d,cx=0,cz=0)=>[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]];
export const C=(w,d,c,cx=0,cz=0)=>{const a=w/2,b=d/2;return[[-a+c,-b],[a-c,-b],[a,-b+c],[a,b-c],[a-c,b],[-a+c,b],[-a,b-c],[-a,-b+c]].map(([x,z])=>[x+cx,z+cz])};
export const N=(w,d,n,cx=0,cz=0)=>{const a=w/2,b=d/2;return[[-a+n,-b],[a-n,-b],[a-n,-b+n],[a,-b+n],[a,b-n],[a-n,b-n],[a-n,b],[-a+n,b],[-a+n,b-n],[-a,b-n],[-a,-b+n],[-a+n,-b+n]].map(([x,z])=>[x+cx,z+cz])};
export const CIRC=(r,n,cx=0,cz=0,rot=Math.PI/n)=>Array.from({length:n},(_,i)=>{const a=rot+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cz+Math.sin(a)*r]});
export const lerpPoly=(a,b,f)=>a.map((p,i)=>[p[0]+(b[i][0]-p[0])*f,p[1]+(b[i][1]-p[1])*f]);
export function insetPoly(p,d){const c=centroid(p);return p.map(([x,z])=>{const dx=x-c[0],dz=z-c[1],l=Math.hypot(dx,dz)||1;const k=Math.max(0.2,1-d/l);return[c[0]+dx*k,c[1]+dz*k]})}
export function scalePoly(p,k,kz=k){const c=centroid(p);return p.map(([x,z])=>[c[0]+(x-c[0])*k,c[1]+(z-c[1])*kz])}
export function polyBox(p){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const[x,z]of p){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}return{x0,x1,z0,z1,w:x1-x0,d:z1-z0,cx:(x0+x1)/2,cz:(z0+z1)/2}}
export function polyArea(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}

/* ---------- prism builder: metre-based UVs + baked height shading in vertex colours ---------- */
export const ao=y=>0.64+0.36*smooth(-10,85,y);
function put(bk,p,n,u,v){bk.p.push(p[0],p[1],p[2]);bk.n.push(n[0],n[1],n[2]);bk.t.push(u,v);const a=ao(p[1]);bk.c.push(a,a,a)}
export function capInto(bk,poly,y,dir){
  const tris=THREE.ShapeUtils.triangulateShape(poly.map(q=>new THREE.Vector2(q[0],q[1])),[]);
  for(const t of tris){
    const P=t.map(k=>[poly[k][0],y,poly[k][1]]);
    const cn=cross(sub(P[1],P[0]),sub(P[2],P[0]));
    const ord=cn[1]*dir>=0?[0,1,2]:[0,2,1];
    for(const k of ord)put(bk,P[k],[0,dir,0],P[k][0]/6,P[k][2]/6);
  }
}
export function prismInto(out,bot,y0,y1,o={}){
  const top=o.to||bot,n=bot.length,c=centroid(bot);
  const get=mi=>out[mi]||(out[mi]={p:[],n:[],t:[],c:[]});
  let acc=o.uOff||0;
  for(let i=0;i<n;i++){
    const j=(i+1)%n;
    const A0=[bot[i][0],y0,bot[i][1]],B0=[bot[j][0],y0,bot[j][1]],A1=[top[i][0],y1,top[i][1]],B1=[top[j][0],y1,top[j][1]];
    const len=Math.hypot(B0[0]-A0[0],B0[2]-A0[2]);if(len<1e-4)continue;
    let nv=nrmz(cross(sub(B0,A0),sub(A1,A0)));
    const mx=(A0[0]+B0[0])/2-c[0],mz=(A0[2]+B0[2])/2-c[1];
    if(nv[0]*mx+nv[2]*mz<0)nv=[-nv[0],-nv[1],-nv[2]];
    const bk=get(o.edgeMat?o.edgeMat(i,nv):0);
    const vo=o.vOff||0;
    const V=[[A0,acc,y0+vo],[B0,acc+len,y0+vo],[B1,acc+len,y1+vo],[A1,acc,y1+vo]];
    let T=[0,1,2,0,2,3];
    if(dot(cross(sub(B0,A0),sub(B1,A0)),nv)<0)T=[0,2,1,0,3,2];
    for(const k of T)put(bk,V[k][0],nv,V[k][1],V[k][2]);
    acc+=len;
  }
  const cm=o.capMat??1;
  if(!o.noCap)capInto(get(cm),top,y1,1);
  if(o.bottom)capInto(get(cm),bot,y0,-1);
  return out;
}
function attrs(g,P,Nn,T,Cc){g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(T,2));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));return g}
export function bufGeo(b){return attrs(new THREE.BufferGeometry(),b.p,b.n,b.t,b.c)}
export function groupGeo(out){
  const g=new THREE.BufferGeometry();let n=0;const keys=Object.keys(out).map(Number).sort((a,b)=>a-b);
  for(const k of keys)n+=out[k].p.length/3;
  const P=new Float32Array(n*3),Nn=new Float32Array(n*3),T=new Float32Array(n*2),Cc=new Float32Array(n*3);let s=0;
  for(const k of keys){const b=out[k],cnt=b.p.length/3;if(!cnt)continue;P.set(b.p,s*3);Nn.set(b.n,s*3);T.set(b.t,s*2);Cc.set(b.c,s*3);g.addGroup(s,cnt,k);s+=cnt}
  return attrs(g,P,Nn,T,Cc);
}
export function ensureColor(g){if(!g.attributes.color){const a=new Float32Array(g.attributes.position.count*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(a,3))}return g}
