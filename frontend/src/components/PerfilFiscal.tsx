import { useState, useEffect } from 'react';

export const PerfilFiscal = () => {
  // Estado para el formulario
  const [datos, setDatos] = useState({ rfc: '', razonSocial: '', regimenFiscal: '', codigoPostal: '' });
  const [mensaje, setMensaje] = useState<{ texto: string, tipo: 'exito' | 'error' } | null>(null);
  
  // Estado para las compras
  const [facturas, setFacturas] = useState<any[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem('token');
      // Cargar Perfil
      try {
        const res = await fetch('http://localhost:3000/api/perfil', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setDatos({ rfc: data.rfc, razonSocial: data.razonSocial, regimenFiscal: data.regimenFiscal, codigoPostal: data.codigoPostal });
          }
        }
      } catch (error) { console.error("Error al cargar perfil", error); }

      // Cargar Facturas
      try {
        const resFact = await fetch('http://localhost:3000/api/facturas/mis-compras', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resFact.ok) {
          const dataFact = await resFact.json();
          setFacturas(dataFact);
        }
      } catch (error) { console.error("Error al cargar facturas", error); }
    };
    cargarDatos();
  }, []);

  const guardarPerfil = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(datos)
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje({ texto: '¡Datos fiscales guardados!', tipo: 'exito' });
    } else {
      setMensaje({ texto: data.error || 'Error al guardar', tipo: 'error' });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  const descargarPDF = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/facturas/${id}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${id}.pdf`;
    a.click();
  };

  const descargarXML = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/facturas/${id}/xml`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${id}.xml`;
    a.click();
  };
  
  return (
    <div className="max-w-4xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
      {/* Columna 1: Perfil Fiscal */}
      <div className="bg-[#0b0b14] border border-slate-800 p-8 rounded-3xl h-fit">
        <h2 className="text-2xl font-black text-white mb-6">Mi Perfil Fiscal</h2>
        {mensaje && (
          <div className={`p-3 rounded-xl mb-4 text-sm font-bold text-center ${mensaje.tipo === 'exito' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {mensaje.texto}
          </div>
        )}
        <div className="space-y-4">
          <input placeholder="RFC" className="w-full p-3 bg-slate-900 rounded-xl text-white" value={datos.rfc} onChange={e => setDatos({...datos, rfc: e.target.value})} />
          <input placeholder="Razón Social" className="w-full p-3 bg-slate-900 rounded-xl text-white" value={datos.razonSocial} onChange={e => setDatos({...datos, razonSocial: e.target.value})} />
          <input placeholder="Régimen Fiscal (ej. 601)" className="w-full p-3 bg-slate-900 rounded-xl text-white" value={datos.regimenFiscal} onChange={e => setDatos({...datos, regimenFiscal: e.target.value})} />
          <input placeholder="Código Postal" className="w-full p-3 bg-slate-900 rounded-xl text-white" value={datos.codigoPostal} onChange={e => setDatos({...datos, codigoPostal: e.target.value})} />
          <button onClick={guardarPerfil} className="w-full bg-cyan-600 py-3 rounded-xl font-bold text-white hover:bg-cyan-700 transition">
            GUARDAR DATOS
          </button>
        </div>
      </div>

      {/* Columna 2: Historial de Compras */}
      <div className="bg-[#0b0b14] border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-6">Mis Compras</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {facturas.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Aún no tienes facturas generadas.</p>
          ) : (
            facturas.map((f) => (
              <div key={f.id} className="flex justify-between items-center p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <p className="text-white font-bold text-sm">Folio: {f.folio}</p>
                  <p className="text-[10px] text-slate-400">{new Date(f.fecha).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => descargarPDF(f.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-bold rounded-lg transition-colors border border-slate-700"
                  >
                    PDF
                  </button>
                  <button 
                    onClick={() => descargarXML(f.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-colors border border-slate-700"
                  >
                    XML
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};