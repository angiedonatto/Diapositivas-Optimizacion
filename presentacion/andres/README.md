# andres · ejemplo en vivo por algoritmo

Cada tema resuelve paso a paso el agente viajero de cinco ciudades (óptimo A-D-B-E-C-A, costo 20):

- `busqueda-local/index.html`: mejor mejora con swap (37 → 22, óptimo local) y la variante de primera mejora.
- `busqueda-tabu/index.html`: tenencia 2 y aspiración; la lista tabú y la mejor solución x* se ven en cada paso (37 → 22 → 23 → 20).
- `algoritmo-genetico/index.html`: una generación completa con ruleta, cruce OX, mutación y elitismo.
- `colonia-hormigas/index.html`: dos hormigas, evaporación y depósito de feromona.

Cada diapositiva es un paso: las tablas, la ruleta, el cruce y la feromona se animan solos al entrar. Usa **→** y **←** para avanzar, **R** para volver al primer paso cuando abras un tema por separado y **F** para pantalla completa.

- `estilos.css` añade a la plantilla compartida las piezas del ejemplo, todas con el prefijo `an-`.
- `ejemplo.js` dibuja el grafo, la ruleta, las barras de probabilidad y la gráfica de costos a partir de atributos `data-*`. Así el grafo y sus distancias son idénticos en los cuatro temas.
- `pruebas_ejemplo.py` ejecuta el código de referencia y recalcula cada número de los cuatro HTML. Falla si alguna cifra no coincide:

```bash
python3 -B presentacion/andres/pruebas_ejemplo.py
```

Trabaja siempre en una rama y abre un Pull Request contra `diapo_1`.
