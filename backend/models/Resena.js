const mongoose = require('mongoose');

// ═══════════════════════════════════
// Modelo: Reseña (MongoDB)
// ═══════════════════════════════════
const resenaSchema = new mongoose.Schema({
  producto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'El producto es obligatorio']
  },
  usuario_sql_id: {
    type: Number,
    required: [true, 'El id del usuario (SQL Server) es obligatorio']
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'fecha', updatedAt: false }
});

module.exports = mongoose.model('Resena', resenaSchema, 'resenas');

