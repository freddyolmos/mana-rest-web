import { AppShellLayout } from "@/components/AppShellLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
