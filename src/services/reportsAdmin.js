import { api } from './api';

// Staff reports
export const getStaffReports = (params) => {
    const qs = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    return api.get(`/api/staff-reports${qs}`);
};

export const getStaffShiftDetails = (cashierId) => api.get(`/api/staff-reports/${cashierId}/shifts`);

// Transaction reports (admin)
export const getSalesSummary = (params) => {
    const qs = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    return api.get(`/api/transaction-reports/summary${qs}`);
};

export const getTopSalesProducts = (params) => {
    const qs = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    return api.get(`/api/transaction-reports/top-products${qs}`);
};

export const getSalesTrendReport = (params) => {
    const qs = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    return api.get(`/api/transaction-reports/trend${qs}`);
};

export const getAdminTransactionList = (params) => {
    const qs = params ? (params.startsWith('?') ? params : `?${params}`) : '';
    return api.get(`/api/transaction-reports/transaction-list${qs}`);
};

