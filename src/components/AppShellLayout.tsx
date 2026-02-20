"use client";

import {
  AppShell,
  Badge,
  Burger,
  Group,
  Loader,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconBuildingStore,
  IconBurger,
  IconReceipt,
  IconChefHat,
  IconTags,
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import { LogoutButton } from "./LogoutButton";
import { navForRole, type Role } from "@/lib/rbac";

type Me = {
  userId: number;
  email: string;
  role: Role;
};

const iconByName = {
  dashboard: IconLayoutDashboard,
  pos: IconBuildingStore,
  catalog: IconTags,
  products: IconBurger,
  orders: IconReceipt,
  kitchen: IconChefHat,
  categories: IconTags,
  reports: IconChartBar,
  settings: IconSettings,
} as const;

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          setMe((await res.json()) as Me);
        }
      } finally {
        setLoadingMe(false);
      }
    })();
  }, []);

  const role: Role = me?.role ?? "CASHIER";
  const sections = useMemo(() => navForRole(role), [role]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700}>Mana Restaurante</Text>
          </Group>

          <Group gap="sm">
            {loadingMe ? (
              <Loader size="xs" />
            ) : (
              <Group gap={6}>
                <Text c="dimmed" size="sm">
                  {me?.email ?? "Usuario"}
                </Text>
                <Badge variant="light">{role}</Badge>
              </Group>
            )}
            <ColorSchemeToggle />
            <LogoutButton />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          {sections.map((section) => (
            <div key={section.title}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="sm" mb={6}>
                {section.title}
              </Text>

              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = iconByName[item.icon];

                return (
                  <NavLink
                    key={item.href}
                    component={Link}
                    href={item.href}
                    label={item.label}
                    leftSection={<Icon size={18} />}
                    active={active}
                    onClick={close}
                  />
                );
              })}
            </div>
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
