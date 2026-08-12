import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { PatientChatbot } from "@/components/patient-chatbot";
import { HIPAAProvider } from "@/context/hipaa-context";
import { HIPAABadgeBar } from "@/components/hipaa/hipaa-badge-bar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HIPAAProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          <HIPAABadgeBar />
          <TopNav />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-muted/20">
            {children}
          </main>
        </div>
        <PatientChatbot />
      </SidebarProvider>
    </HIPAAProvider>
  );
}
