"use client";

import {
  AppShell,
  Burger,
  Group,
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
  IconChartBar,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorSchemeToggle } from "./ColorSchemeToggle";

const navItems = [
  { label: "Dashboard", icon: IconLayoutDashboard, href: "/dashboard" },
  { label: "POS", icon: IconBuildingStore, href: "/pos" },
  { label: "Productos", icon: IconBurger, href: "/products" },
];

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();

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

          <Text c="dimmed" size="sm">
            Admin
          </Text>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

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
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
