import { api } from './api';

export const getDashboardSummary = () => api.get('/api/dashboard/summary');
export const getSalesTrend = () => api.get('/api/dashboard/sales-trend');
export const getActiveCashiers = () => api.get('/api/dashboard/active-cashier');
export const getRecentTransactions = () => api.get('/api/dashboard/recent-transactions');
export const getLowStock = () => api.get('/api/dashboard/low-stock');
