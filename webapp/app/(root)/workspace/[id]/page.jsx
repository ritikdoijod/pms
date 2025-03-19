import { Header } from "@/components/shared/header";
const Page = async () => {

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-8 flex justify-center">
        {/* {workspace?.projects?.length > 0 ? null : ( */}
        {/*   <div className="h-[150px] w-lg flex items-center justify-center rounded-md border border-dashed">Start by creating your first project</div> */}
        {/* )} */}
      </div>
    </div>
  );
};

export default Page;
