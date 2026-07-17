# CLAUDE.md — Reglas del proyecto LecturaPDF

Este archivo debe leerse y obedecerse al principio de cada sesión de trabajo en este repositorio.

## Sobre el usuario

- El usuario no sabe programar y no entiende el código. Explicar siempre en español y en lenguaje llano, sin jerga técnica.
- Antes de hacer un cambio, decir en una frase qué se va a tocar y qué riesgo tiene. Después, decir en una frase qué se ha hecho.
- Si algo pedido es mala idea, puede romper algo, o es ambiguo, DECIRLO en vez de hacerlo. Es preferible llevar la contraria a romper la app.
- Si algo no está claro, preguntar. No improvisar ni inventar.

## Red de seguridad (obligatorio)

- Antes de empezar cualquier cambio, comprobar con `git status` que el repo está limpio. Si hay cambios sin guardar, avisar antes de tocar nada.
- Hacer un commit por cada cambio con sentido, con un mensaje descriptivo en español. Nunca acumular muchos cambios distintos en un solo commit.
- Cada vez que se suba una versión nueva, crear también una etiqueta de git (`git tag v64`) y subirla (`git push --tags`), para poder volver atrás fácilmente.
- Si algo sale mal, recordar al usuario que se puede volver a la versión anterior, y decir el comando exacto que hay que ejecutar.
- NUNCA usar `git push --force`, ni borrar ramas, ni reescribir el historial. Jamás.
- Cambios pequeños y de uno en uno. Nada de refactorizaciones grandes ni de "ya que estoy, mejoro esto otro". Solo lo pedido.

## El proyecto

- LecturaPDF es una PWA de un solo archivo: todo (HTML, CSS y JS) va inline dentro de `index.html`. Nunca separarlo en archivos `.css` o `.js`.
- Solo se usan pdf.js 3.11.174 y jspdf 2.5.1 desde cdnjs. Prohibido añadir cualquier otra librería o dependencia.
- Prohibidas las APIs de pago y los servicios que cuesten dinero. Todo tiene que ser gratis.
- Se despliega con GitHub Pages en https://elealvgar-applectura.github.io/lectura/
- El uso principal es en iPad con Apple Pencil. Cuidar el palm rejection, los gestos, el rendimiento táctil y que todo se pueda tocar con el dedo.

## Regla del despliegue (crítica)

- En CADA despliegue hay que subir SIEMPRE las dos versiones a la vez: `APP_VER` en `index.html` y `CACHE` en `sw.js`, con el mismo número. Si solo se sube una, el iPad se queda con la versión vieja cacheada y parece que no ha pasado nada.
- Nunca hacer push sin haber subido las dos.

## Los datos son sagrados

- Los datos de la app son irreemplazables: son apuntes de años del usuario. Perderlos es el peor fallo posible, peor que cualquier bug visual.
- Se guardan en IndexedDB (los PDFs y las anotaciones por página) y en muchas claves de localStorage por documento: `lp_order_`, `lp_margin_`, `lp_embeds_`, `lp_bm_`, `lp_tl_`, `lp_themes_`, `lp_thememap_`, `lp_delents_`, `lp_toolcfg`, `lp_color`, `lp_gest` y más.
- Nunca romper la compatibilidad con datos que ya existen. Si se cambia un formato, escribir una migración que convierta lo antiguo.
- Si se añade cualquier clave nueva de localStorage, hay que añadirla TAMBIÉN a la función de exportar copias de seguridad. Ya pasó una vez que un backup salía incompleto en silencio, y no se supo hasta que fue tarde.
- Nunca escribir código que borre datos sin que el usuario lo haya pedido explícitamente.

## Firebase: zona prohibida

- Hay sincronización automática por Firebase (proyecto `lecturapdf-426aa`) de anotaciones, conceptos y conclusiones entre dispositivos. Funciona. Es sagrada.
- No tocar NADA de la lógica de sync (`initFirebase`, `signIn`, `writeDoc`, `readDoc`, `pushDoc`, `pullDoc`, `syncNow`, `watchDoc`, `gzip`, `gunzip`, `markDirty`, `forcePush`, `forcePull`, `collectDocData`, `applyDocData`) sin pedir permiso primero y explicar qué se va a hacer y por qué.
- Si un cambio pedido afecta indirectamente al sync, avisar ANTES de tocarlo.

## Cómo trabajar

- Antes de tocar una función, leerla entera y entender cómo encaja con el resto. El archivo tiene 6000+ líneas y todo está conectado.
- Respetar el estilo del código que ya existe: nombres, formato, comentarios en español.
- Los comentarios largos que ya hay en el código explican por qué se hicieron las cosas y qué falló antes. Leerlos y no borrarlos.
- No borrar código que no se entienda por qué está ahí. Preguntar.
- Cuando se termine, decir qué debe probar el usuario en el iPad para verificar que funciona.
