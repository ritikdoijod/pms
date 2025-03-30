import { AppSidebar } from "@/components/shared/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { api } from "@/configs/fc.config"

const Layout = async ({ children, params }) => {
  const { id } = await params;

  const { workspace: activeWorkspace } = await api.get(`/workspaces/${id}?${new URLSearchParams({ include: 'projects' }).toString()}`)
  const { workspaces } = await api.get('/workspaces/')

  return (
    <SidebarProvider>
      <AppSidebar activeWorkspace={activeWorkspace} workspaces={workspaces} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
