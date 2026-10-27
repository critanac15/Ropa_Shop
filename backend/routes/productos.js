const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// ═══════════════════════════════════
// CRUD: Productos (MongoDB)
// ═══════════════════════════════════

// ─── CREATE ─── POST /api/productos
router.post('/', async (req, res) => {
  try {
    const producto = new Producto(req.body);
    const guardado = await producto.save();
    res.status(201).json({ mensaje: 'Producto creado', data: guardado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear producto', error: error.message });
  }
});

// ─── READ ALL ─── GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { categoria, genero } = req.query;
    const filtro = { activo: true };

    if (categoria) filtro.categoria = categoria;
    if (genero) filtro.genero = genero;

    const productos = await Producto.find(filtro).sort({ fecha_creacion: -1 });
    res.json({ mensaje: 'Productos obtenidos', data: productos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});

// ─── READ ONE ─── GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto encontrado', data: producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar producto', error: error.message });
  }
});

// ─── UPDATE ─── PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto actualizado', data: producto });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
});

// ─── DELETE ─── DELETE /api/productos/:id
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado', data: producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;

