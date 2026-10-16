Berdasarkan dokumen `api.md` dan API yang sudah dibuat di `test-definitions.query.ts`, halaman `TestManagement` saat ini baru mencakup pengelolaan **"Sampul"** (Test Definition) saja. Padahal, sebuah alat tes memiliki struktur turunan yang kompleks (Section, Scale, Item, Norm).

Berikut adalah analisis komponen apa saja yang perlu diubah dan dibuat baru, beserta API yang akan digunakannya **(tanpa contoh kode)**:

### 1. Komponen yang Perlu Diubah (Existing Components)

**A. `TestManagement` (Tabel Utama di `page.tsx`)**

- **Tujuan:** Memperluas aksi pada kolom "Actions" di tabel. Saat ini hanya ada tombol Edit. Kita perlu menambahkan aksi untuk mengubah status dan menghapus tes, serta tombol untuk masuk ke "Builder/Detail" tes.
- **API yang digunakan:**
  - `usePublishTestDefinitionMutation`: Untuk mengubah status tes dari `DRAFT` menjadi `ACTIVE` (mengunci tes).
  - `useArchiveTestDefinitionMutation`: Untuk mengubah status menjadi `ARCHIVED`.
  - `useDeleteTestDefinitionMutation`: Untuk melakukan soft-delete (hanya boleh jika status masih `DRAFT`).
- **Catatan:** Sebaiknya gunakan komponen Dropdown Menu (titik tiga) di kolom Actions agar UI tidak penuh. Tambahkan validasi visual (misal: tombol Delete disembunyikan jika status bukan `DRAFT`).

**B. `DialogEdit` & `TestDefinitionForm`**

- **Tujuan:** Menyesuaikan aturan bisnis dari `api.md`.
- **API yang digunakan:** `useUpdateTestDefinitionMutation`.
- **Catatan:** Form edit harus dikunci (disabled) atau disembunyikan jika status tes sudah `ACTIVE` atau `ARCHIVED`, karena `api.md` menyebutkan update hanya bisa dilakukan saat status `DRAFT`.

---

### 2. Komponen Baru yang Perlu Dibuat (New Components/Pages)

Karena Section dan Scale memiliki banyak data, sangat disarankan untuk membuat **Halaman Detail Baru** (misal: route `/$testId`) alih-alih menumpuknya di dalam modal/dialog di halaman `TestManagement`.

**A. Halaman `TestDetailLayout` (Route Baru)**

- **Tujuan:** Menjadi wadah utama (dashboard mini) untuk satu alat tes spesifik. Menampilkan informasi "Sampul", statistik (`stats`), dan kelayakan terbit (`progress`).
- **API yang digunakan:** `useGetTestDefinition` (mengambil detail, stats, dan progress).
- **Catatan:** Halaman ini bisa menggunakan sistem _Tabs_ (Tab Section, Tab Scale, Tab Item, Tab Norm) untuk navigasi antar entitas.

**B. Komponen `SectionManagement` (Di dalam Tab Section)**

- **Tujuan:** Mengelola subtes (urutan, batas waktu, instruksi). Sesuai `api.md`, ini digunakan oleh mesin pengerjaan tes.
- **API yang digunakan:**
  - `useGetTestSections` (menampilkan list section).
  - `useCreateTestSectionMutation` & `useUpdateTestSectionMutation` (form modal untuk section).
  - `useDeleteTestSectionMutation` (hapus section).
- **Catatan:** Perlu ada tabel/list khusus section. Hapus section akan gagal (`409`) jika masih ada skala/soal di dalamnya, jadi perlu penanganan error (toast) yang baik.

**C. Komponen `ScaleManagement` (Di dalam Tab Scale)**

- **Tujuan:** Mengelola aspek yang diukur (skala).
- **API yang digunakan:**
  - `useGetTestScales` (menampilkan list skala).
  - `useCreateTestScaleMutation` & `useUpdateTestScaleMutation` (form modal untuk skala).
  - `useDeleteTestScaleMutation` (hapus skala).
- **Catatan:** Saat membuat skala bertipe `SUBTEST`, form harus menampilkan dropdown pilihan Section. Oleh karena itu, komponen ini mungkin perlu memanggil `useGetTestSections` juga untuk mengisi opsi dropdown tersebut.

**D. Komponen `DialogConfirmAction` (Reusable)**

- **Tujuan:** Memberikan peringatan sebelum user melakukan aksi krusial.
- **Catatan:** Sangat penting untuk aksi **Publish**, karena `api.md` menegaskan bahwa setelah `ACTIVE`, tes akan terkunci dan tidak bisa diedit lagi. User harus mengonfirmasi peringatan ini sebelum `usePublishTestDefinitionMutation` dipanggil.
