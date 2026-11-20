import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {seasonForDate,seasonForMonth} from './world.mjs';

const directory=fileURLToPath(new URL('.',import.meta.url));
const rooms=new Map();
const legalWeather=new Set(['auto','clear','mist','rain','snow']);
const validMonth=value=>Number.isInteger(value)&&value>=0&&value<=12;
const moonModes=new Set(['evening','night','fullMoon','dawn']);
const mime={mp4:'video/mp4',webm:'video/webm',m4v:'video/mp4'};
const id=(bytes=16)=>randomBytes(bytes).toString('hex');
const now=()=>Date.now();
const liveFor=20_000;
const roomLifetime=6*60*60_000;
const maxRooms=300, maxGuests=12;

function json(res,status,value){
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
 res.end(JSON.stringify(value));
}
async function readBody(req){
 let size=0;
 const parts=[];
 for await(const part of req){
  size+=part.length;
  if(size>8192)throw Object.assign(new Error('Request is too large.'),{status:413});
  parts.push(part);
 }
 try{return JSON.parse(Buffer.concat(parts).toString());}
 catch{throw Object.assign(new Error('Invalid request.'),{status:400});}
}
function displayName(value){
 return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28):'';
}
function snapshot(room){
 const serverTime=now();
 return {serverTime,season:room.calendarMonth?seasonForMonth(room.calendarMonth):seasonForDate(new Date(serverTime)),calendarMonth:room.calendarMonth,weather:room.weather,sky:room.sky,cinema:room.cinema,media:room.media,people:[...room.guests.values()]
  .filter(g=>g.stream||serverTime-g.seen<liveFor)
  .map(({id,name,position,yaw,area,host})=>({id,name,position,yaw,area,host}))};
}
function broadcast(room){
 const line='data: '+JSON.stringify(snapshot(room))+'\n\n';
 for(const guest of room.guests.values()){
  if(!guest.stream)continue;
  if(guest.stream.writableLength>64_000)guest.stream.destroy();
  else guest.stream.write(line);
 }
}
function addGuest(room,name,host=false){
 const guest={id:id(7),token:id(24),name:name||(host?'Host':'Guest'),host,seen:now(),position:null,yaw:0,area:''};
 room.guests.set(guest.token,guest);
 return guest;
}
function credentials(room,guest){
 return {room:room.id,id:guest.id,token:guest.token,host:guest.host,name:guest.name,state:snapshot(room)};
}
function where(media,time){
 return media.position+(media.playing?Math.max(0,time-media.updatedAt)/1000:0);
}
function videoURL(value){
 if(typeof value!=='string'||value.length>1500)return null;
 if(/^\/media\/[\w.-]+\.(mp4|webm|m4v)$/i.test(value))return value;
 try{
  const target=new URL(value);
  return target.protocol==='https:'&&!target.username&&!target.password?target.href:null;
 }catch{return null;}
}
async function serveFile(req,res,path,contentType,allowRange=false){
 let file;
 try{file=await stat(path);if(!file.isFile())throw new Error();}
 catch{return json(res,404,{error:'File not found.'});}
 let start=0,end=file.size-1,status=200;
 const headers={'Content-Type':contentType,'X-Content-Type-Options':'nosniff'};
 if(allowRange){
  headers['Accept-Ranges']='bytes';
  const range=req.headers.range;
  if(range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(range);
   if(m&&(m[1]||m[2])){
    if(!m[1])start=Math.max(0,file.size-Number(m[2]));
    else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
   }
   if(!m||(!m[1]&&!m[2])||!Number.isSafeInteger(start)||start>=file.size||end<start){
    res.writeHead(416,{'Content-Range':`bytes */${file.size}`});return res.end();
   }
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${file.size}`;
  }
 }else headers['Cache-Control']='no-cache';
 headers['Content-Length']=Math.max(0,end-start+1);
 res.writeHead(status,headers);
 if(req.method==='HEAD'||!file.size)return res.end();
 const body=createReadStream(path,{start,end});
 body.on('error',()=>res.destroy());
 res.on('close',()=>body.destroy());
 body.pipe(res);
}
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  const route=url.pathname;
  if((req.method==='GET'||req.method==='HEAD')&&(route==='/'||route==='/index.html'))
   return await serveFile(req,res,join(directory,'index.html'),'text/html; charset=utf-8');
  if((req.method==='GET'||req.method==='HEAD')&&route.startsWith('/media/')){
   const file=route.slice(7),match=/^[\w.-]+\.(mp4|webm|m4v)$/i.exec(file);
   if(!match)return json(res,404,{error:'Video not found.'});
   return await serveFile(req,res,join(directory,'media',file),mime[match[1].toLowerCase()],true);
  }
  if(req.method==='POST'&&route==='/api/rooms'){
   if(rooms.size>=maxRooms)return json(res,503,{error:'All rooms are busy.'});
   const body=await readBody(req),room={id:id(12),touched:now(),calendarMonth:validMonth(body.calendarMonth)?body.calendarMonth:0,weather:legalWeather.has(body.weather)?body.weather:'auto',sky:moonModes.has(body.sky)?body.sky:'evening',cinema:false,media:{url:'',playing:false,position:0,updatedAt:now()},guests:new Map()};
   const guest=addGuest(room,displayName(body.name),true);
   rooms.set(room.id,room);return json(res,201,credentials(room,guest));
  }
  const m=/^\/api\/rooms\/([0-9a-f]{24})\/(join|events|update|leave)$/.exec(route);
  if(!m)return json(res,404,{error:'Page not found.'});
  const room=rooms.get(m[1]),action=m[2];
  if(!room)return json(res,404,{error:'This room has expired or the server restarted. Ask the host for a fresh link.'});
  if(action==='events'&&req.method==='GET'){
   const guest=room.guests.get(url.searchParams.get('token'));
   if(!guest)return json(res,403,{error:'Join the room first.'});
   guest.stream?.end();
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'});
   res.flushHeaders();guest.stream=res;guest.seen=now();room.touched=now();
   res.on('close',()=>{
    if(guest.stream!==res)return;
    guest.stream=null;guest.seen=0;broadcast(room);
   });
   broadcast(room);return;
  }
  if(req.method!=='POST')return json(res,405,{error:'Method unavailable.'});
  const body=await readBody(req);
  if(action==='join'){
   const prior=room.guests.get(body.token);
   if(!prior&&room.guests.size>=maxGuests)return json(res,409,{error:'The room is full.'});
   const guest=prior||addGuest(room,displayName(body.name));
   if(displayName(body.name))guest.name=displayName(body.name);
   guest.seen=now();room.touched=now();
   json(res,200,credentials(room,guest));broadcast(room);return;
  }
  const guest=room.guests.get(body.token);
  if(!guest)return json(res,403,{error:'Join the room first.'});
  if(action==='leave'){
   const stream=guest.stream;guest.stream=null;guest.seen=0;stream?.end();
   if(!guest.host)room.guests.delete(guest.token);
   json(res,200,{ok:true});broadcast(room);return;
  }
  if(body.kind==='presence'){
   if(body.position===null)guest.position=null;
   else if(Array.isArray(body.position)&&body.position.length===3&&body.position.every(v=>Number.isFinite(v)&&Math.abs(v)<=150))guest.position=body.position;
   if(Number.isFinite(body.yaw))guest.yaw=body.yaw;
   if(typeof body.area==='string')guest.area=body.area.slice(0,24);
  }else{
   if(!guest.host)return json(res,403,{error:'The host controls the shared sky and projector.'});
   const timestamp=now();
   if(body.kind==='sky'&&moonModes.has(body.sky)){
    room.sky=body.sky;
    if(body.sky==='evening'||body.sky==='dawn'){
     room.cinema=false;
     room.media={...room.media,position:where(room.media,timestamp),playing:false,updatedAt:timestamp};
    }
   }else if(body.kind==='calendar'&&validMonth(body.month)&&legalWeather.has(body.weather)){
    room.calendarMonth=body.month;room.weather=body.weather;
   }else if(body.kind==='cinema'){
    room.cinema=Boolean(body.open);
    if(room.cinema&&room.sky!=='night'&&room.sky!=='fullMoon')room.sky='night';
    if(!room.cinema)room.media={...room.media,position:where(room.media,timestamp),playing:false,updatedAt:timestamp};
   }else if(body.kind==='source'){
    const source=videoURL(body.url);
    if(!source)return json(res,400,{error:'Use a /media/ video path or an HTTPS video URL.'});
    room.media={url:source,playing:false,position:0,updatedAt:timestamp};
   }else if(body.kind==='playback'&&room.media.url){
    const position=Number(body.position);
    if(!Number.isFinite(position)||position<0||position>86400)return json(res,400,{error:'Invalid playback time.'});
    room.media={...room.media,position,playing:Boolean(body.playing),updatedAt:timestamp};
    if(room.media.playing){room.cinema=true;if(!['night','fullMoon'].includes(room.sky))room.sky='night';}
   }else return json(res,400,{error:'Unknown room action.'});
  }
  guest.seen=now();room.touched=now();json(res,200,{ok:true});broadcast(room);
 }catch(error){
  if(!res.headersSent)json(res,error.status||500,{error:error.status?error.message:'The room server could not complete that request.'});
  else res.end();
 }
});
setInterval(()=>{
 const time=now();
 for(const [key,room] of rooms){
  for(const [token,guest] of room.guests){
   if(guest.stream){
    if(guest.stream.writableLength>64_000)guest.stream.destroy();
    else guest.stream.write(': heartbeat\n\n');
   }else if(!guest.host&&time-guest.seen>liveFor)room.guests.delete(token);
  }
  if(![...room.guests.values()].some(g=>g.stream)&&time-room.touched>roomLifetime)rooms.delete(key);
  else broadcast(room);
 }
},15_000).unref();
server.listen(Number(process.env.PORT)||8080,process.env.HOST||'127.0.0.1',()=>console.log('Little Stream room server listening on port '+server.address().port));
