import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function PosPage() {
  return (
    <Stack>
      <PageHeader
        title="POS"
        description="Punto de venta para crear órdenes rápidamente."
      />
      <SectionCard>
        <EmptyState
          title="POS en preparación"
          description="La siguiente fase conectará menú, carrito y envío a cocina."
        />
      </SectionCard>
    </Stack>
  );
}
