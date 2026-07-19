import { useState } from 'react';

import { Icon } from '@iconify/react';
import { login } from '../services/auth';

const HEX_BLUE = '#102C57';
const HEX_OFFWHITE = '#FEFAF6';
const HEX_SAND_1 = '#EADBC8';


const ICONS = {
    coffee: 'mdi:coffee',
    user: 'mdi:account-circle',
    lock: 'mdi:lock',
    eye: 'mdi:eye',
    eyeOff: 'mdi:eye-off',
};

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login({ username, password });
            // backend returns token + user {role}
            const user = res?.user || JSON.parse(localStorage.getItem('user') || 'null');

            if (!user?.role) {
                throw new Error('Login berhasil tetapi role user tidak ditemukan');
            }

            // Redirect/handle based on role.
            // For this project (single page), store and reload dashboard.
            // You can later connect with React Router.
            if (user.role === 'admin') {
                window.location.href = '/';
            } else {
                window.location.href = '/';
            }
        } catch (err) {
            setError(err?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center" style={{ backgroundColor: HEX_OFFWHITE }}>
            <div
                className="w-full max-w-md rounded-2xl p-10"
                style={{
                    backgroundColor: 'white',
                    border: `1px solid ${HEX_BLUE}`,
                    boxShadow: '0 10px 30px rgba(16,44,87,0.08)',
                }}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <Icon icon={ICONS.coffee} className="w-14 h-14" style={{ color: HEX_BLUE }} />
                    <h1 className="text-2xl font-bold" style={{ color: HEX_BLUE }}>
                        Masuk Sebagai Admin/Kasir
                    </h1>
                    <p className="text-sm" style={{ color: HEX_BLUE, opacity: 0.7 }}>
                        Silakan masuk untuk mengakses sistem.
                    </p>
                </div>


                {error ? (
                    <div className="mt-5 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: `1px solid #FCA5A5` }}>
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold" style={{ color: HEX_BLUE }}>
                            Nama Pengguna
                        </label>
                        <div className="mt-2 flex items-center border rounded-xl" style={{ borderColor: HEX_SAND_1, backgroundColor: HEX_OFFWHITE, padding: '0 10px' }}>
                            <Icon icon={ICONS.user} className="w-5 h-5 mr-2" style={{ color: HEX_BLUE }} />

                            <input
                                className="w-full py-3 text-sm bg-transparent outline-none"
                                style={{ color: HEX_BLUE }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan nama pengguna"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold" style={{ color: HEX_BLUE }}>
                            Kata Sandi
                        </label>
                        <div className="mt-2 flex items-center border rounded-xl" style={{ borderColor: HEX_SAND_1, backgroundColor: HEX_OFFWHITE, padding: '0 10px' }}>
                            <Icon icon={ICONS.lock} className="w-5 h-5 mr-2" style={{ color: HEX_BLUE }} />


                            <input
                                className="w-full py-3 text-sm bg-transparent outline-none"
                                style={{ color: HEX_BLUE }}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan kata sandi"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="ml-2 p-1 rounded-lg"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                <Icon
                                    icon={showPassword ? ICONS.eyeOff : ICONS.eye}
                                    className="w-5 h-5"
                                    style={{ color: HEX_BLUE }}
                                />
                            </button>

                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-white font-bold transition"
                        style={{ backgroundColor: HEX_BLUE, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs" style={{ color: HEX_BLUE, opacity: 0.6 }}>
                    Hanya untuk staf internal.
                </div>
            </div>
        </div>
    );
}

