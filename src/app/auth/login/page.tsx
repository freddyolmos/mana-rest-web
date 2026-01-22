"use client";

import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
} from "@mantine/core";

function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) => (value.length >= 6 ? null : "Mínimo 6 caracteres"),
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setCookie("mana_session", "1", 7);

    router.replace("/dashboard");
  });

  return (
    <Container size={420} my={60}>
      <Title ta="center" fw={800}>
        Iniciar sesión
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Accede al sistema del restaurante
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md" mt="xl">
        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="admin@mana.com"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña"
              {...form.getInputProps("password")}
            />

            <Button type="submit" fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
