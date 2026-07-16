import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';

const HEX_BLUE = '#102C57';

export default function CatalogAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    product_name: '',
    category: 'coffee',
    price: 0,
    recipe: [],
    modifier_groups: [],
    is_available: true,
    image: null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const q = params.toString();
      const res = await api.get(`/api/products${q ? `?${q}` : ''}`);
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      product_name: '',
      category: 'coffee',
      price: 0,
      recipe: [],
      modifier_groups: [],
      is_available: true,
      image: null,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      product_name: row.product_name || '',
      category: row.category || 'coffee',
      price: row.price || 0,
      recipe: row.recipe || [],
      modifier_groups: row.modifier_groups || [],
      is_available: row.is_available ?? true,
      image: null,
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('product_name', form.product_name);
      fd.append('category', form.category);
      fd.append('price', String(form.price));
      fd.append('is_available', String(!!form.is_available));
      fd.append('recipe', JSON.stringify(form.recipe || []));
      fd.append('modifier_groups', JSON.stringify(form.modifier_groups || []));
      if (form.image) {
        fd.append('image', form.image);
      }

      if (editingId) {
        // update uses PUT /api/products/:id
        await api.put(`/api/products/${editingId}`, fd, { tokenRequired: true });
      } else {
        await api.post('/api/products', fd, { tokenRequired: true });
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus produk ini? (soft delete)')) return;
    setLoading(true);
    try {
      await api.del(`/api/products/${id}`);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Katalog Produk (Admin)"
      subtitle="CRUD Produk (produk card, toggle available, recipe/modifier groups diisi manual bila perlu)"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Produk
        </button>
      }
    >
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
            Total: {rows.length}
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Tidak ada data.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Produk</th>
                  <th className="py-2">Kategori</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.product_name}</td>
                    <td className="py-3">{r.category}</td>
                    <td className="py-3">{typeof r.price === 'number' ? r.price.toLocaleString('id-ID') : r.price}</td>
                    <td className="py-3">
                      {r.available ? (
                        <span className="text-emerald-700 font-semibold text-xs">Tersedia</span>
                      ) : (
                        <span className="text-rose-700 font-semibold text-xs">
                          {!r.in_stock ? 'Stok Bahan Habis' : 'Nonaktif'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-xs"
                          style={{ borderColor: '#E5E7EB', color: HEX_BLUE }}
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg border hover:bg-rose-50 text-xs"
                          style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                          onClick={() => onDelete(r._id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Produk' : 'Tambah Produk'}
        onClose={() => setModalOpen(false)}
        footer={null}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama Produk">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.product_name}
                onChange={(e) => setForm((p) => ({ ...p, product_name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Kategori">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="coffee">coffee</option>
                <option value="non-coffee">non-coffee</option>
                <option value="pastry">pastry</option>
                <option value="others">others</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Harga (base)">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.price}
                min={0}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                required
              />
            </FormField>
            <FormField label="Tersedia (toggle)">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={String(!!form.is_available)}
                onChange={(e) => setForm((p) => ({ ...p, is_available: e.target.value === 'true' }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>
          </div>

          <FormField label="Upload image (opsional)">
            <input
              type="file"
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] || null }))}
            />
          </FormField>

          <FormField label="Recipe JSON">
            <textarea
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB', minHeight: 110, fontFamily: 'monospace' }}
              value={JSON.stringify(form.recipe || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setForm((p) => ({ ...p, recipe: parsed }));
                } catch {
                  // ignore parse error; user will see textarea content
                  setForm((p) => ({ ...p, recipe: p.recipe }));
                }
              }}
            />
          </FormField>

          <FormField label="Modifier Groups JSON (array of ObjectId) ">
            <textarea
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB', minHeight: 90, fontFamily: 'monospace' }}
              value={JSON.stringify(form.modifier_groups || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setForm((p) => ({ ...p, modifier_groups: parsed }));
                } catch {
                  setForm((p) => ({ ...p, modifier_groups: p.modifier_groups }));
                }
              }}
            />
          </FormField>

          <div className="text-xs text-gray-600">
            Format harus sesuai backend Product schema.
            <div className="mt-1">Contoh recipe: [{"{\"ingredient_id\":\"ObjectId\",\"quantity_required\":1}"}]</div>
            <div>Contoh modifier_groups: ["ObjectId1","ObjectId2"]</div>
          </div>


          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border"
              style={{ borderColor: '#E5E7EB' }}
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl text-white font-semibold" style={{ backgroundColor: HEX_BLUE }}>
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

