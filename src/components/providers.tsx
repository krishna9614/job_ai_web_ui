"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/stores/auth-store";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          error instanceof ApiError && (error.isNetworkError || error.status >= 500) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const router = useRouter();
  const markSessionExpired = useAuthStore((s) => s.markSessionExpired);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      markSessionExpired();
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, markSessionExpired, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
