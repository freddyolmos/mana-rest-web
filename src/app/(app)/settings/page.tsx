import { Stack, Title, Text } from "@mantine/core";

export default function SettingsPage() {
  return (
    <Stack>
      <Title order={2}>Ajustes</Title>
      <Text c="dimmed">Configuraciones del sistema.</Text>
    </Stack>
  );
}
