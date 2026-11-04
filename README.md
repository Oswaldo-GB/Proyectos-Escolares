# Autopartes del Sur — Sistema de gestión

Backend (Node.js + Express + PostgreSQL) y frontend (HTML/CSS/JS puro) para las 13 tablas del diagrama ER.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- HTML
- CSS
- JavaScript

## Estructura del proyecto

- backend: lógica y servicios del servidor.
- frontend: interfaz de usuario.
- database: respaldo SQL de PostgreSQL.

## Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env     # en Windows: copy .env.example .env   → luego edita los datos de PostgreSQL
npm run dev
```

Abre **http://localhost:3000**.

Prueba opcional del backend (crea y borra datos marcados "ZZ-PRUEBA" en la base de `.env`):

```bash
npm run smoke -- --yes
```

## Cómo está organizado

```
backend/src/config/entities.js   ← FUENTE ÚNICA: tablas, columnas, relaciones y etiquetas
backend/src/routes/              ← genera /api/<módulo> para cada entidad
backend/src/controllers/         ← validación + respuestas HTTP (genérico)
backend/src/models/repository.js ← SQL parametrizado (genérico)
backend/src/services/validator.js← validación de campos por tipo
backend/src/middlewares/         ← errores de PostgreSQL traducidos a mensajes claros
frontend/js/                     ← app (menú y rutas), table, form, api, ui
database/schema.sql              ← solo referencia/pruebas; la BD real es la de tu compañero
```

## Si los nombres de la base real son distintos

Todo se corrige en **`backend/src/config/entities.js`**: `table` (nombre de la tabla) y `name` (nombre de la columna).
Ejemplo: si la columna es `anio` en vez de `año`, cambia `name: 'año'` por `name: 'anio'` y, en `orderBy`/`search`/`label` del vehículo, `"año"` por `"anio"`.

## Agregar o cambiar un campo

Edita la entidad en `entities.js` y reinicia el servidor: el formulario y la tabla se actualizan solos.

## Base de datos

El respaldo SQL se encuentra en:

autopartes-del-sur/database/autopartes_del_sur.sql
