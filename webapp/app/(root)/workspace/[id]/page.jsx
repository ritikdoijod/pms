import { CreateProjectForm } from "@/components/forms/create-project";
import { Header } from "@/components/shared/header";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/configs/fc.config"

const Page = async ({ params }) => {
  const { id } = await params;
  const { workspace } = await api.get(`/workspaces/${id}?${new URLSearchParams({ include: 'projects' }).toString()}`)

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-8 flex justify-center">

        <Dialog modal>
          {
            workspace?.projects?.length > 0 ?
              (
                <div>

                </div>
              ) : (
                <div>
                  <DialogTrigger variant="ghost" className="h-[150px] w-lg flex items-center justify-center rounded-md border border-dashed">
                    Start by creating your first project
                  </DialogTrigger>
                </div>
              )
          }
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
