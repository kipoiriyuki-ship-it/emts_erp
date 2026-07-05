# EMTS TODO

## Step 1 — Perbaiki semua runtime/build error & 404 (module not found, undefined, 404)
- [ ] Identifikasi folder backend yang benar-benar dipakai runtime (cek artisan & route registration).
- [ ] Audit `backend-runtime/routes/api.php` vs `backend/routes/api.php` untuk mismatch endpoint.
- [ ] Verifikasi semua controller class yang direferensikan oleh route benar-benar ada.
- [ ] Sinkronkan base path frontend (`NEXT_PUBLIC_API_URL`) vs backend route (`/api/v1/...`).
- [ ] Cek wiring frontend `frontend/lib/api/*.ts` terhadap endpoint route backend yang aktif.
- [ ] Setelah 404/undefined hilang, update dokumentasi endpoint (jika perlu).

## Step 2 — CRUD end-to-end (Project, COA, Journal, Cash Flow, Approval)
- [ ] Project: Create/Read/Update/Delete tersimpan ke DB.
- [ ] COA: Create/Read/Update/Delete tersimpan ke DB (parent_id & tree aman).
- [ ] Journal: Create/Update/Delete + POST (ledger_entries & account_balances ter-update).
- [ ] Cash Flow: Operational expenses CRUD + approval; Large cash requests CRUD + submit/approve/reject + items & payments tersimpan.
- [ ] Approval: Create approval saat submit, status update & histori tersimpan, side-effect sesuai modul.
- [ ] Tambah/rapikan feature tests untuk memastikan record ada di DB setelah operasi.

## Step 3 — Settings (My Account, Company Settings, License, User, Role, Permission)
- [ ] Endpoint Settings: profile + company settings + license + user/role/permission CRUD.
- [ ] Pastikan frontend mengirim/menampilkan data nyata dari DB.

## Step 4 — Laporan & Export (View, PDF, Excel)
- [ ] Pastikan report endpoints menghasilkan data nyata (query benar, filter benar, period benar).
- [ ] Excel export stream/download bekerja (Maatwebsite Excel).
- [ ] PDF export bekerja (dompdf).
- [ ] Frontend export button mengunduh file yang benar.

## Step 5 — Modul pendukung
- [ ] Backup.
- [ ] Notification realtime.
- [ ] Dynamic Approval.
- [ ] Receivable.
- [ ] Payable.
- [ ] Branch.
- [ ] Department.

