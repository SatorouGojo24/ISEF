import { useEffect, useState } from 'react';
import Login from './components/Login';

interface Task { id: string; titulo: string; descripcion: string; estado: boolean; }

// Componente de notificación flotante (Toast)
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 bg-slate-900 border border-cyan-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
      <p className="font-bold text-sm">{message}</p>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. Estado de filtro con persistencia en localStorage
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>(
    (localStorage.getItem('taskFilter') as 'all' | 'pending' | 'completed') || 'all'
  );

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    localStorage.setItem('taskFilter', filter);
  }, [filter]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3000/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setTasks(data); setLoading(false); })
        .catch(() => { setToken(null); setLoading(false); });
    }
  }, [token]);

  if (!token) return <Login onLogin={setToken} />;

  const addTask = async () => {
    setError(null);
    if (!titulo.trim() || !descripcion.trim()) {
      setError("El título y la descripción son obligatorios");
      return;
    }
    const res = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titulo, descripcion }),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTitulo(''); setDescripcion('');
      setToast("Tarea guardada con éxito");
    } else {
      setError("Error al crear la tarea");
    }
  };

  const toggleTask = async (id: string) => {
    await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: !t.estado } : t));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`http://localhost:3000/api/tasks/${deleteTarget}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setTasks(prev => prev.filter(t => t.id !== deleteTarget));
    setDeleteTarget(null);
    setToast("Tarea eliminada correctamente");
  };

  const saveEdit = async (id: string, nuevoTitulo: string, nuevaDescripcion: string) => {
    if (!nuevoTitulo.trim()) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevaDescripcion })
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, titulo: nuevoTitulo, descripcion: nuevaDescripcion } : t));
    setEditingId(null);
    setToast("Tarea editada con éxito");
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.estado;
    if (filter === 'completed') return t.estado;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#05050a] p-12 text-slate-200">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0b0b14] p-8 rounded-3xl border border-red-600/50 shadow-2xl w-80 text-center">
                <h3 className="text-white font-bold mb-4">¿Estás seguro?</h3>
                <p className="text-slate-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-slate-400 text-xs font-bold uppercase">Cancelar</button>
                    <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-red-700 transition-colors">Confirmar</button>
                </div>
            </div>
        </div>
      )}
      
      <main className="mx-auto max-w-2xl">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black text-red-600 mb-10 tracking-wider">ISEF PLANNER</h1>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-red-500 uppercase font-bold">Cerrar Sesión</button>
        </div>
        
        {error && <div className="bg-red-600 text-white p-4 rounded-xl mb-6 text-sm font-bold border border-red-400">{error}</div>}
        
        <div className="space-y-4 rounded-3xl border border-violet-500/20 bg-[#0b0b14] p-8 mb-12">
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título..." className="w-full bg-transparent outline-none text-white font-bold" />
          {/* 3. Atajo de teclado Enter */}
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Detalle..." className="w-full bg-transparent outline-none text-sm text-slate-400" />
          <button onClick={addTask} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-white font-bold">CREAR TAREA</button>
        </div>

        {/* 1. Filtros de estado */}
        <div className="flex gap-4 mb-6">
         {[
          { id: 'all', label: 'Todas' },
          { id: 'pending', label: 'Pendientes' },
          { id: 'completed', label: 'Completadas' }
         ].map(f => (
           <button 
             key={f.id} 
             onClick={() => setFilter(f.id as any)} 
             className={`text-xs font-bold uppercase ${filter === f.id ? 'text-white border-b border-white' : 'text-slate-600'}`}
           >
             {f.label}
           </button>
         ))}
        </div>

        {/* 2. Loading Skeleton */}
        {loading ? (
            <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-slate-800 rounded-2xl"></div>
                <div className="h-20 bg-slate-800 rounded-2xl"></div>
            </div>
        ) : (
          <ul className="space-y-4">
            {filteredTasks.map(task => (
              <li key={task.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#0b0b14] p-6">
                <div className="flex-1">
                  {editingId === task.id ? (
                    <div className="flex flex-col gap-2">
                      <input autoFocus className="bg-transparent border-b border-cyan-500 outline-none text-white font-bold w-full" defaultValue={task.titulo} id={`edit-titulo-${task.id}`} />
                      <input className="bg-transparent border-b border-slate-500 outline-none text-xs text-slate-400 w-full" defaultValue={task.descripcion} id={`edit-desc-${task.id}`} />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(task.id, 
                            (document.getElementById(`edit-titulo-${task.id}`) as HTMLInputElement).value,
                            (document.getElementById(`edit-desc-${task.id}`) as HTMLInputElement).value
                        )} className="text-green-400 text-xs font-bold uppercase">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="text-slate-500 text-xs font-bold uppercase">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className={`font-bold ${task.estado ? 'line-through text-slate-600' : 'text-white'}`}>{task.titulo}</h3>
                      <p className="text-sm text-slate-500">{task.descripcion}</p>
                    </div>
                  )}
                </div>
                {editingId !== task.id && (
                  <div className="flex gap-4 ml-4">
                    <button onClick={() => setEditingId(task.id)} className="text-violet-400 text-xs font-bold uppercase">Editar</button>
                    <button onClick={() => toggleTask(task.id)} className={`text-xs font-bold uppercase ${task.estado ? 'text-slate-600' : 'text-cyan-400'}`}>
                      {task.estado ? 'Completada' : 'Pendiente'}
                    </button>
                    <button onClick={() => setDeleteTarget(task.id)} className="text-red-500 text-xs font-bold uppercase">Borrar</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;