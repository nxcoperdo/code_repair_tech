# Portafolio — Nicolás Perdomo · Code Repair Tech

Web estática. Sin build, sin npm, sin backend. Se sube tal cual.

## Estructura
```
index.html          la página (contenido en HTML, funciona sin JS)
styles.css          estilos
main.js             animaciones y fondo reactivo
lib/manifest.js     tus datos (cifras, casos, servicios, contacto)
lib/gsap.min.js     animación
lib/ScrollTrigger.min.js
assets/img/         imágenes en WebP + el video del reel
.htaccess           cache y MIME correctos (Hostinger / Apache)
```

## Para cambiar textos o cifras
Casi todo está en `index.html` en texto plano. `lib/manifest.js` guarda los
mismos datos ordenados por si más adelante quieres generarlos automáticamente.

## Al subir una versión nueva
Cambia `?v=20260831` en `index.html` (dos veces: styles.css y main.js) por la
fecha del día. Así nadie ve la versión vieja en caché.

## Contacto
Correo único: coderepairtech@gmail.com (los tres bloques de contacto llevan
al mismo correo, solo cambia el asunto). WhatsApp: +57 321 942 9385.
