// Configuración de Express: middlewares, API REST y archivos estáticos del frontend.
const path = require('path');
const express = require('express');
const apiRoutes = require('./routes/api.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// API (siempre devuelve JSON, incluso en errores)
app.use('/api', apiRoutes);
app.use('/api', notFound);

// Frontend estático: mismo origen que la API → no se necesita CORS
app.use(express.static(path.join(__dirname, '../../frontend')));

// Siempre al final
app.use(errorHandler);

module.exports = app;
