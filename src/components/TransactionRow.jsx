import { formatRupiah } from '../utils/format';
import { STATUS_LABEL, STATUS_CLASS } from '../utils/transaction';

const formatDateTime = (value) =>
    new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function TransactionRow({ transaction, onPrint, onVoid }) {
    const isVoided = transaction.status === 'voided';

    return (
        <div className="rounded-xl border border-beige bg-cream p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-navy">{transaction.invoice_number}</p>
                    <p className="text-xs text-brown">{formatDateTime(transaction.created_at)}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-brown">
                        {transaction.payment_method}
                        </span>
                        <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            STATUS_CLASS[transaction.status] ?? ''
                        }`}
                        >
                        {STATUS_LABEL[transaction.status] ?? transaction.status}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                <p className="text-base font-bold text-navy">
                    {formatRupiah(transaction.total_amount)}
                </p>

                <div className="mt-2 flex gap-2">
                    <button
                        type="button"
                        onClick={() => onPrint(transaction._id)}
                        className="rounded-lg border border-navy px-3 py-1.5 text-[11px] font-bold text-navy">
                        Struk
                    </button>
                    <button
                        type="button"
                        onClick={() => onVoid(transaction)}
                        disabled={isVoided}
                        className="rounded-lg border border-red-600 px-3 py-1.5 text-[11px] font-bold text-red-600 disabled:opacity-40">
                        Batalkan
                    </button>
                </div>
                </div>
            </div>

            {isVoided && transaction.void_reason && (
                <p className="mt-3 border-t border-beige pt-2 text-xs italic text-red-600">
                Alasan batal: {transaction.void_reason}
                </p>
            )}
        </div>
    );
}
