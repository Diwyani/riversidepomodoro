export const CAFE_LAYOUT={west:-4.3,east:2.9,back:-3.4,front:2.1,stairX:-3.55,stairsFront:1.6,stairsBack:-2.45,loftEdge:-3.05,loftHeight:2.8};
export const PALETTES={
 evening:{top:0x896189,low:0xe69f88,pink:0xeb8789,cream:0xffe5b6,fog:0xc5a1b1,ambient:1.1,key:1.5,fill:.4,night:0,water:0xac9dbd},
 night:{top:0x050811,low:0x142344,pink:0x1f2336,cream:0x3e5475,fog:0x0c1929,ambient:.059,key:.13,fill:.04,night:1,water:0x172f43},
 fullMoon:{top:0x040714,low:0x121a39,pink:0x241d3d,cream:0x444b69,fog:0x101429,ambient:.042,key:.105,fill:.032,night:1,water:0x3b5871},
 dawn:{top:0x344f88,low:0x8aafd0,pink:0x777ea8,cream:0xc9d9e5,fog:0x718da9,ambient:.65,key:.45,fill:.8,night:0,water:0x7a9cba}
};
// Art presets for Little Stream. The calendar is shared across time zones.
const indiaMonth=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',month:'numeric'});
const monthSeasons=['winter','winter','spring','spring','summer','summer','monsoon','monsoon','monsoon','autumn','autumn','winter'];
const seasonPalettes={
 spring:{ground:0xd7dfce,grass:0xc2cbb7,leaf:[0x8fa28a,0xa6b497,0x8b9e98],water:0xb8dfd8,fogFar:83,grassHeight:1,snow:0,wind:.96,fruit:false},
 summer:{ground:0xe9e2bf,grass:0xd8dea0,leaf:[0x8dad75,0xa4b574,0x8faf78],water:0xbad8cc,fogFar:101,grassHeight:.86,snow:0,wind:.89,fruit:false},
 monsoon:{ground:0xc7ded2,grass:0x9bcca9,leaf:[0x769f85,0x86ae91,0x668e83],water:0x93b3bb,fogFar:64,grassHeight:1.11,snow:0,wind:1.21,fruit:false},
 autumn:{ground:0xdcb995,grass:0xc8a479,leaf:[0xa77a52,0x93683f,0xb88a5c],cedar:[0x8c7350,0x7a6447],fringe:0xc49a72,water:0xb2c4da,fogFar:86,grassHeight:.7,snow:0,wind:1.12,fruit:true,fallen:true},
 winter:{ground:0xdde5ea,grass:0xc6c1ad,leaf:[0x84958a,0x94a396,0x778b83],cedar:[0x71897d,0x62786f],fringe:0xe8edf2,water:0xa6c6de,fogFar:82,grassHeight:.12,snow:1,wind:1.02,fruit:false}
};
export function seasonForMonth(month){
 return monthSeasons[month-1];
}
export function monthForDate(date=new Date()){return Number(indiaMonth.format(date));}
export function seasonForDate(date=new Date()){
 return seasonForMonth(Number(indiaMonth.format(date)));
}
const pondZ=-54, pondRadius=4.85;
const streamStartZ=-54.5, streamEndZ=27;
const riverAt=z=>7+1.6*Math.sin(z*.12);
const pondX=riverAt(-56);
const pondDistance=(x,z)=>Math.hypot(x-pondX,z-pondZ);
export function heightAt(x,z){
 const ground=.13*Math.sin(x*.19)+.12*Math.cos(z*.12)+.08*Math.sin(z*.21+x*.1);
 const meadowHill=1.85*Math.exp(-((x+4.8)**2/34+(z-2)**2/55));
 const woodlandRise=.72*Math.exp(-((x-3.4)**2/24+(z+12)**2/40));
 const inWater=pondDistance(x,z)<pondRadius+.48||z<=streamEndZ&&Math.abs(x-riverAt(z))<2.2;
 return inWater?-.5:ground+meadowHill+woodlandRise;
}
export function pathAt(z){const meadow=2*Math.sin(z*.11)+1.2*Math.sin(z*.23),bank=7+1.6*Math.sin(z*.12)-3.7;const u=Math.max(0,Math.min(1,(-z-16)/12)),blend=u*u*(3-2*u);return meadow*(1-blend)+bank*blend-2.0*Math.max(0,Math.min(1,(-z-45)/7));}
export function areaAt(z){return z> -6?'Meadow':z> -27?'Woodland':z> -46?'Streamside':'Waterfall';}
function random(seed){return()=>{seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export function createFirefly(T){
 const group=new T.Group(),parts=[];
 function piece(geometry,color,scale,position,rotation=[0,0,0]){const o=new T.Object3D();o.scale.set(...scale);o.position.set(...position);o.rotation.set(...rotation);o.updateMatrix();geometry=geometry.clone().applyMatrix4(o.matrix);const p=geometry.attributes.position,c=[];const col=new T.Color(color);for(let i=0;i<p.count;i++)c.push(col.r,col.g,col.b);geometry.setAttribute('color',new T.Float32BufferAttribute(c,3));parts.push(geometry);}
 const ball=new T.SphereGeometry(1,10,7);
 piece(ball,0x45362f,[.043,.026,.100],[0,0,0]);piece(ball,0xa06b40,[.047,.029,.040],[0,.004,-.085]);piece(ball,0x322e2c,[.032,.026,.033],[0,.006,-.135]);
 piece(ball,0x765037,[.026,.012,.085],[-.041,.032,-.005],[0,0,.55]);piece(ball,0x9d6d45,[.026,.012,.085],[.041,.032,-.005],[0,0,-.55]);
 function limb(a,b,r,color){const aa=new T.Vector3(...a),bb=new T.Vector3(...b),g=new T.CylinderGeometry(r,r*.72,aa.distanceTo(bb),4);const o=new T.Object3D();o.position.copy(aa.clone().add(bb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.clone().sub(aa).normalize());o.updateMatrix();g.applyMatrix4(o.matrix);piece(g,color,[1,1,1],[0,0,0]);}
 for(const side of [-1,1]){for(let j=0;j<3;j++){const z=-.075+j*.058;limb([side*.025,-.01,z],[side*.065,-.045,z+.02],.0032,0x5c4537);limb([side*.065,-.045,z+.02],[side*.095,-.072,z+.05],.0025,0x7c6044);}limb([side*.014,.02,-.15],[side*.035,.055,-.205],.0027,0x735c47);limb([side*.035,.055,-.205],[side*.05,.064,-.225],.0022,0x735c47);}
 const positions=[],normals=[],colors=[],indices=[];let offset=0;
 for(const g of parts){positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);colors.push(...g.attributes.color.array);indices.push(...Array.from(g.index.array,x=>x+offset));offset+=g.attributes.position.count;}
 const bodyGeometry=new T.BufferGeometry();bodyGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));bodyGeometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));bodyGeometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));bodyGeometry.setIndex(indices);
 const body=new T.Mesh(bodyGeometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));group.add(body);
 const glowMaterial=new T.MeshStandardMaterial({color:0xfce29a,emissive:0xfbd65c,emissiveIntensity:1.3,roughness:1});const abdomen=new T.Mesh(new T.SphereGeometry(1,10,7),glowMaterial);abdomen.scale.set(.037,.026,.044);abdomen.position.set(0,-.004,.103);group.add(abdomen);
 const wings=[];for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(side*.025,.015,-.06);const w=new T.Mesh(new T.SphereGeometry(1,10,6),new T.MeshStandardMaterial({color:0xd9dac9,transparent:true,opacity:.48,roughness:.9,side:T.DoubleSide,depthWrite:false}));w.scale.set(.115,.0015,.047);w.position.set(side*.105,0,.032);w.rotation.y=side*.27;pivot.add(w);group.add(pivot);wings.push(pivot);}
 return{group,body,abdomen,wings,glowMaterial,animate(t,p=0,quiet=false){const flap=quiet?.15:Math.sin(t*32+p)*.56;wings[0].rotation.z=flap;wings[1].rotation.z=-flap;glowMaterial.emissiveIntensity=.8+.7*(.5+.5*Math.sin(t*1.7+p))**2;}};
}
export function createWorld(T,textures={}){
 const wetness={value:0},rainStrength={value:0};
 const rng=random(81132),scene=new T.Scene(),colliders=[],flies=[],root=new T.Group();scene.add(root);
 scene.fog=new T.Fog(0xbab1c0,18,88);
 const skyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color(PALETTES.evening.top)},low:{value:new T.Color(PALETTES.evening.low)},pink:{value:new T.Color(PALETTES.evening.pink)},cream:{value:new T.Color(PALETTES.evening.cream)},night:{value:0},moonPhase:{value:0}},vertexShader:`varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 dir;uniform vec3 top,low,pink,cream;uniform float night,moonPhase;float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){vec3 d=normalize(dir);float n=noise(d*7.)*.65+noise(d*22.)*.35;vec3 c=mix(low,top,smoothstep(-.04,.68,d.y));float blush=smoothstep(.40,.73,n)*(.8-.45*night);c=mix(c,pink,blush);float cloud=smoothstep(.56,.72,noise(vec3(d.x*4.,d.y*15.,d.z*4.))+noise(d*19.)*.12)*smoothstep(.1,.25,d.y);c=mix(c,cream,cloud*(.82-.28*night));float grain=hash(floor(d*1700.))-.5;c+=grain*(.045-.027*night);float stars=step(.99965,hash(floor(d*850.)))*night*smoothstep(.08,.35,d.y);c+=stars*.65*(1.-cloud);
vec3 moonDir=normalize(vec3(-.44,.32,.90));
vec2 lunar=vec2(dot(d,normalize(cross(vec3(0.,1.,0.),moonDir))),dot(d,normalize(cross(moonDir,cross(vec3(0.,1.,0.),moonDir)))))/.065;
float radius=length(lunar);
float moonDisc=(1.-smoothstep(.974,1.,radius))*step(.95,dot(d,moonDir));
float halfMask=smoothstep(-.015,.015,lunar.x);
float lunarLight=mix(halfMask,1.,moonPhase);
float crater=.74+.26*noise(vec3(lunar*7.,1.));
float halo=exp(-radius*radius*.45)*step(.8,dot(d,moonDir));
c+=vec3(.22,.32,.48)*halo*night*(.1+.2*moonPhase);
c=mix(c,vec3(1.,.93,.76)*crater,moonDisc*lunarLight*night*(1.-cloud*.38));
gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
 const sky=new T.Mesh(new T.SphereGeometry(140,32,20),skyMaterial);scene.add(sky);
 const hemi=new T.HemisphereLight(0xffe9d7,0x718095,1.45);scene.add(hemi);const key=new T.DirectionalLight(0xffe0ba,1.6);key.position.set(-12,16,-15);scene.add(key);const fill=new T.DirectionalLight(0xb0b9ea,.5);fill.position.set(10,5,12);scene.add(fill);
 const groundGeometry=new T.PlaneGeometry(100,130,150,196);groundGeometry.rotateX(-Math.PI/2);const gp=groundGeometry.attributes.position;
 for(let i=0;i<gp.count;i++)gp.setY(i,heightAt(gp.getX(i),gp.getZ(i)));groundGeometry.computeVertexNormals();
 const ground=new T.Mesh(groundGeometry,new T.MeshLambertMaterial({map:textures.ground,color:0xffffff}));root.add(ground);
 function snowRelief(x,z){
  const pathClearance=Math.abs(x-pathAt(z));
  const bankClearance=Math.min(Math.abs(x-riverAt(z))-2.2,pondDistance(x,z)-pondRadius);
  if(pathClearance<1.35||bankClearance<.2||nearCafe(x,z,.8))return 0;
  const edges=Math.min(1,(pathClearance-1.35)/.95,(bankClearance-.2)/.9);
  const broad=.5+.5*Math.sin(x*.88+Math.sin(z*.59)*1.6)*Math.cos(z*.84);
  const folds=.5+.5*Math.sin(x*1.7+z*1.52+Math.sin(z*.5));
  return edges*edges*(.065+.12*broad*broad+.025*folds);
 }
 let winterSurface=false;
 function setSnowSurface(enabled){
  if(enabled===winterSurface)return;
  winterSurface=enabled;
  for(let i=0;i<gp.count;i++){
   const x=gp.getX(i),z=gp.getZ(i);
   gp.setY(i,heightAt(x,z)+(enabled?snowRelief(x,z):0));
  }
  gp.needsUpdate=true;groundGeometry.computeVertexNormals();
 }
 const snowAmount={value:0};
 ground.material.onBeforeCompile=shader=>{
  shader.uniforms.snowAmount=snowAmount;
  shader.vertexShader='varying vec3 terrainPoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainPoint=position;');
  shader.fragmentShader='uniform float snowAmount; varying vec3 terrainPoint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=terrainPoint.xz;
   float broad=.5+.5*sin(p.x*.63+sin(p.y*.68))*cos(p.y*.48);
   float ribbons=.5+.5*sin(p.x*1.83+p.y*.8+sin(p.y*1.42));
   float grain=fract(sin(dot(floor(p*51.),vec2(127.1,311.7)))*43758.5453)-.5;
   vec3 blueShade=vec3(.72,.77,.87), warmSnow=vec3(.95,.94,.91);
   vec3 winterColor=mix(blueShade,warmSnow,smoothstep(.10,.89,broad*.76+ribbons*.24));
   winterColor+=vec3(grain*.018);
   float cover=smoothstep(-.42,-.04,terrainPoint.y)*snowAmount;
   diffuseColor.rgb=mix(diffuseColor.rgb,winterColor,cover);
  `);
 };

 const pathPositions=[],pathUV=[],pathIndices=[];
 const pathColumns=5;
 for(let row=0;row<=180;row++){
  const z=26-row*82/180,center=pathAt(z),width=1.1+.15*Math.sin(z*.1)+.045*Math.sin(z*2.3);
  for(let column=0;column<pathColumns;column++){
   const u=column/(pathColumns-1),x=center+(2*u-1)*width;
   pathPositions.push(x,heightAt(x,z)+.035,z);pathUV.push(u,row*.1);
   if(row<180&&column<pathColumns-1){
    const a=row*pathColumns+column,b=a+pathColumns;
    pathIndices.push(a,a+1,b,a+1,b+1,b);
   }
  }
 }
 const pathG=new T.BufferGeometry();pathG.setAttribute('position',new T.Float32BufferAttribute(pathPositions,3));pathG.setAttribute('uv',new T.Float32BufferAttribute(pathUV,2));pathG.setIndex(pathIndices);pathG.computeVertexNormals();const path=new T.Mesh(pathG,new T.MeshStandardMaterial({roughness:1,map:textures.path,color:0xffffff,side:T.DoubleSide}));path.material.onBeforeCompile=shader=>{
  shader.vertexShader='varying float pathAcross;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npathAcross=uv.x;');
  shader.uniforms.snowAmount=snowAmount;
  shader.fragmentShader='uniform float snowAmount; varying float pathAcross;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float edge=smoothstep(.30,.50,abs(pathAcross-.5));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.34,.23),edge*.42);
   float worn=.5+.5*sin(vMapUv.y*5.+sin(pathAcross*28.));
   vec3 packed=mix(vec3(.67,.65,.64),vec3(.83,.84,.87),smoothstep(.12,.83,worn));
   packed=mix(packed,vec3(.90,.91,.94),edge*.65);
   diffuseColor.rgb=mix(diffuseColor.rgb,packed,snowAmount*.94);
  `);
 };root.add(path);
 const trunkMat=new T.MeshStandardMaterial({map:textures.bark,color:0xe5d1d2}),leafMat=new T.MeshStandardMaterial({map:textures.leaf,color:0xffffff});
 const barkVariants=[trunkMat,new T.MeshStandardMaterial({roughness:.96,map:textures.barkSoft||textures.bark,color:0xd9d7d0}),new T.MeshStandardMaterial({roughness:.96,map:textures.bark,color:0xbeb6ad})];
 let activeBark=trunkMat;
 const clusterG=new T.SphereGeometry(1,14,10),cp=clusterG.attributes.position;
 for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i),r=1+.11*Math.sin(x*8+z*3)*Math.sin(y*7+1)+.06*Math.cos(z*9-x*2);cp.setXYZ(i,x*r,y*r,z*r);}clusterG.computeVertexNormals();
 // Cafe walls run x -4.85..0.45, z -45.85..-41.45; canopies spread about 2.5 m, so keep trunks 3.2 m beyond the walls.
 const nearCafe=(x,z,m)=>x>-1.5+CAFE_LAYOUT.west-m&&x<-1.5+CAFE_LAYOUT.east+m&&z>-43+CAFE_LAYOUT.back-m&&z<-43+CAFE_LAYOUT.front+m,nearCinema=(x,z)=>Math.abs(x+.45)<4&&Math.abs(z+35.9)<3.5;
 const treeLocations=[];for(let i=0;i<75;i++){const z=24-rng()*82,x=(rng()-.5)*48;if(nearCafe(x,z,3.2)||nearCinema(x,z)||Math.abs(x-pathAt(z))<2.3||z<=streamEndZ&&Math.abs(x-riverAt(z))<3)continue;if(z> -5&&rng()<.65)continue;treeLocations.push({x,z,h:4.2+rng()*6.2,r:.17+rng()*.25});}
 // Specific framing trees at the meadow and woodland entrances.
 treeLocations.push({x:-5,z:11,h:7.5,r:.36},{x:5,z:5,h:7,r:.32},{x:-4,z:-9,h:8,r:.4},{x:4.8,z:-13,h:8,r:.38});
 const canopy=new T.InstancedMesh(clusterG,leafMat,(treeLocations.length+2)*17),dummy=new T.Object3D();let ci=0;
 const fringe=new T.InstancedMesh(new T.PlaneGeometry(2,2),new T.MeshLambertMaterial({map:textures.fringe,alphaTest:.13,side:T.DoubleSide,color:0xffffff}),(treeLocations.length+2)*16);let fi=0;
 function branch(a,b,r1,r2){const va=new T.Vector3(...a),vb=new T.Vector3(...b),m=new T.Mesh(new T.CylinderGeometry(r2,r1,va.distanceTo(vb),7,3),activeBark);m.position.copy(va.clone().add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());root.add(m);return m;}

 function curvedLimb(points,baseRadius,name){
  const trunkCurve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));
  const trunkGeometry=new T.TubeGeometry(trunkCurve,24,1,9,false),trunkVertices=trunkGeometry.attributes.position;
  for(let j=0;j<=24;j++){
   const t=j/24,center=trunkCurve.getPointAt(t),radius=baseRadius*(.065+.935*Math.pow(1-t,.85));
   for(let k=0;k<=9;k++){
    const i=j*10+k;
    trunkVertices.setXYZ(i,center.x+(trunkVertices.getX(i)-center.x)*radius,center.y+(trunkVertices.getY(i)-center.y)*radius,center.z+(trunkVertices.getZ(i)-center.z)*radius);
   }
  }
  // TubeGeometry U runs along the trunk; bark U must run around it.
  const trunkUV=trunkGeometry.attributes.uv;
  for(let i=0;i<trunkUV.count;i++){const along=trunkUV.getX(i),around=trunkUV.getY(i);trunkUV.setXY(i,around,along*2);}
  trunkUV.needsUpdate=true;trunkGeometry.computeVertexNormals();
  const trunk=new T.Mesh(trunkGeometry,activeBark);trunk.name=name;root.add(trunk);
  return trunk;
 }
 const foliageKinds=[],seasonalFruit=[],canopyTree=[],fringeTree=[];
 const fruitGeometry=new T.SphereGeometry(1,10,7);
 const fruitMaterial=new T.MeshLambertMaterial({color:0xd47739});
 const calyxMaterial=new T.MeshLambertMaterial({color:0x646949});
 treeLocations.push({x:-8.2,z:-39,h:4.1,r:.27,persimmon:true},{x:10.4,z:-44,h:4.6,r:.28,persimmon:true});
 for(const [index,tr] of treeLocations.entries()){const y=heightAt(tr.x,tr.z);colliders.push({x:tr.x,z:tr.z,r:tr.r+.35});const cedar=!tr.persimmon&&index%3===0;
  activeBark=barkVariants[index%3];
  // Four stable silhouettes: upright, double bend, branching, and a wide lateral arm.
  const form=index%4,sign=index%2?-1:1,variation=.45+rng()*.6,depth=(rng()-.5)*.8;
  const lean=form===0?sign*.08:sign*variation,bendZ=form===0?depth*.12:depth;
  const offsets=form===1?[0,-lean*.85,lean*.95,-lean*.48,lean*.65]:[0,-lean*.18,lean*.52,lean,lean*.88];
  const levels=[0,.25,.58,.83,1];
  const trunkPoints=levels.map((t,j)=>[tr.x+offsets[j],y+tr.h*t,tr.z+bendZ*t]);
  const trunk=curvedLimb(trunkPoints,tr.r,'curved tapered trunk');
  trunk.userData.form=['straight','double bend','multiple branches','wide single branch'][form];
  const crownX=tr.x+offsets[4],crownZ=tr.z+bendZ,branchTips=[];
  if(form===2){
   for(let arm=0;arm<3;arm++){
    const angle=index*2.4+arm*Math.PI*2/3,reach=1.5+(arm%2)*.7;
    const start=trunkPoints[2],tip=[crownX+Math.cos(angle)*reach,y+tr.h*(.84+arm*.035),crownZ+Math.sin(angle)*reach];
    curvedLimb([start,[start[0]+Math.cos(angle)*reach*.4,start[1]+tr.h*.12,start[2]+Math.sin(angle)*reach*.4],tip],tr.r*.53,'spreading fork branch');branchTips.push(tip);
   }
  }else if(form===3){
   // The broad arm stays above walking height and carries an extended crown.
   const angle=index*2.4,reach=2.7+variation*.6,start=trunkPoints[2];
   const tip=[crownX+Math.cos(angle)*reach,y+tr.h*.83,crownZ+Math.sin(angle)*reach];
   curvedLimb([start,[start[0]+Math.cos(angle)*reach*.45,start[1]+tr.h*.06,start[2]+Math.sin(angle)*reach*.45],tip],tr.r*.62,'wide single branch');branchTips.push(tip);
  }

  for(let j=0;j<3;j++){
   const a=index*2.4+j*2.1;
   branch([tr.x,y+.12,tr.z],[tr.x+Math.cos(a)*tr.r*2.2,heightAt(tr.x+Math.cos(a)*tr.r*2.2,tr.z+Math.sin(a)*tr.r*2.2)+.035,tr.z+Math.sin(a)*tr.r*2.2],tr.r*.3,.025);
  }
  const tiers=4,lobes=4,crownWidth=(1.25+rng()*.75)*(tr.h/7)**.35;
  for(let j=0;j<tiers;j++){
   const a=j*2.4+rng(), radius=crownWidth*(.8+rng()*.35);
   const anchor=form===2?branchTips[j%branchTips.length]:form===3&&j<3?branchTips[0]:[crownX,y+tr.h*.87,crownZ];
   const cy=anchor[1]+(j-1.5)*.18+(rng()-.5)*.4;
   for(let k=0;k<lobes;k++){
    const angle=a+k*Math.PI*2/lobes,reach=radius*(.35+rng()*.55);
    const x=anchor[0]+Math.cos(angle)*reach,z=anchor[2]+Math.sin(angle)*reach;
    if(k===0||j===0)branch([anchor[0],anchor[1]-.25,anchor[2]],[x,cy-.12,z],.075,.018);
    dummy.position.set(x,cy+(rng()-.5)*.55,z);
    dummy.scale.set(crownWidth*(.48+rng()*.36),.48+rng()*.49,crownWidth*(.43+rng()*.34));
    dummy.rotation.set((rng()-.5)*.24,-angle,(rng()-.5)*.18);
    dummy.updateMatrix();canopy.setMatrixAt(ci,dummy.matrix);
    foliageKinds[ci]=cedar?-1:(index+j)%3;canopyTree[ci]=index;
    canopy.setColorAt(ci++,new T.Color(cedar?(j%2?0x7e9b8d:0x617f7b):tr.persimmon?0xbab184:0xa7b692));
    if(tr.persimmon&&k<2){
     const fruit=new T.Mesh(fruitGeometry,fruitMaterial);
     fruit.name='persimmon';
     fruit.position.set(x+Math.cos(angle)*.28,cy-1.39,z+Math.sin(angle)*.28);
     fruit.scale.set(.12,.105,.115);root.add(fruit);seasonalFruit.push(fruit);
     const stemTop=[fruit.position.x,fruit.position.y+.34,fruit.position.z];
     seasonalFruit.push(branch([fruit.position.x,fruit.position.y+.10,fruit.position.z],stemTop,.008,.006));
     for(let lobe=0;lobe<4;lobe++){
      const bearing=lobe*Math.PI/2+.35;
      const calyx=new T.Mesh(fruitGeometry,calyxMaterial);
      calyx.position.copy(fruit.position);
      calyx.position.x+=Math.cos(bearing)*.044;calyx.position.z+=Math.sin(bearing)*.044;
      calyx.position.y+=.099;calyx.rotation.y=-bearing;calyx.scale.set(.052,.015,.025);
      root.add(calyx);seasonalFruit.push(calyx);
     }
    }

   }
  }
 }
 canopy.count=ci;fringe.count=fi;
 const canopyBase=canopy.instanceMatrix.array.slice(),fringeBase=fringe.instanceMatrix.array.slice();
 // Winter: every third broadleaf tree drops all its leaves. Cedars and persimmons keep theirs.
 const bareInWinter=treeLocations.map((tr,i)=>!tr.persimmon&&i%3!==0&&i%3===1);
 // Tree crowns retain leaf colors throughout spring; no blossom sprites.
 // Autumn: leaves drifting down from the trees, recycled in a loop.
 const fallSeed=random(9917),falling=new T.InstancedMesh(new T.PlaneGeometry(.15,.1),new T.MeshLambertMaterial({side:T.DoubleSide}),260),fallingLeaves=[];
 for(let i=0;i<260;i++){const tr=treeLocations[Math.floor(fallSeed()*treeLocations.length)],a=fallSeed()*Math.PI*2,d=fallSeed()*2.2;fallingLeaves.push({x:tr.x+Math.cos(a)*d,z:tr.z+Math.sin(a)*d,top:heightAt(tr.x,tr.z)+tr.h*.85,ground:heightAt(tr.x,tr.z),phase:fallSeed(),speed:.05+fallSeed()*.05,spin:fallSeed()*6});falling.setColorAt(i,new T.Color([0xa36f45,0xc08a55,0x8f5f3b,0xb57b4a][i%4]));}
 falling.name='falling autumn leaves';falling.visible=false;falling.frustumCulled=false;root.add(falling);
 function animateFalling(t){
  if(!falling.visible)return;
  for(let i=0;i<fallingLeaves.length;i++){const l=fallingLeaves[i],u=(t*l.speed+l.phase)%1;
   dummy.position.set(l.x+Math.sin(t*1.3+l.spin)*.45*u,l.top+(l.ground-l.top)*u,l.z+Math.cos(t*1.1+l.spin)*.3*u);
   dummy.rotation.set(t*2+l.spin,t*1.4+l.spin,t*.9);dummy.scale.setScalar(1);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);}
  falling.instanceMatrix.needsUpdate=true;
 }
 const leafRandom=random(5521),leafColors=[0xa36f45,0x8f5f3b,0xc08a55,0xb57b4a,0x7d5638],fallen=new T.InstancedMesh(new T.PlaneGeometry(.16,.1),new T.MeshLambertMaterial({side:T.DoubleSide}),1400);
 let li=0;
 for(let tries=0;tries<6000&&li<1400;tries++){
  const tr=treeLocations[Math.floor(leafRandom()*treeLocations.length)],a=leafRandom()*Math.PI*2,d=Math.sqrt(leafRandom())*2.8;
  const x=tr.x+Math.cos(a)*d,z=tr.z+Math.sin(a)*d;
  if(nearCafe(x,z,.1)||pondDistance(x,z)<pondRadius+.4||z<=streamEndZ&&Math.abs(x-riverAt(z))<2.3)continue;
  dummy.position.set(x,heightAt(x,z)+.02,z);dummy.rotation.set(-Math.PI/2+(leafRandom()-.5)*.4,0,leafRandom()*Math.PI*2);dummy.scale.setScalar(.7+leafRandom()*.7);dummy.updateMatrix();
  fallen.setMatrixAt(li,dummy.matrix);fallen.setColorAt(li++,new T.Color(leafColors[Math.floor(leafRandom()*leafColors.length)]));
 }
 fallen.count=li;fallen.name='fallen autumn leaves';fallen.visible=false;root.add(fallen);
 // Snow: drifts heaped against tree trunks, low mounds across open ground, and short tufts poking through.
 const snowRandom=random(6043),drifts=new T.InstancedMesh(clusterG,new T.MeshLambertMaterial({color:0xf3f5f9}),420);let di=0;
 const openGround=(x,z)=>!nearCafe(x,z,.4)&&pondDistance(x,z)>pondRadius+.6&&!(z<=streamEndZ&&Math.abs(x-riverAt(z))<2.6)&&Math.abs(x-pathAt(z))>1.1;
 for(const tr of treeLocations){for(let k=0;k<3;k++){const a=snowRandom()*Math.PI*2,d=tr.r+.25+snowRandom()*.5,x=tr.x+Math.cos(a)*d,z=tr.z+Math.sin(a)*d;if(!openGround(x,z)||di>=420)continue;
  dummy.position.set(x,heightAt(x,z)+snowRelief(x,z)-.06,z);dummy.rotation.set(0,a,0);dummy.scale.set(.5+snowRandom()*.5,.18+snowRandom()*.22,.35+snowRandom()*.35);dummy.updateMatrix();drifts.setMatrixAt(di++,dummy.matrix);}}
 for(let tries=0;tries<3000&&di<420;tries++){const z=24-snowRandom()*78,x=(snowRandom()-.5)*46;if(!openGround(x,z))continue;
  dummy.position.set(x,heightAt(x,z)+snowRelief(x,z)-.19,z);dummy.rotation.set(0,snowRandom()*6,0);dummy.scale.set(.9+snowRandom()*1.6,.12+snowRandom()*.2,.7+snowRandom()*1.3);dummy.updateMatrix();drifts.setMatrixAt(di++,dummy.matrix);}
 drifts.count=di;drifts.name='snow drifts';drifts.visible=false;drifts.receiveShadow=true;root.add(drifts);
 const tuftG=new T.BufferGeometry(),tuftVertices=[];
 for(let b=0;b<6;b++){
  const angle=b*2.399,spread=.034+(b%3)*.012;
  const cx=Math.cos(angle)*spread,cz=Math.sin(angle)*spread;
  const sideX=Math.cos(angle+Math.PI/2)*.010,sideZ=Math.sin(angle+Math.PI/2)*.010;
  tuftVertices.push(cx-sideX,0,cz-sideZ,cx+sideX,0,cz+sideZ,cx*2.45,.075+(b%3)*.021,cz*2.45);
 }
 tuftG.setAttribute('position',new T.Float32BufferAttribute(tuftVertices,3));tuftG.computeVertexNormals();
 const tufts=new T.InstancedMesh(tuftG,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),320);
 const winterTints=[0x999170,0x7f856a,0x9b9b74,0xb2a074].map(color=>new T.Color(color));
 let ti=0;
 for(let patch=0;patch<80;patch++){
  const z=23-snowRandom()*75,side=snowRandom()<.5?-1:1;
  const x=patch<57?pathAt(z)+side*(1.52+snowRandom()*1.45):(snowRandom()-.5)*30;
  if(!openGround(x,z))continue;
  const clumps=2+Math.floor(snowRandom()*4);
  for(let i=0;i<clumps&&ti<320;i++){
   const px=x+(snowRandom()-.5)*.59,pz=z+(snowRandom()-.5)*.52;
   if(!openGround(px,pz))continue;
   dummy.position.set(px,heightAt(px,pz)+snowRelief(px,pz)+.012,pz);
   dummy.rotation.set(0,snowRandom()*Math.PI*2,0);
   dummy.scale.setScalar(.74+snowRandom()*.46);dummy.updateMatrix();
   tufts.setMatrixAt(ti,dummy.matrix);tufts.setColorAt(ti,winterTints[ti%winterTints.length]);ti++;
  }
 }
 tufts.count=ti;tufts.name='grass through snow';tufts.visible=false;root.add(tufts);
 canopy.instanceMatrix.needsUpdate=true;fringe.instanceMatrix.needsUpdate=true;root.add(canopy,fringe);
 // Curved tapered blades grow in uneven clumps; roots stay dark and tips catch light.
 const grassG=new T.BufferGeometry(),gpos=[],gcol=[],guv=[],gidx=[],bladeHeights=[];
 const grassColors=[0x82968a,0x9caa88,0xb1b29a,0x929e94,0xa4ab98];
 const grassRandom=random(7341);
 for(let clump=0;clump<13500;clump++){
  let z=26-grassRandom()*84;
  const side=grassRandom()<.5?-1:1;
  let x=(grassRandom()-.5)*48;
  if(clump%5<2){
   x=pathAt(z)+side*(1.65+grassRandom()*2.8);
  }else if(clump%5===2){
   z=-28-grassRandom()*23;
   x=riverAt(z)+side*(2.55+grassRandom()*1.6);
  }else if(clump%10===3){
   const angle=grassRandom()*Math.PI*2;
   const radius=pondRadius+.65+grassRandom()*1.2;
   x=pondX+Math.cos(angle)*radius;
   z=pondZ+Math.sin(angle)*radius;
  }
  if((Math.abs(x+.45)<2.62&&z> -41.35&&z< -37.0)||pondDistance(x,z)<pondRadius+.36||nearCafe(x,z,.2)||Math.abs(x-pathAt(z))<1.35||z<=streamEndZ&&Math.abs(x-riverAt(z))<2.25)continue;
  const patch=.5+.5*Math.sin(x*.7+Math.cos(z*.25))*Math.cos(z*.45);
  if(grassRandom()>.83+patch*.17)continue;
  const reeds=pondDistance(x,z)<pondRadius+1.2||z< -28&&Math.abs(x-riverAt(z))<2.8;
  const blades=5+Math.floor(grassRandom()*5),size=.48+grassRandom()*.64;
  for(let blade=0;blade<blades;blade++){
   const bx=x+(grassRandom()-.5)*.38,bz=z+(grassRandom()-.5)*.38,y=heightAt(bx,bz);
   const h=(reeds?.78+grassRandom()*.72:.17+grassRandom()*.49)*size,w=.016+grassRandom()*.028,a=grassRandom()*Math.PI*2;
   const bend=.14+grassRandom()*.38,dx=Math.cos(a),dz=Math.sin(a),base=gpos.length/3;
   const pigment=new T.Color(grassColors[Math.floor(grassRandom()*grassColors.length)]);
   const seedHead=blade===0&&(reeds||clump%5===0);
   for(let j=0;j<=6;j++){
    const t=j/6,width=seedHead?(j===5?.036:(1-t)*.012):w*(1-t)*(.8+.2*Math.sin(t*3)),cx=bx+dx*bend*t*t,cz=bz+dz*bend*t*t;
    for(const side of [-1,1]){gpos.push(cx-dz*width*side,y+h*t,cz+dx*width*side);guv.push((side+1)/2,t);bladeHeights.push(h*t);const shade=.67+.33*t;if(seedHead&&j>=5)gcol.push(.52*shade,.37*shade,.17*shade);else gcol.push(pigment.r*shade,pigment.g*shade,pigment.b*shade);}
    if(j<6){const k=base+j*2;gidx.push(k,k+1,k+2,k+1,k+3,k+2);}
   }
  }
 }
 grassG.setAttribute('position',new T.Float32BufferAttribute(gpos,3));grassG.setAttribute('color',new T.Float32BufferAttribute(gcol,3));grassG.setAttribute('uv',new T.Float32BufferAttribute(guv,2));grassG.setAttribute('bladeHeight',new T.Float32BufferAttribute(bladeHeights,1));grassG.setIndex(gidx);grassG.computeVertexNormals();
 const wind={value:0},windStrength={value:1},grassHeight={value:1},grassMat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,map:textures.leaf});
 grassMat.onBeforeCompile=shader=>{shader.uniforms.windTime=wind;shader.uniforms.windStrength=windStrength;shader.uniforms.grassHeight=grassHeight;shader.vertexShader='uniform float windTime, windStrength, grassHeight; attribute float bladeHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat breeze=sin(position.x*.47+position.z*.31+windTime*1.5)*.10+sin(position.z*.82+windTime*2.4)*.035;breeze*=windStrength;transformed.y-=bladeHeight*(1.-grassHeight);transformed.x+=breeze*uv.y*uv.y;transformed.z+=breeze*.5*uv.y*uv.y;');};
 const grass=new T.Mesh(grassG,grassMat);grass.name='curved-clump-grass';root.add(grass);
 // A painted stream opens to the right of the path in the third area.
 const wp=[],wu=[],wi=[];
 const waterSegments=250;
 for(let i=0;i<=waterSegments;i++){
  const z=streamEndZ+(streamStartZ-streamEndZ)*i/waterSegments,x=riverAt(z);
  const width=1.65+.14*Math.sin(z*.4);
  wp.push(x-width,-.08,z,x+width,-.08,z);wu.push(0,i*.12,1,i*.12);
  if(i<waterSegments){const a=i*2;wi.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const waterG=new T.BufferGeometry();waterG.setAttribute('position',new T.Float32BufferAttribute(wp,3));waterG.setAttribute('uv',new T.Float32BufferAttribute(wu,2));waterG.setIndex(wi);waterG.computeVertexNormals();const waterMat=new T.MeshLambertMaterial({color:0x6c91a5,side:T.DoubleSide,transparent:true,opacity:.86});const water=new T.Mesh(waterG,waterMat);root.add(water);
 // Separate stone geometry and material; foliage textures never tint the rocks.
 const stoneG=new T.SphereGeometry(1,20,14),stoneVertices=stoneG.attributes.position;
 for(let i=0;i<stoneVertices.count;i++){
  const x=stoneVertices.getX(i),y=stoneVertices.getY(i),z=stoneVertices.getZ(i);
  const r=1+.065*Math.sin(x*5+z*3)*Math.cos(y*4)+.035*Math.sin(z*7-y*2);
  stoneVertices.setXYZ(i,x*r,Math.max(-.62,y*r),z*r);
 }stoneG.computeVertexNormals();
 const rockMat=new T.MeshStandardMaterial({map:textures.stone||textures.leaf,color:0xd3d4e0,roughness:.94});
 rockMat.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 stonePoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstonePoint=position;');
  shader.fragmentShader='varying vec3 stonePoint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float surfaceVariation=.5+.5*sin(stonePoint.x*11.+sin(stonePoint.z*8.))*cos(stonePoint.z*7.);
   float moss=(1.-smoothstep(-.25,.28,stonePoint.y))*smoothstep(.40,.78,surfaceVariation);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.32,.23),moss*.48);
   float damp=1.-smoothstep(-.6,-.12,stonePoint.y);
   diffuseColor.rgb*=1.-damp*.18;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.62,1.-smoothstep(-.6,-.12,stonePoint.y));');
 };
for(let i=0;i<32;i++){const z=22-rng()*69,river=riverAt(z),side=rng()<.5?-1:1,x=river+side*(1.9+rng()*.9),m=new T.Mesh(stoneG,rockMat);m.position.set(x,heightAt(x,z)+.14,z);m.scale.set(.35+rng()*.7,.20+rng()*.25,.35+rng()*.55);m.rotation.y=rng()*6;root.add(m);}
 // Low stones sit half buried beside the trail in occasional clusters.
 const stoneRandom=random(6482),trailStones=new T.InstancedMesh(stoneG,rockMat,88);
 const stonePose=new T.Object3D();
 let stoneCount=0;
 for(let cluster=0;cluster<27;cluster++){
  const centerZ=18-stoneRandom()*69,side=stoneRandom()<.5?-1:1;
  for(let i=0;i<3;i++){
   const z=centerZ+(stoneRandom()-.5)*1.25;
   const x=pathAt(z)+side*(1.65+stoneRandom()*.85);
   if(pondDistance(x,z)<pondRadius+.45||z<=streamEndZ&&Math.abs(x-riverAt(z))<2.35||nearCafe(x,z,.3))continue;
   const size=.11+stoneRandom()*.25;
   stonePose.position.set(x,heightAt(x,z)+size*.1,z);
   stonePose.scale.set(size,size*(.35+stoneRandom()*.38),size*(.7+stoneRandom()*.4));
   stonePose.rotation.set(stoneRandom()*.25,stoneRandom()*Math.PI,stoneRandom()*.2);
   stonePose.updateMatrix();trailStones.setMatrixAt(stoneCount,stonePose.matrix);
   trailStones.setColorAt(stoneCount++,new T.Color([0xc0b6b3,0x9ba8a2,0xa4a4b0][i]));
  }
 }
 trailStones.count=stoneCount;trailStones.name='trail-edge stones';root.add(trailStones);
 // A rock amphitheatre closes the stream; the path approaches its left bank.
 const waterfall=new T.Group();waterfall.name='waterfall';root.add(waterfall);
 const fallX=7+1.6*Math.sin(-56*.12),fallZ=-56,fallHeight=14;
 const cliffMat=new T.MeshLambertMaterial({map:textures.stone||textures.bark,color:0xaaa4b5});
 const mistCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;if(mistCanvas){mistCanvas.width=mistCanvas.height=128;const g=mistCanvas.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,.9)');r.addColorStop(.45,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);}
 const mistTexture=mistCanvas?new T.CanvasTexture(mistCanvas):null,mistPuffs=[];
 for(let i=0;i<40;i++){const puff=new T.Sprite(new T.SpriteMaterial({map:mistTexture,color:0xf4eef3,transparent:true,opacity:.7+rng()*.25,depthWrite:false}));
  const base=new T.Vector3(fallX+(rng()-.5)*8,fallHeight-2+rng()*9,fallZ-.5-rng()*3);puff.position.copy(base);puff.scale.setScalar(6+rng()*5);puff.name='waterfall top mist';waterfall.add(puff);mistPuffs.push({puff,base,phase:rng()*6});}
 // Tall mountain shoulders frame a narrow, open source gully.
 for(let i=0;i<15;i++){const rock=new T.Mesh(clusterG,cliffMat),offset=-8+i*1.15,central=Math.abs(offset)<1.9;rock.position.set(fallX+offset,central?5:7.5,fallZ-2.2-rng());rock.scale.set(1.1+rng()*.6,central?7:10+rng()*3,1.5+rng());rock.rotation.y=rng()*3;waterfall.add(rock);}
 for(const side of [-1,1]){const peak=new T.Mesh(clusterG,cliffMat);peak.position.set(fallX+side*5.5,8,fallZ-7);peak.scale.set(5.1,15,5.4);peak.rotation.z=side*.13;waterfall.add(peak);}
 // Overlapping foothills join the waterfall cliff to a continuous mountain range.
 const ridgeMaterial=new T.MeshLambertMaterial({map:textures.leaf,color:0x999ba7});
 for(const side of [-1,1]){for(let i=0;i<5;i++){const ridge=new T.Mesh(clusterG,i<2?cliffMat:ridgeMaterial);ridge.name='supporting-ridge';ridge.position.set(fallX+side*(10+i*7),4.5-i*.6,fallZ-5-i*4);ridge.scale.set(8+i*1.7,12-i*1.6,7+i);ridge.rotation.z=side*(.18+i*.025);waterfall.add(ridge);}}
 const hut=new T.Group();hut.name='streamside-workspace';hut.position.set(-1.5,heightAt(-1.5,-43),-43);root.add(hut);
 const timber=new T.MeshStandardMaterial({map:textures.bark,color:0xd8b9a1});
 const roofMat=new T.MeshStandardMaterial({map:textures.leaf,color:0x657c7a});
 function box(parent,w,h,d,x,y,z,mat){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 const {west:westWall,east:eastWall,back:backWall,front:frontWall}=CAFE_LAYOUT;
 const {stairX,stairsFront,stairsBack,loftHeight}=CAFE_LAYOUT;
 const groundObstacles=[{minX:-.95,maxX:2.55,minZ:-3.345,maxZ:-2.575},{minX:2.25,maxX:2.78,minZ:-1.65,maxZ:.92},{minX:.35,maxX:1.65,minZ:-.28,maxZ:.58},{minX:-.30,maxX:.40,minZ:-.20,maxZ:.50},{minX:-1.20,maxX:-.50,minZ:.70,maxZ:1.30}];
 box(hut,eastWall-westWall,.16,frontWall-backWall,(westWall+eastWall)/2,.09,(frontWall+backWall)/2,timber);
 const curtainMaterial=new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide});
 const curtainPanels=[];
 const laceMaterial=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,side:T.DoubleSide});
 const laceTrim=laceMaterial.clone();laceTrim.depthWrite=false;
 if(typeof document!=='undefined'){
  const tile=document.createElement('canvas');tile.width=512;tile.height=32;
  const ctx=tile.getContext('2d');ctx.strokeStyle='#fff';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(512,5);
  for(let x=0;x<512;x+=16){
   ctx.moveTo(x,5);ctx.quadraticCurveTo(x+8,31,x+16,5);
   ctx.moveTo(x+3,7);ctx.quadraticCurveTo(x+8,19,x+13,7);
  }
  ctx.stroke();laceTrim.map=new T.CanvasTexture(tile);
 }
 let curtainsClosed=false,curtainProgress=0;
 function toggleCurtains(){curtainsClosed=!curtainsClosed;return curtainsClosed;}
 const glass=new T.MeshBasicMaterial({color:0xa6c1c8,transparent:true,opacity:.12,depthWrite:false});
 function windowBay(parent,width,height,x,y,z,angle=0,withCurtain=true){
  const bay=new T.Group();bay.userData.snowLedge={width,height};bay.position.set(x,y,z);bay.rotation.y=angle;parent.add(bay);
  const pane=box(bay,width,height,.018,0,0,0,glass);
  pane.name='glass pane';
  for(const edge of [-1,1]){
   box(bay,.085,height,.10,edge*width/2,0,0,timber);
   box(bay,width,.085,.10,0,edge*height/2,0,timber);
  }
  box(bay,width,.055,.085,0,-.23,0,timber);
  if(withCurtain){
   box(bay,width,.032,.038,0,height/2-.085,-.07,timber);
   for(const side of [-1,1]){
    const pleats=new T.PlaneGeometry(width*.49,height*.90,20,8);
    const pos=pleats.attributes.position;
    for(let i=0;i<pos.count;i++){const u=pos.getX(i);pos.setZ(i,Math.sin(u/width*73)*.029);pos.setY(i,pos.getY(i)-.015*Math.cos(u/width*55));}
    pleats.computeVertexNormals();
    const panel=new T.Mesh(pleats,curtainMaterial);panel.name='curtain';panel.position.z=-.09;bay.add(panel);
       const lace=new T.Mesh(new T.PlaneGeometry(width*.49,.088),laceTrim);
    lace.position.set(0,-height*.43,.015);panel.add(lace);
    const tie=box(panel,width*.43,.055,.044,0,-.09,.035,laceMaterial);
    tie.castShadow=false;
    curtainPanels.push({mesh:panel,side,width,restX:pos.array.slice(),tie});
   }
  }
  return bay;
 }
 for(const x of [westWall,eastWall])for(let i=0;i<4;i++){const width=(frontWall-backWall)/4;windowBay(hut,width,2.35,x,1.36,backWall+width*(i+.5),x===westWall?-Math.PI/2:Math.PI/2);}
 for(let i=0;i<5;i++){const width=(eastWall-westWall)/5;windowBay(hut,width,2.35,westWall+width*(i+.5),1.36,backWall,Math.PI);}
 windowBay(hut,-.5-westWall,2.35,(westWall-.5)/2,1.36,frontWall);
 windowBay(hut,eastWall-.5,2.35,(eastWall+.5)/2,1.36,frontWall);
 const cafeDoor=new T.Group();cafeDoor.name='cafe glass door';cafeDoor.position.set(-.5,.18,frontWall);hut.add(cafeDoor);
 windowBay(cafeDoor,1,2.35,.5,1.18,0,false);
 box(cafeDoor,.055,.13,.13,.89,1.07,0,timber);
 let doorOpen=false;
 function toggleDoor(){doorOpen=!doorOpen;cafeDoor.rotation.y=doorOpen?-Math.PI/2:0;return doorOpen;}
 const roofCenter=-.7,roofRidge=5.95,eaves=4.65,roofRun=3.85,roofRise=roofRidge-eaves,roofDepth=frontWall-backWall+.65;
 for(const side of [-1,1]){
  const roof=box(hut,Math.hypot(roofRun,roofRise),.16,roofDepth,roofCenter+side*roofRun/2,(roofRidge+eaves)/2,(frontWall+backWall)/2,roofMat);
  roof.name='cafe roof snow receiver';
  roof.rotation.z=-side*Math.atan2(roofRise,roofRun);
 }
 box(hut,.11,2.14,frontWall-backWall,westWall,3.58,(frontWall+backWall)/2,timber);
 // A window in the east wall lights the bed and the lamp beside it.
 box(hut,.11,2.14,-2.34-backWall,eastWall,3.58,(backWall-2.34)/2,timber);
 box(hut,.11,2.14,frontWall+1.18,eastWall,3.58,(frontWall-1.18)/2,timber);
 box(hut,.11,.68,1.16,eastWall,2.85,-1.76,timber);
 box(hut,.11,.54,1.16,eastWall,4.38,-1.76,timber);
 windowBay(hut,1.16,.91,eastWall,3.645,-1.76,Math.PI/2);
 for(const z of [backWall,frontWall]){
  if(z===backWall)box(hut,eastWall-westWall,2.14,.11,roofCenter,3.58,z,timber);
  else {
   for(const side of [-1,1])box(hut,(eastWall-westWall-.94)/2,2.14,.11,roofCenter+side*((eastWall-westWall+.94)/4),3.58,z,timber);
   box(hut,.94,.70,.11,roofCenter,2.86,z,timber);
   box(hut,.94,.77,.11,roofCenter,4.27,z,timber);
  }
  const gable=new T.BufferGeometry();
  gable.setAttribute('position',new T.Float32BufferAttribute([westWall,eaves,z,eastWall,eaves,z,roofCenter,roofRidge,z],3));gable.computeVertexNormals();
  hut.add(new T.Mesh(gable,new T.MeshLambertMaterial({color:0x947560,side:T.DoubleSide})));
 }
 const attic=new T.Group();attic.name='café attic bedroom';hut.add(attic);
 // The stair opening stays clear of the loft floor.
 box(attic,eastWall-CAFE_LAYOUT.loftEdge,.15,-.02-backWall,(eastWall+CAFE_LAYOUT.loftEdge)/2,loftHeight-.075,(backWall-.02)/2,timber);
 box(attic,CAFE_LAYOUT.loftEdge-westWall,.15,stairsBack-backWall,(westWall+CAFE_LAYOUT.loftEdge)/2,loftHeight-.075,(backWall+stairsBack)/2,timber);
 for(let i=0;i<14;i++){
  const run=(stairsFront-stairsBack)/14,rise=(loftHeight-.17)/14;
  box(attic,.86,.115,run+.026,stairX,.17+(i+1)*rise-.0575,stairsFront-(i+.5)*run,timber);
 }
 for(let i=0;i<7;i++){
  const u=i/6;
  box(attic,.045,.79,.045,stairX-.48,.54+u*(loftHeight-.17),stairsFront-u*(stairsFront-stairsBack),timber);
 }
 const handrail=box(attic,.067,.068,Math.hypot(stairsFront-stairsBack,loftHeight-.17),stairX-.48,.97+(loftHeight-.17)/2,(stairsFront+stairsBack)/2,timber);
 handrail.rotation.x=Math.atan2(loftHeight-.17,stairsFront-stairsBack);
 for(const x of [-2.85,-1.75,-.65,.45,1.55,2.65])box(attic,.065,.77,.065,x,loftHeight+.38,-.025,timber);
 box(attic,eastWall-CAFE_LAYOUT.loftEdge,.075,.08,(eastWall+CAFE_LAYOUT.loftEdge)/2,loftHeight+.77,-.025,timber);
 const linen=new T.MeshLambertMaterial({color:0xf4e5cb});
 // Attic furniture. Positions here are local to the café.
 const bedX=.48,bedZ=-1.85;
 // Round wool rug: its centre meets the foot of the bed, leaving roughly half exposed.
 const rugMaterial=new T.MeshLambertMaterial({color:0xffffff});
 rugMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec2 woolUV;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwoolUV=uv;');
  shader.fragmentShader='varying vec2 woolUV;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=(woolUV-.5)*2.;float r=length(p),a=atan(p.y,p.x);
   float hash=fract(sin(dot(floor(woolUV*1000.),vec2(127.1,311.7)))*43758.5453);
   float waviness=.018*sin(a*9.)+.012*sin(a*17.+1.);
   float ring=1.-smoothstep(.025,.065,abs(r-.49-waviness));
   float edge=smoothstep(.76,.99,r+waviness);
   vec3 wool=mix(vec3(.43,.50,.18),vec3(.12,.22,.105),max(ring*.76,edge));
   float pile=.78+.30*hash+.08*sin(a*410.+r*65.);
   diffuseColor.rgb=wool*pile;
  `);
 };
 const rugG=new T.CircleGeometry(.87,96);rugG.rotateX(-Math.PI/2);
 const rug=new T.Mesh(rugG,rugMaterial);rug.position.set(bedX,loftHeight+.040,bedZ+.92);rug.name='large rug under the bed';attic.add(rug);
 const woolRandom=random(61625),woolPositions=[],woolColors=[];
 for(let i=0;i<6500;i++){
  const a=woolRandom()*Math.PI*2,r=Math.sqrt(woolRandom())*.87,x=Math.cos(a)*r,z=Math.sin(a)*r;
  const edge=r/.87>.78,ring=Math.abs(r/.87-.49)<.035,c=new T.Color(edge||ring?0x3d542a:0x8a9950).multiplyScalar(.8+woolRandom()*.35);
  woolPositions.push(x,0,z,x+Math.cos(a)*.009,.006+woolRandom()*.014,z+Math.sin(a)*.009);for(let k=0;k<2;k++)woolColors.push(c.r,c.g,c.b);
 }
 const woolG=new T.BufferGeometry();woolG.setAttribute('position',new T.Float32BufferAttribute(woolPositions,3));woolG.setAttribute('color',new T.Float32BufferAttribute(woolColors,3));
 const woolPile=new T.LineSegments(woolG,new T.LineBasicMaterial({vertexColors:true}));woolPile.name='soft green wool pile';woolPile.position.copy(rug.position);attic.add(woolPile);
 const bed=new T.Group();bed.name='attic bed';bed.position.set(bedX,loftHeight,bedZ);attic.add(bed);
 box(bed,1.22,.21,1.84,0,.16,0,timber);
 box(bed,1.19,.19,1.81,0,.36,0,linen).name='mattress';
 const sheetGeometry=new T.PlaneGeometry(1.48,2.05,28,24);
 sheetGeometry.rotateX(-Math.PI/2);
 const sheetPoints=sheetGeometry.attributes.position;
 for(let i=0;i<sheetPoints.count;i++){
  const x=sheetPoints.getX(i),z=sheetPoints.getZ(i);
  const overhang=Math.max(0,(Math.abs(x)-.57)/.17,(z-.84)/.185);
  sheetPoints.setY(i,.009*Math.sin(x*21+z*7)-.24*overhang);
 }
 sheetGeometry.computeVertexNormals();
 const sheet=new T.Mesh(sheetGeometry,new T.MeshLambertMaterial({color:0xfff5e4,side:T.DoubleSide}));
 sheet.name='white bedsheet';sheet.position.y=.46;bed.add(sheet);
 box(bed,1.23,.57,.08,0,.56,-.94,timber);

 const pillow=new T.Mesh(new T.SphereGeometry(1,28,18),linen);
 pillow.name='oversized pillow';pillow.position.set(-.065,.51,-.61);
 pillow.scale.set(.55,.178,.35);pillow.rotation.y=-.09;bed.add(pillow);
 const duvetGeometry=new T.PlaneGeometry(1.46,1.20,28,24);
 duvetGeometry.rotateX(-Math.PI/2);
 const duvetPositions=duvetGeometry.attributes.position;
 for(let i=0;i<duvetPositions.count;i++){
  const x=duvetPositions.getX(i),z=duvetPositions.getZ(i);
  const drape=Math.pow(Math.max(0,(Math.abs(x)-.49)/.225),2)*.23;
  duvetPositions.setY(i,.041*Math.cos(x*4)+.014*Math.sin(x*16+z*6)-drape);
 }
 duvetGeometry.computeVertexNormals();
 const duvet=new T.Mesh(duvetGeometry,new T.MeshLambertMaterial({color:0xaa6571,side:T.DoubleSide}));
 duvet.name='rose wool kambal';duvet.position.set(0,.519,.255);bed.add(duvet);
 const fold=new T.Mesh(new T.CylinderGeometry(.048,.048,1.24,16),new T.MeshLambertMaterial({color:0xc3888c}));
 fold.rotation.z=Math.PI/2;fold.position.set(0,.549,-.32);bed.add(fold);
 const hem=new T.MeshLambertMaterial({color:0xd0a0a0});
 for(let i=0;i<20;i++){
  const x=-.60+i*.064;
  const tassel=box(bed,.015,.060,.014,x,.509+.036*Math.cos(x*4),.864,hem);
  tassel.rotation.x=.30;
 }

 const nightstand=new T.Group();nightstand.name='attic side table';nightstand.position.set(1.52,loftHeight,-1.70);attic.add(nightstand);
 box(nightstand,.45,.07,.47,0,.42,0,timber);
 for(const x of [-.17,.17])for(const z of [-.17,.17])box(nightstand,.052,.42,.052,x,.21,z,timber);
 const bedroomLamp=new T.Group();bedroomLamp.name='poppy paper bedside lamp';bedroomLamp.position.y=.46;nightstand.add(bedroomLamp);
 let poppyTexture=null;
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=c.height=384;const g=c.getContext('2d');g.fillStyle='#e4a545';g.fillRect(0,0,384,384);
  const rand=random(45813);
  for(let i=0;i<4800;i++){g.fillStyle=i%2?'#fff0c010':'#7a56200b';g.fillRect(rand()*384,rand()*384,1+rand()*8,.6);}
  for(const [x,y,r] of [[72,250,86],[265,100,94],[327,350,74]]){
   g.save();g.translate(x,y);g.rotate(x*.01);g.fillStyle='#c34129';
   for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.ellipse(Math.cos(a)*r*.34,Math.sin(a)*r*.34,r*.48,r*.55,a,0,Math.PI*2);g.fill();}
   g.fillStyle='#3f4328';g.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=k%2?r*.11:r*.30;k?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();g.restore();
  }
  poppyTexture=new T.CanvasTexture(c);poppyTexture.colorSpace=T.SRGBColorSpace;
 }
 const poppyPaper=new T.MeshStandardMaterial({color:0xf2b65d,map:poppyTexture,emissive:0xffb860,emissiveMap:poppyTexture,emissiveIntensity:.58,roughness:.96,side:T.DoubleSide});
 const poppyFrame=new T.MeshStandardMaterial({color:0x79784c,roughness:.85});
 for(const side of [-1,1]){
  const panel=new T.Mesh(new T.PlaneGeometry(.28,.28),poppyPaper);panel.position.set(0,.25,side*.14);panel.rotation.y=side===1?0:Math.PI;bedroomLamp.add(panel);
  const other=new T.Mesh(new T.PlaneGeometry(.28,.28),poppyPaper);other.position.set(side*.14,.25,0);other.rotation.y=side*Math.PI/2;bedroomLamp.add(other);
 }
 for(const x of [-.15,.15])for(const z of [-.15,.15])box(bedroomLamp,.012,.40,.012,x,.20,z,poppyFrame);
 for(const y of [.105,.395])for(const side of [-1,1]){box(bedroomLamp,.31,.012,.012,0,y,side*.15,poppyFrame);box(bedroomLamp,.012,.012,.31,side*.15,y,0,poppyFrame);}
 const loftLight=new T.PointLight(0xffbd70,1.65,3.7,2);loftLight.position.set(0,.24,0);bedroomLamp.add(loftLight);

 // Compact bedroom furniture leaves the west stair opening and landing clear.
 const bedroomWood=new T.MeshStandardMaterial({map:textures.barkSoft||textures.bark,color:0xa68a70,roughness:.88});
 const bedroomBookshelf=new T.Group();bedroomBookshelf.name='small bedroom bookshelf';bedroomBookshelf.position.set(-.85,loftHeight,-2.63);attic.add(bedroomBookshelf);
 box(bedroomBookshelf,.55,.55,.025,0,.285,-.12,bedroomWood);
 for(const x of [-.265,.265])box(bedroomBookshelf,.025,.56,.26,x,.28,0,bedroomWood);
 for(const y of [.035,.295,.555])box(bedroomBookshelf,.55,.025,.28,0,y,0,bedroomWood);
 const bedroomTable=new T.Group();bedroomTable.name='bedroom writing table';bedroomTable.position.set(-1.29,loftHeight,-.48);attic.add(bedroomTable);
 box(bedroomTable,.80,.055,.45,0,.72,0,bedroomWood);
 for(const x of [-.33,.33])for(const z of [-.16,.16])box(bedroomTable,.043,.70,.043,x,.35,z,bedroomWood);
 box(bedroomTable,.65,.11,.035,0,.635,.19,bedroomWood);
 const drawerKnob=new T.Mesh(new T.SphereGeometry(.018,9,6),new T.MeshStandardMaterial({color:0xa88f60,metalness:.5,roughness:.6}));drawerKnob.position.set(0,.635,.217);bedroomTable.add(drawerKnob);
 const notebook=box(bedroomTable,.21,.025,.16,.17,.762,.035,new T.MeshLambertMaterial({color:0x647b72}));notebook.name='bedroom notebook';notebook.rotation.y=-.13;
 box(bedroomTable,.17,.014,.13,.17,.764,.035,linen);
 // A handmade ceramic pot with two open lilies and an unopened bud.
 const lilyPot=new T.Group();lilyPot.name='bedroom lily pot';lilyPot.position.set(-.22,.75,-.03);bedroomTable.add(lilyPot);
 const lilyCeramic=new T.MeshStandardMaterial({color:0xddd6c3,roughness:.88});
 const potProfile=[[.067,0],[.083,.025],[.091,.11],[.077,.145],[.080,.16],[.065,.16],[.063,.145]].map(v=>new T.Vector2(...v));
 lilyPot.add(new T.Mesh(new T.LatheGeometry(potProfile,22),lilyCeramic));
 const soil=new T.Mesh(new T.CircleGeometry(.064,18),new T.MeshLambertMaterial({color:0x51483c}));soil.rotation.x=-Math.PI/2;soil.position.y=.145;lilyPot.add(soil);
 const lilyStemMat=new T.MeshLambertMaterial({color:0x718361}),lilyPetalMat=new T.MeshStandardMaterial({color:0xf4efda,roughness:.86,side:T.DoubleSide});
 const lilyLeafShape=new T.Shape();lilyLeafShape.moveTo(0,0);lilyLeafShape.bezierCurveTo(-.025,.05,-.028,.16,0,.23);lilyLeafShape.bezierCurveTo(.028,.16,.025,.05,0,0);
 for(let i=0;i<3;i++){
  const x=(i-1)*.035,h=[.36,.47,.39][i],tip=new T.Vector3(x+(i-1)*.045,h,.015*(i-1));
  const curve=new T.QuadraticBezierCurve3(new T.Vector3(x,.14,0),new T.Vector3(x,.27,-.015),tip);lilyPot.add(new T.Mesh(new T.TubeGeometry(curve,14,.004,5,false),lilyStemMat));
  for(let side of [-1,1]){const leaf=new T.Mesh(new T.ShapeGeometry(lilyLeafShape,7),lilyStemMat);leaf.position.set(x,.20+side*.025,0);leaf.rotation.set(.20,side*.6,side*.65);leaf.scale.setScalar(.65);lilyPot.add(leaf);}
  if(i===2){const bud=new T.Mesh(new T.SphereGeometry(1,12,8),lilyPetalMat);bud.position.copy(tip);bud.scale.set(.023,.058,.023);bud.rotation.z=-.2;lilyPot.add(bud);continue;}
  const flower=new T.Group();flower.position.copy(tip);flower.rotation.x=.35;flower.name='cream lily flower';lilyPot.add(flower);
  for(let k=0;k<6;k++){
   const geo=new T.PlaneGeometry(.065,.14,8,14),pos=geo.attributes.position;
   for(let v=0;v<pos.count;v++){const u=(pos.getY(v)+.07)/.14,w=Math.max(0,Math.sin(Math.PI*u))**.65;pos.setXYZ(v,pos.getX(v)*w,.015+u*.055-u*u*.025,u*.12);}
   geo.computeVertexNormals();const petal=new T.Mesh(geo,lilyPetalMat);petal.rotation.y=k*Math.PI/3;flower.add(petal);
  }
  const pollenMat=new T.MeshLambertMaterial({color:0xc5a15a});
  for(let k=0;k<5;k++){const a=k*2.4,stamen=new T.Mesh(new T.CylinderGeometry(.0015,.0015,.052,5),lilyStemMat);stamen.position.set(Math.cos(a)*.012,.030,Math.sin(a)*.012);flower.add(stamen);const pollen=new T.Mesh(new T.SphereGeometry(.004,6,4),pollenMat);pollen.position.set(Math.cos(a)*.012,.057,Math.sin(a)*.012);flower.add(pollen);}
 }

 const loftWindow=new T.Mesh(new T.PlaneGeometry(.92,.67),glass);
 loftWindow.position.set(-.67,3.55,frontWall+.057);hut.add(loftWindow);
 // Desk faces the river, with an open laptop and a proper chair.
 const desk=box(hut,1.3,.10,.85,1,1.04,.15,timber);
 for(const x of [.45,1.55])for(const z of [-.18,.48])box(hut,.07,.92,.07,x,.54,z,timber);
 const metal=new T.MeshStandardMaterial({color:0x727e8f,roughness:.8});
 const laptop=new T.Group();laptop.name='open-laptop';laptop.position.set(1,1.11,.15);laptop.rotation.y=-Math.PI/2;hut.add(laptop);
 box(laptop,.55,.025,.36,0,0,0,metal);
 const lid=new T.Group();lid.position.set(0,.02,-.17);lid.rotation.x=-.15;laptop.add(lid);box(lid,.55,.34,.025,0,.17,0,metal);
 const screenMat=new T.MeshStandardMaterial({color:0xa8c5ca,emissive:0x90bccb,emissiveIntensity:.7,roughness:1});box(lid,.49,.28,.008,0,.17,.017,screenMat);
 const ink=new T.MeshBasicMaterial({color:0x4a6d7b});for(let i=0;i<5;i++)box(lid,.27+(i%2)*.1,.009,.004,-.035,.25-i*.035,.023,ink);
 const seat=box(hut,.65,.10,.64,.05,.58,.15,timber);box(hut,.10,.65,.64,-.25,.9,.15,timber);for(const x of [-.2,.3])for(const z of [-.08,.38])box(hut,.06,.5,.06,x,.29,z,timber);
 // A compact book cafe fits around the original river-facing work desk.
 const cafe=new T.Group();cafe.name='little-stream-book-cafe';hut.add(cafe);
 const creamMat=new T.MeshLambertMaterial({color:0xead9ba}),coffeeMat=new T.MeshLambertMaterial({color:0x49372f}),sageMat=new T.MeshLambertMaterial({color:0x7a9585}),brassMat=new T.MeshStandardMaterial({color:0xb49a68,roughness:.8});
 function cylinder(parent,r,h,x,y,z,mat){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,16),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const kitchen=new T.Group();kitchen.name='back right kitchen';kitchen.position.set(.9,0,-1.9);cafe.add(kitchen);
 // Back counter: coffee machine, pastry display, sink and an under-counter oven.
 box(kitchen,3.35,.82,.62,-.10,.58,-1.06,sageMat);box(kitchen,3.5,.10,.77,-.10,1.04,-1.06,timber);
 box(kitchen,.66,.52,.43,.83,1.35,-1.13,metal);box(kitchen,.61,.18,.09,.83,1.49,-.87,creamMat);
 for(const x of [.64,1.02]){cylinder(kitchen,.09,.12,x,1.11,-.84,creamMat);box(kitchen,.025,.11,.035,x,1.29,-.86,brassMat);}
 for(const x of [.63,.83,1.03])cylinder(kitchen,.025,.025,x,1.61,-1.10,brassMat);
 const sink=box(kitchen,.48,.025,.36,-1.25,1.10,-1.05,metal);box(kitchen,.34,.03,.24,-1.25,1.105,-1.05,coffeeMat);box(kitchen,.035,.26,.035,-1.25,1.24,-1.23,brassMat);box(kitchen,.035,.035,.21,-1.25,1.36,-1.14,brassMat);
 box(kitchen,.7,.46,.025,-1.12,.61,-.735,metal);box(kitchen,.56,.30,.015,-1.12,.59,-.713,coffeeMat);box(kitchen,.43,.035,.045,-1.12,.84,-.69,brassMat);
 const tray=box(kitchen,.83,.035,.45,-.28,1.12,-.98,creamMat);tray.name='pastry-tray';
 const pastryMat=new T.MeshLambertMaterial({map:textures.bark,color:0xe5ac65});
 for(let j=0;j<3;j++){
  const croissant=new T.Group();croissant.name='croissant';croissant.position.set(-.52+j*.25,1.17,-.98);kitchen.add(croissant);
  for(let i=0;i<5;i++){const u=(i-2)/2,roll=new T.Mesh(new T.SphereGeometry(1,10,7),pastryMat);roll.position.set(u*.085,.025*(1-u*u),u*u*.045);roll.scale.set(.052*(1-.35*Math.abs(u)),.05*(1-.4*Math.abs(u)),.09);roll.rotation.y=u*.55;croissant.add(roll);}
 }
 cylinder(kitchen,.085,.08,-.45,1.16,-1.15,pastryMat);cylinder(kitchen,.087,.015,-.45,1.21,-1.15,creamMat);
 const cafeBookcase=new T.Group();cafeBookcase.name='right wall cafe bookshelf';cafeBookcase.position.set(.9,0,-.4);cafeBookcase.rotation.y=Math.PI;cafe.add(cafeBookcase);
 // Bookshelves against the side wall; varied muted covers, visible page blocks.
 for(const y of [.48,1.13,1.78])box(cafeBookcase,.43,.075,2.4,-1.64,y,.03,timber);
 box(cafeBookcase,.07,1.42,.08,-1.84,1.13,-1.17,timber);box(cafeBookcase,.07,1.42,.08,-1.84,1.13,1.23,timber);
 const shelfTarget=new T.Mesh(new T.BoxGeometry(.065,1.45,2.40),new T.MeshBasicMaterial({visible:false}));
 shelfTarget.name='bookshelf interaction';shelfTarget.position.set(-1.37,1.11,.03);cafeBookcase.add(shelfTarget);
 const upstairsPosition=new T.Vector3(hut.position.x-1.53,hut.position.y+loftHeight+1.65,hut.position.z-1.75);
 const stairFoot=new T.Vector3(hut.position.x+stairX,hut.position.y+.17+1.65,hut.position.z+stairsFront+.10);
 const bookColors=[0xdc7596,0xd7aa46,0x65a6c5,0xaf6f99,0xc8674b,0xc1c7a2,0xe6d7bb,0x758cb4];
 const bookTitles=['The Restaurant of Lost Recipes','Heart Lamp','The Woman Who Climbed Trees','The Creative Act','Tiny Experiments','Poems 1968–2020','The Year of Magical Thinking','30,000 Years of Art','Hunger','Butter','The Book of Life','The Bookshop Woman','The Artist’s Way','Gods, Guns and Missionaries','Good Material','Evenings and Weekends','Everything I Know About Love','Atlas of the Heart','The Convenience Store by the Sea','On Photography','Days at the Morisaki Bookshop','Welcome to the Hyunam-dong Bookshop','The Vegetarian','The White Book','Greek Lessons','A Philosophy of Walking','Territory of Light','Days at the Torunka Café','Boulder','Breasts and Eggs'];
 const bookAuthors=['Hisashi Kashiwai','Banu Mushtaq','Smriti Ravindra','Rick Rubin','Anne-Laure Le Cunff','Nikki Giovanni','Joan Didion','','Choi Jin-young','Asako Yuzuki','J. Krishnamurti','Nanako Hanada','Julia Cameron','Manu S. Pillai','Dolly Alderton','Oisín McKenna','Dolly Alderton','Brené Brown','Sonoko Machida','Susan Sontag','Satoshi Yagisawa','Hwang Bo-reum','Han Kang','Han Kang','Han Kang','Frédéric Gros','Yūko Tsushima','Satoshi Yagisawa','Eva Baltasar','Mieko Kawakami'];
 const books=[];
 const stackHeights=Array(5).fill(0);
 for(let i=0;i<bookTitles.length;i++){
  const stack=Math.floor(i/6),row=stack>=3?1:0;
  const z=-.79+(stack%3)*.80+(rng()-.5)*.11;
  const thickness=.041+rng()*.026,width=.23+rng()*.09,length=.43+rng()*.22;
  const color=bookColors[(i+Math.floor(i/4))%bookColors.length];
  const y=.524+row*.65+stackHeights[stack]+thickness/2;
  stackHeights[stack]+=thickness+.003;
  const book=box(cafeBookcase,width,thickness,length,-1.63+(rng()-.5)*.085,y,z,new T.MeshLambertMaterial({color}));
  book.name='book';book.userData.title=bookTitles[i];book.userData.author=bookAuthors[i];book.rotation.y=(rng()-.5)*.40;
  book.rotation.z=(rng()-.5)*.06;books.push(book);
  box(book,width*.91,thickness*.64,length*.96,-width*.04,0,0,creamMat);
  if(typeof document==='undefined')continue;
  const spineCanvas=document.createElement('canvas');spineCanvas.width=512;spineCanvas.height=72;
  const ctx=spineCanvas.getContext('2d');ctx.fillStyle='#'+new T.Color(color).getHexString();ctx.fillRect(0,0,512,72);
  ctx.font='bold 32px Georgia';ctx.fillStyle='#242629';ctx.fillText(bookTitles[i],18,47,477);
  const texture=new T.CanvasTexture(spineCanvas);texture.colorSpace=T.SRGBColorSpace;
  const spine=new T.Mesh(new T.PlaneGeometry(length*.986,thickness*.94),new T.MeshLambertMaterial({map:texture}));
  spine.position.x=width/2+.001;spine.rotation.y=Math.PI/2;book.add(spine);
 }
 // Reuse the actual cafe book meshes, titles and spine textures upstairs.
 for(let i=0;i<8;i++){
  const source=books[[0,3,8,11,18,20,22,24][i]],book=source.clone(true),row=Math.floor(i/4);
  book.name='bedroom shelf book';book.scale.setScalar(.62);book.rotation.set(0,-Math.PI/2,0);book.position.set(0,.055+row*.26+(i%4)*.043,0);bedroomBookshelf.add(book);
 }
 // A visible record player on a small side table; clicking it operates the audio control.
 box(cafe,.67,.07,.57,-.85,.78,1.0,timber);for(const x of [-1.11,-.59])for(const z of [.79,1.21])box(cafe,.055,.62,.055,x,.43,z,timber);
 const musicPlayer=new T.Group();musicPlayer.name='music-player';musicPlayer.position.set(-.85,.87,1);cafe.add(musicPlayer);
 box(musicPlayer,.58,.10,.47,0,0,0,sageMat);const record=cylinder(musicPlayer,.185,.015,-.055,.063,0,coffeeMat);cylinder(musicPlayer,.048,.018,-.055,.074,0,creamMat);box(musicPlayer,.025,.025,.25,.18,.09,0,brassMat);
 const cup=cylinder(hut,.07,.11,1.39,1.14,.30,creamMat);cylinder(hut,.058,.005,1.39,1.199,.30,coffeeMat);
 const paperLantern=new T.Group();paperLantern.name='Japanese paper cafe lantern';paperLantern.position.set(-.65,2.35,.30);cafe.add(paperLantern);
 let lanternTexture=null;
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.fillStyle='#edcf96';g.fillRect(0,0,1024,512);
  const rand=random(87122);for(let i=0;i<6500;i++){g.fillStyle=i%2?'#fff5da13':'#8f6c340b';g.fillRect(rand()*1024,rand()*512,1+rand()*6,.7);}
  // Fine circular ribs, with a few darker vertical support strips.
  for(let y=9;y<512;y+=10){g.fillStyle='#94713e60';g.fillRect(0,y,1024,1.4);}
  for(let x=0;x<1024;x+=170){g.fillStyle='#a7865650';g.fillRect(x,0,6,512);}
  g.fillStyle='#665b3d';
  for(const [x,y,s] of [[170,265,1],[480,300,.8],[755,225,.9]]){
   g.save();g.translate(x,y);g.scale(s,s);g.beginPath();g.moveTo(-32,3);g.quadraticCurveTo(-7,-3,10,-2);g.quadraticCurveTo(4,-21,15,-34);g.lineTo(23,-30);g.lineTo(19,-23);g.quadraticCurveTo(39,-16,27,0);g.quadraticCurveTo(10,11,-12,9);g.lineTo(-38,18);g.lineTo(-25,4);g.fill();g.restore();
  }
  lanternTexture=new T.CanvasTexture(c);lanternTexture.colorSpace=T.SRGBColorSpace;
 }
 const lanternPaper=new T.MeshStandardMaterial({color:0xf4d7a1,map:lanternTexture,emissive:0xffce83,emissiveMap:lanternTexture,emissiveIntensity:.55,roughness:1,side:T.DoubleSide});
 const globe=new T.Mesh(new T.SphereGeometry(.32,48,32),lanternPaper);globe.scale.y=.92;paperLantern.add(globe);
 const lanternWire=new T.MeshStandardMaterial({color:0x7c725c,roughness:.88});
 for(const y of [-.29,.29]){const rim=new T.Mesh(new T.TorusGeometry(.082,.006,5,24),lanternWire);rim.rotation.x=Math.PI/2;rim.position.y=y;paperLantern.add(rim);}
 const cord=new T.Mesh(new T.CylinderGeometry(.006,.006,.10,6),lanternWire);cord.position.y=.34;paperLantern.add(cord);
 const cafeLight=new T.PointLight(0xffd4a0,.8,7.5,2);cafeLight.position.copy(paperLantern.position);hut.add(cafeLight);
 const deskLamp=new T.Group();deskLamp.name='yellow table lamp';deskLamp.position.set(1.42,1.1,-.13);hut.add(deskLamp);
 cylinder(deskLamp,.11,.026,0,.02,0,brassMat);cylinder(deskLamp,.015,.31,0,.17,0,brassMat);
 const yellowShade=new T.Mesh(new T.CylinderGeometry(.075,.15,.15,18,1,true),new T.MeshStandardMaterial({color:0xffd36a,emissive:0xffb640,emissiveIntensity:.48,side:T.DoubleSide}));
 yellowShade.position.y=.36;deskLamp.add(yellowShade);
 const deskLight=new T.PointLight(0xffcd72,1.5,3,2);deskLight.position.y=.29;deskLamp.add(deskLight);
 // The café projector throws a blank field through the front window onto an outdoor sheet.
 const cinema=new T.Group();cinema.name='outdoor cloth cinema';
 const screenX=-.45,screenZ=-35.9;
 cinema.position.set(screenX,heightAt(screenX,screenZ),screenZ);root.add(cinema);
 const clothGeometry=new T.PlaneGeometry(3.7,2.12,28,16);
 const clothRest=clothGeometry.attributes.position.array.slice();
 const clothMaterial=new T.MeshStandardMaterial({
  color:0xe7dfc9,emissive:0xd1dded,emissiveIntensity:.36,roughness:1,side:T.DoubleSide
 });
 clothMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec2 clothUV;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nclothUV=uv;');
  shader.fragmentShader='varying vec2 clothUV;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   vec2 edge=abs(clothUV-.5);
   float screen=(1.-smoothstep(.405,.432,edge.x))*(1.-smoothstep(.37,.40,edge.y));
   float weave=sin(clothUV.x*700.)*sin(clothUV.y*440.);
   diffuseColor.rgb*=.96+.035*weave;
   totalEmissiveRadiance*=.20+.80*screen;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   #if defined(USE_MAP) && defined(USE_EMISSIVEMAP)
    vec3 imageColor=diffuseColor.rgb;
    outgoingLight=mix(outgoingLight,imageColor*.96+vec3(.004,.0025,.0015),screen*.94);
   #endif
   #include <opaque_fragment>
  `);
 };
 const screenRoll=new T.Group();screenRoll.position.y=2.69;cinema.add(screenRoll);
 const movieScreen=new T.Mesh(clothGeometry,clothMaterial);
 movieScreen.name='old white projection cloth';movieScreen.position.y=-1.06;
 // Face the audience on the café side so the projection reads left to right.
 movieScreen.rotation.y=Math.PI;screenRoll.add(movieScreen);
 const cinemaSeats=[];
 const outdoorSeating=new T.Group();outdoorSeating.name='camp chairs by the fire';
 outdoorSeating.position.copy(cinema.position);root.add(outdoorSeating);
 const chairFrame=new T.MeshStandardMaterial({color:0x635e56,metalness:.25,roughness:.65});
 function chairPole(group,a,b,r=.022){
  const from=new T.Vector3(...a),to=new T.Vector3(...b);
  const pole=new T.Mesh(new T.CylinderGeometry(r,r,from.distanceTo(to),8),chairFrame);
  pole.position.copy(from.clone().add(to).multiplyScalar(.5));pole.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),to.sub(from).normalize());group.add(pole);
 }
 for(const [index,offset,color] of [[0,-1.05,0x9c7865],[1,1.05,0x728278]]){
  const chair=new T.Group();chair.name=index?'sage camp chair':'clay camp chair';
  const x=screenX+offset,z=-40.05,groundY=heightAt(x,z);
  chair.position.set(offset,groundY-cinema.position.y,z-screenZ);chair.rotation.y=-Math.atan2(offset,screenZ-z)*.35;outdoorSeating.add(chair);
  const canvasMat=new T.MeshStandardMaterial({color,roughness:.92,side:T.DoubleSide});
  const seatG=new T.PlaneGeometry(.62,.56,12,12),seatP=seatG.attributes.position;
  for(let i=0;i<seatP.count;i++){const x=seatP.getX(i),z=seatP.getY(i);seatP.setXYZ(i,x,.48-.045*(1-(x/.32)**2)*(1-(z/.29)**2),z);}
  seatG.computeVertexNormals();const seat=new T.Mesh(seatG,canvasMat);seat.name='sling canvas seat';chair.add(seat);
  const backG=new T.PlaneGeometry(.62,.53,12,12),backP=backG.attributes.position;
  for(let i=0;i<backP.count;i++){const x=backP.getX(i),v=backP.getY(i)+.265;backP.setXYZ(i,x,.48+v,-.26-v*.22+.035*(1-(x/.32)**2));}
  backG.computeVertexNormals();const back=new T.Mesh(backG,canvasMat);back.name='canvas chair back';chair.add(back);
  for(const side of [-1,1]){
   chairPole(chair,[side*.34,.025,.30],[side*.34,.71,-.26]);
   chairPole(chair,[side*.34,.025,-.31],[side*.34,.69,.29]);
   chairPole(chair,[side*.34,.48,-.28],[side*.34,1.03,-.39]);
   chairPole(chair,[side*.35,.70,-.29],[side*.35,.70,.26],.027);
  }
  chairPole(chair,[-.34,.17,.26],[.34,.45,.26],.017);chairPole(chair,[.34,.17,.26],[-.34,.45,.26],.017);
  cinemaSeats.push(new T.Vector3(x,groundY+1.12,z-.045));
 }

 for(const x of [-2,2]){
  const pole=box(cinema,.095,2.83,.1,x,1.42,.08,timber);
  pole.rotation.z=x<0?.035:-.035;
 }
 const rope=new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(
  new T.Vector3(-2,2.79,.02),new T.Vector3(0,2.63,.02),new T.Vector3(2,2.79,.02)
 ),20,.018,5),coffeeMat);
 cinema.add(rope);
 for(const x of [-1.53,-.58,.45,1.46])box(cinema,.065,.13,.049,x,2.7,.012,timber);
 const couchLantern=new T.PointLight(0xe9b182,3.3,5.8,2);
 couchLantern.name='soft cinema seating light';couchLantern.position.set(.16,1.40,-3.3);cinema.add(couchLantern);
 const projector=new T.Group();projector.name='projector inside cafe';
 projector.position.set(1.05,1.1,1.02);hut.add(projector);
 box(projector,.64,.08,.48,0,-.06,0,timber);
 for(const x of [-.27,.27])box(projector,.055,.96,.07,x,-.54,.05,timber);
 box(projector,.39,.15,.27,0,.07,0,metal);
 const projectorLid=box(projector,.4,.03,.29,0,.157,0,metal);
 const lens=new T.Mesh(new T.CylinderGeometry(.056,.058,.043,18),new T.MeshBasicMaterial({color:0xf2e5bf}));
 lens.rotation.x=Math.PI/2;lens.position.set(0,.083,.15);projector.add(lens);

 const lensPosition=new T.Vector3(hut.position.x+1.05, hut.position.y+1.183,hut.position.z+1.17).sub(cinema.position);
 const projectorBeamGeometry=new T.BufferGeometry();
 projectorBeamGeometry.setAttribute('position',new T.Float32BufferAttribute([
  ...lensPosition.toArray(),-1.60,.83,-.025,1.60,.83,-.025,1.60,2.46,-.025,-1.60,2.46,-.025
 ],3));
 projectorBeamGeometry.setIndex([0,1,2,0,2,3,0,3,4,0,4,1]);
 const projectorBeam=new T.Mesh(projectorBeamGeometry,new T.MeshBasicMaterial({
  color:0xd4dff3,side:T.DoubleSide,transparent:true,opacity:.029,depthWrite:false
 }));
 projectorBeam.visible=false;cinema.add(projectorBeam);
 let cinemaOpen=false,cinemaProgress=0;
 function setCinemaOpen(open){cinemaOpen=open;}
 cinema.visible=false;projector.visible=false;
 // A small outdoor hearth gives the laptop nook warm light after dark.
 const hearth=new T.Group();hearth.name='bonfire between camp chairs';hearth.position.set(screenX,heightAt(screenX,-38.05)+.08,-38.05);root.add(hearth);colliders.push({x:screenX,z:-38.05,r:.62});
 const stoneMat=new T.MeshLambertMaterial({map:textures.stone||textures.leaf,color:0xb4b6ca});for(let i=0;i<9;i++){const rock=new T.Mesh(clusterG,stoneMat);rock.position.set(Math.cos(i*6.283/9)*.48,.06,Math.sin(i*6.283/9)*.48);rock.scale.set(.17,.12,.15);hearth.add(rock);}
 for(const side of [-1,1]){const log=box(hearth,.65,.13,.13,0,.13,0,timber);log.rotation.y=side*.65;}
 const flames=new T.Group();hearth.add(flames);
 const flameTongues=[],embers=[];
 for(let i=0;i<7;i++){
  const inner=i>=4;
  const profile=Array.from({length:13},(_,step)=>{
   const t=step/12;
   return new T.Vector2(.15*Math.pow(Math.sin(Math.PI*t),.85)*(1-.54*t),t);
  });
  const geometry=new T.LatheGeometry(profile,12);
  const vertices=geometry.attributes.position;
  for(let v=0;v<vertices.count;v++){
   const t=vertices.getY(v);
   vertices.setX(v,vertices.getX(v)+.16*t*t-.06*Math.sin(t*Math.PI));
  }
  geometry.computeVertexNormals();
  const flame=new T.Mesh(geometry,new T.MeshBasicMaterial({color:inner?0xffe3a0:i%2?0xf08a42:0xffb455,transparent:true,opacity:inner?.92:.86,depthWrite:false,toneMapped:false}));
  const angle=i*2.4;
  flame.position.set(Math.cos(angle)*(inner?.08:.16),.14,Math.sin(angle)*(inner?.08:.16));
  flame.rotation.y=angle;flame.renderOrder=inner?3:2;flames.add(flame);
  flameTongues.push({mesh:flame,height:inner?.38+i*.016:.67+i*.055,phase:angle});
 }
 const emberGeometry=new T.SphereGeometry(.021,6,4);
 const emberMaterial=new T.MeshBasicMaterial({color:0xffb967,toneMapped:false});
 for(let i=0;i<18;i++){const ember=new T.Mesh(emberGeometry,emberMaterial);flames.add(ember);embers.push({mesh:ember,phase:i/18});}
 const fireLight=new T.PointLight(0xffb16a,0,9,2);fireLight.position.copy(hearth.position).add(new T.Vector3(0,.75,0));root.add(fireLight);
 const laptopLight=new T.PointLight(0xabcddd,.12,2,2);laptopLight.position.set(1,1.4,.15);hut.add(laptopLight);
 // The visible upper cascade follows the gully down to the lip.
 const sourceP=[],sourceUV=[],sourceI=[];
 for(let i=0;i<=28;i++){const u=i/28,z=fallZ-u*6,y=fallHeight+u*7.2,x=fallX+Math.sin(u*3)*.25,w=1.02-u*.35;sourceP.push(x-w,y,z,x+w,y,z);sourceUV.push(0,u*4,1,u*4);if(i<28){const j=i*2;sourceI.push(j,j+1,j+2,j+1,j+3,j+2);}}
 const sourceG=new T.BufferGeometry();sourceG.setAttribute('position',new T.Float32BufferAttribute(sourceP,3));sourceG.setAttribute('uv',new T.Float32BufferAttribute(sourceUV,2));sourceG.setIndex(sourceI);sourceG.computeVertexNormals();
 const fallingWater=new T.MeshLambertMaterial({color:0xd2e4e1,emissive:0x405b79,emissiveIntensity:.12,transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false});
 fallingWater.onBeforeCompile=shader=>{shader.uniforms.flowTime=wind;shader.vertexShader='varying vec2 flowUV;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nflowUV=uv;');shader.fragmentShader='uniform float flowTime;varying vec2 flowUV;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat streak=.5+.5*sin(flowUV.x*42.+sin(flowUV.y*24.+flowTime*3.));float pigment=fract(sin(dot(floor(flowUV*vec2(100.,300.)),vec2(127.1,311.7)))*43758.5453);diffuseColor.rgb*=.78+.16*streak+.12*pigment;diffuseColor.a*=.55+.45*streak;');};
 const sourceWater=new T.Mesh(sourceG,fallingWater);sourceWater.name='mountain-source-channel';waterfall.add(sourceWater);
 // Soft overlapping mist veils the cliff lip and the channel above it.
 let veilTexture=textures.fringe;
 if(typeof document!=='undefined'){
  const cloud=document.createElement('canvas');cloud.width=cloud.height=128;
  const ctx=cloud.getContext('2d'),fade=ctx.createRadialGradient(64,64,10,64,64,63);
  fade.addColorStop(0,'rgba(255,255,255,.95)');fade.addColorStop(.50,'rgba(255,255,255,.60)');
  fade.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,128,128);
  veilTexture=new T.CanvasTexture(cloud);
 }
 for(let i=0;i<8;i++){
  const veil=new T.Sprite(new T.SpriteMaterial({map:veilTexture,color:0xc7c6d6,transparent:true,opacity:.49,depthWrite:false}));
  veil.position.set(fallX+(i-3.5)*1.22,fallHeight+Math.sin(i*1.4)*.65+.4,fallZ+1+i%2*.7);
  veil.scale.set(5.8+i%3,2.5+i%2*.7,1);waterfall.add(veil);
 }

 const fallStrips=[];
 for(let i=0;i<13;i++){const g=new T.PlaneGeometry(.12+rng()*.19,fallHeight,1,32),p=g.attributes.position;for(let v=0;v<p.count;v++){const y=p.getY(v),u=(y+fallHeight/2)/fallHeight;p.setXYZ(v,p.getX(v)+Math.sin(u*4+i)*.045,y-(u>.9?(i%3)*.08:0),.15*Math.sin(u*Math.PI)+.24*(1-u)**4);}g.computeVertexNormals();const strip=new T.Mesh(g,fallingWater);strip.position.set(fallX-1.05+i*.17,fallHeight/2-.08,fallZ+.2+rng()*.15);strip.rotation.y=(rng()-.5)*.2;waterfall.add(strip);fallStrips.push(strip);}
 // Physical flow marks remain legible from the fixed viewing position.
 const waterMotion=new T.Group();root.add(waterMotion);
 const droplets=[],currents=[],ripples=[];
 const chalkWater=new T.MeshLambertMaterial({color:0xe9ead7,emissive:0x8197ad,emissiveIntensity:.12,transparent:true,opacity:.8});
 for(let i=0;i<75;i++){
  const drop=new T.Mesh(new T.SphereGeometry(1,5,4),chalkWater);
  drop.scale.set(.014+rng()*.018,.10+rng()*.19,.018);
  const x=fallX-1+rng()*2,z=fallZ+.45+rng()*.12,phase=rng();
  drop.position.set(x,phase*(fallHeight-.1),z);waterMotion.add(drop);droplets.push({mesh:drop,x,z,phase});
 }
 for(let i=0;i<116;i++){
  const mark=new T.Mesh(new T.SphereGeometry(1,6,4),chalkWater);
  mark.scale.set(.018+rng()*.04,.009,.12+rng()*.30);
  waterMotion.add(mark);currents.push({mesh:mark,lane:(rng()-.5)*2.7,phase:rng()});
 }
 for(let i=0;i<5;i++){
  const mat=chalkWater.clone(),ring=new T.Mesh(new T.RingGeometry(.91,1,48),mat);ring.rotation.x=-Math.PI/2;ring.position.set(fallX,-.045,fallZ+.9);waterMotion.add(ring);ripples.push({mesh:ring,phase:i/5});
 }
 const pool=new T.Mesh(new T.CircleGeometry(pondRadius,96),waterMat.clone());
 pool.name='round waterfall pond';pool.rotation.x=-Math.PI/2;pool.position.set(pondX,-.067,pondZ);root.add(pool);
 for(let i=0;i<27;i++){
  const angle=i*Math.PI*2/27;
  // Keep the downstream mouth open where the stream joins the basin.
  if(Math.sin(angle)>.68)continue;
  const rock=new T.Mesh(stoneG,rockMat);
  rock.position.set(pondX+Math.cos(angle)*pondRadius,.025,pondZ+Math.sin(angle)*pondRadius);
  rock.scale.set(.38+rng()*.38,.16+rng()*.3,.32+rng()*.3);rock.rotation.y=angle;root.add(rock);
 }
 const foamMaterial=new T.MeshLambertMaterial({color:0xe6ead7,transparent:true,opacity:.8,depthWrite:false});
 const foam=[];for(let i=0;i<26;i++){const stone=new T.Mesh(new T.SphereGeometry(1,8,5),foamMaterial);stone.position.set(fallX+(rng()-.5)*2.6,-.025,fallZ+1+rng()*2.4);stone.scale.set(.08+rng()*.16,.015,.1+rng()*.25);waterfall.add(stone);foam.push({mesh:stone,x:stone.position.x,z:stone.position.z,phase:rng()*6});}
 const mistMaterial=new T.MeshLambertMaterial({map:textures.fringe,color:0xc6d7e1,transparent:true,opacity:.17,depthWrite:false,side:T.DoubleSide});
 const mist=[];for(let i=0;i<9;i++){const puff=new T.Mesh(new T.PlaneGeometry(1.8,1.2),mistMaterial);puff.position.set(fallX+(rng()-.5)*3,.35+rng()*.7,fallZ+1+rng()*1.5);waterfall.add(puff);mist.push({mesh:puff,y:puff.position.y,phase:rng()*6});}
 // Low distant hills retain a layered painted silhouette rather than a flat backdrop.
 const hillMat=new T.MeshLambertMaterial({map:textures.leaf,color:0xb6b4c3});for(let i=0;i<10;i++){const m=new T.Mesh(clusterG,hillMat);m.scale.set(14+rng()*12,5+rng()*5,9+rng()*10);m.position.set(-65+i*15,1,-78-rng()*15);root.add(m);}
 for(let i=0;i<42;i++){const bug=createFirefly(T),z=i<4?17-i*.7:20-rng()*72,x=i<4?[-.8,1.2,-1.6,.6][i]:pathAt(z)+(rng()<.5?-1:1)*(1.2+rng()*6),y=heightAt(x,z)+.7+rng()*1.4;bug.group.position.set(x,y,z);bug.group.scale.setScalar(i<4?1.05:.65+rng()*.5);scene.add(bug.group);flies.push({...bug,origin:new T.Vector3(x,y,z),phase:rng()*6,speed:.25+rng()*.25});}
 // One rooted climber follows the front-left post to the left roof edge.
 const climbers=new T.Group();climbers.name='seasonal cafe climbers';hut.add(climbers);
 const vineMat=new T.MeshLambertMaterial({color:0x696b4d}),vineLeafMat=new T.MeshLambertMaterial({color:0x79916b,side:T.DoubleSide});
 const vineRandom=random(24713),vinePaths=[];
 const vineX=westWall-.035,vineZ=frontWall+.13;
 function vineStem(points,radius){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  const stem=new T.Mesh(new T.TubeGeometry(curve,30,radius,5,false),vineMat);stem.name='left climber stem';climbers.add(stem);return curve;
 }
 const mainPoints=Array.from({length:10},(_,j)=>{const t=j/9;return[vineX+Math.sin(t*13)*.075,.08+t*(eaves+.02),vineZ+Math.sin(t*17)*.045];});
 const mainVine=vineStem(mainPoints,.015);vinePaths.push(mainVine);
 vineStem(mainPoints.map(([x,y,z],j)=>[x+Math.sin(j*1.9)*.045,y,z+.035*Math.cos(j*1.9)]),.008);
 // Short irregular side shoots create fuller pockets with visible gaps between them.
 for(let i=0;i<11;i++){
  const t=.12+i*.073,start=mainVine.getPointAt(t),side=i%3===0?-1:1,reach=.19+vineRandom()*.30;
  const end=[start.x+side*reach,start.y+.13+vineRandom()*.23,start.z+.07+vineRandom()*.10];
  vinePaths.push(vineStem([start.toArray(),[start.x+side*reach*.5,start.y+.19,start.z+.08],end],.006));
  if(i%3===1)vinePaths.push(vineStem([end,[end[0]+.10,end[1]-.14,end[2]+.035],[end[0]+.075,end[1]-.36,end[2]+.05]],.004));
 }
 // A short runner reaches the actual eaves, without crossing the bedroom window.
 vinePaths.push(vineStem([mainPoints[9],[vineX+.22,eaves+.035,vineZ+.01],[vineX+.69,eaves+.23,vineZ+.025],[vineX+.91,eaves+.33,vineZ]],.009));
 vinePaths.push(vineStem([[vineX+.52,eaves+.14,vineZ],[vineX+.65,eaves-.09,vineZ+.12],[vineX+.61,eaves-.37,vineZ+.13]],.005));
 const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.041,.035,-.056,.094,0,.145);leafShape.bezierCurveTo(.056,.094,.041,.035,0,0);
 const vineLeaves=new T.InstancedMesh(new T.ShapeGeometry(leafShape,5),vineLeafMat,520);vineLeaves.name='climber leaves';climbers.add(vineLeaves);
 const bloomCenters=[];
 for(let i=0;i<520;i++){
  const curve=vinePaths[i%vinePaths.length],point=curve.getPointAt(vineRandom()),angle=vineRandom()*Math.PI*2;
  const spread=i%vinePaths.length===0?.065:.09;
  dummy.position.copy(point).add(new T.Vector3(Math.cos(angle)*spread,Math.sin(angle)*spread*.7,.035+vineRandom()*.08));
  dummy.rotation.set((vineRandom()-.5)*1.3,(vineRandom()-.5)*.8,(vineRandom()-.5)*5.4);dummy.scale.setScalar(.65+vineRandom()*.55);dummy.updateMatrix();vineLeaves.setMatrixAt(i,dummy.matrix);
  vineLeaves.setColorAt(i,new T.Color([0xa1b185,0x819a70,0xb0bb91,0x6f8969][i%4]));
  if(i<78&&point.y>.5)bloomCenters.push(point.clone().add(new T.Vector3((vineRandom()-.5)*.16,0,.12)));
 }
 const vineBlossoms=new T.Group();vineBlossoms.name='April climber blossoms';climbers.add(vineBlossoms);
 const petalGeometry=new T.SphereGeometry(1,6,4),vineCreamMaterial=new T.MeshLambertMaterial({color:0xf1eed8});
 const blossomPetals=new T.InstancedMesh(petalGeometry,vineCreamMaterial,bloomCenters.length*22*4);blossomPetals.name='tiny cream flower clusters';vineBlossoms.add(blossomPetals);
 let petalIndex=0;
 for(const center of bloomCenters){
  const clusterSize=.09+vineRandom()*.08;
  for(let j=0;j<22;j++){
   const angle=j*2.399,r=clusterSize*Math.sqrt((j+.5)/22),floret=center.clone().add(new T.Vector3(Math.cos(angle)*r,Math.sin(angle)*r*.8,(vineRandom()-.5)*.10));
   for(let k=0;k<4;k++){
    const a=k*Math.PI/2;
    dummy.position.copy(floret).add(new T.Vector3(Math.cos(a)*.011,Math.sin(a)*.011,.004));dummy.rotation.set(0,0,a);dummy.scale.set(.012,.008,.005);dummy.updateMatrix();blossomPetals.setMatrixAt(petalIndex++,dummy.matrix);
   }
  }
 }
 const vineBuds=new T.InstancedMesh(petalGeometry,new T.MeshLambertMaterial({color:0xb8b89b}),bloomCenters.length);vineBuds.name='March climber buds';climbers.add(vineBuds);
 bloomCenters.forEach((center,i)=>{dummy.position.copy(center);dummy.rotation.set(0,0,i*.7);dummy.scale.set(.012,.018,.012);dummy.updateMatrix();vineBuds.setMatrixAt(i,dummy.matrix);});
 // Matching cream flowers cover the roof and form low patches at tree bases and in grass.
 const flowerRoof=new T.Group();flowerRoof.name='flower covered roof';hut.add(flowerRoof);
 const meadowFlowers=new T.Group();meadowFlowers.name='cream meadow flower patches';root.add(meadowFlowers);
 const flowerRandom=random(98316),roofSites=[],meadowSites=[];
 for(let i=0;i<680;i++){
  const x=roofCenter+(flowerRandom()-.5)*roofRun*2.02,z=(frontWall+backWall)/2+(flowerRandom()-.5)*roofDepth;
  roofSites.push({x,y:roofRidge-Math.abs(x-roofCenter)*roofRise/roofRun+.14,z,roof:true});
 }
 const flowerClear=(x,z)=>Math.abs(x-pathAt(z))>1.40&&!nearCafe(x,z,.40)&&!nearCinema(x,z)&&pondDistance(x,z)>pondRadius+.45&&!(z<=streamEndZ&&Math.abs(x-riverAt(z))<2.35)&&colliders.every(c=>Math.hypot(x-c.x,z-c.z)>c.r+.12);
 for(const tr of treeLocations)for(let i=0;i<7;i++){
  const a=flowerRandom()*Math.PI*2,r=.65+flowerRandom()*.85,x=tr.x+Math.cos(a)*r,z=tr.z+Math.sin(a)*r;
  if(flowerClear(x,z))meadowSites.push({x,y:heightAt(x,z)+.28+flowerRandom()*.17,z});
 }
 for(let i=0;i<320;i++){
  const z=23-flowerRandom()*73,x=pathAt(z)+(i%2?-1:1)*(1.65+flowerRandom()*4.8);
  if(flowerClear(x,z))meadowSites.push({x,y:heightAt(x,z)+.34+flowerRandom()*.18,z});
 }
 // One floret mesh contains four petals; instances keep the expanded planting efficient.
 const floretPositions=[];
 for(let petal=0;petal<4;petal++){
  const a=petal*Math.PI/2,cx=Math.cos(a)*.011,cy=Math.sin(a)*.011;
  for(let k=0;k<6;k++){
   const p=k*Math.PI/3,q=(k+1)*Math.PI/3;
   floretPositions.push(cx,cy,.002,cx+Math.cos(p)*.012,cy+Math.sin(p)*.008,0,cx+Math.cos(q)*.012,cy+Math.sin(q)*.008,0);
  }
 }
 const floretGeometry=new T.BufferGeometry();floretGeometry.setAttribute('position',new T.Float32BufferAttribute(floretPositions,3));floretGeometry.computeVertexNormals();
 const patchFlowerMaterial=new T.MeshLambertMaterial({color:0xf1eed8,side:T.DoubleSide});
 const roofFlowerHeads=[],groundFlowerHeads=[];
 function populateCreamPatches(parent,sites,headList){
  const heads=new T.InstancedMesh(floretGeometry,patchFlowerMaterial,sites.length*14);heads.name='seasonal cream flower heads';parent.add(heads);headList.push(heads);
  const leaves=new T.InstancedMesh(new T.ShapeGeometry(leafShape,5),vineLeafMat,sites.length*4);leaves.name='flower patch foliage';parent.add(leaves);
  const stems=new T.InstancedMesh(new T.CylinderGeometry(.003,.004,1,4),vineMat,sites.length);stems.name='flower patch stems';parent.add(stems);
  sites.forEach((site,i)=>{
   for(let j=0;j<14;j++){
    const a=j*2.399,r=.15*Math.sqrt((j+.5)/14),x=site.x+Math.cos(a)*r,z=site.z+Math.sin(a)*r;
    dummy.position.set(x,site.y+(site.roof?-(x-site.x)*Math.sign(site.x-roofCenter)*roofRise/roofRun:.03*Math.sin(a)),z);
    dummy.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(site.roof?Math.sign(site.x-roofCenter)*roofRise/roofRun:.18,1,.18).normalize());dummy.rotateZ(a);dummy.scale.setScalar(.85+flowerRandom()*.4);dummy.updateMatrix();heads.setMatrixAt(i*14+j,dummy.matrix);
   }
   for(let j=0;j<4;j++){
    const a=j*Math.PI/2+i;dummy.position.set(site.x+Math.cos(a)*.10,site.y-.05,site.z+Math.sin(a)*.10);dummy.rotation.set(-.75,0,a);dummy.scale.setScalar(.8+flowerRandom()*.6);dummy.updateMatrix();leaves.setMatrixAt(i*4+j,dummy.matrix);
   }
   const base=site.roof?site.y-.075:heightAt(site.x,site.z),h=site.y-base;
   dummy.position.set(site.x,base+h/2,site.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);
  });
 }
 populateCreamPatches(flowerRoof,roofSites,roofFlowerHeads);populateCreamPatches(meadowFlowers,meadowSites,groundFlowerHeads);
 function updateClimbers(){
  const lush=season==='monsoon'||rainTarget>0;
  flowerRoof.visible=meadowFlowers.visible=!snowing;
  for(const heads of [...roofFlowerHeads,...groundFlowerHeads])heads.visible=month===4&&!snowing;
  climbers.visible=!snowing;vineLeaves.count=lush?520:season==='autumn'?210:330;
  vineLeafMat.color.set(lush?0x8fa77c:0xa8b694);vineBlossoms.visible=month===4&&!snowing;vineBuds.visible=month===3&&!snowing;
 }
 root.traverse(o=>{if(o.isMesh){o.castShadow=o!==ground&&o!==water&&o!==grass;o.receiveShadow=true;}});
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-14;key.shadow.camera.right=14;key.shadow.camera.top=26;key.shadow.camera.bottom=-14;key.shadow.camera.near=.5;key.shadow.camera.far=85;key.shadow.normalBias=.035;key.position.set(-8,26,-40);key.target.position.set(5,8,-56);scene.add(key.target);
 const settledSnow=new T.Group();settledSnow.name='settled winter snow';settledSnow.visible=false;root.add(settledSnow);
 const snowCapMaterial=new T.MeshLambertMaterial({color:0xf1f0f0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 snowCapMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 snowNormal; varying vec3 snowPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 capNormal=normal;
   #ifdef USE_INSTANCING
    capNormal=mat3(instanceMatrix)*capNormal;
   #endif
   snowNormal=normalize(mat3(modelMatrix)*capNormal);
   transformed+=normal*.035;
   vec4 capPosition=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    capPosition=instanceMatrix*capPosition;
   #endif
   snowPosition=(modelMatrix*capPosition).xyz;
  `);
  shader.fragmentShader='varying vec3 snowNormal; varying vec3 snowPosition;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float surfaceVariation=sin(snowPosition.x*3.+sin(snowPosition.z*2.))*cos(snowPosition.z*3.1);
   if(snowNormal.y<.43+surfaceVariation*.16)discard;
   diffuseColor.rgb*=mix(vec3(.78,.83,.94),vec3(1.,.98,.94),smoothstep(.4,.97,snowNormal.y));
  `);
 };
 root.updateMatrixWorld(true);
 const snowReceivers=[];
 root.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh)return;
  const branchReceiver=barkVariants.includes(o.material)&&o.name!=='curved tapered trunk';
  if(o.geometry===stoneG||o.name==='cafe roof snow receiver'||branchReceiver)snowReceivers.push(o);
 });
 for(const source of snowReceivers){
  const cap=new T.Mesh(source.geometry,snowCapMaterial);cap.matrix.copy(source.matrixWorld);cap.matrixAutoUpdate=false;cap.receiveShadow=true;settledSnow.add(cap);
 }
 // Window ledges collect shallow rounded deposits on their outside faces.
 hut.updateMatrixWorld(true);
 hut.traverse(o=>{
  if(!o.userData.snowLedge||o.parent===cafeDoor)return;
  const {width,height}=o.userData.snowLedge;
  const deposit=new T.Mesh(new T.SphereGeometry(1,12,7),new T.MeshLambertMaterial({color:0xeeeaf0}));
  deposit.position.set(0,-height/2+.06,.10);deposit.scale.set(width*.48,.045,.12);deposit.updateMatrix();
  deposit.matrix.premultiply(o.matrixWorld);deposit.matrixAutoUpdate=false;deposit.name='window ledge snow';settledSnow.add(deposit);
 });
 const crownSnow=new T.InstancedMesh(clusterG,snowCapMaterial,canopy.count);crownSnow.name='uneven crown snow caps';
 crownSnow.instanceMatrix.array.set(canopyBase.subarray(0,canopy.count*16));crownSnow.receiveShadow=true;settledSnow.add(crownSnow);
 // Thin ice shelves follow the banks without covering the moving center channel.
 const iceMaterial=new T.MeshStandardMaterial({color:0xbccddc,roughness:.48,transparent:true,opacity:.83});
 const shelfRandom=random(9132);
 for(let i=0;i<130;i++){
  const z=24-i*.59,side=i%2?-1:1,x=riverAt(z)+side*(1.58+shelfRandom()*.18);
  const shelf=new T.Mesh(new T.SphereGeometry(1,10,6),iceMaterial);shelf.name='bank ice shelf';
  shelf.position.set(x,-.035,z);shelf.scale.set(.20+shelfRandom()*.24,.025,.30+shelfRandom()*.30);settledSnow.add(shelf);
 }
 for(let i=0;i<48;i++){
  const angle=i*Math.PI*2/48;
  if(Math.sin(angle)>.68)continue;
  const shelf=new T.Mesh(new T.SphereGeometry(1,10,6),iceMaterial);
  shelf.position.set(pondX+Math.cos(angle)*(pondRadius-.12),-.035,pondZ+Math.sin(angle)*(pondRadius-.12));
  shelf.scale.set(.48,.025,.22);shelf.rotation.y=-angle+Math.PI/2;settledSnow.add(shelf);
 }
 // Snow rests on the backs and arms of the outdoor couches.
 for(const couch of cinemaSeats.length?root.children.filter(o=>o.name==='camp chairs by the fire'):[]){
  couch.traverse(o=>{
   if(!o.isMesh||o.geometry.type!=='BoxGeometry')return;
   const cap=new T.Mesh(o.geometry,snowCapMaterial);cap.matrix.copy(o.matrixWorld);cap.matrixAutoUpdate=false;settledSnow.add(cap);
  });
 }
 // Shallow, alternating boot impressions remain part of the compressed path.
 const tracks=new T.InstancedMesh(new T.CircleGeometry(1,12),new T.MeshLambertMaterial({color:0xa9a8b3,transparent:true,opacity:.28,depthWrite:false}),130);
 for(let i=0;i<130;i++){
  const z=22-i*.56,x=pathAt(z)+(i%2?-.16:.16)+.06*Math.sin(z*.7);
  dummy.position.set(x,heightAt(x,z)+.039,z);dummy.rotation.set(-Math.PI/2,0,.12*Math.sin(z));dummy.scale.set(.065,.14,1);dummy.updateMatrix();tracks.setMatrixAt(i,dummy.matrix);
 }tracks.name='soft winter footprints';settledSnow.add(tracks);
 // Warm window light reaches the snow immediately outside the café.
 const snowWindowLight=new T.PointLight(0xffbc78,1.5,7,2);snowWindowLight.position.set(hut.position.x-1.8,1.6,hut.position.z+2.1);settledSnow.add(snowWindowLight);
 // Wetness outlasts falling rain; shared uniforms keep all surfaces in sync.
 const dampMaterials=[ground.material,path.material,grassMat,rockMat,...barkVariants,leafMat,timber,roofMat,vineLeafMat];
 for(const material of dampMaterials){
  const previous=material.onBeforeCompile.bind(material),cacheKey=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
   previous(shader);shader.uniforms.weatherWetness=wetness;
   shader.vertexShader='varying vec3 dampPosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndampPosition=position;');
   shader.fragmentShader='uniform float weatherWetness; varying vec3 dampPosition;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float runoff=.5+.5*sin(dampPosition.x*34.+sin(dampPosition.y*1.6)*.18+dampPosition.z*12.);
    diffuseColor.rgb*=1.-weatherWetness*(.16+.055*runoff);
   `);
   if(material.isMeshStandardMaterial)shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.37,weatherWetness*.78);');
  };
  material.customProgramCacheKey=()=>cacheKey+'-rain-surface-v1';
 }
 // Low-amplitude canopy movement, disabled in Still scene through a separate uniform.
 const canopyBreeze={value:0};
 for(const material of [leafMat,vineLeafMat]){
  const previous=material.onBeforeCompile.bind(material),cacheKey=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
   previous(shader);shader.uniforms.canopyBreeze=canopyBreeze;
   shader.vertexShader='uniform float canopyBreeze;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(position.y*2.+canopyBreeze)*.018;');
  };material.customProgramCacheKey=()=>cacheKey+'-gentle-canopy';
 }
 const rainDetails=new T.Group();rainDetails.name='rain puddles and ripples';root.add(rainDetails);
 const puddleRandom=random(71791),puddles=[],ringLocations=[];
 const puddleMaterial=new T.MeshPhysicalMaterial({color:0x83939f,roughness:.16,metalness:.05,clearcoat:.8,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
 puddleMaterial.onBeforeCompile=shader=>{
  shader.uniforms.puddleSkyLow=skyMaterial.uniforms.low;shader.uniforms.puddleSkyTop=skyMaterial.uniforms.top;
  shader.fragmentShader='uniform vec3 puddleSkyLow,puddleSkyTop;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`vec3 reflectedSky=mix(puddleSkyLow,puddleSkyTop,.40);
   float fresnel=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.);
   outgoingLight=mix(outgoingLight,reflectedSky*.55,.20+.32*fresnel);
   #include <opaque_fragment>`);
 };
 for(let i=0;i<46;i++){
  const z=22-puddleRandom()*74,side=i%2?-1:1,x=pathAt(z)+side*(.48+puddleRandom()*.48);
  if(nearCafe(x,z,.4)||nearCinema(x,z)||pondDistance(x,z)<pondRadius+.4)continue;
  const shape=new T.Shape(),sx=.22+puddleRandom()*.35,sz=.16+puddleRandom()*.30;
  for(let k=0;k<20;k++){const angle=k*Math.PI*2/20,r=.85+puddleRandom()*.25,px=Math.cos(angle)*sx*r,pz=Math.sin(angle)*sz*r;k?shape.lineTo(px,pz):shape.moveTo(px,pz);}shape.closePath();
  const geometry=new T.ShapeGeometry(shape,16);geometry.rotateX(-Math.PI/2);
  const mesh=new T.Mesh(geometry,puddleMaterial);mesh.name='shallow path puddle';mesh.position.set(x,heightAt(x,z)+.043,z);rainDetails.add(mesh);puddles.push(mesh);ringLocations.push([x,mesh.position.y+.004,z]);
 }
 for(let i=0;i<100;i++){
  const z=25-puddleRandom()*78;
  if(i%3===0){const angle=puddleRandom()*Math.PI*2,r=Math.sqrt(puddleRandom())*pondRadius*.86;ringLocations.push([pondX+Math.cos(angle)*r,-.043,pondZ+Math.sin(angle)*r]);}
  else ringLocations.push([riverAt(z)+(puddleRandom()-.5)*2.5,-.043,z]);
 }
 const ringGeometry=new T.RingGeometry(.89,1,24),ringAlpha=new T.InstancedBufferAttribute(new Float32Array(ringLocations.length),1);ringGeometry.setAttribute('ringAlpha',ringAlpha);
 const ringMaterial=new T.MeshBasicMaterial({color:0xb5c6d1,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
 ringMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float ringAlpha;varying float ringOpacity;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nringOpacity=ringAlpha;');
  shader.fragmentShader='varying float ringOpacity;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=ringOpacity;');
 };
 const rainRings=new T.InstancedMesh(ringGeometry,ringMaterial,ringLocations.length);rainRings.name='rain impact rings';rainDetails.add(rainRings);
 const dripPoints=[];
 for(let i=0;i<30;i++)dripPoints.push([hut.position.x+roofCenter+(i%2?-roofRun:roofRun),hut.position.y+eaves-.05,hut.position.z+backWall+puddleRandom()*(frontWall-backWall)]);
 for(let i=0;i<canopy.count;i+=9){const m=new T.Matrix4().fromArray(canopyBase,i*16),v=new T.Vector3().setFromMatrixPosition(m);dripPoints.push([v.x,v.y-.4,v.z]);}
 const rainDrips=new T.InstancedMesh(new T.SphereGeometry(1,5,4),new T.MeshBasicMaterial({color:0xa5bccc,transparent:true,opacity:.38}),dripPoints.length);rainDrips.name='eave and canopy rain drips';rainDetails.add(rainDrips);
 let raining=false;
 function advanceRain(t,dt,quiet){
  const strengthTarget=raining?1:0;
  rainStrength.value+=(strengthTarget-rainStrength.value)*(quiet?1:1-Math.exp(-dt*1.1));
  const wetTarget=raining&&!snowing?1:0;
  wetness.value+=(wetTarget-wetness.value)*(quiet?1:1-Math.exp(-dt*(wetTarget?.32:.024)));
  if(snowing)wetness.value=0;
  rainDetails.visible=!snowing&&(wetness.value>.015||rainStrength.value>.015);
  puddleMaterial.opacity=wetness.value*.72;
  rainRings.visible=rainStrength.value>.02;
  rainDrips.visible=!quiet&&rainStrength.value>.08;
  canopyBreeze.value=quiet?0:t*.65;
  for(let i=0;i<ringLocations.length;i++){
   const [x,y,z]=ringLocations[i],life=quiet?.42:(t*.58+i*.618)%1,radius=.025+life*(i<puddles.length?.24:.37);
   dummy.position.set(x,y,z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.set(radius,radius*.86,1);dummy.updateMatrix();rainRings.setMatrixAt(i,dummy.matrix);ringAlpha.setX(i,(1-life)*Math.sin(Math.PI*life)*rainStrength.value*(quiet?.20:1));
  }rainRings.instanceMatrix.needsUpdate=true;ringAlpha.needsUpdate=true;
  if(rainDrips.visible)for(let i=0;i<dripPoints.length;i++){
   const [x,y,z]=dripPoints[i],life=(t*.8+i*.713)%1,fall=life*life*(y-heightAt(x,z));
   dummy.position.set(x+life*.025,y-fall,z);dummy.rotation.set(0,0,.04);dummy.scale.set(.009,.025+life*.025,.009);dummy.updateMatrix();rainDrips.setMatrixAt(i,dummy.matrix);
  }rainDrips.instanceMatrix.needsUpdate=true;
 }

 const butterflies=[];
 const butterflyShape=new T.Shape();
 butterflyShape.moveTo(0,0);butterflyShape.bezierCurveTo(.09,.02,.21,.14,.22,.22);
 butterflyShape.bezierCurveTo(.18,.30,.06,.23,.014,.061);
 butterflyShape.bezierCurveTo(.075,.11,.16,.063,.12,-.025);
 butterflyShape.bezierCurveTo(.08,-.07,.025,-.045,0,0);
 const butterflyWing=new T.ShapeGeometry(butterflyShape,8);
 for(let i=0;i<8;i++){
  const group=new T.Group();group.name='blue hour butterfly';scene.add(group);
  const z=i<4?2-i*1.9:-34-(i-4)*2.6;
  const x=pathAt(z)+(i%2?-1:1)*(1.2+i%3*.25);
  const wings=[];
  const material=new T.MeshStandardMaterial({color:[0xe5aa72,0xd8afbf,0x94add6,0xe6cf8a][i%4],emissive:0x866057,emissiveIntensity:.14,side:T.DoubleSide,roughness:.92});
  for(const side of [-1,1]){
   const pivot=new T.Group(),wing=new T.Mesh(butterflyWing,material);
   wing.rotation.x=-Math.PI/2;wing.scale.x=side;pivot.add(wing);group.add(pivot);wings.push(pivot);
  }
  const body=new T.Mesh(new T.SphereGeometry(1,7,5),new T.MeshLambertMaterial({color:0x52464b}));
  body.scale.set(.022,.023,.096);group.add(body);
  butterflies.push({group,wings,x,z,y:heightAt(x,z)+.72+(i%3)*.24,phase:i*2.23});
  group.visible=false;
 }
 for(const fly of flies)fly.group.visible=false;
 const nearLights=[];for(let i=0;i<4;i++){const l=new T.PointLight(0xffd978,.18,3,2);scene.add(l);nearLights.push(l);}
 let mode='evening',current={...PALETTES.evening},target=PALETTES.evening;
 function setTime(name,immediate=false){if(!PALETTES[name])return;mode=name;target=PALETTES[name];if(immediate){current={...target};apply(1);}}
 const weatherSeed=random(42138),weatherParticles=[];
 const snowGeometry=new T.BufferGeometry(),rainGeometry=new T.BufferGeometry();
 const snowPoints=new T.Points(snowGeometry,new T.PointsMaterial({color:0xf0eaf8,size:.045,transparent:true,opacity:.75,depthWrite:false}));
 snowPoints.material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float flakeRadius=length(gl_PointCoord-.5);
   if(flakeRadius>.5)discard;
   diffuseColor.a*=1.-smoothstep(.12,.50,flakeRadius);
  `);
 };
 const rainLines=new T.LineSegments(rainGeometry,new T.LineBasicMaterial({color:0xaec6dd,transparent:true,opacity:.47,depthWrite:false}));
 for(let i=0;i<2200;i++)weatherParticles.push([weatherSeed()*38-19,weatherSeed()*15,weatherSeed()*86-59,weatherSeed()]);
 snowGeometry.setDrawRange(0,750);
 snowGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(weatherParticles.length*3),3));
 rainGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(weatherParticles.length*6),3));
 snowPoints.frustumCulled=rainLines.frustumCulled=false;
 snowPoints.visible=rainLines.visible=false;
 snowPoints.name='snow flurries';rainLines.name='rain showers';scene.add(snowPoints,rainLines);
 let weather='clear';
 const defaultWeather={winter:'snow',monsoon:'rain',autumn:'clear',spring:'clear',summer:'clear'};
 const fogMultiplier={clear:1,mist:.53,rain:.91,snow:.90};
 let fogTarget,snowTarget=0,rainTarget=0;
 snowPoints.material.opacity=rainLines.material.opacity=0;
 function refreshWeather(){
  const effective=weather==='auto'?defaultWeather[season]:weather;
  snowTarget=effective==='snow'?.52:0;rainTarget=effective==='rain'?.30:0;raining=effective==='rain';
  fogTarget=seasonStyle.fogFar*fogMultiplier[effective];
  snowing=effective==='snow'||season==='winter';
  ground.material.color.set(snowing?0xeef2f6:seasonStyle.ground);
  snowAmount.value=snowing?1:seasonStyle.snow;
  grassHeight.value=snowing?.07:seasonStyle.grassHeight;
  grassMat.color.set(snowing?0xf2f3ee:seasonStyle.grass);
  // Under snow the shortened blades lie flat as dark streaks, so the grass is hidden instead.
  grass.visible=!snowing&&grassHeight.value>.05;
  drifts.visible=tufts.visible=settledSnow.visible=snowing;
  if(snowing)waterMat.color.set(0x536c80);
  setSnowSurface(snowing);
  updateClimbers();
 }
 let snowing=false;
 function setWeather(value){
  if(value!=='auto'&&!Object.hasOwn(fogMultiplier,value))return;
  weather=value;refreshWeather();
 }
 function animateWeather(t,dt,quiet){
  const blend=quiet?1:1-Math.exp(-dt*1.8);
  advanceRain(t,dt,quiet);
  scene.fog.far+=(fogTarget-scene.fog.far)*blend;
  for(const [layer,targetOpacity,snow] of [[snowPoints,snowTarget,true],[rainLines,rainTarget,false]]){
   layer.material.opacity+=(targetOpacity-layer.material.opacity)*blend;
   layer.visible=layer.material.opacity>.006;
   if(!layer.visible)continue;
   const points=layer.geometry.attributes.position;
   for(let i=0;i<weatherParticles.length;i++){
    const [x0,y0,z,phase]=weatherParticles[i];
    const x=x0+(snow?Math.sin(t*.68+phase*6)*.86:Math.sin(t*.13+phase*6)*.12);
    const y=(15+(y0-t*(snow?.52:7.5))%15)%15;
    const indoors=x>hut.position.x+westWall&&x<hut.position.x+eastWall&&z>hut.position.z+backWall&&z<hut.position.z+frontWall&&y<hut.position.y+5.95;
    if(snow)points.setXYZ(i,x,indoors?-10:y,z);
    else{
     points.setXYZ(i*2,x,indoors?-10:y,z);
     points.setXYZ(i*2+1,x+.018,indoors?-10:y+.18+phase*.12,z);
    }
   }
   points.needsUpdate=true;
  }
 }
 let season,seasonStyle;
 function setSeason(name){
  if(!Object.hasOwn(seasonPalettes,name)||name===season)return;
  season=name;seasonStyle=seasonPalettes[name];
  refreshWeather();
  applyFoliage();
  for(const fruit of seasonalFruit)fruit.visible=seasonStyle.fruit;
  fringe.material.color.set(seasonStyle.fringe??0xffffff);
  fallen.visible=falling.visible=!!seasonStyle.fallen;
 }
 let month=4;
 function applyFoliage(){
  const zero=new T.Matrix4().makeScale(0,0,0);
  for(let i=0;i<foliageKinds.length;i++){
   const kind=foliageKinds[i],tree=canopyTree[i];
   if(season==='winter'&&bareInWinter[tree])canopy.setMatrixAt(i,zero);else canopy.instanceMatrix.array.set(canopyBase.subarray(i*16,i*16+16),i*16);
   canopy.setColorAt(i,new T.Color(kind>=0?seasonStyle.leaf[kind]:(seasonStyle.cedar||[0x7e9b8d,0x617f7b])[i%2]));
  }
  canopy.instanceColor.needsUpdate=true;canopy.instanceMatrix.needsUpdate=true;
  crownSnow.instanceMatrix.array.set(canopy.instanceMatrix.array.subarray(0,canopy.count*16));crownSnow.instanceMatrix.needsUpdate=true;
  for(let i=0;i<fringe.count;i++){if(season==='winter'&&bareInWinter[fringeTree[i]])fringe.setMatrixAt(i,zero);else fringe.instanceMatrix.array.set(fringeBase.subarray(i*16,i*16+16),i*16);}
  fringe.instanceMatrix.needsUpdate=true;
 }
 // A month sets the season and the month-only touches (April blossom).
 function setMonth(m){month=m;const name=seasonForMonth(m);if(name!==season)setSeason(name);else applyFoliage();updateClimbers();}
 setSeason('spring');
 const seasonalWaterColor=new T.Color();
 function apply(k){hemi.color.lerp(new T.Color(mode==='evening'?0xffd1aa:0x9fb8e0),k);key.color.lerp(new T.Color(mode==='evening'?0xffbf8b:0xa1b8e0),k);for(const field of ['top','low','pink','cream'])skyMaterial.uniforms[field].value.lerp(new T.Color(target[field]).lerp(new T.Color(field==='top'?0x6c8198:0xacb6c3),rainStrength.value*.25),k);scene.fog.color.lerp(new T.Color(target.fog).lerp(new T.Color(0x9aabba),rainStrength.value*.22),k);seasonalWaterColor.set(target.water).lerp(new T.Color(seasonStyle.water),.16*(1-current.night*.65));if(snowing)seasonalWaterColor.lerp(new T.Color(0x425d75),.68);seasonalWaterColor.lerp(new T.Color(0x6d8991),wetness.value*.36);waterMat.color.lerp(seasonalWaterColor,k);pool.material.color.copy(waterMat.color).multiplyScalar(.83);for(const f of ['ambient','key','fill','night'])current[f]+=(target[f]-current[f])*k;hemi.intensity=current.ambient;key.intensity=current.key*(1-rainStrength.value*.35);fill.intensity=current.fill*(1+rainStrength.value*.20);skyMaterial.uniforms.night.value=current.night;skyMaterial.uniforms.moonPhase.value+=(Number(mode==='fullMoon')-skyMaterial.uniforms.moonPhase.value)*k;
 cinema.visible=target.night>0&&(cinemaOpen||cinemaProgress>.015);projector.visible=cinema.visible;}
 function advance(t,dt,quiet=false){apply(1-Math.exp(-dt*5));animateFalling(t);
 for(const m of mistPuffs){m.puff.position.set(m.base.x+Math.sin(t*.13+m.phase)*.8,m.base.y+Math.sin(t*.09+m.phase*2)*.4,m.base.z);}
 animateWeather(quiet?0:t,dt,quiet);
 const cinemaTarget=cinemaOpen?1:0;
 cinemaProgress=quiet?cinemaTarget:cinemaProgress+(cinemaTarget-cinemaProgress)*(1-Math.exp(-dt*6));
 screenRoll.scale.y=Math.max(.008,cinemaProgress);
 projectorLid.rotation.x=-cinemaProgress*.81;
 curtainProgress=quiet?Number(curtainsClosed):curtainProgress+(Number(curtainsClosed)-curtainProgress)*(1-Math.exp(-dt*10));
 for(const {mesh,side,width,restX,tie} of curtainPanels){
  const spread=.31+.69*curtainProgress;
  const positions=mesh.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
   const originalY=restX[i*3+1];
   const cinch=Math.exp(-Math.pow((originalY+.09)/.34,2));
   const edge=side*width*.245;
   positions.setX(i,edge+(restX[i*3]-edge)*(1-.66*cinch*(1-curtainProgress)));
  }
  positions.needsUpdate=true;
  mesh.geometry.computeVertexNormals();
  tie.visible=curtainProgress<.45;
  tie.position.x=side*width*.18;
  tie.scale.x=.32;
  mesh.scale.x=spread;
  mesh.position.x=side*width*(.5-.245*spread);
 }
 projectorBeam.material.opacity=.029*cinemaProgress;
 if(cinema.visible){
  const cloth=clothGeometry.attributes.position;
  for(let i=0;i<cloth.count;i++){
   const x=clothRest[i*3],y=clothRest[i*3+1],loose=(1.06-y)/2.12;
   const fold=Math.sin(x*5.5)*.045;
   cloth.setY(i,y-.063*(1-x*x/3.43));
   cloth.setZ(i,fold+.044*loose*Math.sin(x*3.1+(quiet?0:t*2.25)-y*2));
  }
  cloth.needsUpdate=true;clothGeometry.computeVertexNormals();
 }
 windStrength.value=seasonStyle.wind*(1+current.night*.48);
 wind.value=t*(1+current.night*.15);record.rotation.y=t*.35;cafeLight.intensity=.6+current.night*.7;flames.visible=current.night>.08;fireLight.intensity=current.night*(1-rainStrength.value*.25)*(5.5+.5*Math.sin(t*5.3)+.3*Math.sin(t*8.1));for(const {mesh,height,phase} of flameTongues){
  mesh.scale.y=height*(1+.19*Math.sin(t*5+phase)+.07*Math.sin(t*9+phase));
  mesh.rotation.z=.15*Math.sin(t*3+phase);
 }
 for(const {mesh,phase} of embers){
  const life=(t*.51+phase)%1;
  mesh.position.set(Math.sin(phase*31+life*4)*(.12+life*.2),.25+life*1.25,Math.cos(phase*49)*(.09+life*.15));
  mesh.scale.setScalar(.3+.8*Math.sin(life*Math.PI));
 }
 for(const d of droplets){const f=(d.phase+t*.56)%1;d.mesh.position.set(d.x+Math.sin(f*4+d.phase)*.025,(fallHeight-.1)*(1-f),d.z+.18*f*f);}
 for(const c of currents){const z=streamStartZ+((c.phase+t*.018)%1)*(streamEndZ-streamStartZ);const x=riverAt(z);c.mesh.position.set(x+c.lane,-.035,z);c.mesh.rotation.y=Math.atan(.192*Math.cos(z*.12));}
 for(const r of ripples){const f=(r.phase+t*.5)%1;r.mesh.scale.set(.2+f*1.8,.15+f*1.2,1);r.mesh.material.opacity=(1-f)*.5;}

 for(let i=0;i<fallStrips.length;i++){const strip=fallStrips[i];strip.scale.x=.85+.15*Math.sin(t*2+i);strip.position.y=fallHeight/2-.08+Math.sin(t*3+i)*.04;}
 for(const f of foam){f.mesh.position.z=f.z+Math.sin(t*.65+f.phase)*.12;f.mesh.scale.y=.015+(.5+.5*Math.sin(t+f.phase))*.012;}
 for(const m of mist){m.mesh.position.y=m.y+Math.sin(t*.6+m.phase)*.14;}
 for(const {group,wings,x,y,z,phase} of butterflies){
  group.visible=mode==='dawn';
  if(!group.visible)continue;
  group.position.set(x+Math.sin(t*.92+phase)*.52,y+Math.sin(t*1.43+phase)*.24,z+Math.cos(t*.71+phase)*.48);
  group.rotation.y=phase+Math.sin(t*.92+phase)*.6;
  const flap=quiet?.34:Math.sin(t*15+phase)*.95;
  wings[0].rotation.z=-flap;wings[1].rotation.z=flap;
 }
for(let i=0;i<flies.length;i++){const b=flies[i],p=b.phase,s=t*b.speed;b.group.visible=target.night>0;b.group.position.set(b.origin.x+Math.sin(s+p)*.65,b.origin.y+Math.sin(s*.8+p)*.28,b.origin.z+Math.cos(s*.65+p)*.55);b.group.rotation.y=Math.sin(s+p)*.8+p;b.group.rotation.z=Math.sin(s*.5+p)*.12;b.animate(t,p,quiet);if(i<nearLights.length){nearLights[i].position.copy(b.group.position);nearLights[i].intensity=(target.night>0?.035+.14*current.night:0)*( .6+.4*Math.sin(t*1.7+p)**2);}}sky.position.set(0,0,0);}
 function move(position,dx,dz){let x=Math.max(-23,Math.min(23,position.x+dx)),z=Math.max(-53,Math.min(24,position.z+dz));if(pondDistance(x,z)<pondRadius){const side=x<pondX?-1:1;x=pondX+side*Math.sqrt(pondRadius**2-(z-pondZ)**2);}
 const river=7+1.6*Math.sin(z*.12);if(z<=streamEndZ&&Math.abs(x-river)<2.25)x=river+(x<river?-2.25:2.25);for(const c of colliders){const ox=x-c.x,oz=z-c.z,d=Math.hypot(ox,oz);if(d<c.r){const k=c.r/(d||1);x=c.x+(d?ox*k:c.r);z=c.z+(d?oz*k:0);}}const inside=(px,pz)=>px-hut.position.x>westWall&&px-hut.position.x<eastWall&&pz-hut.position.z>backWall&&pz-hut.position.z<frontWall;
 const priorFloor=position.y-hut.position.y-1.65;
 const localX=x-hut.position.x,localZ=z-hut.position.z;
 const onStairs=Math.abs(localX-stairX)<.50&&localZ<=stairsFront&&localZ>=stairsBack;
 const wasOnStairs=Math.abs(position.x-hut.position.x-stairX)<.50&&position.z-hut.position.z<=stairsFront&&position.z-hut.position.z>=stairsBack;
 const onLanding=localZ<stairsBack&&localX<CAFE_LAYOUT.loftEdge;
 const loftFloor=localZ<-.02&&localX>=CAFE_LAYOUT.loftEdge||onLanding;
 // Stair and attic edges keep the camera on the proper floor.
 if(priorFloor>loftHeight-.22&&!onStairs&&(!loftFloor||!inside(x,z))||
    wasOnStairs&&priorFloor>.40&&priorFloor<loftHeight-.22&&!onStairs){
  x=position.x;z=position.z;
 }
 if(inside(x,z)!==inside(position.x,position.z)){
  const front=hut.position.z+frontWall;
  const crossesFront=(z-front)*(position.z-front)<=0;
  if(!(doorOpen&&crossesFront&&Math.abs(x-hut.position.x)<.43)){x=position.x;z=position.z;}
 }
 if(priorFloor<.45&&inside(x,z)){
  for(const o of groundObstacles){
   let lx=x-hut.position.x,lz=z-hut.position.z;const r=.18;
   if(lx<=o.minX-r||lx>=o.maxX+r||lz<=o.minZ-r||lz>=o.maxZ+r)continue;
   const distances=[Math.abs(lx-(o.minX-r)),Math.abs(lx-(o.maxX+r)),Math.abs(lz-(o.minZ-r)),Math.abs(lz-(o.maxZ+r))],side=distances.indexOf(Math.min(...distances));
   if(side===0)x=hut.position.x+o.minX-r;else if(side===1)x=hut.position.x+o.maxX+r;else if(side===2)z=hut.position.z+o.minZ-r;else z=hut.position.z+o.maxZ+r;
  }
 }
 let floor=heightAt(x,z)+(winterSurface?snowRelief(x,z):0);
 if(inside(x,z)){
  const rx=x-hut.position.x,rz=z-hut.position.z;
  const stair=Math.abs(rx-stairX)<.50&&rz<=stairsFront&&rz>=stairsBack;
  const landing=rx<CAFE_LAYOUT.loftEdge&&rz<stairsBack;
  const upper=priorFloor>loftHeight-.22&&(landing||rx>=CAFE_LAYOUT.loftEdge&&rz<-.02);
  const climb=stair?.17+(loftHeight-.17)*(stairsFront-rz)/(stairsFront-stairsBack):.17;
  floor=hut.position.y+(upper?loftHeight:climb);
 }
 return new T.Vector3(x,floor+1.65,z);}
 return{cafeBounds:CAFE_LAYOUT,groundObstacles,kitchen,cafeBookcase,scene,root,flies,butterflies,sky,skyMaterial,hemi,key,fill,ground,path,grass,canopy,fringe,water,waterfall,fallStrips,hut,cafe,attic,shelfTarget,upstairsPosition,stairFoot,cafeDoor,toggleDoor,toggleCurtains,cinema,cinemaSeats,projector,setCinemaOpen,movieScreen,projectorBeam,books,musicPlayer,record,flames,fireLight,pool,sourceWater,fallHeight,droplets,currents,ripples,colliders,setTime,setSeason,setMonth,setWeather,get month(){return month;},get snowing(){return snowing;},advance,move,get wetness(){return wetness.value;},get rainIntensity(){return rainStrength.value;},get raining(){return raining;},get weather(){return weather;},get season(){return season;},get mode(){return mode;},get night(){return current.night;}};
}
