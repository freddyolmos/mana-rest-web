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
  IconTags,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import { LogoutButton } from "./LogoutButton";

const navSections = [
  {
    title: "Operación",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
      { label: "POS", href: "/pos", icon: IconBuildingStore },
      { label: "Órdenes", href: "/orders", icon: IconReceipt },
      { label: "Cocina", href: "/kitchen", icon: IconChefHat },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { label: "Productos", href: "/products", icon: IconBurger },
      { label: "Categorías", href: "/categories", icon: IconTags },
    ],
  },
  {
    title: "Configuración",
    items: [{ label: "Ajustes", href: "/settings", icon: IconSettings }],
  },
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

          <Group gap="sm">
            <Text c="dimmed" size="sm">
              Admin
            </Text>
            <ColorSchemeToggle />
            <LogoutButton />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          {navSections.map((section) => (
            <div key={section.title}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="sm" mb={6}>
                {section.title}
              </Text>

              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
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
            </div>
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
