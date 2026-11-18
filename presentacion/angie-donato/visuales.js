/* Recursos para las tres diapositivas de fundamentos de cada tema. */
window.DonatoVisuals = (() => {
  const authors = {
    tabu: ['glover', 'Fred Glover', '1986 · Búsqueda Tabú'],
    ga: ['holland', 'John Holland', '1975 · Adaptation in Natural and Artificial Systems'],
    aco: ['dorigo', 'Marco Dorigo', '1992 · Tesis doctoral y Ant System']
  };

  function element(tag, value, className) {
    const node = document.createElement(tag);
    if (value) node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function history(topic) {
    if (topic === 'local') {
      const timeline = element('ol', '', 'donato-timeline');
      for (const [year, label] of [['1958', 'Croes · 2-opt'], ['1973', 'Lin y Kernighan · mejora de rutas']]) {
        const item = element('li');
        const date = element('time', year);
        date.dateTime = year;
        item.append(date, document.createTextNode(label));
        timeline.append(item);
      }
      return timeline;
    }

    const [id, name, contribution] = authors[topic];
    const picture = element('div', '', 'donato-portrait ' + id);
    picture.setAttribute('role', 'img');
    picture.setAttribute('aria-label', 'Retrato ilustrado de ' + name);
    const caption = element('figcaption');
    caption.append(element('strong', name), element('span', contribution), element('span', 'Ilustración generada', 'donato-credit'));
    const figure = element('figure', '', 'donato-history');
    figure.append(picture, caption);
    return figure;
  }

  function diagram(label, paint, palette) {
    const canvas = element('canvas');
    canvas.width = 1200;
    canvas.height = 300;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', label);
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    const { accent, muted, ink, paper } = palette;

    function line(points, color = accent, weight = 3, dash = []) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = weight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash);
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function dot([x, y], radius = 7, color = accent) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    function labelAt(value, x, y, color = ink, size = 17) {
      ctx.fillStyle = color;
      ctx.font = '650 ' + size + 'px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, x, y);
    }

    paint({ line, dot, labelAt, accent, muted, ink, paper });
    return canvas;
  }

  const illustrations = {
    local: [
      ['Recorrido cerrado del agente viajero: A, B, C, D, E y vuelta a A.', ({ line, dot, labelAt, paper }) => {
        const route = [[85, 90], [184, 36], [392, 32], [509, 88], [301, 121]];
        line([...route, route[0]]);
        route.forEach(([x, y], i) => {
          dot([x, y], 15);
          labelAt('ABCDE'[i], x, y, paper, 15);
        });
      }],
      ['Dos valles de costo. El óptimo local es más alto que el global.', ({ line, dot, labelAt, muted }) => {
        line([[36, 45], [130, 66], [181, 91], [263, 53], [327, 67], [443, 111], [548, 56]], muted);
        dot([181, 91]);
        dot([443, 111]);
        labelAt('Óptimo local', 181, 113);
        labelAt('Óptimo global', 443, 133);
      }]
    ],
    tabu: [
      ['Costo de la ruta: 37, 22, 23 y 20. El paso de 22 a 23 permite seguir explorando.', ({ line, dot, labelAt, muted }) => {
        const costs = [37, 22, 23, 20];
        const route = costs.map((cost, i) => [83 + i * 144, 114 - (cost - 20) * 4.7]);
        line(route, muted, 2);
        line(route.slice(1, 3), undefined, 4, [6, 7]);
        route.forEach(([x,y], i) => {
          dot([x,y]);
          labelAt(costs[i], x, y - 17);
        });
        labelAt('Paso temporalmente peor', 300, 132);
      }],
      ['De la solución actual salen dos movimientos: uno reciente está en la lista tabú y el otro queda disponible.', ({ line, dot, labelAt, muted }) => {
        const start = [96, 75];
        const recent = [358, 39];
        const available = [358, 111];
        line([start, recent], muted, 3, [5, 7]);
        line([start, available]);
        [start,recent,available].forEach(p => dot(p));
        labelAt('Actual', 96, 103);
        labelAt('Movimiento tabú', 467, 39);
        labelAt('Movimiento permitido', 470, 111);
      }]
    ],
    ga: [
      ['Una población de soluciones candidatas se puntúa. Las de mayor aptitud se destacan.', ({ line, dot, labelAt, accent, muted }) => {
        [58, 130, 202, 274, 346, 418].forEach((x, i) => {
          const y = [75, 96, 42, 79, 50, 100][i];
          line([[x, 119], [x, y]], i === 2 || i === 4 ? accent : muted, 9);
          dot([x,y], 8, i === 2 || i === 4 ? accent : muted);
        });
        labelAt('Mayor', 510, 40);
        labelAt('aptitud', 510, 61);
      }],
      ['Ejemplo esquemático de cruce binario: los primeros genes vienen del padre 1 y los restantes del padre 2.', ({ dot, labelAt, accent, muted, paper }) => {
        ['1011', '0100', '1000'].forEach((bits, row) => {
          const y = 31 + row * 44;
          labelAt(['Padre 1', 'Padre 2', 'Hijo'][row], 107, y);
          [...bits].forEach((bit, i) => {
            const x = 226 + i * 66;
            dot([x,y], 17, row === 0 || (row === 2 && i < 2) ? accent : muted);
            labelAt(bit, x, y, paper, 15);
          });
        });
      }]
    ],
    aco: [
      ['Una colonia explora en paralelo dos rutas alternativas entre A y E.', ({ line, dot, labelAt, muted, paper }) => {
        const cities = [[80,75], [248,35], [248,115], [530,75]];
        line([cities[0], cities[1], cities[3]], undefined, 4);
        line([cities[0], cities[2], cities[3]], muted, 3);
        cities.forEach(([x,y], i) => {
          dot([x,y], 14);
          labelAt(['A','B','C','E'][i], x, y, paper, 14);
        });
      }],
      ['Dos trayectos posibles. El más corto aparece reforzado con más feromona, sin excluir el otro.', ({ line, dot, labelAt, muted }) => {
        const start = [69,72];
        const end = [531,72];
        line([start, [281,55], end], undefined, 9);
        line([start, [266,121], end], muted, 3, [7,7]);
        dot(start);
        dot(end);
        labelAt('Mayor refuerzo', 293, 26);
        labelAt('Seguir explorando', 276, 139);
      }]
    ]
  };

  return {
    render(container, topic, number) {
      if (number === 1) {
        container.replaceChildren(history(topic));
        return;
      }
      const style = getComputedStyle(container);
      const palette = {
        accent: style.getPropertyValue('--lo-m').trim(),
        muted: '#5d6d63',
        ink: style.getPropertyValue('--lo-ink').trim(),
        paper: style.getPropertyValue('--lo-paper').trim()
      };
      container.replaceChildren(diagram(...illustrations[topic][number === 0 ? 0 : 1], palette));
    }
  };
})();
