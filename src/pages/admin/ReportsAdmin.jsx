import React from 'react';
import AdminLayout from './AdminLayout.jsx';

export default function ReportsAdmin() {
  return (
    <AdminLayout title="Laporan Staff (Admin)" subtitle="Card ringkasan shift & performa">
      <div className="bg-white rounded-xl border p-6 text-sm" style={{ borderColor: '#E5E7EB' }}>
        Halaman Laporan Staff belum diimplementasikan karena backend belum menyediakan endpoint agregasi spesifik untuk reports.

        <div className="mt-2 text-gray-600">
          Endpoint yang tersedia saat ini: /api/shift, /api/transactions, /api/cashflow.
        </div>
      </div>
    </AdminLayout>
  );
}

