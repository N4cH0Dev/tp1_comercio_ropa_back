// index.js
const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json()); // para leer JSON en el body

// ---------------------- CLIENTES ----------------------

// Registrar cliente
app.post("/clientes", async (req, res) => {
  try {
    const { nombre, telefono, mail } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      "INSERT INTO clientes (nombre, telefono, mail) VALUES (?, ?, ?)",
      [nombre, telefono, mail]
    );

    res.status(201).json({ id: result.insertId, nombre, telefono, mail });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Listar clientes
app.get("/clientes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM clientes");
    res.json(rows);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ---------------------- PRODUCTOS ----------------------

// Registrar producto
app.post("/productos", async (req, res) => {
  try {
    const { nombre, talle, color, precio, stock } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({
        error: "Nombre, precio y stock son obligatorios",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO productos (nombre, talle, color, precio, stock) VALUES (?, ?, ?, ?, ?)",
      [nombre, talle, color, precio, stock]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      talle,
      color,
      precio,
      stock,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Listar productos
app.get("/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos");
    res.json(rows);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ---------------------- VENTAS ----------------------
// Formato esperado del body:
// {
//   "cliente_id": 1,
//   "items": [
//     { "producto_id": 2, "cantidad": 3 },
//     { "producto_id": 5, "cantidad": 1 }
//   ]
// }

app.post("/ventas", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { cliente_id, items } = req.body;

    if (!cliente_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "cliente_id e items son obligatorios",
      });
    }

    // Usamos transacción simple para asegurar consistencia
    await connection.beginTransaction();

    let totalVenta = 0;

    // Primero calculamos el total y verificamos stock
    for (const item of items) {
      const { producto_id, cantidad } = item;

      const [rowsProd] = await connection.query(
        "SELECT precio, stock FROM productos WHERE id = ?",
        [producto_id]
      );

      if (rowsProd.length === 0) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: `Producto ${producto_id} no existe` });
      }

      const producto = rowsProd[0];

      if (producto.stock < cantidad) {
        await connection.rollback();
        return res.status(400).json({
          error: `Stock insuficiente para producto ${producto_id}`,
        });
      }

      totalVenta += Number(producto.precio) * cantidad;
    }

    // Insertamos en VENTAS
    const [resultVenta] = await connection.query(
      "INSERT INTO ventas (cliente_id, total) VALUES (?, ?)",
      [cliente_id, totalVenta]
    );

    const ventaId = resultVenta.insertId;

    // Insertamos el detalle y actualizamos stock
    for (const item of items) {
      const { producto_id, cantidad } = item;

      const [rowsProd] = await connection.query(
        "SELECT precio, stock FROM productos WHERE id = ?",
        [producto_id]
      );
      const producto = rowsProd[0];

      // Insertar detalle de la venta
      await connection.query(
        "INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [ventaId, producto_id, cantidad, producto.precio]
      );

      // Descontar stock
      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [cantidad, producto_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      venta_id: ventaId,
      total: totalVenta,
    });
  } catch (error) {
    console.error("Error al registrar venta:", error);
    await connection.rollback();
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    connection.release();
  }
});

// Listar ventas (con cliente)
app.get("/ventas", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id, v.fecha, v.total,
             c.nombre AS cliente_nombre, c.telefono, c.mail
      FROM ventas v
      JOIN clientes c ON c.id = v.cliente_id
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al listar ventas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Listar detalle de una venta
app.get("/ventas/:id/detalle", async (req, res) => {
  try {
    const ventaId = req.params.id;

    const [rows] = await pool.query(
      `
      SELECT dv.id, p.nombre AS producto, p.talle, p.color,
      dv.cantidad, dv.precio_unitario
      FROM detalle_ventas dv
      JOIN productos p ON p.id = dv.producto_id
      WHERE dv.venta_id = ?
      `,
      [ventaId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ---------------------- SERVIDOR ----------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
