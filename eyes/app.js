const engine=new Koukou.EmotionEngine();
const $=id=>document.getElementById(id);
for(const [name,preset] of Object.entries(Koukou.presets)){
 const button=document.createElement('button');button.textContent=preset.label;button.dataset.emotion=name;button.onclick=()=>SetEmotion(name);$('emotions').append(button);
}
window.SetEmotion=name=>{engine.target=null;$('gazeMode').value='emotion';engine.setEmotion(name);syncUI();};
window.SetGazeTarget=(x,y)=>engine.setGazeTarget(x,y);
window.SetStimulusDirection=(x,y)=>engine.setStimulusDirection(x,y);
window.TriggerBlink=()=>engine.triggerBlink();
function syncUI(){
 for(const b of $('emotions').children)b.setAttribute('aria-pressed',String(b.dataset.emotion===engine.emotion));
 $('description').textContent=Koukou.presets[engine.emotion].description;
}
$('blink').onclick=TriggerBlink;
$('center').onclick=()=>{engine.target=[0,0];engine.x=engine.y=engine.mx=engine.my=0;$('gazeMode').value='pointer';};
$('gazeMode').onchange=()=>{engine.target=$('gazeMode').value==='pointer'?[0,0]:null;};
$('stage').onpointermove=ev=>{
 if($('gazeMode').value!=='pointer')return;
 const r=$('stage').getBoundingClientRect();SetGazeTarget((ev.clientX-r.left-r.width/2)/(r.width/2),(ev.clientY-r.top-r.height/2)/(r.height/2));
};
$('direction').onchange=()=>{const dirs={front:[0,-.6],left:[-.85,-.15],right:[.85,-.15]};SetStimulusDirection(...dirs[$('direction').value]);if(engine.emotion==='SULKING')SetEmotion('SULKING');};
$('autoSleep').onchange=()=>engine.autoSleep=$('autoSleep').checked;
let last=performance.now(),previous=engine.emotion;
function frame(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!$('pause').checked)engine.update(dt*Number($('speed').value));
 renderKoukouEmotion($('left'),engine,1);renderKoukouEmotion($('right'),engine,-1);
 if(previous!==engine.emotion){syncUI();previous=engine.emotion;}
 $('status').textContent=Koukou.presets[engine.emotion].label+' · Upper Lid '+Math.round(engine.params.lid*100)+'% · Pupil '+Math.round(engine.params.pupil*100)+'% · '+($('pause').checked?'Paused':$('speed').value==='0.2'?'0.2x Slow-Mo':'1x Normal Speed');
 requestAnimationFrame(frame);
}
syncUI();requestAnimationFrame(frame);
