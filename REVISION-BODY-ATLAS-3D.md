# Revisión de Body-Atlas-3D e integración educativa

Repositorio: https://github.com/ImliStack/Body-Atlas-3D
Revisión consultada: b0e04f6e058c767d51c1529369b7545315c5c6bd (main, consulta 28-10-2026).

## Qué aporta
Su README describe capas con opacidad independiente, vista despejada, resolución limitada en dispositivos pequeños, selección por estructura y renderizado agrupado. Se revisó también src/scene/meshes.js para contrastar la separación entre geometrías dibujadas y geometrías usadas para seleccionar.

## Aplicado en nuestra aplicación
- Transparencia independiente de huesos, músculos y tendón calcáneo, con porcentajes y restablecimiento.
- Acceso directo «Ver huesos bajo músculos»: mantiene el hueso opaco y reduce la opacidad muscular.
- Modo proyector: oculta los paneles laterales, amplía el modelo y conserva una ficha breve de la selección. Escape recupera los controles.
- Modo ligero: limita la resolución del lienzo a un píxel gráfico por píxel CSS. Reduce el coste de dibujar sin cambiar las geometrías ni la corrección de respuestas.
- Ciclo de dibujo bajo demanda: agrupa solicitudes, se detiene al estabilizarse la cámara y no programa fotogramas en pestañas ocultas. Conserva amortiguación y reanuda la interacción.
- Respeto de la preferencia de movimiento reducido en la separación animada y giro automático.
- Selección: capas casi invisibles (menos del 15 %) dejan pasar el clic. Los nombres siguen ofreciendo una alternativa al ratón.

## Qué se conserva y qué no se incorpora
Nuestro motor ya agrupa geometrías por sistema y usa mallas separadas para detectar clics; no se sustituye por otra biblioteca ni se añade una segunda copia del cuerpo. Se mantienen las 25 fichas y 313 mallas docentes, las preguntas, el core y las salas en directo.
No se incorporan todavía los miles de elementos, modelos de órganos ni el cuerpo femenino del otro repositorio. Importarlos requiere revisar cada correspondencia, licencia y coste de carga; sus adaptaciones de algunas estructuras femeninas son aproximaciones, tal como documenta el autor. Tampoco se atribuye a esta versión una mejora medida de FPS: las mejoras de planificación y resolución están verificadas, pero no se ha realizado un ensayo comparativo en tabletas físicas.

## Licencias y procedencia
La API de GitHub devolvió license:null y el árbol revisado no contenía LICENSE o COPYING. El documento public/ATTRIBUTION.md licencia datos anatómicos y cita fuentes, pero no establece por sí solo una licencia general para el código nuevo de este proyecto. Por ello, las mejoras se implementan de forma independiente sobre nuestro motor existente. No se copia código, geometría ni material visual del repositorio ImliStack.
Se mantienen las atribuciones previas de ashemag/human-atlas y BodyParts3D en public/credits.

## Fuentes consultadas
- README y arquitectura: https://github.com/ImliStack/Body-Atlas-3D
- Motor: https://github.com/ImliStack/Body-Atlas-3D/blob/main/src/scene/meshes.js
- Datos: https://github.com/ImliStack/Body-Atlas-3D/blob/main/public/ATTRIBUTION.md

## Verificación
- TypeScript sin errores.
- verify-display-options.mjs: normalización de opacidad, resolución y ciclo de dibujo (reposo, movimiento, pestaña oculta y liberación).
- verify-3d.mjs: 25 fichas, 313 mallas, geometría, índices y correspondencias.
