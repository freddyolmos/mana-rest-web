import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function ReportsPage() {
  return (
    <Stack>
      <PageHeader
        title="Reportes"
        description="Análisis de ventas y comportamiento operativo."
      />
      <SectionCard>
        <EmptyState
          title="Sin datos seleccionados"
          description="Se agregarán filtros por rango de fechas y gráficos en la fase 2."
        />
      </SectionCard>
    </Stack>
  );
}
