import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function KitchenPage() {
  return (
    <Stack>
      <PageHeader
        title="Cocina"
        description="Tablero KDS para avance de preparación."
      />
      <SectionCard>
        <EmptyState
          title="Sin órdenes en cocina"
          description="Aquí se mostrarán los ítems pendientes por preparar."
        />
      </SectionCard>
    </Stack>
  );
}
