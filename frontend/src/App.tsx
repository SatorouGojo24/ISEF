import { useEffect, useState } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalButton } from './components/PayPalButton';
import Login from './components/Login';
import { ChatBot } from './components/ChatBot';
import { TiendaISEF } from './components/TiendaISEF';
import { PerfilFiscal } from './components/PerfilFiscal';

interface Task { id: string; titulo: string; descripcion: string; estado: boolean; }
interface ToastData { message: string; type: 'success' | 'error'; }

const Toast = ({ data, onClose }: { data: ToastData, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up ${data.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 border border-cyan-500 text-white'}`}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${data.type === 'error' ? 'bg-white' : 'bg-cyan-500'}`} />
      <p className="font-bold text-sm">{data.message}</p>
    </div>
  );
};

function App() {
  // Declaramos nuestra variable maestra aquí arriba
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  // NAVEGACIÓN Y VISTAS AJUSTADA
  const [vistaActual, setVistaActual] = useState<'planner' | 'tienda' | 'perfil'>('planner');
  
  // Estados de interfaz y CRUD
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ titulo: '', descripcion: '' });
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>((localStorage.getItem('taskFilter') as any) || 'all');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => { localStorage.setItem('taskFilter', filter); }, [filter]);
  
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(`${apiUrl}/api/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 403) throw new Error("Sesión expirada");
          return res.json();
        })
        .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => { localStorage.removeItem('token'); setToken(null); setLoading(false); });
    }
  }, [token, apiUrl]);

  if (!token) return <Login onLogin={setToken} />;

  const addTask = async () => {
    if (!titulo.trim() || !descripcion.trim()) return setToast({ message: "Título y detalle obligatorios", type: 'error' });
    const res = await fetch(`${apiUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titulo, descripcion }),
    });
    if (res.ok) { 
      const newTask = await res.json(); 
      setTasks([newTask, ...tasks]); setTitulo(''); setDescripcion(''); 
      setToast({ message: "Tarea guardada", type: 'success' }); 
    }
  };

  const toggleTask = async (id: string) => {
    await fetch(`${apiUrl}/api/tasks/${id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, estado: !t.estado } : t));
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    await fetch(`${apiUrl}/api/tasks/${taskToDelete.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
    setToast({ message: "Tarea eliminada", type: 'success' });
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({ titulo: task.titulo, descripcion: task.descripcion });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.titulo.trim() || !editForm.descripcion.trim()) return setToast({ message: "Campos vacíos", type: 'error' });
    await fetch(`${apiUrl}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titulo: editForm.titulo, descripcion: editForm.descripcion })
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, titulo: editForm.titulo, descripcion: editForm.descripcion } : t));
    setEditingId(null);
    setToast({ message: "Actualizada", type: 'success' });
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(t => { 
    if (filter === 'pending') return !t.estado; 
    if (filter === 'completed') return t.estado; 
    return true; 
  }) : [];

  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", currency: "MXN" }}>
      <div className="min-h-screen bg-[#05050a] text-slate-200 relative pb-12">
        {toast && <Toast data={toast} onClose={() => setToast(null)} />}
        
        {/* NAVEGACIÓN SUPERIOR AJUSTADA PARA MÓVILES */}
        <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center shadow-lg gap-3 md:gap-0">
          
          {/* Fila 1 (Móvil): Logo y Cerrar Sesión */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-2xl font-black text-red-600 tracking-wider">ISEF<span className="text-white"></span></h1>
            <button onClick={logout} className="md:hidden text-[10px] text-slate-400 hover:text-red-500 uppercase font-bold border border-slate-700 px-2 py-1 rounded-md">Cerrar Sesión</button>
          </div>
          
          {/* Fila 2 (Móvil): Botones del Menú */}
          <div className="flex gap-2 md:gap-6 w-full md:w-auto justify-between md:justify-center overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setVistaActual('planner')} className={`font-bold text-[11px] md:text-sm tracking-wide uppercase whitespace-nowrap transition-colors ${vistaActual === 'planner' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}>Mi Planner</button>
            <button onClick={() => setVistaActual('tienda')} className={`font-bold text-[11px] md:text-sm tracking-wide uppercase whitespace-nowrap transition-colors ${vistaActual === 'tienda' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}>Catálogo ISEF</button>
            <button onClick={() => setVistaActual('perfil')} className={`font-bold text-[11px] md:text-sm tracking-wide uppercase whitespace-nowrap transition-colors ${vistaActual === 'perfil' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-500 hover:text-slate-300'}`}>Perfil Fiscal</button>
          </div>
          
          {/* Cerrar sesión escritorio */}
          <button onClick={logout} className="hidden md:block text-xs text-slate-500 hover:text-red-500 uppercase font-bold">Cerrar Sesión</button>
        </nav>

        {/* Modal de Eliminación */}
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0b0b14] p-8 text-center shadow-2xl animate-fade-in-up">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-black text-xl mb-4">!</div>
              <h3 className="text-xl font-black text-white mb-2">¿Confirmar eliminación?</h3>
              <p className="text-sm text-slate-400 mb-6">Estás a punto de eliminar "{taskToDelete.titulo}".</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setTaskToDelete(null)} className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white uppercase">Cancelar</button>
                <button onClick={confirmDelete} className="px-5 py-3 rounded-2xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 uppercase shadow-lg shadow-red-600/20">Eliminar Tarea</button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div className="pt-6 md:pt-10">
          {vistaActual === 'planner' ? (
            <main className="mx-auto max-w-2xl px-4 md:px-6">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-black text-white mb-2">Panel de Tareas</h2>
                <PayPalButton />
              </div>
              <div className="space-y-4 rounded-3xl border border-violet-500/20 bg-[#0b0b14] p-6 md:p-8 mb-8 shadow-xl">
                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la tarea..." className="w-full bg-transparent outline-none text-white font-bold text-lg" />
                <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Detalles o descripción..." className="w-full bg-transparent outline-none text-sm text-slate-400" />
                <button onClick={addTask} className="w-full mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 py-3 text-white font-bold hover:opacity-90">CREAR TAREA</button>
              </div>
              <div className="flex gap-2 md:gap-4 mb-6 justify-center md:justify-start">
                <button onClick={() => setFilter('all')} className={`text-xs md:text-sm font-bold uppercase ${filter === 'all' ? 'text-violet-400' : 'text-slate-600'}`}>Todas</button>
                <button onClick={() => setFilter('pending')} className={`text-xs md:text-sm font-bold uppercase ${filter === 'pending' ? 'text-violet-400' : 'text-slate-600'}`}>Pendientes</button>
                <button onClick={() => setFilter('completed')} className={`text-xs md:text-sm font-bold uppercase ${filter === 'completed' ? 'text-violet-400' : 'text-slate-600'}`}>Completadas</button>
              </div>
              {loading ? ( <div className="animate-pulse space-y-4"><div className="h-20 bg-slate-800 rounded-2xl"></div></div> ) : (
                <ul className="space-y-4">
                  {filteredTasks.map(task => (
                    <li key={task.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0b0b14] p-5 md:p-6 hover:border-slate-700">
                      {editingId === task.id ? (
                        <div className="flex-1 space-y-3 w-full md:mr-4">
                          <input value={editForm.titulo} onChange={e => setEditForm({...editForm, titulo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold outline-none" />
                          <input value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 outline-none" />
                          <div className="flex gap-3">
                            <button onClick={() => saveEdit(task.id)} className="text-xs font-bold text-cyan-400">GUARDAR</button>
                            <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-500">CANCELAR</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 w-full">
                          <h3 className={`font-bold ${task.estado ? 'line-through text-slate-600' : 'text-white'}`}>{task.titulo}</h3>
                          <p className={`text-sm mt-1 ${task.estado ? 'text-slate-700' : 'text-slate-500'}`}>{task.descripcion}</p>
                        </div>
                      )}
                      {editingId !== task.id && (
                        <div className="flex md:flex-col gap-3 justify-between md:justify-end items-center md:items-end w-full md:w-auto border-t border-slate-800 md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                          <button onClick={() => toggleTask(task.id)} className={`text-xs font-bold uppercase ${task.estado ? 'text-slate-500' : 'text-cyan-500'}`}>{task.estado ? 'Pendiente' : 'Completada'}</button>
                          <div className="flex gap-3">
                            <button onClick={() => startEdit(task)} className="text-xs font-bold text-violet-500 uppercase">Editar</button>
                            <button onClick={() => setTaskToDelete(task)} className="text-xs font-bold text-red-500 uppercase">Eliminar</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                  {filteredTasks.length === 0 && <div className="text-center text-slate-600 py-10 font-bold">No hay tareas.</div>}
                </ul>
              )}
            </main>
          ) : vistaActual === 'tienda' ? (
            <TiendaISEF />
          ) : (
            <PerfilFiscal />
          )}
        </div>
        <ChatBot token={token || ""} />
      </div>
    </PayPalScriptProvider>
  );
}

export default App;