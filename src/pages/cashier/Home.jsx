import { useEffect, useState } from 'react';
import CashierTopbar from '../../components/CashierTopbar';
import CategoryTabs from '../../components/CategoryTabs';
import ProductGrid from '../../components/ProductGrid';
import ModifierModal from '../../components/ModifierModal';
import OrderPanel from '../../components/OrderPanel';
import QrisModal from '../../components/QrisModal';
import {
    getProducts,
    createTransaction,
    getErrorMessage,
    getTransactionErrorMessage,
} from '../../services/cashier';
import ReceiptModal from '../../components/ReceiptModal';

export default function CashierHome() {
    const [category, setCategory] = useState('coffee');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [cart, setCart] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);          
    const [qrisTransaction, setQrisTransaction] = useState(null);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [receiptId, setReceiptId] = useState(null);

    const handleAddToCard = (item) => {
        setCart((prev) => [...prev, item]);
        setSelectedProductId(null);
    };

    const handleQtyChange = (cartId, nextQty) => {
    setCart((prev) =>
        prev.map((item) =>
            item.cart_id === cartId ? { ...item, quantity: nextQty } : item)
        );
    };

    const handleRemove = (cartId) => {
        setCart((prev) => prev.filter((item) => item.cart_id !== cartId));
    };

    const handleCancel = () => setCart([]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getProducts({ category, search: debouncedSearch });
                if (!ignore) setProducts(data);
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, [category, debouncedSearch]);

    const addedIds = cart.map((item) => item.product_id);

    const buildItems = () =>
        cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            modifiers: item.modifiers.map((m) => m.modifier_id),
        }));

    const handlePayCash = async () => {
        setSubmitting(true);
        setFeedback(null);
        try {
        const data = await createTransaction({
            items: buildItems(),
            payment_method: 'cash',
        });

        setLastTransaction(data);
        setCart([]);
        setFeedback({
            type: 'success',
            message: `Transaksi ${data.transaction.invoice_number} berhasil.`,  
        });
        } catch (err) {
            setFeedback({ type: 'error', message: getTransactionErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateQris = async () => {
        setSubmitting(true);
        setFeedback(null);
        try {
            const data = await createTransaction({
                items: buildItems(),
                payment_method: 'qris',
            });
            setLastTransaction(data);
            setQrisTransaction(data.transaction);   
        } catch (err) {
            setFeedback({ type: 'error', message: getTransactionErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleQrisPaid = () => {
        setCart([]);
        setFeedback({ type: 'success', message: 'Pembayaran QRIS diterima.' });
    };


    return (
        <div className="flex h-screen">
            <section className="flex-1 space-y-5 overflow-y-auto p-6">
                {feedback && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                            feedback.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                        {feedback.message}
                    </div>
                )}
                <CashierTopbar 
                    search={search} onSearchChange={setSearch}/>
                <CategoryTabs active={category} onChange={setCategory} />
                <ProductGrid
                    products={products}
                    addedIds={addedIds}
                    onSelect={setSelectedProductId}
                    loading={loading}
                    error={error}/>
            </section>

            {selectedProductId && (
                <ModifierModal
                    productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                    onConfirm={handleAddToCard}/>
            )}

            <OrderPanel
                items={cart}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
                onPayCash={handlePayCash}
                onGenerateQris={handleGenerateQris}
                onPrintReceipt={() => setReceiptId(lastTransaction?.transaction?._id)}
                canPrint={Boolean(lastTransaction)}
                onCancel={handleCancel}
                loading={submitting}/>

            {qrisTransaction && (
                <QrisModal
                    transaction={qrisTransaction}
                    onPaid={handleQrisPaid}
                    onClose={() => setQrisTransaction(null)}/>
            )}

            {receiptId && (
                <ReceiptModal
                    transactionId={receiptId}
                    onClose={() => setReceiptId(null)}/>
            )}
        </div>
    );
}
