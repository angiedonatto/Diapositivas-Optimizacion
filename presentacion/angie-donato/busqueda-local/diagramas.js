/* Dibujos locales, a dos píxeles por unidad del diagrama. */
window.LocalDiagrams = (() => {
  function drawing(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function trace(points) {
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      for (const point of points.slice(1)) ctx.lineTo(...point);
    }

    function line(points, color, width = 1, dash = []) {
      trace(points);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function shape(points, color) {
      trace(points);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function circle(x, y, radius, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    return { ctx, line, shape, circle };
  }

  function cityMap(canvas) {
    const { ctx, line, shape, circle } = drawing(canvas);
    const cities = [[83, 167], [125, 67], [282, 49], [402, 98], [332, 193]];
    const blue = '#3d5a98';

    // El trazado de fondo sugiere un mapa. Las líneas tenues son otras conexiones.
    for (let i = 0; i < 5; i++) {
      const radius = 22 + i * 14;
      ctx.beginPath();
      ctx.ellipse(410, 212, radius * 1.4, radius * .52, -.35, 0, Math.PI * 2);
      ctx.strokeStyle = '#daddd2';
      ctx.lineWidth = .9;
      ctx.stroke();
    }
    line([[0, 135], [44, 106], [83, 96], [144, 119], [220, 118], [279, 97], [337, 71], [421, 70], [480, 55]], '#d8e4e7', 12);
    for (const [from, to] of [[0, 2], [0, 3], [1, 3], [1, 4], [2, 4]]) {
      line([cities[from], cities[to]], '#a8b2a9', 1.2, [3, 6]);
    }
    line(cities, blue, 4);
    line([cities[4], cities[0]], blue, 3, [8, 6]);

    // Las puntas indican el sentido del recorrido, incluido el regreso.
    for (let i = 0; i < cities.length; i++) {
      const [x, y] = cities[i];
      const [tx, ty] = cities[(i + 1) % cities.length];
      const angle = Math.atan2(ty - y, tx - x);
      const mid = [(x + tx) / 2, (y + ty) / 2];
      const side = offset => [mid[0] - 10 * Math.cos(angle + offset), mid[1] - 10 * Math.sin(angle + offset)];
      shape([mid, side(.48), side(-.48)], blue);
      if (i === 0) circle(x, y, 26, '#cbd7ee');
      circle(x, y, 17, blue);
      ctx.fillStyle = '#fff';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ABCDE'[i], x, y);
    }
  }

  function mountain(canvas, appearance) {
    const { ctx, line, shape, circle } = drawing(canvas);
    const sky = ctx.createLinearGradient(0, 0, 0, 175);
    sky.addColorStop(0, '#e1e9f4');
    sky.addColorStop(1, '#faf8ef');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 480, 175);

    shape([[0, 140], [70, 96], [121, 121], [196, 64], [260, 106], [315, 77], [371, 98], [445, 66], [480, 84], [480, 175], [0, 175]], '#d0dcd7');
    const ridge = [[0, 162], [43, 147], [75, 122], [113, 101], [147, 82], [181, 102], [210, 127],
      [248, 140], [285, 103], [315, 75], [343, 56], [368, 31], [407, 60], [434, 90], [480, 125]];
    shape([...ridge, [480, 175], [0, 175]], '#8ca595');
    shape([[0, 175], [98, 149], [147, 82], [181, 102], [210, 127], [248, 140], [182, 160], [140, 175]], '#708a7e');
    shape([[250, 175], [315, 152], [368, 31], [407, 60], [434, 90], [480, 125], [480, 175]], '#698477');

    for (const y of [123, 142, 158]) {
      line([[22, y + 10], [63, y + 4], [99, y - 11], [132, y - 14], [176, y - 5], [217, y + 10]], '#a8bbaf', 1);
    }

    if (appearance < 6) {
      const fog = ctx.createLinearGradient(156, 0, 390, 0);
      fog.addColorStop(0, '#f7f6ee00');
      fog.addColorStop(.45, '#f7f6eef2');
      fog.addColorStop(1, '#f7f6ee');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, 480, 175);
    }

    const climberAtTop = appearance >= 5;
    const [x, y] = climberAtTop ? [147, 82] : [107, 104];
    const path = [[47, 145], [75, 122], [107, 104]];
    if (climberAtTop) path.push([147, 82]);
    line(path, '#fbfaf6', 2.3, [4, 5]);
    const ink = '#16221c';
    line([[x - 4, y - 20], [x - 1, y - 10], [x - 7, y]], ink, 2.5);
    line([[x - 1, y - 10], [x + 5, y - 6], [x + 5, y]], ink, 2.4);
    line([[x - 4, y - 20], [x + 3, y - 15], [x + 8, y - 17]], ink, 2.4);
    line([[x + 8, y - 19], [x + 11, y]], '#46544c', 1.4);
    circle(x - 8, y - 17, 3.2, '#3d5a98');
    circle(x - 3, y - 25, 3.7, ink);
    if (climberAtTop) {
      circle(147, 84, 4.4, '#3d5a98');
    }
    if (appearance >= 6) {
      line([[368, 31], [368, 10]], '#1f7a4d', 2);
      shape([[368, 10], [390, 14], [368, 20]], '#1f7a4d');
      circle(368, 32, 4.5, '#1f7a4d');
    }
  }

  return { cityMap, mountain };
})();
