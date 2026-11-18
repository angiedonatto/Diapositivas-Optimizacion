# Presentación de Optimización

Desde la raíz del repositorio, sirve el sitio estático con Python 3:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000/` en el navegador. Selecciona un algoritmo y pulsa **Iniciar presentación**. El visor recorre **Angie Donato → Angie Loango → Andrés → Carolina → Preguntas** para el tema elegido. Usa **→** y **←** para avanzar o retroceder por cada aparición, **F** para alternar pantalla completa y **Esc** para salir de ella. Mueve el cursor hacia abajo o pulsa **Tab** para mostrar los controles y volver a la portada.

## Organización

Cada integrante tiene una carpeta por tema bajo `presentacion/<integrante>/<tema>/index.html`. Los nombres de carpeta son `busqueda-local`, `busqueda-tabu`, `algoritmo-genetico` y `colonia-hormigas`.

- **Angie Donato** mantiene el guion y las notas de ensayo en los HTML de cada tema. Cada objeto de `slides` contiene el texto, la ruta y los datos de su diapositiva.
- **Angie Loango** mantiene los cuatro capítulos, diagramas, apariciones, pseudocódigo y ejemplos en su sección. Los HTML de los temas usan sus controles en la vista individual y el visor coordina la navegación al proyectarlos.
- **Andrés** tiene una diapositiva provisional por tema. Puede añadir más elementos `<article class="lo-slide">` dentro de `.slide-canvas`, con título, `.lo-s-body`, pie y `.section-progress`. Si habilita la vista individual con varias diapositivas, puede reutilizar los botones `data-section-prev` y `data-section-next` de Carolina. Las tarjetas `.lo-c`, las tablas HTML y `.formula` admiten matrices, operaciones y resultados.
- **Carolina** conserva el HTML de estudio como fuente. El bloque genera la introducción con cifras, las ventajas y limitaciones, el análisis específico, la comparación con la aplicación real y la conclusión desde el panel de su tema. Para editar ese contenido, modifica las tarjetas de `.panel`. El anexo y las preguntas frecuentes se abren con `?estudio#preguntas` desde la pantalla de cierre.

Los HTML completos de respaldo de Angie Donato, Angie Loango y Carolina siguen en la raíz de sus carpetas personales.

## Plantilla compartida

- `shared/tokens.css` contiene la paleta de Loango, el color de cada algoritmo mediante `data-algo` y las fuentes de código y fórmulas.
- `shared/slides.css` define márgenes, jerarquía tipográfica, encabezados, pies, tarjetas y apariciones de las diapositivas.
- `shared/projection.css` añade las composiciones de dos columnas, las tablas y las reglas que ocultan los controles propios cuando el HTML forma parte del visor.
- `shared/canvas.js` ajusta el lienzo de **1600 × 900** al espacio disponible y conserva su proporción al redimensionar.
- `shared/section.js` maneja la navegación de los bloques formados por artículos `.lo-slide`.
- `shared/viewer.css`, `shared/viewer.js` y `visor-bridge.js` gestionan la portada, la pantalla completa y los eventos entre el visor y los iframes.

Mantén los elementos académicos dentro de `.lo-s-body` y reserva el pie para la sección y el progreso. Divide una composición densa en varias diapositivas. Trabaja en una rama propia y revisa los cambios por integrante antes de fusionarlos a `diapo_1`.

## Pruebas de los algoritmos

```bash
python3 -B presentacion/angie-loango/pruebas_algoritmos.py
```

El sitio se puede servir directamente desde un alojamiento estático como Vercel.
