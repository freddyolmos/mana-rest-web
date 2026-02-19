import { Paper, Stack, type PaperProps } from "@mantine/core";

type SectionCardProps = PaperProps & {
  children: React.ReactNode;
};

export function SectionCard({ children, ...props }: SectionCardProps) {
  return (
    <Paper withBorder radius="md" p="md" {...props}>
      <Stack gap="md">{children}</Stack>
    </Paper>
  );
}
