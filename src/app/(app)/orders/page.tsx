import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function OrdersPage() {
  return (
    <Stack>
      <PageHeader
        title="Órdenes"
        description="Seguimiento de órdenes y sus estados."
      />
      <SectionCard>
        <EmptyState
          title="Lista pendiente"
          description="Esta vista mostrará órdenes con filtros y acciones de flujo."
        />
      </SectionCard>
    </Stack>
  );
}
