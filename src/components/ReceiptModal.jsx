import { useEffect, useState } from 'react';
import { getTransactionById, getErrorMessage } from '../services/cashier';
import { getUser } from '../services/auth';
import { formatRupiah } from '../utils/format';

const formatDateTime = (value) =>
    new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

export default function ReceiptModal({ transactionId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getTransactionById(transactionId);
                if (!ignore) setData(res);
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        load();
        return () => { ignore = true; };
    }, [transactionId]);

    const transaction = data?.transaction;
    const details = data?.details ?? [];
    const cashierName = getUser()?.name ?? '-';
    const isVoided = transaction?.status === 'voided';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-5">
            {loading && <p className="text-brown">Memuat struk…</p>}
            {error && <p className="font-semibold text-red-600">{error}</p>}

            {transaction && (
            <>
                <div id="receipt-print" className="font-mono text-[11px] leading-relaxed text-black">
                <div className="text-center">
                    <p className="text-sm font-bold">COFFEESHOP POS</p>
                    <p>Struk Pembelian</p>
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                <div className="flex justify-between"><span>No. Invoice</span><span>{transaction.invoice_number}</span></div>
                <div className="flex justify-between"><span>Tanggal</span><span>{formatDateTime(transaction.created_at)}</span></div>
                <div className="flex justify-between"><span>Kasir</span><span>{cashierName}</span></div>
                <div className="flex justify-between">
                    <span>Pembayaran</span>
                    <span className="uppercase">{transaction.payment_method}</span>
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                {details.map((item) => {
                    const modifierText = (item.selected_modifiers ?? [])
                    .map((m) => m.modifier_name)
                    .join(', ');

                    return (
                    <div key={item._id} className="mb-2">
                        <p className="font-bold">{item.product_name}</p>
                        {modifierText && <p className="pl-2 italic">+ {modifierText}</p>}
                        <div className="flex justify-between">
                        <span className="pl-2">
                            {item.quantity} x {formatRupiah(item.unit_price)}
                        </span>
                        <span>{formatRupiah(item.subtotal)}</span>
                        </div>
                    </div>
                    );
                })}

                <div className="my-2 border-t border-dashed border-black" />

                <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(transaction.subtotal)}</span></div>
                <div className="flex justify-between">
                    <span>Pajak ({Math.round(transaction.tax_rate * 100)}%)</span>
                    <span>{formatRupiah(transaction.tax_amount)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm font-bold">
                    <span>TOTAL</span><span>{formatRupiah(transaction.total_amount)}</span>
                </div>

                {isVoided && (
                    <p className="mt-3 text-center text-sm font-bold">*** DIBATALKAN ***</p>
                )}

                <div className="my-2 border-t border-dashed border-black" />
                </div>

                <div className="mt-5 flex gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-navy py-3 text-sm font-bold text-navy">
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-2 rounded-lg bg-navy py-3 text-sm font-bold text-white">
                        Cetak / Simpan PDF
                    </button>
                </div>
            </>
            )}
        </div>
        </div>
    );
}
