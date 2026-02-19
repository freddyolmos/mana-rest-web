import { Stack } from "@mantine/core";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";

export default function SettingsPage() {
  return (
    <Stack>
      <PageHeader
        title="Ajustes"
        description="Configuración general del sistema."
      />
      <SectionCard>
        <EmptyState
          title="Sin configuraciones disponibles"
          description="Aquí se centralizarán parámetros operativos y preferencias."
        />
      </SectionCard>
    </Stack>
  );
}
