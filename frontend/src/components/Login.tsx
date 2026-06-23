import { useState } from 'react';

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const res = await fetch(`http://localhost:3000/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      if (isRegister) {
        setMessage('Usuario creado. Ahora inicia sesión.');
        setIsRegister(false);
      } else {
        const { token } = await res.json();
        localStorage.setItem('token', token);
        onLogin(token);
      }
    } else {
      setMessage('Error en la operación.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[#05050a] overflow-hidden">
      
      <style>{`
        @keyframes zoom-infinito {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-zoom-isef {
          animation: zoom-infinito 15s ease-in-out infinite;
        }
      `}</style>

      {/* Fondo con animación aplicada */}
      <div 
        className="absolute inset-0 z-0 bg-no-repeat bg-center opacity-20 animate-zoom-isef" 
        style={{ 
            backgroundImage: "url('/logo-isef.webp')", 
            backgroundSize: 'cover' 
        }} 
      />
      
      {/* Formulario */}
      <div className="z-10 bg-[#0b0b14]/80 p-10 rounded-3xl border border-red-600/30 shadow-2xl w-96 backdrop-blur-md">
        <h2 className="text-2xl font-black text-white mb-6 text-center tracking-widest">
            {isRegister ? 'REGISTRO ISEF' : 'ACCESO ISEF'}
        </h2>
        
        {message && <p className="text-red-400 text-xs mb-4 text-center font-bold">{message}</p>}
        
        <input className="w-full bg-slate-900 p-3 rounded-xl mb-4 text-white border border-slate-700 outline-none focus:border-red-600 transition-colors" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full bg-slate-900 p-3 rounded-xl mb-6 text-white border border-slate-700 outline-none focus:border-red-600 transition-colors" type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
        
        <button onClick={handleSubmit} className="w-full bg-red-600 p-3 rounded-xl text-white font-bold mb-4 hover:bg-red-700 transition-colors">
          {isRegister ? 'REGISTRARSE' : 'ENTRAR'}
        </button>
        
        <p className="text-center text-slate-500 text-xs cursor-pointer hover:text-white transition-colors" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  );
}

export default Login;