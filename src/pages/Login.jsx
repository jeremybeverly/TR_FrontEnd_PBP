import React, { useState } from 'react';
import { login } from '../services/auth';

const HEX_BLUE = '#102C57';
const HEX_OFFWHITE = '#FEFAF6';
const HEX_SAND_1 = '#EADBC8';
const HEX_SAND_2 = '#DAC0A3';

function CoffeeIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M4 8.5C4 7.11929 5.11929 6 6.5 6H17.5C18.8807 6 20 7.11929 20 8.5V13C20 14.3807 18.8807 15.5 17.5 15.5H8.5C7.11929 15.5 6 14.3807 6 13V8.5"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18.5 10H19.2C20.1941 10 21 10.8059 21 11.8V12.2C21 13.1941 20.1941 14 19.2 14H20"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6.5 15.5L5 21H19L17.5 15.5"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 11.5H11"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function UserIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M12 11C15.3137 11 18 8.31371 18 5C18 1.68629 15.3137 -1 12 -1C8.68629 -1 6 1.68629 6 5C6 8.31371 8.68629 11 12 11Z"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                transform="translate(0 2)"
            />
        </svg>
    );
}

function LockIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M7 11V8.5C7 6.01472 9.01472 4 11.5 4C13.9853 4 16 6.01472 16 8.5V11"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6 11H17C18.1046 11 19 11.8954 19 13V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V13C4 11.8954 4.89543 11 6 11Z"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M12 15V16"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function EyeIcon({ off = false, className = '' }) {
    // simple eye/eye-off icon
    return off ? (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M3 3L21 21"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10.58 10.58C10.21 10.95 10 11.48 10 12C10 13.1 10.9 14 12 14C12.52 14 13.05 13.79 13.42 13.42"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M9.88 5.08C10.53 4.76 11.26 4.59 12 4.59C16.6 4.59 20.1 8.05 21.4 10.05C21.62 10.38 21.62 10.62 21.4 10.95C20.92 11.7 20.17 12.6 19.21 13.38"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6.1 6.1C4.2 7.3 2.9 9.0 2.6 10.05C2.38 10.38 2.38 10.62 2.6 10.95C3.9 12.95 7.4 16.41 12 16.41C12.74 16.41 13.47 16.24 14.12 15.92"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    ) : (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M2 12C2 12 5.5 4 12 4C18.5 4 22 12 22 12C22 12 18.5 20 12 20C5.5 20 2 12 2 12Z"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke={HEX_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

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
                    <CoffeeIcon className="w-14 h-14" />
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
                            <UserIcon className="w-5 h-5 mr-2" />
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
                            <LockIcon className="w-5 h-5 mr-2" />
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
                                <EyeIcon off={showPassword ? false : true} className="w-5 h-5" />
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

