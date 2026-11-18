# Presentación de Optimización: organización por persona y por algoritmo

**Abre `/index.html` desde la raíz del repositorio para la exposición.** La página permite seleccionar el único algoritmo sorteado. En orden, muestra: Angie Donato → Angie Loango → Andrés (pendiente) → Carolina. El código CSS/JS de los integrantes no se mezcla, pues cada presentación se carga en un iframe distinto.

## Temas (iguales en las cuatro carpetas personales)
- `busqueda-local/index.html`
- `busqueda-tabu/index.html`
- `algoritmo-genetico/index.html`
- `colonia-hormigas/index.html`

## Estructura
```
index.html                         ← Selector general (no editar sin coordinación)
presentacion/
  visor-bridge.js                  ← Navegación común (no editar sin coordinación)
  angie-donato/
    index.html                     ← Respaldo íntegro de sus cuatro temas
    estilos.css                    ← Estilos compartidos de sus temas
    busqueda-local/index.html
    busqueda-tabu/index.html
    algoritmo-genetico/index.html
    colonia-hormigas/index.html
  angie-loango/
    index.html                     ← Respaldo íntegro
    estilos.css
    loango.js, algoritmos.py, pruebas_algoritmos.py, LEEME.txt
    [las cuatro carpetas de temas]/index.html
  andres/
    [las cuatro carpetas de temas]/index.html  ← Contenido aún pendiente
  carolina/
    index.html                     ← Respaldo íntegro, incluida comparación y preguntas
    estilos.css
    [las cuatro carpetas de temas]/index.html
```

## Trabajo seguro en GitHub
1. Crea una rama desde `diapo_1` para tus cambios.
2. **Edita solo tu carpeta y el `index.html` del tema que deseas modificar.** Ya no hace falta buscar el tema en un HTML gigante.
3. Los archivos `estilos.css` de cada integrante aplican a sus cuatro temas: cambiarlos afecta los cuatro, pero no los de otra persona.
4. Haz commit y push, abre Pull Request a `diapo_1` y revisa `Files changed` antes de fusionar.
5. No modifiques la portada ni `visor-bridge.js` sin coordinarlo con el equipo.

Los antiguos HTML completos de Angie Donato, Angie Loango y Carolina **se conservaron byte a byte**; se añadieron las versiones independientes. El código y las pruebas Python de Angie Loango también permanecen intactos.

## Selector y Andrés
El visor abre `presentacion/<persona>/<tema>/index.html` y envía `?integrada=1&tema=...`. Para Andrés, el visor sigue marcando el bloque como pendiente (sus cuatro carpetas tienen solo páginas provisionales). Cuando Andrés cree sus diapositivas, el equipo podrá conectar esa parte al visor sin tocar las de otras personas.

Esta organización reduce riesgos, pero GitHub no impone permisos por carpetas: conviene usar ramas y Pull Requests.
