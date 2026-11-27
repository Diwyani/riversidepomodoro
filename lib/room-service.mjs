import {randomBytes} from 'node:crypto';
import {seasonForMonth,seasonForDate} from '../world.mjs';
const ttl=21600,liveFor=30000,maxGuests=2;
const id=n=>randomBytes(n).toString('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const name=value=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28):'';
const validMonth=value=>Number.isInteger(value)&&value>=0&&value<=12;
const skies=new Set(['evening','night','fullMoon','dawn']),weather=new Set(['auto','clear','mist','rain','snow']);
const positionAt=(media,time)=>media.position+(media.playing?Math.max(0,time-media.updatedAt)/1000:0);
const casScript="local current=redis.call('GET',KEYS[1]); if (not current and ARGV[1]=='') or current==ARGV[1] then redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3]); return 1 else return 0 end";
export function redisStore(env=process.env,fetcher=fetch){
 const url=env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL,token=env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN;
 async function command(args){
  if(!url||!token||!/^https:\/\//.test(url))throw fail(503,'Room service setup is incomplete. Connect an Upstash Redis database to this Vercel project, then redeploy.');
  let response;try{response=await fetcher(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(7000)});}catch{throw fail(503,'Room service is temporarily unavailable. Please retry.');}
  const result=await response.json().catch(()=>null);if(!response.ok||!result||result.error)throw fail(503,'Room storage is temporarily unavailable. Please retry.');return result.result;
 }
 return {async read(key){return command(['GET',key]);},async cas(key,previous,next){return Number(await command(['EVAL',casScript,'1',key,previous||'',next,String(ttl)]))===1;}};
}
function snapshot(room,time){return {serverTime:time,season:room.calendarMonth?seasonForMonth(room.calendarMonth):seasonForDate(new Date(time)),calendarMonth:room.calendarMonth,weather:room.weather,sky:room.sky,cinema:room.cinema,media:room.media,people:Object.values(room.guests).filter(g=>time-g.seen<liveFor).map(({id,name,position,yaw,area,host})=>({id,name,position,yaw,area,host}))};}
function newGuest(label,host,time){return {id:id(7),token:id(24),name:name(label)||(host?'Host':'Guest'),host,seen:time,position:null,yaw:0,area:''};}
function videoURL(value){if(typeof value!=='string'||value.length>1500)return null;if(/^\/media\/[\w.-]+\.(mp4|webm|m4v)$/i.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function update(room,guest,body,time){
 if(body.kind==='presence'){
  if(body.position===null)guest.position=null;
  else if(Array.isArray(body.position)&&body.position.length===3&&body.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=150))guest.position=body.position;
  if(Number.isFinite(body.yaw))guest.yaw=body.yaw;
  if(typeof body.area==='string')guest.area=body.area.slice(0,24);
  return;
 }
 if(!guest.host)throw fail(403,'The host controls the shared sky and projector.');
 if(body.kind==='sky'&&skies.has(body.sky)){room.sky=body.sky;if(!['night','fullMoon'].includes(body.sky)){room.cinema=false;room.media={...room.media,position:positionAt(room.media,time),playing:false,updatedAt:time};}}
 else if(body.kind==='calendar'&&validMonth(body.month)&&weather.has(body.weather)){room.calendarMonth=body.month;room.weather=body.weather;}
 else if(body.kind==='cinema'){room.cinema=Boolean(body.open);if(room.cinema&&!['night','fullMoon'].includes(room.sky))room.sky='night';if(!room.cinema)room.media={...room.media,position:positionAt(room.media,time),playing:false,updatedAt:time};}
 else if(body.kind==='source'){const url=videoURL(body.url);if(!url)throw fail(400,'Use a /media/ video path or an HTTPS video URL.');room.media={url,playing:false,position:0,updatedAt:time};}
 else if(body.kind==='playback'&&room.media.url){const position=Number(body.position);if(!Number.isFinite(position)||position<0||position>86400)throw fail(400,'Invalid playback time.');room.media={...room.media,position,playing:Boolean(body.playing),updatedAt:time};if(room.media.playing){room.cinema=true;if(!['night','fullMoon'].includes(room.sky))room.sky='night';}}
 else throw fail(400,'Unknown room action.');
}
export function createRoomService({store=redisStore(),now=Date.now}={}){
 return async function handle({method='POST',path='/api/rooms',body={}}){
  try{
   if(method!=='POST')throw fail(405,'Use POST for room actions.');
   if(!body||typeof body!=='object'||Array.isArray(body))throw fail(400,'Invalid request.');
   if(Buffer.byteLength(JSON.stringify(body))>8192)throw fail(413,'Request is too large.');
   const create=path==='/api/rooms',match=/^\/api\/rooms\/([0-9a-f]{24})\/(join|update|leave)$/.exec(path);
   if(!create&&!match)throw fail(404,'Room endpoint not found.');
   const roomId=create?id(12):match[1],action=create?'create':match[2],key='riverside:room:'+roomId;
   for(let attempt=0;attempt<12;attempt++){
    const time=now(),raw=await store.read(key);let room=raw?JSON.parse(raw):null,guest;
    if(create){if(room)throw fail(503,'Please retry creating the room.');guest=newGuest(body.name,true,time);room={id:roomId,calendarMonth:validMonth(body.calendarMonth)?body.calendarMonth:0,weather:weather.has(body.weather)?body.weather:'auto',sky:skies.has(body.sky)?body.sky:'evening',cinema:false,media:{url:'',playing:false,position:0,updatedAt:time},guests:{[guest.token]:guest}};}
    else {
     if(!room)throw fail(404,'This room has expired. Ask the host for a fresh link.');
     const token=typeof body.token==='string'&&/^[0-9a-f]{48}$/.test(body.token)?body.token:'';
     // Keep a reconnecting token; reclaim other disconnected guest slots after 30 seconds.
     for(const [key,g] of Object.entries(room.guests))if(!g.host&&key!==token&&time-g.seen>liveFor)delete room.guests[key];
     guest=room.guests[token];
     if(action==='join'){
      if(!guest&&Object.keys(room.guests).length>=maxGuests)throw fail(409,'This room is full (2 people: host and one guest).');
      if(!guest){guest=newGuest(body.name,false,time);room.guests[guest.token]=guest;}
      if(name(body.name))guest.name=name(body.name);
     }else{
      if(!guest)throw fail(403,'Join the room first.');
      if(action==='leave'){if(guest.host){guest.seen=0;guest.position=null;}else delete room.guests[guest.token];}
      else update(room,guest,body,time);
     }
     if(action!=='leave')guest.seen=time;
    }
    if(await store.cas(key,raw,JSON.stringify(room))){
     if(create||action==='join')return {status:create?201:200,body:{room:room.id,id:guest.id,token:guest.token,host:guest.host,name:guest.name,transport:'poll',state:snapshot(room,time)}};
     return {status:200,body:{ok:true,state:snapshot(room,time)}};
    }
   }
   throw fail(409,'The room is updating. Please retry.');
  }catch(error){return {status:error.status||500,body:{error:error.status?error.message:'The room service could not complete that request.'}};}
 };
}
