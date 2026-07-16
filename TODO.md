# TODO - Implementasi UI Admin (sesuai BackendPOSPBP)

## Langkah 1: Persiapan API client & auth
- [ ] Tambah util `src/services/api.js` untuk baseUrl + handle token (Bearer)
- [ ] Tambah util `src/services/auth.js` untuk login/getMe/logout

## Langkah 2: Implementasi halaman Admin CRUD
- [ ] Buat halaman: `src/pages/admin/Ingredients.jsx` (CRUD ingredient)
- [ ] Buat halaman: `src/pages/admin/Stock.jsx` (Supply in, Stock opname, Stock out, list)
- [ ] Buat halaman: `src/pages/admin/ModifierGroups.jsx` (CRUD modifier group)
- [ ] Buat halaman: `src/pages/admin/Modifiers.jsx` (CRUD modifier)
- [ ] Buat halaman: `src/pages/admin/Suppliers.jsx` (CRUD supplier)
- [ ] Buat halaman: `src/pages/admin/Users.jsx` (CRUD user)

## Langkah 3: Upgrade ProductCatalog (CRUD produk)
- [ ] Buat modal untuk create/update product + upload image (multipart field `image`)
- [ ] Tambah tombol delete (soft delete dari backend)

## Langkah 4: Integrasi navigasi di Dashboard
- [ ] Update `src/pages/Dashboard.jsx` sidebar agar view switch ke halaman admin CRUD

## Langkah 5: UI Components & Consistency
- [ ] Tambah komponen reusable: Button, Input, Modal, Table (opsional) agar konsisten

## Langkah 6: Testing manual
- [ ] Jalankan `npm run dev` dan cek endpoint berjalan:
  - [ ] /api/auth/login + simpan token
  - [ ] /api/products list
  - [ ] /api/ingredients CRUD (admin)
  - [ ] /api/shift start/end (untuk kompatibilitas nanti)

