import assert from 'node:assert/strict';
const T=await import(process.env.THREE_MODULE||'three');
import {createWorld} from './world.mjs';
const tx=Object.fromEntries(['leaf','bark','barkSoft','ground','path','fringe','stone'].map(k=>[k,new T.Texture()])),w=createWorld(T,tx),b=w.cafeBounds;
assert(Math.abs(b.east-b.west-7.2)<1e-9);assert.equal(b.front-b.back,5.5);w.toggleDoor();
let pos=new T.Vector3(w.hut.position.x,w.hut.position.y+1.82,w.hut.position.z+b.front+.7);
function walk(x,z){const goal=new T.Vector2(w.hut.position.x+x,w.hut.position.z+z);for(let i=0;i<1000;i++){const delta=new T.Vector2(goal.x-pos.x,goal.y-pos.z);if(delta.length()<.025)return;delta.clampLength(0,.035);pos=w.move(pos,delta.x,delta.y);}assert.fail('Route blocked toward '+x+','+z);}
walk(0,b.front-.35);walk(b.stairX,b.stairsFront+.12);walk(b.stairX,b.stairsBack-.20);
assert(Math.abs(pos.y-w.hut.position.y-b.loftHeight-1.65)<.01,'Stairs reach loft');
walk(b.loftEdge+.4,b.stairsBack-.20);walk(b.stairX,b.stairsBack-.20);walk(b.stairX,b.stairsFront+.12);
assert(pos.y-w.hut.position.y<1.9,'Stairs return to ground');
walk(-1.85,.35);walk(-1.85,-2.05);walk(-.35,-2.05);walk(1.95,-2.05);walk(1.95,-.65);
assert(pos.distanceTo(w.shelfTarget.getWorldPosition(new T.Vector3()))<2.2,'Books reachable');
const shelf=w.attic.getObjectByName('small bedroom bookshelf');let books=0;shelf.traverse(o=>{if(o.name==='bedroom shelf book'){books++;assert(o.userData.title);}});assert.equal(books,8);
for(const name of ['Japanese paper cafe lantern','poppy paper bedside lamp','soft green wool pile'])assert(w.scene.getObjectByName(name),name);
console.log('PASS: continuous entrance, kitchen, books and physical stairs routes; compact titled books and new lamps/rug.');
