import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import { api } from '../../services/api';

const HEX_BLUE = '#102C57';

export default function TransactionsAdmin() {
  // WARNING: backend routes /api/transactions memakai authorize('cashier')
  // Jadi untuk admin UI, modul ini lebih aman ditampilkan read-only bila token admin tidak bisa mengakses.
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (invoiceNumber) params.append('invoice_number', invoiceNumber);
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    if (status) params.append('status', status);
    if (paymentMethod) params.append('payment_method', paymentMethod);
    return params.toString();
  }, [invoiceNumber, fromDate, toDate, status, paymentMethod]);


  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/transactions${queryParams ? `?${queryParams}` : ''}`, { tokenRequired: true });
      // backend: res.json({ data: transactions });
      setRows(res.data || res || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  return (
    <AdminLayout title="Laporan Transaksi (Admin)" subtitle="Riwayat transaksi & void">
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col gap-3 md:items-center md:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
                Invoice
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Filter invoice_number..."
                className="w-full pl-4 pr-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>

            <div className="relative">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="">Semua</option>
                  <option value="success">success</option>
                  <option value="voided">voided</option>
                </select>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="">Payment: semua</option>
                  <option value="cash">cash</option>
                  <option value="qris">qris</option>
                </select>
              </div>
            </div>
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
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Payment</th>
                  <th className="py-2">Subtotal</th>
                  <th className="py-2">Tax</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{r.invoice_number}</td>
                    <td className="py-3">{r.payment_method}</td>
                    <td className="py-3">{r.subtotal}</td>
                    <td className="py-3">{r.tax_amount}</td>
                    <td className="py-3">{r.total_amount}</td>
                    <td className="py-3">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600">
          Catatan: endpoint void hanya diizinkan untuk role cashier.
        </div>
      </div>
    </AdminLayout>
  );
}

