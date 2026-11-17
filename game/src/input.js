// Input Management

const keys = {};
const mouse = { x: 0, y: 0, down: false, clicked: false };

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    keys[e.key.toLowerCase()] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', (e) => {
    mouse.down = true;
    mouse.clicked = true;
  });

  canvas.addEventListener('mouseup', () => {
    mouse.down = false;
  });
}

export function isKeyPressed(code) {
  return !!keys[code];
}

export function getMouseState() {
  const clicked = mouse.clicked;
  mouse.clicked = false; // consume single click
  return { x: mouse.x, y: mouse.y, down: mouse.down, clicked };
}
