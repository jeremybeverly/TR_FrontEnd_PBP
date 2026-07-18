import React, { useEffect, useMemo, useState } from 'react';
import { api, resolveImageUrl } from '../../services/api';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { getIngredients, getModifierGroups } from '../../services/admin';

const HEX_BLUE = '#102C57';

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [];
}


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

  // Options (master data)
  const [ingredientsOptions, setIngredientsOptions] = useState([]);
  const [modifierGroupOptions, setModifierGroupOptions] = useState([]);

  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);

  const recipeMap = useMemo(() => {
    const map = new Map();
    for (const item of normalizeArray(form.recipe)) {
      if (!item) continue;
      const ingredientId = item.ingredient_id || item.ingredientId || item.id;
      if (!ingredientId) continue;
      const quantity = typeof item.quantity_required === 'number' ? item.quantity_required : Number(item.quantity_required ?? 0);
      map.set(String(ingredientId), {
        ingredient_id: String(ingredientId),
        quantity_required: Number.isFinite(quantity) ? quantity : 0,
      });
    }
    return map;
  }, [form.recipe]);

  const selectedModifierGroupsSet = useMemo(() => {
    const set = new Set();
    for (const id of normalizeArray(form.modifier_groups)) {
      if (id == null) continue;
      set.add(String(id));
    }
    return set;
  }, [form.modifier_groups]);


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

  useEffect(() => {
    let ignore = false;
    if (!modalOpen) return;

    const loadOptions = async () => {
      setOptionsLoading(true);
      setOptionsError(null);
      try {
        const [ingRes, modGroupRes] = await Promise.all([
          getIngredients(),
          getModifierGroups(),
        ]);

        const ingPayload = ingRes?.data ?? ingRes ?? [];
        const modGroupPayload = modGroupRes?.data ?? modGroupRes ?? [];

        if (ignore) return;
        setIngredientsOptions(Array.isArray(ingPayload) ? ingPayload : []);
        setModifierGroupOptions(Array.isArray(modGroupPayload) ? modGroupPayload : []);
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
      alert(err?.message || 'Gagal menyimpan produk');
    }
    setLoading(false);
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
                  <th className="py-2">Gambar</th>
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
                    <td className="py-3">
                      {r.image_url ? (
                        <img
                          src={resolveImageUrl(r.image_url)}
                          alt={r.product_name}
                          className="h-12 w-12 rounded-md object-cover"
                          onError={(event) => {
                            event.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-500">
                          No image
                        </div>
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

          <FormField label="Recipe (bahan + quantity)">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Pilih banyak ingredient, lalu atur quantity_required untuk tiap ingredient.</div>

              {optionsLoading ? (
                <div className="text-sm text-gray-500">Memuat list bahan...</div>
              ) : optionsError ? (
                <div className="text-sm text-rose-700">Gagal memuat bahan: {optionsError}</div>
              ) : (
                <select
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                  style={{ borderColor: '#E5E7EB' }}
                  value=""
                  onChange={(e) => {
                    const ingredientId = e.target.value;
                    if (!ingredientId) return;

                    setForm((p) => {
                      const nextRecipe = normalizeArray(p.recipe).slice();
                      const existing = nextRecipe.find((x) => String(x?.ingredient_id ?? x?.ingredientId ?? x?.id) === String(ingredientId));
                      if (existing) return p;
                      nextRecipe.push({ ingredient_id: String(ingredientId), quantity_required: 1 });
                      return { ...p, recipe: nextRecipe };
                    });

                    // reset select (value controlled)
                    e.target.value = '';
                  }}
                >
                  <option value="">+ Tambah ingredient ke recipe</option>
                  {ingredientsOptions.map((ing) => {
                    const id = String(ing._id ?? ing.id);
                    const alreadySelected = recipeMap.has(id);
                    return (
                      <option key={id} value={id} disabled={alreadySelected}>
                        {ing.ingredient_name ?? ing.name ?? ing.label ?? id}
                        {alreadySelected ? ' (sudah dipilih)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}

              {Array.from(recipeMap.values()).length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada ingredient dipilih.</div>
              ) : (
                <div className="space-y-2">
                  {Array.from(recipeMap.values()).map((item) => {
                    const selectedIngredient = ingredientsOptions.find(
                      (x) => String(x._id ?? x.id) === String(item.ingredient_id)
                    );
                    const displayName =
                      selectedIngredient?.ingredient_name ?? selectedIngredient?.name ?? selectedIngredient?.label ?? item.ingredient_id;

                    return (
                      <div key={item.ingredient_id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{displayName}</div>
                        </div>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-28 px-3 py-2 text-sm border rounded-lg"
                          style={{ borderColor: '#E5E7EB' }}
                          value={item.quantity_required}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            setForm((p) => {
                              const nextRecipe = normalizeArray(p.recipe).map((x) => {
                                const ingredientId = String(x?.ingredient_id ?? x?.ingredientId ?? x?.id);
                                if (ingredientId !== String(item.ingredient_id)) return x;
                                return { ...x, ingredient_id: String(item.ingredient_id), quantity_required: Number.isFinite(qty) ? qty : 0 };
                              });
                              return { ...p, recipe: nextRecipe };
                            });
                          }}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 rounded-lg border text-sm"
                          style={{ borderColor: '#E5E7EB', color: '#B91C1C' }}
                          onClick={() => {
                            setForm((p) => {
                              const nextRecipe = normalizeArray(p.recipe).filter((x) => {
                                const ingredientId = String(x?.ingredient_id ?? x?.ingredientId ?? x?.id);
                                return ingredientId !== String(item.ingredient_id);
                              });
                              return { ...p, recipe: nextRecipe };
                            });
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Modifier Groups (pilih banyak)">
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Pilih lebih dari 1 grup modifier.</div>

              {optionsLoading ? (
                <div className="text-sm text-gray-500">Memuat list modifier group...</div>
              ) : optionsError ? (
                <div className="text-sm text-rose-700">Gagal memuat modifier group: {optionsError}</div>
              ) : (
                <select
                  className="w-full px-3 py-2 text-sm border rounded-lg"
                  style={{ borderColor: '#E5E7EB' }}
                  value=""
                  onChange={(e) => {
                    const groupId = e.target.value;
                    if (!groupId) return;

                    setForm((p) => {
                      const current = normalizeArray(p.modifier_groups).map((x) => String(x));
                      if (current.includes(String(groupId))) return p;
                      return { ...p, modifier_groups: [...current, String(groupId)] };
                    });

                    e.target.value = '';
                  }}
                >
                  <option value="">+ Tambah modifier group</option>
                  {modifierGroupOptions.map((g) => {
                    const id = String(g._id ?? g.id);
                    const alreadySelected = selectedModifierGroupsSet.has(id);
                    return (
                      <option key={id} value={id} disabled={alreadySelected}>
                        {g.modifier_group_name ?? g.name ?? g.label ?? id}
                        {alreadySelected ? ' (sudah dipilih)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}

              {selectedModifierGroupsSet.size === 0 ? (
                <div className="text-sm text-gray-500">Belum ada modifier group dipilih.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedModifierGroupsSet).map((id) => {
                    const g = modifierGroupOptions.find((x) => String(x._id ?? x.id) === String(id));
                    const label = g?.modifier_group_name ?? g?.name ?? g?.label ?? id;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                        style={{ borderColor: '#E5E7EB', color: HEX_BLUE, background: '#F8FAFC' }}
                      >
                        {label}
                        <button
                          type="button"
                          className="text-[10px] px-1 rounded hover:bg-gray-100"
                          style={{ color: '#B91C1C' }}
                          onClick={() => {
                            setForm((p) => {
                              const next = normalizeArray(p.modifier_groups).map((x) => String(x)).filter((x) => x !== String(id));
                              return { ...p, modifier_groups: next };
                            });
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>

          <div className="text-xs text-gray-600">
            Format recipe harus sesuai backend Product schema: <div className="mt-1">recipe = [{"{\"ingredient_id\":\"ObjectId\",\"quantity_required\":1}"}]</div>
            <div>modifier_groups = ["ObjectId1","ObjectId2"]</div>
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

