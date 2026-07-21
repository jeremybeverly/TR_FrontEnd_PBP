import { useEffect, useState } from 'react';
import { formatRupiah } from '../utils/format';

const SHIFT_DURATION_MS = 6 * 60 * 60 * 1000;  

const formatDuration = (ms) => {
    const total = Math.floor(Math.abs(ms) / 1000);
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
};

function CashForm({ flowType, title, onSubmit, submitting }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const displayValue = amount === '' ? '' : Number(amount).toLocaleString('id-ID');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (amount === '' || Number(amount) < 1 || reason.trim() === '') return;

        const ok = await onSubmit({
        flow_type: flowType,
        amount: Number(amount),
        reason: reason.trim(),
        });

        if (ok) {
            setAmount('');
            setReason('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl bg-beige/60 p-4">
            <p className="text-sm font-bold text-navy">{title}</p>

            <div className="mt-2 flex items-center rounded-lg border border-beige bg-white px-3">
                <span className="text-xs font-bold text-brown">Rp</span>
                <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full bg-transparent px-2 py-2 text-right text-sm font-bold text-navy outline-none"/>
            </div>

            <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Alasan (cth. beli galon)"
                className="mt-2 w-full rounded-lg border border-beige bg-white px-3 py-2 text-xs text-navy outline-none focus:border-navy"/>

            <button
                type="submit"
                disabled={submitting || amount === '' || reason.trim() === ''}
                className="mt-2 w-full rounded-lg bg-navy py-2 text-xs font-bold text-white disabled:opacity-40">
                Catat
            </button>
        </form>
    );
}

export default function DuringShiftHeader({ shift, onSubmitCashflow, onEndShift, submitting, error }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const elapsed = now - new Date(shift.start_time).getTime();
    const remaining = SHIFT_DURATION_MS - elapsed;
    const isOvertime = remaining < 0;

    return (
        <div className="rounded-2xl border border-beige bg-cream p-5">
            <div className="text-center">
                <button
                    type="button"
                    onClick={onEndShift}
                    className="absolute right-12 top-12 rounded-lg border border-red-600 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >Selesai Shift
                </button>

                <p className="text-xs text-brown">
                    {isOvertime ? 'Lembur' : 'Sisa waktu shift'}
                </p>
                <p
                    className={`font-mono text-4xl font-bold ${isOvertime ? 'text-red-600' : 'text-navy'}`}>
                    {isOvertime ? '+' : ''}{formatDuration(remaining)}
                </p>
                <p className="mt-1 text-xs text-brown">
                    Modal awal {formatRupiah(shift.starting_cash)} · Masuk{' '}
                    {formatRupiah(shift.total_cash_in)} · Keluar{' '}
                    {formatRupiah(shift.total_cash_out)}
                </p>
            </div>

            {error && (
                <p className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-800">
                {error}
                </p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CashForm
                    flowType="cash_in"
                    title="Kas Masuk"
                    onSubmit={onSubmitCashflow}
                    submitting={submitting}
                />
                <CashForm
                    flowType="cash_out"
                    title="Kas Keluar"
                    onSubmit={onSubmitCashflow}
                    submitting={submitting}/>
            </div>
        </div>
    );
}
