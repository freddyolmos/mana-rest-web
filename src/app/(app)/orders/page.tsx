import { Stack, Title, Text } from "@mantine/core";

export default function OrdersPage() {
  return (
    <Stack>
      <Title order={2}>Órdenes</Title>
      <Text c="dimmed">Lista de órdenes, estados, filtros, etc.</Text>
    </Stack>
  );
}
