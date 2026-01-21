import { Button, Container, Stack, Title, Text } from '@mantine/core'

export default function HomePage() {
  return(
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={1}>Mana Restaurante</Title>
        <Text c="dimmed">
          Si ves este botón con estilo, Mantine ya quedó.
        </Text>
        <Button>Hola Mantine</Button>
      </Stack>
    </Container>
  );
}