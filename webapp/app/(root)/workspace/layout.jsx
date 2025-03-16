import { AppSidebar } from "@/components/shared/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/configs/fc.config";

const Layout = async ({ children }) => {
  const { data, error } = await api.get("/api/v1/workspaces");
  return (
    <SidebarProvider>
      <AppSidebar data={data} />
      <SidebarInset>
        <SidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
