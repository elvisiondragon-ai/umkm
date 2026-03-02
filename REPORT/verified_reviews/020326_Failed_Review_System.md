# Report: Verified Review System & Order History Disconnect
**Date**: 2 March 2026
**Topic**: `verified_reviews`

## 1. The Goal
The user wanted a "Verified Review" system where buyers can only leave a review if they have an authentic purchase history. We evolved this from a manual WA check to an automatic Email-based check (`customer_email`).
Additionally, the user requested a "Riwayat Pembelian" (Purchase History) section on the Seller Dashboard with a "Tulis Review" button so they (as a buyer/tester) can quickly jump to the store and leave a review.

## 2. What Was Implemented
1. **Database schema (`stores_orders`)**: Added `customer_email` column.
2. **Database schema (`stores_reviews`)**: Added `order_id` (BIGINT) and `product_id` to link reviews to strict orders.
3. **Frontend (`Index.tsx`)**:
   - Updated the `orderForm` to capture `email`.
   - Updated the "Pesan via WhatsApp" button to directly insert into `stores_orders` (to guarantee `customer_email` is passed, bypassing old Edge Function logic).
   - Added `customer_email` to the payload for the `capi-stores` Edge Function.
   - Added an automatic `useEffect` in the review section to verify `customer_email` against the `stores_orders` table.
4. **Backend (`functions/capi-stores.ts`)**:
   - Stripped the DB insert logic out so it only acts as a Meta CAPI proxy, preventing duplicate inserts or `null` email overrides. (Wait, later I restored it using `SERVICE_ROLE` because the frontend was getting RLS blocked).
   
## 3. The Current Bug (The "Disconnect")
The user provided actual DB output confirming an order WAS successfully inserted with the correct email:
```json
[{"idx":8,"id":15,"store_id":"3fa49245-e1a2-4e27-8851-7d4df63f1fcd","customer":"gurem (081212312312)","items":"1x Paket gurame","total_amount":"45000","status":"baru","date":"2 Maret 2026","created_at":"2026-03-02 20:47:38.357075+07","customer_email":"soto@yahoo.com"}]
```
**HOWEVER**, in the React UI (Dashboard "Riwayat Pembelian Lengkap"), this order (`id: 15`) **DOES NOT SHOW UP**. Instead, the user sees older orders (`#7 Belanja`, `#4 Renata`, etc.).

## 4. Root Cause Analysis (Why isn't it showing in the UI?)
If the database definitively holds `id: 15` for `store_id: 3fa49245-e1a2-4e27-8851-7d4df63f1fcd`, but `fetchStoreData` (which populates the Dashboard's `orders` array) doesn't retrieve it, the reasons are narrowed down to:

1. **Store ID Mismatch:** The user might be logged in as `soto@yahoo.com` and fetching Dashboard data for a store, but the `activeStore.id` loaded by the Dashboard does not match `3fa49245...`. If a user owns multiple stores (e.g., due to migration glitches or tests), `fetchStoreData` grabs the *first* store (`.limit(1)`). If the order was placed on their *second* store's live link, the dashboard won't show it.
2. **State Override/Mock Data:** We have hardcoded logic for `soto@yahoo.com` in `Index.tsx` to show mock stats (e.g., `user?.email === 'soto@yahoo.com'`). While `orders` is dynamically mapped, it's possible a mock data assignment is overriding the state, or the `fetchStoreData` is silently failing/aborting for this specific user.
3. **Realtime Sync Failure:** If the order was inserted purely by the Edge Function (using Service Role) because Frontend RLS failed, the Realtime listener in the frontend might not have triggered properly if the user was on a different view, and a manual refresh didn't re-trigger a clean fetch.

## 5. Next Steps for Resolution
To the AI taking over:
- Do not blindly rewrite the insert logic. The data IS successfully reaching Supabase.
- Focus on `fetchStoreData` in `src/pages/Index.tsx`. Track exactly which `store_id` is being queried when `soto@yahoo.com` opens the dashboard.
- Verify if `soto@yahoo.com` has multiple rows in the `stores` table.
- Consider creating a true "Riwayat Pesanan Saya (My Purchases)" view for the Buyer, rather than forcing the Seller Dashboard to act as a Buyer's purchase history list. The user is buying items, so they expect to see a list of things *they bought* based on their email, not necessarily things *their store sold*.
