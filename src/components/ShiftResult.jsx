import { useEffect, useState } from 'react';
import { formatRupiah } from '../utils/format';

const AUTO_BACK_MS = 5 * 60 * 1000; 

const formatCountdown = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
};

export default function ShiftResult({ shift, onFinish }) {
    const [deadline] = useState(() => Date.now() + AUTO_BACK_MS);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const remaining = deadline - now;

    useEffect(() => {
        if (remaining <= 0) onFinish();
    }, [remaining, onFinish]);

    const variance = shift.variance ?? 0;

    const tone =
        variance === 0
        ? { label: 'Seimbang', className: 'text-green-700', sign: '' }
        : variance > 0
            ? { label: 'Lebih', className: 'text-blue-700', sign: '+' }
            : { label: 'Kurang', className: 'text-red-600', sign: '−' };

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-beige bg-cream p-8 text-center">
                <h1 className="text-2xl font-bold text-navy">Shift Ditutup</h1>

                <div className="mt-6 rounded-xl bg-beige/60 px-4 py-4">
                    <p className="text-xs text-brown">Uang fisik dilaporkan</p>
                    <p className="text-lg font-bold text-navy">
                        {formatRupiah(shift.actual_cash)}
                    </p>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-brown">Selisih (variance)</p>
                    <p className={`font-mono text-4xl font-bold ${tone.className}`}>
                        {tone.sign}{formatRupiah(Math.abs(variance))}
                    </p>
                    <p className={`mt-1 text-sm font-bold ${tone.className}`}>{tone.label}</p>
                </div>

                <p className="mt-6 text-xs text-brown">
                Kembali ke layar mulai shift dalam {formatCountdown(remaining)}
                </p>

                <button
                    type="button"
                    onClick={onFinish}
                    className="mt-4 w-full rounded-lg bg-navy py-3 text-sm font-bold text-white">
                Selesai Sekarang</button>
            </div>
        </div>
    );
}
