import { useEffect, useState } from 'react';
import StartShift from '../../components/StartShift';
import { 
    getActiveShift, 
    startShift, 
    endShift,
    createCashflow,
    getCashflow,
    getMyTransactions,
    getErrorMessage,
} from '../../services/cashier';
import { getUser } from '../../services/auth';
import { formatRupiah } from '../../utils/format';
import DuringShiftHeader from '../../components/DuringShiftHeader';
import CashflowHistory from '../../components/CashflowHistory';
import ShiftTransactions from '../../components/ShiftTransactionHistory';
import EndShift from '../../components/EndShift';
import ShiftResult from '../../components/ShiftResult';

export default function CashierShift() {
    const [shift, setShift] = useState(null);
    const [loadingShift, setLoadingShift] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [cashflows, setCashflows] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [cashflowError, setCashflowError] = useState('');
    
    const [isEnding, setIsEnding] = useState(false);
    const [closedShift, setClosedShift] = useState(null);

    const loadLists = async (activeShift, {silent=false} = {}) => {
        if (!activeShift) return;
        if (!silent) setLoadingLists(true);
        try {
            const [flows, trx] = await Promise.all([
                getCashflow(),
                getMyTransactions(),
        ]);
            setCashflows(flows);
            setTransactions(
                trx.filter((t) => t.shift_id === activeShift._id)
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            if (!silent) setLoadingLists(false);
        }
    };

    const cashierName = getUser()?.name ?? '-';

    const handleStart = async (startingCash) => {
        setSubmitting(true);
        setError('');
        try {
            const data = await startShift(startingCash);
            setShift(data);
            await loadLists(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitCashflow = async (payload) => {
        setSubmitting(true);
        setCashflowError('');
        try {
            await createCashflow(payload);
            const freshShift = await getActiveShift();   
            setShift(freshShift);
            await loadLists(freshShift);
            return true;
        } catch (err) {
            setCashflowError(getErrorMessage(err));
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleEnd = async (actualCash) => {
        setSubmitting(true);
        setError('');
        try {
            const data = await endShift(actualCash);
            setClosedShift(data);      
            setShift(null);
            setIsEnding(false);
            setCashflows([]);
            setTransactions([]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = () => setClosedShift(null);

    const hasPending = transactions.some((t) => t.status === 'pending');

    useEffect(() => {
        if (!shift || !hasPending) return;

        const timer = setInterval(() => {
            loadLists(shift, { silent: true });
        }, 5000);

        return () => clearInterval(timer);
    }, [shift, hasPending]);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoadingShift(true);
            setError('');
            try {
                const data = await getActiveShift();
                if (ignore) return;

                setShift(data);
                if (data) await loadLists(data);
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoadingShift(false);
            }
        };

        load();
        return () => { ignore = true; };
    }, []);

    if (loadingShift) {
        return <p className="p-6 text-brown">Memuat status shift…</p>;
    }

    if(closedShift) {
        return <ShiftResult shift={closedShift} onFinish={handleFinish}/>
    }

    if (!shift) {
        return (
        <StartShift
            cashierName={cashierName}
            onStart={handleStart}
            loading={submitting}
            error={error}/>
        );
    }

    if (isEnding) {
        return (
            <EndShift
            cashierName={cashierName}
                onEnd={handleEnd}
                onBack={() => setIsEnding(false)}
                loading={submitting}
                error={error}/>
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 p-6">
            <DuringShiftHeader
                shift={shift}
                onSubmitCashflow={handleSubmitCashflow}
                onEndShift={() => setIsEnding(true)}
                submitting={submitting}
                error={cashflowError}/>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
                <CashflowHistory
                entries={cashflows}
                loading={loadingLists}
                error={error}/>
                
                <ShiftTransactions
                transactions={transactions}
                loading={loadingLists}
                error={error}/>
            </div>
        </div>
    );

    

}
