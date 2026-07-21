import { useState } from 'react';
import { formatRupiah } from '../utils/format';

export default function VoidModal({ transaction, onClose, onConfirm, loading, error }) {
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim() === '') return;
        onConfirm(reason.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-cream p-6">
                <h2 className="text-lg font-bold text-navy">Batalkan Transaksi</h2>
                <p className="mt-1 text-xs text-brown">
                {transaction.invoice_number} · {formatRupiah(transaction.total_amount)}
                </p>

                <label htmlFor="void-reason" className="mt-5 mb-1 block text-sm font-bold text-navy">
                Alasan Pembatalan
                </label>
                <input
                    id="void-reason"
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="cth. salah input pesanan"
                    autoFocus
                    className="w-full rounded-lg border border-beige bg-white px-3 py-2 text-sm text-navy outline-none focus:border-navy"/>

                {error && (
                    <p className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-xs font-semibold text-red-800">
                        {error}
                    </p>
                )}

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-navy py-3 text-sm font-bold text-navy disabled:opacity-40">
                        Tutup
                    </button>
                    <button
                        type="submit"
                        disabled={loading || reason.trim() === ''}
                        className="flex-1 rounded-lg bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-40">
                        {loading ? 'Memproses…' : 'Batalkan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
