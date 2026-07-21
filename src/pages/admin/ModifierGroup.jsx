import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import {
  getModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
} from '../../services/admin';

const HEX_BLUE = '#102C57';

export default function ModifierGroupAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    group_name: '',
    selection_type: 'single',
    is_required: false,
    max_select: 1,
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const q = params.toString();
      const res = await getModifierGroups(q);
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
      group_name: '',
      selection_type: 'single',
      is_required: false,
      max_select: 1,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      group_name: row.group_name || '',
      selection_type: row.selection_type || 'single',
      is_required: row.is_required ?? false,
      max_select: row.max_select ?? 1,
    });
    setModalOpen(true);
  };

  // Grup 'single' hanya boleh memilih 1 opsi
  const onChangeSelectionType = (value) => {
    setForm((p) => ({
      ...p,
      selection_type: value,
      max_select: value === 'single' ? 1 : Math.max(1, p.max_select),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        group_name: form.group_name,
        selection_type: form.selection_type,
        is_required: !!form.is_required,
        max_select: form.selection_type === 'single' ? 1 : Math.max(1, Number(form.max_select) || 1),
      };

      if (editingId) {
        await updateModifierGroup(editingId, payload);
      } else {
        await createModifierGroup(payload);
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err?.message || 'Gagal menyimpan modifier group');
    }
    setLoading(false);
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus modifier group ini? (soft delete)')) return;
    setLoading(true);
    try {
      await deleteModifierGroup(id);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Modifier Group"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Grup
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
              placeholder="Cari grup..."
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
                  <th className="py-2">Nama Grup</th>
                  <th className="py-2">Tipe Pilihan</th>
                  <th className="py-2">Wajib</th>
                  <th className="py-2">Maks Pilih</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.group_name}</td>
                    <td className="py-3">{r.selection_type}</td>
                    <td className="py-3">
                      {r.is_required ? (
                        <span className="text-emerald-700 font-semibold text-xs">Wajib</span>
                      ) : (
                        <span className="text-gray-500 text-xs">Opsional</span>
                      )}
                    </td>
                    <td className="py-3">{r.max_select}</td>
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
        title={editingId ? 'Edit Modifier Group' : 'Tambah Modifier Group'}
        onClose={() => setModalOpen(false)}
        footer={null}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Nama Grup">
            <input
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value={form.group_name}
              onChange={(e) => setForm((p) => ({ ...p, group_name: e.target.value }))}
              placeholder="cth. Ukuran, Level Gula, Tambahan"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tipe Pilihan">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.selection_type}
                onChange={(e) => onChangeSelectionType(e.target.value)}
              >
                <option value="single">single</option>
                <option value="multiple">multiple</option>
              </select>
            </FormField>

            <FormField label="Wajib Dipilih">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={String(form.is_required)}
                onChange={(e) => setForm((p) => ({ ...p, is_required: e.target.value === 'true' }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>
          </div>

          <FormField label="Maksimal Pilihan">
            <input
              type="number"
              className="w-full px-3 py-2 text-sm border rounded-lg disabled:bg-gray-100"
              style={{ borderColor: '#E5E7EB' }}
              value={form.max_select}
              min={1}
              disabled={form.selection_type === 'single'}
              onChange={(e) => setForm((p) => ({ ...p, max_select: Number(e.target.value) }))}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.selection_type === 'single'
                ? 'Tipe single selalu maksimal 1 pilihan.'
                : 'Jumlah opsi maksimal yang boleh dipilih pelanggan.'}
            </div>
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
              style={{ backgroundColor: HEX_BLUE }}
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
