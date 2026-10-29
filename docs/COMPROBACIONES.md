# Comprobaciones de la primera versión

- Compilación de producción de la aplicación: correcta.
- Compilación del paquete autónomo: correcta (React incluido, sin dependencias de red).
- TypeScript: sin errores.
- `node verify.mjs`: 32 fichas, 20 preguntas, 6 ejercicios, referencias internas válidas, coordenadas dentro de la lámina y dos criterios por pregunta abierta.
- Puntuación comprobada por lógica: errores, aciertos, máximo, no duplicación, ayudas, separación por equipo y recuperación de datos válidos o dañados.
- Navegador: bienvenida, ficha de cuádriceps como grupo de cuatro músculos, selección incorrecta, explicación, reintento con Enter, 1 punto en Localizar, 2 puntos en Relacionar, justificación escrita, valoración manual de 1 punto, resumen con Repasar/Consolidado/Pendiente y recuperación de puntos tras recargar.
- Paquete autónomo servido en localhost: arranque y bienvenida correctos. La apertura directa de archivos no está permitida en el navegador de pruebas integrado; el paquete usa un script clásico autocontenido y rutas relativas para poder abrirse desde el explorador de archivos.

Límite: no se ha hecho una certificación de accesibilidad ni una revisión anatómica especializada de todas las ilustraciones. Las láminas se identifican expresamente como esquemáticas. Las fichas priorizan el capítulo local de mecánica del ejercicio; se documentan las fuentes y los aspectos a contrastar con la programación.

Prueba adicional: revelar la capa de músculos muestra la localización pedida; Deshacer vuelve a ocultarla. La vista previa final queda en Explorar con marcadores a cero.


## Actualización comprobada — 20 de octubre de 2026

- Diagnóstico: el servidor del puerto 4174 no aceptaba conexiones; la pestaña conservaba la interfaz. Los PNG originales estaban presentes y eran válidos.
- Láminas incorporadas en JavaScript como datos; comprobado en navegador: imagen completada, anchura natural 1536, origen `data:image`. Esqueleto visible y articulaciones con anillos en la captura `articulaciones-v2.png`.
- Navegador integrado: cambio a huesos, selección de cadera, colocación con Enter, recarga y recuperación del montaje, movimiento y deshacer, vaciado de vista y vista posterior.
- Detectado y corregido un fallo de arrastre nativo en el navegador integrado. Arrastre por puntero comprobado: pectoral del banco a zona 1; confirmación visible de ficha colocada.
- Taller posterior: dorsal en zona 3, corrección 1/6; deshacer devuelve la ficha. Banco ordenado alfabéticamente, independiente de los números de zonas.
- Movilidad: dorsiflexión, revelación de plano y salto al reto; respuesta correcta concede 2 puntos. Selector docente abre una pregunta sobre rotaciones; valoración manual de 1/2 aparece como Repasar. Se deshicieron las puntuaciones de prueba y se vaciaron los montajes de prueba.
- `npx tsc --noEmit`, `node verify.mjs`, compilación offline y compilación Vinext correctas. La compilación avisa del tamaño de JavaScript: incluye deliberadamente las dos láminas para uso local sin rutas externas (aproximadamente 4,9 MB sin comprimir).
- Pruebas automáticas: 32 fichas, 30 preguntas, 6 ejercicios, coherencia de referencias y rúbricas, 52 puntos máximos, ayudas, no duplicación, perfiles, recuperación de sesión, validación de fichas y desplazamiento sin duplicados.
- No se ha probado en una tableta física. Hay alternativa de clic y teclado; el arrastre usa eventos de puntero. El taller no es un modelo 3D ni un despiece anatómico.
- Pendiente del usuario: enlace al repositorio del atlas; no se ha integrado material de ese repositorio.

## Integración 3D — 20 de octubre de 2026

- Referencia descargada: ashemag/human-atlas, commit 1c38bf35c254a891200d3cedecfd57abebe83d8d. Licencias MIT y BodyParts3D CC BY 4.0 conservadas; licencia de datos contrastada en el sitio oficial.
- Selección docente explícita: 25 estructuras/grupos y 313 mallas, incluido esqueleto contextual. El tibial anterior se reclasifica como muscular. Pectoral y trapecio se agrupan por sus porciones. El oblicuo externo se diferencia de la ficha 2D del grupo abdominal.
- TypeScript, build Vinext, build offline y verificaciones de sesión anteriores pasan. `node verify-3d.mjs` comprueba descompresión, alineación de buffers, límites e índices de vértices, referencias y clasificación.
- En navegador integrado: renderizado WebGL visible; selección del cuádriceps; aislamiento; desplazamiento horizontal a 0,6 mediante teclado, confirmado visualmente; persistencia tras recarga; retorno a posición; ocultación de músculos y vista posterior.
- Búsqueda de Aquiles en español, aislamiento del tendón y salto a la pregunta «¿Qué transmite al calcáneo la fuerza del gastrocnemio y el sóleo?» con el equipo activo.
- Separación al 100 % muestra inventario de piezas; reinicio y deshacer disponibles. Sin errores de consola durante las pruebas realizadas.
- Geometría integrada como datos comprimidos, sin solicitudes a servicios externos. Verificado servido por localhost; no se ha realizado una prueba en una tableta física ni una prueba independiente de esta versión 3D desde file://.
- Las traslaciones inspeccionan geometría, no simulan movimientos articulares. Los ejercicios, rúbricas, preguntas, taller y atlas 2D permanecen disponibles. Esta selección no importa el catálogo completo del repositorio.

## Análisis visual de ejercicios — 21 de octubre de 2026

- Flujo: botón de ejercicio → contenido local por variante/articulación → secuencia esquemática → capas de movimiento, fuerzas y músculos → pregunta existente en Explicar. No intervienen API, servicios externos ni datos personales.
- Seis ejercicios abiertos en el navegador; mapas A/B/S y capas renderizados. Inspección visual de los seis: sentadilla, zancada, talones, flexión de brazos, remo y press.
- Revisadas y corregidas la orientación de los codos en press, la flexión de la pierna posterior de zancada y los apoyos gráficos.
- Sentadilla: selección de subida y bajada; cambio de rodilla a cadera; el texto cambia a flexión de cadera y frenado excéntrico. Tecla Flecha derecha: 75 → 76 %. Reiniciar oculta capas y devuelve a 0; reproducir hace avanzar la secuencia. End lleva al final y detiene la reproducción.
- Llevar a Explicar abre e1 y muestra los dos criterios de valoración de sentadilla. No se asignaron puntos durante estas comprobaciones; los marcadores permanecieron en cero.
- TypeScript sin errores; build Vinext y build offline correctos. `node verify.mjs` comprueba los seis análisis, sus campos y referencias a rúbricas, además de las regresiones de contenido, ayudas, marcadores y taller.
- Consola del navegador: ninguna entrada de error en la consulta realizada.
- React: temporizador con limpieza al pausar/desmontar, valores de fase derivados, componentes separados de los contenidos; controles nativos de teclado, capas ocultas inicialmente y leyendas con texto además del color. Sin reproducción automática al abrir.
- Límites: esquemas propios de segmentos, tarjetas funcionales de musculatura y fuerzas cualitativas; no animación de mallas anatómicas, medición de activación, cálculo de cargas ni simulación biomecánica del atlas 3D. No se ha probado esta ampliación en una tableta física ni por file://.

## Versión 5 · atlas visual y planos (21-10-2026)
- Compilaciones estándar y sin conexión completadas.
- TypeScript y verify.mjs: 32 estructuras, 42 preguntas, 6 ejercicios; planos y ejes ortogonales, geometría de 12 gestos y conservación del progreso anterior comprobados.
- Navegador: las seis ilustraciones cargan; sentadilla cambia de pose y revelar fuerzas activa el esquema. Revisión visual de la figura y controles.
- Laboratorio: rotación interna de hombro, desplazamiento con teclado, ocultar plano/eje, reproducción y acceso a la pregunta de Relacionar comprobados.
- Las imágenes son ilustraciones originales generadas con IA, tres poses por ejercicio; no constituyen una simulación continua ni una medición de activación muscular.
- Captura: vista-anatomica-v5.png. Prompts: app/assets/EXERCISE-ART-PROMPTS.json.

## Versión 6 · core y juego individual (22-10-2026)
- TypeScript, compilación Vinext y build:offline completados sin errores.
- verify.mjs: regresión del atlas existente. verify-core-game.mjs: 9 fichas, 10 preguntas fijas, puntuación, caducidad exacta, doble envío, restauración tras recarga, validación y deduplicación de resultados.
- Navegador: selección de capas y estructuras, respiración mediante teclado, casos de transmisión, revelado y valoración manual comprobados.
- Partida completa: 400/1000 con cuatro aciertos; exportación e importación JSON comprobadas sin duplicados.
- Partida de 15 segundos: seis preguntas agotadas, recarga y finalización con 200/1000; correcciones posteriores verificadas. Datos de pruebas eliminados del juego.
- Las preguntas y opciones son iguales para todos (CORE10-v1). El tiempo se conserva mediante fechas absolutas. No hay clasificación sincronizada: el profesor reúne archivos de resultados manualmente.
- Capturas reales: core-v6.png y juego10-v6.png.
- Alcance: esquemas didácticos 2D del core, no nuevas mallas 3D ni simulación cuantitativa. No se ha probado esta versión en tableta física ni mediante file://. Es una actividad de práctica, no un examen con protección de respuestas o identidad verificada.

## Versión 7 · aula por internet (22-10-2026)
- Implementado servidor de salas separado, cliente móvil ligero y panel docente. Banco común generado desde app/game-content.ts.
- verify-classroom.mjs: dos participantes simultáneos, alias duplicados e inválidos, diez preguntas, cierre por tiempo exacto, rechazo de respuestas tardías y duplicadas, empate compartido, soluciones ocultas, controles docentes protegidos, exportación sin credenciales y borrado de sala.
- Restricción de creación de salas a localhost comprobada también con cabeceras de proxy; rechazo de origen ajeno.
- Prueba real con navegador por URL pública HTTPS de Cloudflare: entrada con alias, respuesta, 100 puntos recibidos por el panel local, cierre docente, solución revelada y recarga con recuperación del acceso y respuesta.
- Captura de la prueba: aula-en-directo-v7.png. Sala de prueba cerrada; nueva sala vacía disponible.
- TypeScript y compilación offline correctos; verify-core-game.mjs y verify.mjs pasan las regresiones.
- Límites: enlace temporal sin garantía de disponibilidad; necesita ordenador e iniciador en funcionamiento. No se ha probado una clase de 60 móviles físicos ni una conexión de datos móviles física. La prueba ha recorrido la URL pública desde el navegador. Salas en memoria, caducidad de seis horas. No verifica identidad.

## Versión 8 · acceso simplificado (28-10-2026)
- Iniciador en la carpeta principal, apertura automática del navegador y detección de servidor ya abierto; reapertura comprobada sin duplicar procesos.
- Recorrido Preparar → Invitar → Jugar, QR generado localmente, entrada del alumno solo con alias y pantalla completa opcional.
- Prueba real por enlace público: creación, entrada con alias, respuesta, marcador de 100 puntos y solución revelada antes de habilitar Siguiente.
- CSV descargado e inspeccionado: columnas Alias, Puntos y diez respuestas; protección de celdas que podrían interpretarse como fórmulas.
- Las pruebas de servidor cubren generación de SVG QR, ausencia del QR en vistas del alumno, permisos, tiempos, dos participantes y empate. No se ha comprobado el escaneo con una cámara física.
- Conserva la limitación del enlace temporal y el ordenador encendido. No equivale a un alojamiento permanente.

## Versión 9 · visor 3D (28-10-2026)
- Revisión de ImliStack/Body-Atlas-3D documentada en REVISION-BODY-ATLAS-3D.md. No se importó código ni geometría del repositorio.
- Añadidas opacidad por capas, acción para ver huesos bajo músculos, modo proyector y modo ligero.
- Ciclo de renderizado bajo demanda, con parada en reposo y pestañas ocultas, y limpieza al desmontar.
- TypeScript y build:offline correctos. verify-3d.mjs y verify-display-options.mjs pasan.
- Navegador: transparencia visible, alternancia de paneles, modo ligero, selección del fémur, aislamiento y desplazamiento con teclado verificados.
- Captura: atlas-optimizado-v9.png. Sin medición comparativa de FPS ni prueba física de tableta.
