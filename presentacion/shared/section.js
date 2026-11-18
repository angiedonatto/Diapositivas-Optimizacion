/* Bloques académicos que comparten la composición de las diapositivas de Loango. */
window.sectionReady = (async () => {
  const source = document.querySelector('.study-page');
  const panel = source?.querySelector('.panel[data-m]');
  const deck = document.querySelector('.section-deck');
  if (panel && new URLSearchParams(location.search).has('estudio') && window.parent === window) {
    source.hidden = false;
    return;
  }

  if (panel) {
    const [letter, topic] = panel.querySelector('.label').textContent.trim().split(' · ');
    const canvas = deck.querySelector('.slide-canvas');
    canvas.dataset.algo = panel.dataset.m;

    function addSlide(title, items, layout = '') {
      const slide = document.querySelector('#section-slide').content.cloneNode(true);
      slide.querySelector('.lo-s-letter').textContent = letter;
      slide.querySelector('.section-topic').textContent = topic;
      slide.querySelector('.lo-s-title').textContent = title;
      const body = slide.querySelector('.lo-s-body');
      if (layout) body.classList.add(layout);
      for (const item of items) {
        const card = document.createElement('div');
        card.className = 'lo-c section-card';
        const copy = item.cloneNode(true);
        const heading = copy.querySelector('h3');
        if (heading?.textContent === title) heading.remove();
        if (copy.matches('.card, .idea')) card.append(...copy.childNodes);
        else card.append(copy);
        body.append(card);
      }
      canvas.append(slide);
    }

    function addAnalysis(sourcePanel) {
      const hero = sourcePanel.querySelector('.hero');
      const stack = sourcePanel.querySelector('.stack');
      const focus = stack.querySelector('.card.focus');
      addSlide(hero.querySelector('h3').textContent, [hero.querySelector('.stat-row')]);
      addSlide('Ventajas y limitaciones', stack.querySelectorAll('.pros, .cons'), 'slide-columns');
      addSlide(focus.querySelector('h3').textContent, [focus], 'section-focus');
      addSlide('Comparación y aplicación', stack.querySelectorAll(':scope > .grid-2 > .card:not(.pros, .cons)'), 'slide-columns');
      addSlide('Conclusión', [stack.querySelector('.closer')]);
    }

    const originalUrl = new URL('../index.html', location.href);
    try {
      // Los cuatro temas reutilizan el texto y las tablas del original.
      const response = await fetch(originalUrl, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error('No se pudo cargar la comparación');
      const original = new DOMParser().parseFromString(await response.text(), 'text/html');
      const context = original.querySelectorAll('#expo .grid-2 > .card');
      const sourcePanel = original.getElementById(panel.id);
      const comparison = original.querySelector('#comparacion');
      const table = comparison.querySelector('table');
      const rows = [...table.tBodies[0].rows];
      if (!sourcePanel || context.length !== 2 || !rows.length) {
        throw new Error('El material original está incompleto');
      }

      for (const card of context) {
        addSlide(card.querySelector('h3').textContent, [card], 'section-context');
      }
      addAnalysis(sourcePanel);

      addSlide('Los cuatro métodos en una frase', comparison.querySelectorAll('.idea'), 'slide-columns');
      const rowsPerSlide = 4;
      const pages = Math.ceil(rows.length / rowsPerSlide);
      for (let i = 0; i < pages; i++) {
        const part = table.cloneNode(true);
        part.tBodies[0].replaceChildren(...rows.slice(i * rowsPerSlide, (i + 1) * rowsPerSlide));
        addSlide('Comparación general · ' + (i + 1) + ' de ' + pages, [part], 'section-comparison');
      }
    } catch {
      canvas.replaceChildren();
      addAnalysis(panel);
      const link = document.createElement('a');
      link.href = originalUrl + '#expo';
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Abrir las tablas y la comparación en el material de Carolina';
      addSlide('Material de Carolina', [link]);
    }
    deck.hidden = false;
  }

  const viewport = deck.querySelector('.slide-viewport');
  SlideCanvas.fit(viewport, viewport.firstElementChild);
  const slides = [...deck.querySelectorAll('.lo-slide')];
  const previous = deck.querySelector('[data-section-prev]');
  const next = deck.querySelector('[data-section-next]');
  let index = 0;

  function show(target) {
    index = Math.max(0, Math.min(target, slides.length - 1));
    slides.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle('is-current', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelector('.section-progress').textContent = (position + 1) + ' / ' + slides.length;
    });
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
  }

  deck.slideNavigation = {
    move: direction => show(index + (direction === 'next' ? 1 : -1)),
    reset: atEnd => show(atEnd ? slides.length - 1 : 0),
    status: () => ({ current: index + 1, total: slides.length, atStart: index === 0, atEnd: index === slides.length - 1 })
  };

  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  document.addEventListener('keydown', event => {
    if (document.documentElement.classList.contains('projected') || event.defaultPrevented) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else viewport.requestFullscreen?.();
    }
  });
  show(0);
})();
