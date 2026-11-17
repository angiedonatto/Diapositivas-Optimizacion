# Presentación · organización por integrantes

Este directorio contiene **cuatro carpetas independientes**. Cada integrante es responsable de los cambios en su carpeta. La portada del repositorio (`/index.html`) es ahora el **selector de tema y presentador unificado**. No pertenece a ningún integrante: carga las cuatro secciones sin copiar su código.

```
Diapositivas-Optimizacion/
├── index.html                        # Selector por tema y visor unificado
├── presentacion/
│   ├── visor-bridge.js              # Comunicación opcional con el visor
│   ├── angie-donato/
│   │   ├── index.html                # Aperturas para los cuatro temas
│   │   └── README.md
│   ├── angie-loango/
│   │   ├── index.html                # Componentes, pseudocódigo, diapositivas
│   │   ├── loango.js
│   │   ├── algoritmos.py
│   │   ├── pruebas_algoritmos.py
│   │   └── LEEME.txt
│   ├── andres/
│   │   └── README.md                 # Carpeta reservada
│   └── carolina/
│       └── index.html                # Análisis crítico y preguntas
│
└── presentacion/README.md
```

## Acuerdo para editar de manera segura

1. Crear una rama para los cambios propios; no trabajar directamente en `main` ni en `diapo_1`.
2. Editar solamente los archivos de **su carpeta** (`presentacion/<integrante>/`).
3. Hacer `commit` y `push` de esa rama.
4. Abrir un Pull Request hacia la rama común del equipo, revisar la vista **Files changed**, y pedir revisión antes de fusionarlo.
5. Evitar cambiar `/index.html` y cualquier carpeta de otra persona; coordinarlo previamente si es necesario.

Importante: las carpetas **reducen conflictos por accidente**, pero no son permisos de acceso ni protegen contra borrar contenido de otros si alguien tiene permiso de escritura. Git conserva el historial y un Pull Request permite revisar cambios.

## Selección por sorteo

Los cuatro métodos son Búsqueda Local, Búsqueda Tabú, Algoritmo Genético y Colonia de Hormigas. Todas las personas preparan su bloque para los cuatro métodos. Tiempo previsto: Angie Donato 3 min; Angie Loango 4 min; Andrés 4,5 min; Carolina 2,5 min. Total 14 min, más preguntas.

## Cómo usar el visor por tema

1. Abrir `index.html` en Chrome o Safari desde una copia **completa** del repositorio (no abrir el HTML en la vista de código de GitHub).
2. Elegir uno de los cuatro métodos que haya sorteado el profesor.
3. Pulsar **Iniciar presentación**.
4. Usar **Siguiente** / **Anterior** para recorrer las diapositivas del bloque actual. Al terminar, el botón avanza a la siguiente persona.
5. También se puede saltar a un integrante con los cuatro botones de la parte superior y volver a escoger tema.
6. El bloque de Andrés está identificado como pendiente; no se presentan diapositivas ficticias.

El tema se transmite a las páginas individuales con `?integrada=1&tema=<local|tabu|ga|aco>`. El archivo compartido `visor-bridge.js` elige el algoritmo correcto y coordina el avance entre diapositivas mediante mensajes entre el visor y cada iframe.

**No se mezcla el código de los integrantes:** cada iframe conserva su HTML/CSS/JavaScript y sus archivos dentro de su carpeta. Los guiones autónomos siguen funcionando normalmente si se abre el HTML de cada persona por separado.

## Si Andrés incorpora sus diapositivas

La carpeta `presentacion/andres/` existe, pero todavía no contiene una presentación. Una vez que Andrés termine su `index.html`, deberá abrir un PR para agregarlo, y se conectará ese archivo al visor desde el menú central, siguiendo el mismo protocolo del puente. Para hacerlo sin riesgo, coordinar ese cambio final en `/index.html` con el equipo.

Los archivos se pueden abrir localmente en Chrome. El HTML actual de Angie Loango incluye su script de diapositivas; se conserva `loango.js` también en su carpeta.

