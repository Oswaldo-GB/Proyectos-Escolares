// Capa de configuración: un único Pool de conexiones reutilizable en toda la app.
require('dotenv').config();
const { Pool, types } = require('pg');

// Por defecto "pg" convierte DATE y TIMESTAMP en objetos Date de JavaScript, lo que
// provoca desfases de zona horaria (una fecha 2026-10-23 puede llegar como 22/10).
// Las devolvemos como texto tal cual las guarda PostgreSQL.
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Si una conexión inactiva falla, lo registramos sin tumbar el servidor.
pool.on('error', (err) => console.error('Error inesperado en el pool de PostgreSQL:', err.message));

module.exports = { pool };
