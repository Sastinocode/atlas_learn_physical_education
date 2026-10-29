# El cuerpo en movimiento · TSEAS

Atlas educativo interactivo en español de España para la asignatura de valoración de la condición física: atlas 2D y 3D, core, taller, ejercicios por fases, lecciones de planos, ejes y palancas, y juegos con corrección y progreso local. No necesita cuentas ni servidor: el alumnado usa perfiles ficticios y todo se guarda en su navegador.

## Probarlo
Abre `dist-offline/index.html` (tras compilar) o doble clic en `ABRIR-ATLAS.cmd`. Para ponerlo en Internet, sigue [docs/PUBLICAR-EN-GITHUB-PAGES.md](docs/PUBLICAR-EN-GITHUB-PAGES.md).

## Desarrollo
Requiere Node.js 24 y npm.

```sh
npm ci
npm run check         # tipos y verificaciones
npm run build:pages   # genera dist-offline
npm run preview:pages # http://localhost:4175/
```

## Dónde está cada cosa
| Carpeta o archivo | Contenido |
|---|---|
| `app/` | Código y contenidos de la aplicación |
| `app/content.ts`, `core-content.ts`, `planes-content.ts`… | Textos y preguntas editables |
| `tests/` | Comprobaciones automáticas |
| `scripts/`, `live/` | Aula en directo (servidor aparte) |
| `docs/` | Guías, tutoriales y notas de revisión |
| `docs/capturas/` | Capturas de pantalla de referencia |
| `public/credits/` | Licencias y atribuciones de terceros |

## Documentación
- [Guía de uso](docs/LEEME.md) y [tutorial para profesorado y alumnado](docs/TUTORIAL-PROFESOR-Y-ALUMNADO.md)
- [Planos, ejes y palancas](docs/APRENDER-PLANOS-PALANCAS.md) · [Juegos](docs/JUEGOS-PLANOS-PALANCAS.md) · [Core y juego](docs/GUIA-CORE-Y-JUEGO.md)
- [Aula en directo](docs/GUIA-AULA-EN-DIRECTO.md) (necesita Node.js; GitHub Pages no la ejecuta)
- [Comprobaciones](docs/COMPROBACIONES.md) · [Atribuciones](docs/THIRD-PARTY-NOTICES.md)

## Límites
Contenido introductorio pendiente de contraste con la programación y de revisión anatómica especializada. No es un simulador clínico ni un sistema oficial de evaluación; las respuestas abiertas las valora el profesor y los dibujos son esquemáticos.
