-- CLEANUP SCRIPT for global_product (2026-03-09)
-- Purpose: Delete UNPAID records if a PAID record exists for the same email and product

-- 1. One-time Cleanup of existing data
DELETE FROM global_product a
USING global_product b
WHERE a.email = b.email
  AND a.product_name = b.product_name
  AND (a.status = 'UNPAID' OR a.status = 'pending')
  AND b.status = 'PAID'
  AND a.id <> b.id;

-- 2. Function to auto-delete UNPAID when a new PAID arrives
CREATE OR REPLACE FUNCTION public.cleanup_unpaid_global_product()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'PAID') THEN
        DELETE FROM public.global_product
        WHERE email = NEW.email
          AND product_name = NEW.product_name
          AND (status = 'UNPAID' OR status = 'pending')
          AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Trigger
DROP TRIGGER IF EXISTS tr_cleanup_unpaid_global_product ON public.global_product;
CREATE TRIGGER tr_cleanup_unpaid_global_product
AFTER INSERT OR UPDATE ON public.global_product
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_unpaid_global_product();
