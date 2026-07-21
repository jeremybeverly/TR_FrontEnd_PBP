import { useState } from 'react';

export default function StartShift({ cashierName, onStart, loading, error }) {
    const [amount, setAmount] = useState('');

    const handleChange = (e) => setAmount(e.target.value.replace(/\D/g, ''));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount === '') return;
        onStart(Number(amount));
    };

    const displayValue = amount === '' ? '' : Number(amount).toLocaleString('id-ID');

    return (
        <div className="flex h-full items-center justify-center p-6">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-beige bg-cream p-8">
            <h1 className="text-center text-2xl font-bold text-navy">Mulai Shift</h1>
            <p className="mt-1 text-center text-sm text-brown">
            Masukkan modal awal laci kas untuk membuka shift.
            </p>

            <div className="mt-6 rounded-xl bg-beige/60 px-4 py-3">
                <p className="text-xs text-brown">Kasir bertugas</p>
                <p className="text-lg font-bold text-navy">{cashierName}</p>
            </div>

            <div className="mt-5">
                <label htmlFor="starting-cash" className="mb-1 block text-sm font-bold text-navy">
                    Modal Awal
                </label>
                <div className="flex items-center rounded-lg border border-beige bg-white px-3">
                    <span className="text-sm font-bold text-brown">Rp</span>
                    <input
                    id="starting-cash"
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder="0"
                    autoComplete="off"
                    className="w-full bg-transparent px-2 py-3 text-right text-lg font-bold text-navy outline-none"
                    />
                </div>
            </div>

            {error && (
            <p className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
            </p>
            )}

            <button
                type="submit"
                disabled={amount === '' || loading}
                className="mt-6 w-full rounded-lg bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-40">
                {loading ? 'Memulai…' : 'Mulai Shift'}
            </button>
        </form>
        </div>
    );
}
