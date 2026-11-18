(() => {
  const topics = {
    local: 'busqueda-local',
    tabu: 'busqueda-tabu',
    ga: 'algoritmo-genetico',
    aco: 'colonia-hormigas'
  };
  const people = [
    { id: 'donato', folder: 'angie-donato', name: 'Angie Donato' },
    { id: 'loango', folder: 'angie-loango', name: 'Angie Loango' },
    { id: 'andres', folder: 'andres', name: 'Andrés' },
    { id: 'carolina', folder: 'carolina', name: 'Carolina' }
  ];
  const get = id => document.getElementById(id);
  const presentation = get('presentation');
  const frame = get('slideFrame');
  const viewer = get('viewer');
  const cover = get('cover');
  const finished = get('finished');
  const previous = get('previous');
  const next = get('next');
  const fullscreen = get('fullscreen');
  const controlsZone = get('controlsZone');
  const destination = location.origin === 'null' ? '*' : location.origin;
  const themeButtons = [...document.querySelectorAll('[data-topic]')];
  let topic;
  let step = 0;
  let ready = false;
  let navigating = false;
  let hideTimer;

  function revealControls() {
    controlsZone.classList.add('is-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => controlsZone.classList.remove('is-visible'), 2500);
  }

  function choose(value) {
    topic = value;
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
    get('start').disabled = false;
  }

  function writeHash(hash = '') {
    try { history.replaceState(null, '', location.pathname + location.search + hash); } catch {}
  }

  function post(cmd, detail = {}) {
    frame.contentWindow.postMessage({ scope: 'expo-parent', cmd, ...detail }, destination);
  }

  function blockPath(index) {
    return 'presentacion/' + people[index].folder + '/' + topics[topic] + '/index.html';
  }

  function showStep(index, atEnd = false) {
    ready = false;
    navigating = false;
    cover.hidden = true;

    if (index === people.length) {
      viewer.hidden = true;
      finished.hidden = false;
      get('finishedTopic').textContent = themeButtons.find(button => button.dataset.topic === topic).querySelector('strong').textContent;
      get('appendix').href = blockPath(people.length - 1) + '?estudio#preguntas';
      get('finishTitle').focus();
      writeHash();
      return;
    }

    step = index;
    viewer.hidden = false;
    finished.hidden = true;
    get('person').textContent = people[step].name;
    get('count').textContent = 'Cargando…';
    previous.disabled = true;
    next.disabled = true;
    frame.title = 'Diapositivas de ' + people[step].name;
    const source = new URL(blockPath(step) + '?integrada=1&tema=' + topic, location.href);
    frame.onload = () => {
      const loaded = frame.contentWindow.location;
      if (loaded.pathname !== source.pathname || loaded.search !== source.search) return;
      post('init', { atEnd });
    };
    frame.src = source.href;
    writeHash('#' + topic + '-' + (step + 1));
    revealControls();
  }

  function showCover() {
    ready = false;
    navigating = false;
    viewer.hidden = true;
    finished.hidden = true;
    cover.hidden = false;
    frame.onload = null;
    frame.removeAttribute('src');
    writeHash();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    themeButtons.find(button => button.dataset.topic === topic)?.focus();
  }

  function move(direction) {
    revealControls();
    if (!ready || navigating || (direction === 'prev' && previous.disabled)) return;
    navigating = true;
    post('move', { direction });
  }

  window.togglePresentationFullscreen = async () => {
    if (viewer.hidden) return;
    revealControls();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await presentation.requestFullscreen();
    } catch {
      get('fullscreenStatus').textContent = 'El navegador no pudo cambiar a pantalla completa.';
    }
  };

  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    const label = active ? 'Salir de pantalla completa' : 'Pantalla completa';
    fullscreen.setAttribute('aria-pressed', String(active));
    fullscreen.setAttribute('aria-label', label);
    fullscreen.title = label + ' (F)';
  });

  function handleKey(key) {
    if (['arrowright', 'pagedown', ' '].includes(key)) move('next');
    if (['arrowleft', 'pageup'].includes(key)) move('prev');
    if (key === 'f') window.togglePresentationFullscreen();
    if (key === 'tab') {
      revealControls();
      (previous.disabled ? next : previous).focus();
    }
  }

  window.addEventListener('message', event => {
    const data = event.data;
    if (viewer.hidden || event.source !== frame.contentWindow || event.origin !== location.origin ||
        data?.scope !== 'expo-child' || data.person !== people[step].id || data.theme !== topic) return;
    switch (data.type) {
      case 'ready':
      case 'status':
        ready = true;
        navigating = false;
        previous.disabled = step === 0 && data.atStart;
        next.disabled = false;
        get('count').textContent = data.current + ' / ' + data.total;
        break;
      case 'boundary':
        if (navigating) showStep(step + (data.direction === 'next' ? 1 : -1), data.direction === 'prev');
        break;
      case 'key':
        handleKey(data.key);
        break;
      case 'activity':
        revealControls();
        break;
    }
  });

  document.addEventListener('keydown', event => {
    if (viewer.hidden || event.altKey || event.metaKey || event.ctrlKey) return;
    const key = event.key.toLowerCase();
    if (key === ' ' && event.target.closest?.('button, a')) return;
    if (key === 'tab') {
      revealControls();
      return;
    }
    if (['arrowright', 'arrowleft', 'pagedown', 'pageup', ' ', 'f'].includes(key)) {
      event.preventDefault();
      if (!event.repeat) handleKey(key);
    }
  });

  viewer.addEventListener('pointermove', event => {
    if (event.clientY >= innerHeight - 100) revealControls();
  });
  viewer.addEventListener('pointerdown', revealControls);
  themeButtons.forEach(button => button.addEventListener('click', () => choose(button.dataset.topic)));
  get('start').addEventListener('click', () => {
    if (topic) showStep(0);
  });
  previous.addEventListener('click', () => move('prev'));
  next.addEventListener('click', () => move('next'));
  fullscreen.addEventListener('click', window.togglePresentationFullscreen);
  get('return').addEventListener('click', showCover);
  get('restart').addEventListener('click', showCover);

  const hash = location.hash.match(/^#(local|tabu|ga|aco)-([1-4])$/);
  if (hash) {
    choose(hash[1]);
    showStep(Number(hash[2]) - 1);
  }
})();
