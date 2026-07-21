const STATUS_OPTIONS = [
    { value: '', label: 'Semua' },
    { value: 'success', label: 'Sukses' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'voided', label: 'Dibatalkan' },
];

export default function TransactionFilter({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onRefresh,
    loading,
}) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nomor invoice…"
                className="min-w-55 flex-1 rounded-lg border border-beige bg-cream px-4 py-2.5 text-sm text-navy outline-none focus:border-navy"/>

            <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStatusChange(opt.value)}
                    className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                    status === opt.value
                        ? 'bg-navy text-white'
                        : 'bg-beige text-navy hover:brightness-95'
                    }`}>
                    {opt.label}
                </button>
                ))}
            </div>

            <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="rounded-lg border border-navy px-4 py-2 text-xs font-bold text-navy disabled:opacity-40">
                {loading ? 'Memuat…' : 'Muat Ulang'}
            </button>
        </div>
    );
}
