import { AppSidebar } from "@/components/shared/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getWorkspaces, getWorkspaceWithProjects } from "@/lib/api/workspaces";

const Layout = async ({ children, params }) => {
  const { id } = await params;
  const activeWorkspace = await getWorkspaceWithProjects(id);

  if (!data?.workspace) return <div>Invalid Workspace</div>

  const workspaces = await getWorkspaces();

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
