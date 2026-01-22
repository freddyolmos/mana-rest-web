"use client";

import { MantineProvider } from "@mantine/core";
import { cookieColorSchemeManager } from "./cookieColorSchemeManager";

const manager = cookieColorSchemeManager("mantine-color-scheme");

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="light" colorSchemeManager={manager}>
      {children}
    </MantineProvider>
  );
}
