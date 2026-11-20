import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {once} from 'node:events';
import {createServer} from 'node:net';

const allocation=createServer();
allocation.listen(0,'127.0.0.1');
await once(allocation,'listening');
const {port}=allocation.address();
await new Promise(resolve=>allocation.close(resolve));
const origin='http://127.0.0.1:'+port;
const server=spawn(process.execPath,[new URL('./room-server.mjs',import.meta.url).pathname],{
 env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:['ignore','pipe','inherit']
});
const readers=[];
const mediaDirectory=new URL('./media/',import.meta.url);
const fixture=new URL('./media/room-test-'+port+'.mp4',import.meta.url);
async function call(path,body,status=200){
 const r=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal(r.status,status);return r.json();
}
async function eventClient(base,token){
 const response=await fetch(origin+base+'/events?token='+token);
 assert.equal(response.status,200);
 const reader=response.body.getReader();readers.push(reader);
 let buffer='';
 return async condition=>{
  const end=Date.now()+3000;
  while(Date.now()<end){
   const boundary=buffer.indexOf('\n\n');
   if(boundary>=0){
    const line=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
    if(line.startsWith('data: ')){const state=JSON.parse(line.slice(6));if(condition(state))return state;}
   }else{
    const {value,done}=await reader.read();
    if(done)break;
    buffer+=Buffer.from(value).toString();
   }
  }
  throw new Error('Expected room state was not received.');
 };
}
try{
 await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw new Error('Could not start room server.');})]);
 assert.equal((await fetch(origin)).status,200);
 assert.equal((await fetch(origin+'/world.mjs')).status,404);
 const host=await call('/api/rooms',{name:'Host',sky:'fullMoon'},201);
 const endpoint='/api/rooms/'+host.room;
 const guest=await call(endpoint+'/join',{name:'Friend'});
 assert.equal(guest.state.people.length,2);
 assert(host.host&&!guest.host);
 const hostState=await eventClient(endpoint,host.token);
 const guestState=await eventClient(endpoint,guest.token);
 await call(endpoint+'/update',{token:guest.token,kind:'sky',sky:'dawn'},403);
 await call(endpoint+'/update',{token:guest.token,kind:'calendar',month:1,weather:'snow'},403);
 await call(endpoint+'/update',{token:host.token,kind:'calendar',month:1,weather:'snow'});
 const winter=await guestState(s=>s.calendarMonth===1);
 assert.equal(winter.season,'winter');assert.equal(winter.weather,'snow');
 await call(endpoint+'/update',{token:guest.token,kind:'presence',position:[1,2,3],yaw:.2,area:'Meadow'});
 assert.deepEqual((await hostState(s=>s.people.find(p=>p.name==='Friend')?.position)).people.find(p=>p.name==='Friend').position,[1,2,3]);
 await call(endpoint+'/update',{token:host.token,kind:'source',url:'/media/test.mp4'});
 await call(endpoint+'/update',{token:host.token,kind:'playback',playing:true,position:12.5});
 const playing=await guestState(s=>s.media.playing);
 assert.equal(playing.media.position,12.5);assert(playing.cinema);assert.equal(playing.sky,'fullMoon');
 const late=await call(endpoint+'/join',{name:'Late guest'});
 assert(late.state.media.playing);assert(late.state.serverTime>=late.state.media.updatedAt);
 const recovered=await call(endpoint+'/join',{token:host.token,name:'Host'});
 assert(recovered.host&&recovered.id===host.id);
 await call(endpoint+'/update',{token:host.token,kind:'playback',playing:false,position:19});
 assert.equal((await guestState(s=>!s.media.playing&&s.media.position===19)).media.position,19);
 await call(endpoint+'/leave',{token:guest.token});
 assert(!(await hostState(s=>!s.people.some(p=>p.name==='Friend'))).people.some(p=>p.name==='Friend'));
 await mkdir(mediaDirectory,{recursive:true});await writeFile(fixture,'0123456789');
 const file=await fetch(origin+'/media/'+fixture.pathname.split('/').at(-1),{headers:{Range:'bytes=2-5'}});
 assert.equal(file.status,206);assert.equal(file.headers.get('content-range'),'bytes 2-5/10');assert.equal(await file.text(),'2345');
 console.log('PASS: invites, live roster, positions, host permissions, shared video commands, late join, host reconnection, leave and media seeking.');
}finally{
 await Promise.allSettled(readers.map(reader=>reader.cancel()));
 server.kill();await unlink(fixture).catch(()=>{});
}
