import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import {
  getAdminTransactionList,
  getSalesSummary,
  getTopSalesProducts,
  getSalesTrendReport,
} from '../../services/reportsAdmin.js';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const exportToExcel = () => {
    const granularityLabel = trendGranularity === 'day' ? 'Harian' : trendGranularity === 'week' ? 'Mingguan' : 'Bulanan';

    // Sheet 1: Ringkasan Penjualan
    const summaryData = [
      { Metrik: 'Total Penjualan (Gross)', Nilai: safeNumber(salesSummary?.gross_revenue) },
      { Metrik: 'Pendapatan Bersih (Net)', Nilai: safeNumber(salesSummary?.net_revenue) },
      { Metrik: 'Total Pajak', Nilai: safeNumber(salesSummary?.tax_total) },
      { Metrik: 'Total Transaksi', Nilai: safeNumber(salesSummary?.transaction_count) },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    // Sheet 2: Produk Terlaris
    const topProductsData = topProducts.map((p) => ({
      Produk: p.product_name || p.name || '-',
      Quantity: p.total_quantity ?? 0,
      'Total Sales': safeNumber(p.total_sales),
    }));
    const topProductsSheet = XLSX.utils.json_to_sheet(topProductsData);

    // Sheet 3: Trend Penjualan
    const trendDataExport = trendData.map((t) => ({
      Periode: t.time,
      Pendapatan: safeNumber(t.revenue),
    }));
    const trendSheet = XLSX.utils.json_to_sheet(trendDataExport);

    // Sheet 4: Daftar Transaksi
    const transactionData = rows.map((r) => ({
      Invoice: r.invoice_number || '',
      Payment: r.payment_method || '',
      Subtotal: r.subtotal || 0,
      Tax: r.tax_amount || 0,
      Total: r.total_amount || 0,
      Status: r.status || '',
    }));
    const transactionSheet = XLSX.utils.json_to_sheet(transactionData);

    // Build workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan Penjualan');
    XLSX.utils.book_append_sheet(wb, topProductsSheet, 'Produk Terlaris');
    XLSX.utils.book_append_sheet(wb, trendSheet, `Trend Penjualan (${granularityLabel})`);
    XLSX.utils.book_append_sheet(wb, transactionSheet, 'Daftar Transaksi');

    // Generate filename with date range
    const dateStr = fromDate || toDate
      ? `_${fromDate || 'all'}_to_${toDate || 'all'}`
      : '';
    const filename = `Laporan_Transaksi${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
    setExportDropdownOpen(false);
  };

  const exportToPDF = () => {
    try {
      const granularityLabel = trendGranularity === 'day' ? 'Harian' : trendGranularity === 'week' ? 'Mingguan' : 'Bulanan';
      const dateRangeText = (fromDate || toDate)
        ? `Periode: ${fromDate || '...'} s/d ${toDate || '...'}`
        : 'Semua Periode';

      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // === HEADER ===
      doc.setFontSize(18);
      doc.setTextColor(16, 44, 87);
      doc.text('LAPORAN TRANSAKSI', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(dateRangeText, pageWidth / 2, 25, { align: 'center' });
      doc.text(`Trend: ${granularityLabel}`, pageWidth / 2, 30, { align: 'center' });

      // Divider line
      doc.setDrawColor(16, 44, 87);
      doc.setLineWidth(0.5);
      doc.line(14, 34, pageWidth - 14, 34);

      let yPos = 40;

      // Helper to safely format a number to IDR string for PDF
      const fmtIDR = (value) => {
        const n = safeNumber(value);
        if (n === 0) return 'Rp 0';
        return `Rp ${n.toLocaleString('id-ID')}`;
      };

      // === SECTION 1: RINGKASAN PENJUALAN ===
      doc.setFontSize(12);
      doc.setTextColor(16, 44, 87);
      doc.setFont(undefined, 'bold');
      doc.text('RINGKASAN PENJUALAN', 14, yPos);
      yPos += 6;

const summaryRows = [
        ['Total Penjualan (Gross)', fmtIDR(salesSummary?.gross_revenue)],
        ['Pendapatan Bersih (Net)', fmtIDR(salesSummary?.net_revenue)],
        ['Total Pajak', fmtIDR(salesSummary?.tax_total)],
        ['Total Transaksi', String(salesSummary?.transaction_count || 0)],
      ];
      autoTable(doc, {
        startY: yPos,
        head: [['Metrik', 'Nilai']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 44, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 2.5 },
      });
      yPos = doc.lastAutoTable.finalY + 10;

      // === SECTION 2: PRODUK TERLARIS ===
      if (topProducts.length > 0) {
        if (yPos > 170) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(16, 44, 87);
        doc.setFont(undefined, 'bold');
        doc.text('PRODUK TERLARIS (TOP 3)', 14, yPos);
        yPos += 6;

        const topRows = topProducts.slice(0, 3).map((p) => [
          p.product_name || p.name || '-',
          String(p.total_quantity ?? 0),
          fmtIDR(p.total_sales),
        ]);
        autoTable(doc, {
          startY: yPos,
          head: [['Produk', 'Quantity', 'Total Sales']],
          body: topRows,
          theme: 'grid',
          headStyles: { fillColor: [16, 44, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [243, 244, 246] },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 2.5 },
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // === SECTION 3: TREND PENJUALAN ===
      if (trendData.length > 0) {
        if (yPos > 170) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(16, 44, 87);
        doc.setFont(undefined, 'bold');
        doc.text(`TREND PENJUALAN (${granularityLabel})`, 14, yPos);
        yPos += 6;

        const trendRows = trendData.map((t) => [
          String(t.time),
          fmtIDR(t.revenue),
        ]);
        autoTable(doc, {
          startY: yPos,
          head: [['Periode', 'Pendapatan']],
          body: trendRows,
          theme: 'grid',
          headStyles: { fillColor: [16, 44, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [243, 244, 246] },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 2.5 },
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // === SECTION 4: DAFTAR TRANSAKSI ===
      if (rows.length > 0) {
        if (yPos > 170) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(16, 44, 87);
        doc.setFont(undefined, 'bold');
        doc.text('DAFTAR TRANSAKSI', 14, yPos);
        yPos += 6;

        const txnRows = rows.map((r) => [
          String(r.invoice_number || ''),
          String(r.payment_method || ''),
          String(r.subtotal || 0),
          String(r.tax_amount || 0),
          String(r.total_amount || 0),
          String(r.status || ''),
        ]);
        autoTable(doc, {
          startY: yPos,
          head: [['Invoice', 'Payment', 'Subtotal', 'Tax', 'Total', 'Status']],
          body: txnRows,
          theme: 'grid',
          headStyles: { fillColor: [16, 44, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [243, 244, 246] },
          margin: { left: 14, right: 14 },
          styles: { cellPadding: 2 },
          tableWidth: 'auto',
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // === FOOTER ===
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }

      // Save
      const dateStr = fromDate || toDate
        ? `_${fromDate || 'all'}_to_${toDate || 'all'}`
        : '';
      doc.save(`Laporan_Transaksi${dateStr}.pdf`);
      setExportDropdownOpen(false);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert(`Gagal export PDF: ${err.message}`);
    }
  };


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
                <div className="w-px bg-gray-300 mx-1"></div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="px-4 py-2 text-sm border rounded-lg font-semibold flex items-center gap-1"
                    style={{
                      borderColor: HEX_BLUE,
                      backgroundColor: HEX_BLUE,
                      color: '#FFFFFF',
                    }}
                  >
                    Export
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {exportDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setExportDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-1 z-20 bg-white border rounded-lg shadow-lg min-w-[150px]"
                        style={{ borderColor: '#E5E7EB' }}>
                        <button
                          type="button"
                          onClick={exportToExcel}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                          style={{ color: HEX_BLUE }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export Excel
                        </button>
                        <div className="h-px bg-gray-200"></div>
                        <button
                          type="button"
                          onClick={exportToPDF}
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                          style={{ color: HEX_BLUE }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Export PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

