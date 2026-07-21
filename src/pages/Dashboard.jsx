import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
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
import StockAdmin from './admin/StockAdmin.jsx';
import SuppliersAdmin from './admin/SuppliersAdmin.jsx';
import UsersAdmin from './admin/UsersAdmin.jsx';
import ReportsAdmin from './admin/ReportsAdmin.jsx';
import TransactionsAdmin from './admin/TransactionsAdmin.jsx';
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

const ICONS = {
  triangleWarning: 'mdi:alert',
  calendar: 'mdi:calendar',
  logout: 'mdi:logout',
  user: 'mdi:account-circle',
  dashboard: 'mdi:view-dashboard',
  products: 'mdi:package-variant-closed',
  ingredients: 'mdi:food-variant',
  stock: 'mdi:warehouse',
  suppliers: 'mdi:truck',
  employees: 'mdi:account-group',
  reports: 'mdi:file-chart',
  transactions: 'mdi:receipt',
};

function formatIDR(value) {
  if (typeof value !== 'number') return value;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatMillionsTick(value) {
  if (typeof value !== 'number') return '';
  if (value === 0) return '0';
  return `${Math.round(value / 1_000_000)}M`;
}

function UserIcon({ className = '' }) {
  return <Icon icon={ICONS.user} className={className} style={{ color: HEX_BLUE }} />;
}

function SidebarNavIcon({ variant, className = '' }) {
  const icon = ICONS[variant] || 'mdi:help-circle';
  return <Icon icon={icon} className={className} style={{ color: HEX_BLUE }} />;
}

function CalendarIcon({ className = '' }) {
  return <Icon icon={ICONS.calendar} className={className} style={{ color: HEX_BLUE }} />;
}

function TriangleWarningIcon({ className = '' }) {
  return <Icon icon={ICONS.triangleWarning} className={className} style={{ color: '#EF4444' }} />;
}

function LogoutIcon({ className = '' }) {
  return <Icon icon={ICONS.logout} className={className} style={{ color: HEX_BLUE }} />;
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
              <StockAdmin />
            ) : view === 'SuppliersAdmin' ? (
              <SuppliersAdmin />
            ) : view === 'UsersAdmin' ? (
              <UsersAdmin />
            ) : view === 'ReportsAdmin' ? (
              <ReportsAdmin />
            ) : view === 'TransactionsAdmin' ? (
              <TransactionsAdmin />
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
                        <Icon icon="mdi:cash-multiple" className="w-5 h-5" style={{ color: HEX_BLUE }} />
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
                        <Icon icon="mdi:cash-check" className="w-5 h-5" style={{ color: HEX_BLUE }} />
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
                        <Icon icon="mdi:receipt" className="w-5 h-5" style={{ color: HEX_BLUE }} />
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

