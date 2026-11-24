# Code Repair Tech — Portfolio website

Static portfolio site for Code Repair Tech, the software and technical-services brand of Nicolás Perdomo. Plain HTML, CSS and JavaScript: no build step, no npm, no backend.

## Structure

- `index.html`: the page (content in plain HTML, works without JavaScript).
- `styles.css`: styles.
- `main.js`: animations and reactive background.
- `lib/`: GSAP and ScrollTrigger, plus `manifest.js` with the site data (figures, cases, services, contact).
- `assets/img/`: WebP images and the reel video.
- `.htaccess`: caching and MIME types for Apache hosting.

## Stack

HTML5, CSS3, vanilla JavaScript, GSAP + ScrollTrigger.

## How to run

Open `index.html` in a browser, or serve the folder with any static server (for example `python -m http.server`). To deploy, upload the folder as is to a static host.

_A Spanish guide is available in `LEEME.md`._
