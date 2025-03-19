"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus, BriefcaseBusiness } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateWorkspaceForm } from "../forms/create-workspace";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkspaceSwitcher = ({ workspaces }) => {
  const { isMobile } = useSidebar();
  const workspaceId = useWorkspaceId();
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const workspace = workspaces.find((workspace) => workspace._id === workspaceId);
    if (workspace) setActiveWorkspace(workspace);
  })

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog modal open={open} onOpenChange={setOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground rounded-lg">
                  {/* <activeWorkspace.logo className="size-4" /> */}
                  <BriefcaseBusiness className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeWorkspace.name}
                  </span>
                  <span className="truncate text-xs">
                    {activeWorkspace.plan}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((workspace, index) => (
                <DropdownMenuItem key={workspace._id} className="gap-2 p-2" asChild>
                  <Link href={`/workspace/${workspace._id}`} >
                    {workspace.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Plus className="size-4" />
                </div>
                <DialogTrigger>
                  Add workspace
                </DialogTrigger>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <CreateWorkspaceForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { WorkspaceSwitcher };
