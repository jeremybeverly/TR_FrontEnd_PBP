import { useState } from 'react';
import Sidebar from '../../components/CashierSidebar';
import { logout } from '../../services/auth';
import CashierHome from './Home';
import CashierShift from './Shift';
import CashierHistory from './History';

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
            {view === 'history' && <CashierHistory/>}
        </main>
        </div>
    );
    }