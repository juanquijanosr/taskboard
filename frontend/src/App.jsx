import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  // Cargar tareas
  const fetchTasks = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/tasks`);
      if (!res.ok) throw new Error('No se pudo conectar con el servidor');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [API_URL]);

  // Crear tarea (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error('Error al crear la tarea');
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar estado completado (PATCH)
  const handleToggle = async (task) => {
    const id = task.id || task._id;
    const currentStatus = task.completed ?? task.done ?? false;
    const nextStatus = !currentStatus;

    // Actualización optimista en UI
    setTasks(tasks.map((t) => ((t.id || t._id) === id ? { ...t, completed: nextStatus, done: nextStatus } : t)));

    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextStatus, done: nextStatus }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
    } catch (err) {
      // Revertir si falla
      setTasks(tasks.map((t) => ((t.id || t._id) === id ? { ...t, completed: currentStatus, done: currentStatus } : t)));
      setError('No se pudo actualizar la tarea en el servidor.');
    }
  };

  // Eliminar tarea (DELETE)
  const handleDelete = async (id) => {
    const previousTasks = [...tasks];
    setTasks(tasks.filter((t) => (t.id || t._id) !== id));

    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar la tarea');
    } catch (err) {
      setTasks(previousTasks);
      setError('No se pudo eliminar la tarea.');
    }
  };

  // Estadísticas y filtros
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed || t.done).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTasks = tasks.filter((task) => {
    const isDone = Boolean(task.completed || task.done);
    if (filter === 'pending') return !isDone;
    if (filter === 'completed') return isDone;
    return true;
  });

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Encabezado Superior */}
        <header style={styles.header}>
          <div style={styles.brand}>
            <div style={styles.logoBadge}>✓</div>
            <div>
              <h1 style={styles.title}>TaskBoard</h1>
              <p style={styles.subtitle}>Espacio de trabajo y seguimiento operativo</p>
            </div>
          </div>
          <div style={styles.statusPill}>
            <span style={styles.statusDot}></span>
            En línea
          </div>
        </header>

        {/* Tarjetas de Métricas */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>TOTAL</span>
            <span style={styles.statValue}>{totalCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>PENDIENTES</span>
            <span style={{ ...styles.statValue, color: '#38bdf8' }}>{pendingCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>COMPLETADAS</span>
            <span style={{ ...styles.statValue, color: '#34d399' }}>{completedCount}</span>
          </div>
        </section>

        {/* Barra de Progreso */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span>Progreso general</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Panel Principal */}
        <main style={styles.board}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Escribe una nueva tarea y presiona Enter..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              disabled={submitting}
            />
            <button type="submit" style={styles.primaryBtn} disabled={submitting || !title.trim()}>
              {submitting ? 'Guardando...' : '+ Crear tarea'}
            </button>
          </form>

          {/* Pestañas de Filtro */}
          <div style={styles.filterBar}>
            {[
              { key: 'all', label: `Todas (${totalCount})` },
              { key: 'pending', label: `Pendientes (${pendingCount})` },
              { key: 'completed', label: `Completadas (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  ...styles.filterTab,
                  ...(filter === tab.key ? styles.filterTabActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alertas de Estado */}
          {loading && (
            <div style={styles.infoBox}>
              Conectando con el servidor en Render... (esto puede tardar unos segundos si estaba en reposo)
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
              <button onClick={fetchTasks} style={styles.retryBtn}>Reintentar</button>
            </div>
          )}

          {/* Lista de Tareas */}
          {!loading && filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>Sin tareas en esta vista</p>
              <p style={styles.emptySubtitle}>
                {filter === 'all'
                  ? 'Agrega tu primera actividad en el campo superior para comenzar.'
                  : 'Cambia el filtro superior para ver otras tareas.'}
              </p>
            </div>
          ) : (
            <ul style={styles.list}>
              {filteredTasks.map((task) => {
                const id = task.id || task._id;
                const isDone = Boolean(task.completed || task.done);
                return (
                  <li key={id} style={styles.listItem}>
                    <label style={styles.checkboxWrapper}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggle(task)}
                        style={styles.hiddenCheckbox}
                      />
                      <span
                        style={{
                          ...styles.customCheckbox,
                          ...(isDone ? styles.customCheckboxChecked : {}),
                        }}
                      >
                        {isDone && '✓'}
                      </span>
                      <span
                        style={{
                          ...styles.taskText,
                          ...(isDone ? styles.taskTextCompleted : {}),
                        }}
                      >
                        {task.title}
                      </span>
                    </label>

                    <div style={styles.itemActions}>
                      <span style={isDone ? styles.badgeDone : styles.badgePending}>
                        {isDone ? 'Completada' : 'Pendiente'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(id)}
                        style={styles.deleteBtn}
                        title="Eliminar tarea"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        <footer style={styles.footer}>
          TaskBoard Full-Stack • React + Node.js/Express + PostgreSQL
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 70%)',
    padding: '32px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    fontSize: '22px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.06em',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  progressSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '12px',
    padding: '14px 16px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '8px',
  },
  progressTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: '#0f172a',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #10b981)',
    borderRadius: '999px',
    transition: 'width 0.3s ease',
  },
  board: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  input: {
    flex: '1 1 260px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '15px',
    color: '#f8fafc',
    outline: 'none',
  },
  primaryBtn: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #334155',
    paddingBottom: '14px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  filterTab: {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    color: '#94a3b8',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filterTabActive: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  infoBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    color: '#7dd3fc',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '36px 16px',
    border: '1px dashed #334155',
    borderRadius: '12px',
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '4px',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#64748b',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    flex: '1',
    minWidth: '200px',
  },
  hiddenCheckbox: {
    display: 'none',
  },
  customCheckbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '2px solid #475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  customCheckboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskText: {
    fontSize: '15px',
    color: '#f1f5f9',
    wordBreak: 'break-word',
  },
  taskTextCompleted: {
    textDecoration: 'line-through',
    color: '#64748b',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badgePending: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  badgeDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
};

export default App;
