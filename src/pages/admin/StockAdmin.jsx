import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { getIngredients, getSuppliers, getStock, supplyIn, stockOut, stockOpname } from '../../services/admin.js';

const HEX_BLUE = '#102C57';

export default function StockAdmin() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [search, setSearch] = useState('');
  const filteredParams = useMemo(() => {
    // backend stock getStock supports ingredient_id + adjustment_type only (query strings)
    // We'll use `search` by filtering client-side on ingredient_name/sku.
    return '';
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('supply_in'); // supply_in | stock_opname | stock_out

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [ingredientsOptions, setIngredientsOptions] = useState([]);
  const [suppliersOptions, setSuppliersOptions] = useState([]);

  const [form, setForm] = useState({
    ingredient_id: '',
    ingredient_name: '',
    supplier_id: '',
    supplier_name: '',
    quantity: 0,
    total_price: 0,
    batch_number: '',
    counted_quantity: 0,
    adjustment_type: 'damaged',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStock(filteredParams || '');
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    const init = async () => {
      try {
        const [ingRes, supRes] = await Promise.all([getIngredients(), getSuppliers()]);
        if (!alive) return;
        const ingPayload = ingRes?.data ?? ingRes ?? [];
        const supPayload = supRes?.data ?? supRes ?? [];
        setIngredientsOptions(Array.isArray(ingPayload) ? ingPayload : []);
        setSuppliersOptions(Array.isArray(supPayload) ? supPayload : []);
      } catch (e) {
        console.error(e);
      }
      await load();
    };

    init();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const ing = r.ingredient_id;
      const name = ing?.ingredient_name || '';
      const sku = ing?.sku || '';
      const unit = ing?.unit || '';
      return [name, sku, unit].some((x) => String(x).toLowerCase().includes(q));
    });
  }, [rows, search]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredRows.length / pageSize));
  }, [filteredRows.length]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRows.slice(start, end);
  }, [filteredRows, page]);

  const openSupplyIn = () => {
    setMode('supply_in');
    setForm({
      ingredient_id: '',
      ingredient_name: '',
      supplier_id: '',
      supplier_name: '',
      quantity: 0,
      total_price: 0,
      batch_number: '',
      counted_quantity: 0,
      adjustment_type: 'damaged',
    });
    setModalOpen(true);
  };

  const openStockOut = (type) => {
    setMode('stock_out');
    setForm({
      ingredient_id: '',
      ingredient_name: '',
      supplier_id: '',
      supplier_name: '',
      quantity: 0,
      total_price: 0,
      batch_number: '',
      counted_quantity: 0,
      adjustment_type: type,
    });
    setModalOpen(true);
  };

  const openOpname = () => {
    setMode('stock_opname');
    setForm({
      ingredient_id: '',
      ingredient_name: '',
      supplier_id: '',
      supplier_name: '',
      quantity: 0,
      total_price: 0,
      batch_number: '',
      counted_quantity: 0,
      adjustment_type: 'damaged',
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'supply_in') {
        await supplyIn({
          ingredient_id: form.ingredient_id,
          supplier_id: form.supplier_id || null,
          quantity: Number(form.quantity),
          total_price: Number(form.total_price),
          batch_number: form.batch_number || undefined,
        });
      } else if (mode === 'stock_out') {
        await stockOut({
          ingredient_id: form.ingredient_id,
          quantity: Number(form.quantity),
          adjustment_type: form.adjustment_type,
        });
      } else if (mode === 'stock_opname') {
        await stockOpname({
          ingredient_id: form.ingredient_id,
          counted_quantity: Number(form.counted_quantity),
        });
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Manajemen Stock"
      rightActions={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openSupplyIn}
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm"
            style={{ backgroundColor: HEX_BLUE }}
          >
            + Supply In
          </button>
          <button
            type="button"
            onClick={openOpname}
            className="px-4 py-2 text-sm font-semibold rounded-xl shadow-sm text-white"
            style={{ backgroundColor: '#0B5' }}
          >
            + Opname
          </button>
        </div>
      }
    >
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ingredient (nama/kode/unit)..."
              className="w-full pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
          <div className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
            Total: {filteredRows.length}
          </div>
        </div>

        <div className="mt-4 mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openStockOut('damaged')}
            className="px-3 py-2 text-xs font-semibold rounded-lg"
            style={{ border: `1px solid #E5E7EB`, color: HEX_BLUE, backgroundColor: '#fff' }}
          >
            Stock Out (Rusak)
          </button>
          <button
            type="button"
            onClick={() => openStockOut('expired')}
            className="px-3 py-2 text-xs font-semibold rounded-lg"
            style={{ border: `1px solid #E5E7EB`, color: HEX_BLUE, backgroundColor: '#fff' }}
          >
            Stock Out (Kadaluwarsa)
          </button>
        </div>

        <div className="mt-2 overflow-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : filteredRows.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Tidak ada data.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Ingredient</th>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Δ Qty</th>
                  <th className="py-2">Cost/Unit</th>
                  <th className="py-2">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">
                      {r.ingredient_id?.ingredient_name || '-'}
                      <div className="text-xs text-gray-500">{r.ingredient_id?.sku || ''}</div>
                    </td>
                    <td className="py-3">{r.supplier_id?.supplier_name || '-'}</td>
                    <td className="py-3">{r.adjustment_type}</td>
                    <td className="py-3">
                      <span
                        className={
                          r.quantity_changed >= 0
                            ? 'text-emerald-700 font-semibold'
                            : 'text-rose-700 font-semibold'
                        }
                      >
                        {r.quantity_changed}
                      </span>
                    </td>
                    <td className="py-3">{r.cost_per_unit}</td>
                    <td className="py-3">{r.recorded_by?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRows.length > 0 && !loading ? (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs" style={{ color: HEX_BLUE }}>
              Page {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 text-xs font-semibold rounded-lg"
                style={{ border: `1px solid #E5E7EB`, backgroundColor: '#fff', color: HEX_BLUE }}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 text-xs font-semibold rounded-lg"
                style={{ border: `1px solid #E5E7EB`, backgroundColor: '#fff', color: HEX_BLUE }}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={modalOpen}
        title={
          mode === 'supply_in'
            ? 'Supply In'
            : mode === 'stock_opname'
              ? 'Stock Opname'
              : 'Stock Out'
        }
        onClose={() => setModalOpen(false)}
        footer={null}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Ingredient">
            <select
              className="w-full px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              value={form.ingredient_id}
              onChange={(e) => {
                const id = e.target.value;
                const ing = ingredientsOptions.find((x) => String(x._id ?? x.id) === String(id));
                setForm((p) => ({
                  ...p,
                  ingredient_id: id,
                  ingredient_name: ing?.ingredient_name ?? ing?.name ?? '',
                }));
              }}
              required
            >
              <option value="">-- pilih ingredient --</option>
              {ingredientsOptions.map((ing) => {
                const id = String(ing._id ?? ing.id);
                return (
                  <option key={id} value={id}>
                    {ing.ingredient_name} ({ing.unit})
                  </option>
                );
              })}
            </select>
          </FormField>

          {mode === 'supply_in' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Supplier (opsional)">
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB' }}
                    value={form.supplier_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const sup = suppliersOptions.find((x) => String(x._id ?? x.id) === String(id));
                      setForm((p) => ({
                        ...p,
                        supplier_id: id,
                        supplier_name: sup?.supplier_name ?? sup?.name ?? '',
                      }));
                    }}
                  >
                    <option value="">-- tanpa supplier --</option>
                    {suppliersOptions.map((sup) => {
                      const id = String(sup._id ?? sup.id);
                      return (
                        <option key={id} value={id}>
                          {sup.supplier_name}
                        </option>
                      );
                    })}
                  </select>
                </FormField>

                <FormField label="Batch Number">
                  <input
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB' }}
                    value={form.batch_number}
                    onChange={(e) => setForm((p) => ({ ...p, batch_number: e.target.value }))}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Quantity (+)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB' }}
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                    required
                    min={0}
                  />
                </FormField>
                <FormField label="Total Price">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB' }}
                    value={form.total_price}
                    onChange={(e) => setForm((p) => ({ ...p, total_price: e.target.value }))}
                    required
                    min={0}
                  />
                </FormField>
              </div>
            </>
          )}

          {mode === 'stock_opname' && (
            <FormField label="Counted Quantity">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
                value={form.counted_quantity}
                onChange={(e) => setForm((p) => ({ ...p, counted_quantity: e.target.value }))}
                required
                min={0}
              />
            </FormField>
          )}

          {mode === 'stock_out' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Adjustment Type">
                  <input
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                    value={form.adjustment_type}
                    readOnly
                  />
                </FormField>

                <FormField label="Quantity (-)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                    style={{ borderColor: '#E5E7EB' }}
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                    required
                    min={1}
                  />
                </FormField>
              </div>
            </>
          )}

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
              className="px-4 py-2 rounded-xl text-white font-semibold"
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

