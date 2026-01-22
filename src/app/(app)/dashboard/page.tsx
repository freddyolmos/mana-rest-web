import { Title, Text, Stack } from "@mantine/core";

export default function DashboardPage() {
  return (
    <Stack>
      <Title order={2}>Dashboard</Title>
      <Text c="dimmed">Aquí van métricas rápidas (ventas, órdenes, etc.).</Text>
    </Stack>
  );
}
