import { formatRupiah } from '../utils/format';

const formatTime = (value) =>
  new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function CashflowHistory({ entries, loading, error }) {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-beige bg-cream">
            <h2 className="border-b border-beige px-5 py-3 text-sm font-bold text-navy">
                Riwayat Kas Shift Ini
            </h2>

            <div className="max-h-[40vh] min-h-0 flex-1 overflow-y-auto px-5 py-3">
                {loading ? (
                    <p className="text-xs text-brown">Memuat…</p>
                ) : error ? (
                    <p className="text-xs font-semibold text-red-600">{error}</p>
                ) : entries.length === 0 ? (
                    <p className="py-6 text-center text-xs text-brown">Belum ada catatan kas.</p>
                ) : (
                entries.map((entry) => {
                    const isIn = entry.flow_type === 'cash_in';

                    return (
                    <div key={entry._id} className="border-b border-beige py-3 last:border-0">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold text-navy">
                                    {isIn ? 'Kas Masuk' : 'Kas Keluar'}
                                </p>
                                <p className="text-xs text-brown">{entry.reason}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${isIn ? 'text-green-700' : 'text-red-600'}`}>
                                    {isIn ? '+' : '−'} {formatRupiah(entry.amount)}
                                </p>
                                <p className="text-[10px] text-brown">{formatTime(entry.created_at)}</p>
                            </div>
                        </div>
                    </div>
                    );
                })
                )}
            </div>
        </div>
    );
}
