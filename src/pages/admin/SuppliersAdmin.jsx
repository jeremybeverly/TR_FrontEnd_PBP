import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/admin.js';

const HEX_BLUE = '#102C57';

export default function SuppliersAdmin() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await getSuppliers(params.toString() ? `?${params.toString()}` : '');
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
    setForm({ supplier_name: '', contact_person: '', phone: '', email: '', address: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      supplier_name: row.supplier_name || '',
      contact_person: row.contact_person || '',
      phone: row.phone || '',
      email: row.email || '',
      address: row.address || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateSupplier(editingId, form);
      } else {
        await createSupplier(form);
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
    if (!confirm('Hapus supplier ini?')) return;
    setLoading(true);
    try {
      await deleteSupplier(id);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const total = rows.length;

  return (
    <AdminLayout
      title="Suppliers (Admin)"
      subtitle="CRUD Supplier"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Supplier
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
              placeholder="Cari supplier (name/email)..."
              className="w-full pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
            Total: {total}
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
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Contact</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Email</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.supplier_name}</td>
                    <td className="py-3">{r.contact_person}</td>
                    <td className="py-3">{r.phone}</td>
                    <td className="py-3">{r.email}</td>
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

      <Modal open={modalOpen} title={editingId ? 'Edit Supplier' : 'Tambah Supplier'} onClose={() => setModalOpen(false)} footer={null}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Supplier Name">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.supplier_name}
                onChange={(e) => setForm((p) => ({ ...p, supplier_name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Contact Person">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.contact_person}
                onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Phone">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Email">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <FormField label="Address">
            <textarea
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB', minHeight: 90 }}
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              required
            />
          </FormField>

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

