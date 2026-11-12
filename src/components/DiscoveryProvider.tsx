import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useRouter } from "@tanstack/react-router";

const DiscoveryContext = createContext<{ seed: number | null; canReturn: () => boolean }>({ seed: null, canReturn: () => false });

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [seed, setSeed] = useState<number | null>(null);
  const router = useRouter();
  const location = useLocation();
  const visited = useRef(new Set<number>());
  useEffect(() => {
    setSeed(window.crypto.getRandomValues(new Uint32Array(1))[0]);
  }, []);
  useEffect(() => {
    const index = router.history.location.state.__TSR_index;
    if (typeof index === "number") visited.current.add(index);
  }, [location.href, router]);
  const canReturn = () => {
    const index = router.history.location.state.__TSR_index;
    return typeof index === "number" && visited.current.has(index - 1);
  };
  return <DiscoveryContext.Provider value={{ seed, canReturn }}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery() { return useContext(DiscoveryContext); }