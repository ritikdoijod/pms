"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspaceFormSchema } from "@/lib/validations/workspace";
import { createWorkspace } from "@/actions/workspace";

const CreateWorkspaceForm = ({ onSuccess }) => {
  const [formState, formAction] = React.useActionState(createWorkspace, {
    status: "",
  });

  const formRef = React.useRef();

  const form = useForm({
    defaultValues: {
      name: "",
      ...(formState?.fields ?? {}),
    },
    resolver: zodResolver(createWorkspaceFormSchema),
    mode: "onSubmit",
  });

  const [, startTransition] = React.useTransition();

  const onSubmit = React.useCallback(async () => {
    startTransition(() => {
      formAction(new FormData(formRef.current));
    });
  }, [formAction]);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      if (formState) {
        switch (formState.status) {
          case "success":
            toast.success(formState.message);
            if (onSuccess) onSuccess();
            break;
          case "error":
            toast.error(formState.message);
            formState.errors?.map((error) =>
              form.setError(error.field, {
                type: "server",
                message: error.message,
              }),
            );
            break;
          default:
            break;
        }
      }
    });
  }, [formState]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter workspace name here.."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="cursor-pointer">
            Create Workspace
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { CreateWorkspaceForm };
