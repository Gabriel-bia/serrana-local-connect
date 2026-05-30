import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/store";

export function WhatsAppButton({
  number,
  message,
  label = "Falar no WhatsApp",
  className = "",
}: {
  number: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-whatsapp)] px-4 py-3 font-semibold text-[var(--color-whatsapp-foreground)] shadow-[var(--shadow-card)] transition hover:opacity-90 ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
