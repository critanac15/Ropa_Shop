const express = require('express');
const router = express.Router();
const sql = require('mssql');

// ═══════════════════════════════════
// CRUD: Categorías (SQL Server)
// ═══════════════════════════════════

// ─── CREATE ─── POST /api/categorias
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('nombre',      sql.NVarChar(80),  nombre)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .query(`
        INSERT INTO Categorias (nombre, descripcion)
        VALUES (@nombre, @descripcion);
        SELECT SCOPE_IDENTITY() AS id_categoria;
      `);

    res.status(201).json({
      mensaje: 'Categoría creada',
      data: { id_categoria: result.recordset[0].id_categoria, nombre, descripcion }
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
});

// ─── READ ALL ─── GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .query('SELECT * FROM Categorias WHERE activa = 1 ORDER BY nombre');

    res.json({ mensaje: 'Categorías obtenidas', data: result.recordset });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
});

// ─── READ ONE ─── GET /api/categorias/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Categorias WHERE id_categoria = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría encontrada', data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar categoría', error: error.message });
  }
});

// ─── UPDATE ─── PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, activa } = req.body;
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id',          sql.Int,          req.params.id)
      .input('nombre',      sql.NVarChar(80),  nombre)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('activa',      sql.Bit,          activa !== undefined ? activa : 1)
      .query(`
        UPDATE Categorias
        SET nombre = @nombre, descripcion = @descripcion, activa = @activa
        WHERE id_categoria = @id;
        SELECT * FROM Categorias WHERE id_categoria = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría actualizada', data: result.recordset[0] });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar categoría', error: error.message });
  }
});

// ─── DELETE ─── DELETE /api/categorias/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Categorias WHERE id_categoria = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: error.message });
  }
});

module.exports = router;

