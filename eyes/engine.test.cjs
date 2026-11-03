const assert=require('node:assert/strict');
const {EmotionEngine,presets}=require('./engine.js');
const advance=(e,t)=>{for(let i=0;i<Math.round(t*1000);i++)e.update(.001);};
for(const name of Object.keys(presets)){
 const e=new EmotionEngine(()=>.5);e.setEmotion(name);advance(e,.6);
 for(const value of [e.x,e.y,e.closure,...Object.values(e.params).filter(v=>typeof v==='number')])assert(Number.isFinite(value),name);
 assert(e.closure>=0&&e.closure<=1);assert(e.params.pupil>=.75&&e.params.pupil<=1.2);
}
const s=new EmotionEngine(()=>.5);s.setEmotion('SURPRISED');advance(s,.2);assert.equal(s.params.pupil,.75);advance(s,1.8);assert.equal(s.emotion,'NORMAL');assert.equal(s.params.pupil,1);
const c=new EmotionEngine(()=>.5);c.setEmotion('CURIOUS');advance(c,1.99);assert.equal(c.blink,null);advance(c,.025);assert(c.blink);
const d=new EmotionEngine(()=>.5);d.setEmotion('SLEEPY');advance(d,60.6);assert.equal(d.emotion,'SLEEPING');assert.equal(d.params.sleep,1);
const h=new EmotionEngine(()=>.5);h.setEmotion('BEING_HUGGED');advance(h,1);assert(h.y<-.5);advance(h,1.8);assert(h.y>0);advance(h,.8);assert(h.y<-.5);
const b=new EmotionEngine(()=>0);b.triggerBlink();advance(b,.33);assert(b.blink?.shallow,'double blink follows first blink');advance(b,.4);assert.equal(b.blink,null);
const rapid=new EmotionEngine(()=>.5);rapid.setEmotion('SLEEPY');advance(rapid,.2);const old=rapid.params.lid;rapid.setEmotion('HAPPY');assert.equal(rapid.params.lid,old);advance(rapid,.001);assert(Math.abs(rapid.params.lid-old)<.001);
rapid.triggerBlink();advance(rapid,.03);const closure=rapid.closure;rapid.setEmotion('NORMAL');assert.equal(rapid.closure,closure,'switch preserves ongoing blink');
const noSleep=new EmotionEngine(()=>.5);noSleep.autoSleep=false;noSleep.setEmotion('SLEEPY');advance(noSleep,62);assert.equal(noSleep.emotion,'SLEEPY');
for(const direction of [-.85,.85]){
 const e=new EmotionEngine(()=>.5);e.setStimulusDirection(direction,-.15);e.setEmotion('BEING_HUGGED');
 advance(e,2.4);assert(Math.abs(e.x-direction)<.01);
 advance(e,.69);assert(Math.abs(e.x)*30<.2,'both directions return within 0.2px of horizontal center');
 advance(e,.7);assert(Math.abs(e.x-direction)<.01,'returns to person');
 e.setGazeTarget(0,0);advance(e,1);assert(Math.abs(e.x)<.001&&Math.abs(e.y)<.001);
}
console.log('PASS: 8 presets, timed recovery, listening hold, sleep, left/right hug recenter, double blink, interrupted transitions.');
