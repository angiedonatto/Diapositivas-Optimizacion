"""Pruebas del ejemplo en vivo de Andrés.

Uso:  python3 -B presentacion/andres/pruebas_ejemplo.py

1. Ejecutan el código de referencia de la guía (agente viajero de cinco
   ciudades) y comprueban sus resultados.
2. Leen los cuatro HTML de esta carpeta y recalculan cada número que
   muestran: matrices, costos, tablas de vecinos, lista tabú, población,
   ruleta, cruce OX, mutación, probabilidades y feromona. Si una cifra de
   una diapositiva no coincide, la prueba falla y dice dónde.
"""
import itertools
import os
import re
from html.parser import HTMLParser

OK = 0


def check(cond, msg):
    global OK
    assert cond, msg
    OK += 1


# ------------------------------------------------- código de referencia
L = "ABCDE"
I = {c: i for i, c in enumerate(L)}
D = [[0, 6, 4, 2, 10], [6, 0, 7, 6, 6], [4, 7, 0, 9, 2], [2, 6, 9, 0, 5], [10, 6, 2, 5, 0]]


def cost(t):  # t = "ABCDE" (empieza en A, vuelve a A)
    return sum(D[I[t[i]]][I[t[(i + 1) % len(t)]]] for i in range(len(t)))


def swaps(t):  # posiciones 2..5 (índices 1..4); orden (2,3),(2,4),(2,5),(3,4),(3,5),(4,5)
    for i in range(1, 5):
        for j in range(i + 1, 5):
            u = list(t); u[i], u[j] = u[j], u[i]
            yield frozenset((t[i], t[j])), "".join(u)


def ox(p1, p2, a=1, b=3):
    n = len(p1); child = [None] * n; child[a:b] = p1[a:b]
    seq = [g for g in (p2[(b + k) % n] for k in range(n)) if g not in child]
    pos = [(b + k) % n for k in range(n) if child[(b + k) % n] is None]
    for p, g in zip(pos, seq): child[p] = g
    return "".join(child)


check(min(cost("A" + "".join(p)) for p in itertools.permutations("BCDE")) == 20, 'el óptimo cuesta 20')
check(len({min(t, t[0] + t[:0:-1]) for t in ("A" + "".join(p) for p in itertools.permutations("BCDE"))}) == 12,
      'hay 12 tours distintos')

# Tema A — mejor mejora
t = "ABCDE"; path = [cost(t)]
while True:
    c, u = min((cost(u), u) for _, u in swaps(t))
    if c >= cost(t): break
    t = u; path.append(c)
check(path == [37, 22], 'mejor mejora: 37 → 22')

# Tema A — primera mejora
t = "ABCDE"; path = [cost(t)]; primera = []
while True:
    evaluados = 0
    for n, (m, u) in enumerate(swaps(t)):
        evaluados += 1
        if cost(u) < cost(t):
            pos = [(i, j) for i in range(2, 6) for j in range(i + 1, 6)][n]
            primera.append((t, pos, m, u, evaluados))
            t = u; path.append(cost(u)); break
    else:
        primera.append((t, None, None, None, evaluados)); break
check(path == [37, 32, 27, 22] and t == "ADECB", 'primera mejora: 37 → 32 → 27 → 22')

# Tema B — tabú, tenencia 2, aspiración por mejor global
t = "ABCDE"; tabu = []; best = t; hist = []; tabu_iter = []
for _ in range(4):
    tabu_iter.append((t, list(tabu), cost(best)))
    cand = [(cost(u), sorted(m), m, u) for m, u in swaps(t)
            if m not in tabu or cost(u) < cost(best)]
    c, _, m, u = min(cand)
    t = u; tabu = (tabu + [m])[-2:]
    if c < cost(best): best = u
    hist.append((c, cost(best), list(tabu)))
check([h[:2] for h in hist] == [(22, 22), (23, 22), (20, 20), (24, 20)], 'tabú: 37 → 22 → 23 → 20 → 24')

# Tema C — una generación
check(ox("CBED", "BDEC") == "DBEC" and cost("ADBEC") == 20, 'OX(P3, P4) = D B E C')
check(ox("BDEC", "CBED") == "BDEC" and cost("ABDEC") == 23, 'OX(P4, P3) = B D E C')
pop0 = ["BCDE", "ECDB", "CBED", "BDEC"]
fit = [100 / cost("A" + x) for x in pop0]
acum = list(itertools.accumulate(f / sum(fit) for f in fit))
padres = [next(i for i, a in enumerate(acum) if r <= a) for r in (0.62, 0.81, 0.35, 0.08)]
check(padres == [2, 3, 1, 0], 'la ruleta elige P3, P4, P2 y P1')
hijos = [ox(pop0[2], pop0[3]), ox(pop0[3], pop0[2]), pop0[1], pop0[0]]  # pareja 2 no se cruza (0.95 > 0.9)
r_mut = [0.47, 0.66, 0.23, 0.05]
hijos = [h[:2] + h[3] + h[2] if r < 0.1 else h for h, r in zip(hijos, r_mut)]
peor = max(range(4), key=lambda i: cost("A" + hijos[i]))
pop1 = hijos[:]; pop1[peor] = min(pop0, key=lambda x: cost("A" + x))
check(pop1 == ["DBEC", "BDEC", "BDEC", "BCED"], 'la generación 1 es D B E C, B D E C, B D E C, B C E D')
check(sum(cost("A" + x) for x in pop0) / 4 == 29.25 and sum(cost("A" + x) for x in pop1) / 4 == 22.0,
      'el promedio baja de 29.25 a 22')


# Tema D — dos hormigas y una actualización
def probs(frm, visited, tau=None):
    cands = [c for c in L if c not in visited]
    w = {j: (tau[frozenset((frm, j))] if tau else 1) / D[I[frm]][I[j]] ** 2 for j in cands}
    s = sum(w.values())
    return cands, w, s


def hormiga(rs):
    tour = "A"
    while len(tour) < 5:
        cands, w, s = probs(tour[-1], tour)
        if len(cands) == 1:
            tour += cands[0]; continue
        r = rs.pop(0); acc = 0
        for j in cands:
            acc += w[j] / s
            if r <= acc: tour += j; break
    return tour


check(hormiga([0.30, 0.45, 0.40]) == "ADCEB" and cost("ADCEB") == 25, 'la hormiga 1 hace A-D-C-E-B-A = 25')
check(hormiga([0.75, 0.20, 0.60]) == "ADBEC" and cost("ADBEC") == 20, 'la hormiga 2 hace A-D-B-E-C-A = 20')
tau = {frozenset(e): 0.5 for e in itertools.combinations(L, 2)}
for tour in ["ADCEB", "ADBEC"]:
    dep = 10 / cost(tour)
    for i in range(5): tau[frozenset((tour[i], tour[(i + 1) % 5]))] += dep
check(round(tau[frozenset("AD")], 2) == 1.4 and round(tau[frozenset("AB")], 2) == 0.9, 'feromona tras una iteración')
_, w, s = probs("A", "A", tau)
check(round(w["D"] / s, 2) == 0.79, 'P(A→D) sube a 0.79')


# ------------------------------------------------- lectura de los HTML
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    @property
    def cls(self):
        return self.attrs.get('class', '').split()

    def text(self):
        return re.sub(r'\s+', ' ', ''.join(k if isinstance(k, str) else k.text() for k in self.kids)).strip()

    def find(self, pred):
        for k in self.kids:
            if isinstance(k, Node):
                if pred(k): yield k
                yield from k.find(pred)

    def up(self, tag):
        node = self.parent
        while node and node.tag != tag: node = node.parent
        return node


class Tree(HTMLParser):
    VOID = {'meta', 'link', 'br', 'img', 'input', 'hr', 'source', 'col', 'wbr'}

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = self.node = Node('root', {}, None)
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.node)
        self.node.kids.append(node)
        if tag not in self.VOID: self.node = node

    def handle_startendtag(self, tag, attrs):
        self.node.kids.append(Node(tag, attrs, self.node))

    def handle_endtag(self, tag):
        node = self.node
        while node is not self.root and node.tag != tag: node = node.parent
        if node is not self.root: self.node = node.parent

    def handle_data(self, data):
        self.node.kids.append(data)


def rows(table, part='tbody'):
    body = next(table.find(lambda n: n.tag == part), None)
    if body is None: return []
    return [(tr, [c.text() for c in tr.kids if isinstance(c, Node) and c.tag in ('td', 'th')])
            for tr in body.kids if isinstance(tr, Node) and tr.tag == 'tr']


def dash(t):
    return '-'.join(t) + '-A'


def pair(m):
    return '↔'.join(sorted(m))


def letters(text):
    return re.sub(r'[^A-E]', '', text)


CARPETA = os.path.dirname(os.path.abspath(__file__))
TEMAS = {'busqueda-local': 'local', 'busqueda-tabu': 'tabu', 'algoritmo-genetico': 'ga', 'colonia-hormigas': 'aco'}
docs = {}
for carpeta, algo in TEMAS.items():
    with open(os.path.join(CARPETA, carpeta, 'index.html'), encoding='utf-8') as f:
        docs[carpeta] = Tree(f.read()).root

for carpeta, doc in docs.items():
    canvas = next(doc.find(lambda n: 'slide-canvas' in n.cls))
    check(canvas.attrs.get('data-algo') == TEMAS[carpeta], carpeta + ': color del tema')
    slides = list(doc.find(lambda n: 'lo-slide' in n.cls))
    check(len(slides) >= 7, carpeta + ': tiene los pasos del ejemplo')
    check(sum('is-current' in s.cls for s in slides) == 1, carpeta + ': empieza en un solo paso')
    for n, s in enumerate(slides, 1):
        leads = list(s.find(lambda x: 'slide-lead' in x.cls))
        check(len(leads) == 1 and len(leads[0].text()) <= 90, '%s, paso %d: una línea de texto' % (carpeta, n))
        check(next(s.find(lambda x: 'section-progress' in x.cls), None) is not None, '%s, paso %d: progreso' % (carpeta, n))
    scripts = [n.attrs['src'] for n in doc.find(lambda n: n.tag == 'script' and 'src' in n.attrs)]
    check(scripts == ['../ejemplo.js', '../../shared/canvas.js', '../../shared/section.js', '../../visor-bridge.js'],
          carpeta + ': scripts locales, sin conexión a internet')

    # Matriz idéntica en los cuatro temas
    matrices = list(doc.find(lambda n: n.attrs.get('data-check') == 'matriz'))
    check(len(matrices) == 1, carpeta + ': una matriz de distancias')
    leida = [[0 if v == '–' else int(v) for v in cells[1:]] for _, cells in rows(matrices[0])]
    check(leida == D and [c[0] for _, c in rows(matrices[0])] == list(L), carpeta + ': la matriz coincide')

    # Costos de tours mostrados junto a una figura o individuo
    for node in doc.find(lambda n: 'data-tour' in n.attrs and 'data-cost' in n.attrs):
        tour, c = node.attrs['data-tour'], int(node.attrs['data-cost'])
        check(cost(tour) == c, '%s: %s cuesta %d, no %d' % (carpeta, tour, cost(tour), c))
        if 'an-ind' in node.cls:
            check(letters(node.text()) == tour[1:] and node.text().endswith(str(c)), '%s: individuo %s' % (carpeta, tour))
        else:
            check(dash(tour) in node.text() and node.text().endswith(str(c)), '%s: rótulo de %s' % (carpeta, tour))

    # Sumas término a término
    for node in doc.find(lambda n: 'data-tour' in n.attrs and 'data-cost' not in n.attrs and n.tag not in ('table', 'svg')):
        tour = node.attrs['data-tour']
        m = re.search(r'(\d+(?: \+ \d+){4}) = (\d+)', node.text())
        terms = [D[I[tour[i]]][I[tour[(i + 1) % 5]]] for i in range(5)]
        check(m and [int(x) for x in m.group(1).split(' + ')] == terms and int(m.group(2)) == cost(tour),
              '%s: suma de %s' % (carpeta, tour))
        if node.text().startswith('A-'):
            check(node.text().startswith(dash(tour)), '%s: suma de %s' % (carpeta, tour))

    # Grafos: recorridos válidos y feromona
    for svg in doc.find(lambda n: 'an-graph' in n.cls):
        ruta = svg.attrs.get('data-tour') or svg.attrs.get('data-path') or 'A'
        check(ruta[0] == 'A' and len(set(ruta)) == len(ruta) and set(ruta) <= set(L), carpeta + ': recorrido del grafo')
        if ':' in svg.attrs.get('data-tau', ''):
            dibujada = {e: 0.5 for e in map(''.join, itertools.combinations(L, 2))}
            dibujada.update({k: float(v) for k, v in (p.split(':') for p in svg.attrs['data-tau'].split(','))})
            check(all(abs(dibujada[e] - tau[frozenset(e)]) < 1e-9 for e in dibujada), carpeta + ': grosor de la feromona')


def tablas(carpeta, nombre):
    return list(docs[carpeta].find(lambda n: n.attrs.get('data-check') == nombre))


# ------------------------------------------------- Tema A
[tramos] = tablas('busqueda-local', 'tramos')
tour = tramos.attrs['data-tour']
check([c for _, c in rows(tramos)] == [['%s → %s' % (tour[i], (tour + 'A')[i + 1]), str(D[I[tour[i]]][I[(tour + 'A')[i + 1]]])]
                                        for i in range(5)], 'A2: tramos del tour inicial')

vecinos = tablas('busqueda-local', 'vecinos')
check([v.attrs['data-from'] for v in vecinos] == ['ABCDE', 'ABCED'], 'A: tablas de las iteraciones 1 y 2')
for table in vecinos:
    t = table.attrs['data-from']
    esperadas = list(swaps(t))
    mejor = min(range(6), key=lambda k: cost(esperadas[k][1]))
    mejora = cost(esperadas[mejor][1]) < cost(t)
    for k, (tr, cells) in enumerate(rows(table)):
        m, u = esperadas[k]
        check(cells[:3] == [pair(m), dash(u), str(cost(u))], 'A: vecino %s desde %s' % (pair(m), t))
        check(cells[3].split()[0] == ('sí' if cost(u) < cost(t) else 'no'), 'A: ¿mejora? %s desde %s' % (pair(m), t))
        check(('is-pick' in tr.cls) == (k == mejor and mejora), 'A: elegido desde %s' % t)
        check(('is-best' in tr.cls) == (k == mejor and not mejora), 'A: mejor sin mejora desde %s' % t)
    check(len(rows(table)) == 6, 'A: 6 vecinos desde %s' % t)

[tabla] = tablas('busqueda-local', 'primera')
leidas = [c for _, c in rows(tabla)]
check(len(leidas) == len(primera), 'A8: número de iteraciones de primera mejora')
for k, ((t, pos, m, u, ev), cells) in enumerate(zip(primera, leidas), 1):
    if pos:
        fila = [str(k), dash(t), str(cost(t)), '(%d,%d) %s' % (pos + (pair(m),)), dash(u), str(cost(u)), str(ev)]
    else:
        fila = [str(k), dash(t), str(cost(t)), 'ninguno', '—', '—', '%d (parada)' % ev]
    check(cells == fila, 'A8: fila %d de primera mejora' % k)
[mejor_ev] = tablas('busqueda-local', 'evaluaciones-mejor')
[primera_ev] = tablas('busqueda-local', 'evaluaciones-primera')
check(mejor_ev.text() == str(6 * len([37, 22])), 'A8: evaluaciones de mejor mejora')
check(primera_ev.text() == str(sum(p[4] for p in primera)), 'A8: evaluaciones de primera mejora')

# ------------------------------------------------- Tema B
for k, table in enumerate(tablas('busqueda-tabu', 'tabu')):
    t, lista, x = tabu_iter[k]
    check(table.attrs['data-from'] == t and table.attrs['data-best'] == str(x)
          and table.attrs['data-tabu'] == ','.join(''.join(sorted(m)) for m in lista), 'B: contexto de la iteración %d' % (k + 1))
    esperadas = list(swaps(t))
    permitido = [m not in lista or cost(u) < x for m, u in esperadas]
    elegido = min((cost(u), sorted(m), n) for n, (m, u) in enumerate(esperadas) if permitido[n])[2]
    for n, (tr, cells) in enumerate(rows(table)):
        m, u = esperadas[n]
        estado = 'elegido' if n == elegido else 'aspiración' if m in lista and permitido[n] else 'TABÚ' if m in lista else 'permitido'
        check(cells[:3] == [pair(m), dash(u), str(cost(u))], 'B%d: vecino %s' % (k + 2, pair(m)))
        check(cells[3].startswith(estado), 'B%d: estado de %s es %s' % (k + 2, pair(m), estado))
        check(('is-pick' in tr.cls) == (n == elegido) and ('is-tabu' in tr.cls) == (estado == 'TABÚ'),
              'B%d: resaltado de %s' % (k + 2, pair(m)))

for box in tablas('busqueda-tabu', 'estado'):
    k = int(box.attrs['data-iter'])
    lista, actual, x = ([], 37, 37) if k == 0 else (hist[k - 1][2], hist[k - 1][0], hist[k - 1][1])
    slots = [s.text() for s in box.find(lambda n: n.parent and 'an-tabu' in n.parent.cls and 'is-out' not in n.cls and 'is-empty' not in n.cls)]
    check(slots == [pair(m) for m in lista], 'B: lista tabú tras la iteración %d' % k)
    valores = {n.attrs['data-role']: n.text() for n in box.find(lambda n: 'data-role' in n.attrs)}
    check(valores == {'actual': str(actual), 'best': str(x)}, 'B: actual y x* tras la iteración %d' % k)

[asp] = tablas('busqueda-tabu', 'aspiracion')
t, x = asp.attrs['data-from'], int(asp.attrs['data-best'])
prohibidos = [p for p in asp.attrs['data-tabu'].split(',')]
for (tr, cells), p in zip(rows(asp), prohibidos):
    u = next(u for m, u in swaps(t) if ''.join(sorted(m)) == p)
    check(cells[:3] == [pair(p), str(cost(u)), 'sí' if cost(u) < x else 'no'], 'B5: aspiración de %s' % pair(p))
[chart] = tablas('busqueda-tabu', 'historial')
check(chart.attrs['data-actual'] == ','.join(map(str, [37] + [h[0] for h in hist[:3]]))
      and chart.attrs['data-best'] == ','.join(map(str, [37] + [h[1] for h in hist[:3]])), 'B6: gráfica del costo')

# ------------------------------------------------- Tema C
[tabla] = tablas('algoritmo-genetico', 'poblacion')
for k, (tr, cells) in enumerate(rows(tabla)):
    x = pop0[k]
    fila = ['P%d' % (k + 1), ' '.join(x), dash('A' + x), str(cost('A' + x)),
            '%.2f' % fit[k], '%.2f' % (fit[k] / sum(fit)), '%.2f' % acum[k]]
    check([cells[0], ' '.join(letters(cells[1]))] + cells[2:] == fila, 'C2: fila de P%d' % (k + 1))
check(rows(tabla, 'tfoot')[0][1][3:6] == ['Promedio %.2f' % (sum(cost('A' + x) for x in pop0) / 4), 'Suma %.2f' % sum(fit), '1.00'],
      'C2: promedio y suma')

[tabla] = tablas('algoritmo-genetico', 'ruleta')
limites = ['0'] + ['%.2f' % a for a in acum]
for k, (tr, cells) in enumerate(rows(tabla)):
    r = float(cells[1]); i = next(i for i, a in enumerate(acum) if r <= a)
    intervalo = ('[%s, %s]' if i == 0 else '(%s, %s]') % (limites[i], limites[i + 1])
    check(cells == [str(k + 1), cells[1], intervalo, 'P%d' % (i + 1)] and i == padres[k], 'C3: giro %d' % (k + 1))
[pie] = docs['algoritmo-genetico'].find(lambda n: 'an-pie' in n.cls)
check(pie.attrs['data-p'] == ','.join('P%d:%.2f' % (k + 1, f / sum(fit)) for k, f in enumerate(fit))
      and pie.attrs['data-r'] == ','.join(c[1] for _, c in rows(tabla)), 'C3: ruleta dibujada')

for block in tablas('algoritmo-genetico', 'ox'):
    p1, p2, hijo = block.attrs['data-p1'], block.attrs['data-p2'], block.attrs['data-child']
    check(ox(p1, p2) == hijo, 'C: OX(%s, %s) = %s' % (p1, p2, hijo))
    filas = [n for n in block.kids if isinstance(n, Node) and 'an-ox-label' not in n.cls]
    check([letters(f.text()) for f in filas[:2]] == [p1, p2] and letters(filas[3].text()) == hijo, 'C: padres e hijo de OX(%s, %s)' % (p1, p2))
    recorrido = [p2[(3 + k) % 4] for k in range(4)]
    genes = list(filas[2].find(lambda n: 'an-g' in n.cls))
    check([g.text() for g in genes] == recorrido, 'C: recorrido del otro padre en OX(%s, %s)' % (p1, p2))
    check([g.text() for g in genes if 'an-skip' in g.cls] == [g for g in recorrido if g in p1[1:3]],
          'C: genes saltados en OX(%s, %s)' % (p1, p2))
    segmento = [g.text() for g in filas[0].find(lambda n: 'is-seg' in n.cls)]
    check(segmento == list(p1[1:3]), 'C: segmento copiado de %s' % p1)

[tabla] = tablas('algoritmo-genetico', 'mutacion')
sin_mutar = [ox(pop0[2], pop0[3]), ox(pop0[3], pop0[2]), pop0[1], pop0[0]]
for k, (tr, cells) in enumerate(rows(tabla)):
    r = float(cells[2]); x = sin_mutar[k]; y = x[:2] + x[3] + x[2] if r < 0.1 else x
    check(r == r_mut[k] and cells == ['H%d' % (k + 1), ' '.join(x).replace(' ', ''), cells[2], 'sí' if r < 0.1 else 'no',
                                      y, str(cost('A' + y))] and ('is-pick' in tr.cls) == (r < 0.1), 'C7: hijo %d' % (k + 1))

[tabla] = tablas('algoritmo-genetico', 'generaciones')
pops = [n.attrs['data-pop'].split(',') for n in tabla.find(lambda n: 'data-pop' in n.attrs)]
check(pops == [pop0, pop1], 'C9: individuos de las generaciones 0 y 1')
for node, pop in zip(tabla.find(lambda n: 'data-pop' in n.attrs), pops):
    check(re.findall(r'[A-E]{4}|\d+', node.text().replace(' ', '')) == [v for x in pop for v in (x, str(cost('A' + x)))],
          'C9: cromosomas y costos dibujados')
filas = {c[0]: c[1:] for _, c in rows(tabla)}
check(filas['Mejor costo'] == [str(min(cost('A' + x) for x in pop0)), '%d (óptimo)' % min(cost('A' + x) for x in pop1)]
      and filas['Costo promedio'] == ['%.2f' % (sum(cost('A' + x) for x in pop0) / 4), '%.2f' % (sum(cost('A' + x) for x in pop1) / 4)],
      'C9: mejor costo y promedio')

# ------------------------------------------------- Tema D
aco = tablas('colonia-hormigas', 'aco')
check([t.attrs['data-r'] for t in aco] == ['0.30', '0.45', '0.40', '0.75', '0.20', '0.60'], 'D: números aleatorios de las hormigas')
for table in aco:
    frm, visited, r = table.attrs['data-from'], table.attrs['data-visited'], float(table.attrs['data-r'])
    cands, w, s = probs(frm, visited)
    acc = list(itertools.accumulate(w[j] / s for j in cands))
    elegido = next(j for j, a in zip(cands, acc) if r <= a)
    filas = [[j, str(D[I[frm]][I[j]]), '%.4f' % w[j], '%.2f' % (w[j] / s), '%.2f' % a] for j, a in zip(cands, acc)]
    check([c for _, c in rows(table)] == filas, 'D: probabilidades desde %s (r = %s)' % (frm, r))
    check([c[0] for tr, c in rows(table) if 'is-pick' in tr.cls] == [elegido], 'D: r = %s elige %s' % (r, elegido))
    check(rows(table, 'tfoot')[0][1][2] == 'Suma %.4f' % s, 'D: suma de pesos desde %s' % frm)
    articulo = table.up('article')
    [barra] = articulo.find(lambda n: 'an-bar' in n.cls)
    check(barra.attrs['data-p'] == ','.join('%s:%s' % (f[0], f[3]) for f in filas)
          and barra.attrs['data-r'] == table.attrs['data-r'] and barra.attrs['data-pick'] == elegido, 'D: barra desde %s' % frm)

[tabla] = tablas('colonia-hormigas', 'feromona')
usadas = [{frozenset((x[i], x[(i + 1) % 5])) for i in range(5)} for x in ('ADCEB', 'ADBEC')]
leidas = rows(tabla)
check(len(leidas) == 10 and {c[0] for _, c in leidas} == {'-'.join(e) for e in itertools.combinations(L, 2)}, 'D9: las 10 aristas')
for tr, cells in leidas:
    e = frozenset(cells[0].split('-'))
    fila = [cells[0], '0.5', '✓' if e in usadas[0] else '', '✓' if e in usadas[1] else '', '%.1f' % tau[e]]
    check(cells == fila, 'D9: feromona de %s' % cells[0])

[tabla] = tablas('colonia-hormigas', 'aco-next')
_, w1, s1 = probs('A', 'A')
_, w2, s2 = probs('A', 'A', tau)
for tr, cells in rows(tabla):
    j = cells[0]; e = frozenset(('A', j))
    fila = [j, '%.1f' % tau[e], str(D[0][I[j]]), '%.4f' % w2[j], '%.2f' % (w2[j] / s2), '%.2f' % (w1[j] / s1)]
    check(cells == fila, 'D10: probabilidad nueva de A → %s' % j)

print('OK: %d comprobaciones.' % OK)
