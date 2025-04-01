import { CreateProjectForm } from "@/components/forms/create-project";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/configs/fc.config";

const Page = async ({ params }) => {
  const { id } = await params;
  const { workspace } = await api.get(
    `/workspaces/${id}?${new URLSearchParams({
      include: "projects",
    }).toString()}`
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="px-2 flex items-center h-12 border-b">
        <div className="flex items-center">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <span>Dashboard</span>
        </div>
      </div>
      <div>
        <Dialog modal>
          {workspace?.projects?.length > 0 ? (
            <div className="flex-1 p-8">
              <div className="font-bold">
                <h2>Projects</h2>
              </div>
              <div className="flex gap-8 h-fit">
                {workspace.projects.map((project) => (
                  <Card key={project._id}>
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-8 flex justify-center">
              <DialogTrigger
                variant="ghost"
                className="h-[150px] w-lg flex items-center justify-center rounded-md border border-dashed"
              >
                Start by creating your first project
              </DialogTrigger>
            </div>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <CreateProjectForm workspace={id} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
