# Publicar en GitHub Pages

1. Descomprime el paquete de repositorio en tu ordenador.
2. Crea un repositorio **público** llamado, por ejemplo, `el-cuerpo-en-movimiento`, con rama principal `main`.
3. Sube el contenido de la carpeta del proyecto a la raíz del repositorio (no el ZIP y no una carpeta contenedora adicional). Incluye `.github/workflows/pages.yml`. Puedes usar GitHub Desktop: añade la carpeta como repositorio local, crea el repositorio si lo solicita, haz un commit y pulsa Publish repository. Desmarca Keep this code private para usar Pages con GitHub Free.
4. En GitHub abre **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Abre **Actions → Publicar atlas en GitHub Pages → Run workflow**. Espera a que build y deploy terminen en verde.
6. Abre la URL que aparece en Settings → Pages: `https://TU-USUARIO.github.io/el-cuerpo-en-movimiento/` (ejemplo; todavía no hay una URL publicada).
7. Comparte esa URL con el alumnado. Ya no depende del servidor de tu ordenador.

Cada nuevo push a `main` vuelve a comprobar, compilar y publicar. Si utilizas otra rama, ajusta `.github/workflows/pages.yml`. No hacen falta claves ni servicios de pago para la versión estática en un repositorio público.

Guía oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

