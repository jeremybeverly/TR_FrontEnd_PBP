import { useState } from 'react';
import Sidebar from '../../components/CashierSidebar';
import { logout } from '../../services/auth';
import CashierHome from './Home';
import CashierShift from './Shift';

export default function KasirApp() {
    const [view, setView] = useState('home');

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen w-full flex bg-cream">
        <Sidebar
            activeView={view}
            onNavigate={setView}
            onLogout={handleLogout}
        />

        <main className="flex-1 overflow-hidden">
            {view === 'home'    && <CashierHome/>}
            {view === 'shift'   && <CashierShift/>}
            {view === 'history' && <div className="p-6 text-2xl font-bold">Riwayat Transaksi</div>}
        </main>
        </div>
    );
    }