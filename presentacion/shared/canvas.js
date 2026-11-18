/* Escala una sola vez el lienzo lógico dentro de su espacio disponible. */
window.SlideCanvas = {
  fit(viewport, canvas, frame = canvas) {
    const resize = () => {
      const scale = Math.min(viewport.clientWidth / 1600, viewport.clientHeight / 900);
      frame.style.setProperty('--slide-width', (1600 * scale) + 'px');
      frame.style.setProperty('--slide-height', (900 * scale) + 'px');
      canvas.style.setProperty('--slide-scale', scale);
    };
    new ResizeObserver(resize).observe(viewport);
    resize();
  }
};
