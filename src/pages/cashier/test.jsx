// src/pages/kasir/KasirApp.jsx
import { useState } from 'react';
import { logout } from '../../services/auth';

export default function KasirApp() {
  const [view, setView] = useState('home');   // 'home' | 'shift' | 'history'

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen w-full flex bg-cream">
      {/* Sidebar sementara — nanti dipecah jadi komponen Sidebar.jsx */}
      <aside className="w-20 shrink-0 bg-beige flex flex-col items-center py-6 gap-6">
        <img src="masukkan url gambar kesini" alt="logo" className="w-8 h-8" />

        <button onClick={() => setView('home')}>
          <img src="masukkan url gambar kesini" alt="home" className="w-6 h-6" />
        </button>
        <button onClick={() => setView('shift')}>
          <img src="masukkan url gambar kesini" alt="shift" className="w-6 h-6" />
        </button>
        <button onClick={() => setView('history')}>
          <img src="masukkan url gambar kesini" alt="history" className="w-6 h-6" />
        </button>

        <button onClick={handleLogout} className="mt-auto">
          <img src="masukkan url gambar kesini" alt="logout" className="w-6 h-6" />
        </button>
      </aside>

      <main className="flex-1 p-6">
        {view === 'home' && <div className="text-navy text-2xl font-bold">Home - Kasir</div>}
        {view === 'shift' && <div className="text-navy text-2xl font-bold">Shift Kerja</div>}
        {view === 'history' && <div className="text-navy text-2xl font-bold">History Transaksi</div>}
      </main>
    </div>
  );
}
