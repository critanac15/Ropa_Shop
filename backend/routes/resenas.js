const express = require('express');
const router = express.Router();
const Resena = require('../models/Resena');

// ═══════════════════════════════════
// CRUD: Reseñas (MongoDB)
// ═══════════════════════════════════

// ─── CREATE ─── POST /api/resenas
router.post('/', async (req, res) => {
  try {
    const resena = new Resena(req.body);
    const guardada = await resena.save();
    res.status(201).json({ mensaje: 'Reseña creada', data: guardada });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear reseña', error: error.message });
  }
});

// ─── READ por producto ─── GET /api/resenas/producto/:productoId
router.get('/producto/:productoId', async (req, res) => {
  try {
    const resenas = await Resena.find({ producto_id: req.params.productoId })
      .sort({ fecha: -1 });
    res.json({ mensaje: 'Reseñas obtenidas', data: resenas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas', error: error.message });
  }
});

// ─── READ ALL ─── GET /api/resenas
router.get('/', async (req, res) => {
  try {
    const resenas = await Resena.find().sort({ fecha: -1 });
    res.json({ mensaje: 'Todas las reseñas', data: resenas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas', error: error.message });
  }
});

// ─── UPDATE ─── PUT /api/resenas/:id
router.put('/:id', async (req, res) => {
  try {
    const resena = await Resena.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }
    res.json({ mensaje: 'Reseña actualizada', data: resena });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar reseña', error: error.message });
  }
});

// ─── DELETE ─── DELETE /api/resenas/:id
router.delete('/:id', async (req, res) => {
  try {
    const resena = await Resena.findByIdAndDelete(req.params.id);
    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }
    res.json({ mensaje: 'Reseña eliminada', data: resena });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar reseña', error: error.message });
  }
});

module.exports = router;

