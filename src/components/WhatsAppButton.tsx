import { MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "@/lib/store";
import { logWhatsappClick } from "@/lib/whatsapp-clicks";

export function WhatsAppButton({
  link,
  message,
  label = "Conversar no WhatsApp",
  className = "",
  storeId,
  storeName,
}: {
  /** Link completo do WhatsApp cadastrado pelo admin. */
  link: string;
  message?: string;
  label?: string;
  className?: string;
  /** Identificação da loja para registrar o clique. */
  storeId?: string;
  storeName?: string;
}) {
  const href = link ? buildWhatsappLink(link, message) : "#";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!link) {
      e.preventDefault();
      alert("Link de WhatsApp não cadastrado para esta loja.");
      return;
    }
    if (storeId && storeName) {
      logWhatsappClick({ storeId, storeName });
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-whatsapp)] px-4 py-3 font-semibold text-[var(--color-whatsapp-foreground)] shadow-[var(--shadow-card)] transition hover:opacity-90 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
