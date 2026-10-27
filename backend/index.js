const path = require('path');
// Cargar variables de entorno desde .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════
// MIDDLEWARES
// ═══════════════════════════════════
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// ═══════════════════════════════════
// 1. CONEXIÓN A MONGODB
// ═══════════════════════════════════
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nomaddb';

mongoose.connect(mongoURI)
  .then(() => console.log('🟢 Conectado a MongoDB exitosamente'))
  .catch(err => console.error('🔴 Error conectando a MongoDB:', err.message));


// ═══════════════════════════════════
// 2. CONEXIÓN A SQL SERVER
// ═══════════════════════════════════
const sqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'NomadDB',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
  }
};

sql.connect(sqlConfig)
  .then(() => console.log(`🟢 Conectado a SQL Server exitosamente (${sqlConfig.database})`))
  .catch(err => console.error('🔴 Error conectando a SQL Server:', err.message));


// ═══════════════════════════════════
// 3. RUTAS — CRUD
// ═══════════════════════════════════

// --- MongoDB ---
const productosRoutes  = require('./routes/productos');
const resenasRoutes    = require('./routes/resenas');

// --- SQL Server ---
const usuariosRoutes   = require('./routes/usuarios');
const categoriasRoutes = require('./routes/categorias');
const pedidosRoutes    = require('./routes/pedidos');

app.use('/api/productos',  productosRoutes);
app.use('/api/resenas',    resenasRoutes);
app.use('/api/usuarios',   usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos',    pedidosRoutes);


// ═══════════════════════════════════
// LEVANTAR EL SERVIDOR
// ═══════════════════════════════════
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('🔒 Credenciales cargadas desde .env');
  console.log('');
  console.log('  Rutas disponibles:');
  console.log('  ─────────────────────────────────');
  console.log('  MongoDB:');
  console.log('    GET/POST        /api/productos');
  console.log('    GET/PUT/DELETE  /api/productos/:id');
  console.log('    GET/POST        /api/resenas');
  console.log('    GET/PUT/DELETE  /api/resenas/:id');
  console.log('  ─────────────────────────────────');
  console.log('  SQL Server:');
  console.log('    GET/POST        /api/usuarios');
  console.log('    GET/PUT/DELETE  /api/usuarios/:id');
  console.log('    GET/POST        /api/categorias');
  console.log('    GET/PUT/DELETE  /api/categorias/:id');
  console.log('    GET/POST        /api/pedidos');
  console.log('    GET/PUT/DELETE  /api/pedidos/:id');
  console.log('  ─────────────────────────────────');
  console.log('  Frontend:');
  console.log(`    Tienda:         http://localhost:${PORT}`);
  console.log(`    Panel Admin:    http://localhost:${PORT}/admin.html`);
  console.log('');
});
