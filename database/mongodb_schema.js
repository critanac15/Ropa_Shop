// ═══════════════════════════════════════════════════
// NØMAD — Esquema MongoDB
// Base de datos: nomaddb
// Colecciones: productos, resenas, carritos
// ═══════════════════════════════════════════════════
//
// Pegar en mongosh (Mongo Shell) o en MongoDB Compass → Shell
//

// Seleccionar / crear la base de datos
use nomaddb;

// ─────────────────────────────────
// Limpiar colecciones si ya existen (solo para desarrollo)
// ─────────────────────────────────
db.productos.drop();
db.resenas.drop();
db.carritos.drop();


// ═══════════════════════════════════
// COLECCIÓN: productos
// Catálogo de ropa con atributos flexibles
// ═══════════════════════════════════

db.createCollection("productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "precio", "categoria", "stock"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre del producto — obligatorio"
        },
        descripcion: {
          bsonType: "string"
        },
        precio: {
          bsonType: "number",
          minimum: 0,
          description: "Precio en pesos — obligatorio"
        },
        precio_descuento: {
          bsonType: "number",
          minimum: 0
        },
        categoria: {
          bsonType: "string",
          enum: ["Camisetas", "Chaquetas", "Pantalones", "Accesorios"],
          description: "Debe coincidir con las categorías de SQL Server"
        },
        genero: {
          bsonType: "string",
          enum: ["hombre", "mujer", "unisex"]
        },
        tallas: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        colores: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre"],
            properties: {
              nombre:  { bsonType: "string" },
              hex:     { bsonType: "string" }
            }
          }
        },
        imagenes: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        stock: {
          bsonType: "int",
          minimum: 0
        },
        etiquetas: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        activo: {
          bsonType: "bool"
        },
        fecha_creacion: {
          bsonType: "date"
        }
      }
    }
  }
});


// ═══════════════════════════════════
// COLECCIÓN: resenas
// Reseñas de clientes sobre productos
// usuario_sql_id referencia al id_usuario de SQL Server
// ═══════════════════════════════════

db.createCollection("resenas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["producto_id", "usuario_sql_id", "calificacion"],
      properties: {
        producto_id: {
          bsonType: "objectId",
          description: "Referencia al producto en esta misma BD"
        },
        usuario_sql_id: {
          bsonType: "int",
          description: "id_usuario de la tabla Usuarios en SQL Server"
        },
        calificacion: {
          bsonType: "int",
          minimum: 1,
          maximum: 5
        },
        comentario: {
          bsonType: "string"
        },
        fecha: {
          bsonType: "date"
        }
      }
    }
  }
});


// ═══════════════════════════════════
// COLECCIÓN: carritos
// Carrito de compras temporal por usuario
// ═══════════════════════════════════

db.createCollection("carritos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario_sql_id", "items"],
      properties: {
        usuario_sql_id: {
          bsonType: "int",
          description: "id_usuario de SQL Server"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["producto_id", "cantidad"],
            properties: {
              producto_id: { bsonType: "objectId" },
              nombre:      { bsonType: "string" },
              talla:       { bsonType: "string" },
              color:       { bsonType: "string" },
              cantidad:    { bsonType: "int", minimum: 1 },
              precio:      { bsonType: "number" }
            }
          }
        },
        actualizado: {
          bsonType: "date"
        }
      }
    }
  }
});


// ═══════════════════════════════════
// ÍNDICES
// ═══════════════════════════════════

db.productos.createIndex({ categoria: 1 });
db.productos.createIndex({ genero: 1 });
db.productos.createIndex({ precio: 1 });
db.productos.createIndex({ nombre: "text", descripcion: "text" });  // búsqueda de texto

db.resenas.createIndex({ producto_id: 1 });
db.resenas.createIndex({ usuario_sql_id: 1 });

db.carritos.createIndex({ usuario_sql_id: 1 }, { unique: true });  // un carrito por usuario


// ═══════════════════════════════════
// DATOS DE EJEMPLO
// ═══════════════════════════════════

db.productos.insertMany([
  {
    nombre: "Camiseta Oversize Algodón",
    descripcion: "Camiseta de corte holgado en algodón orgánico. Perfecta para el día a día.",
    precio: 45000,
    categoria: "Camisetas",
    genero: "unisex",
    tallas: ["XS", "S", "M", "L", "XL"],
    colores: [
      { nombre: "Blanco crudo", hex: "#F5F0E8" },
      { nombre: "Negro carbón", hex: "#1A1A1A" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"
    ],
    stock: NumberInt(45),
    etiquetas: ["nuevo", "básico", "algodón orgánico"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Chaqueta de Pana",
    descripcion: "Chaqueta clásica en pana gruesa con forro interior. Ideal para media estación.",
    precio: 128000,
    categoria: "Chaquetas",
    genero: "hombre",
    tallas: ["S", "M", "L", "XL"],
    colores: [
      { nombre: "Marrón tabaco", hex: "#8B5E3C" },
      { nombre: "Verde oliva",  hex: "#5C6B4F" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"
    ],
    stock: NumberInt(20),
    etiquetas: ["pana", "otoño"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Vestido Midi Lino",
    descripcion: "Vestido midi fluido en lino natural. Fresco y elegante.",
    precio: 76000,
    precio_descuento: 95000,
    categoria: "Camisetas",
    genero: "mujer",
    tallas: ["XS", "S", "M", "L"],
    colores: [
      { nombre: "Terracota", hex: "#C4653A" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500&q=80"
    ],
    stock: NumberInt(15),
    etiquetas: ["descuento", "lino", "verano"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Hoodie Esencial",
    descripcion: "Hoodie de algodón perchado con capucha ajustable y bolsillo canguro.",
    precio: 89000,
    categoria: "Camisetas",
    genero: "unisex",
    tallas: ["S", "M", "L", "XL", "XXL"],
    colores: [
      { nombre: "Gris niebla",  hex: "#A8A29E" },
      { nombre: "Negro carbón", hex: "#1A1A1A" },
      { nombre: "Arena",        hex: "#E8E0D4" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80"
    ],
    stock: NumberInt(60),
    etiquetas: ["básico", "algodón"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Pantalón Cargo Slim",
    descripcion: "Pantalón cargo de corte slim con bolsillos laterales. Tejido resistente.",
    precio: 92000,
    categoria: "Pantalones",
    genero: "hombre",
    tallas: ["28", "30", "32", "34", "36"],
    colores: [
      { nombre: "Oliva oscuro", hex: "#3D4A33" },
      { nombre: "Beige arena",  hex: "#C4B9AA" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&q=80"
    ],
    stock: NumberInt(30),
    etiquetas: ["cargo", "slim"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Blazer Desestructurado",
    descripcion: "Blazer sin forro con hombros relajados. Mezcla de lino y algodón.",
    precio: 145000,
    categoria: "Chaquetas",
    genero: "mujer",
    tallas: ["XS", "S", "M", "L"],
    colores: [
      { nombre: "Beige arena", hex: "#E8E0D4" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&q=80"
    ],
    stock: NumberInt(12),
    etiquetas: ["nuevo", "lino", "formal"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Pack Calcetines ×3",
    descripcion: "Set de 3 pares de calcetines en algodón peinado con diseños variados.",
    precio: 22000,
    categoria: "Accesorios",
    genero: "unisex",
    tallas: ["36-39", "40-43", "44-46"],
    colores: [
      { nombre: "Multicolor", hex: "#CCCCCC" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"
    ],
    stock: NumberInt(100),
    etiquetas: ["pack", "algodón"],
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Camisa Lino Resort",
    descripcion: "Camisa de manga corta en lino puro. Corte relajado estilo resort.",
    precio: 78000,
    categoria: "Camisetas",
    genero: "hombre",
    tallas: ["S", "M", "L", "XL"],
    colores: [
      { nombre: "Azul cielo",   hex: "#87CEEB" },
      { nombre: "Blanco crudo", hex: "#F5F0E8" }
    ],
    imagenes: [
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&q=80"
    ],
    stock: NumberInt(25),
    etiquetas: ["lino", "verano", "resort"],
    activo: true,
    fecha_creacion: new Date()
  }
]);


// Reseñas de ejemplo (usuario_sql_id = id de la tabla Usuarios en SQL Server)
var productos = db.productos.find().toArray();

db.resenas.insertMany([
  {
    producto_id: productos[3]._id,  // Hoodie Esencial
    usuario_sql_id: NumberInt(1),    // Camila R.
    calificacion: NumberInt(5),
    comentario: "La hoodie más cómoda que he tenido. Después de 20 lavadas sigue como el primer día.",
    fecha: new Date()
  },
  {
    producto_id: productos[1]._id,  // Chaqueta de Pana
    usuario_sql_id: NumberInt(2),    // Andrés M.
    calificacion: NumberInt(5),
    comentario: "Me encanta que no sigan modas. Compré esta chaqueta hace 3 años y sigue siendo mi favorita.",
    fecha: new Date()
  },
  {
    producto_id: productos[0]._id,  // Camiseta Oversize
    usuario_sql_id: NumberInt(1),
    calificacion: NumberInt(4),
    comentario: "Muy buena calidad de tela. El corte oversize queda perfecto.",
    fecha: new Date()
  }
]);


// Carrito de ejemplo
db.carritos.insertOne({
  usuario_sql_id: NumberInt(1),
  items: [
    {
      producto_id: productos[0]._id,
      nombre: "Camiseta Oversize Algodón",
      talla: "M",
      color: "Blanco crudo",
      cantidad: NumberInt(1),
      precio: 45000
    },
    {
      producto_id: productos[3]._id,
      nombre: "Hoodie Esencial",
      talla: "L",
      color: "Gris niebla",
      cantidad: NumberInt(1),
      precio: 89000
    }
  ],
  actualizado: new Date()
});


print("✓ Base de datos nomaddb creada correctamente en MongoDB.");

