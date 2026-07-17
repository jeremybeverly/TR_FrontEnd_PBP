import api from './api';

export const getIngredients = async (params = {}) => {
    const query = {};
    if (params.search) query.search = params.search;
    if (params.lowStock) query.lowStock = 'true';

    const res = await api.get('/ingredients', { params: query });
    return res.data.data;
};
