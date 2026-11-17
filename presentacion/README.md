# Presentación · organización por integrantes

Este directorio contiene **cuatro carpetas independientes**. Cada integrante es responsable de los cambios en su carpeta. La portada del repositorio (`/index.html`) solo sirve de menú y no debe convertirse en la presentación particular de ningún integrante.

```
Diapositivas-Optimizacion/
├── index.html                        # Menú común, NO pertenece a Carolina
├── presentacion/
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

Los archivos se pueden abrir localmente en Chrome. El archivo `presentacion/angie-loango/index.html` utiliza `loango.js` en su misma carpeta.
