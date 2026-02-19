import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon = <IconInbox size={18} />,
}: EmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap={6}>
        <ThemeIcon size={40} radius="xl" variant="light" color="gray">
          {icon}
        </ThemeIcon>
        <Text fw={600}>{title}</Text>
        {description ? (
          <Text c="dimmed" size="sm" ta="center">
            {description}
          </Text>
        ) : null}
      </Stack>
    </Center>
  );
}
