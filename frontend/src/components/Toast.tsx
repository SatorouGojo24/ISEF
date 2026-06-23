import { useEffect } from 'react';

export default function Toast({ message, onClose }: { message: string, onClose: () => void }) {
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
}