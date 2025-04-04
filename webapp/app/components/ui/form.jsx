import * as React from "react";
import { useField } from "@conform-to/react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const FormFieldContext = React.createContext({});

const useFormField = () => {
  const context = React.useContext(FormFieldContext);
  const [meta, form] = useField(context.name);
  const { id, name, errors } = meta;

  return {
    id,
    name,
    errors,
    formId: form.id,
    descriptionId: `${id}-description`,
    messageId: `${id}-message`,
  };
};

function FormField({ name, ...props }) {
  return <FormFieldContext.Provider value={{ name }} {...props} />;
}

function FormItem({ children, className, ...props }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

function FormLabel({ children, className, requiredStar, ...props }) {
  const { id } = useFormField();

  return (
    <Label htmlFor={id} className={cn("gap-1", className)} {...props}>
      {children}
      {requiredStar && <span className="text-destructive">*</span>}
    </Label>
  );
}

function FormControl({autoComplete, ...props}) {
  const { id, name, errors, formId, descriptionId, messageId } =
    useFormField();

  return (
    <Slot
      id={id}
      name={name}
      form={formId}
      area-describedby={
        !errors
          ? `${descriptionId}`
          : `${descriptionId} ${messageId}`
      }
      aria-invalid={!!errors}
      autoComplete={autoComplete ? name : undefined}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }) {
  const field = useFormField();

  const { errors, formMessageId } = field;
  return errors ? (
    <p
      id={formMessageId}
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {errors}
    </p>
  ) : null;
}

export { FormField, FormItem, FormLabel, FormControl, FormMessage };
