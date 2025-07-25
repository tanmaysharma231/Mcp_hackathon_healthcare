import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm shadow-soft sticky top-0 z-40">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-wellness bg-clip-text text-transparent">
                    GlucoGuide Agent
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Chat-based Blood Sugar Monitoring
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card/50 p-4">
            <div className="text-center text-sm text-muted-foreground">
              © 2025 GlucoGuide. Built with AWS + Bedrock
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}