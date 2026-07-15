import api from './api';

/**
 * Fetch all ingredients from the API.
 * Supports filtering by search query and low stock status.
 * @param {Object} [params] Query parameters
 * @param {string} [params.search] Search by ingredient name or SKU
 * @param {boolean|string} [params.lowStock] Filter by low stock status
 * @returns {Promise<Array>} List of ingredients
 */
export const getIngredients = async (params = {}) => {
    const response = await api.get('/ingredients', { params });
    return response.data.data || [];
};

/**
 * Fetch a single ingredient by ID.
 * @param {string} id Ingredient ID
 * @returns {Promise<Object>} Ingredient details
 */
export const getIngredientById = async (id) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data.data;
};

/**
 * Create a new ingredient.
 * @param {Object} data Ingredient data
 * @returns {Promise<Object>} Created ingredient
 */
export const createIngredient = async (data) => {
    const response = await api.post('/ingredients', data);
    return response.data.data;
};

/**
 * Update an existing ingredient.
 * @param {string} id Ingredient ID
 * @param {Object} data Updated fields
 * @returns {Promise<Object>} Updated ingredient
 */
export const updateIngredient = async (id, data) => {
    const response = await api.put(`/ingredients/${id}`, data);
    return response.data.data;
};

/**
 * Delete (soft delete) an ingredient.
 * @param {string} id Ingredient ID
 * @returns {Promise<string>} Deleted ingredient ID
 */
export const deleteIngredient = async (id) => {
    const response = await api.delete(`/ingredients/${id}`);
    return response.data.id;
};
