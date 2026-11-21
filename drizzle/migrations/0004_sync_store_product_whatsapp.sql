CREATE OR REPLACE FUNCTION public.sync_store_product_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET whatsapp = NEW.whatsapp
  WHERE store_id = NEW.id AND whatsapp IS DISTINCT FROM NEW.whatsapp;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_store_product_whatsapp() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER sync_store_product_whatsapp
AFTER UPDATE OF whatsapp ON public.stores
FOR EACH ROW
WHEN (OLD.whatsapp IS DISTINCT FROM NEW.whatsapp)
EXECUTE FUNCTION public.sync_store_product_whatsapp();