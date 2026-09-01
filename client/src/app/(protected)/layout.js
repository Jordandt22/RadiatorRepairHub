import { AppSidebar } from "@/components/app-sidebar";
import ProtectedAuthGate from "@/components/auth/ProtectedAuthGate";
import ProtectedBreadcrumb from "@/components/layout/ProtectedBreadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function ProtectedLayout({ children }) {
  return (
    <ProtectedAuthGate>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="cursor-pointer rounded-md p-1 transition-colors duration-200 hover:bg-muted" />
              <ProtectedBreadcrumb />
            </div>
          </header>
          <div className="flex flex-1 flex-col min-w-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedAuthGate>
  );
}
