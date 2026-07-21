export const TAX_RATE = 0.11;

export const calculateTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE);

  return { subtotal, tax, total: subtotal + tax };
};
