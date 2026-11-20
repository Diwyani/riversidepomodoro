// Rive elements for Little Stream: lavender clumps, blooming flowers and pond life.
// Each Rive artboard plays into its own small canvas; that canvas is a texture shared by every copy in the world.
// The .riv comes from ~/Documents/meadow-elements (built with `rive . --publish`) and is embedded by build.py.
// With no .riv embedded, nothing is added and the world runs exactly as before.
export const RIVE_RUNTIME='https://cdn.jsdelivr.net/npm/@rive-app/canvas-advanced@2.49.0/';

export async function addRiveElements(T,world,heightAt,pathAt,rivBase64){
 if(!rivBase64)return null;
 const {default:RiveCanvas}=await import(RIVE_RUNTIME+'canvas_advanced.mjs');
 // The runtime asks for canvas_advanced.wasm, but the package ships the binary as rive.wasm.
 const rive=await RiveCanvas({locateFile:f=>RIVE_RUNTIME+(f.endsWith('.wasm')?'rive.wasm':f)});
 const bytes=Uint8Array.from(atob(rivBase64),c=>c.charCodeAt(0));
 const file=await rive.load(bytes);

 // One live artboard -> one canvas -> one texture.
 const players=[];
 function player(name,w,h){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const renderer=rive.makeRenderer(canvas);
  const artboard=file.artboardByName(name);
  const machine=new rive.StateMachineInstance(artboard.stateMachineByIndex(0),artboard);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const p={canvas,renderer,artboard,machine,texture,w,h};players.push(p);return p;
 }

 // Seeded random so placement is the same on every visit.
 let seed=4242;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const clear=(x,z,gap)=>world.colliders.every(c=>Math.hypot(x-c.x,z-c.z)>c.r+gap);

 // Two crossed planes read as a plant from every side, with no per-frame turning.
 function crossed(p,width,height,count,zMin,zMax,near,far){
  const geo=new T.PlaneGeometry(width,height);geo.translate(0,height/2,0);
  const mat=new T.MeshLambertMaterial({map:p.texture,transparent:true,alphaTest:.35,side:T.DoubleSide,depthWrite:true});
  const group=new T.Group();
  for(let placed=0,tries=0;placed<count&&tries<count*20;tries++){
   const z=zMin+rnd()*(zMax-zMin),side=rnd()<.5?-1:1,x=pathAt(z)+side*(near+rnd()*(far-near));
   if(!clear(x,z,.6))continue;
   const s=.8+rnd()*.45,turn=rnd()*Math.PI;
   for(const a of [0,Math.PI/2]){const m=new T.Mesh(geo,mat);m.rotation.y=turn+a;m.scale.setScalar(s);m.position.set(x,heightAt(x,z)-.02,z);group.add(m);}
   placed++;
  }
  world.root.add(group);return group;
 }

 const lavender=player('Lavender',300,360);
 const pond=player('Pond Life',512,512);

 // Lavender: 300 x 360 artboard -> 1.25 m x 1.5 m (smaller hid in the grass), in the meadow either side of the path.
 // 170 clumps across the meadow and woodland grass: the first 40 show from May to November, all 170 in April when the field is covered.
 const lavenderGroup=crossed(lavender,1.25,1.5,170,-28,23,1.5,16);lavenderGroup.name='rive lavender';
 lavenderGroup.children.forEach((m,i)=>{m.userData.aprilOnly=i>=80;});
 // Keep the meadow purple only; no white blooming flower artboard.
 const flowerGroup=new T.Group();flowerGroup.name='rive blooming flowers';

 // Pond life: a disc just above the existing pond water, so the koi and ripples sit on its surface.
 const pool=world.pool,radius=pool.geometry.parameters.radius*.96;
 const disc=new T.Mesh(new T.CircleGeometry(radius,64),new T.MeshLambertMaterial({map:pond.texture,transparent:true,depthWrite:false}));
 disc.name='rive pond life';disc.rotation.x=-Math.PI/2;disc.position.copy(pool.position);disc.position.y+=.012;disc.renderOrder=2;
 world.root.add(disc);

 return{
  lavender:lavenderGroup,flowers:flowerGroup,pond:disc,
  // Call once per frame with seconds since the last frame.
  advance(dt){
   // Lavender disappears under snow; white flowers stay absent.
   lavenderGroup.visible=!world.snowing;
   flowerGroup.visible=false;
   const april=world.month===4;for(const m of flowerGroup.children)m.visible=april||!m.userData.aprilOnly;for(const m of lavenderGroup.children)m.visible=april||!m.userData.aprilOnly;
   for(const p of players){
    p.machine.advance(dt);p.artboard.advance(dt);
    p.renderer.clear();p.renderer.save();
    p.renderer.align(rive.Fit.contain,rive.Alignment.center,{minX:0,minY:0,maxX:p.w,maxY:p.h},p.artboard.bounds);
    p.artboard.draw(p.renderer);p.renderer.restore();
   }
   rive.resolveAnimationFrame();
   for(const p of players)p.texture.needsUpdate=true;
  }
 };
}
