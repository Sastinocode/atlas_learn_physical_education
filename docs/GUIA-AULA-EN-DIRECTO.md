# Aula en directo · guía del profesor

## Inicio simplificado (versión 8)
1. Haz doble clic en **ABRIR EL CUERPO EN MOVIMIENTO.cmd**, junto a la carpeta de la aplicación. Se abre el navegador automáticamente.
2. Pulsa **Crear sala y mostrar QR**. El tiempo predeterminado es de 30 segundos; puedes cambiarlo antes de crear.
3. Proyecta el QR. Cada alumno lo escanea con la cámara y escribe únicamente su alias. También puedes copiar el enlace.
4. Cuando estén todos, pulsa **Todos listos: empezar**.
5. Al cerrar el tiempo, pulsa **Revelar solución** y después **Siguiente pregunta**.
6. Pulsa **Guardar resultados (Excel)** para descargar un CSV. Puedes abrirlo en Excel o LibreOffice.

El mismo iniciador recupera la aplicación si ya estaba abierta. Mantén su ventana minimizada durante la clase.

## Detalles de conexión
1. En este ordenador, abre `ABRIR-AULA-ONLINE.cmd`. Requiere Node.js (ya instalado aquí) y el conector oficial `tools/cloudflared.exe` incluido en esta instalación.
2. Mantén esa ventana abierta y visita http://localhost:4175/live/.
3. Elige el tiempo (15–180 segundos) y pulsa **Crear sala de juego**.
4. Copia el enlace **https://…trycloudflare.com/live/?room=…** que muestra la sala y compártelo por el aula virtual, mensajería habitual o proyectándolo. No compartas localhost.
5. El alumnado puede usar wifi o datos móviles. Entra con un alias ficticio de 2–20 caracteres. No hace falta cuenta ni instalar nada.
6. Cuando estén todos, pulsa **Empezar**. No se admiten participantes nuevos una vez iniciada la partida; quienes ya estaban pueden reconectar con el mismo navegador.

## Durante la partida
- Las mismas 10 preguntas y opciones, en el mismo orden, para todos (CORE10-v1).
- El profesor inicia cada pregunta; el reloj es común y se comprueba en el servidor.
- Cada alumno selecciona una opción y pulsa Confirmar. Solo se admite una respuesta; seleccionar sin confirmar no cuenta.
- El marcador se actualiza aproximadamente cada segundo. Se muestran alias, puntos, respuestas recibidas y presencia reciente. «Sin conexión reciente» significa que no hubo comunicación en 15 segundos, no una comprobación del estado del teléfono.
- 100 puntos por acierto, 0 por error o sin respuesta. Sin bonus por velocidad. Los empates comparten puesto.
- Al terminar el tiempo, se cierra la recepción. El profesor puede cerrarla antes, revelar la solución y pasar a la siguiente pregunta.
- Las soluciones y explicaciones llegan a los móviles al revelarlas. Al finalizar se pueden revisar las 10.
- El profesor puede descargar un CSV compatible con Excel con alias, respuestas y puntuaciones. No incluye los códigos privados de acceso.

## Conexión, privacidad y cierre
- Es una primera versión piloto con un enlace temporal de Cloudflare Quick Tunnels. Funciona desde internet, pero no tiene dirección fija ni garantía de disponibilidad. El enlace cambia cada vez que se inicia el conector.
- El tráfico de la sala pasa por Cloudflare. Usa solo alias ficticios y comparte el enlace con tu clase; cualquiera que tenga enlace y código puede intentar entrar antes del inicio.
- La creación de salas solo se permite desde localhost, en el ordenador del profesor. El alumnado no puede usar los controles docentes con sus credenciales.
- El acceso se guarda en el navegador para reconectar. Cambiar de navegador o borrar sus datos pierde ese acceso. Recargar no reinicia el tiempo. Una desconexión no pausa la pregunta.
- Mantén el ordenador despierto y conectado. Apagarlo o detener el proceso corta la sesión. No se abren puertos del router ni se cambia el firewall.
- Las salas y respuestas están en memoria: se pierden al parar el servidor, al cerrar la sala o tras 6 horas. Exporta antes si quieres conservar el resultado.
- Máximo 60 participantes por sala. Es una actividad didáctica, no un examen con identidad verificada. No se ha probado con 60 móviles físicos.
- Al terminar, pulsa **Cerrar y borrar sala**, cierra la pestaña y detén el iniciador con Ctrl+C. La clasificación deja de estar accesible.

## Si no abre
- Si ya hay un servidor usando el puerto 4175, no abras otro iniciador; utiliza el que está funcionando.
- Si el enlace público no aparece, revisa la conexión del ordenador y vuelve a iniciar. Un filtro del centro puede bloquear los dominios trycloudflare.com.
- Para una instalación nueva en Windows, instala Node.js desde https://nodejs.org/ y descarga cloudflared desde el repositorio oficial https://github.com/cloudflare/cloudflared/releases. Coloca el ejecutable Windows amd64 en `tools/cloudflared.exe`. Si trasladas el proyecto fuente a otro ordenador, ejecuta `npm install` una vez para instalar sus dependencias (incluido el generador QR).
- Para un uso habitual con dirección permanente y servidor independiente del ordenador, hará falta desplegar el servicio en un alojamiento estable; esta versión no lo incluye.

## Desarrollo
- `app/game-content.ts`: banco común editable. Cambia SET_ID si cambias las preguntas.
- `npm run build:live`: genera `live/question-bank.mjs`, leído solo por el servidor; no se sirve como archivo público.
- `live/app.js`, `live/style.css`: pantallas ligeras del móvil y profesor.
- `scripts/classroom-server.mjs`: salas, credenciales, tiempos y puntuación.
- `npm run aula:online`: inicia servidor y enlace temporal.
- `npm run aula:local`: alternativa solo wifi; escucha en el puerto 4175 de la red local.
- `node verify-classroom.mjs`: verifica dos participantes, diez preguntas, permisos, tiempos y exportación.
- Abrir el index.html sin servidor sigue permitiendo usar el atlas y el juego individual; no permite resultados compartidos.

Referencia del servicio temporal: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
