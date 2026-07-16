import React, { useState, useEffect } from 'react';
import { api, resolveImageUrl } from '../services/api';

// Konstanta warna yang disamakan dengan Dashboard Anda
const HEX_BLUE = '#0F2C59'; // Ganti dengan HEX_BLUE asli Anda jika berbeda

export default function ProductCatalog() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['Semua', 'Makanan', 'Minuman', 'Cemilan']); // Sesuaikan kategori Anda
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch data sesuai controller getProducts backend Anda
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (selectedCategory !== 'Semua') {
                params.append('category', selectedCategory);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const query = params.toString();
            const response = await api.get(`/api/products${query ? `?${query}` : ''}`);
            const resData = response?.data ?? response;
            setProducts(Array.isArray(resData) ? resData : resData?.data || []);
        } catch (error) {
            console.error('Gagal mengambil data produk:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQuery]);

    // Fungsi pembantu format rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-gray-50/50">

            {/* Header Bagian */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: HEX_BLUE }}>
                        Katalog Produk
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola menu, ketersediaan stok bahan baku, dan harga secara real-time.
                    </p>
                </div>

                {/* Tombol Tambah Produk */}
                <button
                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: HEX_BLUE }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Produk baru
                </button>
            </div>

            {/* Filter & Bar Pencarian */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border" style={{ borderColor: '#E5E7EB' }}>
                {/* Kategori Tabs */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all`}
                            style={
                                selectedCategory === cat
                                    ? { backgroundColor: HEX_BLUE, color: '#white', backgroundImage: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))' }
                                    : { color: '#4B5563', border: '1px solid #E5E7EB' }
                            }
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Kolom Input Search */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:bg-white"
                        style={{ borderColor: '#E5E7EB', focusRingColor: HEX_BLUE }}
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid List Produk */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Memuat katalog produk...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg">Tidak ada produk ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-xl border overflow-hidden flex flex-col group hover:shadow-md transition-all relative"
                            style={{ borderColor: '#E5E7EB' }}
                        >
                            {/* Badge Status (Tergantung is_available & in_stock resep di Backend) */}
                            <div className="absolute top-3 right-3 z-10">
                                {product.available ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        Tersedia
                                    </span>
                                ) : !product.in_stock ? (
                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        Stok Bahan Habis
                                    </span>
                                ) : (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        Nonaktif
                                    </span>
                                )}
                            </div>

                            {/* Gambar Produk */}
                            <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                                {product.image_url || product.image || product.photo_url || product.image_path || product.imagePath || product.photo ? (
                                    <img
                                        src={resolveImageUrl(product.image_url || product.image || product.photo_url || product.image_path || product.imagePath || product.photo)}
                                        alt={product.product_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-gray-400 mt-2">Tidak ada foto</span>
                                    </div>
                                )}
                            </div>

                            {/* Konten Detil Produk */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                                        {product.category}
                                    </span>
                                    <h3 className="font-bold text-base mt-1 line-clamp-1" style={{ color: HEX_BLUE }}>
                                        {product.product_name}
                                    </h3>
                                    <p className="font-bold text-lg mt-2 text-slate-800">
                                        {formatRupiah(product.price)}
                                    </p>
                                </div>

                                {/* Indikator Bahan Baku & Modifier */}
                                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                                    {/* Info Resep */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Resep bahan:</span>
                                        <span className={`font-semibold ${product.in_stock ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {product.recipe?.length || 0} Bahan ({product.in_stock ? 'Cukup' : 'Kurang'})
                                        </span>
                                    </div>
                                    {/* Info Variasi/Modifier */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">Varian opsi:</span>
                                        <span className="font-semibold text-gray-600">
                                            {product.modifier_groups?.length || 0} Grup
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi di bagian bawah kartu */}
                            <div className="grid grid-cols-2 border-t text-xs font-semibold text-center" style={{ borderColor: '#E5E7EB' }}>
                                <button
                                    className="py-3 text-gray-600 hover:bg-gray-50 border-r transition-colors"
                                    style={{ borderColor: '#E5E7EB' }}
                                >
                                    Edit Menu
                                </button>
                                <button className="py-3 text-rose-600 hover:bg-rose-50 transition-colors">
                                    Hapus
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}