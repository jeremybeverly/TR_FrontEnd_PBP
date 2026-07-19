import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/admin.js';

const HEX_BLUE = '#102C57';

export default function UsersAdmin() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    username: '',
    name: '',
    role: 'cashier',
    password: '',
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      // role dikirim apa adanya, backend sudah normalisasi ke lowercase
      if (role) params.append('role', role);
      const res = await getUsers(params.toString());
      setRows(res.data || []);


    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset page/state if needed in future
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);


  const openCreate = () => {
    setEditingId(null);
    setForm({ username: '', name: '', role: 'cashier', password: '', is_active: true });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      username: row.username || '',
      name: row.name || '',
      role: row.role || 'cashier',
      password: '',
      is_active: row.is_active ?? true,
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        username: form.username,
        name: form.name,
        role: form.role,
        is_active: form.is_active,
        password: form.password || undefined,
      };

      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onToggleActive = async (row) => {
    const nextActive = !row.is_active;
    const ok = confirm(nextActive ? 'Aktifkan user ini?' : 'Nonaktifkan user ini?');
    if (!ok) return;

    setLoading(true);
    try {
      // backend saat ini: `deleteUser` = nonaktifkan, jadi untuk aktivasi pakai updateUser
      if (!nextActive) {
        await deleteUser(row._id);
      } else {
        await updateUser(row._id, { is_active: true });
      }
      await load();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Manajemen Karyawan"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Karyawan
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
              placeholder="Cari nama/username..."
              className="w-full pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div className="relative w-full md:w-64">
            <select
              className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="admin">admin</option>
              <option value="cashier">cashier</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <div className="mb-2 text-xs" style={{ color: HEX_BLUE }}>
            Filter role: <span className="font-semibold">{role ? role : 'Semua'}</span> — menampilkan {rows.length} user
          </div>
          {loading ? (

            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Tidak ada data.</div>
          ) : (
            <table className="w-full text-sm">

              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Nama</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.name}</td>
                    <td className="py-3">{r.username}</td>
                    <td className="py-3">{r.role}</td>
                    <td className="py-3">{r.is_active ? 'active' : 'inactive'}</td>
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
                          className={
                            r.is_active
                              ? "px-3 py-1 rounded-lg border hover:bg-rose-50 text-xs"
                              : "px-3 py-1 rounded-lg border hover:bg-emerald-50 text-xs"
                          }
                          style={{
                            borderColor: r.is_active ? '#FCA5A5' : '#A7F3D0',
                            color: r.is_active ? '#B91C1C' : '#047857',
                          }}
                          onClick={() => onToggleActive(r)}
                        >
                          {r.is_active ? 'Nonaktif' : 'Aktif'}
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

      <Modal open={modalOpen} title={editingId ? 'Edit User' : 'Tambah User'} onClose={() => setModalOpen(false)} footer={null}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Username">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="admin">admin</option>
                <option value="cashier">cashier</option>
              </select>
            </FormField>
            <FormField label="Aktif">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={String(!!form.is_active)}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>
          </div>

          <FormField label="Password (wajib saat create) ">
            <input
              type="password"
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required={!editingId}
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

