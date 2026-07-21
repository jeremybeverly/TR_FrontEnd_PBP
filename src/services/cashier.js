import axiosClient from './AxiosApiClient';

const LAN_URL = import.meta.env.VITE_LAN_URL || '';

export const getProducts = async ({ category, search } = {}) => {
  const params = {};
  if (category) params.category = category;
  if (search) params.search = search;

  const res = await axiosClient.get('/products', { params });
  return res.data.data;   
};

export const getProductCustomization = async (productId) => {
  const res = await axiosClient.get(`/mobile/products/${productId}/customization`);
  return res.data.data;   
};

export const createTransaction = async ({ items, payment_method }) => {
  const res = await axiosClient.post('/transactions', { items, payment_method });
  return res.data.data;   
};

export const getMyTransactions = async ({ invoice_number, status } = {}) => {
  const params = {};
  if (invoice_number) params.invoice_number = invoice_number;
  if (status) params.status = status;

  const res = await axiosClient.get('/transactions', { params });
  return res.data.data;
};

export const getTransactionById = async (id) => {
  const res = await axiosClient.get(`/transactions/${id}`);
  return res.data.data;  
};

export const voidTransaction = async (id, void_reason) => {
  const res = await axiosClient.patch(`/transactions/${id}/void`, { void_reason });
  return res.data.data;
};

export const getQrImageUrl = (transactionId) =>
  `${LAN_URL}/pay/${transactionId}/qr.png`;

export const getActiveShift = async () => {
  const res = await axiosClient.get('/shift');
  return res.data.data;   
};

export const startShift = async (starting_cash) => {
  const res = await axiosClient.post('/shift/start', { starting_cash });
  return res.data.data;
};

export const endShift = async (actual_cash) => {
  const res = await axiosClient.post('/shift/end', { actual_cash });
  return res.data.data;   
};

export const createCashflow = async ({ flow_type, amount, reason }) => {
  const res = await axiosClient.post('/cashflow', { flow_type, amount, reason });
  return res.data.data;
};

export const getCashflow = async () => {
  const res = await axiosClient.get('/cashflow');
  return res.data.data;
};

export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || 'Terjadi kesalahan';
