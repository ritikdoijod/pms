import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  return (
    <div className="px-2 flex items-center h-12 border-b">
      <div className="flex items-center">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Projects</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Test</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export { Header };
