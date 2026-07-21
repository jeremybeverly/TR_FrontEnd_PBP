import React, { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import CoreExecutiveDashboard from './pages/Dashboard.jsx';
import KasirApp from './pages/cashier/test.jsx';
import { getUser } from './services/auth.js';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem('token'));
      setUser(getUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!token) return <Login />;

  if (user?.role === 'cashier') return <KasirApp />;

  return <CoreExecutiveDashboard />;
}
