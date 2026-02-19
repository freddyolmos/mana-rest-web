import { Badge } from "@mantine/core";

type BadgeColor = "gray" | "green" | "blue" | "yellow" | "red";

const STATUS_STYLES: Record<string, { color: BadgeColor; label: string }> = {
  ACTIVE: { color: "green", label: "Activo" },
  INACTIVE: { color: "gray", label: "Inactivo" },
  OPEN: { color: "blue", label: "Abierto" },
  SENT_TO_KITCHEN: { color: "yellow", label: "En cocina" },
  READY: { color: "green", label: "Listo" },
  CLOSED: { color: "gray", label: "Cerrado" },
  CANCELED: { color: "red", label: "Cancelado" },
  PENDING: { color: "yellow", label: "Pendiente" },
  IN_PROGRESS: { color: "blue", label: "En progreso" },
  FREE: { color: "green", label: "Libre" },
  OCCUPIED: { color: "red", label: "Ocupada" },
  PAID: { color: "green", label: "Pagado" },
  CASH: { color: "green", label: "Efectivo" },
  CARD: { color: "blue", label: "Tarjeta" },
  TRANSFER: { color: "gray", label: "Transferencia" },
};

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const style = STATUS_STYLES[normalized] ?? {
    color: "gray",
    label: status,
  };
  return (
    <Badge color={style.color} variant="light">
      {style.label}
    </Badge>
  );
}
