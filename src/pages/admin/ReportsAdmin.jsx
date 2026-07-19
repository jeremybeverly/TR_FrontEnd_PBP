import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout.jsx';
import Modal from './Modal.jsx';
import { getStaffReports, getStaffShiftDetails } from '../../services/reportsAdmin.js';

const HEX_BLUE = '#102C57';

function formatMinutesToDisplay(totalMinutes) {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}j ${m}m`;
}

export default function ReportsAdmin() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedCashierId, setSelectedCashierId] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftDetails, setShiftDetails] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (fromDate) p.append('from_date', fromDate);
    if (toDate) p.append('to_date', toDate);
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [fromDate, toDate]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStaffReports(params);
      setRows(res.data || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const openShiftDetails = async (cashierId) => {
    setSelectedCashierId(cashierId);
    setShiftLoading(true);
    setShiftDetails([]);
    setModalOpen(true);
    try {
      const res = await getStaffShiftDetails(cashierId);
      setShiftDetails(res.data || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setShiftLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Laporan Staff"
      rightActions={
        <div className="flex gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB', minWidth: 150 }}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg"
              style={{ borderColor: '#E5E7EB', minWidth: 150 }}
            />
          </div>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl text-white font-semibold"
            style={{ backgroundColor: HEX_BLUE }}
          >
            Refresh
          </button>
        </div>
      }
    >
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-xs font-semibold" style={{ color: HEX_BLUE }}>
            Total Staff: {rows.length}
          </div>
          <div className="text-xs text-gray-500">
            Klik baris untuk melihat detail shift.
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
                  <th className="py-2">Staff</th>
                  <th className="py-2">Total Sales</th>
                  <th className="py-2">Transaksi</th>
                  <th className="py-2">Void</th>
                  <th className="py-2">Shift</th>
                  <th className="py-2">Variance</th>
                  <th className="py-2">Waktu Kerja</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.cashier_id || r.cashierId || r.cashier_id?.toString?.() || r.name}
                    className="border-t"
                    style={{ borderColor: '#F3F4F6', cursor: 'pointer' }}
                    onClick={() => openShiftDetails(r.cashier_id)}
                  >
                    <td className="py-3 font-semibold">{r.name}</td>
                    <td className="py-3">{r.total_sales}</td>
                    <td className="py-3">{r.transaction_count}</td>
                    <td className="py-3">{r.voided_count}</td>
                    <td className="py-3">{r.shift_count}</td>
                    <td className="py-3">{r.total_variance}</td>
                    <td className="py-3">
                      {r.total_work_minutes != null
                        ? formatMinutesToDisplay(r.total_work_minutes)
                        : r.total_work_display || '-'}
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
        title="Detail Shift"

        onClose={() => setModalOpen(false)}
        footer={null}
      >
        <div className="space-y-3">
          {shiftLoading ? (
            <div className="py-6 text-center text-gray-500">Memuat detail shift...</div>
          ) : shiftDetails.length === 0 ? (
            <div className="py-6 text-center text-gray-500">Tidak ada shift pada periode tersebut.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Status</th>
                  <th className="py-2">Mulai</th>
                  <th className="py-2">Selesai</th>
                  <th className="py-2">Durasi</th>
                  <th className="py-2">Variance</th>
                  <th className="py-2">Cash</th>
                  <th className="py-2">QRIS</th>
                </tr>
              </thead>
              <tbody>
                {shiftDetails.map((s) => (
                  <tr key={s.shifts_id} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="py-3 font-semibold">{s.status}</td>
                    <td className="py-3">{s.start_time ? new Date(s.start_time).toLocaleString('id-ID') : '-'}</td>
                    <td className="py-3">{s.end_time ? new Date(s.end_time).toLocaleString('id-ID') : '-'}</td>
                    <td className="py-3">{s.duration_display}</td>
                    <td className="py-3">{s.variance}</td>
                    <td className="py-3">{s.total_cash_sales}</td>
                    <td className="py-3">{s.total_qris_sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}


