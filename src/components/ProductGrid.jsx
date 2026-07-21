import ProductCard from './ProductCard';

export default function ProductGrid({ products, addedIds, onSelect, loading, error }) {
    if (loading) return <p className="text-brown">Memuat produk…</p>;
    if (error)   return <p className="font-semibold text-red-600">{error}</p>;
    if (products.length === 0) return <p className="text-brown">Tidak ada produk pada kategori ini.</p>;

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
            <ProductCard
            key={p._id}
            product={p}
            isAdded={addedIds.includes(p._id)}
            onSelect={onSelect}/>
        ))}
        </div>
    );
}
