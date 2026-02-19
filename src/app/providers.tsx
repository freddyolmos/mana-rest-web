"use client";

import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { cookieColorSchemeManager } from "./cookieColorSchemeManager";

const manager = cookieColorSchemeManager("mantine-color-scheme");

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 15_000,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="light" colorSchemeManager={manager}>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
