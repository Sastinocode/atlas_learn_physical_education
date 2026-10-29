# Juegos de planos y palancas
Entra en «Juego planos» o «Juego palancas». Elige un perfil ficticio y el tiempo; «Sin límite» sirve para debate en el proyector. Cada juego tiene 10 preguntas comunes y 100 puntos por acierto. Confirma, corrige y pulsa Siguiente reto. El reloj se detiene en la corrección; continúa si sales durante una pregunta. Al terminar se muestran contenidos para repasar y todas las resoluciones bajo petición.

Cada juego guarda un único intento local. Reiniciar o borrar permite volver a practicar. Estos dos bancos no están conectados a la sala multijugador en directo ni a su clasificación.

Contenido editable: app/challenge-content.ts. Cada pregunta contiene tema, enunciado, opciones, índice correcto (desde 0), explicación y esquema opcional. Mantener 10 por banco; al cambiar el banco, actualizar la versión del almacenamiento. Contenido introductorio pendiente de contraste con la programación.

Verificación: TypeScript y build offline correctos; node verify-challenges.mjs comprueba bancos, puntuación y guardado válido. Navegador: acierto en planos, conservación al recargar, partida completa de palancas con 4/10, repaso y apertura de todas las soluciones.
