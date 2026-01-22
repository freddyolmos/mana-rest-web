"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    document.cookie = "mana_session=; Path=/; Max-Age=0";
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
