(function(){
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
function texture(){const c=document.createElement('canvas');c.width=c.height=480;const ctx=c.getContext('2d'),im=ctx.createImageData(480,480);
for(let y=0;y<480;y++)for(let x=0;x<480;x++){let dx=(x/2-120)/72,dy=(y/2-120)/84,r=Math.hypot(dx,dy);if(r>1.01)continue;let ang=Math.atan2(dy,dx),v=clamp((dy+.35)/1.3,0,1),gold=Math.pow(v,1.4);let band=Math.exp(-Math.pow((r-.84)/.16,2));let col=[mix(25,240,gold),mix(23,167,gold),mix(34,12,gold)];
let weave=(Math.pow((Math.cos(x*.31+y*.23)+1)/2,4)+Math.pow((Math.cos(x*.31-y*.23)+1)/2,4))*.025;let fibers=Math.sin(ang*113+r*23)*.006+Math.sin(ang*67-r*18)*.006;
let light=(.58+.55*band)*(1+weave+fibers);let rim=clamp((r-.935)/.065,0,1);for(let k=0;k<3;k++)col[k]=mix(col[k]*light,[12,10,17][k],rim);let i=(y*480+x)*4;im.data[i]=col[0];im.data[i+1]=col[1];im.data[i+2]=col[2];im.data[i+3]=255*clamp((1.006-r)*150,0,1);}
ctx.putImageData(im,0,0);const softened=document.createElement('canvas');softened.width=softened.height=480;const sc=softened.getContext('2d');sc.filter='blur(1.2px)';sc.drawImage(c,0,0);return softened;}const iris=texture();
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
function glow(ctx,x,y,rx,ry,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor='#aaa7ff';ctx.shadowBlur=5;ctx.filter='blur(2px)';ellipse(ctx,x,y,rx,ry,'#fbffff');ctx.shadowBlur=0;ctx.filter='blur(1.2px)';ellipse(ctx,x,y,rx*.78,ry*.78,'#ffffff');ctx.restore();}

const lid={color:'#756553'};
const plush=document.createElement('canvas');plush.width=plush.height=480;let plushColor='';
function buildPlush(){if(plushColor===lid.color)return;plushColor=lid.color;const p=plush.getContext('2d');p.fillStyle=lid.color;p.fillRect(0,0,480,480);let seed=9137;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // Broad soft tufts beneath the fine pile give the fabric larger clumps.
 for(let i=0;i<2200;i++){let x=rnd()*480,y=rnd()*480,r=2.5+rnd()*4.5;let g=p.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rnd()>.5?'rgba(255,244,219,.18)':'rgba(27,19,14,.19)');g.addColorStop(1,'rgba(0,0,0,0)');p.fillStyle=g;p.fillRect(x-r,y-r,2*r,2*r);}
 p.lineCap='round';for(let i=0;i<19000;i++){let x=rnd()*480,y=rnd()*480,a=rnd()*Math.PI*2,len=1.2+rnd()*4.2;p.strokeStyle=rnd()>.5?'rgba(255,247,230,.13)':'rgba(30,22,18,.15)';p.lineWidth=.7+rnd()*.9;p.beginPath();p.moveTo(x,y);p.quadraticCurveTo(x+Math.cos(a+.5)*len*.6,y+Math.sin(a+.5)*len*.6,x+Math.cos(a)*len,y+Math.sin(a)*len);p.stroke();}
 const stage=document.querySelector('#stage');
  if(stage){
    if(stage.dataset.transparent === 'true'){
      stage.style.backgroundImage='none';
      stage.style.backgroundColor='transparent';
    } else {
      stage.style.backgroundImage=`url(${plush.toDataURL()})`;
      stage.style.backgroundSize='240px 240px';
    }
  }
}
window.setKoukouLidColor=function(color){lid.color=color;buildPlush();};
const initStage=document.querySelector('#stage');
if(initStage && initStage.dataset.transparent==='true'){lid.color='#020617';}

buildPlush();

function curve(c,y,bend,tilt){
 c.moveTo(-4,y-tilt);c.bezierCurveTo(76,y+bend-tilt/3,164,y+bend+tilt/3,244,y+tilt);
}
function eyelids(c,e,side){
 const p=e.params,q=e.closure,base=-16+260*p.lid,y=mix(base,258,q),bend=14*(1-q),tilt=p.tilt*side*(1-q);
 c.save();c.beginPath();c.moveTo(-4,-4);c.lineTo(244,-4);c.lineTo(244,y+tilt);
 c.bezierCurveTo(164,y+bend+tilt/3,76,y+bend-tilt/3,-4,y-tilt);c.closePath();c.clip();c.drawImage(plush,0,0,240,240);c.restore();
 c.lineCap='round';
 for(let offset=16;offset>=0;offset--){c.beginPath();curve(c,y+offset,bend,tilt);c.strokeStyle='rgba(15,12,10,'+(.88*Math.pow(1-offset/17,1.5))+')';c.lineWidth=2;c.stroke();}
 if(p.lower>.001){
 const lowerY=252-p.lower*170;
 c.save();c.beginPath();c.moveTo(-4,244);c.lineTo(244,244);c.lineTo(244,lowerY);
 c.bezierCurveTo(164,lowerY-38,76,lowerY-38,-4,lowerY);c.closePath();c.clip();c.drawImage(plush,0,0,240,240);c.restore();
 c.beginPath();curve(c,lowerY,-38,0);c.strokeStyle='rgba(30,22,17,.7)';c.lineWidth=3;c.stroke();
 }
 // A separate seam remains visible after the moving lid passes below the globe.
 if(p.sleep>0){
 c.save();c.globalAlpha=p.sleep;c.drawImage(plush,0,0,240,240);
 const rise=Math.sin(e.time*2*Math.PI*.25);
 c.shadowColor='rgba(15,12,10,.45)';c.shadowBlur=3;c.strokeStyle='#30251d';c.lineWidth=4;
 c.beginPath();c.moveTo(43,128+rise);c.bezierCurveTo(82,143+rise,158,143+rise,197,128+rise);c.stroke();c.restore();
 }
}
window.renderKoukouEmotion=function(canvas,e,side){
 const c=canvas.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,240,240);c.save();c.beginPath();c.arc(120,120,119,0,Math.PI*2);c.clip();c.fillStyle='#060609';c.fillRect(0,0,240,240);
 const white=c.createRadialGradient(109,96,30,120,120,120);white.addColorStop(0,'#fffff2');white.addColorStop(.64,'#f7f6e9');white.addColorStop(.87,'#deddd2');white.addColorStop(1,'#85857e');ellipse(c,120,125,118,112,white);
 // Both globes use the same centered coordinate system, without inward bias.
 let dx=e.x*28+e.mx,dy=e.y*12+e.my;
 const envelope=Math.max(1,Math.hypot(dx/32,dy/22));dx/=envelope;dy/=envelope;
 const cx=120+dx,cy=120+dy;
 c.drawImage(iris,cx-120,cy-120,240,240);
 const p=e.params,breathe=1+p.breath*Math.sin(e.time*2*Math.PI*p.hz),scale=Math.min(1.24,p.pupil*breathe);
 const px=cx+e.x*2,py=cy+e.y*2;
 // Clip all pupil and reflection pixels to the same iris footprint.
 c.save();c.beginPath();c.ellipse(cx,cy,72,84,0,0,Math.PI*2);c.clip();
 const pupil=c.createLinearGradient(0,py-57*scale,0,py+57*scale);pupil.addColorStop(0,'#222632');pupil.addColorStop(.50,'#100d10');pupil.addColorStop(.78,'#100a0d');pupil.addColorStop(1,'#261723');
 ellipse(c,px,py,49*scale,57*scale,pupil);
 const hx=cx+e.x*.7,hy=cy+e.y*.7,alpha=1-p.shimmer*(.1+.1*Math.sin(e.time*2*Math.PI*.55));
 glow(c,hx,hy-71,20.5,11.6,alpha);glow(c,hx+28,hy+47,5.5,6,alpha);glow(c,hx+37,hy+35,2.7,2.7,alpha);glow(c,hx+20,hy+52,1.9,2.5,.9*alpha);
 c.restore();eyelids(c,e,side);c.restore();
};
})();
