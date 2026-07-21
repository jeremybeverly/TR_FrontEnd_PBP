export const formatRupiah = (value) => {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}