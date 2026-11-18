# Ensayo de Búsqueda Local · Angie Donato

Abre el HTML de Búsqueda Local directamente para ensayar. Pulsa **N** para leer el guion oral y las indicaciones de cada diapositiva. Usa **→** y **←** para practicar las apariciones. En el visor de la exposición, la primera aparición de cada diapositiva se muestra al entrar. Las siguientes se revelan una a una.

## Correspondencia entre diálogo y apariciones

| Diapositiva | Aparición | Frase que digo | Elemento visual |
|---|---:|---|---|
| 1 · Problema y necesidad · 55 s | 1 | «Una empresa tiene que visitar varias ciudades y regresar al punto de partida recorriendo la menor distancia posible.» | Apunta a A, recorre las cinco ciudades y sigue el tramo punteado de regreso a A. |
| 1 | 2 | «Con 20 ciudades podemos tener aproximadamente seis por diez a la dieciséis recorridos distintos.» | Señala 20 y luego el exponente. En el caso simétrico, una ruta y su inversa cuentan una sola vez. |
| 1 | 3 | «Un método exacto busca encontrar una solución con garantía de optimalidad.» | Tarjeta Método exacto, con el punto certificado en forma de rombo. |
| 1 | 4 | «Una heurística intenta conseguir una buena solución en menos tiempo, aunque no garantice que sea la mejor de todas.» | Tarjeta Heurística y el candidato encontrado entre opciones no certificadas. |
| 1 | 5 | «Y aquí entra la Búsqueda Local.» | Banda de transición abajo. |
| 2 · Concepto e intuición · 70 s | 1 | «La Búsqueda Local es una heurística de mejora. Parte de una solución que ya existe y trata de mejorarla realizando pequeños cambios.» | Definición y secuencia de tres pasos. |
| 2 | 2 | «Por ejemplo, ya tenemos una ruta de entregas.» | Fila A → B → C → D → E → A y costo 37. |
| 2 | 3 | «Intercambiamos dos ciudades. Si mejora, nos quedamos con ella.» | Resalte de D y E en las dos filas, intercambio D ↔ E y costo 22. |
| 2 | 4 | «Imaginen a una persona subiendo una montaña en medio de la niebla. Solo observa los pasos cercanos.» | Escalador, huellas en la pendiente y niebla que cubre el resto del terreno. |
| 2 | 5 | «Puede llegar a una cima donde ya no encuentra ningún paso que le permita subir más.» | Escalador en la cima menor. Punto azul y definición de óptimo local. |
| 2 | 6 | «Aunque exista una montaña más alta en otro lugar.» | Se despeja la niebla y aparece la bandera en la cima mayor. Señala la diferencia entre maximizar altura y minimizar distancia. |
| 2 | 7 | «Ser el mejor entre mis vecinos no significa ser el mejor de todos.» | Banda inferior para cerrar la analogía. |
| 3 · Origen, clasificación y limitación · 55 s | 1 | «No tiene un único creador. Entre sus antecedentes están el 2-opt de Croes, de 1958, y el trabajo de Lin–Kernighan, de 1973.» | Línea de tiempo de dos hitos aplicados al agente viajero. |
| 3 | 2 | «Es una heurística de mejora.» | Solución → cambio → mejora. |
| 3 | 3 | «Es un método de trayectoria: trabaja con una sola solución actual a la vez.» | Secuencia de estados x₀ → x₁ → x₂, con el estado actual resaltado. |
| 3 | 4 | «La Búsqueda Local mejora mediante vecinos. Tabú incorpora memoria para ampliar la exploración.» | Comparación de Local y Tabú. |
| 3 | 5 | «El límite es que puede detenerse en un óptimo local.» | Tarjeta que retoma la cima menor. |
| 3 | 6 | «Mi compañera Angie Loango les va a explicar cuáles son los componentes y cómo funciona.» | Banda «Componentes y funcionamiento». La siguiente flecha abre el bloque de Angie Loango. |

## Adaptar la estructura a los demás temas

1. Mantén las tres etapas y los tiempos aproximados. En **Problema**, presenta un caso y justifica el método. En **Intuición**, muestra una operación en dos estados y una analogía. En **Origen**, explica historia, clasificación, limitación y relevo.
2. Elige una frase que activar por cada avance y un elemento que puedas señalar. En el HTML, numera los elementos con `data-f` a partir de 1 en cada diapositiva. Escribe en `data-cue` el recordatorio breve que acompaña esa aparición. Conserva el primer elemento al entrar.
3. Usa el lienzo, las tarjetas y el pie compartidos. Si un dibujo cambia de estado, haz que dependa del número de aparición. Actualiza las notas de la vista individual y la tabla de ensayo. Verifica el recorrido hacia delante y hacia atrás dentro del visor.
