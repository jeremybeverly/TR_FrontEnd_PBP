import { api } from './api';

export const getDashboardSummary = () => api.get('/api/dashboard/summary');
export const getSalesTrend = () => api.get('/api/dashboard/sales-trend');
export const getActiveCashiers = () => api.get('/api/dashboard/active-cashier');
export const getRecentTransactions = () => api.get('/api/dashboard/recent-transactions');
export const getLowStock = () => api.get('/api/dashboard/low-stock');

// Ingredients
export const getIngredients = (params) => api.get(`/api/ingredients${params ? `?${params}` : ''}`);
export const createIngredient = (payload) => api.post('/api/ingredients', payload);
export const updateIngredient = (id, payload) => api.put(`/api/ingredients/${id}`, payload);
export const deleteIngredient = (id) => api.del(`/api/ingredients/${id}`);

// Stock
export const getStock = (params) => api.get(`/api/stocks${params ? `?${params}` : ''}`);
export const supplyIn = (payload) => api.post('/api/stocks', payload);
export const stockOut = (payload) => api.post('/api/stocks/out', payload);
export const stockOpname = (payload) => api.post('/api/stocks/opname', payload);

// Modifier Groups
export const getModifierGroups = (params) => api.get(`/api/modifier-groups${params ? `?${params}` : ''}`);
export const createModifierGroup = (payload) => api.post('/api/modifier-groups', payload);
export const updateModifierGroup = (id, payload) => api.put(`/api/modifier-groups/${id}`, payload);
export const deleteModifierGroup = (id) => api.del(`/api/modifier-groups/${id}`);

// Modifiers
export const getModifiers = (params) => api.get(`/api/modifiers${params ? `?${params}` : ''}`);
export const createModifier = (payload) => api.post('/api/modifiers', payload);
export const updateModifier = (id, payload) => api.put(`/api/modifiers/${id}`, payload);
export const deleteModifier = (id) => api.del(`/api/modifiers/${id}`);

// Suppliers
export const getSuppliers = (params) => api.get(`/api/suppliers${params ? `?${params}` : ''}`);
export const createSupplier = (payload) => api.post('/api/suppliers', payload);
export const updateSupplier = (id, payload) => api.put(`/api/suppliers/${id}`, payload);
export const deleteSupplier = (id) => api.del(`/api/suppliers/${id}`);

// Users
export const getUsers = (params) => api.get(`/api/users${params ? `?${params}` : ''}`);
export const createUser = (payload) => api.post('/api/users', payload);
export const updateUser = (id, payload) => api.put(`/api/users/${id}`, payload);
export const deleteUser = (id) => api.del(`/api/users/${id}`);

// Products
export const getProducts = (params) => api.get(`/api/products${params ? `?${params}` : ''}`);
export const createProduct = (formData) => api.post('/api/products', formData, { headers: {}, body: undefined });

