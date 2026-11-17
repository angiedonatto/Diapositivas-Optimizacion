"""Heurísticas y metaheurísticas: los cuatro métodos de la exposición.

Instancia común del guion: agente viajero de 5 ciudades con distancias
simétricas. Todos los tours empiezan y terminan en A.

En la Búsqueda Local, la Tabú y el Genético, una solución se escribe como
el orden de B, C, D y E, porque A es fija al inicio y al final.

Las funciones que aparecen en las diapositivas son exactamente las de
este archivo (lo comprueba pruebas_algoritmos.py).
"""
import random
from collections import deque

CIUDADES = ['A', 'B', 'C', 'D', 'E']
D = {
    'A': {'B': 6, 'C': 4, 'D': 2, 'E': 10},
    'B': {'A': 6, 'C': 7, 'D': 6, 'E': 6},
    'C': {'A': 4, 'B': 7, 'D': 9, 'E': 2},
    'D': {'A': 2, 'B': 6, 'C': 9, 'E': 5},
    'E': {'A': 10, 'B': 6, 'C': 2, 'D': 5},
}


# ---------------------------------------------------------------------
# Piezas comunes: representación, función objetivo y vecindario
# ---------------------------------------------------------------------
def longitud(tour):
    """Distancia total de un tour completo, por ejemplo A-B-C-D-E-A."""
    return sum(D[i][j] for i, j in zip(tour, tour[1:]))


def costo(x):
    """Función objetivo f(x): x es el orden de B, C, D y E."""
    return longitud(['A'] + list(x) + ['A'])


def vecinos_swap(x):
    """Vecindario N(x): intercambiar dos ciudades de posición.

    Devuelve cada vecino junto con su movimiento, por ejemplo ('C', 'D'),
    que es el atributo que guarda la lista tabú.
    """
    for i in range(len(x)):
        for j in range(i + 1, len(x)):
            v = list(x)
            v[i], v[j] = v[j], v[i]
            yield v, tuple(sorted((x[i], x[j])))


# ---------------------------------------------------------------------
# A. Búsqueda Local
# ---------------------------------------------------------------------
def busqueda_local(x, primera_mejora=False):
    while True:
        mejor, f_mejor = None, costo(x)
        for v, _ in vecinos_swap(x):
            if costo(v) < f_mejor:
                mejor, f_mejor = v, costo(v)
                if primera_mejora:
                    break  # el primero que mejore
        if mejor is None:
            return x  # ningún vecino mejora: óptimo local
        x = mejor  # solo aceptamos movimientos que mejoran


# ---------------------------------------------------------------------
# B. Búsqueda Tabú
# ---------------------------------------------------------------------
def busqueda_tabu(x, tenencia=2, iteraciones=3):
    mejor = x  # x*: la mejor encontrada
    tabu = deque(maxlen=tenencia)  # T: memoria de corto plazo
    for _ in range(iteraciones):  # criterio de parada
        candidatos = [(v, m) for v, m in vecinos_swap(x)
                      if m not in tabu  # movimiento permitido
                      or costo(v) < costo(mejor)]  # aspiración
        if not candidatos:
            break
        # el mejor candidato, aunque empeore
        x, m = min(candidatos, key=lambda c: costo(c[0]))
        tabu.append(m)  # si T se llena, sale el más viejo
        if costo(x) < costo(mejor):
            mejor = x
    return mejor


# ---------------------------------------------------------------------
# C. Algoritmo Genético
# ---------------------------------------------------------------------
def aptitud(x):
    """Aptitud (fitness): el tour más corto tiene más aptitud."""
    return 100 / costo(x)


def ruleta(P):
    """Selección por ruleta: tajada proporcional a la aptitud."""
    r = random.random() * sum(aptitud(x) for x in P)
    for x in P:
        r -= aptitud(x)
        if r < 0:
            return x
    return P[-1]


def cruce_ox(p1, p2, a, b):
    """Cruce OX: copia p1[a..b] y completa con las ciudades que faltan,
    en el orden de p2, empezando después del segundo corte."""
    n = len(p1)
    hijo = [None] * n
    hijo[a:b + 1] = p1[a:b + 1]
    despues = [(b + 1 + k) % n for k in range(n)]
    faltan = [p2[k] for k in despues if p2[k] not in hijo]
    libres = [k for k in despues if hijo[k] is None]
    for k, ciudad in zip(libres, faltan):
        hijo[k] = ciudad
    return hijo


def mutar(h, pm):
    """Mutación: con probabilidad pm intercambia dos genes."""
    if random.random() < pm:
        i, j = random.sample(range(len(h)), 2)
        h[i], h[j] = h[j], h[i]
    return h


def algoritmo_genetico(P, G=1, pc=0.9, pm=0.1):
    for _ in range(G):  # G generaciones
        Q = []
        while len(Q) < len(P):
            p1, p2 = ruleta(P), ruleta(P)  # selección
            if random.random() < pc:  # cruce OX
                a, b = sorted(random.sample(range(len(p1)), 2))
                h1 = cruce_ox(p1, p2, a, b)
                h2 = cruce_ox(p2, p1, a, b)
            else:
                h1, h2 = p1[:], p2[:]  # si no, copias
            Q += [mutar(h1, pm), mutar(h2, pm)]  # mutación
        peor = max(range(len(Q)), key=lambda i: costo(Q[i]))
        Q[peor] = min(P, key=costo)[:]  # elitismo
        P = Q
    return min(P, key=costo)


# ---------------------------------------------------------------------
# D. Colonia de Hormigas
# ---------------------------------------------------------------------
def arista(i, j):
    return tuple(sorted((i, j)))


ARISTAS = [arista(i, j) for i in CIUDADES for j in CIUDADES if i < j]


def colonia_hormigas(hormigas=2, iteraciones=1, alfa=1, beta=2,
                     rho=0.5, Q=10, tau0=1):
    tau = {e: tau0 for e in ARISTAS}  # feromona inicial
    mejor = None
    for _ in range(iteraciones):
        tours = []
        for _ in range(hormigas):
            t = ['A']  # ubicar la hormiga
            while len(t) < len(CIUDADES):
                libres = [j for j in CIUDADES if j not in t]
                pesos = [tau[arista(t[-1], j)] ** alfa
                         * (1 / D[t[-1]][j]) ** beta for j in libres]
                t.append(random.choices(libres, pesos)[0])  # p_ij
            tours.append(t + ['A'])  # cerrar el tour
        for e in tau:
            tau[e] *= 1 - rho  # evaporar
        for t in tours:
            for i, j in zip(t, t[1:]):
                tau[arista(i, j)] += Q / longitud(t)  # depositar
            if mejor is None or longitud(t) < longitud(mejor):
                mejor = t
    return mejor, tau


if __name__ == '__main__':
    print('Búsqueda Local:', busqueda_local(['B', 'C', 'D', 'E']))
    print('Búsqueda Tabú:', busqueda_tabu(['B', 'C', 'D', 'E']))
    poblacion = [['B', 'C', 'D', 'E'], ['E', 'C', 'D', 'B'],
                 ['C', 'B', 'E', 'D'], ['B', 'D', 'E', 'C']]
    print('Genético (azar real, 30 generaciones):',
          algoritmo_genetico(poblacion, G=30))
    print('Hormigas (azar real, 20 iteraciones, 5 hormigas):',
          colonia_hormigas(hormigas=5, iteraciones=20)[0])
