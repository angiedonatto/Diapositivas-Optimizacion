"""Pruebas de los cuatro algoritmos.

Uso:  python pruebas_algoritmos.py

1. Reproducen el ejemplo del guion. Donde el guion usa números
   aleatorios (r), se usan exactamente esos mismos valores.
2. Ejecutan cada algoritmo con azar real y comprueban propiedades que
   siempre deben cumplirse.
3. Comprueban que el código de las diapositivas es idéntico al de
   algoritmos.py.
"""
import inspect
import itertools
import json
import os
import random
import re

import algoritmos as alg

OK = 0


def check(cond, msg):
    global OK
    assert cond, msg
    OK += 1


class AzarDelGuion:
    """Sustituye al módulo random con valores fijos del guion."""

    def __init__(self, valores, muestras=()):
        self.valores = list(valores)
        self.muestras = list(muestras)

    def random(self):
        return self.valores.pop(0)

    def sample(self, poblacion, k):
        return list(self.muestras.pop(0))

    def choices(self, poblacion, weights):
        # Igual que random.choices: r * suma de pesos, primer acumulado > r.
        # Cuando solo queda una ciudad, la elección es forzada (el guion
        # no tira número en ese caso).
        if len(poblacion) == 1:
            return [poblacion[0]]
        r = self.random() * sum(weights)
        for ciudad, acum in zip(poblacion, itertools.accumulate(weights)):
            if r < acum:
                return [ciudad]
        return [poblacion[-1]]


def con_azar(azar, funcion, *args, **kwargs):
    original = alg.random
    alg.random = azar
    try:
        return funcion(*args, **kwargs)
    finally:
        alg.random = original


INICIO = ['B', 'C', 'D', 'E']

# ---------------------------------------------------------------- instancia
check(alg.costo(INICIO) == 37, 'A-B-C-D-E-A cuesta 37')
tours = {min(tuple(p), tuple(reversed(p)))
         for p in itertools.permutations('BCDE')}
check(len(tours) == 12, 'hay 12 tours distintos')
optimo = min(tours, key=alg.costo)
check(alg.costo(optimo) == 20, 'el óptimo cuesta 20')
check(alg.costo(['D', 'B', 'E', 'C']) == 20, 'A-D-B-E-C-A = 20')

# ---------------------------------------------------------- Búsqueda Local
costos = [alg.costo(v) for v, _ in alg.vecinos_swap(INICIO)]
check(costos == [32, 34, 33, 33, 30, 22], 'vecinos de la iteración 1')
costos = [alg.costo(v) for v, _ in alg.vecinos_swap(['B', 'C', 'E', 'D'])]
check(costos == [24, 27, 25, 25, 23, 37], 'vecinos de la iteración 2')
x = alg.busqueda_local(INICIO)
check(x == ['B', 'C', 'E', 'D'] and alg.costo(x) == 22,
      'mejor mejora: se detiene en A-B-C-E-D-A = 22')
x = alg.busqueda_local(INICIO, primera_mejora=True)
check(x == ['D', 'E', 'C', 'B'] and alg.costo(x) == 22,
      'primera mejora: termina en A-D-E-C-B-A = 22')

# ----------------------------------------------------------- Búsqueda Tabú
for its, esperado in [(1, 22), (2, 22), (3, 20)]:
    check(alg.costo(alg.busqueda_tabu(INICIO, 2, its)) == esperado,
          'mejor encontrada tras %d iteraciones' % its)
listas = []


class DequeEspia(alg.deque):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        listas.append(self)


alg.deque, original = DequeEspia, alg.deque
x = alg.busqueda_tabu(INICIO, tenencia=2, iteraciones=3)
alg.deque = original
check(x == ['D', 'B', 'E', 'C'], 'la Tabú llega a A-D-B-E-C-A')
check(list(listas[0]) == [('C', 'D'), ('B', 'D')],
      'lista final [C↔D, B↔D]: D↔E salió por la tenencia 2')

# ------------------------------------------------------ Algoritmo Genético
P = [['B', 'C', 'D', 'E'], ['E', 'C', 'D', 'B'],
     ['C', 'B', 'E', 'D'], ['B', 'D', 'E', 'C']]
apt = [alg.aptitud(p) for p in P]
check([round(a, 2) for a in apt] == [2.70, 3.03, 4.17, 4.35], 'aptitudes')
check(round(sum(apt), 2) == 14.25, 'suma de aptitudes')
sel = [con_azar(AzarDelGuion([r]), alg.ruleta, P) for r in
       (0.62, 0.81, 0.35, 0.08)]
check(sel == [P[2], P[3], P[1], P[0]], 'ruleta: P3, P4, P2, P1')
check(alg.cruce_ox(P[2], P[3], 1, 2) == ['D', 'B', 'E', 'C'], 'hijo 1 OX')
check(alg.cruce_ox(P[3], P[2], 1, 2) == ['B', 'D', 'E', 'C'], 'hijo 2 OX')
check(con_azar(AzarDelGuion([0.05], [(2, 3)]), alg.mutar,
               ['B', 'C', 'D', 'E'], 0.1) == ['B', 'C', 'E', 'D'],
      'mutación de B C D E en los genes 3 y 4')
# Generación completa, en el orden en que el código pide los números:
# pareja 1: ruleta .62 y .81, cruce .30 (cortes en genes 2 y 3), mutaciones;
# pareja 2: ruleta .35 y .08, cruce .95, mutaciones.
# El guion solo dice que el único hijo que muta es B C D E; para los otros
# se usa 0.5 (cualquier valor >= 0.1 da lo mismo).
azar = AzarDelGuion([0.62, 0.81, 0.30, 0.5, 0.5, 0.35, 0.08, 0.95, 0.5, 0.05],
                    [(1, 2), (2, 3)])
mejor = con_azar(azar, alg.algoritmo_genetico, [p[:] for p in P], G=1)
check(not azar.valores and not azar.muestras, 'se usaron todos los r')
check(mejor == ['D', 'B', 'E', 'C'] and alg.costo(mejor) == 20,
      'mejor de la generación 1: A-D-B-E-C-A = 20')
Q = [['D', 'B', 'E', 'C'], ['B', 'D', 'E', 'C'],
     ['E', 'C', 'D', 'B'], ['B', 'C', 'E', 'D']]
peor = max(range(4), key=lambda i: alg.costo(Q[i]))
Q[peor] = min(P, key=alg.costo)
check(sum(map(alg.costo, P)) / 4 == 29.25, 'promedio generación 0')
check(sum(map(alg.costo, Q)) / 4 == 22.0, 'promedio generación 1')

# ------------------------------------------------------ Colonia de Hormigas
azar = AzarDelGuion([0.30, 0.45, 0.40, 0.75, 0.20, 0.60])
mejor, tau = con_azar(azar, alg.colonia_hormigas, hormigas=2, iteraciones=1)
check(not azar.valores, 'se usaron todos los r')
check(mejor == ['A', 'D', 'B', 'E', 'C', 'A'] and alg.longitud(mejor) == 20,
      'la hormiga 2 encuentra A-D-B-E-C-A = 20')
tabla = {('A', 'D'): 1.4, ('B', 'E'): 1.4, ('C', 'E'): 1.4, ('B', 'D'): 1.0,
         ('A', 'C'): 1.0, ('A', 'B'): 0.9, ('C', 'D'): 0.9, ('A', 'E'): 0.5,
         ('B', 'C'): 0.5, ('D', 'E'): 0.5}
check(all(abs(tau[e] - v) < 1e-9 for e, v in tabla.items()),
      'tabla de feromona del guion')


def p_desde_A(tau):
    pesos = {j: tau[alg.arista('A', j)] * (1 / alg.D['A'][j]) ** 2
             for j in 'BCDE'}
    return pesos['D'] / sum(pesos.values())


check(round(p_desde_A({e: 1 for e in alg.ARISTAS}), 2) == 0.71, 'P(A→D) antes')
check(round(p_desde_A(tau), 2) == 0.79, 'P(A→D) después')

# ------------------------------------------------- con azar real (semillas)
for semilla in range(300):
    random.seed(semilla)
    x0 = random.sample('BCDE', 4)
    x = alg.busqueda_local(x0, primera_mejora=semilla % 2 == 0)
    check(all(alg.costo(v) >= alg.costo(x) for v, _ in alg.vecinos_swap(x)),
          'la Búsqueda Local termina en un óptimo local')
    t = alg.busqueda_tabu(x0, tenencia=2, iteraciones=10)
    check(sorted(t) == list('BCDE') and alg.costo(t) <= alg.costo(x0),
          'la Tabú nunca devuelve algo peor que el inicio')
    pob = [random.sample('BCDE', 4) for _ in range(6)]
    g = alg.algoritmo_genetico([p[:] for p in pob], G=5)
    check(sorted(g) == list('BCDE'), 'el Genético siempre da una permutación')
    check(alg.costo(g) <= min(map(alg.costo, pob)),
          'con elitismo el mejor nunca empeora')
    a, tau = alg.colonia_hormigas(hormigas=3, iteraciones=5)
    check(a[0] == a[-1] == 'A' and sorted(a[1:-1]) == list('BCDE'),
          'cada hormiga construye un tour válido')
    check(all(v > 0 for v in tau.values()), 'la feromona sigue positiva')

aciertos = 0
for semilla in range(200):
    random.seed(1000 + semilla)
    aciertos += alg.longitud(alg.colonia_hormigas(5, 20)[0]) == 20
check(aciertos >= 150, 'ACO con 5 hormigas y 20 iteraciones suele hallar 20')

# --------------------------------------- el código de las diapositivas
ruta_js = os.path.join(os.path.dirname(__file__), 'loango.js')
js = open(ruta_js, encoding='utf-8').read()
bloques = re.findall(r'code\((\[\s*".*?"\s*\]), \{', js, flags=re.S)
mostradas = {'busqueda_local': alg.busqueda_local,
             'busqueda_tabu': alg.busqueda_tabu,
             'algoritmo_genetico': alg.algoritmo_genetico,
             'colonia_hormigas': alg.colonia_hormigas}
check(len(bloques) == 4, 'hay cuatro bloques de código en las diapositivas')
for bloque, (nombre, funcion) in zip(bloques, mostradas.items()):
    texto = '\n'.join(json.loads(bloque))
    check(texto == inspect.getsource(funcion).rstrip(),
          'la diapositiva de %s es idéntica al archivo' % nombre)
    compile(texto, nombre, 'exec')

print('OK: %d comprobaciones.' % OK)
print('ACO con azar real halló el óptimo en %d de 200 corridas.' % aciertos)
