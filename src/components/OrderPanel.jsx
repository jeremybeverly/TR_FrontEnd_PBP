import OrderItem from './OrderItem';
import OrderSummary from './OrderSummary';
import PaymentAction from './PaymentAction';
import { calculateTotals } from '../utils/cart';

export default function OrderPanel({
    items,
    loading,
    onQtyChange,
    onRemove,
    onPayCash,
    canPrint,
    onGenerateQris,
    onPrintReceipt,
    onCancel,
}) {
    const { subtotal, tax, total } = calculateTotals(items);
    const isEmpty = items.length === 0;

    return (
        <aside className="flex w-80 shrink-0 flex-col border-l border-beige bg-beige/40">
        <h2 className="border-b border-beige px-5 py-4 text-lg font-bold text-navy">
            Daftar Pesanan
        </h2>

        <div className="flex-1 overflow-y-auto px-5">
            {isEmpty ? (
            <p className="py-10 text-center text-sm text-brown">
                Belum ada pesanan.
            </p>
            ) : (
            items.map((item) => (
                <OrderItem
                key={item.cart_id}
                item={item}
                onQtyChange={onQtyChange}
                onRemove={onRemove}/>
            ))
            )}
        </div>

        <div className="border-t border-beige bg-cream px-5 py-4">
            <OrderSummary subtotal={subtotal} tax={tax} total={total} />
            <PaymentAction
                total={total}
                disabled={isEmpty}
                loading={loading}
                onPayCash={onPayCash}
                onGenerateQris={onGenerateQris}
                canPrint={canPrint}
                onPrintReceipt={onPrintReceipt}
                onCancel={onCancel}/>
        </div>
        </aside>
    );
}
