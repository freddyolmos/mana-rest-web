"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>No autorizado</Title>
        <Text c="dimmed">No tienes permisos para acceder a esta sección.</Text>
        <Button component={Link} href="/dashboard" variant="light">
          Volver al dashboard
        </Button>
      </Stack>
    </Container>
  );
}
