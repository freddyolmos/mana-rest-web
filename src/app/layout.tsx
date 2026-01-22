import "@mantine/core/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "Mana Restaurante",
  description: "Sistema web para restaurante",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
