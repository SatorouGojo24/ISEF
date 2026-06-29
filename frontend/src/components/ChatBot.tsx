import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export const ChatBot = ({ token }: { token: string }) => {
  // Lo declaramos al inicio del componente por consistencia
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Referencia para hacer scroll automático hacia abajo
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    // Agregamos tu mensaje al chat
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Agregamos la respuesta de la IA
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Error: " + (data.error || "Algo salió mal en el servidor") }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error de conexión con el backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir/cerrar el chat */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg hover:scale-105 transition-transform z-50 shadow-red-600/30"
      >
        AI
      </button>

      {/* Ventana del ChatBot */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-[#0b0b14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
          
          {/* Header del Chat */}
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-bold text-sm">Asistente ISEF</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white font-bold">✕</button>
          </div>

          {/* Área de mensajes (CON SCROLL) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <p className="text-slate-500 text-sm font-bold">¡Hola! ¿En qué te puedo ayudar hoy?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                }`}>
                  {/* Esto respeta los saltos de línea de la IA */}
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}
            
            {/* Animación de "Pensando..." */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-tl-none text-sm font-bold animate-pulse border border-slate-700">
                  Pensando...
                </div>
              </div>
            )}
            
            {/* Ancla invisible para el scroll automático */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de texto y botón de enviar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-[#05050a] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}