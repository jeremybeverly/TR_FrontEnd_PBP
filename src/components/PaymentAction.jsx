import MaskIcon from './MaskIcon';
import { formatRupiah } from '../utils/format';

const CASH_ICON = '.public/cashier/cash.svg';

export default function PaymentAction({
    total,
    disabled,
    loading,
    onPayCash,
    onGenerateQris,
    canPrint,
    onPrintReceipt,
    onCancel,
}) {
    const isBlocked = disabled || loading;
    return (
    <div className="mt-4 space-y-3">
        <button
            type="button"
            onClick={onPayCash}
            disabled={isBlocked}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-3 text-sm font-bold text-white transition disabled:opacity-40">
            <MaskIcon src={CASH_ICON} colorClass="bg-white" className="h-4 w-4" />
            {loading ? 'Memproses…' : `Bayar ${formatRupiah(total)}`}
        </button>

        <div className="grid grid-cols-2 gap-3">
            <button
            type="button"
            onClick={onGenerateQris}
            disabled={isBlocked}
            className="rounded-lg border border-navy bg-white py-2.5 text-xs font-bold text-navy transition disabled:opacity-40">
            
            Generate QRIS
            </button>
            <button
            type="button"
            onClick={onPrintReceipt}
            disabled={!canPrint}
            className="rounded-lg border border-navy bg-white py-2.5 text-xs font-bold text-navy transition disabled:opacity-40">
            Cetak Struk
            </button>
        </div>

        <button
            type="button"
            onClick={onCancel}
            disabled={isBlocked}
            className="w-full py-1 text-sm font-bold text-red-600 transition disabled:opacity-40">
            Batalkan Pesanan
        </button>
        </div>
    );
}