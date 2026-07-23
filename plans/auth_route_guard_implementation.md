# Plan: Auth Routing & Post-Login Redirect (Minimalist Approach)

**Tanggal:** 2026-07-22  
**Status:** Revised - Minimalist Approach  
**Prioritas:** Tinggi

---

## 🎯 Tujuan

Implementasi auth routing dengan pendekatan **minimalis**: setelah login, user diarahkan berdasarkan apakah mereka terlibat dalam organisasi atau tidak.

**Prinsip:**

- ✅ Simple: Hanya 1 pertanyaan → "Apakah user punya organizationId?"
- ✅ Maintainable: Sedikit code, mudah dipahami
- ✅ Flexible: Route guards bisa ditambahkan nanti jika diperlukan

---

## 📋 Model Data Backend (User Entity)

```typescript
interface User {
  // Basic Info
  email: string;
  fullName: string;
  profilePicture: string | null;

  // === KEY FIELD UNTUK ROUTING ===
  accountType: "INDIVIDUAL" | "ORGANIZATION";
  organizationId: string | null; // ← Ini yang menentukan redirect!
  organizationRole: "owner" | "admin" | "member" | null;
  roles: string[]; // ["USER"] atau ["ORGANIZATION"]

  // Other fields (tidak digunakan untuk routing saat ini)
  subscriptionTier: "free" | "premium" | "enterprise";
  status: "active" | "inactive" | "suspended";
  // ... dll
}
```

---

## 🔄 Flow Post-Login Redirect

```mermaid
flowchart TD
    A[Login Success] --> B[Fetch User Profile]
    B --> C{Punya organizationId?}
    C -->|YA| D[/dashboard B2B Workspace]
    C -->|TIDAK| E[/tests B2C Portal]
    D --> F[User bisa akses manual URLs]
    E --> F
```

### Decision Matrix

| Condition                    | organizationId | Redirect To  | Area          |
| ---------------------------- | -------------- | ------------ | ------------- |
| User INDIVIDUAL              | `null`         | `/tests`     | B2C Portal    |
| User ORGANIZATION (no org)   | `null`         | `/tests`     | B2C Portal    |
| User ORGANIZATION (with org) | `"uuid"`       | `/dashboard` | B2B Workspace |

---

## 📝 Implementation Plan

### Fase 1: Utility Function (Optional)

**File:** `src/utils/auth.ts`

Tambah 1 fungsi helper sederhana:

```typescript
/**
 * Tentukan redirect path setelah login berdasarkan organization involvement
 * @param user - User object dari API response
 * @returns Path untuk redirect
 */
export function getPostLoginRedirect(user: User | null | undefined): string {
  if (!user) return "/login";

  // Simple check: apakah user terlibat organisasi?
  return user.organizationId ? "/dashboard" : "/tests";
}
```

**Status:** Optional - bisa langsung inline di login component

---

### Fase 2: Update Login Redirect

**File:** `src/routes/_guest/login/index.tsx`

**Sebelum:**

```typescript
const loginMutation = useMutation({
  onSuccess: () => {
    router.invalidate().then(() => {
      router.navigate({ to: "/dashboard" }); // ❌ Hardcoded!
    });
  },
});
```

**Sesudah:**

```typescript
const loginMutation = useMutation({
  onSuccess: async () => {
    await router.invalidate();

    try {
      const userProfile = await queryClient.fetchQuery({
        queryKey: ["userProfile"],
        queryFn: () => api<User>("/api/v1/auth/me"),
      });

      const user = userProfile.data;

      // ✅ Simple check: organization involvement
      const redirectPath = user?.organizationId ? "/dashboard" : "/tests";
      router.navigate({ to: redirectPath as any });
    } catch (error) {
      // Fallback ke login jika gagal fetch user
      router.navigate({ to: "/login" });
    }
  },
});
```

---

### Fase 3: Register Flow (No Change Needed)

**Files:**

- `src/routes/_guest/register/index.tsx`
- `src/routes/_guest/register/organization/index.tsx`
- `src/routes/_guest/register/invite/$token/index.tsx`

**Status:** ✅ Sudah benar - semua redirect ke `/login` setelah registrasi sukses

---

## 🔐 Security Notes

### Client-Side Redirect ≠ Security

> ⚠️ **Penting:** Redirect di frontend adalah untuk **UX improvement**, bukan security.

**Backend tetap harus validasi:**

- Session token validity
- Organization access untuk B2B features
- Test eligibility untuk exam

### Kapan Perlu Route Guards?

Tambahkan route guards nanti jika:

1. Ada requirement untuk **mencegah akses manual** ke URL tertentu
2. Ada **multi-tenant security** yang ketat
3. Ada **compliance requirement** untuk role-based access

---

## 🧪 Testing Checklist

### Post-Login Redirect

| No  | Scenario               | User Type    | organizationId | Expected Redirect   |
| --- | ---------------------- | ------------ | -------------- | ------------------- |
| 1   | Login sukses           | INDIVIDUAL   | `null`         | `/tests`            |
| 2   | Login sukses           | ORGANIZATION | `null`         | `/tests`            |
| 3   | Login sukses           | ORGANIZATION | `"uuid"`       | `/dashboard`        |
| 4   | Login gagal fetch user | Any          | N/A            | `/login` (fallback) |

### Register Flow

| No  | Scenario                     | Expected Redirect |
| --- | ---------------------------- | ----------------- |
| 1   | Register INDIVIDUAL sukses   | `/login`          |
| 2   | Register ORGANIZATION sukses | `/login`          |
| 3   | Register invite sukses       | `/login`          |

---

## 📦 Files yang Perlu Diubah

| File                                                 | Change                                | Status   |
| ---------------------------------------------------- | ------------------------------------- | -------- |
| `src/utils/auth.ts`                                  | Add `getPostLoginRedirect()` function | Optional |
| `src/routes/_guest/login/index.tsx`                  | Update `onSuccess` redirect logic     | Required |
| `src/routes/_guest/register/index.tsx`               | No change needed                      | ✅       |
| `src/routes/_guest/register/organization/index.tsx`  | No change needed                      | ✅       |
| `src/routes/_guest/register/invite/$token/index.tsx` | No change needed                      | ✅       |

---

## ✅ Definition of Done

- [ ] Fungsi `getPostLoginRedirect()` ditambahkan ke `src/utils/auth.ts` (optional)
- [ ] Login redirect logic diupdate untuk cek `organizationId`
- [ ] Test: User INDIVIDUAL login → redirect ke `/tests`
- [ ] Test: User ORGANIZATION tanpa org → redirect ke `/tests`
- [ ] Test: User ORGANIZATION dengan org → redirect ke `/dashboard`
- [ ] Register flow tetap berfungsi normal (redirect ke `/login`)

---

## 🔮 Future Enhancements (Optional)

Jika nanti perlu route guards:

1. **`src/routes/_dashboard.tsx`** - Guard untuk B2B Workspace
   - Validasi `organizationId` ada
   - Validasi `organizationRole` untuk sub-routes

2. **`src/routes/_portal.tsx`** - Guard untuk B2C Portal
   - Validasi user INDIVIDUAL
   - Clean, distraction-free layout

3. **`src/routes/_exam.tsx`** - Guard untuk Exam Mode
   - Validasi test eligibility
   - Distraction-free fullscreen layout

---

## 📚 Related Documents

- [`plans/arsitektur_project.md`](arsitektur_project.md) - Arsitektur routing dualisme B2B2C
- [`src/types/user.ts`](../src/types/user.ts) - User interface definition
- [`src/utils/auth.ts`](../src/utils/auth.ts) - Auth utility functions
