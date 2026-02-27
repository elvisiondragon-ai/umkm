# Report: UMKM Registration & Login Handoff Issue
**Date** : 27 February 2026
**Project** : UMKM eL Vision (`/umkm`)

## 1. Context & The Problem
Pendaftaran UMKM Store secara fundamental berhasil di level *Database* (backend). 
- Saat *user* mengisi dan mem-submit form di halaman `Mulai Buat`, data dengan sukses:
   1. Melakukan `supabase.auth.signUp()`.
   2. Tersimpan ke tabel `auth.users`.
   3. Tersimpan ke tabel `umkm_seller`.
   4. Tersimpan ke tabel `stores`.
   5. Tersimpan ke tabel `products`.

**THE BUG:** 
Walaupun seluruh alur pendaftaran berhasil dan *Supabase Session* sebenarnya sudah terbuat (berkat bypass `email_confirm: true`), frontend React (Vite) **GAGAL** memindahkan (redirect/handoff) *user* ke tampilan *Dashboard* secara *seamless*.
Alih-alih masuk ke dalam *state* login (`view="dashboard"`), UI me-reset dirinya sendiri dan menendang *user* kembali ke form awal atau halaman *Home* dengan *state* `user = null`.

## 2. Root Cause Analysis
Masalah ini adalah *State Management / Lifecycle Bug* murni di React (`src/pages/Index.tsx`):
1. **Silent UI Crash / Re-render Override:** 
   Saat `handleRegister` memanggil `setView("dashboard")`, ada satu *side-effect* (bisa jadi dari `window.scrollTo` atau kelakuan bawaan form) yang me-refresh state React, sehingga *value* default `view="home"` kembali ditimpa.
2. **Missing Hard Refresh:** 
   Auth Supabase menyimpan token di LocalStorage. Tetapi komponen React tidak nge-*re-render* ulang secara sempurna pasca pendaftaran yang cukup berat (multi-insert table) tanpa di-*force reload*.

## 3. How `Shopauto` Solves This (The Reference)
Project Shopauto (`elvisiongroup/src/pages/Auth.tsx`) menyelesaikan masalah kelakuan "nyangkut" ini dengan teknik ekstrim namun jitu: **Hard Reload**. 

Saat `signUp` sukses di Shopauto, kode mereka melakukan:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: signupData.email,
  password: signupData.password,
  options: {
    emailRedirectTo: redirectUrl,
    data: {
      email_confirm: true // Force status "Verified" tanpa cek email
    }
  }
});

// Shopauto's Frontend trick to force the dashboard state to work:
if (data.user) {
  localStorage.setItem('login-success-pending', 'true');
  window.location.reload(); // <--- INI KUNCINYA
}
```

## 4. Suggested Fix for the Next Developer
Di file `/umkm/src/pages/Index.tsx`, di dalam *function* `handleRegister()` pada blok akhir *success*:

```typescript
// GANTI BAGIAN INI:
alert("Toko Berhasil Dibuat! \n\nSilakan kelola toko Anda di Dashboard.");
setView("dashboard");
window.scrollTo(0, 0);

// MENJADI SEPERTI SHOPAUTO:
alert("Toko Berhasil Dibuat! \n\nSilakan kelola toko Anda di Dashboard.");
// Force browser untuk reload agar script authListener Supabase mem-baca LocalStorage token dengan bersih
window.location.reload(); 
```
Saat `window.location.reload()` dipanggil, fungsi `useEffect` berisi `supabase.auth.getSession()` yang baru ditambahkan tadi akan terbaca sempurna saat web menyala, dan ia otomatis akan memuat layar `view="dashboard"`.
