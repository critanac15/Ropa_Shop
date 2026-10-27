-- ═══════════════════════════════════════════════════
-- NØMAD — Esquema SQL Server
-- Base de datos: NomadDB
-- Tablas: Usuarios, Categorias, Pedidos, DetallePedidos
-- ═══════════════════════════════════════════════════

-- Crear la base de datos
CREATE DATABASE NomadDB;
GO

USE NomadDB;
GO

-- ─────────────────────────────────
-- TABLA: Categorias
-- Catálogo fijo de categorías de ropa
-- ─────────────────────────────────
CREATE TABLE Categorias (
    id_categoria    INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(80)    NOT NULL UNIQUE,
    descripcion     NVARCHAR(255)   NULL,
    activa          BIT             NOT NULL DEFAULT 1,
    fecha_creacion  DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ─────────────────────────────────
-- TABLA: Usuarios
-- Datos de clientes registrados
-- ─────────────────────────────────
CREATE TABLE Usuarios (
    id_usuario      INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100)   NOT NULL,
    apellido        NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(150)   NOT NULL UNIQUE,
    contrasena      NVARCHAR(255)   NOT NULL,  -- hash, nunca texto plano
    telefono        NVARCHAR(20)    NULL,
    direccion       NVARCHAR(300)   NULL,
    ciudad          NVARCHAR(100)   NULL,
    rol             NVARCHAR(20)    NOT NULL DEFAULT 'cliente',  -- 'cliente' | 'admin'
    activo          BIT             NOT NULL DEFAULT 1,
    fecha_registro  DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- ─────────────────────────────────
-- TABLA: Pedidos
-- Cabecera de cada orden de compra
-- (producto_id referencia al _id de MongoDB)
-- ─────────────────────────────────
CREATE TABLE Pedidos (
    id_pedido       INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario      INT             NOT NULL,
    estado          NVARCHAR(30)    NOT NULL DEFAULT 'pendiente',
        -- 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0,
    direccion_envio NVARCHAR(300)   NOT NULL,
    ciudad_envio    NVARCHAR(100)   NOT NULL,
    metodo_pago     NVARCHAR(50)    NULL,  -- 'tarjeta' | 'transferencia' | 'contraentrega'
    fecha_pedido    DATETIME2       NOT NULL DEFAULT GETDATE(),
    fecha_envio     DATETIME2       NULL,
    fecha_entrega   DATETIME2       NULL,

    CONSTRAINT FK_Pedidos_Usuarios
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

-- ─────────────────────────────────
-- TABLA: DetallePedidos
-- Líneas de cada pedido
-- producto_mongo_id guarda el ObjectId del producto en MongoDB
-- ─────────────────────────────────
CREATE TABLE DetallePedidos (
    id_detalle          INT IDENTITY(1,1) PRIMARY KEY,
    id_pedido           INT             NOT NULL,
    producto_mongo_id   NVARCHAR(50)    NOT NULL,  -- ObjectId de MongoDB como string
    nombre_producto     NVARCHAR(200)   NOT NULL,  -- snapshot del nombre al momento de compra
    talla               NVARCHAR(10)    NULL,
    color               NVARCHAR(50)    NULL,
    cantidad            INT             NOT NULL DEFAULT 1,
    precio_unitario     DECIMAL(12,2)   NOT NULL,
    subtotal            AS (cantidad * precio_unitario) PERSISTED,

    CONSTRAINT FK_Detalle_Pedidos
        FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido)
);
GO

-- ═══════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════
CREATE INDEX IX_Usuarios_Email      ON Usuarios(email);
CREATE INDEX IX_Pedidos_Usuario     ON Pedidos(id_usuario);
CREATE INDEX IX_Pedidos_Estado      ON Pedidos(estado);
CREATE INDEX IX_Detalle_Pedido      ON DetallePedidos(id_pedido);
CREATE INDEX IX_Detalle_Producto    ON DetallePedidos(producto_mongo_id);
GO

-- ═══════════════════════════════════
-- DATOS DE EJEMPLO
-- ═══════════════════════════════════

-- Categorías
INSERT INTO Categorias (nombre, descripcion) VALUES
    ('Camisetas',   'Camisetas, polos y tops'),
    ('Chaquetas',   'Chaquetas, abrigos y blazers'),
    ('Pantalones',  'Pantalones, jeans y shorts'),
    ('Accesorios',  'Gorras, calcetines y bolsos');
GO

-- Usuario de prueba (contraseña: 123456 → hash ficticio)
INSERT INTO Usuarios (nombre, apellido, email, contrasena, telefono, direccion, ciudad) VALUES
    ('Camila', 'Rodríguez', 'camila@email.com', '$2b$10$hashFicticioAquiNoUsarEnProduccion', '3001234567', 'Calle 45 #12-30', 'Bogotá'),
    ('Andrés', 'Martínez',  'andres@email.com', '$2b$10$hashFicticioAquiNoUsarEnProduccion', '3109876543', 'Carrera 7 #80-15', 'Medellín');
GO

-- Pedido de ejemplo
INSERT INTO Pedidos (id_usuario, estado, total, direccion_envio, ciudad_envio, metodo_pago) VALUES
    (1, 'confirmado', 134000, 'Calle 45 #12-30', 'Bogotá', 'tarjeta');
GO

-- Detalle del pedido (producto_mongo_id se llena con el ObjectId real de MongoDB)
INSERT INTO DetallePedidos (id_pedido, producto_mongo_id, nombre_producto, talla, color, cantidad, precio_unitario) VALUES
    (1, '000000000000000000000001', 'Camiseta Oversize Algodón', 'M',  'Blanco crudo', 1, 45000),
    (1, '000000000000000000000004', 'Hoodie Esencial',          'L',  'Gris niebla',  1, 89000);
GO

PRINT '✓ Base de datos NomadDB creada correctamente en SQL Server.';
GO

