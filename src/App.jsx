import React, { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import CoreExecutiveDashboard from './pages/Dashboard.jsx';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return token ? <CoreExecutiveDashboard /> : <Login />;
}

