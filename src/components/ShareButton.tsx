import { useState } from "react";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

async function fetchShareFile(imageUrl: string): Promise<File | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;
    const extension = blob.type.split("/")[1]?.split(";")[0] || "jpg";
    return new File([blob], `produto.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
}

export function ShareButton({
  title,
  text,
  url,
  label = "Compartilhar",
  imageUrl,
  variant = "default",
  onClick,
}: {
  title: string;
  text: string;
  url: string;
  label?: string;
  /** Foto enviada junto ao link quando o compartilhamento nativo aceita arquivos. */
  imageUrl?: string;
  /** "icon" renderiza só o ícone, para uso dentro de cards. */
  variant?: "default" | "icon";
  onClick?: (e: React.MouseEvent) => void;
}) {
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState(false);
  const content = text.includes(url) ? text : `${text}\n\n${url}`;
  const fallbackContent = imageUrl?.startsWith("https://") ? `${content}\n\nFoto:\n${imageUrl}` : content;
  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        if (imageUrl) {
          const file = await fetchShareFile(imageUrl);
          if (file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
            await navigator.share({ title, text: content, files: [file] });
            return;
          }
        }
        await navigator.share({ title, text: text.includes(url) ? text.replace(url, "").trim() : text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    setFallback((v) => !v);
  };
  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) void share();
        }}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:text-foreground"
        aria-label={label}
        aria-expanded={fallback}
      >
        <Share2 className="h-4 w-4" />
      </button>
    ) : (
      <Button variant="outline" onClick={share} className="min-h-10 max-w-full" aria-expanded={fallback}>
        <Share2 />
        {label}
      </Button>
    );
  return (
    <Popover open={fallback} onOpenChange={setFallback}>
      <PopoverAnchor asChild>{trigger}</PopoverAnchor>
      <PopoverContent side="top" align="end" collisionPadding={16} className="w-64 max-w-[calc(100vw-2rem)] p-3 shadow-[var(--shadow-card)]">
        <Button asChild variant="ghost" className="w-full justify-start">
          <a href={`https://wa.me/?text=${encodeURIComponent(fallbackContent)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle />
            WhatsApp
          </a>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(fallbackContent);
              setCopied(true);
            } catch {
              setManualCopy(true);
            }
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        {manualCopy && (
          <textarea
            readOnly
            aria-label="Texto para compartilhar"
            value={fallbackContent}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 w-full rounded-md border border-input bg-background p-2 text-xs"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
