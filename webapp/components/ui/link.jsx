import NextLink from "next/link";
import { cn } from "@/lib/utils";

const Link = ({ className, ...props }) => {
  return (
    <NextLink
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  );
};

export { Link };
