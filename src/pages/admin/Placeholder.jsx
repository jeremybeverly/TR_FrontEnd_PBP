import React from 'react';
import AdminLayout from './AdminLayout.jsx';

export default function Placeholder({ title }) {
    return (
        <AdminLayout title={title} subtitle="Belum diimplementasikan (placeholder).">
            <div className="bg-white rounded-xl border p-6 text-sm" style={{ borderColor: '#E5E7EB' }}>
                <div className="font-semibold">Konten akan dibuat sesuai backend berikutnya.</div>
                <div className="mt-2 text-gray-600">Gunakan menu ini untuk menambah modul Admin (CRUD) secara bertahap.</div>
            </div>
        </AdminLayout>
    );
}

