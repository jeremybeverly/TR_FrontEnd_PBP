import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import ProductCatalog from './ProductCatalog.jsx';
import CatalogAdmin from './admin/CatalogAdmin.jsx';
import IngredientsAdmin from './admin/Ingredients.jsx';
import Placeholder from './admin/Placeholder.jsx';
import { logout, getUser, getMe } from '../services/auth.js';
import {
  getDashboardSummary,
  getSalesTrend,
  getActiveCashiers,
  getLowStock,
  getRecentTransactions,
} from '../services/admin.js';


const HEX_BLUE = '#102C57';
const HEX_SAND_1 = '#EADBC8';
const HEX_SAND_2 = '#DAC0A3';
const HEX_OFFWHITE = '#FEFAF6';

function formatIDR(value) {
  if (typeof value !== 'number') return value;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatMillionsTick(value) {
  if (typeof value !== 'number') return '';
  if (value === 0) return '0';
  return `${Math.round(value / 1_000_000)}M`;
}

function TriangleWarningIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3L2 21H22L12 3Z"
        fill="#EF4444"
        stroke="#EF4444"
        strokeWidth="1"
      />
      <path
        d="M12 9V13"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17H12.01"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 9H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LogoutIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 7V5C10 3.89543 10.8954 3 12 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H12C10.8954 21 10 20.1046 10 19V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 12H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 9L3 12L6 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 11C15.3137 11 18 8.31371 18 5C18 1.68629 15.3137 -1 12 -1C8.68629 -1 6 1.68629 6 5C6 8.31371 8.68629 11 12 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        transform="translate(0 2)"
      />
    </svg>
  );
}

function SidebarNavIcon({ variant, className = '' }) {
  const stroke = HEX_BLUE;
  const common = {
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    className,
    'aria-hidden': true,
  };

  switch (variant) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M3 13h8V3H3v10Z" stroke={stroke} strokeWidth="2" />
          <path d="M13 21h8V11h-8v10Z" stroke={stroke} strokeWidth="2" />
          <path d="M13 3h8v6h-8V3Z" stroke={stroke} strokeWidth="2" />
          <path d="M3 21h8v-6H3v6Z" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'products':
      return (
        <svg {...common}>
          <path d="M21 8.5L12 3 3 8.5 12 14l9-5.5Z" stroke={stroke} strokeWidth="2" />
          <path d="M3 8.5V16.5L12 22l9-5.5V8.5" stroke={stroke} strokeWidth="2" />
          <path d="M12 14v8" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'ingredients':
      return (
        <svg {...common}>
          <path d="M7 3h10v4H7V3Z" stroke={stroke} strokeWidth="2" />
          <path d="M7 7v14h10V7" stroke={stroke} strokeWidth="2" />
          <path d="M9 11h6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M9 15h6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'stock':
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73L13 3l-8 3.27A2 2 0 0 0 4 8v8a2 2 0 0 0 1 1.73L12 21l8-3.27A2 2 0 0 0 21 16Z" stroke={stroke} strokeWidth="2" />
          <path d="M12 7v10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'suppliers':
      return (
        <svg {...common}>
          <path d="M3 7l9-4 9 4-9 4-9-4Z" stroke={stroke} strokeWidth="2" />
          <path d="M3 7v10l9 4 9-4V7" stroke={stroke} strokeWidth="2" />
          <path d="M12 11v10" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'employees':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke={stroke} strokeWidth="2" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M17 3.13a4 4 0 0 1 0 7.75" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" stroke={stroke} strokeWidth="2" />
          <path d="M8 7h8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 11h8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 15h6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'transactions':
      return (
        <svg {...common}>
          <path d="M2 9l3-3 3 3" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 6v10a2 2 0 0 0 2 2h15" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M22 15l-3 3-3-3" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" />
        </svg>
      );
  }
}

export default function CoreExecutiveDashboard() {
  const [user] = useState(() => getUser());
  const [dashboardUser, setDashboardUser] = useState(user);
  const username = dashboardUser?.name || dashboardUser?.username || 'Guest';

  const [chartData, setChartData] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeCashiers, setActiveCashiers] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [dateLabel, setDateLabel] = useState('Hari Ini');
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [activeNav, setActiveNav] = useState('Dashboard');
  const [view, setView] = useState('Dashboard'); // 'Dashboard' | 'Catalog'

  const dropdownOptions = useMemo(() => ['Hari Ini', 'Minggu Ini', 'Bulan Ini'], []);
  const [salesRange, setSalesRange] = useState(dropdownOptions[0]);

  useEffect(() => {
    let alive = true;

    const normalize = (payload) => payload?.data ?? payload;

    const mapTrend = (trendPayload) =>
      Array.isArray(trendPayload)
        ? trendPayload
            .map((item) => ({
              time: typeof item._id === 'number' ? `${item._id}:00` : String(item._id),
              revenue: item.total_sales ?? item.total_amount ?? item.amount ?? 0,
            }))
            .sort((a, b) => a.time.localeCompare(b.time))
        : [];

    const mapRecentTransactions = (transactions) =>
      Array.isArray(transactions)
        ? transactions.map((tx) => ({
            title: tx.cashier_id?.name ? `Transaksi oleh ${tx.cashier_id.name}` : `Transaksi ${tx._id?.slice(-6)}`,
            time: tx.created_at
              ? new Date(tx.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            description: `${formatIDR(tx.total_amount ?? 0)} • ${
              tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Status tidak diketahui'
            }`,
          }))
        : [];

    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const [summaryRes, trendRes, activeCashiersRes, lowStockRes, recentTransRes, meRes] =
          await Promise.all([
            getDashboardSummary(),
            getSalesTrend(),
            getActiveCashiers(),
            getLowStock(),
            getRecentTransactions(),
            getMe().catch(() => null),
          ]);

        if (!alive) return;

        const summaryPayload = normalize(summaryRes) || {};
        const trendPayload = normalize(trendRes) || [];
        const activeCashiersPayload = normalize(activeCashiersRes) || [];
        const lowStockPayload = normalize(lowStockRes) || [];
        const recentTransactionsPayload = normalize(recentTransRes) || [];
        const mePayload = normalize(meRes) || dashboardUser;

        setDashboardSummary(summaryPayload);
        setChartData(mapTrend(trendPayload));
        setActiveCashiers(Array.isArray(activeCashiersPayload) ? activeCashiersPayload : []);
        setLowStockCount(Array.isArray(lowStockPayload) ? lowStockPayload.length : 0);
        setRecentLogs(mapRecentTransactions(recentTransactionsPayload));

        if (mePayload && alive) {
          setDashboardUser(mePayload?.user ?? mePayload);
        }
      } catch (error) {
        console.error('Gagal memuat dashboard:', error);
      } finally {
        if (alive) setLoadingDashboard(false);
      }
    };

    fetchDashboard();

    return () => {
      alive = false;
    };
  }, []);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 500_000];
    const max = Math.max(...chartData.map((d) => d.revenue ?? d.amount ?? d.total ?? 0));
    if (max <= 0) return [0, 500_000];
    const top = Math.max(Math.ceil(max * 1.15), 200_000);
    return [0, top];
  }, [chartData]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = '/';
    }
  };

  const handleNavClick = (navKey) => {
    if (navKey === 'ProductCatalog') {
      setView('CatalogAdmin');
      setActiveNav('ProductCatalog');
      return;
    }

    if (navKey === 'IngredientsAdmin') {
      setView('IngredientsAdmin');
      setActiveNav('IngredientsAdmin');
      return;
    }

    // placeholder admin pages (to be implemented next)

    if (navKey === 'StockAdmin') {
      setView('StockAdmin');
      setActiveNav('StockAdmin');
      return;
    }
    if (navKey === 'SuppliersAdmin') {
      setView('SuppliersAdmin');
      setActiveNav('SuppliersAdmin');
      return;
    }
    if (navKey === 'UsersAdmin') {
      setView('UsersAdmin');
      setActiveNav('UsersAdmin');
      return;
    }
    if (navKey === 'ReportsAdmin') {
      setView('ReportsAdmin');
      setActiveNav('ReportsAdmin');
      return;
    }
    if (navKey === 'TransactionsAdmin') {
      setView('TransactionsAdmin');
      setActiveNav('TransactionsAdmin');
      return;
    }

    setView('Dashboard');
    setActiveNav('Dashboard');
  };


  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: HEX_OFFWHITE }}>

      <aside
        className="hidden lg:flex w-72 shrink-0 flex-col"
        style={{ background: `linear-gradient(180deg, ${HEX_SAND_1}, ${HEX_SAND_2})` }}
      >
        <div className="p-6 flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full border"
            style={{ borderColor: HEX_BLUE }}
          >
            <UserIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[${HEX_BLUE}] text-lg font-bold" style={{ color: HEX_BLUE }}>
              Back Office
            </div>
            <div className="text-sm" style={{ color: HEX_BLUE }}>
              Welcome, {username}
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {[
              { label: 'Dashboard', icon: 'dashboard', navKey: 'Dashboard' },
              { label: 'Katalog Produk', icon: 'products', navKey: 'ProductCatalog' },
              { label: 'Bahan Baku', icon: 'ingredients', navKey: 'IngredientsAdmin' },
              { label: 'Manajemen Stok', icon: 'stock', navKey: 'StockAdmin' },
              { label: 'Suppliers', icon: 'suppliers', navKey: 'SuppliersAdmin' },
              { label: 'Manajemen Karyawan', icon: 'employees', navKey: 'UsersAdmin' },
              { label: 'Laporan Staff', icon: 'reports', navKey: 'ReportsAdmin' },
              { label: 'Laporan Transaksi', icon: 'transactions', navKey: 'TransactionsAdmin' },
            ].map((item) => {
              const isActive =
                item.navKey === activeNav;


              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition"
                    onClick={() => handleNavClick(item.navKey)}
                    style={{
                      backgroundColor: isActive ? HEX_BLUE : 'transparent',
                      color: isActive ? '#FFFFFF' : HEX_BLUE,
                    }}
                  >
                    <span className="w-6 h-6">
                      <SidebarNavIcon variant={item.icon} className="w-6 h-6" />
                    </span>
                    <span className="text-sm font-medium" style={{ color: isActive ? '#FFFFFF' : HEX_BLUE }}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-3"
            style={{ border: `1px solid ${HEX_BLUE}`, color: HEX_BLUE, backgroundColor: 'transparent' }}
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <div
          className="w-full rounded-xl overflow-hidden"
          style={{ border: `1px solid ${HEX_BLUE}`, backgroundColor: HEX_OFFWHITE }}
        >
          <div className="p-6">
            {view === 'CatalogAdmin' ? (
              <CatalogAdmin />
            ) : view === 'Catalog' ? (
              <ProductCatalog />
            ) : view === 'IngredientsAdmin' ? (
              <IngredientsAdmin />
            ) : view === 'StockAdmin' ? (
              <Placeholder title="Manajemen Stok" subtitle="Supply In / Stock Opname / Stock Out" />
            ) : view === 'SuppliersAdmin' ? (
              <Placeholder title="Suppliers" subtitle="CRUD Supplier" />
            ) : view === 'UsersAdmin' ? (
              <Placeholder title="Manajemen Karyawan" subtitle="CRUD Users" />
            ) : view === 'ReportsAdmin' ? (
              <Placeholder title="Laporan Staff" subtitle="Card ringkasan shift & performa" />
            ) : view === 'TransactionsAdmin' ? (
              <Placeholder title="Laporan Transaksi" subtitle="Riwayat transaksi & void" />
            ) : (

              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: HEX_BLUE }}>
                      Ringkasan Operasional Harian
                    </h1>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: HEX_BLUE }}>
                      Pantau kinerja dan aktivitas toko secara real-time.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 backdrop-blur border"
                    style={{ borderColor: HEX_BLUE, color: HEX_BLUE }}
                    onClick={() => setDateLabel((prev) => prev)}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">{dateLabel}</span>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>
                          Total Pendapatan Kotor
                        </div>
                        <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>
                          {formatIDR(dashboardSummary?.gross_revenue ?? dashboardSummary?.total_revenue ?? dashboardSummary?.revenue ?? 0)}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#EADBC8]/60 flex items-center justify-center">
                        <span className="text-sm" style={{ color: HEX_BLUE }}>
                          $
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>
                          Total Pendapatan Bersih
                        </div>
                        <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>
                          {formatIDR(dashboardSummary?.net_revenue ?? dashboardSummary?.profit ?? 0)}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#DAC0A3]/50 flex items-center justify-center">
                        <span className="text-sm" style={{ color: HEX_BLUE }}>
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>
                          Jumlah Transaksi Hari Ini
                        </div>
                        <div className="mt-2 text-lg sm:text-xl font-bold" style={{ color: HEX_BLUE }}>
                          {dashboardSummary?.transaction_count ?? dashboardSummary?.today_transactions ?? dashboardSummary?.transactions_today ?? 0}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#EADBC8]/60 flex items-center justify-center">
                        <span className="text-sm" style={{ color: HEX_BLUE }}>
                          ≋
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold" style={{ color: '#B91C1C' }}>
                          Peringatan Stok Menipis
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <TriangleWarningIcon className="w-10 h-10" />
                          <div>
                            <div className="text-lg sm:text-xl font-bold" style={{ color: '#B91C1C' }}>
                              {lowStockCount} Item
                            </div>
                            <div className="text-xs" style={{ color: '#B91C1C', opacity: 0.9 }}>
                              {lowStockCount > 0
                                ? 'Periksa bahan yang mendekati minimum stok'
                                : 'Semua stok mencukupi untuk hari ini'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-medium" style={{ color: HEX_BLUE }}>
                          Status Kasir Aktif
                        </div>
                        <div className="mt-2 flex items-center gap-2" style={{ color: HEX_BLUE }}>
                          <span
                            className="inline-flex items-center justify-center w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: activeCashiers.length > 0 ? '#22C55E' : '#F97316',
                              boxShadow: activeCashiers.length > 0 ? '0 0 14px rgba(34,197,94,0.7)' : '0 0 14px rgba(249,115,22,0.7)',
                            }}
                          />
                          <span className="font-semibold">
                            • {activeCashiers.length > 0 ? `${activeCashiers.length} kasir aktif` : 'Tidak ada kasir aktif'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {activeCashiers.length > 0
                            ? activeCashiers.map((shift) => shift.cashier_id?.name).filter(Boolean).join(', ')
                            : 'Tidak ada kasir aktif saat ini'}
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                        <span className="text-sm" style={{ color: '#16A34A' }}>
                          ●
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-4">
                  <section className="xl:col-span-3 bg-white/60 rounded-xl border p-4" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-bold" style={{ color: HEX_BLUE }}>
                        Grafik Tren Penjualan Harian
                      </h2>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm rounded-lg px-3 py-2 border"
                          value={salesRange}
                          onChange={(e) => setSalesRange(e.target.value)}
                          style={{ borderColor: HEX_BLUE, color: HEX_BLUE, backgroundColor: '#FFFFFF' }}
                        >
                          {dropdownOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={HEX_BLUE} stopOpacity={0.55} />
                              <stop offset="95%" stopColor={HEX_BLUE} stopOpacity={0} />
                            </linearGradient>
                          </defs>

                          <XAxis
                            dataKey="time"
                            tick={{ fill: HEX_BLUE, fontSize: 12 }}
                            axisLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                            tickLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                          />
                          <YAxis
                            domain={yDomain}
                            tickFormatter={(v) => formatMillionsTick(v)}
                            tick={{ fill: HEX_BLUE, fontSize: 12 }}
                            axisLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                            tickLine={{ stroke: HEX_BLUE, strokeWidth: 1 }}
                          />
                          <Tooltip
                            formatter={(val) => [formatIDR(val), '']}
                            labelStyle={{ color: HEX_BLUE, fontWeight: 700 }}
                            contentStyle={{
                              borderColor: HEX_BLUE,
                              borderWidth: 1,
                              borderStyle: 'solid',
                              borderRadius: 12,
                              backgroundColor: 'white',
                            }}
                          />

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
                    </div>
                  </section>

                  <section className="xl:col-span-2 bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                    <h2 className="font-bold text-xl mb-6" style={{ color: HEX_BLUE }}>
                      Aktivitas Terbaru Kasir
                    </h2>

                    <div className="relative pl-6 space-y-6">
                      <div className="absolute left-0.75 top-2 bottom-2 w-px bg-gray-200" />

                      {recentLogs.map((log, idx) => (
                        <div key={`${log.time}-${idx}`} className="relative pl-6">
                          <div
                            className="absolute -left-1.25 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                            style={{ backgroundColor: HEX_BLUE }}
                          />

                          <div className="flex items-start justify-between gap-3">
                            <div className="font-semibold text-lg" style={{ color: HEX_BLUE }}>
                              {log.title}
                            </div>
                            <div className="text-base text-gray-500 mt-0.5">{log.time}</div>
                          </div>
                          <div className="mt-1 text-base text-gray-700">{log.description}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

