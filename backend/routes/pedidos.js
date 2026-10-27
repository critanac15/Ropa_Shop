const express = require('express');
const router = express.Router();
const sql = require('mssql');

// ═══════════════════════════════════
// CRUD: Pedidos (SQL Server)
// ═══════════════════════════════════

// ─── CREATE ─── POST /api/pedidos
router.post('/', async (req, res) => {
  try {
    const { id_usuario, total, direccion_envio, ciudad_envio, metodo_pago, items } = req.body;
    const pool = await sql.connect();

    // Crear cabecera del pedido
    const resultPedido = await pool.request()
      .input('id_usuario',     sql.Int,          id_usuario)
      .input('total',          sql.Decimal(12,2), total)
      .input('direccion_envio', sql.NVarChar(300), direccion_envio)
      .input('ciudad_envio',   sql.NVarChar(100), ciudad_envio)
      .input('metodo_pago',    sql.NVarChar(50),  metodo_pago || null)
      .query(`
        INSERT INTO Pedidos (id_usuario, total, direccion_envio, ciudad_envio, metodo_pago)
        VALUES (@id_usuario, @total, @direccion_envio, @ciudad_envio, @metodo_pago);
        SELECT SCOPE_IDENTITY() AS id_pedido;
      `);

    const id_pedido = resultPedido.recordset[0].id_pedido;

    // Insertar items del pedido (DetallePedidos)
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.request()
          .input('id_pedido',         sql.Int,          id_pedido)
          .input('producto_mongo_id', sql.NVarChar(50), item.producto_mongo_id)
          .input('nombre_producto',   sql.NVarChar(200), item.nombre_producto)
          .input('talla',             sql.NVarChar(10),  item.talla || null)
          .input('color',             sql.NVarChar(50),  item.color || null)
          .input('cantidad',          sql.Int,           item.cantidad)
          .input('precio_unitario',   sql.Decimal(12,2), item.precio_unitario)
          .query(`
            INSERT INTO DetallePedidos (id_pedido, producto_mongo_id, nombre_producto, talla, color, cantidad, precio_unitario)
            VALUES (@id_pedido, @producto_mongo_id, @nombre_producto, @talla, @color, @cantidad, @precio_unitario)
          `);
      }
    }

    res.status(201).json({ mensaje: 'Pedido creado', data: { id_pedido } });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear pedido', error: error.message });
  }
});

// ─── READ ALL ─── GET /api/pedidos
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request()
      .query(`
        SELECT p.*, u.nombre + ' ' + u.apellido AS nombre_cliente
        FROM Pedidos p
        INNER JOIN Usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY p.fecha_pedido DESC
      `);

    res.json({ mensaje: 'Pedidos obtenidos', data: result.recordset });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

// ─── READ ONE con detalles ─── GET /api/pedidos/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();

    // Cabecera
    const pedido = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT p.*, u.nombre + ' ' + u.apellido AS nombre_cliente, u.email
        FROM Pedidos p
        INNER JOIN Usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_pedido = @id
      `);

    if (pedido.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Detalle
    const detalle = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM DetallePedidos WHERE id_pedido = @id');

    res.json({
      mensaje: 'Pedido encontrado',
      data: {
        ...pedido.recordset[0],
        items: detalle.recordset
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar pedido', error: error.message });
  }
});

// ─── UPDATE estado ─── PUT /api/pedidos/:id
router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const pool = await sql.connect();

    // Si el estado es "enviado", actualizar fecha_envio
    // Si el estado es "entregado", actualizar fecha_entrega
    let queryExtra = '';
    if (estado === 'enviado')   queryExtra = ', fecha_envio = GETDATE()';
    if (estado === 'entregado') queryExtra = ', fecha_entrega = GETDATE()';

    const result = await pool.request()
      .input('id',     sql.Int,         req.params.id)
      .input('estado', sql.NVarChar(30), estado)
      .query(`
        UPDATE Pedidos SET estado = @estado ${queryExtra} WHERE id_pedido = @id;
        SELECT * FROM Pedidos WHERE id_pedido = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido actualizado', data: result.recordset[0] });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar pedido', error: error.message });
  }
});

// ─── DELETE ─── DELETE /api/pedidos/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = await sql.connect();

    // Primero borrar detalles, luego cabecera
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM DetallePedidos WHERE id_pedido = @id');

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Pedidos WHERE id_pedido = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido y sus detalles eliminados' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar pedido', error: error.message });
  }
});

module.exports = router;

