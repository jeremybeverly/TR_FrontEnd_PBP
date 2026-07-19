import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import {
  getAdminTransactionList,
  getSalesSummary,
  getTopSalesProducts,
  getSalesTrendReport,
} from '../../services/reportsAdmin.js';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const HEX_BLUE = '#102C57';

function formatIDR(value) {
  if (typeof value !== 'number') return value;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

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
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);

  const [reportsLoading, setReportsLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [trendGranularity, setTrendGranularity] = useState('day'); // day | week | month
  const [trendData, setTrendData] = useState([]); // [{time, revenue}]


  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, page, pageSize]);


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
      const qs = queryParams ? `?${queryParams}` : '';
      const res = await getAdminTransactionList(qs);
      setRows(res.data || res || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const qs = queryParams ? `?${queryParams}` : '';
      const [summaryRes, topRes, trendRes] = await Promise.all([
        getSalesSummary(qs),
        getTopSalesProducts(`${qs}${qs ? '&' : '?'}limit=3`),
        getSalesTrendReport(`${qs}${qs ? '&' : '?'}granularity=${trendGranularity}`),
      ]);

      setSalesSummary(summaryRes?.data || null);
      setTopProducts(topRes?.data || []);

      const rawTrend = trendRes?.data || [];
      const mappedTrend = Array.isArray(rawTrend)
        ? rawTrend.map((item) => ({
            time: typeof item._id === 'string' || typeof item._id === 'number' ? String(item._id) : (item._id?.toString?.() ?? ''),
            revenue: safeNumber(item.total_sales),
          }))
        : [];
      setTrendData(mappedTrend);
    } catch (err) {
      alert(err.message);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    // refresh transaction list
    load();

    // refresh reports (summary/top/trend)
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, trendGranularity]);




  return (
    <AdminLayout title="Laporan Transaksi">
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        {/* Filters */}
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


        {/* Sales Summary + Trend + Top Products */}
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {reportsLoading && !salesSummary ? (
              <div className="col-span-full py-6 text-center text-gray-500">Memuat ringkasan...</div>
            ) : (
              <>
                <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>Total Penjualan (Gross)</div>
                  <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>{formatIDR(safeNumber(salesSummary?.gross_revenue))}</div>
                </div>
                <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>Pendapatan Bersih (Net)</div>
                  <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>{formatIDR(safeNumber(salesSummary?.net_revenue))}</div>
                </div>
                <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>Total Pajak</div>
                  <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>{formatIDR(safeNumber(salesSummary?.tax_total))}</div>
                </div>
                <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                  <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>Total Transaksi</div>
                  <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>{safeNumber(salesSummary?.transaction_count)}</div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-bold" style={{ color: HEX_BLUE }}>Grafik Penjualan</h3>
                <div className="text-xs text-gray-500 mt-1">Harian / Mingguan / Bulanan</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTrendGranularity('day')}
                  className="px-3 py-2 text-sm border rounded-lg font-semibold"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: trendGranularity === 'day' ? HEX_BLUE : 'transparent',
                    color: trendGranularity === 'day' ? '#FFFFFF' : HEX_BLUE,
                  }}
                >
                  Harian
                </button>
                <button
                  type="button"
                  onClick={() => setTrendGranularity('week')}
                  className="px-3 py-2 text-sm border rounded-lg font-semibold"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: trendGranularity === 'week' ? HEX_BLUE : 'transparent',
                    color: trendGranularity === 'week' ? '#FFFFFF' : HEX_BLUE,
                  }}
                >
                  Mingguan
                </button>
                <button
                  type="button"
                  onClick={() => setTrendGranularity('month')}
                  className="px-3 py-2 text-sm border rounded-lg font-semibold"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: trendGranularity === 'month' ? HEX_BLUE : 'transparent',
                    color: trendGranularity === 'month' ? '#FFFFFF' : HEX_BLUE,
                  }}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div className="mt-4" style={{ height: 280 }}>
              {reportsLoading && trendData.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Memuat grafik...</div>
              ) : trendData.length === 0 ? (
                <div className="py-10 text-center text-gray-500">Tidak ada data grafik.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: HEX_BLUE, fontSize: 12 }}
                      axisLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                      tickLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                    />
                    <YAxis
                      tick={{ fill: HEX_BLUE, fontSize: 12 }}
                      axisLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                      tickLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                      tickFormatter={(v) => {
                        const n = Number(v);
                        if (!Number.isFinite(n)) return '';
                        if (n === 0) return '0';
                        return `${Math.round(n / 1_000_000)}M`;
                      }}
                    />
                    <Tooltip
                      formatter={(val) => formatIDR(safeNumber(val))}
                      labelStyle={{ color: HEX_BLUE, fontWeight: 700 }}
                      contentStyle={{
                        borderColor: HEX_BLUE,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderRadius: 12,
                        backgroundColor: 'white',
                      }}
                    />
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEX_BLUE} stopOpacity={0.55} />
                        <stop offset="95%" stopColor={HEX_BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={HEX_BLUE}
                      strokeWidth={2}
                      fill="url(#revenueFill)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h3 className="font-bold" style={{ color: HEX_BLUE }}>Produk Terlaris (3)</h3>
              </div>
            </div>

            <div className="mt-4 overflow-auto">
              {reportsLoading && topProducts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">Memuat top produk...</div>
              ) : topProducts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">Tidak ada data top produk.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="py-2">Produk</th>
                      <th className="py-2">Quantity</th>
                      <th className="py-2">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.slice(0, 3).map((p, idx) => (
                      <tr key={`${p.product_id || p._id || idx}-${idx}`} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                        <td className="py-3 font-semibold">{p.product_name || p.name || '-'}</td>
                        <td className="py-3">{p.total_quantity ?? 0}</td>
                        <td className="py-3">{formatIDR(safeNumber(p.total_sales))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Transaction list */}
        <div className="mt-6 overflow-auto">
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
                {pagedRows.map((r) => (
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

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
            Halaman {page} / {totalPages} (menampilkan {pagedRows.length} dari {rows.length})
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setPage(1); }}
              className="px-3 py-2 text-sm bg-gray-50 border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              disabled={page === 1}
            >
              First
            </button>
            <button
              type="button"
              onClick={() => { if (page > 1) setPage(page - 1); }}
              className="px-3 py-2 text-sm bg-gray-50 border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => { if (page < totalPages) setPage(page + 1); }}
              className="px-3 py-2 text-sm bg-gray-50 border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => { setPage(totalPages); }}
              className="px-3 py-2 text-sm bg-gray-50 border rounded-lg"
              style={{ borderColor: '#E5E7EB' }}
              disabled={page === totalPages}
            >
              Last
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Catatan: endpoint void hanya diizinkan untuk role cashier.
        </div>

      </div>
    </AdminLayout>
  );
}

