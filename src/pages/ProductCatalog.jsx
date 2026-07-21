import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react';

import { api, resolveImageUrl } from '../services/api';

const HEX_BLUE = '#0F2C59';
const PRODUCT_CATEGORIES = [
    { value: '', label: 'Semua' },
    { value: 'coffee', label: 'Kopi' },
    { value: 'non-coffee', label: 'Non-Kopi' },
    { value: 'pastry', label: 'Pastry' },
    { value: 'others', label: 'Lainnya' },
];

const categoryLabels = {
    coffee: 'Kopi',
    'non-coffee': 'Non-Kopi',
    pastry: 'Pastry',
    others: 'Lainnya',
};

function formatRupiah(value) {
    if (typeof value !== 'number') return value ?? '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function ProductCatalog() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);
            if (searchQuery) params.append('search', searchQuery);
            const query = params.toString();
            const response = await api.get(`/api/products${query ? `?${query}` : ''}`);
            const payload = response?.data ?? response;
            setProducts(Array.isArray(payload) ? payload : []);
        } catch (err) {
            console.error('Gagal mengambil produk:', err);
            setError(err?.message || 'Gagal terhubung ke server');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQuery]);

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6 bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: HEX_BLUE }}>
                        Katalog Produk
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {PRODUCT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                className={`px-4 py-2 text-sm font-medium rounded-2xl transition ${selectedCategory === cat.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                onClick={() => setSelectedCategory(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                            <Icon icon="mdi:magnify" className="h-5 w-5" />
                        </span>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                    </div>
                </div>
            </div>

            {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Memuat produk...</div>
            ) : products.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                    Tidak ada produk sesuai kriteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => {
                        const imageUrl = resolveImageUrl(product.image_url);
                        const statusLabel = product.available
                            ? 'Tersedia'
                            : product.in_stock === false
                                ? 'Stok Bahan Habis'
                                : product.is_available === false
                                    ? 'Nonaktif'
                                    : 'Sedang Dicek';
                        const statusClass = product.available
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : product.in_stock === false
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200';

                        return (
                            <article key={product._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="relative h-56 overflow-hidden bg-slate-100">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={product.product_name}
                                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                            onError={(event) => {
                                                event.currentTarget.src = '/placeholder-image.svg';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-slate-400">
                                            Tidak ada gambar
                                        </div>
                                    )}
                                    <span className={`absolute right-4 top-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                                        {statusLabel}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            {categoryLabels[product.category] ?? 'Lainnya'}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-500">
                                            {formatRupiah(product.price)}
                                        </p>
                                    </div>

                                    <h2 className="mt-4 text-xl font-semibold text-slate-900">{product.product_name}</h2>

                                    <div className="mt-5 space-y-3 text-sm text-slate-600">
                                        <p>
                                            <span className="font-semibold text-slate-900">Resep:</span> {product.recipe?.length ?? 0} bahan
                                        </p>
                                        <p>
                                            <span className="font-semibold text-slate-900">Varian/modifier:</span> {product.modifier_groups?.length ?? 0} grup
                                        </p>
                                    </div>

                                    <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                                        {product.is_available ? 'Menu dapat dipilih' : 'Menu dinonaktifkan'}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
