import { Stack, Title, Text } from '@mantine/core';

export default function ReportsPage() {
  return (
    <Stack>
      <Title order={2}>Reportes</Title>
      <Text c="dimmed">Ventas por día, productos top, etc.</Text>
    </Stack>
  );
}
