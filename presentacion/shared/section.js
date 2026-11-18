/* Bloques académicos que comparten la composición de las diapositivas de Loango. */
(() => {
  const source = document.querySelector('.study-page');
  const panel = source?.querySelector('.panel[data-m]');
  const deck = document.querySelector('.section-deck');
  if (panel && new URLSearchParams(location.search).has('estudio') && window.parent === window) {
    source.hidden = false;
    return;
  }

  if (panel) {
    const label = panel.querySelector('.label').textContent.trim();
    const hero = panel.querySelector('.hero');
    const cards = [...panel.querySelectorAll('.stack .card')];
    const groups = [
      [hero.querySelector('h3').textContent, [hero.querySelector('.stat-row')]],
      ['Ventajas y limitaciones', cards.slice(0, 2)],
      [cards[2].querySelector('h3').textContent, [cards[2]]],
      ['Comparación y aplicación', cards.slice(3)],
      ['Conclusión', [panel.querySelector('.closer')]]
    ];
    deck.querySelector('.slide-canvas').dataset.algo = panel.dataset.m;
    for (const [title, content] of groups) {
      const slide = document.querySelector('#section-slide').content.cloneNode(true);
      slide.querySelector('.lo-s-letter').textContent = label.split(' · ')[0];
      slide.querySelector('.section-topic').textContent = label.split(' · ')[1];
      slide.querySelector('.lo-s-title').textContent = title;
      const body = slide.querySelector('.lo-s-body');
      if (content.length === 2) body.classList.add('slide-columns');
      for (const item of content) {
        const card = document.createElement('div');
        card.className = 'lo-c section-card';
        const copy = item.cloneNode(true);
        if (copy.querySelector('h3')?.textContent === title) copy.querySelector('h3').remove();
        if (copy.classList.contains('card')) card.append(...copy.childNodes);
        else card.append(copy);
        body.append(card);
      }
      deck.querySelector('.slide-canvas').append(slide);
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
