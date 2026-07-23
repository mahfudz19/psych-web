# Arsitektur @psych-web

```plaintext
src/
├── assets/                       # --- ASET STATIS ---
│   ├── hero.png                  # Gambar hero untuk landing page[cite: 19]
│   ├── vite.svg                  # Logo Vite[cite: 19]
│   └── react.svg                 # Logo React[cite: 19]
│
├── components/                   # --- KOMPONEN VISUAL GLOBAL ---
│   └── layout/                   # Komponen pembungkus layout
│       ├── TopProgressBar.tsx    # Progress bar loading global (TanStack Router)[cite: 19]
│       ├── Sidebar/              # Khusus Layout B2B
│       │   ├── index.tsx         # Komponen sidebar navigasi utama[cite: 19]
│       │   └── menu.tsx          # Definisi menu sidebar (struktur & item)[cite: 19]
│       ├── Topbar/               # Topbar untuk B2B Workspace
│       │   ├── index.tsx         # Komponen navbar atas utama[cite: 19]
│       │   ├── DarkMode.tsx      # Toggle dark/light mode[cite: 19]
│       │   ├── LanguageSwitcher.tsx  # Toggle bahasa (ID/EN)[cite: 19]
│       │   ├── ProfileDropdown.tsx   # Dropdown profil pengguna (CSS murni)[cite: 19]
│       │   └── ToggleSidebar.tsx     # Toggle collapse sidebar[cite: 19]
│       ├── PortalHeader/         # (BARU) Topbar untuk B2C (Tanpa Sidebar)
│       │   └── index.tsx
│       └── ExamHeader/           # (BARU) Header Bebas Distraksi untuk Tes
│           └── index.tsx
│
├── constants/                    # --- KONFIGURASI GLOBAL ---
│   └── index.ts                  # Konstanta global aplikasi
│
├── contexts/                     # --- REACT CONTEXT GLOBAL ---
│   └── SidebarContext.tsx        # Context untuk state sidebar (collapse/expand)[cite: 19]
│
├── hooks/                        # --- CUSTOM HOOKS GLOBAL ---
│   └── useAuth.ts                # Hook untuk akses data user yang sedang login[cite: 19]
│
├── i18n/                         # --- INTERNASIONALISASI (i18n) ---
│   ├── index.ts                  # Konfigurasi i18next instance[cite: 19]
│   └── locales/                  # Kamus terjemahan terpusat[cite: 19]
│       ├── en/common.json        # Terjemahan bahasa Inggris[cite: 19]
│       └── id/common.json        # Terjemahan bahasa Indonesia[cite: 19]
│
├── types/                        # --- TYPESCRIPT DEFINITIONS GLOBAL ---
│   ├── api.ts                    # Tipe ApiResponse, PaginationMeta, dll.[cite: 19]
│   ├── i18next.d.ts              # Type declaration untuk i18next (Type safety)[cite: 19]
│   └── index.ts                  # Barrel file (export semua tipe)[cite: 19]
│
├── utils/                        # --- HELPER FUNCTIONS GLOBAL ---
│   ├── api.ts                    # Fungsi apiFetch (gatekeeper HTTP requests)[cite: 19]
│   └── removeEmptyValues.ts      # Helper hapus nilai kosong dari object[cite: 19]
│
├── routes/                       # --- CORE APLIKASI (ROUTING & COLOCATION) ---
│   ├── __root.tsx                # Setup Root: QueryClient, Error/NotFound UI, TopProgressBar[cite: 19]
│   ├── routeTree.gen.ts          # (Auto-generated) Tree routing TanStack Router[cite: 19]
│   │
│   ├── _guest.tsx                # AREA 1: Publik / Auth (Header Minimalis)[cite: 19]
│   ├── _guest/
│   │   ├── index.tsx             # Halaman Landing (/)[cite: 19]
│   │   ├── components/
│   │   │   └── AuthSplitLayout.tsx  # Layout split untuk form auth[cite: 19]
│   │   ├── login/
│   │   │   └── index.tsx         # Halaman Login (/login)[cite: 19]
│   │   └── register/
│   │       ├── index.tsx         # Halaman Register biasa (/register)[cite: 19]
│   │       ├── organization/
│   │       │   └── index.tsx     # Register untuk organisasi (/register/organization)[cite: 19]
│   │       └── invite/
│   │           └── $token/index.tsx # Register via undangan token[cite: 19]
│   │
│   ├── _dashboard.tsx            # AREA 2: B2B Workspace (Sidebar + Topbar)[cite: 19]
│   ├── _dashboard/               # Khusus HRD, Admin, & Manajemen
│   │   ├── dashboard/index.tsx   # Dashboard utama /overview[cite: 19]
│   │   ├── admin/index.tsx       # Halaman Super Admin Panel[cite: 19]
│   │   ├── members/              # Manajemen Anggota[cite: 19]
│   │   │   ├── index.tsx
│   │   │   └── invite/index.tsx
│   │   └── billing/index.tsx     # Manajemen langganan & pembayaran[cite: 19]
│   │
│   ├── _portal.tsx               # (BARU) AREA 3: B2C Participant Portal (PortalHeader Saja)
│   ├── _portal/                  # Khusus Kandidat/Peserta
│   │   ├── profile/index.tsx     # Pengaturan Profil
│   │   └── tests/
│   │       ├── index.tsx         # Katalog / Daftar tes tersedia
│   │       └── history/index.tsx # Riwayat hasil tes peserta
│   │
│   └── _exam.tsx                 # (BARU) AREA 4: Distraction-Free Exam Mode (ExamHeader Saja)
│   └── _exam/
│           └── $testId/index.tsx # Halaman Pengerjaan Soal (Layar Penuh/Fokus)
│
├── index.css                     # Konfigurasi CSS & Tailwind (Clinical-Modern Minimalist tokens)[cite: 19]
├── main.tsx                      # Entry point: Inisialisasi Router, QueryClient, i18n[cite: 19]
└── routeTree.gen.ts              # (Auto-generated) TanStack Router tree definition[cite: 19]
```

## Ringkasan Teknologi Utama

| Kategori             | Teknologi                              |
| -------------------- | -------------------------------------- |
| Framework            | React 19 + TypeScript                  |
| Build Tool           | Vite                                   |
| Routing              | TanStack Router (v1.99+)               |
| State Management     | TanStack Query (React Query)           |
| Styling              | Tailwind CSS                           |
| Internationalization | i18next                                |
| UI Components        | Custom (tidak pakai library eksternal) |

## Struktur Routing (Dualisme B2B2C)

Aplikasi ini menggunakan pendekatan **Dualisme Layout** untuk memisahkan pengalaman pengguna secara tegas:

- **`_guest`**: Area tak terautentikasi (Landing, Login, Register).

- **`_dashboard`**: Area Workspace B2B (HRD/Admin). Menggunakan layout kompleks dengan _Sidebar_ dan _Topbar_ untuk keperluan administrasi data yang padat.

- **`_portal`**: Area Portal B2C (Peserta/Kandidat). Menggunakan navigasi atas saja (_PortalHeader_) untuk menyajikan antarmuka yang bersih, luas, dan menenangkan sebelum tes.
- **`_exam`**: Area Pengerjaan Tes (_Distraction-Free_). Menghilangkan seluruh navigasi situs utama; hanya menampilkan indikator progres dan _timer_ untuk menjaga fokus 100% pada soal evaluasi psikologi.
- **Colocation**: Setiap fitur memiliki folder sendiri dengan file `index.tsx` beserta aset lokalnya untuk menjaga _codebase_ tetap terpisah dan termanajemen.

## Karakter Tema Visual

Mengadopsi tema **Clinical-Modern Minimalist** yang ditujukan untuk:

1. Memberikan impresi alat diagnostik yang valid dan ilmiah untuk klien B2B.
2. Mengurangi kecemasan (_test anxiety_) untuk peserta B2C dengan penggunaan palet _Teal/Slate_, latar _off-white_ yang nyaman di mata, tipografi netral (Plus Jakarta Sans), dan _whitespace_ yang luas.

## Catatan

- File `routeTree.gen.ts` dibuat otomatis oleh plugin TanStack Router Vite.

- Interaksi UI utama (seperti _dropdown_ dan _language switcher_) memanfaatkan manipulasi status HTML/CSS murni (_Checkbox Hack_) untuk kinerja optimal tanpa beban JavaScript berlebih.
