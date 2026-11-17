import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL del backend obtenida desde las variables de entorno de Vite
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  // Cargar tareas al iniciar el componente
  useEffect(() => {
    fetch(`${API_URL}/api/tasks`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        return res.json();
      })
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  // Crear una nueva tarea
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error('No se pudo crear la tarea');

      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar una tarea
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('No se pudo eliminar la tarea');

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>TaskBoard 📌</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="¿Qué tarea tienes pendiente?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Agregar</button>
        </form>

        {loading && <p style={styles.message}>Cargando tareas...</p>}
        {error && <p style={styles.error}>Error: {error}</p>}

        <ul style={styles.list}>
          {tasks.length === 0 && !loading && !error && (
            <p style={styles.message}>No hay tareas pendientes. ¡Crea una arriba!</p>
          )}
          {tasks.map((task) => (
            <li key={task.id || task._id} style={styles.listItem}>
              <span style={styles.taskText}>{task.title}</span>
              <button
                onClick={() => handleDelete(task.id || task._id)}
                style={styles.deleteButton}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Estilos limpios y modernos en línea para asegurar que luzca bien de inmediato
const styles = {
  container: {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f4f6f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    margin: '0 0 20px 0',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: '1',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  list: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  taskText: {
    color: '#1f2937',
    fontSize: '15px',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  message: {
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    color: '#ef4444',
  },
};

export default App;
