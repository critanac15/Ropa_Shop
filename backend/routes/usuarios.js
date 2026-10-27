const express = require('express');
const router = express.Router();
const sql = require('mssql');

// ═══════════════════════════════════
// CRUD: Usuarios (SQL Server)
// ═══════════════════════════════════

// ─── CREATE ─── POST /api/usuarios
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, contrasena, telefono, direccion, ciudad } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('nombre',     sql.NVarChar(100), nombre)
      .input('apellido',   sql.NVarChar(100), apellido)
      .input('email',      sql.NVarChar(150), email)
      .input('contrasena', sql.NVarChar(255), contrasena)
      .input('telefono',   sql.NVarChar(20),  telefono || null)
      .input('direccion',  sql.NVarChar(300), direccion || null)
      .input('ciudad',     sql.NVarChar(100), ciudad || null)
      .query(`
        INSERT INTO Usuarios (nombre, apellido, email, contrasena, telefono, direccion, ciudad)
        VALUES (@nombre, @apellido, @email, @contrasena, @telefono, @direccion, @ciudad);
        SELECT SCOPE_IDENTITY() AS id_usuario;
      `);

    res.status(201).json({
      mensaje: 'Usuario creado',
      data: { id_usuario: result.recordset[0].id_usuario, nombre, apellido, email }
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// ─── READ ALL ─── GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .query('SELECT id_usuario, nombre, apellido, email, telefono, direccion, ciudad, rol, activo, fecha_registro FROM Usuarios WHERE activo = 1');

    res.json({ mensaje: 'Usuarios obtenidos', data: result.recordset });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// ─── READ ONE ─── GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT id_usuario, nombre, apellido, email, telefono, direccion, ciudad, rol, activo, fecha_registro FROM Usuarios WHERE id_usuario = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario encontrado', data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar usuario', error: error.message });
  }
});

// ─── UPDATE ─── PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, ciudad } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id',        sql.Int,          req.params.id)
      .input('nombre',    sql.NVarChar(100), nombre)
      .input('apellido',  sql.NVarChar(100), apellido)
      .input('email',     sql.NVarChar(150), email)
      .input('telefono',  sql.NVarChar(20),  telefono || null)
      .input('direccion', sql.NVarChar(300), direccion || null)
      .input('ciudad',    sql.NVarChar(100), ciudad || null)
      .query(`
        UPDATE Usuarios
        SET nombre = @nombre, apellido = @apellido, email = @email,
            telefono = @telefono, direccion = @direccion, ciudad = @ciudad
        WHERE id_usuario = @id;
        SELECT id_usuario, nombre, apellido, email, telefono, direccion, ciudad FROM Usuarios WHERE id_usuario = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario actualizado', data: result.recordset[0] });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// ─── DELETE ─── DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Usuarios WHERE id_usuario = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

module.exports = router;

