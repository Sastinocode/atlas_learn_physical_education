# El cuerpo en movimiento · TSEAS

Atlas educativo interactivo en español de España. Incluye atlas 2D/3D, core, taller, ejercicios por fases, lecciones de planos/ejes/palancas y juegos con corrección y progreso local.

## Publicar en GitHub Pages (una sola vez)
1. Descomprime el paquete de repositorio en tu ordenador.
2. Crea un repositorio **público** llamado, por ejemplo, `el-cuerpo-en-movimiento`, con rama principal `main`.
3. Sube el contenido de la carpeta del proyecto a la raíz del repositorio (no el ZIP y no una carpeta contenedora adicional). Incluye `.github/workflows/pages.yml`. Puedes usar GitHub Desktop: añade la carpeta como repositorio local, crea el repositorio si lo solicita, haz un commit y pulsa Publish repository. Desmarca Keep this code private para usar Pages con GitHub Free.
4. En GitHub abre **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Abre **Actions → Publicar atlas en GitHub Pages → Run workflow**. Espera a que build y deploy terminen en verde.
6. Abre la URL que aparece en Settings → Pages: `https://TU-USUARIO.github.io/el-cuerpo-en-movimiento/` (ejemplo; todavía no hay una URL publicada).
7. Comparte esa URL con el alumnado. Ya no depende del servidor de tu ordenador.

Cada nuevo push a `main` vuelve a comprobar, compilar y publicar. Si utilizas otra rama, ajusta `.github/workflows/pages.yml`. No hacen falta claves ni servicios de pago para la versión estática en un repositorio público.

Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Abrir ahora sin servidor
En el paquete **web-lista**, abre `index.html` con Edge, Chrome o Firefox conservando el resto de archivos juntos. En la carpeta de desarrollo, `ABRIR-ATLAS.cmd` abre `dist-offline/index.html`. El guardado con `file://` depende del navegador; si lo bloquea, usa el servidor local o Pages.

## Desarrollo y comprobación
Requisito: Node.js **24** y npm.

```sh
npm ci
npm run check
npm run build:pages
npm run preview:pages
```

Después abre http://localhost:4175/ y mantén esa terminal abierta. Si cierras el servidor, esa dirección deja de funcionar. `npm run build:pages` genera `dist-offline`; el workflow publica solo esa carpeta. Las rutas de recursos son relativas y funcionan bajo el nombre del repositorio. `npm run dev` conserva el entorno de desarrollo original; `npm run build` es la compilación Vinext, no la de Pages.

## Qué funciona en Pages
- Lecciones, atlas, core, taller, ejercicios y juegos individuales.
- Puntuación por equipos en el mismo navegador, correcciones y progreso local.
- No se requieren cuentas del alumnado. Se usan perfiles ficticios.

## Aula en directo: servidor separado
GitHub Pages aloja archivos estáticos; **no ejecuta Node.js ni el servidor multijugador**. El repositorio incluye el código del aula, pero publicar Pages no activa las salas ni una clasificación compartida entre móviles. Los dos juegos nuevos son locales.

Para la opción temporal desde el ordenador del profesor, utiliza `npm run aula:online` o `ABRIR-AULA-ONLINE.cmd`, según GUIA-AULA-EN-DIRECTO.md. El lanzador necesita conexión y puede descargar el conector oficial del túnel; su ejecutable no se incluye en el repositorio. La URL temporal del aula cambia y depende de mantener el proceso abierto. No publiques una URL temporal como si fuera la dirección permanente de la aplicación.

## Editar contenidos
| Archivo | Contenido |
|---|---|
| `app/content.ts` | Atlas y retos generales |
| `app/core-content.ts` | Core |
| `app/game-content.ts` | Juego individual de core |
| `app/challenge-content.ts` | Juegos de planos y palancas |
| `app/mechanics-lesson.tsx` | Lecciones e ilustraciones de planos/ejes/palancas |
| `app/planes-content.ts` | Movimientos y relaciones plano/eje |
| `app/exercise-analysis.ts` | Análisis de ejercicios |

Ejecuta `npm run build:live` si cambias el banco de core y quieres actualizar su copia del servidor. Actualiza versiones de almacenamiento si cambias la identidad/orden de preguntas con partidas guardadas.

## Guías y límites didácticos
Consulta APRENDER-PLANOS-PALANCAS.md, JUEGOS-PLANOS-PALANCAS.md y TUTORIAL-PROFESOR-Y-ALUMNADO.md. Contenido introductorio pendiente de contraste con la programación. No es un simulador clínico ni un sistema oficial de evaluación. Las respuestas abiertas las valora el profesor; los dibujos son esquemáticos.

## Atribuciones y publicación
Se conservan las licencias y atribuciones de terceros en `public/credits` y se publican en `credits/`. Consulta THIRD-PARTY-NOTICES.md. No se incluyen el historial Git anterior, credenciales, configuración local de herramientas ni respuestas del alumnado. El ZIP de repositorio contiene fuentes; el ZIP web-lista contiene únicamente la versión compilada y sus guías.
