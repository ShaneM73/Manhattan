// Landmark definitions. u,v are grid metres (see core.js); local shapes use x = toward the East River, z = downtown.
// Heights, dates and designers are public record. Footprints, setback levels and interiors are approximations.
import { THREE, R, C, N, CIRC, insetPoly, scalePoly } from './core.js';
import { M, S, facadeMat } from './tex.js';
const vm=n=>(n-34)*80.47;

export const DEF=[
/* ============================== featured ============================== */
{id:'esb',tier:1,name:'Empire State Building',zh:'帝国大厦',addr:'350 Fifth Avenue, at West 34th Street',u:-80,v:vm(33.5),nopre:true,year:1931,h:443,roof:381,floors:102,
 arch:'Shreve, Lamb & Harmon (William F. Lamb)',struct:'Riveted steel frame, about 57,000 tons, with masonry infill',facade:'Indiana limestone and granite, aluminium spandrels, chrome-nickel steel mullions',
 hist:[['1929','The original Waldorf-Astoria Hotel on the site is demolished. John J. Raskob and former governor Al Smith lead the project.'],['1930-31','Work starts on 17 March 1930 and finishes in about 410 days. President Hoover opens it from Washington on 1 May 1931.'],['1930s','Leasing collapses in the Depression and the tower is nicknamed the "Empty State Building".'],['1931-1970','World\'s tallest building for nearly four decades.'],['1945','On 28 July a B-25 bomber lost in fog hits the 79th floor, killing 14 people.'],['1950','A broadcast antenna is added to the mooring mast, which was conceived for airships and never worked for them.'],['2009-19','Deep energy retrofit and rebuilt observatories. LED lighting from 2012.']],
 inside:['Three-storey Art Deco lobby; its gold-leaf ceiling murals were recreated in 2009','73 elevators in zoned banks serving low, middle and high rise','Open-air deck on 86 (about 320 m) and enclosed deck on 102 (about 373 m)','Central core with steel perimeter columns'],
 I:{fh:3.73,core:{w:30,d:16,y1:373},col:6,shafts:24,zones:[[0,90],[0,175],[0,262],[0,320]],special:[{y:0,h:9,k:'lobby',t:'Art Deco lobby, three storeys'},{y:294,h:3.7,k:'hist',t:'1945 B-25 impact, floor 79'},{y:320,h:3,k:'obs',t:'Floor 86 open-air deck, ~320 m'},{y:369,h:4,k:'obs',t:'Floor 102 deck, ~373 m',box:[12,12]}]},
 build(B){const m=M.esb,t=M.esbTop,fh=3.73;
  B.tier(R(129,56),0,25,m,{fh});B.tier(R(112,50),25,82,m,{fh});B.tier(N(88,44,6),82,92,m,{fh});B.tier(N(60,40,5),92,262,m,{fh});
  B.tier(N(52,35,4.5),262,290,t,{fh});B.tier(N(44,30,4),290,306,t,{fh});B.tier(C(36,26,4),306,320,t,{fh});
  B.tier(CIRC(10.5,8),320,352,t,{to:CIRC(8.6,8),fh});B.tier(CIRC(8.6,8),352,373,t,{to:CIRC(6,8),fh});
  B.cyl(2.6,6,8,0,373,0,M.steel,8);B.cyl(0.25,0.9,62,0,381,0,M.steelDark,8);for(const y of [392,405,418])B.cyl(1.4,1.4,0.8,0,y,0,M.steelDark,8);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;B.box(0.6,30,2.4,Math.cos(a)*9.7,321,Math.sin(a)*9.7,M.steel,Math.PI/2-a)}
  for(const [w,d,x,z] of [[36,0.3,0,13],[36,0.3,0,-13],[0.3,26,18,0],[0.3,26,-18,0]])B.box(w,1.4,d,x,320,z,M.steelDark);}},

{id:'chrysler',tier:1,name:'Chrysler Building',zh:'克莱斯勒大厦',addr:'405 Lexington Avenue, at East 42nd Street',u:505,v:vm(42.5),year:1930,h:319,roof:282,floors:77,
 arch:'William Van Alen',struct:'Steel frame with brick curtain walls',facade:'White and grey brick; Nirosta stainless-steel crown and ornament',
 hist:[['1928','Walter P. Chrysler takes over the project and pays for it personally as an investment for his children.'],['1929','Race with 40 Wall Street: the 38 m "Vertex" spire is assembled in secret inside the crown and raised in about 90 minutes on 23 October.'],['1930','Opens 27 May as the tallest building in the world. The Empire State Building overtakes it 11 months later.'],['Ornament','Automotive motifs: winged radiator caps at floor 31, eagle gargoyles at floor 61, a frieze of hubcaps.'],['1978','Designated a New York City landmark. The land belongs to Cooper Union.']],
 inside:['Red Moroccan marble lobby with the ceiling mural "Transport and Human Endeavor" by Edward Trumbull','Elevator doors inlaid with exotic woods in Art Deco patterns','The Cloud Club occupied floors 66 to 68','Seven stacked stainless arches with triangular windows form the crown'],
 I:{fh:3.8,core:{w:14,d:14,y1:246},col:5,shafts:12,zones:[[0,118],[0,236],[0,246]],special:[{y:0,h:7,k:'lobby',t:'Red marble lobby'},{y:114,h:4,k:'hist',t:'Floor 31, radiator-cap wings'},{y:232,h:4,k:'hist',t:'Floor 61, eagle gargoyles'},{y:248,h:11,k:'amen',t:'Cloud Club, floors 66-68',box:[24,24]},{y:282,h:37,k:'hist',t:'Vertex spire, raised in secret in 1929',box:[3,3]}]},
 build(B){const m=M.chrysler,fh=3.8;
  B.tier(R(51,56),0,62,m,{fh});B.tier(R(46,50),62,84,m,{fh});B.tier(R(41,44),84,106,m,{fh});B.tier(R(36,38),106,118,m,{fh});
  for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){B.box(5,1.2,1,sx*18.5,118,sz*19,M.steel,0);B.cyl(1,1,1.6,sx*18,118.2,sz*19,M.steel,12)}
  B.tier(C(30,30,1.5),118,236,m,{fh});
  for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;const e=B.box(1.4,1.6,7,Math.cos(a)*20.2,235.2,Math.sin(a)*20.2,M.steel,Math.PI/2-a);const bk=new THREE.Mesh(new THREE.ConeGeometry(0.8,2.2,6),B.m(M.steelDark));bk.rotation.x=Math.PI/2;bk.position.set(0,0,4.2);e.add(bk)}
  B.tier(R(28,28),236,246,M.steel,{fh});
  for(let i=0;i<7;i++){const s=27-3*i,y=246+5*i;B.tier(R(s,s),y,y+5,M.steel,{noFloors:true,roof:M.steel});
   const shp=new THREE.Shape();shp.moveTo(-s/2,0);shp.lineTo(s/2,0);shp.lineTo(s/2,2);shp.absarc(0,2,s/2,0,Math.PI,false);shp.lineTo(-s/2,0);
   const g=new THREE.ExtrudeGeometry(shp,{depth:0.45,bevelEnabled:false,curveSegments:24});const pa=g.attributes.position,ua=g.attributes.uv;const Hh=2+s/2;for(let k=0;k<pa.count;k++)ua.setXY(k,pa.getX(k)/s+0.5,pa.getY(k)/Hh);
   for(let f=0;f<4;f++){const a=f*Math.PI/2;const mesh=new THREE.Mesh(g,B.m(M.arch));mesh.position.set(Math.sin(a)*(s/2+0.05),y,Math.cos(a)*(s/2+0.05));mesh.rotation.y=a;B.add(mesh)}}
  B.cone(2.2,38,0,281,0,M.steel,8);}},

{id:'onev',tier:1,name:'One Vanderbilt',zh:'范德比尔特一号',addr:'1 Vanderbilt Avenue, at East 42nd Street',u:200,v:vm(42.5),year:2020,h:427,roof:397,floors:73,
 arch:'Kohn Pedersen Fox',struct:'Steel frame around a concrete core',facade:'Glass curtain wall with glazed terracotta spandrels',
 hist:[['2016-20','SL Green breaks ground in 2016 and opens the tower in September 2020 as Midtown\'s tallest office building.'],['The deal','In exchange for extra floor area the developer funded about $220 million of transit and public-space improvements around Grand Central.'],['Material','The terracotta refers to the Guastavino tile vaults inside Grand Central.'],['Base','The angled cut at the base opens a view of the terminal\'s cornice that had been hidden for almost a century.'],['2021','SUMMIT One Vanderbilt opens: mirrored rooms and glass ledges near the top.']],
 inside:['Lobby connects directly to Grand Central and to Grand Central Madison below','Four interlocking tapered volumes end at different heights','SUMMIT observation levels sit below the crown; highest occupied floor about 330 m','Floor counts differ by source: 73 on Wikipedia, 62 in the CTBUH database'],
 I:{fh:4.4,core:{w:22,d:20,y1:335},col:9,shafts:16,zones:[[0,120],[0,210],[0,300],[0,335]],special:[{y:0,h:9,k:'lobby',t:'Lobby linked to Grand Central'},{y:-16,h:9,k:'retail',t:'Transit hall: subway and Grand Central Madison',box:[34,30],x:25},{y:300,h:35,k:'obs',t:'SUMMIT observation levels, ~330 m',box:[24,22]}],underground:true},
 build(B){const m=M.onev;
  B.tier([[-27.5,-28],[27.5,-28],[27.5,14],[13.5,28],[-27.5,28]],0,20,M.onevBase,{fh:5});
  B.tier(C(52,52,6),20,300,m,{to:C(30,28,4),fh:4.4});
  for(const [sx,sz,h] of [[1,-1,150],[-1,-1,218],[-1,1,262],[1,1,192]]){const bot=R(27.4,27.4,sx*13.3,sz*13.3);const top=bot.map(([x,z])=>[sx*6+(x-sx*6)*0.38,sz*6+(z-sz*6)*0.38]);B.tier(bot,20,h,m,{to:top,noFloors:true})}
  B.tier(C(30,28,4),300,335,m,{to:C(22,20,3),fh:4.4});
  B.box(3,3.2,7,-14.2,316,-6,M.glassClear);B.box(7,3.2,3,4,316,-13.4,M.glassClear);
  B.tier(C(22,20,3),335,398,M.onevCrown,{to:C(4,4,0.8),noFloors:true});
  B.cyl(0.12,1.1,29,0,398,0,M.steel,8);}},

{id:'gct',tier:1,name:'Grand Central Terminal',zh:'中央车站',addr:'89 East 42nd Street, at Park Avenue',u:311,v:722,nopre:true,year:1913,h:46,roof:36,floors:'4 above ground',
 arch:'Reed & Stem; Warren & Wetmore',struct:'Steel frame with masonry; Beaux-Arts',facade:'Stony Creek granite base, Indiana limestone',
 hist:[['1871','Cornelius Vanderbilt builds Grand Central Depot. Electrification from 1903 allows the tracks to be buried and the station rebuilt.'],['1913','Opens 2 February. With the rail yard decked over, Park Avenue and "Terminal City" grow on top.'],['1968-78','Plans for a tower over the terminal set off a preservation campaign led by Jacqueline Kennedy Onassis. The Supreme Court\'s 1978 Penn Central ruling upholds landmark law.'],['1998','Restoration cleans the tobacco-darkened ceiling, leaving one small dark patch as evidence.'],['2023','Grand Central Madison opens deep below for the Long Island Rail Road.']],
 inside:['Main Concourse about 84 x 37 m under a 38 m ceiling','Celestial ceiling after Paul Helleu, with the constellations mirrored','Four-faced brass clock on the information booth','Two track levels below: 41 tracks above, 26 below'],
 I:{nocore:true,col:0,special:[{y:0,h:37,k:'lobby',t:'Main Concourse, ~84 x 37 x 38 m',box:[84,37]},{y:-11,h:3,k:'retail',t:'Upper level: 41 tracks',box:[100,120],z:-60},{y:-19,h:3,k:'retail',t:'Lower level: 26 tracks',box:[70,110],z:-55}],underground:true},
 build(B){const side={set:S.gctSide,mat:facadeMat(S.gctSide)};
  B.faceBox(120,36,116,0,0,0,[side,side,M.roof,M.roof,{set:S.gctFront,mat:facadeMat(S.gctFront)},side]);B.part(R(120,116),0,36);
  B.box(84,7,40,0,36,0,M.copper);B.tier(R(84,40),43,46,M.copper,{to:R(70,26),noFloors:true,roof:M.copper});
  const sp=new THREE.Mesh(new THREE.PlaneGeometry(32,14),B.m(M.sculpt));sp.position.set(0,43,58.1);B.add(sp);}},

{id:'metlife',tier:1,name:'MetLife Building',zh:'大都会人寿大厦',addr:'200 Park Avenue (former Pan Am Building)',u:311,v:832,nopre:true,year:1963,h:246,roof:246,floors:59,
 arch:'Emery Roth & Sons with Walter Gropius and Pietro Belluschi',struct:'Steel frame built over the live tracks',facade:'Precast concrete panels with projecting ribs',
 hist:[['1963','Opens as Pan Am\'s headquarters, the largest commercial office building in the world by floor area at the time. It closes the vista down Park Avenue and is widely criticised.'],['1965','A rooftop heliport starts flights to the airports. It closes for good after a 1977 accident that killed five people.'],['1981','Metropolitan Life buys the building; the Pan Am signs come down in the early 1990s.']],
 inside:['Lobby opens into Grand Central\'s concourse','The Park Avenue Viaduct wraps around the base','Elongated octagon with its long axis across Park Avenue'],
 I:{fh:3.9,core:{w:44,d:14,y1:246},col:7.5,shafts:20,zones:[[0,100],[0,170],[0,246]],special:[{y:0,h:10,k:'lobby',t:'Lobby to Grand Central'},{y:246,h:2,k:'hist',t:'Rooftop heliport, 1965-1977',box:[30,30]}]},
 build(B){B.tier(R(112,84),0,40,M.metlife,{fh:3.9});B.tier(C(92,45,14),40,246,M.metlife,{fh:3.9});B.cyl(15,15,0.6,0,246,0,M.heli,40);}},

{id:'p270',tier:1,name:'270 Park Avenue',zh:'摩根大通总部',addr:'JPMorgan Chase headquarters, East 47th to 48th Street',u:228,v:vm(47.5),preEnd:1960,year:2025,h:423,roof:423,floors:60,
 arch:'Foster + Partners',struct:'Steel; fan columns and transfer trusses lift the tower off the ground',facade:'Glass with bronze-toned exposed structure',
 hist:[['1960-2019','The site held SOM\'s Union Carbide Building, 215 m and 52 storeys.'],['2019-21','It becomes the tallest building ever demolished by its owner.'],['2017','The Midtown East rezoning lets the bank buy air rights from landmarks such as Grand Central and St. Patrick\'s.'],['Design','Fan-shaped columns gather the loads into a few points, leaving a lobby about 25 m high and wider sidewalks.'],['2025','Opens as an all-electric tower for about 14,000 employees.']],
 inside:['Fan columns land between the train tracks that run under the site','Stepped silhouette with a strengthened level at each setback','Crown holds mechanical plant'],
 I:{fh:4.6,core:{w:30,d:18,y1:410},col:9,shafts:20,zones:[[25,150],[25,260],[25,375],[25,410]],special:[{y:0,h:25,k:'lobby',t:'Fan columns and ~25 m lobby',box:[60,30]},{y:25,h:5,k:'mech',t:'Transfer truss level'},{y:410,h:13,k:'mech',t:'Crown plant',box:[48,30]}]},
 build(B){const w=M.whiteSteel;B.box(30,25,18,0,0,0,M.concrete);B.tier(R(60,28),0,12,M.lobbyGlass,{noFloors:true});
  for(const sz of [1,-1])for(const x of [-30,30])for(const dx of [-15,-5,5,15])B.strut([x,0,sz*17],[x+dx,25,sz*24],0.75,w);
  for(const sx of [1,-1])for(const dz of [-18,-6,6,18])B.strut([sx*38,0,0],[sx*48,25,dz],0.75,w);
  B.tier(R(96,48),25,30,w,{noFloors:true,bottom:true});
  B.tier(R(96,48),30,205,M.p270,{fh:4.6});B.tier(R(96,48),205,209,w,{noFloors:true});
  B.tier(R(84,46),209,295,M.p270,{fh:4.6});B.tier(R(84,46),295,299,w,{noFloors:true});
  B.tier(R(72,44),299,375,M.p270,{fh:4.6});B.tier(R(72,44),375,379,w,{noFloors:true});
  B.tier(R(60,42),379,410,M.p270,{fh:4.6});B.tier(R(54,38),410,423,w,{noFloors:true});
  for(const sz of [1,-1])for(const x0 of [-48,0]){B.strut([x0,30,sz*24.2],[x0+48,62,sz*24.2],0.6,w);B.strut([x0+48,30,sz*24.2],[x0,62,sz*24.2],0.6,w)}}},

{id:'rock',tier:1,name:'Rockefeller Center',zh:'洛克菲勒中心',addr:'30 Rockefeller Plaza and neighbours, West 48th to 51st Street',u:-215.5,v:vm(49.5),lots:[[-296,-15,vm(48)+9,vm(51)-9]],year:1933,h:259,roof:259,floors:66,
 arch:'Associated Architects, led by Raymond Hood',struct:'Steel frame',facade:'Indiana limestone with continuous vertical piers',
 hist:[['1930','John D. Rockefeller Jr. leases the land from Columbia University and pushes ahead alone after the 1929 crash.'],['1932','"Lunch atop a Skyscraper" is photographed on a beam of the rising RCA Building.'],['1933-34','Diego Rivera\'s lobby mural is destroyed over its portrait of Lenin and replaced by Josep Maria Sert\'s "American Progress".'],['NBC','Long-time home of NBC. Studio 8H has hosted Saturday Night Live since 1975.'],['2005','The roof decks reopen as Top of the Rock.'],['2015','30 Rock is renamed the Comcast Building.']],
 inside:['Hood\'s rule: no desk more than about 8 m (27 ft) from a window','The slab steps in where each elevator bank ends','Rainbow Room on floor 65; Top of the Rock on 67 to 70','The sunken plaza becomes the skating rink each winter'],
 I:{fh:3.9,core:{w:48,d:12,x:15,y1:247},col:6,shafts:24,zones:[[0,80],[0,140],[0,200],[0,247]],special:[{y:0,h:10,k:'lobby',t:'Lobby with Sert\'s "American Progress"',box:[100,30],x:15},{y:30,h:9,k:'amen',t:'NBC Studio 8H',box:[30,22],x:-10},{y:239,h:5,k:'amen',t:'Floor 65, Rainbow Room',box:[60,27],x:15},{y:247,h:12,k:'obs',t:'Top of the Rock, floors 67-70',box:[50,26],x:15}]},
 build(B){const m=M.rock,fh=3.9,X=15;
  B.tier(R(160,61),0,30,m,{fh});B.tier(R(40,61,-60,0),30,70,m,{fh});
  B.tier(R(104,32,X,0),30,190,m,{fh});B.tier(R(92,31,X,0),190,215,m,{fh});B.tier(R(78,30,X,0),215,235,m,{fh});B.tier(R(64,29,X,0),235,247,m,{fh});B.tier(R(52,27,X,0),247,256,m,{fh});B.tier(R(40,25,X,0),256,259,m,{fh});
  // the ensemble
  B.tier(R(42,50,135,-81),0,156,m,{fh});B.tier(R(60,58,150,-81),0,24,m,{fh});                // International Building
  for(const z of [-100,-62,61,99])B.tier(R(40,22,180,z),0,27,m,{fh,roof:M.grass});            // Fifth Avenue low wings
  for(const z of [-19,19])B.tier(R(55,22,172,z),0,27,m,{fh,roof:M.grass});                    // British Empire Bldg, La Maison Francaise
  B.tier(R(24,58,125,80),0,149,m,{fh});B.tier(R(60,58,15,80),0,65,m,{fh});                    // 1 and 10 Rockefeller Plaza
  B.tier(R(60,58,15,-81),0,60,m,{fh});B.tier(R(40,58,-60,-81),0,125,m,{fh});B.tier(R(24,58,-27,-81),0,35,m,{fh}); // 50 Rock, 1270 Sixth, Radio City
  B.tier(R(40,58,-60,80),0,78,m,{fh});
  B.box(34,0.25,24,116,-0.05,0,M.ice);B.box(40,0.15,30,116,-0.12,0,M.granite);B.box(62,0.3,8,172,0.1,0,M.grass);
  B.cyl(1.2,1.2,1.5,97,0,0,M.gold,16);B.box(4,1,1.5,97,1.6,0,M.gold);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;B.cyl(0.08,0.08,9,116+Math.cos(a)*21,0,Math.sin(a)*15,M.steelDark,6)}}},

{id:'boa',tier:1,name:'Bank of America Tower',zh:'美国银行大厦',addr:'One Bryant Park, Sixth Avenue at West 42nd Street',u:-366,v:vm(42.5),year:2009,h:366,roof:291,floors:55,
 arch:'COOKFOX Architects',struct:'Steel frame around a concrete core',facade:'Low-iron insulating glass with ceramic frit',
 hist:[['2004-09','Developed by the Durst Organization with Bank of America.'],['Green','First commercial skyscraper to earn LEED Platinum certification.'],['Form','The faceted crystal shape is often linked to the Crystal Palace that stood in Bryant Park in 1853.'],['Theatre','The facade of the 1918 Henry Miller\'s Theatre is kept; the rebuilt house is now the Stephen Sondheim Theatre.'],['Spire','An architectural spire of about 77 m brings the height to 366 m; the roof is at about 291 m.']],
 inside:['Ice storage in the basement: made at night, melted for cooling by day','On-site cogeneration plant of about 4.6 MW','Rainwater and greywater reuse'],
 I:{fh:5,core:{w:24,d:18,y1:291},col:9,shafts:18,zones:[[0,120],[0,200],[0,291]],special:[{y:-14,h:10,k:'mech',t:'Ice-storage tanks',box:[44,30]},{y:0,h:12,k:'lobby',t:'Lobby and Stephen Sondheim Theatre',box:[50,36]},{y:291,h:75,k:'hist',t:'Spire, ~77 m',box:[4,4]}],underground:true},
 build(B){const m=M.boa;B.tier(R(75,56),0,30,m,{fh:5});
  const b0=[[-31,-25],[20,-25],[31,-14],[31,25],[-20,25],[-31,14]],b1=[[-27,-22],[16,-23],[28,-11],[27,22],[-17,22],[-28,11]],b2=[[-21,-17],[12,-19],[23,-8],[21,17],[-13,19],[-23,8]];
  B.tier(b0,30,160,m,{to:b1,fh:5});B.tier(b1,160,280,m,{to:b2,fh:5});B.tier(b2,280,291,M.boaTop,{to:insetPoly(b2,6),noFloors:true});
  for(const [x,z] of [[-3,-3],[3,-3],[3,3],[-3,3]])B.strut([x,291,z],[0,362,0],0.35,M.steel);B.cyl(0.15,0.6,75,0,291,0,M.steel,8);}},

{id:'seagram',tier:1,name:'Seagram Building',zh:'西格拉姆大厦',addr:'375 Park Avenue, East 52nd to 53rd Street',u:373,v:vm(52.5),lots:[[332,455,vm(52)+9,vm(53)-9]],year:1958,h:157,roof:157,floors:38,
 arch:'Ludwig Mies van der Rohe with Philip Johnson',struct:'Steel frame encased in concrete',facade:'Bronze mullions and spandrels, topaz-tinted glass',
 hist:[['1954','Phyllis Lambert persuades her father, Seagram\'s Samuel Bronfman, to hire Mies.'],['Plaza','The tower stands about 27 m back from Park Avenue behind a granite plaza. The 1961 zoning code rewarded plazas because of it.'],['Bronze','The bronze I-beams on the facade carry no load; they show the hidden steel frame.'],['Order','Blinds have only three positions, open, half and closed, to keep the facade uniform.'],['Dining','Johnson\'s Four Seasons restaurant is itself an interior landmark, now The Grill and The Pool.'],['1988','Designated a New York City landmark.']],
 inside:['Service core at the back forms a spine; office floors are column-free to the glass','Window module about 1.4 m, matched to the structural bay','Glass lobby set back behind an open arcade'],
 I:{fh:4.1,core:{w:10,d:22,x:14,y1:157},col:8.5,shafts:10,zones:[[0,80],[0,157]],special:[{y:0,h:7,k:'lobby',t:'Glass lobby behind arcade'},{y:3,h:8,k:'amen',t:'Former Four Seasons restaurant',box:[22,54],x:35}]},
 build(B){const m=M.seagram;B.tier(R(26,44),0,157,m,{fh:4.1});B.tier(R(10,26,18,0),0,157,m,{fh:4.1});B.tier(R(24,62,35,0),0,36,m,{fh:4.1});
  B.plate(R(29,62,-27.5,0),0,M.granite);for(const z of [-19,19])B.box(12,0.5,10,-28,0.1,z,M.pool);
  const pts=[];const ed=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/1.42);for(let i=0;i<=n;i++)pts.push([x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,Math.abs(x1-x0)>0.1?'z':'x'])};
  ed(-13.1,-22.1,13.1,-22.1);ed(-13.1,22.1,13.1,22.1);ed(-13.1,-22.1,-13.1,22.1);
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),B.m(M.bronze),pts.length);const mt=new THREE.Matrix4();
  pts.forEach(([x,z,o],i)=>{mt.compose(new THREE.Vector3(o==='x'?x-0.15:x,80.5,o==='z'?z+Math.sign(z)*0.15:z),new THREE.Quaternion(),new THREE.Vector3(o==='x'?0.32:0.16,153,o==='z'?0.32:0.16));im.setMatrixAt(i,mt)});B.add(im);}},

{id:'p432',tier:1,name:'432 Park Avenue',zh:'公园大道432号',addr:'East 56th to 57th Street',u:250,v:vm(56.5),preEnd:1926,year:2015,h:426,roof:426,floors:85,
 arch:'Rafael Vinoly',struct:'All concrete: central core tied to a perimeter tube',facade:'Exposed white concrete grid with windows about 3 m (10 ft) square',
 hist:[['2007','The 1926 Drake Hotel is demolished for the site.'],['2015','Completed as the tallest residential building in the Western Hemisphere, about 15 times taller than it is wide. Marketing floor numbers reach 96.'],['Grid','Six windows per floor on each face. Vinoly said the idea came from a Josef Hoffmann waste basket.'],['Wind','Open double-height mechanical floors about every 12 storeys let wind pass through.'],['2021','Residents report leaks, elevator faults and noise; the condo board sues the developers.']],
 inside:['Concrete core about 9 m square','The perimeter columns are the window grid: six bays per side','Two tuned mass dampers near the top'],
 I:{fh:4.7,core:{w:9,d:9,y1:426},col:4.75,colMat:'concrete',shafts:4,zones:[[0,392],[0,330],[0,264],[0,392]],special:[{y:57,h:9,k:'mech',t:'Open mechanical floors x5: wind passes through'},{y:123,h:9,k:'mech'},{y:189,h:9,k:'mech'},{y:255,h:9,k:'mech'},{y:321,h:9,k:'mech'},{y:404,h:10,k:'tmd',t:'Tuned mass dampers x2',box:[14,7]}]},
 build(B){const sq=R(28.5,28.5);const segs=[[0,57],[66,123],[132,189],[198,255],[264,321],[330,392]];
  segs.forEach(([a,b],i)=>B.tier(sq,a,b,M.p432,{fh:4.7,bottom:i>0}));for(let i=0;i<5;i++)B.tier(sq,segs[i][1],segs[i+1][0],M.p432open,{noFloors:true,noCap:true});
  B.tier(sq,392,425,M.p432open,{noFloors:true,noCap:true});B.tier(sq,425,426,M.p432,{noFloors:true});B.box(9,425,9,0,0,0,M.concrete);
  for(const [x,z] of [[-14,-14],[14,-14],[14,14],[-14,14]])B.box(0.6,425,0.6,x,0,z,M.concrete);}},

{id:'steinway',tier:1,name:'Steinway Hall',zh:'斯坦威大厅',addr:'109 West 57th Street',u:-357,v:1880,nopre:true,year:1925,h:66,roof:58,floors:16,
 arch:'Warren & Wetmore',struct:'Steel frame, stone clad',facade:'Indiana limestone, neoclassical',
 hist:[['1925','Showroom and recital hall of Steinway & Sons, anchor of 57th Street\'s piano row.'],['Landmark','The exterior is designated in 2001 and the rotunda interior in 2013.'],['2014','Folded into 111 West 57th Street and restored as the base and entrance of the new tower.']],
 inside:['Domed octagonal rotunda with murals, preserved','Offices and piano studios above'],
 I:{fh:4,nocore:true,col:0,special:[{y:0,h:9,k:'lobby',t:'Rotunda (interior landmark)',box:[14,14]}]},
 build(B){B.tier(R(30,30),0,30,M.classic,{fh:4});B.tier(R(18,16),30,58,M.classic,{fh:4});B.pyr(R(18,16),58,66,M.copper);}},

{id:'w57',tier:1,name:'111 West 57th Street',zh:'斯坦威大厦',addr:'Steinway Tower, West 57th to 58th Street',u:-386,v:vm(57.5),year:2021,h:435,roof:435,floors:84,
 arch:'SHoP Architects',struct:'High-strength concrete shear walls and core',facade:'East and west: undulating glazed terracotta with bronze. North and south: glass',
 hist:[['Slender','About 24 times taller than it is wide, often called the most slender skyscraper in the world.'],['Reuse','Steinway Hall is restored as the entrance.'],['Facade','Terracotta piers ripple up the side walls; the south face feathers back in steps like a 1920s setback tower.'],['2014-21','Starts in 2014, tops out in 2019, completes in 2021 after financing disputes.']],
 inside:['Two concrete shear walls on the east and west take most of the wind load','Tuned mass damper of about 800 tons at the top','Many apartments fill an entire floor'],
 I:{fh:5.2,core:{w:8,d:12,z:-6,y1:428},col:0,shafts:4,zones:[[0,428],[0,300]],special:[{y:416,h:10,k:'tmd',t:'Tuned mass damper, ~800 tons',box:[10,5],z:-16}],walls:true},
 build(B){const T=[[0,230,45],[230,262,40],[262,292,35],[292,320,30],[320,346,25],[346,370,20],[370,392,15],[392,412,10],[412,428,6],[428,435,3]];
  for(const [a,b,d] of T)B.tier(R(18,d,0,-22.5+d/2),a,b,M.s111tc,{fh:5.2,extra:[M.s111glass],edgeMat:(i,n)=>Math.abs(n[0])>0.5?0:2});}},

{id:'one57',tier:1,name:'One57',zh:'One57',addr:'157 West 57th Street',u:-520,v:vm(57.5),year:2014,h:306,roof:306,floors:75,
 arch:'Christian de Portzamparc',struct:'Reinforced concrete',facade:'Bands of glass in several blues; curved, cascading roofs',
 hist:[['2014','The first of the very tall condominium towers of "Billionaires\' Row".'],['2012','During Hurricane Sandy the tower crane\'s boom collapses and dangles above 57th Street; nearby blocks are evacuated.'],['Use','Park Hyatt hotel on the lower floors, apartments above.']],
 inside:['Hotel below, residences above','Roof drops in curved steps toward the south'],
 I:{fh:4.1,core:{w:12,d:12,z:-4,y1:300},col:7,colMat:'concrete',shafts:8,zones:[[0,160],[0,300]],special:[{y:0,h:150,k:'amen',t:'Park Hyatt hotel floors',box:[30,34],z:-4},{y:298,h:6,k:'hist',t:'2012: crane boom collapse',box:[4,4]}]},
 build(B){B.tier(R(50,56),0,60,M.one57,{fh:4.1});B.tier(R(34,40,0,-4),60,226,M.one57,{fh:4.1});
  for(let y=226;y<306;y+=4){const f=(y-226)/80;const d=Math.max(4,40*Math.sqrt(1-f));B.tier(R(34-6*f,d,0,16-d/2),y,y+4,M.one57,{fh:4.1})}}},

{id:'cpt',tier:1,name:'Central Park Tower',zh:'中央公园大厦',addr:'225 West 57th Street',u:-680,v:vm(57.5),year:2020,h:472,roof:472,floors:98,
 arch:'Adrian Smith + Gordon Gill Architecture',struct:'Reinforced concrete core and outriggers',facade:'Glass with satin stainless-steel fins',
 hist:[['Record','Tallest residential building in the world, with the highest roof outside Asia.'],['2019','Tops out in September; the seven-level Nordstrom flagship opens in the base.'],['Cantilever','From about 91 m (300 ft) the tower projects east over the Art Students League so that more apartments face Central Park.'],['Developer','Extell, which also built One57.']],
 inside:['Department store in the first seven levels','Cantilevered floors hang from strengthened levels tied to the core','Residents\' club and plant in the crown'],
 I:{fh:4.8,core:{w:18,d:14,x:2,y1:440},col:7.5,colMat:'concrete',shafts:10,zones:[[45,200],[45,330],[45,440]],special:[{y:0,h:45,k:'retail',t:'Nordstrom flagship, 7 levels'},{y:89,h:3,k:'hist',t:'Cantilever begins, ~91 m',box:[10,30],x:26},{y:440,h:30,k:'mech',t:'Crown: club and plant',box:[40,22]}]},
 build(B){B.tier(R(60,56),0,45,M.cptBase,{fh:6});B.tier(R(44,30),45,91,M.cpt,{fh:4.8});const bands=[91,140,200,265,330,395,440];
  for(let i=0;i<bands.length-1;i++){B.tier(R(53,30,4.5,0),bands[i],bands[i+1]-2.5,M.cpt,{fh:4.8,bottom:i===0});B.tier(R(51.5,28.5,4.5,0),bands[i+1]-2.5,bands[i+1],M.steel,{noFloors:true})}
  B.tier(R(50,27,4.5,0),440,472,M.cptCrown,{noFloors:true});}},

{id:'nypl',tier:1,name:'New York Public Library',zh:'纽约公共图书馆',addr:'Stephen A. Schwarzman Building, 476 Fifth Avenue',u:-62,v:561,nopre:true,lots:[[-296,-15,vm(40)+9,vm(42)-15]],year:1911,h:30,roof:28,floors:'3 above ground',
 arch:'Carrere & Hastings',struct:'Masonry and steel',facade:'Vermont marble, Beaux-Arts',
 hist:[['1911','Opens 23 May on the site of the Croton Distributing Reservoir.'],['Lions','The marble lions were later named Patience and Fortitude by Mayor La Guardia.'],['Stacks','Book stacks extend under Bryant Park behind the building.']],
 inside:['Rose Main Reading Room on the third floor, about 90 x 24 m and 16 m high','Seven levels of steel stacks originally held up the reading room'],
 I:{fh:7,nocore:true,col:0,special:[{y:17,h:10,k:'amen',t:'Rose Main Reading Room, ~90 x 24 m',box:[24,90],x:-18}]},
 build(B){B.tier(R(75,120),0,22,M.classic,{fh:7});B.tier(R(60,100),22,28,M.classic,{fh:6});
  for(let i=0;i<6;i++)B.cyl(0.8,0.8,14,39.5,4,-11+i*4.4,M.marble,16);B.box(4,3,28,40,18,0,M.marble);B.box(10,4,34,42,0,0,M.marble);for(const z of [-15,15]){B.box(3,2,2,44,4,z,M.marble);B.box(2.4,1.6,1.2,44,6,z,M.marble)}
  B.plate(R(170,118,-143,0),0.05,M.grass);B.plate(R(110,60,-143,0),0.12,M.grass);}},

{id:'citi',tier:1,name:'Citigroup Center',zh:'花旗集团中心',addr:'601 Lexington Avenue, East 53rd to 54th Street',u:512,v:vm(53.5),year:1977,h:279,roof:279,floors:59,
 arch:'Hugh Stubbins & Associates; structural engineer William LeMessurier',struct:'Steel, braced in eight-storey chevrons, standing on four mid-face columns',facade:'Aluminium bands and ribbon glass',
 hist:[['1977','The tower stands on four stilts about 35 m tall, placed at the middle of each side so that St. Peter\'s Church could keep its corner.'],['Crown','The 45-degree top was first meant to carry solar collectors.'],['1978','After a student\'s question, LeMessurier finds that diagonal winds and bolted joints leave the tower at risk. Welders reinforce it at night that summer; the story stays quiet until 1995.'],['Damper','One of the first skyscrapers with a tuned mass damper, a concrete block of about 400 tons.']],
 inside:['Corners cantilever about 22 m from the stilts','Chevron braces channel loads to the four columns and the core','Tuned mass damper inside the sloped crown'],
 I:{fh:3.9,core:{w:20,d:20,y1:248},col:8,shafts:16,zones:[[35,120],[35,190],[35,248]],special:[{y:0,h:35,k:'lobby',t:'Four stilts, ~35 m: tower floats over the plaza',box:[48,48]},{y:252,h:8,k:'tmd',t:'Tuned mass damper, ~400 tons',box:[10,10],z:-8}]},
 build(B){const m=M.citi;for(const [x,z] of [[0,20.3],[0,-20.3],[20.3,0],[-20.3,0]])B.box(7.3,35,7.3,x,0,z,m);B.box(20,35,20,0,0,0,M.concrete);
  B.tier(R(48,48),35,248,m,{fh:3.9,bottom:true});B.tier(R(48,48),248,279,M.citiTop,{to:[[-24,-24],[24,-24],[24,-23.8],[-24,-23.8]],noFloors:true,roof:M.steel});
  B.tier(R(36,30,-10,38),0,12,m,{noFloors:true});}},

{id:'hearst',tier:1,name:'Hearst Tower',zh:'赫斯特大厦',addr:'300 West 57th Street, at Eighth Avenue',u:-905,v:vm(56.5),nopre:true,year:2006,h:182,roof:182,floors:46,
 arch:'Foster + Partners, on Joseph Urban\'s 1928 base',struct:'Steel diagrid of four-storey triangles',facade:'Stainless-steel diagrid and glass over a cast-stone base',
 hist:[['1928','Joseph Urban completes a six-storey base for William Randolph Hearst, meant to carry a tower that the Depression cancelled.'],['2006','Foster\'s tower finally rises from the hollowed-out landmark shell.'],['Diagrid','The triangulated frame uses roughly a fifth less steel than a conventional frame.'],['Green','First office tower in New York City to earn LEED Gold.']],
 inside:['The old base is one tall atrium with a water sculpture, "Icefall"','No vertical columns on the perimeter','Corners are cut back into "bird\'s mouths" where the triangles meet'],
 I:{fh:4.1,core:{w:14,d:20,x:-10,y1:182},col:0,shafts:10,zones:[[26,110],[26,182]],special:[{y:0,h:26,k:'lobby',t:'Atrium inside the 1928 shell',box:[56,56]}]},
 build(B){B.tier(R(61,61),0,26,M.classic,{fh:4.4});B.tier(C(48,36,5),26,182,M.hearst,{fh:4.1});}},

{id:'un',tier:1,name:'United Nations Headquarters',zh:'联合国总部',addr:'First Avenue, East 42nd to 48th Street',u:1170,v:780,nopre:true,lots:[[1085,1330,vm(42)+15,vm(48)-9]],year:1952,h:154,roof:154,floors:39,
 arch:'Board of Design under Wallace K. Harrison, with Oscar Niemeyer and Le Corbusier',struct:'Steel frame',facade:'Green-tinted glass on the long sides, Vermont marble on the narrow ends',
 hist:[['1946','John D. Rockefeller Jr. gives $8.5 million to buy the slaughterhouse district of Turtle Bay for the UN.'],['1947','An international board merges Niemeyer\'s and Le Corbusier\'s schemes into one plan.'],['1952','The complex is completed. The Secretariat is among the first large glass curtain walls in New York.'],['Status','The site is international territory under an agreement with the United States.']],
 inside:['Secretariat slab is only about 22 m deep','General Assembly Hall seats more than 1,800 under a shallow dome','Mechanical floors show as grilles across the slab'],
 I:{fh:3.85,core:{w:8,d:40,z:20,y1:154},col:8,shafts:12,zones:[[0,60],[0,110],[0,154]],special:[{y:0,h:22,k:'amen',t:'General Assembly Hall',box:[46,60],x:8,z:-120}]},
 build(B){B.tier(R(22,87,0,20),0,154,M.un,{fh:3.85,extra:[M.marble],edgeMat:(i,n)=>Math.abs(n[2])>0.5?2:0});
  B.tier([[-22,-70],[38,-70],[30,-175],[-14,-175]],0,22,M.marble,{noFloors:true,roof:M.roofL});B.cyl(13,16,5,8,22,-125,M.copper,24);
  B.tier(R(60,70,45,-20),0,14,M.un,{fh:4.5});B.tier(R(40,30,-10,82),0,18,M.marble,{noFloors:true});
  B.plate(R(110,110,60,-235),0.05,M.grass);}},

/* ============================== supporting cast ============================== */
{id:'helmsley',tier:2,name:'Helmsley Building',zh:'赫尔姆斯利大厦',addr:'230 Park Avenue, East 45th to 46th Street',u:311,v:vm(45.5),nopre:true,year:1929,h:172,floors:35,
 arch:'Warren & Wetmore',struct:'Steel frame',facade:'Brick and limestone; gilded copper roof',
 hist:[['1929','Built as the New York Central Building, the railroad\'s headquarters and the crown of Terminal City.'],['Traffic','Park Avenue runs through two arched portals in its base.']],inside:['Lobby between the two road tunnels'],
 I:{fh:4},build(B){const m=M.helmsley;B.tier(R(105,61),0,58,m,{fh:4});B.tier(R(66,48),58,100,m,{fh:4});B.tier(R(42,36),100,140,m,{fh:4});
  B.tier(R(42,36),140,160,M.copper,{to:R(12,10),noFloors:true,roof:M.copper});B.cyl(4,5,8,0,160,0,M.gold,8);B.cone(4,6,0,168,0,M.gold,8);
  for(const x of [-18,18])B.box(10,9,62,x,0,0,M.slate);}},
{id:'lever',tier:2,name:'Lever House',zh:'利华大厦',addr:'390 Park Avenue, East 53rd to 54th Street',u:258,v:vm(53.5),year:1952,h:94,floors:21,
 arch:'Skidmore, Owings & Merrill (Gordon Bunshaft, Natalie de Blois)',struct:'Steel frame',facade:'Blue-green glass and stainless steel',
 hist:[['1952','A thin slab hovering over a one-storey podium on columns: among the first sealed glass curtain-wall offices in the United States.'],['1982','Designated a landmark; the curtain wall was replaced in a 2001 restoration.']],inside:['Open plaza and garden court under the raised podium'],
 I:{fh:3.8,core:{w:14,d:9,x:-12,z:-21,y1:94},col:0},build(B){const m=M.lever;for(const x of [-21,-7,7,21])for(const z of [-25,-8,8,25])B.cyl(0.45,0.45,6,x,0,z,M.steel,10);
  B.tier(R(20,12,-10,-21),0,6,M.lobbyGlass,{noFloors:true});B.tier(R(50,58),6,11,m,{fh:5,bottom:true,roof:M.grass});B.tier(R(50,16,0,-21),11,94,m,{fh:3.8});}},
{id:'moma53',tier:2,name:'53 West 53',zh:'西53街53号',addr:'Tower above the Museum of Modern Art',u:-210,v:vm(53.5),year:2019,h:320,floors:77,
 arch:'Ateliers Jean Nouvel',struct:'Concrete with an exposed diagonal grid',facade:'Dark glass crossed by the diagrid',
 hist:[['2009','City Planning approves the tower only after about 60 m (200 ft) is cut from its proposed height.'],['2019','Completed with new MoMA galleries on three of the lower floors.']],inside:['Tapering floors: each apartment plan is different'],
 I:{fh:4.1},build(B){const m=M.moma;B.tier(R(44,56),0,180,m,{to:R(30,40,-2,-4),fh:4.1});B.tier(R(30,40,-2,-4),180,320,m,{to:R(3,3,-6,-14),fh:4.1});
  B.tier(R(22,28,11,14),110,255,m,{to:R(2,2,12,8),noFloors:true});B.tier(R(22,26,-11,15),140,288,m,{to:R(2,2,-12,6),noFloors:true});}},
{id:'att550',tier:2,name:'550 Madison Avenue',zh:'麦迪逊大道550号',addr:'Former AT&T and Sony Building, East 55th to 56th Street',u:113,v:vm(55.5),year:1984,h:197,floors:37,
 arch:'Philip Johnson and John Burgee',struct:'Steel frame',facade:'Pink-grey granite',
 hist:[['1984','AT&T\'s headquarters arrives with a split "Chippendale" pediment and becomes the emblem of postmodern architecture.'],['2018','Designated a landmark, the youngest in the city at the time.']],inside:['Tall arcade and lobby at the base'],
 I:{fh:5},build(B){const m=M.att;B.tier(R(30,58),0,180,m,{fh:5});B.tier(R(30,25,0,16.5),180,197,m,{to:[[-15,4],[15,4],[15,4.2],[-15,4.2]],noFloors:true,roof:m});
  B.tier(R(30,25,0,-16.5),180,197,m,{to:[[-15,-4.2],[15,-4.2],[15,-4],[-15,-4]],noFloors:true,roof:m});B.tier(R(22,58,-28,0),0,22,m,{fh:5});}},
{id:'stpat',tier:2,name:'St. Patrick\'s Cathedral',zh:'圣帕特里克大教堂',addr:'Fifth Avenue, East 50th to 51st Street',u:75,v:vm(50.5),nopre:true,year:1879,h:100,floors:'Nave',
 arch:'James Renwick Jr.',struct:'Masonry, Gothic Revival',facade:'White marble',
 hist:[['1858','Cornerstone laid on what was then the edge of the city.'],['1879','Dedicated; the two spires, about 100 m tall, are finished in 1888.']],inside:['Nave about 100 m long'],
 I:{nocore:true,col:0,special:[{y:0,h:33,k:'lobby',t:'Nave',box:[92,14]}]},build(B){const m=M.stpat;B.tier(R(100,32),0,20,m,{noFloors:true,roof:M.slate});B.tier(R(96,14),20,33,m,{noFloors:true});
  B.tier(R(96,14),33,42,M.slate,{to:[[-48,-0.2],[48,-0.2],[48,0.2],[-48,0.2]],noFloors:true,roof:M.slate});B.tier(R(16,52,12,0),0,33,m,{noFloors:true,roof:M.slate});
  for(const z of [-11,11]){B.tier(R(9.5,9.5,-45,z),0,52,m,{noFloors:true});B.pyr(R(9.5,9.5,-45,z),52,100,m,0.02)}}},
{id:'waldorfNew',tier:2,name:'Waldorf Astoria',zh:'华尔道夫酒店',addr:'301 Park Avenue, East 49th to 50th Street',u:394,v:vm(49.5),year:1931,h:191,floors:47,
 arch:'Schultze & Weaver',struct:'Steel frame built over the rail yard',facade:'Grey limestone and brick; copper-clad twin tops',
 hist:[['1931','The hotel moves here after its Fifth Avenue home made way for the Empire State Building. For decades it is the tallest hotel in the world.'],['2017-25','Closed for conversion to a smaller hotel with condominiums; reopened in 2025.']],inside:['A private rail siding under the hotel, "Track 61", once served guests'],
 I:{fh:3.9},build(B){const m=M.waldorfG;B.tier(R(120,60),0,70,m,{fh:3.9});B.tier(R(64,34),70,160,m,{fh:3.9});for(const x of [-19,19]){B.tier(R(14,14,x,0),160,181,m,{noFloors:true});B.pyr(R(14,14,x,0),181,191,M.copper,0.3)}}},
{id:'ge570',tier:2,name:'General Electric Building',zh:'通用电气大楼',addr:'570 Lexington Avenue, at East 51st Street',u:438,v:1338,year:1931,h:196,floors:50,
 arch:'Cross & Cross',struct:'Steel frame',facade:'Salmon brick and terracotta',
 hist:[['1931','Built for RCA and passed to General Electric before completion. Its crown of Gothic tracery stands for radio waves.']],inside:['Art Deco lobby with a vaulted silver ceiling'],
 I:{fh:3.9},build(B){const m=M.ge570;B.tier(R(32,40),0,60,m,{fh:3.9});B.tier(C(26,26,4),60,170,m,{fh:3.9});B.tier(C(26,26,4),170,196,m,{to:C(9,9,2),noFloors:true,roof:M.gold});}},
{id:'chanin',tier:2,name:'Chanin Building',zh:'查宁大厦',addr:'122 East 42nd Street, at Lexington Avenue',u:428,v:600,year:1929,h:198,floors:56,
 arch:'Sloan & Robertson',struct:'Steel frame',facade:'Buff brick, limestone and terracotta',
 hist:[['1929','Irwin Chanin\'s headquarters; bronze and terracotta friezes at the base by Rene Chambellan.']],inside:['Art Deco lobby themed on the "City of Opportunity"'],
 I:{fh:3.6},build(B){const m=M.chanin;B.tier(R(50,50),0,70,m,{fh:3.6});B.tier(R(42,42),70,110,m,{fh:3.6});B.tier(R(34,34),110,165,m,{fh:3.6});B.tier(C(30,30,5),165,190,m,{fh:3.6});B.tier(R(22,22),190,198,m,{noFloors:true});}},
{id:'lincoln',tier:2,name:'One Grand Central Place',zh:'林肯大厦',addr:'60 East 42nd Street (Lincoln Building)',u:228,v:600,year:1930,h:205,floors:53,
 arch:'J.E.R. Carpenter',struct:'Steel frame',facade:'Brick and limestone, neo-Gothic details',
 hist:[['1930','Opens as the Lincoln Building across from Grand Central, with direct access to the terminal.']],inside:['Gothic windows at the top floors'],
 I:{fh:3.9},build(B){const m=M.lincoln;B.tier(R(112,50),0,90,m,{fh:3.9});B.tier(R(72,42),90,150,m,{fh:3.9});B.tier(R(42,34),150,190,m,{fh:3.9});B.tier(R(26,26),190,205,m,{fh:3.9});}},
{id:'fifth500',tier:2,name:'500 Fifth Avenue',zh:'第五大道500号',addr:'At West 42nd Street',u:-33,v:vm(42.5),year:1931,h:212,floors:59,
 arch:'Shreve, Lamb & Harmon',struct:'Steel frame',facade:'Limestone, terracotta and brick',
 hist:[['1931','Finished two months before the Empire State Building by the same architects, on a very small corner lot.']],inside:['Setbacks follow the 1916 zoning envelope almost exactly'],
 I:{fh:3.6},build(B){const m=M.fifth500;B.tier(R(32,50),0,80,m,{fh:3.6});B.tier(R(28,40),80,130,m,{fh:3.6});B.tier(R(24,30),130,180,m,{fh:3.6});B.tier(R(18,22),180,212,m,{fh:3.6});}},
{id:'tsq',tier:2,name:'Times Square',zh:'时报广场',addr:'One Times Square, 4 Times Square and the Paramount Building',u:-552,v:vm(42.5),year:1904,h:247,floors:'25 / 48 / 33',lots:[[-570,-535,659,715],[-510,-450,659,715],[-662,-602,733,796]],
 arch:'Eidlitz & McKenzie (1904); Fox & Fowle (1999); Rapp & Rapp (1927)',struct:'Steel frames',facade:'Screens, glass and brick',
 hist:[['1904','The New York Times moves into its tower and Longacre Square becomes Times Square. The New Year\'s Eve ball has dropped here since 1907.'],['1927','The Paramount Building opens with a movie palace, four clock faces and a glass globe.'],['1999','4 Times Square (Conde Nast Building) signals the district\'s revival and is an early green skyscraper.']],
 inside:['One Times Square is mostly empty behind its screens','4 Times Square: roof at about 214 m, mast structure to 247 m'],
 I:{fh:4,core:{w:16,d:16,x:72,y1:214},special:[{y:0,h:111,k:'hist',t:'One Times Square: New Year\'s ball since 1907',box:[14,40]}]},
 build(B){const d=M.F.dark;B.faceBox(17,111,44,0,0,0,[d,d,M.roof,M.roof,M.ads[3],M.ads[0]].map(x=>x===d?{set:S.f_dark,mat:d}:x));B.part(R(17,44),0,111);
  B.box(12,7,0.5,0,62,-22.4,M.ads[5]);B.box(12,9,0.5,0,38,-22.5,M.ads[7]);B.sphere(1.8,0,121,-14,M.lantern);B.cyl(0.2,0.2,10,0,111,-14,M.steelDark,6);
  B.since=1999;B.tier(R(56,54,72,0),0,60,M.F.pier,{fh:4});B.tier(R(46,46,72,0),60,214,M.hy3,{fh:4});B.tier(R(30,30,72,0),214,247,M.steel,{noFloors:true});B.cyl(0.4,1.2,94,72,247,0,M.steelDark,8);
  B.cyl(12,12,36,46,0,22,M.ads[1],28);
  B.since=1927;const p=M.paramount;B.tier(R(56,58,-80,-80),0,60,p,{fh:3.8});B.tier(R(40,40,-80,-80),60,85,p,{fh:3.8});B.tier(R(28,28,-80,-80),85,100,p,{fh:3.8});B.tier(R(18,18,-80,-80),100,110,p,{noFloors:true});B.tier(R(10,10,-80,-80),110,116,p,{noFloors:true});B.sphere(3,-80,119,-80,M.lantern);B.since=0;}},
{id:'nyt',tier:2,name:'New York Times Building',zh:'纽约时报大厦',addr:'620 Eighth Avenue, West 40th to 41st Street',u:-802,v:vm(40.5),year:2007,h:319,roof:228,floors:52,
 arch:'Renzo Piano Building Workshop with FXFowle',struct:'Steel frame with exposed bracing',facade:'Clear glass behind a screen of ceramic rods',
 hist:[['2007','About 186,000 ceramic rods shade the glass and take on the colour of the sky. The mast reaches 319 m, level with the Chrysler Building.']],inside:['Newsroom in the podium around a birch garden'],
 I:{fh:4.2},build(B){const m=M.nyt;B.tier(R(80,56),0,22,m,{fh:5});B.tier(N(48,56,5),22,228,m,{fh:4.2});for(const x of [-24.3,24.3])B.box(0.5,28,46,x,228,0,m);for(const z of [-28.3,28.3])B.box(38,28,0.5,0,228,z,m);B.cyl(0.25,1.1,91,0,228,0,M.steel,8);}},
{id:'penn',tier:2,name:'Penn Station & Madison Square Garden',zh:'宾州车站与麦迪逊广场花园',addr:'Seventh to Eighth Avenue, West 31st to 34th Street',u:-722,v:-120,preEnd:1910,year:1968,h:229,floors:'57 (One Penn Plaza)',lots:[[-844,-600,vm(31)+9,vm(33)-9],[-790,-650,vm(33)+9,-15]],
 arch:'Charles Luckman Associates (MSG); Kahn & Jacobs (One Penn Plaza)',struct:'Steel; the arena hangs from a cable roof',facade:'Precast concrete drum; dark glass slab',
 hist:[['1910','McKim, Mead & White\'s Pennsylvania Station opens: a pink-granite colonnade and a concourse of steel and glass.'],['1963-66','It is demolished. The loss leads directly to New York\'s 1965 Landmarks Law.'],['1968','The fourth Madison Square Garden opens on top of the surviving underground station.'],['1972','One Penn Plaza, 229 m, rises across 33rd Street.']],
 inside:['Arena floor sits five storeys above the tracks','Busiest rail station in North America, entirely below ground'],
 I:{fh:4,core:{w:40,d:14,z:-78,y1:229},special:[{y:-12,h:8,k:'retail',t:'Penn Station concourses and tracks',box:[200,120],z:50}],underground:true},
 build(B){B.tier(CIRC(62,36,-28,50),0,46,M.metlife,{noFloors:true,roof:M.roofL});B.tier(R(34,120,97,50),0,125,M.F.intl,{fh:4});B.since=1972;B.tier(R(100,40,0,-78),0,229,M.uc,{fh:4});}},
{id:'hy',tier:2,name:'Hudson Yards & Manhattan West',zh:'哈德逊广场',addr:'Ninth to Twelfth Avenue, West 30th to 35th Street',u:-1500,v:-140,nopre:true,year:2019,h:387,floors:'73 (30 Hudson Yards)',lots:[[-1682,-1423,-322,71],[-1393,-1150,-322,-89]],
 arch:'Kohn Pedersen Fox (master plan, 10 and 30 Hudson Yards); BIG (The Spiral); SOM (Manhattan West); Foster + Partners (50 Hudson Yards)',struct:'Towers stand on a platform over the working West Side rail yard',facade:'Glass curtain walls',
 hist:[['2012-19','A deck is built over 30 active tracks; the first phase opens in 2019 with the Vessel and the Shed.'],['30 Hudson Yards','387 m, with the Edge sky deck cantilevered at about 335 m.'],['The Spiral','BIG\'s 314 m tower with planted terraces climbing around it, completed in 2023.'],['Manhattan West','One Manhattan West, 303 m, also bridges over the tracks into Penn Station.']],
 inside:['Caissons thread between the tracks to carry the platform','Edge: triangular outdoor deck with a glass floor panel'],
 I:{fh:4.4,special:[{y:335,h:3,k:'obs',t:'Edge sky deck, ~335 m',box:[26,26],x:70,z:6},{y:-10,h:7,k:'retail',t:'West Side Yard: active tracks under the platform',box:[260,150],x:-40,z:70}],underground:true},
 build(B){const a=M.hy1,b=M.hy2,c=M.hy3,fh=4.4;
  B.tier(R(50,50,43,0),0,387,a,{to:R(34,30,50,-4),fh});B.tier([[58,-8],[86,6],[58,20]],335,337.5,M.steel,{noFloors:true,bottom:true});
  B.tier(R(48,52,48,150),0,268,b,{to:R(38,40,52,146),fh});B.tier(R(56,84,45,75),0,38,b,{fh:6});
  B.tier(C(36,36,9,-140,150),0,280,c,{fh});
  B.tier(R(42,42,-140,-10),0,120,b,{fh});B.tier(R(32,36,-140,-10),120,220,b,{fh});B.tier(R(24,26,-140,-10),220,308,b,{fh});
  B.cyl(23,9,46,-50,0,70,M.vessel,16);B.tier(R(40,36,-95,150),0,37,M.steel,{noFloors:true});
  B.tier(R(60,56,43,-100),0,150,a,{fh});B.tier(R(52,48,43,-100),150,300,a,{fh});
  B.tier(R(40,44,-70,-100),0,238,M.F.dark,{fh});
  for(let i=0;i<10;i++){const s=72-i*4.2,o=[[0,0],[2,-2],[3,0],[2,3],[0,4],[-2,3],[-3,0],[-2,-3],[0,-3],[1,0]][i];B.tier(R(s,s*0.8,25+o[0],-180+o[1]),i*31.4,(i+1)*31.4,c,{fh,roof:M.grass})}
  B.tier(C(48,48,9,315,30),0,303,a,{to:C(40,40,7,315,30),fh});B.tier(C(46,46,8,315,110),0,285,b,{to:C(40,40,7,315,110),fh});B.tier(R(40,60,255,70),0,22,b,{noFloors:true});}},
{id:'carnegie',tier:2,name:'Carnegie Hall & Tower',zh:'卡内基音乐厅',addr:'Seventh Avenue at West 57th Street',u:-530,v:vm(56.5),nopre:true,year:1891,h:231,floors:'60 (tower)',
 arch:'William B. Tuthill (hall); Cesar Pelli (tower, 1991)',struct:'Masonry hall; concrete tower',facade:'Roman brick and terracotta',
 hist:[['1891','Andrew Carnegie\'s Music Hall opens with Tchaikovsky conducting.'],['1960','Saved from demolition by a campaign led by violinist Isaac Stern.'],['1991','Pelli\'s 231 m tower rises next door, only about 15 m wide.']],inside:['Main hall seats about 2,800 with no steel in its original structure'],
 I:{fh:3.8,core:{w:9,d:14,x:18,y1:231},col:0,special:[{y:0,h:26,k:'amen',t:'Stern Auditorium, ~2,800 seats',box:[34,40],x:-16}]},
 build(B){B.tier(R(48,56,-16,0),0,30,M.carnHall,{fh:4.3});B.tier(R(30,30,-22,10),30,52,M.carnHall,{fh:4});B.since=1991;B.tier(C(16,50,2,18,0),0,225,M.cht,{fh:3.8});B.tier(C(16,50,2,18,0),225,231,M.slate,{noFloors:true});}},
{id:'solow',tier:2,name:'Solow Building',zh:'索洛大厦',addr:'9 West 57th Street',u:-75,v:vm(57.5),year:1974,h:210,floors:50,
 arch:'Gordon Bunshaft, Skidmore, Owings & Merrill',struct:'Steel frame with exposed diagonal bracing on the side walls',facade:'Black glass sweeping in a curve to the sidewalk; travertine sides',
 hist:[['1974','The curved base answers the setback rules with a single gesture. A red sculpture of the numeral 9 marks the entrance.']],inside:['Upper floors look straight up Central Park'],
 I:{fh:4.1},build(B){const o={extra:[M.trav],edgeMat:(i,n)=>Math.abs(n[0])>0.5?2:0};B.tier(R(70,48),0,65,M.solow,{to:R(70,24),fh:4.1,...o});B.tier(R(70,24),65,210,M.solow,{fh:4.1,...o});B.box(1.2,3,2.4,-30,0,27,new THREE.MeshStandardMaterial({color:0xc8261c,roughness:0.4}));}},
{id:'cps220',tier:2,name:'220 Central Park South',zh:'中央公园南220号',addr:'Between Seventh Avenue and Broadway',u:-690,v:vm(58.5),year:2019,h:290,floors:70,
 arch:'Robert A.M. Stern Architects',struct:'Reinforced concrete',facade:'Alabama limestone',
 hist:[['2019','A four-floor apartment here sells for about $238 million, then the most expensive home ever sold in the United States.']],inside:['A lower "villa" faces the park; the tower stands behind it'],
 I:{fh:4.1},build(B){const m=M.lime220;B.tier(R(40,18,0,-22),0,62,m,{fh:4.1});B.tier(R(34,26,0,8),0,230,m,{fh:4.1});B.tier(R(28,21,0,8),230,265,m,{fh:4.1});B.tier(R(21,16,0,8),265,290,m,{fh:4.1});}},
{id:'gm',tier:2,name:'General Motors Building',zh:'通用汽车大厦',addr:'767 Fifth Avenue, East 58th to 59th Street',u:78,v:vm(58.5),year:1968,h:215,floors:50,
 arch:'Edward Durell Stone with Emery Roth & Sons',struct:'Steel; the marble piers are load-bearing columns',facade:'White Georgia marble piers and dark glass',
 hist:[['1968','Replaces the Savoy-Plaza Hotel opposite the Plaza.'],['2006','A glass cube opens on the plaza as the entrance to an underground store.']],inside:['Store below the plaza reached through the cube'],
 I:{fh:4.3,special:[{y:-8,h:6,k:'retail',t:'Store under the plaza',box:[40,40],x:-38}],underground:true},build(B){B.tier(R(60,46,18,0),0,215,M.gm,{fh:4.3});B.tier(R(66,62,18,0),0,9,M.gm,{noFloors:true});B.box(10,10,10,-38,0,0,M.glassClear);B.plate(R(34,62,-36,0),0,M.granite);}},
{id:'plaza',tier:2,name:'The Plaza',zh:'广场饭店',addr:'Fifth Avenue at Central Park South',u:-62,v:vm(58.5),nopre:true,year:1907,h:76,floors:21,
 arch:'Henry J. Hardenbergh',struct:'Steel frame',facade:'White brick and marble; green copper and slate mansard',
 hist:[['1907','A French chateau facing Grand Army Plaza, by the architect of the first Waldorf-Astoria and the Dakota.'],['1969','Designated a landmark; part converted to apartments in 2008.']],inside:['Palm Court and the Oak Room on the ground floor'],
 I:{fh:3.7},build(B){const m=M.plaza;B.tier(R(76,62),0,58,m,{fh:3.7});B.tier(R(76,62),58,72,M.copper,{to:R(64,50),noFloors:true,roof:M.slate});for(const [x,z] of [[38,-31],[38,31],[-38,-31]]){B.cyl(4.5,4.5,66,x,0,z,m,12);B.cone(5,10,x,66,z,M.copper,12)}}},
{id:'sherry',tier:2,name:'Sherry-Netherland',zh:'雪莉荷兰酒店',addr:'781 Fifth Avenue, at East 59th Street',u:38,v:vm(59.5),year:1927,h:171,floors:38,
 arch:'Schultze & Weaver with Buchman & Kahn',struct:'Steel frame',facade:'Brick and travertine, with a Gothic copper-roofed top',
 hist:[['1927','Opens as the tallest apartment-hotel in New York, with a slender spire over Grand Army Plaza.']],inside:['Lobby modelled on the Vatican Library'],
 I:{fh:3.9},build(B){const m=M.sherry;B.tier(R(30,38),0,95,m,{fh:3.9});B.tier(R(20,20),95,140,m,{fh:3.9});B.pyr(R(20,20),140,171,M.copper,0.03);}},
{id:'pierre',tier:2,name:'The Pierre',zh:'皮埃尔酒店',addr:'Fifth Avenue at East 61st Street',u:40,v:vm(61.5),year:1930,h:160,floors:41,
 arch:'Schultze & Weaver',struct:'Steel frame',facade:'Cream brick and granite; copper mansard',
 hist:[['1930','The top is modelled on the royal chapel at Versailles.']],inside:['Rotunda with trompe-l\'oeil murals'],
 I:{fh:3.7},build(B){const m=M.pierre;B.tier(R(40,45),0,110,m,{fh:3.7});B.tier(R(24,26),110,148,m,{fh:3.7});B.tier(R(24,26),148,160,M.copper,{to:R(14,6),noFloors:true,roof:M.copper});}},
{id:'trump',tier:2,name:'Trump Tower',zh:'特朗普大厦',addr:'725 Fifth Avenue, at East 56th Street',u:45,v:vm(56.5),year:1983,h:202,floors:58,
 arch:'Der Scutt, Swanke Hayden Connell',struct:'Reinforced concrete',facade:'Dark bronze glass in a sawtooth',
 hist:[['1983','Built on the site of the Bonwit Teller store. Its 58 storeys are numbered up to 68.']],inside:['Six-level atrium of pink marble with a waterfall'],
 I:{fh:3.5,colMat:'concrete'},build(B){B.tier(R(50,56),0,24,M.trump,{fh:4});B.tier(N(38,46,6,2,0),24,202,M.trump,{fh:3.5});}},
{id:'bloomberg',tier:2,name:'Bloomberg Tower',zh:'彭博大厦',addr:'731 Lexington Avenue, East 58th to 59th Street',u:545,v:vm(58.5),year:2004,h:246,floors:55,
 arch:'Pelli Clarke Pelli',struct:'Steel and concrete',facade:'Glass and steel',
 hist:[['2004','Offices for Bloomberg L.P. below and the One Beacon Court apartments above, on the old Alexander\'s department store site.']],inside:['Oval courtyard cuts through the block'],
 I:{fh:4.3},build(B){B.tier(R(60,62),0,45,M.bloom,{fh:4.5});B.tier(R(40,46,6,0),45,246,M.bloom,{fh:4.3});}},
{id:'dbc',tier:2,name:'Deutsche Bank Center',zh:'德意志银行中心',addr:'Columbus Circle (former Time Warner Center)',u:-960,v:2040,nopre:true,year:2003,h:229,floors:55,
 arch:'David Childs, Skidmore, Owings & Merrill',struct:'Steel and concrete',facade:'Glass; the base follows the curve of the circle',
 hist:[['2003','Twin towers on the site of the New York Coliseum. Their angle follows Broadway.'],['2021','Renamed after Deutsche Bank moves in.']],inside:['Jazz at Lincoln Center\'s halls sit in the base, facing the park'],
 I:{fh:4.2,core:{w:12,d:16,x:0,z:-50,y1:229}},build(B){const m=M.dbc;B.tier([[-55,-85],[30,-85],[52,-45],[58,0],[52,45],[30,85],[-55,85]],0,42,m,{fh:6});
  B.tier([[-20,-72],[16,-66],[22,-30],[-14,-36]],42,222,m,{fh:4.2});B.tier([[-14,36],[22,30],[16,66],[-20,72]],42,222,m,{fh:4.2});
  B.tier([[-18,-68],[14,-63],[19,-34],[-12,-39]],222,229,M.lantern,{noFloors:true});B.tier([[-12,39],[19,34],[14,63],[-18,68]],222,229,M.lantern,{noFloors:true});
  B.cyl(0.5,0.6,21,101,0,28,M.marble,10);}},

/* ============================== vanished ============================== */
{id:'waldorf',ghost:true,tier:3,name:'Waldorf-Astoria (first)',zh:'华尔道夫-阿斯托里亚旧址',addr:'Fifth Avenue, West 33rd to 34th Street',u:-80,v:vm(33.5),year:1897,end:1929,h:70,floors:'13-16',
 arch:'Henry J. Hardenbergh',struct:'Steel and masonry',facade:'Red brick and stone, German Renaissance',
 hist:[['1893/1897','Two rival Astor cousins build neighbouring hotels that merge into the largest hotel in the world.'],['1929','Demolished for the Empire State Building.']],inside:['Famous for its ballroom and "Peacock Alley"'],
 I:{nocore:true,col:0},build(B){B.tier(R(125,54),0,50,M.waldorf,{fh:4});B.tier(R(125,54),50,58,M.slate,{to:R(112,32),noFloors:true,roof:M.slate});for(const x of [-48,-10,30]){B.tier(R(14,14,x,0),50,66,M.waldorf,{noFloors:true});B.pyr(R(14,14,x,0),66,72,M.copper,0.05)}}},
{id:'pennOld',ghost:true,tier:3,name:'Pennsylvania Station (1910)',zh:'老宾州车站',addr:'Seventh to Eighth Avenue, West 31st to 33rd Street',u:-722,v:-160,year:1910,end:1964,h:46,floors:'Head house',
 arch:'McKim, Mead & White',struct:'Steel and granite',facade:'Pink Milford granite, Doric colonnade',
 hist:[['1910','The waiting room copies the Baths of Caracalla; the concourse is a vault of steel and glass.'],['1963-66','Demolished. "One entered the city like a god; one scuttles in now like a rat," wrote Vincent Scully.']],inside:['Waiting room about 46 m high'],
 I:{nocore:true,col:0,special:[{y:0,h:44,k:'lobby',t:'Waiting room after the Baths of Caracalla',box:[84,32]}]},build(B){B.tier(R(232,128),0,22,M.classic,{fh:7});B.tier(R(90,36),22,46,M.classic,{noFloors:true});B.tier(R(66,96,-70,0),22,38,M.glassClear,{noFloors:true});}},
{id:'uc',ghost:true,tier:3,name:'Union Carbide Building',zh:'联合碳化物大厦',addr:'270 Park Avenue',u:228,v:vm(47.5),year:1960,end:2019,h:215,floors:52,
 arch:'Skidmore, Owings & Merrill (Natalie de Blois, Gordon Bunshaft)',struct:'Steel frame',facade:'Black metal, grey glass and stainless mullions',
 hist:[['1960','An International Style headquarters, later JPMorgan Chase\'s.'],['2019-21','Demolished for the new 270 Park Avenue.']],inside:['Open floors around a central core'],
 I:{fh:4},build(B){B.tier(R(100,56),0,30,M.uc,{fh:4});B.tier(R(70,44,14,0),30,215,M.uc,{fh:4});}},
{id:'drake',ghost:true,tier:3,name:'Drake Hotel',zh:'德雷克酒店',addr:'Park Avenue at East 56th Street',u:262,v:vm(56.5),year:1926,end:2007,h:78,floors:21,
 arch:'Emery Roth',struct:'Steel and masonry',facade:'Buff brick',
 hist:[['1926','A fashionable apartment hotel.'],['2007','Demolished; 432 Park Avenue takes its place.']],inside:[],
 I:{fh:3.4,nocore:true,col:0},build(B){B.tier(R(34,44),0,70,M.drake,{fh:3.4});B.tier(R(26,32),70,78,M.drake,{fh:3.4});}},
];
