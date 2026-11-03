/* Shared simulation clock: no setTimeout or per-eye animation state. */
(function(root){
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const base={lid:0,lower:0,tilt:0,pupil:1,sleep:0,shimmer:0,breath:.03,hz:.4,follow:9,micro:1.5,close:.07,hold:.02,open:.16,interval:[3.5,5.5],double:.15,gaze:[0,0]};
const presets={
NORMAL:{label:'平常',description:'放松注视，轻微巡视和自然眨眼。'},
HAPPY:{label:'开心',description:'柔和笑眼，瞳孔放大，高光轻轻呼吸。',lid:.12,lower:.24,pupil:1.1,shimmer:1,close:.12,open:.23},
BEING_HUGGED:{label:'被抱',description:'仰望靠近的人，偶尔移开视线，再转回来。',pupil:1.2,gaze:[0,-.6],double:.35},
SLEEPY:{label:'困倦',description:'半睁眼，视线低垂，缓慢而沉重地眨眼。',lid:.55,breath:.012,hz:.16,follow:2,micro:0,gaze:[0,.4],close:.2,hold:.2,open:.35,interval:[8,12],double:0},
SLEEPING:{label:'睡眠',description:'毛绒眼皮闭合，柔和眼缝随呼吸起伏。',lid:1,sleep:1,micro:0,breath:0,follow:2,double:0},
CURIOUS:{label:'好奇',description:'专注倾听，先凝视两秒，然后轻眨一下。',pupil:1.08,gaze:[.25,-.35],micro:0,double:0},
SURPRISED:{label:'惊讶',description:'快速收瞳，看向声音来源，短促微颤后恢复。',pupil:.75,follow:18,micro:0,double:0},
SULKING:{label:'傲娇',description:'轻压眼皮，带一点倾斜，故意看向一旁。',lid:.25,tilt:8,gaze:[-.85,0],close:.2,hold:.12,open:.32,interval:[6,10],double:0,micro:.5}
};
const keys=['lid','lower','tilt','pupil','sleep','shimmer','breath','hz','follow','micro'];
class EmotionEngine{
 constructor(random=Math.random){this.random=random;this.time=0;this.age=0;this.emotion='NORMAL';this.params={...base};this.from={...base};this.to={...base};this.transition=1;this.duration=.4;this.x=this.y=this.mx=this.my=0;this.target=null;this.direction=[0,-.6];this.blink=null;this.closure=0;this.nextBlink=this.range(3.5,5.5);this.nextMicro=2;this.roam=[0,0];this.nextRoam=3;this.curiousBlinked=false;this.autoSleep=true;}
 range(a,b){return a+(b-a)*this.random();}
 setEmotion(name){if(!presets[name])throw Error('Unknown emotion: '+name);this.from={...this.params};this.to={...base,...presets[name]};this.emotion=name;this.age=0;this.transition=0;this.duration=name==='SURPRISED'?.16:name==='SLEEPING'?.5:.4;this.curiousBlinked=false;this.mx=this.my=0;this.nextBlink=this.range(...this.to.interval);if(name==='SULKING')this.to.gaze=[this.direction[0]>0?-.85:.85,0];}
 setGazeTarget(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))return;const n=Math.max(1,Math.hypot(x,y));this.target=[x/n,y/n];}
 setStimulusDirection(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))return;const n=Math.max(1,Math.hypot(x,y));this.direction=[x/n,y/n];}
 triggerBlink(shallow=false){if(this.blink||this.emotion==='SLEEPING')return;this.blink={age:0,depth:shallow?.6:1,shallow,close:this.to.close,hold:this.to.hold,open:this.to.open,double:this.to.double};}
 update(dt){
 dt=Math.max(0,Math.min(dt,.1));this.time+=dt;this.age+=dt;
 if(this.emotion==='SURPRISED'&&this.age>=1.5)this.setEmotion('NORMAL');
 if(this.emotion==='SLEEPY'&&this.autoSleep&&this.age>=60)this.setEmotion('SLEEPING');
 this.transition=Math.min(1,this.transition+dt/this.duration);for(const k of keys)this.params[k]=lerp(this.from[k],this.to[k],smooth(this.transition));
 let gaze=this.to.gaze;
 if(this.emotion==='NORMAL'){this.nextRoam-=dt;if(this.nextRoam<=0){this.roam=[this.range(-.3,.3),this.range(-.18,.18)];this.nextRoam=this.range(3,6);}gaze=this.roam;}
 if(this.emotion==='BEING_HUGGED'){gaze=this.direction;if(this.age%3.1>2.5)gaze=[0,.2];}
 if(this.emotion==='SURPRISED')gaze=this.direction;
 if(this.target&&this.emotion!=='SLEEPING')gaze=this.target;
 const a=1-Math.exp(-this.params.follow*dt);this.x=lerp(this.x,gaze[0],a);this.y=lerp(this.y,gaze[1],a);
 this.mx*=Math.exp(-35*dt);this.my*=Math.exp(-35*dt);this.nextMicro-=dt;
 if(this.nextMicro<=0){if(this.params.micro>.01){this.mx=this.range(-1,1)*this.params.micro;this.my=this.range(-1,1)*this.params.micro;}this.nextMicro=this.range(2,3);}
 if(this.emotion==='SURPRISED'&&this.age<.25){const fade=1-this.age/.25;this.mx=3*fade*Math.sin(this.age*110);this.my=2*fade*Math.sin(this.age*89);}
 if(this.emotion==='CURIOUS'&&!this.curiousBlinked&&this.age>=2){this.triggerBlink();this.curiousBlinked=true;}
 if(!this.blink&&this.emotion!=='SLEEPING'&&!(this.emotion==='CURIOUS'&&this.age<2)&&this.emotion!=='SURPRISED'){this.nextBlink-=dt;if(this.nextBlink<=0)this.triggerBlink();}
 this.closure=0;
 if(this.blink){const b=this.blink;b.age+=dt;const t=b.age,total=b.close+b.hold+b.open;
 if(t<b.close)this.closure=b.depth*(t/b.close)**2;
 else if(t<b.close+b.hold)this.closure=b.depth;
 else if(t<total)this.closure=b.depth*(1-(t-b.close-b.hold)/b.open)**3;
 else if(t>=total+.065){this.blink=null;if(!b.shallow&&this.random()<b.double)this.triggerBlink(true);else this.nextBlink=this.range(...this.to.interval);}}
 return this;
 }
}
root.Koukou={EmotionEngine,presets};
if(typeof module!=='undefined')module.exports=root.Koukou;
})(typeof window!=='undefined'?window:globalThis);
