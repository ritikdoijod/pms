import * as React from "react";
import { useField } from "@conform-to/react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const FormFieldContext = React.createContext({});

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);

  return useField(fieldContext.name);
};

function FormField({ name, ...props }) {
  return <FormFieldContext.Provider value={{ name }} {...props} />;
}

function FormItem({ children, className, ...props }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

function FormLabel({ children, className, requiredStar, ...props }) {
  return (
    <Label className={cn("gap-1", className)} {...props}>
      {children}
      {requiredStar && <span className="text-destructive">*</span>}
    </Label>
  );
}

function FormMessage({ className, ...props }) {
  const [{id, errors}] = useFormField();
  
  return errors ? (
    <p
      id={`${id}-form-item-message`}
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {errors}
    </p>
  ) : null;
}

export { FormField, FormItem, FormLabel, FormMessage, useFormField };
