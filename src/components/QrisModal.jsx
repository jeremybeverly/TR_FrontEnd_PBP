import { useEffect, useState } from 'react';
import {
  getPayUrl,
  getQrImageUrl,
  getTransactionById,
  getErrorMessage,
} from '../services/cashier';
import { formatRupiah } from '../utils/format';

export default function QrisModal({ transaction, onPaid, onClose }) {
    const [status, setStatus] = useState(transaction.status);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status !== 'pending') return;

        let ignore = false;

        const timer = setInterval(async () => {
            try {
                const data = await getTransactionById(transaction._id);
                if (ignore) return;

                const nextStatus = data.transaction.status;
                if (nextStatus !== 'pending') {
                    setStatus(nextStatus);
                    if (nextStatus === 'success') onPaid();
                }
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            }
        }, 3000);

        return () => {
        ignore = true;
        clearInterval(timer);
      };
    }, [transaction._id, status, onPaid]);

    const isPaid = status === 'success';

    console.log('LAN URL', import.meta.env.VITE_LAN_URL);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-cream p-6 text-center">
            <h2 className="text-lg font-bold text-navy">
                {isPaid ? 'Pembayaran Berhasil' : 'Scan untuk Membayar'}
            </h2>

            <p className="mt-1 text-xs text-brown">{transaction.invoice_number}</p>
            <p className="mt-2 text-2xl font-bold text-navy">
                {formatRupiah(transaction.total_amount)}
            </p>

            {isPaid ? (
                <p className="my-8 text-4xl">✅</p>
            ) : (
                <>
                <div className="my-5 flex justify-center">
                    <img
                    src={getQrImageUrl(transaction._id)}
                    alt="QRIS"
                    className="h-56 w-56 rounded-lg bg-white p-2"/>
                </div>

                <p className="mt-4 text-xs font-semibold text-navy">
                    Menunggu pembayaran…
                </p>
                </>
            )}

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
                type="button"
                onClick={onClose}
                className={`mt-5 w-full rounded-lg py-3 text-sm font-bold ${
                isPaid
                    ? 'bg-navy text-white'
                    : 'border border-navy text-navy'
                }`}>{isPaid ? 'Selesai' : 'Tutup'}
            </button>
            </div>
        </div>
    );
}
