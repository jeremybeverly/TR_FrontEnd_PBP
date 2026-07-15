import { useEffect, useState, useCallback } from 'react';
import { getIngredients, createIngredient } from '../services/ingredients';

const initialForm = {
    ingredient_name: '',
    sku: '',
    unit: 'gr',
    current_stock: 0,
    minimum_stock: 0,
    last_cost_per_unit: 0,
};

function Testing() {
    const [ingredients, setIngredients] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState('');
    const [lowStock, setLowStock] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchIngredients = useCallback(() => {
        getIngredients({ search, lowStock: lowStock ? 'true' : 'false' })
            .then((data) => {
                setIngredients(data);
            })
            .catch((err) => {
                console.error('Failed to fetch ingredients:', err);
                setError('Failed to fetch ingredients.');
            });
    }, [search, lowStock]);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await createIngredient(form);
            setMessage('Bahan Baku berhasil ditambahkan!');
            setForm(initialForm);
            fetchIngredients();
        } catch (err) {
            console.error('Error creating ingredient:', err);
            setError(err.response?.data?.message || 'Gagal menambahkan bahan baku.');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--text-h)' }}>Bahan Baku (Ingredients)</h1>
            <p style={{ color: 'var(--text)', marginBottom: '24px' }}>Manage and test ingredients data API</p>

            {/* Notifications */}
            {message && <div style={{ padding: '12px', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '16px' }}>{message}</div>}
            {error && <div style={{ padding: '12px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

            {/* Filter and Search controls */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: '10px 14px',
                        flex: '1',
                        minWidth: '200px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        background: 'var(--bg)',
                        color: 'var(--text-h)',
                    }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-h)' }}>
                    <input
                        type="checkbox"
                        checked={lowStock}
                        onChange={(e) => setLowStock(e.target.checked)}
                        style={{ transform: 'scale(1.1)' }}
                    />
                    Low Stock Only
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Ingredients List Column */}
                <section style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        Ingredients List ({ingredients.length})
                    </h2>
                    {ingredients.length === 0 ? (
                        <p style={{ color: 'var(--text)' }}>No ingredients found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {ingredients.map((item) => {
                                const isLow = item.current_stock <= item.minimum_stock;
                                return (
                                    <div
                                        key={item._id}
                                        style={{
                                            padding: '12px',
                                            border: isLow ? '1px solid #f5c6cb' : '1px solid var(--border)',
                                            borderRadius: '6px',
                                            background: isLow ? '#f8d7da' : 'var(--code-bg)',
                                            color: isLow ? '#721c24' : 'var(--text-h)',
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '16px' }}>{item.ingredient_name}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>SKU: {item.sku}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '8px' }}>
                                            <div>
                                                Stock: {item.current_stock} / {item.minimum_stock} {item.unit}
                                            </div>
                                            <div style={{ fontWeight: '500' }}>
                                                Cost: Rp {item.last_cost_per_unit?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Add Ingredient Form Column */}
                <section style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        Add New Ingredient
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                Ingredient Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.ingredient_name}
                                onChange={(e) => setForm({ ...form, ingredient_name: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                SKU
                            </label>
                            <input
                                type="text"
                                required
                                value={form.sku}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                Unit
                            </label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                            >
                                <option value="gr">gr (Gram)</option>
                                <option value="ml">ml (Milliliter)</option>
                                <option value="pcs">pcs (Pieces)</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                    Current Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.current_stock}
                                    onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                    Minimum Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={form.minimum_stock}
                                    onChange={(e) => setForm({ ...form, minimum_stock: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: 'var(--text-h)' }}>
                                Last Cost Per Unit (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={form.last_cost_per_unit}
                                onChange={(e) => setForm({ ...form, last_cost_per_unit: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg)', color: 'var(--text-h)' }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                marginTop: '12px',
                            }}
                        >
                            Submit Ingredient
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Testing;