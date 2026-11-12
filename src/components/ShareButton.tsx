import { useState } from "react";
import { Share2, Copy, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ title, text, url, label = "Compartilhar" }: { title: string; text: string; url: string; label?: string }) {
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState(false);
  const content = text.includes(url) ? text : `${text}\n\n${url}`;
  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text.includes(url) ? text.replace(url, "").trim() : text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    setFallback((v) => !v);
  };
  return <div className="relative">
    <Button variant="outline" onClick={share} className="min-h-10 max-w-full"><Share2 />{label}</Button>
    {fallback && <div className="absolute bottom-full right-0 z-50 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-card)]">
      <Button asChild variant="ghost" className="w-full justify-start"><a href={`https://wa.me/?text=${encodeURIComponent(content)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
      <Button variant="ghost" className="w-full justify-start" onClick={async () => {
        try { await navigator.clipboard.writeText(content); setCopied(true); }
        catch { setManualCopy(true); }
      }}>{copied ? <Check /> : <Copy />}{copied ? "Copiado" : "Copiar"}</Button>
      {manualCopy && <textarea readOnly aria-label="Texto para compartilhar" value={content} onFocus={(e) => e.currentTarget.select()} className="mt-2 w-full rounded-md border border-input bg-background p-2 text-xs" />}
    </div>}
  </div>;
}