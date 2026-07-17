import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { getIngredients } from '../services/ingredients';

const inputStyle = {
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg)',
    color: 'var(--text-h)',
};

function Testing() {
    const [token, setToken] = useState(() => localStorage.getItem('token') || '');
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin111');

    const [ingredients, setIngredients] = useState([]);
    const [search, setSearch] = useState('');
    const [lowStock, setLowStock] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setMessage(`Login berhasil sebagai ${res.data.user.name} (${res.data.user.role}).`);
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        setIngredients([]);
        setMessage('Token dihapus.');
    };

    const fetchIngredients = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const data = await getIngredients({ search, lowStock });
            setIngredients(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengambil data ingredients.');
        } finally {
            setLoading(false);
        }
    }, [token, search, lowStock]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchIngredients();
    }, [fetchIngredients]);

    return (
        <div style={{ padding: '24px', maxWidth: '760px', margin: '0 auto', textAlign: 'left' }}>
            <h1 style={{ fontSize: '30px', marginBottom: '4px', color: 'var(--text-h)' }}>API Test — Ingredients</h1>
            <p style={{ color: 'var(--text)', marginBottom: '20px' }}>
                GET <code>/api/ingredients</code> (admin only) — display only.
            </p>

            {message && <div style={{ padding: '10px 12px', background: '#d4edda', color: '#155724', borderRadius: '6px', marginBottom: '12px' }}>{message}</div>}
            {error && <div style={{ padding: '10px 12px', background: '#f8d7da', color: '#721c24', borderRadius: '6px', marginBottom: '12px' }}>{error}</div>}

            {/* Auth section — endpoint butuh token admin */}
            <section style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg)', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>1. Auth</h2>
                {token ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#155724', fontWeight: 600 }}>● Token aktif</span>
                        <code style={{ fontSize: '12px', opacity: 0.7, wordBreak: 'break-all' }}>{token.slice(0, 24)}…</code>
                        <button onClick={handleLogout} style={{ ...inputStyle, cursor: 'pointer', marginLeft: 'auto' }}>Logout</button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
                        <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                        <button type="submit" style={{ ...inputStyle, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Login</button>
                    </form>
                )}
            </section>

            {/* Data section */}
            <section style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ fontSize: '18px' }}>2. Ingredients ({ingredients.length})</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input type="text" placeholder="Search name / SKU…" value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-h)' }}>
                            <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
                            Low stock
                        </label>
                        <button onClick={fetchIngredients} disabled={!token} style={{ ...inputStyle, cursor: token ? 'pointer' : 'not-allowed' }}>Refresh</button>
                    </div>
                </div>

                {!token ? (
                    <p style={{ color: 'var(--text)' }}>Login dulu untuk mengambil data.</p>
                ) : loading ? (
                    <p style={{ color: 'var(--text)' }}>Loading…</p>
                ) : ingredients.length === 0 ? (
                    <p style={{ color: 'var(--text)' }}>No ingredients found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '8px' }}>Name</th>
                                    <th style={{ padding: '8px' }}>SKU</th>
                                    <th style={{ padding: '8px' }}>Unit</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Stock</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Min</th>
                                    <th style={{ padding: '8px', textAlign: 'right' }}>Cost/unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingredients.map((item) => {
                                    const isLow = item.current_stock <= item.minimum_stock;
                                    return (
                                        <tr key={item._id} style={{ borderBottom: '1px solid var(--border)', color: isLow ? '#c0392b' : 'var(--text-h)' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{item.ingredient_name}</td>
                                            <td style={{ padding: '8px' }}>{item.sku}</td>
                                            <td style={{ padding: '8px' }}>{item.unit}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>{item.current_stock}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>{item.minimum_stock}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>Rp {item.last_cost_per_unit?.toLocaleString('id-ID')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Testing;
