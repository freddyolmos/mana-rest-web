import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function ProductsPage() {
  return (
    <Stack>
      <PageHeader
        title="Productos"
        description="Administración de productos del catálogo."
      />
      <SectionCard>
        <EmptyState
          title="Sin lista de productos"
          description="En la siguiente fase se implementa tabla con filtros y edición."
        />
      </SectionCard>
    </Stack>
  );
}
