import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { api } from '../../services/api.js';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../services/admin.js';

const HEX_BLUE = '#102C57';

export default function IngredientsAdmin() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    ingredient_name: '',
    sku: '',
    unit: 'gr',
    current_stock: 0,
    minimum_stock: 0,
    last_cost_per_unit: 0,
  });

  const title = 'Bahan Baku (Ingredients)';

  const filteredParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    return params.toString();
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getIngredients(filteredParams ? `?${filteredParams}` : '');
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
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
      ingredient_name: '',
      sku: '',
      unit: 'gr',
      current_stock: 0,
      minimum_stock: 0,
      last_cost_per_unit: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      ingredient_name: row.ingredient_name || '',
      sku: row.sku || '',
      unit: row.unit || 'gr',
      current_stock: row.current_stock ?? 0,
      minimum_stock: row.minimum_stock ?? 0,
      last_cost_per_unit: row.last_cost_per_unit ?? 0,
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      current_stock: Number(form.current_stock),
      minimum_stock: Number(form.minimum_stock),
      last_cost_per_unit: Number(form.last_cost_per_unit),
    };

    setLoading(true);
    try {
      if (editingId) {
        await updateIngredient(editingId, payload);
      } else {
        await createIngredient(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus ingredient ini? (Soft delete)')) return;
    setLoading(true);
    try {
      await deleteIngredient(id);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title={title}
      subtitle="CRUD ingredient sesuai backend (GET/POST/PUT/DELETE)"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Ingredient
        </button>
      }
    >
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ingredient / SKU..."
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
                  <th className="py-2">Nama</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Unit</th>
                  <th className="py-2">Stok</th>
                  <th className="py-2">Min</th>
                  <th className="py-2">Last Cost</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.ingredient_name}</td>
                    <td className="py-3">{r.sku}</td>
                    <td className="py-3">{r.unit}</td>
                    <td className="py-3">{r.current_stock}</td>
                    <td className="py-3">{r.minimum_stock}</td>
                    <td className="py-3">{r.last_cost_per_unit}</td>
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
        title={editingId ? 'Edit Ingredient' : 'Tambah Ingredient'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border"
              style={{ borderColor: '#E5E7EB' }}
            >
              Batal
            </button>
            <button
              type="submit"
              form="ingredient-form"
              className="px-4 py-2 rounded-xl text-white font-semibold"
              style={{ backgroundColor: HEX_BLUE }}
            >
              {editingId ? 'Simpan Perubahan' : 'Simpan' }
            </button>
          </div>
        }
      >
        <form id="ingredient-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama Ingredient">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.ingredient_name}
                onChange={(e) => setForm((p) => ({ ...p, ingredient_name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="SKU">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Unit">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              >
                <option value="gr">gr</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </FormField>
            <FormField label="Current Stock">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.current_stock}
                onChange={(e) => setForm((p) => ({ ...p, current_stock: e.target.value }))}
                required
                min={0}
              />
            </FormField>
            <FormField label="Minimum Stock">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.minimum_stock}
                onChange={(e) => setForm((p) => ({ ...p, minimum_stock: e.target.value }))}
                required
                min={0}
              />
            </FormField>
          </div>

          <FormField label="Last Cost per Unit">
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value={form.last_cost_per_unit}
              onChange={(e) => setForm((p) => ({ ...p, last_cost_per_unit: e.target.value }))}
              required
              min={0}
            />
          </FormField>
        </form>
      </Modal>
    </AdminLayout>
  );
}

