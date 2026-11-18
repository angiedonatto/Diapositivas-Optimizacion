/* Conecta un bloque individual con el visor cuando se carga integrado. */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('integrada') !== '1' || window.parent === window) return;

  const people = { 'angie-donato': 'donato', 'angie-loango': 'loango', andres: 'andres', carolina: 'carolina', titulo: 'titulo' };
  const person = location.pathname.split('/').map(part => people[part]).find(Boolean);
  if (!person) return;

  const theme = params.get('tema');
  const destination = location.origin === 'null' ? '*' : location.origin;
  const send = (type, detail = {}) => window.parent.postMessage({
    scope: 'expo-child', type, person, theme, ...detail
  }, destination);

  document.documentElement.classList.add('projected');
  document.documentElement.dataset.theme = 'light';

  const loango = person === 'loango';
  if (loango) {
    SlideCanvas.fit(document.querySelector('.lo-viewport'), document.querySelector('.lo-deck'), document.querySelector('.lo-frame'));
  }

  let deck;
  const counter = document.querySelector(loango ? '.lo-count' : '#count');
  const previous = document.querySelector(loango ? '[data-lo="prev"]' : '#prevBtn');
  const next = document.querySelector(loango ? '[data-lo="next"]' : '#nextBtn');

  function status() {
    if (deck) return deck.status();
    const [, current, total] = counter.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    return {
      current: Number(current), total: Number(total),
      atStart: previous.disabled,
      atEnd: loango ? next.disabled : current === total
    };
  }

  function move(direction) {
    if (deck) deck.move(direction);
    else (direction === 'next' ? next : previous).click();
  }

  async function initialize(atEnd) {
    await window.sectionReady;
    deck = document.querySelector('.section-deck')?.slideNavigation;
    if (deck) deck.reset(atEnd);
    else {
      const selector = loango ? '#lo-tab-' + theme : '[data-method="' + theme + '"]';
      document.querySelector(selector)?.click();
      for (let i = 0; atEnd && !status().atEnd && i < 200; i++) move('next');
    }
    send('ready', status());
  }

  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin || event.data?.scope !== 'expo-parent') return;
    const { cmd, atEnd, direction } = event.data;
    if (cmd === 'init') initialize(atEnd);
    if (cmd !== 'move') return;
    const { atStart, atEnd: last } = status();
    if (direction === 'next' ? last : atStart) send('boundary', { direction });
    else {
      move(direction);
      send('status', status());
    }
  });

  window.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.target.matches?.('input, textarea, select, [contenteditable]')) return;
    const key = event.key.toLowerCase();
    if (!['arrowright', 'arrowleft', 'pageup', 'pagedown', ' ', 'f', 'tab', '1', '2', '3', '4', 'home', 'n', 't'].includes(key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (key === 'f' && location.origin !== 'null') window.parent.togglePresentationFullscreen?.();
    else if (['arrowright', 'arrowleft', 'pageup', 'pagedown', ' ', 'tab'].includes(key)) send('key', { key });
  }, true);

  document.addEventListener('pointermove', event => {
    if (event.clientY >= innerHeight - 100) send('activity');
  });
  document.addEventListener('pointerdown', () => send('activity'));
})();
