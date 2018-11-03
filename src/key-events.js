const isKeyDown = {};

window.addEventListener('keydown', e => {
  if(!e.repeat) {
    if(!isKeyDown[e.key]) {
      window.dispatchEvent(new CustomEvent('key-event-down-norepeat', { detail: e }));
    }
    isKeyDown[e.key] = true;
  }
});

window.addEventListener('keyup', e => {
  isKeyDown[e.key] = false;
});
