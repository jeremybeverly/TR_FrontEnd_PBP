import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import {
  getModifiers,
  createModifier,
  updateModifier,
  deleteModifier,
  getIngredients,
  getModifierGroups,
} from '../../services/admin';

const HEX_BLUE = '#102C57';

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [];
}

function toId(value) {
  if (value && typeof value === 'object') return String(value._id ?? value.id ?? '');
  return String(value ?? '');
}

export default function ModifierAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    modifier_name: '',
    group_id: '',
    extra_price: 0,
    recipe: [],
    is_available: true,
  });

  const [ingredientsOptions, setIngredientsOptions] = useState([]);
  const [modifierGroupOptions, setModifierGroupOptions] = useState([]);

  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);

  const recipeMap = useMemo(() => {
    const map = new Map();
    for (const item of normalizeArray(form.recipe)) {
      if (!item) continue;
      const ingredientId = toId(item.ingredient_id);
      if (!ingredientId) continue;
      const quantity = Number(item.quantity_required ?? 0);
      map.set(ingredientId, {
        ingredient_id: ingredientId,
        quantity_required: Number.isFinite(quantity) ? quantity : 0,
      });
    }
    return map;
  }, [form.recipe]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (groupFilter) params.append('group_id', groupFilter);
      const q = params.toString();
      const res = await getModifiers(q);
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, groupFilter]);

  useEffect(() => {
    let ignore = false;

    const loadGroups = async () => {
      try {
        const res = await getModifierGroups();
        if (ignore) return;
        setModifierGroupOptions(normalizeArray(res?.data ?? res));
      } catch {
      }
    };

    loadGroups();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!modalOpen) return;

    const loadOptions = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      try {
        const [ingRes, groupRes] = await Promise.all([getIngredients(), getModifierGroups()]);

        if (ignore) return;
        setIngredientsOptions(normalizeArray(ingRes?.data ?? ingRes));
        setModifierGroupOptions(normalizeArray(groupRes?.data ?? groupRes));
      } catch (e) {
        if (ignore) return;
        setOptionsError(e?.message || 'Terjadi kesalahan');
      } finally {
        if (ignore) return;
        setOptionsLoading(false);
      }
    };

    loadOptions();
    return () => {
      ignore = true;
    };
  }, [modalOpen]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      modifier_name: '',
      group_id: '',
      extra_price: 0,
      recipe: [],
      is_available: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      modifier_name: row.modifier_name || '',
      group_id: toId(row.group_id),
      extra_price: row.extra_price || 0,
      recipe: normalizeArray(row.recipe).map((r) => ({
        ingredient_id: toId(r.ingredient_id),
        quantity_required: Number(r.quantity_required ?? 0),
      })),
      is_available: row.is_available ?? true,
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        modifier_name: form.modifier_name,
        group_id: form.group_id,
        extra_price: Number(form.extra_price) || 0,
        recipe: Array.from(recipeMap.values()),
      };

      if (editingId) {
        await updateModifier(editingId, { ...payload, is_available: !!form.is_available });
      } else {
        await createModifier(payload);
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err?.message || 'Gagal menyimpan modifier');
    }
    setLoading(false);
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus modifier ini? (soft delete)')) return;
    setLoading(true);
    try {
      await deleteModifier(id);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Modifier"
      rightActions={
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ backgroundColor: HEX_BLUE }}
        >
          + Tambah Modifier
        </button>
      }
    >
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari modifier..."
              className="w-full sm:w-64 pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            >
              <option value="">Semua grup</option>
              {modifierGroupOptions.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.group_name}
                </option>
              ))}
            </select>
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
                  <th className="py-2">Modifier</th>
                  <th className="py-2">Grup</th>
                  <th className="py-2">Harga Tambahan</th>
                  <th className="py-2">Resep</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.modifier_name}</td>
                    <td className="py-3">{r.group_id?.group_name ?? '-'}</td>
                    <td className="py-3">
                      {typeof r.extra_price === 'number'
                        ? r.extra_price.toLocaleString('id-ID')
                        : r.extra_price}
                    </td>
                    <td className="py-3">{normalizeArray(r.recipe).length} bahan</td>
                    <td className="py-3">
                      {r.is_available ? (
                        <span className="text-emerald-700 font-semibold text-xs">Tersedia</span>
                      ) : (
                        <span className="text-rose-700 font-semibold text-xs">Nonaktif</span>
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
        title={editingId ? 'Edit Modifier' : 'Tambah Modifier'}
        onClose={() => setModalOpen(false)}
        footer={null}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nama Modifier">
              <input
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.modifier_name}
                onChange={(e) => setForm((p) => ({ ...p, modifier_name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Modifier Group">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.group_id}
                onChange={(e) => setForm((p) => ({ ...p, group_id: e.target.value }))}
                required
              >
                <option value="">-- pilih grup --</option>
                {modifierGroupOptions.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.group_name} ({g.selection_type})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Harga Tambahan">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.extra_price}
                min={0}
                onChange={(e) => setForm((p) => ({ ...p, extra_price: Number(e.target.value) }))}
                required
              />
            </FormField>
            <FormField label="Tersedia (toggle)">
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={String(form.is_available)}
                onChange={(e) => setForm((p) => ({ ...p, is_available: e.target.value === 'true' }))}
                disabled={!editingId}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">Resep</div>
            <div className="text-xs text-gray-500 mb-2">
              Bahan yang dipotong saat opsi ini dipilih. Boleh dikosongkan.
            </div>

            {optionsError ? (
              <div className="text-xs text-rose-700 mb-2">{optionsError}</div>
            ) : null}

            <select
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value=""
              disabled={optionsLoading}
              onChange={(e) => {
                const ingredientId = e.target.value;
                if (!ingredientId) return;
                if (recipeMap.has(String(ingredientId))) return;

                setForm((p) => {
                  const nextRecipe = normalizeArray(p.recipe).slice();
                  nextRecipe.push({
                    ingredient_id: String(ingredientId),
                    quantity_required: 0,
                  });
                  return { ...p, recipe: nextRecipe };
                });
              }}
            >
              <option value="">
                {optionsLoading ? 'Memuat bahan baku...' : '+ Tambah bahan baku ke resep'}
              </option>
              {ingredientsOptions.map((ing) => (
                <option key={ing._id} value={ing._id} disabled={recipeMap.has(String(ing._id))}>
                  {ing.ingredient_name} ({ing.unit})
                </option>
              ))}
            </select>

            <div className="mt-3 space-y-2">
              {Array.from(recipeMap.values()).length === 0 ? (
                <div className="text-xs text-gray-500">Belum ada bahan baku.</div>
              ) : (
                Array.from(recipeMap.values()).map((item) => {
                  const ingredient = ingredientsOptions.find(
                    (x) => String(x._id) === String(item.ingredient_id)
                  );

                  return (
                    <div key={item.ingredient_id} className="flex items-center gap-2">
                      <div className="flex-1 text-sm">
                        {ingredient?.ingredient_name ?? item.ingredient_id}
                      </div>
                      <input
                        type="number"
                        min={0}
                        className="w-28 px-3 py-2 text-sm border rounded-lg"
                        style={{ borderColor: '#E5E7EB' }}
                        value={item.quantity_required}
                        onChange={(e) => {
                          const nextQty = Number(e.target.value);
                          setForm((p) => {
                            const nextRecipe = normalizeArray(p.recipe).map((x) => {
                              if (toId(x?.ingredient_id) !== String(item.ingredient_id)) return x;
                              return { ...x, quantity_required: nextQty };
                            });
                            return { ...p, recipe: nextRecipe };
                          });
                        }}
                      />
                      <div className="w-20 text-xs text-gray-500">{ingredient?.unit ?? ''}</div>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg border hover:bg-rose-50 text-xs"
                        style={{ borderColor: '#FCA5A5', color: '#B91C1C' }}
                        onClick={() => {
                          setForm((p) => {
                            const nextRecipe = normalizeArray(p.recipe).filter(
                              (x) => toId(x?.ingredient_id) !== String(item.ingredient_id)
                            );
                            return { ...p, recipe: nextRecipe };
                          });
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

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
