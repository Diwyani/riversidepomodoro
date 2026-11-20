export function mountRoom({root,T,world,getView,setSky,setSeason,enterCinema}){
 const find=selector=>root.querySelector(selector);
 const panel=find('[data-room-panel]'),toggle=find('[data-room-toggle]');
 const status=find('[data-room-status]'),count=find('[data-room-count]');
 const nameField=find('[data-room-name]'),joinButton=find('[data-room-join]');
 const inviteField=find('[data-room-invite]'),sourceField=find('[data-room-source]');
 const seek=find('[data-room-seek]'),play=find('[data-room-play]');
 const movie=document.createElement('video');
 movie.playsInline=true;movie.preload='metadata';movie.crossOrigin='anonymous';movie.muted=true;
 const movieTexture=new T.VideoTexture(movie);movieTexture.colorSpace=T.SRGBColorSpace;
 const material=world.movieScreen.material,originalColor=material.color.clone();
 const avatars=new Map();
 const bodyGeometry=new T.CapsuleGeometry(.19,.69,3,10);
 const headGeometry=new T.SphereGeometry(.15,12,8);
 const palette=[0xeaa986,0xa6bec1,0xb2a8d2,0xe0c285,0xc69ca5];
 const requestRoom=new URL(location.href).searchParams.get('room')||'';
 let invite=/^[0-9a-f]{24}$/.test(requestRoom)?requestRoom:'';
 let membership,events,state,clockOffset=0,networkBusy=false;
 let loadedURL='',enabled=false,lastRoster='';
 const readSaved=()=>{try{return JSON.parse(sessionStorage.getItem('little-stream-room')||'null');}catch{return null;}};
 const save=value=>{try{if(value)sessionStorage.setItem('little-stream-room',JSON.stringify(value));else sessionStorage.removeItem('little-stream-room');}catch{}};
 function showPanel(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}
 function describe(text){if(status.textContent!==text)status.textContent=text;}
 async function post(path,data){
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result)throw new Error(result?.error||'Run the Little Stream room server to use invitations.');
  return result;
 }
 function send(kind,data={}){
  if(!membership)return Promise.resolve();
  const {room,token}=membership;
  return post('/api/rooms/'+room+'/update',{token,kind,...data});
 }
 function sendControl(kind,data){
  return send(kind,data).catch(error=>describe(error.message));
 }
 function timeAt(media){
  return media.position+(media.playing?Math.max(0,Date.now()+clockOffset-media.updatedAt)/1000:0);
 }
 function videoSync(){
  if(document.hidden||!state?.media.url||!enabled||!state.cinema||movie.readyState<1){movie.pause();return;}
  const media=state.media,target=Math.min(Number.isFinite(movie.duration)?movie.duration:86400,timeAt(media));
  if(Math.abs(target-movie.currentTime)>(media.playing?.65:.10))movie.currentTime=target;
  if(media.playing&&movie.paused&&!movie.ended)movie.play().catch(()=>describe('Use Enable playback to start video on this device.'));
  else if(!media.playing&&!movie.paused)movie.pause();
 }
 function drawRoster(people){
  const label=people.length+' here';
  if(count.textContent!==label)count.textContent=label;
  count.hidden=false;
  const key=JSON.stringify(people.map(person=>[person.id,person.name,person.area,person.host]));
  if(key===lastRoster)return;
  lastRoster=key;
  find('[data-room-roster]').replaceChildren(...people.map(person=>{
   const item=document.createElement('li');
   item.textContent=person.name+(person.id===membership.id?' (you)':'')+(person.host?' · host':'')+(person.area?' · '+person.area:'');
   return item;
  }));
 }
 function updateAvatars(people){
  const active=new Set();
  for(const person of people){
   if(person.id===membership.id||!person.position)continue;
   active.add(person.id);
   let avatar=avatars.get(person.id);
   if(!avatar){
    const group=new T.Group();group.name=person.name;
    const material=new T.MeshLambertMaterial({color:palette[Number.parseInt(person.id.slice(0,2),16)%palette.length],emissive:0x82708c,emissiveIntensity:.24});
    const body=new T.Mesh(bodyGeometry,material);body.position.y=.67;group.add(body);
    const head=new T.Mesh(headGeometry,material);head.position.y=1.36;group.add(head);
    const target=new T.Vector3().fromArray(person.position);target.y-=1.58;
    group.position.copy(target);world.scene.add(group);
    avatar={group,target,material};avatars.set(person.id,avatar);
   }
   avatar.target.fromArray(person.position);avatar.target.y-=1.58;avatar.group.rotation.y=person.yaw;
  }
  for(const [id,avatar] of avatars){
   if(active.has(id))continue;
   avatar.group.removeFromParent();avatar.material.dispose();avatars.delete(id);
  }
 }
 function apply(next){
  state=next;
  setSky(state.sky);
  if(state.season)setSeason(state.season,state.calendarMonth,state.weather);
  world.setCinemaOpen(state.cinema);world.projectorBeam.visible=state.cinema;
  drawRoster(state.people);updateAvatars(state.people);
  if(state.media.url!==loadedURL){
   loadedURL=state.media.url;
   movie.pause();
   if(loadedURL)movie.src=loadedURL;
   else{movie.removeAttribute('src');movie.load();}
   material.map=loadedURL?movieTexture:null;
   material.emissiveMap=loadedURL?movieTexture:null;
   if(loadedURL)material.color.set(0xffffff);else material.color.copy(originalColor);
   material.needsUpdate=true;
  }
  play.disabled=!state.media.url;
  seek.disabled=!state.media.url;
  play.textContent=state.media.playing?'Pause for everyone':'Play for everyone';
  find('[data-room-view]').disabled=!state.cinema;
  find('[data-room-enable]').disabled=!state.media.url;
  find('[data-room-cinema]').textContent=state.cinema?'Close projector':'Open projector';
  find('[data-room-media]').hidden=!state.media.url;
  videoSync();
 }
 function updateInvite(){
  const link=new URL(location.href);link.search='';link.hash='';link.searchParams.set('room',membership.room);
  inviteField.value=link.href;
 }
 function connect(session,startedAt){
  const {state:initial,...credentials}=session;
  membership=credentials;clockOffset=initial.serverTime-(startedAt+Date.now())/2;
  save(credentials);
  const link=new URL(location.href);link.searchParams.set('room',membership.room);history.replaceState(null,'',link);
  find('[data-room-entrance]').hidden=true;find('[data-room-live]').hidden=false;
  find('[data-room-host]').hidden=!membership.host;
  updateInvite();apply(initial);
  events=new EventSource('/api/rooms/'+membership.room+'/events?token='+encodeURIComponent(membership.token));
  events.onopen=()=>describe('Connected');
  events.onmessage=event=>apply(JSON.parse(event.data));
  events.onerror=()=>describe('Connection interrupted. Trying to reconnect…');
  describe('Connecting…');
  reportPosition();
 }
 async function joinRoom(token){
  if(networkBusy||membership)return;
  networkBusy=true;joinButton.disabled=true;
  try{
   const startedAt=Date.now(),view=getView();
   const session=await post(invite?'/api/rooms/'+invite+'/join':'/api/rooms',{
    name:nameField.value,sky:view.sky,calendarMonth:view.calendarMonth,weather:view.weather,token
   });
   connect(session,startedAt);
  }catch(error){describe(error.message);}
  finally{networkBusy=false;joinButton.disabled=false;}
 }
 function reportPosition(){
  if(!membership)return;
  const view=getView();
  send('presence',{position:view.position.map(n=>Math.round(n*100)/100),yaw:view.yaw,area:view.area}).catch(error=>{
   describe(error.message);
   if(/expired|join the room/i.test(error.message))clearRoom(false);
  });
 }
 function clearRoom(notify=true){
  if(!membership)return;
  const {room,token}=membership;
  if(notify)post('/api/rooms/'+room+'/leave',{token}).catch(()=>{});
  events?.close();updateAvatars([]);membership=null;state=null;enabled=false;loadedURL='';lastRoster='';
  movie.pause();movie.removeAttribute('src');movie.load();material.map=null;material.emissiveMap=null;material.color.copy(originalColor);material.needsUpdate=true;
  count.hidden=true;find('[data-room-live]').hidden=true;find('[data-room-entrance]').hidden=false;
  invite='';joinButton.textContent='Create room';save(null);
  const link=new URL(location.href);link.searchParams.delete('room');history.replaceState(null,'',link);
  world.setCinemaOpen(false);world.projectorBeam.visible=false;
  if(notify)describe('You left the room.');
 }
 toggle.onclick=()=>showPanel(panel.hidden);
 joinButton.textContent=invite?'Join room':'Create room';
 find('[data-room-form]').onsubmit=event=>{event.preventDefault();joinRoom();};
 find('[data-room-leave]').onclick=()=>clearRoom();
 find('[data-room-copy]').onclick=async()=>{
  try{await navigator.clipboard.writeText(inviteField.value);describe('Invite link copied.');}
  catch{inviteField.focus();inviteField.select();describe('Copy the selected invite link.');}
 };
 find('[data-room-source-form]').onsubmit=event=>{
  event.preventDefault();sendControl('source',{url:sourceField.value.trim()});
 };
 find('[data-room-cinema]').onclick=()=>sendControl('cinema',{open:!state.cinema});
 function enablePlayback(){
  enabled=true;movie.muted=false;
  const mediaAtClick=state?.media;
  movie.play().then(()=>{
   if(!state?.media.playing)movie.pause();
   else videoSync();
   find('[data-room-enable]').textContent='Playback enabled';
  }).catch(()=>{
   if(mediaAtClick?.url)describe('Video could not start yet. Try Enable playback after the video is ready.');
  });
 }
 find('[data-room-enable]').onclick=enablePlayback;
 find('[data-room-view]').onclick=()=>{if(state?.cinema){if(state.media.url)enablePlayback();enterCinema();showPanel(false);}};
 play.onclick=()=>{
  if(!state?.media.url)return;
  const media=state.media,parking=media.playing?timeAt(media):media.position;
  enabled=true;movie.muted=false;
  if(!media.playing&&movie.readyState>=1){
   movie.currentTime=Math.min(parking,Number.isFinite(movie.duration)?movie.duration:parking);
   movie.play().catch(()=>{});
  }
  sendControl('playback',{playing:!media.playing,position:parking});
 };
 find('[data-room-seek-form]').onsubmit=event=>{
  event.preventDefault();
  if(state?.media.url)sendControl('playback',{playing:state.media.playing,position:Number(seek.value)});
 };
 movie.onloadedmetadata=()=>{describe('Video ready');if(!Number.isNaN(movie.duration))seek.max=movie.duration;videoSync();};
 movie.onerror=()=>{if(loadedURL)describe('Video unavailable. Check the file format, URL, and cross-origin access.');};
 movie.onended=()=>{if(membership?.host&&state?.media.playing)sendControl('playback',{playing:false,position:movie.duration});};
 setInterval(()=>{reportPosition();videoSync();},1000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)movie.pause();else videoSync();});
 const saved=readSaved();
 if(invite){
  showPanel(true);
  if(saved?.room===invite){nameField.value=saved.name;joinRoom(saved.token);}
  else describe('Enter a name to join your friend.');
 }
 return {
  get active(){return Boolean(membership);},
  get cinemaOpen(){return Boolean(state?.cinema);},
  changeSky(sky){
   if(!membership)return false;
   if(membership.host)sendControl('sky',{sky});else describe('The host controls the shared sky.');
   return true;
  },
  changeCalendar(month,weather){
   if(!membership)return false;
   if(membership.host)sendControl('calendar',{month,weather});
   else {showPanel(true);describe('The host controls the shared calendar and weather.');}
   return true;
  },
  requestCinema(){
   if(!membership||state?.cinema)return;
   if(membership.host)sendControl('cinema',{open:true});
   else{showPanel(true);describe('Ask the host to open the projector.');}
  },
  advance(dt){
   if(!avatars.size)return;
   const [x,,z]=getView().position;
   for(const {group,target} of avatars.values()){
    group.position.lerp(target,1-Math.exp(-dt*10));
    group.visible=Math.hypot(group.position.x-x,group.position.z-z)>.45;
   }
  }
 };
}
