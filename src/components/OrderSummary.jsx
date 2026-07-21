import { formatRupiah } from '../utils/format';

export default function OrderSummary({ subtotal, tax, total }) {
    return (
        <div className="space-y-2">
        <div className="flex justify-between text-sm text-brown">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-brown">
            <span>Pajak (11%)</span>
            <span>{formatRupiah(tax)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-brown/40 pt-3">
            <span className="text-base font-bold text-navy">Total Akhir</span>
            <span className="text-lg font-bold text-navy">{formatRupiah(total)}</span>
        </div>
        </div>
    );
}
