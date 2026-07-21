# Arsitektur @psych-web

```Plaintext
src/
├── assets/                       # Gambar, logo SVG, font
│
├── components/                   # --- KOMPONEN VISUAL GLOBAL ---
│   ├── layout/                   # Komponen pembungkus
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── GuestHeader.tsx
│   └── ui/                       # Komponen dasar (Atom)
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
│
├── constants/                    # --- KONFIGURASI GLOBAL ---
│   └── index.ts                  # Konstanta ROLE, opsi pagination, URL dasar
│
├── hooks/                        # --- HOOKS GLOBAL ---
│   ├── useAuth.ts                # Wrapper praktis untuk panggil cache ["userProfile"]
│   └── useDebounce.ts
│
├── types/                        # --- TYPESCRIPT DEFINITIONS GLOBAL ---
│   ├── index.ts                  # Export semua tipe (Barrel file)
│   └── api.ts                    # Type ApiResponse, PaginationMeta
│
├── utils/                        # --- HELPER GLOBAL ---
│   ├── api.ts                    # Fungsi apiFetch (gatekeeper HTTP)
│   ├── cn.ts                     # (Opsional) Class-merger untuk Tailwind
│   └── formatter.ts              # Format tanggal/uang
│
├── routes/                       # --- CORE APLIKASI (ROUTING & COLOCATION) ---
│   ├── __root.tsx                # Setup QueryProvider, RouterProvider, Global UI
│   │
│   ├── _guest.tsx                # LAYOUT: Area Publik (Hanya Header Tipis)
│   ├── _guest/
│   │   ├── index.tsx             # Halaman Landing (/ )
│   │   ├── login/
│   │   │   ├── -components/      # UI khusus login (Form)
│   │   │   ├── -types/           # Halaman type
│   │   │   ├── -hooks/           # Logika validasi form login
│   │   │   └── index.tsx         # Halaman Login (/login)
│   │   └── register/
│   │       ├── -components/
│   │       └── index.tsx         # Halaman Register (/register)
│   │
│   ├── _dashboard.tsx            # LAYOUT: Area Auth (Sidebar + Navbar Dinamis)
│   ├── _dashboard/
│   │   ├── index.tsx             # Halaman utama /overview (/dashboard)
│   │   ├── tests/
│   │   │   ├── -api/             # fetchTests(), submitTest()
│   │   │   ├── -components/      # TestCard.tsx, TimerUI.tsx
│   │   │   ├── -types/           # Tipe data khusus soal tes (jika tidak dipakai di luar)
│   │   │   ├── index.tsx         # Daftar Tes (/tests)
│   │   │   └── $testId.tsx       # Detail/Kerjakan Tes (/tests/123)
│   │   │
│   │   ├── members/              # (B2B: Untuk Organisasi)
│   │   │   ├── -api/
│   │   │   ├── -components/
│   │   │   └── index.tsx         # Halaman Anggota (/members)
│   │   │
│   │   └── billing/              # Manajemen Langganan & Referral
│   │       └── index.tsx         # (/billing)
│   │
│   └── -types.ts                 # (Diabaikan router) Tipe khusus routing jika butuh
│
├── index.css                     # Konfigurasi CSS & Tailwind
├── main.tsx                      # Entry point React
└── routeTree.gen.ts              # Dibuat otomatis oleh Vite
```
