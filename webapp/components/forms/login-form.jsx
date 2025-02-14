import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn.mjs";

const LoginForm = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <Card.Header>
          <Card.Title>Welcome back</Card.Title>
          <Card.Description>Log in </Card.Description>
        </Card.Header>
        <Card.Content>
          <div>
            {" "}
            <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
              {" "}
              <svg className="h-6 w-6 stroke-white"> </svg>{" "}
            </span>{" "}
          </div>{" "}
          <h3 className="text-gray-900 dark:text-white mt-5 text-base font-medium tracking-tight ">
            Writes upside-down
          </h3>{" "}
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm ">
            {" "}
            The Zero Gravity Pen can be used to write in any orientation,
            including upside-down. It even works in outer space.{" "}
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

export { LoginForm };
