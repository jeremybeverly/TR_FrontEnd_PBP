import { formatRupiah } from '../utils/format';
import { resolveImageUrl } from '../utils/productsImage';

export default function ProductCard({ product, isAdded, onSelect }) {
    const isAvailable = product.available !== false;
    const imageUrl = resolveImageUrl(product.image_url);

    return (
        <button
        type="button"
        disabled={!isAvailable}
        onClick={() => onSelect(product._id)}
        className={`relative flex h-32 w-full items-stretch gap-3 overflow-hidden rounded-xl border-2 bg-cream p-4 text-left transition
            ${isAdded ? 'border-navy' : 'border-beige'}
            ${isAvailable ? 'cursor-pointer hover:border-navy' : 'cursor-not-allowed opacity-50'}`}>
        {isAdded && (
            <span className="absolute right-0 top-0 rounded-bl-lg bg-navy px-2 py-1 text-[10px] font-bold text-white">
            Added
            </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-between">
            <h3 className="line-clamp-2 pr-8 text-base font-bold leading-snug text-navy">
            {product.product_name}
            </h3>
            <p className="text-sm font-bold text-navy">
            {isAvailable ? formatRupiah(product.price) : 'Stok Habis'}
            </p>
        </div>

        <div className="h-full w-20 shrink-0 self-center overflow-hidden rounded-lg bg-beige">
            {imageUrl ? (
            <img
                src={imageUrl}
                alt={product.product_name}
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder-image.svg'; }}/>
            ) : null}
        </div>
        </button>
    );
}
