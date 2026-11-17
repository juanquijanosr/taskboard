import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/api/tasks`);
      if (!res.ok) throw new Error("No se pudo conectar con el servidor");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error("Error al crear la tarea");
      setTitle("");
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTask = async (id, doneState) => {
    try {
      await fetch(`${API}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !doneState })
      });
      loadTasks();
    } catch (err) {
      alert("Error al actualizar la tarea");
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API}/api/tasks/${id}`, {
        method: "DELETE"
      });
      loadTasks();
    } catch (err) {
      alert("Error al eliminar la tarea");
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>TaskBoard</h1>
      
      <form onSubmit={addTask} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input 
          type="text"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="¿Qué necesitas hacer?"
          style={{ flex: 1, padding: "8px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>Agregar</button>
      </form>

      {loading && <p style={{ color: "#666" }}>Cargando tareas (el servidor gratuito puede tardar unos segundos)...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}. Comprueba la conexión con la API.</p>}

      {!loading && !error && tasks.length === 0 && <p>No hay tareas pendientes.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #eee" }}>
            <span 
              onClick={() => toggleTask(t.id, t.done)}
              style={{ 
                cursor: "pointer", 
                textDecoration: t.done ? "line-through" : "none",
                color: t.done ? "#888" : "#000",
                flex: 1
              }}
            >
              {t.title}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => toggleTask(t.id, t.done)} style={{ cursor: "pointer" }}>
                {t.done ? "Marcar pendiente" : "Completar"}
              </button>
              <button onClick={() => deleteTask(t.id)} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}