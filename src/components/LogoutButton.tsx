"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth/login");
  };

  return (
    <Tooltip label="Cerrar sesión">
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={logout}
        aria-label="Cerrar sesión"
      >
        <IconLogout size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
