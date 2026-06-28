import { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

interface Producto { 
  id: string; 
  titulo: string; 
  precio: number; 
  descripcion: string; 
  tipo: string; 
  color: string; 
}

// Catálogo con libros ISEF simulados
const productosISEF: Producto[] = [
  { id: 'lib_1', tipo: 'Libro', titulo: 'Fisco Agenda 2026', precio: 550, descripcion: 'La compilación fiscal más completa y actualizada de México. Indispensable para contadores.', color: 'from-blue-600 to-blue-900' },
  { id: 'lib_2', tipo: 'Libro', titulo: 'Ley Federal del Trabajo', precio: 320, descripcion: 'Edición comentada y correlacionada. Casos prácticos y ejemplos reales aplicables al nuevo modelo.', color: 'from-emerald-600 to-emerald-900' },
  { id: 'lib_3', tipo: 'Libro', titulo: 'Guía Práctica Nóminas', precio: 450, descripcion: 'Aprende a calcular CFDI 4.0, retenciones y finiquitos sin errores ante el SAT y el IMSS.', color: 'from-orange-500 to-red-700' },
  { id: 'lib_4', tipo: 'Libro', titulo: 'Defensa Fiscal Paso a Paso', precio: 680, descripcion: 'Estrategias legales comprobadas contra auditorías, multas y embargos de la autoridad.', color: 'from-purple-600 to-purple-900' },
  { id: 'srv_1', tipo: 'Servicio', titulo: 'Suscripción ISEF Pro', precio: 499, descripcion: 'Acceso digital mensual a nuestra biblioteca completa y herramientas de cálculo automatizadas.', color: 'from-slate-700 to-slate-900' },
];

export const TiendaISEF = () => {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Lógica integrada para facturación automática
  const handleFacturacion = async (titulo: string, precio: number) => {
    const token = localStorage.getItem('token');
  
    try {
      const res = await fetch('http://localhost:3000/api/facturas/generar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          conceptos: [{ Cantidad: 1, Descripcion: titulo, ValorUnitario: precio }]
        })
      });
      
      if (res.ok) {
        alert("¡Pago exitoso y Factura generada!");
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.detalle || "No se pudo facturar"));
      }
    } catch (e) {
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="w-full px-6 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* Modal de Checkout */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-[#0b0b14] p-8 shadow-2xl animate-fade-in-up relative">
            <button onClick={() => setProductoSeleccionado(null)} className="absolute top-6 right-6 text-slate-500 hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-8 pr-8">
              <div className="inline-block px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-black uppercase rounded-full mb-3 tracking-widest">{productoSeleccionado.tipo}</div>
              <h3 className="text-2xl font-black text-white mb-2">Completar Compra</h3>
              <p className="text-slate-400 text-sm">Estás a punto de adquirir <span className="text-cyan-400 font-bold">{productoSeleccionado.titulo}</span></p>
              <div className="mt-4 text-3xl font-black text-white">${productoSeleccionado.precio} <span className="text-sm text-slate-500 font-normal">MXN</span></div>
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <PayPalButtons 
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                createOrder={(_, actions) => actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{ amount: { currency_code: "MXN", value: productoSeleccionado.precio.toString() } }]
                })}
                onApprove={async (_, actions) => {
                  await actions.order?.capture();
                  // Ejecutamos la facturación tras aprobar el pago
                  await handleFacturacion(productoSeleccionado.titulo, productoSeleccionado.precio);
                  setProductoSeleccionado(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE LA TIENDA */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-wider">Librería <span className="text-cyan-500">ISEF</span></h2>
          <p className="text-slate-400 text-sm mt-2">La mejor literatura fiscal, legal y contable de México a un clic de distancia.</p>
        </div>
      </div>

      {/* SECCIÓN DEL CARRUSEL DE LIBROS */}
      <div className="relative mb-16">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-cyan-500 rounded-full"></span> Destacados 2026
        </h3>
        
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {productosISEF.map((prod) => (
            <div key={prod.id} className="snap-center shrink-0 w-[280px] bg-[#0b0b14] border border-slate-800 rounded-3xl overflow-hidden flex flex-col hover:border-cyan-500/50 transition-all shadow-xl hover:-translate-y-2">
              <div className={`h-40 w-full bg-gradient-to-br ${prod.color} p-6 flex flex-col justify-end relative overflow-hidden`}>
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">{prod.tipo}</div>
                <h3 className="text-white font-black text-xl leading-tight relative z-10 drop-shadow-md">{prod.titulo}</h3>
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 shadow-inner"></div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between">
                <p className="text-sm text-slate-400 mb-6 line-clamp-3">{prod.descripcion}</p>
                <div>
                  <div className="text-2xl font-black text-cyan-400 mb-4">
                    ${prod.precio} <span className="text-xs text-slate-500 font-normal">MXN</span>
                  </div>
                  <button 
                    onClick={() => setProductoSeleccionado(prod)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase tracking-widest hover:bg-cyan-600 transition-colors"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};