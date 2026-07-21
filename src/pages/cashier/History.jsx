import { useEffect, useState } from 'react';
import TransactionFilter from '../../components/TransactionFilter';
import TransactionRow from '../../components/TransactionRow';
import VoidModal from '../../components/VoidModal';
import ReceiptModal from '../../components/ReceiptModal';
import {
  getMyTransactions,
  voidTransaction,
  getErrorMessage,
} from '../../services/cashier';

const mapVoidError = (message) => {
    if (message.includes('tidak termasuk shift')) {
        return 'Transaksi dari shift ini sudah habis/tidak ada';
    }
    if (message.includes('tidak memiliki shift yang aktif')) {
        return 'Buka shift dulu untuk membatalkan transaksi';
    }
    return message;
};

export default function CashierHistory() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState('');

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [receiptId, setReceiptId] = useState(null);
    const [voidTarget, setVoidTarget] = useState(null);
    const [voiding, setVoiding] = useState(false);
    const [voidError, setVoidError] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const loadTransactions = async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        setError('');
        try {
            const data = await getMyTransactions({
                invoice_number: debouncedSearch,
                status,
            });
            setTransactions(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getMyTransactions({
                invoice_number: debouncedSearch,
                status,
                });
                if (!ignore) setTransactions(data);
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        load();
        return () => { ignore = true; };
    }, [debouncedSearch, status]);

    const hasPending = transactions.some((t) => t.status === 'pending');

    useEffect(() => {
        if (!hasPending) return;
        const timer = setInterval(() => loadTransactions({ silent: true }), 5000);
        return () => clearInterval(timer);
    }, [hasPending, debouncedSearch, status]);

    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => setFeedback(''), 4000);
        return () => clearTimeout(timer);
    }, [feedback]);

    const handleVoid = async (reason) => {
        setVoiding(true);
        setVoidError('');
        try {
            await voidTransaction(voidTarget._id, reason);
            setVoidTarget(null);
            setFeedback('Transaksi berhasil dibatalkan.');
            await loadTransactions({ silent: true });
        } catch (err) {
            setVoidError(mapVoidError(getErrorMessage(err)));
        } finally {
            setVoiding(false);
        }
    };

    return (
        <div className="flex h-full flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold text-navy">Riwayat Transaksi</h1>

            {feedback && (
                <div className="rounded-lg bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
                {feedback}
                </div>
            )}

            <TransactionFilter
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                onRefresh={() => loadTransactions()}
                loading={loading}/>

            <div className="max-h-[80vh] min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {loading ? (
                    <p className="text-sm text-brown">Memuat transaksi…</p>
                    ) : error ? (
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                    ) : transactions.length === 0 ? (
                    <p className="py-10 text-center text-sm text-brown">
                        Tidak ada transaksi.
                    </p>
                    ) : (
                    transactions.map((trx) => (
                        <TransactionRow
                        key={trx._id}
                        transaction={trx}
                        onPrint={setReceiptId}
                        onVoid={setVoidTarget}/>
                    ))
                )}
            </div>

            {receiptId && (
                <ReceiptModal
                transactionId={receiptId}
                onClose={() => setReceiptId(null)}/>
            )}

            {voidTarget && (
                <VoidModal
                transaction={voidTarget}
                onClose={() => { setVoidTarget(null); setVoidError(''); }}
                onConfirm={handleVoid}
                loading={voiding}
                error={voidError}/>
            )}
        </div>
    );
}
