import { MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "@/lib/store";

export function WhatsAppButton({
  link,
  message,
  label = "Conversar no WhatsApp",
  className = "",
}: {
  /** Link completo do WhatsApp cadastrado pelo admin (https://wa.me/... ou https://api.whatsapp.com/...). */
  link: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={buildWhatsappLink(link, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-whatsapp)] px-4 py-3 font-semibold text-[var(--color-whatsapp-foreground)] shadow-[var(--shadow-card)] transition hover:opacity-90 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
