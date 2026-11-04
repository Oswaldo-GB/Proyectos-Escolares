// Punto de entrada: arranca el servidor y comprueba la conexión con PostgreSQL.
require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
  // Verificamos la conexión al arrancar para detectar errores de .env de inmediato.
  try {
    await pool.query('SELECT 1');
    console.log('Conectado a PostgreSQL ✔');
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    console.error('Revisa backend/.env (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).');
  }
});

// Cierre limpio con Ctrl+C
process.on('SIGINT', async () => { await pool.end(); process.exit(0); });
