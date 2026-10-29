# Core y Juego 10 · versión 6

## Abrir en clase

Extrae todo el ZIP y abre index.html en Chrome, Edge o Firefox. Mantén atlas.js, atlas3d.js, atlas.css y la carpeta credits junto al HTML. No necesita cuentas ni conexión para funcionar. Cada ordenador conserva su propio progreso en el navegador; localhost es solo la vista previa del ordenador del profesor.

## Explicar el core

1. Entra en **Core → Anatomía por capas**. Empieza por recto y oblicuo externo; cambia a intermedia (oblicuo interno) y profunda (transverso). Selecciona el dibujo o el nombre de la estructura; Tab y Enter también funcionan.
2. Explica que las tres capas corresponden a la pared lateral. El recto es anterior. **Techo y base** muestra diafragma y suelo pélvico; **Pared posterior**, multífidos, cuadrado lumbar y erectores. Son nueve fichas en este módulo; el modelo 3D original conserva su selección de estructuras.
3. En **Respiración y presión**, mueve el control de inspiración. El esquema enseña cambios cualitativos de posición, no presiones, activación ni movimientos a escala. Contrasta respiración tranquila y esfuerzo; no conviertas la ilustración en una consigna de contener el aire o empujar hacia abajo.
4. En **Transmisión y estabilidad**, elige empuje, carga unilateral o plancha. Recorre las etapas con el alumnado y formula la pregunta antes de revelar la explicación. Hay criterios visibles y valoración docente de 0–2. Esa valoración es temporal y no se suma al marcador del juego.

El contenido es introductorio y debe contrastarse con la programación. Incluye enlaces a OpenStax, investigación de Hodges y colaboradores sobre el diafragma y la revisión de Kibler y colaboradores sobre función del core. Los esquemas son dibujos didácticos, no disecciones anatómicas exactas ni un simulador biomecánico.

## Juego individual: todos reciben lo mismo

1. Distribuye a todo el grupo la **misma versión 6** de la aplicación.
2. Asigna números ficticios del 01 al 40. No hace falta introducir nombres, correos ni otros datos personales.
3. Indica la configuración común, por ejemplo **CORE10-v1 / 30 s**. Cada alumno entra en **Juego 10**, selecciona su número y ese mismo tiempo. El código identifica la versión y duración: no es una sala online ni un código de sincronización.
4. Comprueba las instrucciones antes de dar la salida. Al pulsar **Empezar las 10 preguntas**, comienza el reloj. Se muestran las mismas diez preguntas, opciones y orden. Cada alumno avanza a su ritmo dentro del límite individual de cada pregunta.
5. El alumno selecciona una respuesta y pulsa **Confirmar y continuar**. Seleccionar sin confirmar no puntúa. Al vencer el tiempo se registra «Sin respuesta» y comienza automáticamente la siguiente.
6. Cada acierto vale 100 puntos; error o tiempo agotado valen 0. Máximo 1000. No hay bonus por rapidez. Hay opciones de 15, 30, 45, 60, 90, 120 y 180 segundos para adaptar la actividad; compara resultados con la misma duración.
7. El reloj sigue contando si se cambia de módulo, se deja la pestaña en segundo plano o se cierra/recarga. Al volver, se registran las preguntas cuyo plazo ya ha terminado. Una nueva partida requiere confirmación y comienza desde la primera pregunta.
8. Al finalizar, pulsa **Ver resoluciones y corregir**. Aparecen tu respuesta, la correcta, el resultado y la explicación de cada pregunta. El profesor puede proyectar el solucionario para comentar los errores; también hay un listado común y solucionario en el apartado docente, fuera de una partida activa.

## Recoger resultados sin servidor

Cada alumno pulsa **Exportar mi resultado** al terminar. Obtiene un archivo JSON que puede entregar por el medio habitual del aula o pendrive. En el ordenador del profesor, abre **Marcador local e importación de resultados** e importa los archivos uno a uno. El marcador muestra intentos con la duración seleccionada; importar otra vez el mismo intento no lo duplica. Los puntos se calculan a partir de las respuestas, no de un total introducido en el archivo.

No hay clasificación compartida en directo, inicio sincronizado, envío automático ni verificación de identidad/autoría. Los archivos son editables y el solucionario está en la aplicación: es una actividad de práctica, no un examen protegido. Cada fila es un intento; se conservan hasta 200. Puedes borrar los datos de este juego con confirmación sin borrar los del atlas. El borrado global del profesor incluye también Core y Juego 10.

## Editar contenidos

- `app/core-content.ts`: nueve fichas, capas, casos, criterios y fuentes.
- `app/core-lab.tsx`: esquemas seleccionables y respiración.
- `app/game-content.ts`: diez preguntas, opciones, índice de respuesta correcta (desde 0) y explicación. Mantén exactamente diez; cambia `SET_ID` cuando modifiques el cuestionario para no mezclar versiones. Distribuye la nueva compilación a todos.
- `app/game-engine.ts`: tiempos permitidos, puntuación, vencimientos y validación de resultados.
- `app/core-game.tsx` y `app/core.css`: interfaz y marcador visual.

Después de editar: `npx tsc --noEmit`, `node verify-core-game.mjs`, `node verify.mjs` y `npm run build:offline`. Entrega todos los archivos de dist-offline. No edites directamente atlas.js compilado.
