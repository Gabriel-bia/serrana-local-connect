import { supabase } from "@/integrations/supabase/client";

/**
 * Registra um clique no botão de WhatsApp de forma assíncrona e
 * não bloqueante. Falhas são apenas logadas — nunca atrasam o
 * redirecionamento do usuário para o WhatsApp.
 */
export function logWhatsappClick(input: { storeId: string; storeName: string }) {
  if (!input.storeId || !input.storeName) return;
  try {
    void supabase
      .from("whatsapp_clicks")
      .insert({ store_id: input.storeId, store_name: input.storeName })
      .then(({ error }) => {
        if (error) console.warn("[whatsapp_clicks] insert failed", error.message);
      });
  } catch (err) {
    console.warn("[whatsapp_clicks] insert threw", err);
  }
}
