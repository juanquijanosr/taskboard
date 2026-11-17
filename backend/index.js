const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Obtener tareas
app.get("/api/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear tarea
app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "El título es obligatorio" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *", 
      [title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estado de tarea (PATCH)
app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE tasks SET done = COALESCE($1, NOT done) WHERE id = $2 RETURNING *",
      [done, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar tarea (DELETE)
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ message: "Tarea eliminada correctamente", deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API escuchando en el puerto ${PORT}`));
