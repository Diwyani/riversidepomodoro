import {createRequire} from 'node:module';import {writeFileSync} from 'node:fs';import {builtInBrushes,drawStroke,emptyAssets,mulberry32} from './brush-engine.mjs';
const require=createRequire(import.meta.url);const {createCanvas,Path2D}=require(process.env.ORANGE_CANVAS_MODULE||'@napi-rs/canvas');globalThis.Path2D=Path2D;
const brushes=new Map(builtInBrushes().map(b=>[b.id,b])),assets=emptyAssets(),rng=mulberry32(4402);let seed=0;
for(const [name,base,colors] of [['leaf','#899573',['#91a17f','#7e916a','#b6a1ae','#8b9fbc','#b7b88a']],['bark','#77646a',['#8c7181','#bba19c','#7a899c','#5d666a']],['ground','#939879',['#a4a886','#7c8e78','#c2a6ac','#919fbd']],['path','#c0ac9d',['#d0b5a6','#a8a3a8','#d3bbc0','#b0ac93']]]){
 const c=createCanvas(256,256),g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
 for(let i=0;i<240;i++){const x=rng()*256,y=rng()*256,a=name==='bark'?-Math.PI/2:rng()*Math.PI*2,len=5+rng()*30,b=brushes.get('crayon');drawStroke(g,{brush:{...b,opacity:1,flow:.48},color:colors[i%colors.length],size:3+rng()*12,seed:seed++,points:[{x,y,t:0,pressure:.5},{x:x+Math.cos(a)*len,y:y+Math.sin(a)*len,t:20,pressure:.7}]},assets,1);}
 writeFileSync(new URL(name+'.png',import.meta.url),c.toBuffer('image/png'));
}
const c=createCanvas(128,128),g=c.getContext('2d');const brush=brushes.get('chalk');for(let i=0;i<120;i++){const x=20+rng()*88,y=20+rng()*88;if((x-64)**2+(y-64)**2>44**2)continue;drawStroke(g,{brush:{...brush,opacity:1,flow:.7},color:['#9bab89','#a9b698','#c0a8b8'][i%3],size:10,seed:seed++,points:[{x,y,t:0,pressure:.6},{x:x+8,y:y-3,t:20,pressure:.6}]},assets,1);}writeFileSync(new URL('leaf-fringe.png',import.meta.url),c.toBuffer('image/png'));console.log('Painted five nature textures with the supplied brushes.');
