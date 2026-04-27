# Session Report: Supabase 401 Error Resolution in UMKM
Date: 2026-03-28

## Context
The user reported a 401 Unauthorized error when attempting to sign in with a password in the `umkm` folder. A new `SUPABASE_ANON_KEY` was provided.

## Issues
- Outdated Supabase assets in the `dist/` directory were likely causing the 401 error as they contained the old/revoked key.

## Solutions
- Verified `umkm/.env.local` already had the new key provided by the user.
- Updated `APP_VERSION` in `umkm/src/main.tsx` to `2026.03.28.02`.
- Executed `npm run build` to bake the new key into production assets.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets in Cloudflare Pages for the `umkm` project.
- Configured `wrangler.toml` and `_headers` as per Cloudflare deployment guidelines.
- Swapped `totor_all.mp4` (46.7 MB) for `tutor2.mp4` (18.1 MB) in `Index.tsx` to satisfy Cloudflare's 25 MiB per-file upload limit.
- Successfully deployed the `umkm` project to Cloudflare Pages via Wrangler CLI.

## Next Steps
- User should verify the fix in the browser.
