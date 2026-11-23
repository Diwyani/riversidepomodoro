export function createFocusTimer(){
 let workMinutes=25,breakMinutes=5,phase='work',remaining=workMinutes*60,running=false,deadline=0;
 return{
  get phase(){return phase;},get remaining(){return remaining;},get running(){return running;},
  get workMinutes(){return workMinutes;},get breakMinutes(){return breakMinutes;},
  get duration(){return(phase==='work'?workMinutes:breakMinutes)*60;},
  configure(work,rest){
   if(running||!Number.isInteger(work)||!Number.isInteger(rest)||work<1||work>180||rest<1||rest>60)return false;
   workMinutes=work;breakMinutes=rest;phase='work';remaining=workMinutes*60;return true;
  },
  start(now){if(!running){running=true;deadline=now+remaining*1000;}},
  pause(now){if(running){remaining=Math.max(0,(deadline-now)/1000);running=false;}},
  reset(){phase='work';remaining=workMinutes*60;running=false;},
  tick(now){
   if(!running)return false;remaining=Math.max(0,(deadline-now)/1000);
   if(remaining===0){running=false;phase=phase==='work'?'break':'work';remaining=(phase==='work'?workMinutes:breakMinutes)*60;return true;}
   return false;
  }
 };
}
