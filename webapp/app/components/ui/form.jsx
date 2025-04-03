import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function FormItem({ children, className, ...props }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function FormLabel({ children, className, requiredStar, ...props }) {
  return (
    <Label className={cn("gap-1", className)} {...props}>
      {children}
      {requiredStar && <span className="text-destructive">*</span>}
    </Label>
  );
}
