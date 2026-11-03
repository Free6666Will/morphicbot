// Website-only input/accessibility extensions. Original previews stay untouched.
const stage = document.getElementById('stage');
const mode = document.getElementById('gazeMode');
function point(event) {
  if (mode.value !== 'pointer') return;
  const r = stage.getBoundingClientRect();
  SetGazeTarget((event.clientX-r.left-r.width/2)/(r.width/2),
    (event.clientY-r.top-r.height/2)/(r.height/2));
}
stage.addEventListener('pointerdown', event => {
  if (mode.value !== 'pointer') return;
  stage.setPointerCapture(event.pointerId);
  point(event);
});
mode.addEventListener('change', () => {
  stage.style.touchAction = mode.value === 'pointer' ? 'none' : 'pan-y';
});
document.getElementById('center').addEventListener('click', () => {stage.style.touchAction='none';});
document.getElementById('emotions').addEventListener('click', () => {stage.style.touchAction='pan-y';});
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.getElementById('pause').checked = true;
}
