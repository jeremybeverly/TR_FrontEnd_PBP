import { useEffect, useState } from 'react';
import { getProductCustomization, getErrorMessage } from '../services/cashier';
import { formatRupiah } from '../utils/format';
import { resolveImageUrl } from '../utils/productsImage';

export default function ModifierModal({ productId, onClose, onConfirm }) {
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState({});   
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getProductCustomization(productId);
            if (!ignore) setData(res);
        } catch (err) {
            if (!ignore) setError(getErrorMessage(err));
        } finally {
            if (!ignore) setLoading(false);
        }
        };

        load();
        return () => { ignore = true; };
    }, [productId]);

    const product = data?.product;
    const groups = data?.modifierGroups ?? [];

    const toggleModifier = (group, modifierId) => {
        setSelected((prev) => {
        const current = prev[group._id] ?? [];

        if (group.selection_type === 'single') {
            return { ...prev, [group._id]: [modifierId] };
        }

        if (current.includes(modifierId)) {
            return { ...prev, [group._id]: current.filter((id) => id !== modifierId) };
        }
        if (current.length >= (group.max_select || 1)) return prev;   

        return { ...prev, [group._id]: [...current, modifierId] };
        });
    };

    const chosen = groups.flatMap((g) =>
        (selected[g._id] ?? [])
        .map((id) => g.modifiers.find((m) => m._id === id))
        .filter(Boolean)
    );

    const extraPrice = chosen.reduce((sum, m) => sum + (m.extra_price || 0), 0);
    const unitPrice = (product?.price || 0) + extraPrice;

    const missingRequired = groups.filter(
        (g) => g.is_required && (selected[g._id]?.length ?? 0) === 0
    );

    const handleConfirm = () => {
        if (missingRequired.length > 0) return;

        onConfirm({
        cart_id: `${productId}-${Date.now()}`,
        product_id: productId,
        product_name: product.product_name,
        unit_price: unitPrice,
        quantity,
        modifiers: chosen.map((m) => ({
            modifier_id: m._id,
            modifier_name: m.modifier_name,
            extra_price: m.extra_price || 0,
        })),
        });
    };

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}>
        <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-cream p-5"
            onClick={(e) => e.stopPropagation()}>
            {loading && <p className="text-brown">Memuat…</p>}
            {error && <p className="font-semibold text-red-600">{error}</p>}

            {product && (
            <>
                <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-beige">
                    {resolveImageUrl(product.image_url) && (
                    <img
                        src={resolveImageUrl(product.image_url)}
                        alt={product.product_name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-image.svg'; }}/>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-navy">{product.product_name}</h2>
                    <p className="text-sm font-semibold text-brown">{formatRupiah(product.price)}</p>
                </div>
                </div>

                {groups.map((group) => (
                <div key={group._id} className="mt-5">
                    <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-bold text-navy">{group.group_name}</h3>
                    {group.is_required && (
                        <span className="text-[10px] font-bold text-red-600">WAJIB</span>
                    )}
                    {group.selection_type === 'multiple' && (
                        <span className="text-[10px] text-brown">maks {group.max_select}</span>
                    )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                    {group.modifiers.map((m) => {
                        const isChecked = (selected[group._id] ?? []).includes(m._id);

                        return (
                        <button
                            key={m._id}
                            type="button"
                            onClick={() => toggleModifier(group, m._id)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            isChecked
                                ? 'border-navy bg-navy text-white'
                                : 'border-beige bg-white text-navy hover:border-navy'
                            }`}>
                            {m.modifier_name}
                            {m.extra_price > 0 && ` +${formatRupiah(m.extra_price)}`}
                        </button>
                        );
                    })}
                    </div>
                </div>
                ))}

                <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-navy">Jumlah</span>
                <div className="flex items-center gap-3 rounded-lg border border-beige bg-white px-3 py-1">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 text-lg font-bold text-navy">−</button>
                    <span className="w-6 text-center font-bold text-navy">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 text-lg font-bold text-navy">+</button>
                </div>
                </div>

                {missingRequired.length > 0 && (
                <p className="mt-4 text-xs font-semibold text-red-600">
                    Pilih dulu: {missingRequired.map((g) => g.group_name).join(', ')}
                </p>
                )}

                <div className="mt-5 flex gap-3">
                <button type="button" onClick={onClose}
                    className="flex-1 rounded-lg border border-navy py-3 text-sm font-bold text-navy">
                    Batal
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={missingRequired.length > 0}
                    className="flex-2 rounded-lg bg-navy py-3 text-sm font-bold text-white disabled:opacity-40">
                    Tambah • {formatRupiah(unitPrice * quantity)}
                </button>
                </div>
            </>
            )}
        </div>
        </div>
    );
}
