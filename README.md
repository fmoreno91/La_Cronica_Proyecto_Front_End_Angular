# La Crónica — Plataforma de noticias en Angular

Aplicación de noticias migrada a Angular. Conserva el diseño, el catálogo inicial y las funciones del sitio original: inicio, búsqueda y filtros, detalle de noticias, favoritos, formulario de contacto y administración básica de publicaciones.

## Requisitos y ejecución

Se requiere Node.js y npm. Desde esta carpeta:

```bash
npm install
npm start
```

Abre la URL local que indique Angular CLI (por defecto `http://localhost:4200`). Las noticias iniciales se sirven desde `public/data/noticias.json`; por eso la aplicación debe ejecutarse con el servidor de desarrollo o un servidor web, no abriendo un archivo `file://`.

Comandos disponibles:

```bash
npm test
npm run build
```

## Secciones

- **Inicio:** noticia principal, destacadas y recientes.
- **Noticias:** catálogo con búsqueda por título/resumen y filtro por categoría.
- **Detalle:** artículo completo y control de favoritos.
- **Favoritos:** lista persistente de lectura.
- **Contacto:** formulario validado; muestra confirmación, pero no envía mensajes a un servicio externo.
- **Administrar:** creación y eliminación de noticias.

## Persistencia

Las noticias y favoritos se guardan en `localStorage` bajo las claves `lacronica_news` y `lacronica_favorites`. Se conserva compatibilidad con los datos que guardaba el sitio original en ese mismo navegador. La administración y favoritos son locales al dispositivo; no existe backend ni sincronización entre usuarios.

## Estructura principal

```text
public/
└── data/noticias.json
src/
├── app/
│   ├── pages/                 # Plantillas de las secciones
│   ├── app.routes.ts
│   ├── news.service.ts        # Carga, noticias y favoritos
│   └── news-card.component.*  # Tarjeta compartida
└── styles.css                 # Estilos migrados del sitio original
```
