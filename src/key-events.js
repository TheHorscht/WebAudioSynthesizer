const isKeyDown = {};

window.addEventListener('keydown', e => {
  if(!e.repeat) {
    if(!isKeyDown[e.code]) {
      window.dispatchEvent(new CustomEvent('key-event-down-norepeat', { detail: e }));
    }
    isKeyDown[e.code] = true;
  }
});

window.addEventListener('keyup', e => {
  if(isKeyDown[e.code]) {
    window.dispatchEvent(new CustomEvent('key-event-up', { detail: e }));
  }
  isKeyDown[e.code] = false;
});
