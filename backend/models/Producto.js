const mongoose = require('mongoose');

// ═══════════════════════════════════
// Modelo: Producto (MongoDB)
// ═══════════════════════════════════
const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: 0
  },
  precio_descuento: {
    type: Number,
    min: 0,
    default: null
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Camisetas', 'Chaquetas', 'Pantalones', 'Accesorios']
  },
  genero: {
    type: String,
    enum: ['hombre', 'mujer', 'unisex'],
    default: 'unisex'
  },
  tallas: {
    type: [String],
    default: []
  },
  colores: [{
    nombre: String,
    hex: String
  }],
  imagenes: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  etiquetas: {
    type: [String],
    default: []
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'fecha_creacion', updatedAt: 'fecha_actualizacion' }
});

module.exports = mongoose.model('Producto', productoSchema, 'productos');

