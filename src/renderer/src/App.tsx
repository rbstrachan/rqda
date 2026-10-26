import { AppShell } from "@/components/shell/app-shell";
import { ProjectStoreProvider } from "@/store/project-store";

export default function App() {
  return (
    <ProjectStoreProvider>
      <main className="min-h-screen bg-background text-foreground">
        <AppShell />
      </main>
    </ProjectStoreProvider>
  );
}
