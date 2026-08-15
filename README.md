# Calculadora de ISR, IMSS, Aguinaldo y Prima Vacacional (CDMX)

Calculadora web estática e informativa, en HTML/CSS/JS puro (sin frameworks, sin build), pensada
para publicarse en GitHub Pages. No recopila ni almacena ningún dato del usuario: todos los
cálculos se ejecutan en el navegador.

## Estructura

```
/
├── index.html          # Calculadora (sueldo/IMSS + aguinaldo/prima vacacional)
├── legal.html           # Aviso de privacidad, términos de uso y metodología
├── css/
│   └── styles.css
├── js/
│   ├── constants.js     # Tarifa ISR 2026, UMA 2026, tasas IMSS, tabla de vacaciones LFT
│   ├── isr.js            # Cálculo de ISR (tarifa mensual + tasa efectiva)
│   ├── imss.js            # Cálculo de la cuota obrero de IMSS
│   ├── prestaciones.js    # Cálculo de aguinaldo y prima vacacional
│   └── app.js              # Lógica de la interfaz
└── assets/
    └── favicon.svg
```

## Correr en local

No requiere instalación ni paso de build. Basta con abrir `index.html` en el navegador, o servir
la carpeta con cualquier servidor estático, por ejemplo:

```
npx serve .
```

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En el repositorio, ve a **Settings → Pages**.
3. En "Build and deployment", selecciona **Deploy from a branch**, rama `main` (o la que uses) y
   carpeta `/ (root)`.
4. Guarda; GitHub publicará el sitio en `https://<usuario>.github.io/<repositorio>/`.

Todas las rutas del proyecto son relativas, por lo que funciona igual si el sitio se publica en la
raíz de un dominio (`usuario.github.io`) o en una subruta de repositorio
(`usuario.github.io/nombre-repo/`).

## Pruebas unitarias

Los módulos de cálculo (`js/constants.js`, `validaciones.js`, `isr.js`, `imss.js`,
`prestaciones.js`) tienen una suite de pruebas sin dependencias externas, que ejecuta esos
mismos archivos con el módulo `vm` de Node:

```
npm test
```

o directamente:

```
node tests/run-tests.js
```

## Actualizar cifras fiscales en años futuros

Las cifras que cambian cada año (tarifa de ISR, valor de la UMA, salario mínimo) o que pueden
reformarse (tasas de IMSS, días de vacaciones por antigüedad) están centralizadas en
`js/constants.js`. Actualízalas ahí cuando el SAT, el INEGI, el IMSS o la CONASAMI publiquen nuevos
valores, y vuelve a correr `npm test` para confirmar que nada se rompió.

## Aviso

Esta herramienta es informativa y no constituye asesoría fiscal, legal ni laboral. Ver
`legal.html` para el aviso de privacidad, los términos de uso y la metodología completa.
