# NØMAD — Arquitectura de Base de Datos Políglota

## Distribución de datos

Este proyecto usa **persistencia políglota**: cada motor de base de datos se encarga de lo que mejor hace.

```
┌─────────────────────────────────────────────────────────────────┐
│                        NØMAD — Tienda de Ropa                  │
├────────────────────────────┬────────────────────────────────────┤
│       SQL SERVER           │           MONGODB                  │
│    (Datos relacionales)    │     (Datos flexibles)              │
│                            │                                    │
│  ┌──────────────┐          │   ┌──────────────┐                │
│  │  Categorias  │          │   │  productos   │                │
│  └──────────────┘          │   │  - tallas[]  │                │
│  ┌──────────────┐          │   │  - colores[] │                │
│  │   Usuarios   │◄─────────┼──►│  - imgs[]    │                │
│  └──────┬───────┘ sql_id   │   │  - tags[]    │                │
│         │                  │   └──────┬───────┘                │
│  ┌──────▼───────┐          │   ┌──────▼───────┐                │
│  │   Pedidos    │          │   │   resenas    │                │
│  └──────┬───────┘          │   └──────────────┘                │
│  ┌──────▼───────┐          │   ┌──────────────┐                │
│  │DetallePedidos│──────────┼──►│   carritos   │                │
│  │ mongo_id ────┼──────────┼──►│              │                │
│  └──────────────┘          │   └──────────────┘                │
└───────────────────────-────┴───────────────────────────────────┘
```

## ¿Por qué esta división?

| Aspecto | SQL Server | MongoDB |
|---------|-----------|---------|
| **Qué guarda** | Usuarios, pedidos, categorías | Productos, reseñas, carritos |
| **Por qué** | Datos con relaciones fijas que necesitan transacciones ACID | Datos con estructura variable (tallas, colores, imágenes) |
| **Ejemplo** | Un pedido SIEMPRE tiene usuario, total, estado | Un producto puede tener 2 colores o 10, 1 imagen o 5 |

## Cómo se conectan

Las tablas/colecciones se referencian entre sí mediante IDs:

- `DetallePedidos.producto_mongo_id` → guarda el `_id` (ObjectId) del producto en MongoDB
- `resenas.usuario_sql_id` → guarda el `id_usuario` de SQL Server
- `carritos.usuario_sql_id` → guarda el `id_usuario` de SQL Server

## Cómo ejecutar

### SQL Server
1. Abrir **SQL Server Management Studio (SSMS)**
2. Conectarse al servidor
3. Abrir el archivo `sqlserver_schema.sql`
4. Ejecutar (F5)

### MongoDB
1. Abrir **mongosh** (Mongo Shell) o la terminal de **MongoDB Compass**
2. Copiar y pegar el contenido de `mongodb_schema.js`
3. O ejecutar: `mongosh < mongodb_schema.js`

