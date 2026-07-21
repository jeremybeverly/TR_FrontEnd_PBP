import { formatRupiah } from '../utils/format';

const formatTime = (value) =>
    new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const STATUS_LABEL = {
    success: 'Sukses',
    pending: 'Menunggu',
    voided: 'Dibatalkan',
};

const STATUS_CLASS = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    voided: 'bg-red-100 text-red-800',
};

export default function ShiftTransactions({ transactions, loading, error }) {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-beige bg-cream">
            <h2 className="border-b border-beige px-5 py-3 text-sm font-bold text-navy">
                Transaksi Shift Ini ({transactions.length})
            </h2>

            <div className="max-h-[40vh] min-h-0 flex-1 overflow-y-auto px-5 py-3">
                {loading ? (
                    <p className="text-xs text-brown">Memuat…</p>
                ) : error ? (
                    <p className="text-xs font-semibold text-red-600">{error}</p>
                ) : transactions.length === 0 ? (
                    <p className="py-6 text-center text-xs text-brown">Belum ada transaksi.</p>
                ) : (
                transactions.map((trx) => (
                    <div key={trx._id} className="border-b border-beige py-3 last:border-0">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-navy">{trx.invoice_number}</p>
                                <p className="text-[10px] uppercase text-brown">
                                    {trx.payment_method} · {formatTime(trx.created_at)}
                                </p>
                            </div>
                            <div className="text-right">
                            <p className="text-sm font-bold text-navy">
                                {formatRupiah(trx.total_amount)}
                            </p>
                            <span
                                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                STATUS_CLASS[trx.status] ?? ''
                                }`}>
                                {STATUS_LABEL[trx.status] ?? trx.status}
                            </span>
                            </div>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
    );
}
