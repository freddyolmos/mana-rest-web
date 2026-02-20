export type Role = "ADMIN" | "CASHIER" | "KITCHEN";
export type NavIconKey =
  | "dashboard"
  | "pos"
  | "orders"
  | "kitchen"
  | "catalog"
  | "products"
  | "categories"
  | "reports"
  | "settings";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconKey;
  roles: Role[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Operación",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        roles: ["ADMIN", "CASHIER", "KITCHEN"],
      },
      {
        label: "POS",
        href: "/pos",
        icon: "pos",
        roles: ["ADMIN", "CASHIER"],
      },
      {
        label: "Órdenes",
        href: "/orders",
        icon: "orders",
        roles: ["ADMIN", "CASHIER", "KITCHEN"],
      },
      {
        label: "Cocina",
        href: "/kitchen",
        icon: "kitchen",
        roles: ["ADMIN", "KITCHEN"],
      },
    ],
  },
  {
    title: "Catálogo",
    items: [
      {
        label: "Catálogo",
        href: "/catalog",
        icon: "catalog",
        roles: ["ADMIN"],
      },
      {
        label: "Productos",
        href: "/products",
        icon: "products",
        roles: ["ADMIN"],
      },
      {
        label: "Categorías",
        href: "/categories",
        icon: "categories",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        label: "Reportes",
        href: "/reports",
        icon: "reports",
        roles: ["ADMIN", "CASHIER"],
      },
      {
        label: "Ajustes",
        href: "/settings",
        icon: "settings",
        roles: ["ADMIN"],
      },
    ],
  },
];

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function canAccessPath(pathname: string, role: Role) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathMatches(pathname, item.href)) {
        return item.roles.includes(role);
      }
    }
  }
  return true;
}

export function navForRole(role: Role) {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}
