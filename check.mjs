import assert from 'node:assert/strict';
import {createWorld,createFirefly,PALETTES,pathAt,heightAt,areaAt} from './world.mjs';
const T=await import(process.env.THREE_MODULE||'three');
const textures=Object.fromEntries(['leaf','bark','ground','path','fringe'].map(k=>[k,new T.Texture()]));const world=createWorld(T,textures),bug=createFirefly(T);
assert.equal(world.flies.length,30);assert.equal(bug.wings.length,2);
for(const t of [0,1,60,10000]){world.advance(t,.016);world.scene.updateMatrixWorld(true);world.scene.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh)assert([...o.geometry.attributes.position.array].every(Number.isFinite));});}
for(const mode of ['evening','night','dawn']){world.setTime(mode,true);assert.equal(world.mode,mode);assert.equal(world.hemi.intensity,PALETTES[mode].ambient);}
assert(PALETTES.night.ambient<PALETTES.evening.ambient*.1);
for(let z=20;z>=-52;z-=.2){const p=world.move(new T.Vector3(pathAt(z),0,z),0,0);assert(Math.abs(p.y-heightAt(p.x,p.z)-1.65)<1e-6);assert(Math.abs(p.x-pathAt(z))<1,'Path blocked');}
for(const c of world.colliders){const p=world.move(new T.Vector3(c.x,0,c.z),0,0);assert(Math.hypot(p.x-c.x,p.z-c.z)>=c.r-.00001);}
assert(world.move(new T.Vector3(100,0,100),0,0).z<=24);
assert(world.move(new T.Vector3(7,0,-40),0,0).y>1);
console.log('PASS: finite meshes and animation, 30 seasonal fireflies, three palettes, traversable path, tree collision, boundaries and stream banks.');

assert.equal(areaAt(20),'Meadow');assert.equal(areaAt(-15),'Woodland');assert.equal(areaAt(-35),'Streamside');assert.equal(areaAt(-50),'Waterfall');assert.equal(world.fallStrips.length,13);assert(world.grass.geometry.attributes.position.count>100000);for(let z=-28;z>=-52;z-=1)assert(Math.abs((7+1.6*Math.sin(z*.12))-pathAt(z))<6);console.log('PASS: curved grass, streamside route and waterfall arrival.');
assert(world.pool.geometry.parameters.radius>4.5);
const river=world.water.geometry.attributes.position;
assert(river.getZ(0)>3,'Stream reaches the starting area');
const marker=world.currents.find(c=>c.phase<.9);
world.advance(0,.016);const previousZ=marker.mesh.position.z;
world.advance(1,.016);assert(marker.mesh.position.z>previousZ,'Current flows toward the start');
assert(world.attic.getObjectByName('white bedsheet'));
assert(world.attic.getObjectByName('rose wool kambal'));

assert(world.cafe);assert(world.musicPlayer);let books=0,pastries=0;world.cafe.traverse(o=>{if(o.name==='book')books++;if(o.name==='croissant')pastries++;});assert.equal(books,32);assert.equal(pastries,0);world.setTime('night',true);world.advance(2,.016);assert(world.fireLight.intensity>0);console.log('PASS: café books, no croissants, music player and night fire.');

const winterTufts=world.scene.getObjectByName('grass through snow');
const snowLayer=world.scene.getObjectByName('snow flurries');
const rainLayer=world.scene.getObjectByName('rain showers');
const ground=world.ground.geometry.attributes.position;
const springHeights=ground.array.filter((_,i)=>i%3===1);
for(const month of [12,1,2]){
 world.setMonth(month);world.setWeather('clear');world.advance(0,.016,true);
 assert(world.snowing&&winterTufts.visible&&winterTufts.count>40);
 assert(!snowLayer.visible&&!rainLayer.visible);
 assert(ground.array.some((value,i)=>i%3===1&&value-springHeights[(i-1)/3]>.12),'Snow has raised terrain');
}
world.setMonth(4);world.advance(0,.016,true);
assert(!world.snowing&&!winterTufts.visible);
assert.deepEqual(ground.array.filter((_,i)=>i%3===1),springHeights);
world.setWeather('rain');world.advance(0,.016,true);
assert(rainLayer.visible&&!snowLayer.visible);
world.setWeather('snow');world.advance(.1,.05);
assert(rainLayer.visible&&snowLayer.visible,'Weather layers crossfade');
world.setTime('night');world.advance(.2,.05);
assert.equal(world.weather,'snow');
world.setTime('fullMoon',true);world.advance(1,.016,true);
assert.equal(world.weather,'snow');assert(snowLayer.visible&&!rainLayer.visible);
world.setWeather('mist');world.advance(1,.016,true);
assert(!snowLayer.visible&&!rainLayer.visible&&world.scene.fog.far<60);
console.log('PASS: December through February snow relief and tufts, weather fade, and unchanged weather across moon settings.');

assert.equal(world.cinemaSeats.length,2);
const outdoorSeating=world.scene.getObjectByName('camp chairs by the fire');
for(const name of ['clay camp chair','sage camp chair']){
 assert(outdoorSeating.getObjectByName(name).getObjectByName('sling canvas seat'));
 assert(outdoorSeating.getObjectByName(name).getObjectByName('canvas chair back'));
}
world.setCinemaOpen(false);world.setTime('evening',true);world.advance(0,.016,true);
assert(!world.cinema.visible&&outdoorSeating.visible&&outdoorSeating.parent===world.root);
assert.equal(world.movieScreen.rotation.y,Math.PI);
for(const seat of world.cinemaSeats){
 assert(seat.z<world.cinema.position.z);
 assert(seat.y-heightAt(seat.x,seat.z)<1.3,'Camera sits below standing height');
}
console.log('PASS: two seated viewpoints, two folding canvas chairs and a projection facing the audience.');
