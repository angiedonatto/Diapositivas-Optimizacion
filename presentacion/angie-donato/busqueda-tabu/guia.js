(() => {
  const deck = document.querySelector('.section-deck');
  const stage = document.getElementById('stage');
  const slides = [...deck.querySelectorAll('.lo-slide')].map(slide => {
    const fragments = [...slide.querySelectorAll('[data-f]')];
    return { slide, fragments, total: Math.max(...fragments.map(fragment => Number(fragment.dataset.f))) };
  });
  const notes = document.getElementById('notes');
  const notesButton = document.getElementById('notesBtn');
  const notesSections = [...notes.querySelectorAll('[data-notes]')];
  const previous = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const count = document.getElementById('count');
  const cue = document.getElementById('cue');
  const maze = document.getElementById('maze');
  const mazeDescriptions = [
    'Laberinto con entrada abajo a la izquierda, un callejón en el centro y la salida arriba a la derecha.',
    'El personaje retrocede hasta el cruce. Las flechas ámbar muestran cómo podría repetir el mismo camino.',
    'El personaje recuerda el camino al callejón. Un tramo rojo marca la vuelta que evita temporalmente.',
    'El personaje toma la ruta verde. Primero baja, alejándose de la salida, y luego sube hacia ella.'
  ];
  const deepLink = location.hash.match(/^#tabu-([1-3])$/);
  let index = deepLink ? Number(deepLink[1]) - 1 : 0;
  let appearance = 1;

  function status() {
    return {
      current: index + 1,
      total: slides.length,
      atStart: index === 0 && appearance === 1,
      atEnd: index === slides.length - 1 && appearance === slides[index].total
    };
  }

  function render() {
    for (const [position, { slide, fragments, total }] of slides.entries()) {
      const active = position === index;
      slide.classList.toggle('is-current', active);
      slide.setAttribute('aria-hidden', String(!active));
      notesSections[position].hidden = !active;
      if (!active) continue;
      slide.dataset.appearance = appearance;
      for (const fragment of fragments) {
        const revealed = Number(fragment.dataset.f) <= appearance;
        fragment.classList.toggle('is-in', revealed);
        fragment.setAttribute('aria-hidden', String(!revealed));
        if (Number(fragment.dataset.f) === appearance) cue.textContent = fragment.dataset.cue;
      }
      slide.querySelector('.local-position').textContent = (index + 1) + ' / ' + slides.length + ' · ' + appearance + ' / ' + total;
    }

    if (index === 1) maze.setAttribute('aria-label', mazeDescriptions[Math.min(appearance, 4) - 1]);

    const info = status();
    previous.disabled = info.atStart;
    next.textContent = info.atEnd ? 'Componentes · Angie Loango →' : 'Siguiente →';
    count.textContent = info.current + ' / ' + info.total;
    if (window.parent === window) history.replaceState(null, '', '#tabu-' + (index + 1));
  }

  function move(direction) {
    const last = slides[index].total;
    if (direction === 'next') {
      if (appearance < last) appearance++;
      else if (index < slides.length - 1) {
        index++;
        appearance = 1;
      } else return;
    } else if (appearance > 1) appearance--;
    else if (index > 0) {
      index--;
      appearance = slides[index].total;
    } else return;
    render();
  }

  function reset(atEnd) {
    index = atEnd ? slides.length - 1 : 0;
    appearance = atEnd ? slides[index].total : 1;
    render();
  }

  function advance() {
    if (status().atEnd) location.href = '../../angie-loango/busqueda-tabu/index.html';
    else move('next');
  }

  deck.slideNavigation = { status, move, reset };
  previous.addEventListener('click', () => move('prev'));
  next.addEventListener('click', advance);

  notesButton.addEventListener('click', () => {
    notes.hidden = !notes.hidden;
    notesButton.setAttribute('aria-expanded', String(!notes.hidden));
    notesButton.textContent = notes.hidden ? 'Notas para ensayar (N)' : 'Ocultar notas (N)';
  });

  const fullButton = document.getElementById('fullBtn');
  fullButton.addEventListener('click', () => {
    const toggle = document.fullscreenElement ? document.exitFullscreen() : stage.requestFullscreen?.();
    toggle?.catch(() => {});
  });

  document.addEventListener('keydown', event => {
    if (document.documentElement.classList.contains('projected') ||
        event.repeat || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey ||
        event.target.closest?.('input, textarea, select, [contenteditable]')) return;

    const key = event.key.toLowerCase();
    if (key === ' ' && event.target.closest?.('button, a')) return;
    if (['arrowright', 'pagedown', ' '].includes(key)) advance();
    else if (['arrowleft', 'pageup'].includes(key)) move('prev');
    else if (key === 'f') fullButton.click();
    else if (key === 'n') notesButton.click();
    else return;
    event.preventDefault();
  });

  SlideCanvas.fit(stage, document.getElementById('tabuCanvas'));
  render();
})();
