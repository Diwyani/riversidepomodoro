import assert from 'node:assert/strict';import {createFocusTimer} from './focus-timer.mjs';const t=createFocusTimer();t.start(0);t.tick(60000);assert.equal(t.remaining,1440);t.pause(120000);assert.equal(t.remaining,1380);t.start(150000);assert.equal(t.tick(1530000),true);assert.equal(t.phase,'break');assert.equal(t.remaining,300);assert.equal(t.running,false);t.start(1600000);assert(t.tick(1900000));assert.equal(t.phase,'work');t.reset();assert.equal(t.remaining,1500);console.log('PASS: focus countdown, pause/resume, work-to-break, break-to-work and reset.');

const custom=createFocusTimer();
assert(custom.configure(40,8));assert.equal(custom.remaining,2400);assert.equal(custom.duration,2400);
custom.start(1000);assert.equal(custom.configure(25,5),false,'Cannot change a running session');
custom.tick(121000);custom.pause(121000);assert.equal(custom.remaining,2280);
custom.start(200000);assert(custom.tick(2480000));assert.equal(custom.phase,'break');assert.equal(custom.remaining,480);
custom.start(2500000);assert(custom.tick(2980000));assert.equal(custom.phase,'work');assert.equal(custom.remaining,2400);
custom.reset();assert.equal(custom.remaining,2400);
for(const [work,rest] of [[0,5],[181,5],[25,0],[25,61],[2.5,5],[NaN,5],[25,Infinity]]){assert.equal(custom.configure(work,rest),false);assert.equal(custom.workMinutes,40);}
assert(custom.configure(1,1));assert.equal(custom.remaining,60);
console.log('PASS: editable study/break durations, configured transitions, reset, running guard and input bounds.');
