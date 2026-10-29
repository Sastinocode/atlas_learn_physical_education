# Aprender: planos, ejes y palancas

## Abrir y enseñar
Abre la aplicación y selecciona la pestaña Aprender (Planos, ejes y palancas).

1. Planos y ejes: compara las tres láminas, selecciona una y lee su relación con movimientos y eje. Activa o desactiva las superficies y las líneas por separado para distinguir plano de eje.
2. Abre el laboratorio de movimiento para observar cadera y hombro. Los ejemplos articulares son esquemáticos y no representan amplitudes clínicas.
3. Palancas corporales: compara cabeza, pie apoyado y flexión de codo. Pide señalar apoyo, fuerza muscular y resistencia antes de pulsar Revelar A, F y R.
4. Experimenta con el brazo de momento: cambia la distancia perpendicular de la carga y compara la fuerza necesaria. El ejemplo supone equilibrio, carga de 50 N y brazo muscular de 4 cm; omite el peso del segmento.
5. Pulsa Practicar para pasar al juego correspondiente. Cada juego conserva sus respuestas y puntuación localmente.

Las láminas son ilustraciones vectoriales originales, esquemáticas e inspiradas en los ejemplos aportados. No se ha reproducido la imagen comercial con marca de agua. El texto y los símbolos permiten interpretar los gráficos sin depender únicamente del color.

## Propuesta de aula
Observación (3 min), demostración por parejas (5 min) y juego con corrección (10 min). Las preguntas orales se valoran por el profesor con los criterios visibles. No se simula evaluación automática de las justificaciones.

Los controles de la lección se reinician al salir. No concede puntos ni sincroniza dispositivos. Las partidas de los juegos sí se guardan. Contenido introductorio pendiente de contraste con la programación.

## Edición
- app/mechanics-lesson.tsx: contenido de la lección y dibujos BodyPlane / LeverPicture.
- app/planes-lab.tsx y app/planes-content.ts: laboratorio de movimiento existente.
- app/challenge-content.ts: preguntas y explicaciones de los juegos.
- app/challenge-game.tsx: usa las mismas láminas en las correcciones.
- app/globals.css: estilos con prefijos mechanics y lesson.

## Comprobaciones
TypeScript y compilación offline correctos. Verificados en navegador: selección de plano, ocultación/restauración de ejes, cambio a palancas, revelación de A/F/R y modificación de distancia de 20 a 28 cm (250 a 350 N), seguida de reinicio. Capturas: leccion-planos-v11.png y leccion-palancas-v11.png.

## Fuentes
https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements
https://openstax.org/books/anatomy-and-physiology/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems
