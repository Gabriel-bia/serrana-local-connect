import { ArrowLeft } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useDiscovery } from "@/components/DiscoveryProvider";

export function BackButton({ fallback = "/", className = "" }: { fallback?: "/" | "/lojas" | "/prestadores" | "/produtos" | "/categorias"; className?: string }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { canReturn } = useDiscovery();
  return <Button variant="outline" size="icon" className={`h-10 w-10 shrink-0 ${className}`} aria-label="Voltar" title="Voltar" onClick={() => {
    if (canReturn()) router.history.back();
    else void navigate({ to: fallback });
  }}><ArrowLeft /></Button>;
}