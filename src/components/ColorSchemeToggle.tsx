"use client";

import { ActionIcon, useMantineColorScheme, Tooltip } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const isDark = colorScheme === "dark";

  return (
    <Tooltip label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={() => setColorScheme(isDark ? "light" : "dark")}
        aria-label="Cambiar tema"
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
