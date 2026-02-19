import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function DashboardPage() {
  return (
    <Stack>
      <PageHeader
        title="Dashboard"
        description="Resumen operativo del día."
      />
      <SectionCard>
        <EmptyState
          title="Sin métricas aún"
          description="En la siguiente fase se incorporan indicadores y reportes rápidos."
        />
      </SectionCard>
    </Stack>
  );
}
