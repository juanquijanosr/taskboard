// Actualizar el estado de una tarea (PATCH)
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed, done } = req.body;
  const statusValue = completed !== undefined ? completed : done;

  try {
    // Intentamos actualizar soportando tanto la columna 'completed' como 'done'
    let result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [Boolean(statusValue), id]
    );
    
    if (result.rowCount === 0) {
      result = await pool.query(
        'UPDATE tasks SET done = $1 WHERE id = $2 RETURNING *',
        [Boolean(statusValue), id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// Eliminar una tarea (DELETE)
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});
