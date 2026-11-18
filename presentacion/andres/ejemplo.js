/* =====================================================================
   Andrés · Ejemplo en vivo
   Dibuja las piezas que se repiten en los cuatro temas a partir de
   atributos data-*, para que el grafo y sus distancias sean idénticos:

   <svg class="an-graph" data-tour="ABCDE">       tour cerrado (A … A)
     data-path="AD"         camino abierto de una hormiga
     data-ant="1|2"         color de la hormiga (rojo o azul)
     data-here="D"          ciudad donde está la hormiga
     data-tau="1" | "AD:1.4,BE:1.4,…"   grosor ∝ feromona (resto: 0.5)
     data-tau-from="…"      grosor inicial de la animación
   <svg class="an-pie" data-p="P1:0.19,…" data-r="0.62,0.81,…">
   <div class="an-bar" data-p="B:0.08,…" data-r="0.30" data-pick="D">
   <svg class="an-chart" data-actual="37,22,23,20" data-best="37,22,22,20">
   ===================================================================== */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CITIES = 'ABCDE';
  const DIST = [
    [0, 6, 4, 2, 10],
    [6, 0, 7, 6, 6],
    [4, 7, 0, 9, 2],
    [2, 6, 9, 0, 5],
    [10, 6, 2, 5, 0]
  ];
  // Pentágono: A arriba y el resto en sentido horario. No está a escala.
  const CENTER = [250, 232];
  const RADIUS = 182;
  const POS = {};
  [...CITIES].forEach((city, i) => {
    const angle = (-90 + 72 * i) * Math.PI / 180;
    POS[city] = [CENTER[0] + RADIUS * Math.cos(angle), CENTER[1] + RADIUS * Math.sin(angle)];
  });

  function svg(tag, attrs = {}, text) {
    const node = document.createElementNS(NS, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const key = (a, b) => [a, b].sort().join('');
  const dist = (a, b) => DIST[CITIES.indexOf(a)][CITIES.indexOf(b)];
  const pairs = text => Object.fromEntries((text || '').split(',').filter(Boolean)
    .map(part => part.split(':')).map(([name, value]) => [name.trim(), Number(value)]));
  const edgesOf = (cities, closed) => {
    const list = [];
    for (let i = 0; i < cities.length - (closed ? 0 : 1); i++) list.push(key(cities[i], cities[(i + 1) % cities.length]));
    return list;
  };
  function tauOf(text) {
    if (!text) return null;
    if (!text.includes(':')) return () => Number(text);
    const values = pairs(text);
    return edge => values[edge] ?? 0.5;
  }

  function drawGraph(host) {
    const { tour, path, ant, here } = host.dataset;
    const tau = tauOf(host.dataset.tau);
    const tauFrom = tauOf(host.dataset.tauFrom);
    const route = tour || path || '';
    const used = new Set(edgesOf(route, Boolean(tour)));
    const routeClass = ant ? ' is-h' + ant : '';
    host.setAttribute('viewBox', '0 0 500 470');
    if (!host.hasAttribute('role')) host.setAttribute('role', 'img');
    if (!host.hasAttribute('aria-label')) {
      host.setAttribute('aria-label', route ? 'Grafo de cinco ciudades con el recorrido ' + [...route, ...(tour ? ['A'] : [])].join('-') : 'Grafo de cinco ciudades');
    }

    const edges = svg('g');
    const labels = svg('g');
    for (let i = 0; i < CITIES.length; i++) {
      for (let j = i + 1; j < CITIES.length; j++) {
        const a = CITIES[i], b = CITIES[j], edge = a + b;
        const [x1, y1] = POS[a], [x2, y2] = POS[b];
        const line = svg('line', { class: 'an-e', x1, y1, x2, y2 });
        if (tau) {
          const w1 = tau(edge) * 7;
          line.classList.add('is-tau');
          line.style.strokeWidth = w1 + 'px';
          if (tauFrom) {
            line.classList.add('is-anim');
            line.style.setProperty('--w0', tauFrom(edge) * 7 + 'px');
            line.style.setProperty('--w1', w1 + 'px');
          }
        }
        edges.append(line);

        // El punto medio de cada diagonal queda entre sus dos cruces.
        const x = (x1 + x2) / 2, y = (y1 + y2) / 2;
        const label = svg('g', { class: 'an-lbl' + (used.has(edge) ? ' is-on' + routeClass : '') });
        label.append(svg('rect', { x: x - 19, y: y - 15, width: 38, height: 30, rx: 9 }), svg('text', { x, y: y + 1 }, dist(a, b)));
        labels.append(label);
      }
    }
    host.append(edges);

    if (route.length > 1) {
      const d = [...route].map((city, i) => (i ? 'L' : 'M') + POS[city].join(',')).join(' ') + (tour ? ' Z' : '');
      host.append(svg('path', { class: 'an-tour' + routeClass, d, pathLength: 1 }));
    }
    host.append(labels);

    for (const city of CITIES) {
      const [cx, cy] = POS[city];
      const node = svg('g', { class: 'an-n' + (city === 'A' ? ' is-start' : '') + (city === here ? ' is-here' : '') });
      node.append(svg('circle', { cx, cy, r: 27 }), svg('text', { x: cx, y: cy + 1 }, city));
      host.append(node);
    }
    host.append(svg('text', { class: 'an-note', x: 250, y: 462 }, 'distancias no a escala'));
  }

  function drawPie(host) {
    const slices = Object.entries(pairs(host.dataset.p));
    const spins = (host.dataset.r || '').split(',').filter(Boolean).map(Number);
    const c = 210, r = 180;
    const at = (fraction, radius) => {
      const angle = fraction * 2 * Math.PI - Math.PI / 2;
      return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)];
    };
    host.setAttribute('viewBox', '-20 -20 460 460');
    let start = 0;
    slices.forEach(([name, p], i) => {
      const end = start + p;
      const [x1, y1] = at(start, r), [x2, y2] = at(end, r);
      const mix = [22, 42, 64, 86][i % 4];
      host.append(svg('path', {
        class: 'an-slice',
        d: `M${c},${c} L${x1},${y1} A${r},${r} 0 ${p > 0.5 ? 1 : 0} 1 ${x2},${y2} Z`,
        style: `fill: color-mix(in srgb, var(--lo-m) ${mix}%, var(--lo-paper))`
      }));
      const [tx, ty] = at(start + p / 2, r * 0.68);
      const text = svg('text', { x: tx, y: ty - 12, style: 'fill:' + (mix > 50 ? '#fff' : 'var(--lo-ink)') }, name);
      const value = svg('text', { x: tx, y: ty + 14, style: 'font-weight:600;fill:' + (mix > 50 ? '#fff' : 'var(--lo-ink-2)') }, p.toFixed(2));
      host.append(text, value);
      start = end;
    });
    spins.forEach((value, i) => {
      // Flecha corta que apunta al borde donde cae r, sin tapar las tajadas.
      const [x1, y1] = at(value, r + 26), [x2, y2] = at(value, r - 22);
      const [lx, ly] = at(value, r + 44);
      const group = svg('g', { class: 'an-spin', style: '--d:' + (i + 1) });
      group.append(svg('line', { x1, y1, x2, y2 }), svg('circle', { cx: lx, cy: ly, r: 17 }), svg('text', { x: lx, y: ly + 1 }, i + 1));
      host.append(group);
    });
  }

  function drawBar(host) {
    const pick = host.dataset.pick;
    for (const [name, p] of Object.entries(pairs(host.dataset.p))) {
      const part = document.createElement('span');
      part.style.width = p * 100 + '%';
      part.textContent = p >= 0.12 ? name + ' · ' + p.toFixed(2) : p >= 0.05 ? name : '';
      if (name === pick) part.classList.add('is-pick');
      host.append(part);
    }
    if (host.dataset.r) {
      const marker = document.createElement('i');
      marker.className = 'an-bar-r';
      marker.style.left = Number(host.dataset.r) * 100 + '%';
      marker.dataset.label = 'r = ' + host.dataset.r;
      host.append(marker);
    }
  }

  function drawChart(host) {
    const actual = host.dataset.actual.split(',').map(Number);
    const best = host.dataset.best.split(',').map(Number);
    const W = 640, H = 330, left = 60, right = 30, top = 40, bottom = 50;
    const min = 15, max = 40;
    const x = i => left + i * (W - left - right) / (actual.length - 1);
    const y = v => top + (max - v) * (H - top - bottom) / (max - min);
    host.setAttribute('viewBox', `0 0 ${W} ${H}`);
    for (const v of [20, 25, 30, 35]) {
      host.append(svg('line', { class: 'an-axis', x1: left, x2: W - right, y1: y(v), y2: y(v), style: 'stroke-dasharray: 2 6' }));
      host.append(svg('text', { class: 'an-grid-t', x: left - 12, y: y(v) + 6, 'text-anchor': 'end' }, v));
    }
    actual.forEach((_, i) => host.append(svg('text', { class: 'an-grid-t', x: x(i), y: H - 14, 'text-anchor': 'middle' }, i === 0 ? 'inicio' : 'it. ' + i)));
    const line = list => list.map((v, i) => x(i) + ',' + y(v)).join(' ');
    host.append(svg('polyline', { class: 'an-line is-best', points: line(best) }));
    host.append(svg('path', { class: 'an-line', d: 'M' + line(actual).replaceAll(' ', ' L'), pathLength: 1 }));
    actual.forEach((v, i) => {
      host.append(svg('circle', { class: 'an-pt', cx: x(i), cy: y(v), r: 8 }));
      host.append(svg('text', { class: 'an-pt-t', x: x(i), y: y(v) - 18 }, v));
    });
    host.append(svg('text', { class: 'an-key', x: W - right, y: 18, 'text-anchor': 'end' }, 'línea: actual · punteada: mejor x*'));
  }

  document.querySelectorAll('svg.an-graph').forEach(drawGraph);
  document.querySelectorAll('svg.an-pie').forEach(drawPie);
  document.querySelectorAll('.an-bar').forEach(drawBar);
  document.querySelectorAll('svg.an-chart').forEach(drawChart);

  // R vuelve al primer paso cuando el tema se abre por separado.
  // Dentro del visor la navegación la controla la portada.
  document.addEventListener('keydown', async event => {
    if (event.key.toLowerCase() !== 'r' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (document.documentElement.classList.contains('projected')) return;
    await window.sectionReady;
    document.querySelector('.section-deck')?.slideNavigation?.reset(false);
  });
})();
