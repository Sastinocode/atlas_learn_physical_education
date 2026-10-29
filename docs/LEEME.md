# El cuerpo en movimiento — guía de uso

Aplicación didáctica para TSEAS en español de España. Incluye 15 músculos o grupos, 11 huesos, 6 articulaciones, 42 preguntas (8 Localizar, 26 Relacionar y 8 Explicar) y 6 ejercicios con variante y fase. Añade un visor 3D con 25 estructuras o grupos seleccionables y 313 mallas, incluidas piezas óseas de contexto.

## Abrir sin instalar nada

1. Abre la carpeta `dist-offline`.
2. Haz doble clic en `index.html`. Usa un navegador actual (Edge, Chrome o Firefox).
3. Conserva juntos `index.html`, `atlas.js`, `atlas3d.js` y `atlas.css`. Puedes copiar toda la carpeta o compartir el ZIP con el alumnado.

No requiere conexión, cuentas, suscripciones ni servicios externos. Los enlaces de fuentes sí necesitan conexión. Si el navegador restringe el almacenamiento al abrir archivos locales, la aplicación avisa y sigue funcionando durante la sesión. Para disponer de un origen local estable: desde `dist-offline`, ejecuta `python -m http.server 4174 --bind 127.0.0.1` y abre `http://localhost:4174`.

Esta versión se entrega localmente; no se ha publicado en Internet. La copia local es la entrega para el aula sin cuentas. No existe sincronización entre dispositivos. No se envían respuestas a un servidor.

## Dirigir una sesión

- En la bienvenida se explica el objetivo y la secuencia de uso.
- **Atlas 3D**: selecciona por nombre o sobre el cuerpo, cambia las capas, aísla una estructura y desplázala con los tres controles (también con flechas del teclado). «Devolver a su posición», «Deshacer cambio 3D» y «Reiniciar vista 3D» permiten recuperar el montaje. El deslizador «Separar las piezas» muestra la anatomía distribuida para inspección. Las preguntas enlazadas abren los retos del equipo activo. No es un simulador de movimiento articular.
- **Explorar**: cambia entre anterior/posterior y músculos/huesos/articulaciones. Selecciona el punto o el nombre. Las estructuras profundas se identifican como proyecciones. La etiqueta dice cuándo es un grupo muscular.
- **Taller**: coloca 12 fichas musculares (6 anteriores y 6 posteriores) mediante arrastre o selección y clic/teclado. Comprueba, revela soluciones, devuelve fichas al banco, deshaz y vacía una vista. El montaje se guarda por perfil y es práctica sin puntos. «Movilidad y tejidos» incluye seis temas con ayudas ocultas y acceso a preguntas puntuables.
- **Profesor**: elige directamente cualquiera de las 30 preguntas; selecciona de 1 a 6 equipos ficticios o práctica individual; activa texto para proyector. Selecciona en la barra el equipo que responde antes de cada intento.
- **Localizar**: el equipo elige una zona numerada y confirma. Un acierto vale 1 punto.
- **Relacionar**: elige la asociación de estructura, movimiento y ejercicio. Un acierto vale 2 puntos.
- **Explicar**: responde oralmente o escribe una justificación sin nombres. El profesor otorga 0, 1 o 2 puntos con la rúbrica visible. En individual se registra una autoevaluación orientativa, sin corrección inteligente.
- Cada perfil tiene su progreso independiente. Los puntos se conceden una sola vez por pregunta; repetir un acierto no acumula puntos. El docente puede sustituir una valoración previa.
- **Revelar por capas** muestra solo los componentes solicitados. Usar una ayuda antes de acertar impide obtener puntos automáticos en esa pregunta; no elimina puntos ya ganados. En preguntas abiertas sigue siendo posible la valoración humana. Los controles no son un sistema antitrampas.
- **Reintentar** vuelve a permitir una respuesta sin duplicar la puntuación. Un error previo permanece en el resumen para orientar el repaso.
- **Resumen / Terminar**: distingue Consolidado, Repasar y Pendiente para el equipo seleccionado; permite volver directamente a una pregunta.
- **Deshacer** revierte hasta 20 cambios recientes (turnos, respuestas, ayudas, ajustes o reinicio de sesión). El historial de deshacer dura hasta recargar; el progreso sí se conserva.
- **Poner marcadores a cero** mantiene respuestas y ayudas. **Reiniciar sesión de retos** borra los intentos de todos los perfiles para otra ronda. **Borrar todo el progreso local** también elimina la vista 3D y los montajes del taller, restablece ajustes y no se puede deshacer.

No se solicitan datos personales. Profesor es un panel de moderación accesible, sin contraseña. No constituye un sistema de evaluación oficial.

## Accesibilidad y proyección

Los puntos tienen una superficie de 44 × 44 píxeles CSS. Se pueden seleccionar con Tab y Enter o Espacio; las pestañas admiten flechas. No hay arrastre obligatorio. La selección se identifica con número, borde y estado, además de color. Los diálogos se cierran con Escape o Cerrar. Se puede ampliar el navegador al 200 %. En pantalla estrecha, la ficha se coloca debajo del atlas.

El modo proyector amplía textos didácticos. Usa pantalla completa del navegador (F11) y ajusta el zoom a la distancia de la última fila. Las láminas conservan proporciones al cambiar el tamaño. No pretenden mostrar límites exactos, inserciones, todos los tejidos ni detalles diagnósticos.

## Modificar contenido

Edita `app/content.ts`, el archivo central de contenidos:

- `structures`: `id` estable, `name`, `layer` (`muscles`, `bones`, `joints`), `kind`, `location`, `fn`, `example` y `points`.
- `points.a` y `points.p` son coordenadas [x,y] en porcentaje de cada mitad de la lámina de 1536 × 1024. Anterior = mitad izquierda; posterior = derecha. Omitir una vista oculta el punto en ella.
- `exercises`: variante, fase, movimiento, músculos, huesos, articulaciones y matiz de control. Explica la participación conjunta y evita atribuir el ejercicio a un único músculo.
- `questions`: modo, enunciado, tema de repaso y explicación. En Localizar, `target` debe coincidir con el `id` de una estructura. En Relacionar, `correct` es el índice de la opción correcta empezando por 0. En Explicar, `criteria` contiene dos criterios de un punto; no se evalúa automáticamente el texto.

`app/workshop-content.ts` contiene los seis temas de movilidad, las fichas por vista y las reglas de colocación. `app/workshop.tsx` contiene el taller y `app/body-image.tsx` la lámina compartida. Las ayudas específicas de una pregunta se editan en `hints` (`muscles`, `bones`, `joints`); se revelan a petición.

Con Node.js instalado, abre una terminal en la carpeta del proyecto:

```
npm install
npm run dev
```

La terminal indica la dirección de vista previa. Después de editar:

```
npx tsc --noEmit
node verify.mjs
npm run build
npm run build:offline
```

La compilación sin conexión actualiza `dist-offline`. Se puede sustituir texto y opciones sin cambiar el motor. Para ampliar el número de preguntas/estructuras, revisa las expectativas de `verify.mjs`; los contadores y límites se calculan a partir de los datos. Si cambias el significado de una pregunta, dale un ID nuevo o reinicia el progreso para no reutilizar puntuaciones antiguas.

`app/atlas.tsx` contiene la interacción, `app/session.ts` la puntuación y recuperación, y `app/globals.css` el diseño y adaptación a pantallas. Las imágenes usadas están en `app/assets` y se integran en el JavaScript para evitar rutas de imágenes rotas. Son ilustraciones esquemáticas generadas con IA; sustituirlos exige revisar las coordenadas de todas las zonas.

## Base y alcance

Referencia prioritaria consultada: archivo local `1136. Valoracion de la condicion fisica e intervencion en accidentes/VALORACION 26-27/Material Didactico ARAN/Valoracion condicion fisica capitulos/Capitulo_02.md`, «Relación de la mecánica del ejercicio con el sistema musculoesquelético». Se toma su enfoque de conectar estructura, movimiento, fuerzas, fase y función muscular. No se ha revisado íntegramente el manual ARÁN original.

Contraste anatómico complementario, OpenStax, Anatomy and Physiology 2e:
- https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs
- https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs
- https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements
- https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb

Fichas, ejercicios y preguntas son elaboración didáctica propia. Contrastar terminología, profundidad, secuenciación y rúbricas con la programación del centro. No se inventan correspondencias con resultados de aprendizaje ni se considera el marcador una calificación del módulo.


## Actualización de octubre de 2026

Huesos visibles, articulaciones resaltadas y láminas integradas sin peticiones de imagen separadas. Si falla la decodificación de una lámina se avisa y se desactiva la localización. Se conservan los IDs y puntuaciones anteriores. Los montajes utilizan almacenamiento separado por perfil.

El Taller mantiene sus fichas simbólicas 2D. La pestaña Atlas 3D incorpora ahora una selección del repositorio facilitado, con inspección de piezas tridimensionales.


## Integración Human Atlas — versión 3

Origen: https://github.com/ashemag/human-atlas, revisión `1c38bf35c254a891200d3cedecfd57abebe83d8d`.
Motor adaptado bajo MIT, copyright 2026 ashemag. Datos: BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International. Las licencias y atribuciones completas están en `credits` en la copia sin conexión y en `public/credits` en el proyecto. Consulta también las fuentes desplegables dentro de Atlas 3D.

La selección contiene 13 músculos/grupos, 11 huesos y el tendón calcáneo, con piezas de ambos lados y esqueleto contextual. No equivale al atlas completo de 2.234 mallas. Se corrigió la clasificación del tibial anterior y se completaron agrupaciones (pectorales y trapecio) uniendo explícitamente sus porciones. El oblicuo externo 3D se distingue del grupo de oblicuos de la ficha 2D. No se asignaron mallas por semejanza a dorsal ancho o recto abdominal: permanecen disponibles en 2D.

Las geometrías conservan la simplificación y coordenadas del repositorio. El modelo adulto masculino no cubre todas las variaciones humanas. Las traslaciones de inspección no simulan contracción, inserciones, rangos articulares ni biomecánica. Las piezas óseas contextuales sin ficha mantienen su nombre de origen en inglés, identificado como tal.

No hay peticiones a servidores externos para cargar modelos. La geometría comprimida está en `atlas3d.js`, que solo se descarga al entrar en Atlas 3D; el paquete es mayor (aproximadamente 13 MB de JavaScript sin comprimir). El visor requiere WebGL y DecompressionStream de un navegador actual. Si el dispositivo no los admite, el atlas 2D y las actividades siguen disponibles. No se ha comprobado en tableta física.

Edición: `app/atlas3d.tsx` contiene controles y enlaces didácticos; `app/three` contiene el motor adaptado; `scripts/prepare-atlas.py` declara los identificadores FMA y genera `app/three/model.json` desde `../human-atlas-reference`. No necesitas ese repositorio para abrir o compilar el modelo ya incluido; solo para regenerarlo. Tras cambiar correspondencias ejecuta `python scripts/prepare-atlas.py` y `node verify-3d.mjs`, además de las verificaciones habituales. El estado de inspección usa la clave local `cuerpo-movimiento-3d-v1`, separada de las puntuaciones.

## Ampliación: movimiento por fases (versión 4)

En **Del cuerpo al ejercicio**, pulsa cualquiera de los seis ejercicios. La nueva ventana permite:

1. Reproducir, pausar, elegir velocidad o recorrer una repetición con el deslizador (también con las flechas del teclado).
2. Elegir una de cuatro fases: posición inicial, subida/tirón, pausa y retorno. Las sentadillas, zancadas y flexiones empiezan en la posición baja.
3. Seleccionar una articulación y revelar por separado **Movimiento**, **Fuerzas** y **Músculos**.
4. Comparar agonistas, antagonistas anatómicos, sinergistas y estabilizadores. En el retorno se explica el frenado excéntrico; los antagonistas no se convierten automáticamente en motores.
5. Usar **Llevar a Explicar** para abrir la pregunta del ejercicio con la rúbrica existente. La nota sigue siendo manual, de 0 a 2 puntos, para el perfil activo.

**Reiniciar** detiene la animación, vuelve al inicio y oculta las capas. Cerrar la ventana también descarta el estado de reproducción; las notas de los retos sí siguen guardadas. Si abres el análisis desde un reto, la aplicación exige registrar la ayuda antes de mostrar soluciones, como ocurría con las fichas anteriores.

Las figuras animadas son esquemas de segmentos y articulaciones. El mapa muscular es funcional, por articulación: no pinta músculos sobre el modelo 3D ni calcula activación, fuerza, cargas articulares o ángulos reales. Flechas y proporciones son cualitativas. No se trata de una simulación biomecánica del modelo Human Atlas.

### Edición de la ampliación

- `app/exercise-analysis.ts`: fases, ejecución, fuerzas, momentos, papeles musculares y preguntas enlazadas.
- `app/exercise-motion.tsx`: geometría esquemática, apoyos, cargas y animación.
- `app/exercise-lab.tsx`: controles, revelado y navegación a la rúbrica.

Referencias conceptuales: OpenStax, *Anatomy and Physiology 2e*, apartados 11.1 (interacción muscular y palancas) y 10.4 (tipos de contracción); biblioteca de ejercicios de ACE. Enlaces dentro de cada análisis. Contenido introductorio pendiente de contraste con la programación.


## Planos y ejes y nueva presentación anatómica (versión 5)

En **Taller → Planos y ejes**, o desde **Abrir laboratorio**, se visualizan las tres superficies y sus ejes perpendiculares. Selecciona cadera u hombro y ABD, ADD, flexión, extensión, RI o RE. Reproduce, pausa o mueve el deslizador con teclado. Cambia entre vista oblicua, frontal, lateral y superior; oculta plano, eje y explicaciones para preguntar al grupo. «Practicar en Relacionar» abre una de 12 preguntas nuevas, con 2 puntos y registro en el resumen. Se conservan los resultados anteriores. Total: 42 preguntas y 76 puntos máximos.

El plano frontal se asocia al eje anteroposterior; el sagital al mediolateral; el transversal al longitudinal para las rotaciones con húmero/fémur próximos a vertical. Son modelos introductorios: los recorridos no son medidas de movilidad. La posición de rodilla y codo en las rotaciones permite visualizar el giro. No confundas el desplazamiento del pie con el sentido de rotación del fémur.

Los seis ejercicios disponen ahora de **Ilustración anatómica**, con tres poses originales de acabado 3D, generadas con la herramienta integrada image_gen. La reproducción alterna esas tres poses de referencia; no es una interpolación de una malla anatómica. **Esquema y fuerzas** conserva el movimiento continuo de segmentos y las flechas. Revelar fuerzas cambia a ese esquema; se puede volver a la ilustración sin perder la fase. El color coral sitúa musculatura de forma orientativa y no representa intensidad de activación ni agonismo. Las explicaciones funcionales están en el mapa A/B/S.

Las ilustraciones se generaron para esta aplicación; no son archivos descargados ni licenciados de Freepik. Son interpretaciones didácticas, no láminas de disección. Se conservaron las variantes de ejercicio: la sentadilla continúa sin carga.

Archivos editables añadidos:
- `app/planes-content.ts`: planos, ejes, gestos, geometría y 12 preguntas.
- `app/planes-lab.tsx`: representación y controles.
- `app/exercise-art.tsx`: selección de poses y miniaturas.
- `app/assets/exercise-*-v1.png`: seis láminas de tres poses (18 poses en total).
- `app/assets/EXERCISE-ART-PROMPTS.json`: prompts exactos y procedencia.

## Versión 6 · Core y Juego 10
Añade nueve fichas del core por capas, respiración y estabilidad, y un cuestionario común de diez preguntas con tiempo configurable, puntuación visual y corrección final. Consulta GUIA-CORE-Y-JUEGO.md. No añade esas mallas al modelo 3D ni sincronización entre dispositivos.


## Versión 7 · aula en directo
- En Juego 10 aparece el acceso al nuevo panel de aula.
- Abre ABRIR-AULA-ONLINE.cmd y visita http://localhost:4175/live/ para crear una sala.
- Comparte el enlace público temporal que contiene su código: permite responder desde wifi o datos móviles, con alias ficticios.
- Consulta GUIA-AULA-EN-DIRECTO.md para tiempos, clasificación, exportación, reconexión y cierre. Esta función necesita el servidor abierto; no funciona al abrir solo index.html.
