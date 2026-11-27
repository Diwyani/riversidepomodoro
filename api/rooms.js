import {createRoomService} from '../lib/room-service.mjs';
const handle=createRoomService();
export default async function rooms(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const url=new URL(req.url,'https://riverside.invalid');
 const configured=Boolean((process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL)&&(process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN));
 if(req.method==='GET'){res.statusCode=configured?200:503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({configured,capacity:2,transport:'poll'}));return;}
 if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','GET, POST');res.end();return;}
 // Reject cross-site JSON posts. Same-origin browser clients need no extra configuration.
 if(req.headers.origin&&req.headers.origin!==`https://${req.headers.host}`&&req.headers.origin!==`http://${req.headers.host}`){res.statusCode=403;res.end(JSON.stringify({error:'Use the room controls on this site.'}));return;}
 let body;try{
  if(typeof req.body==='object'&&req.body!==null)body=req.body;
  else if(typeof req.body==='string'){if(Buffer.byteLength(req.body)>8192)throw Error();body=JSON.parse(req.body);}
  else {const parts=[];let size=0;for await(const part of req){size+=part.length;if(size>8192)throw Error();parts.push(part);}body=JSON.parse(Buffer.concat(parts).toString());}
 }catch{res.statusCode=400;res.end(JSON.stringify({error:'Invalid room request.'}));return;}
 const suffix=url.searchParams.get('roomPath');
 const path=suffix?'/api/rooms/'+suffix:url.pathname.replace(/\/$/,'');
 const result=await handle({method:req.method,path,body});res.statusCode=result.status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result.body));
}
