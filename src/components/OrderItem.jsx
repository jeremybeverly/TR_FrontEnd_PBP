import { useState } from 'react';
import MaskIcon from './MaskIcon';
import { formatRupiah } from '../utils/format';

const NOTE_ICON = 'masukkan url gambar kesini';
const CASH_ICON = '.public/cashier/cash.svg';

export default function OrderItem({ item, onQtyChange, onNoteChange, onRemove }) {

    const modifierText = item.modifiers.map((m) => m.modifier_name).join(', ');

    const handleDecrease = () => {
        if (item.quantity <= 1) {
            onRemove(item.cart_id);
        } else {
            onQtyChange(item.cart_id, item.quantity - 1);
        }
    };

    return (
        <div className="border-b border-beige py-4">
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-navy">{item.product_name}</h4>
                <span className="shrink-0 text-sm font-bold text-navy">
                {formatRupiah(item.unit_price)}
                </span>
            </div>

            {modifierText && (
                <p className="mt-0.5 text-xs text-brown">{modifierText}</p>
            )}

            <div className="mt-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setShowNote((s) => !s)}
                    className="flex items-center gap-1 text-xs text-brown underline">
                    <MaskIcon src={NOTE_ICON} className="h-3 w-3" />
                    Note
                </button>

                <div className="flex items-center gap-3 rounded-lg border border-beige bg-white px-2 py-1">
                    <button
                        type="button"
                        onClick={handleDecrease}
                        aria-label="Kurangi"
                        className="px-1 text-base font-bold text-navy">−</button>
                    <span className="w-5 text-center text-sm font-bold text-navy">
                        {item.quantity}
                    </span>
                    <button
                        type="button"
                        onClick={() => onQtyChange(item.cart_id, item.quantity + 1)}
                        aria-label="Tambah"
                        className="px-1 text-base font-bold text-navy">+</button>
                </div>
            </div>
        </div>
    );
}
