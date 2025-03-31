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
  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createWorkspaceFormSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    const { status, message } = await createWorkspace(data);
    switch (status) {
      case "success":
        toast.success(message);
        if (onSuccess) onSuccess();
        break;
      case "error":
        toast.error(message);
        break;
      default:
        break;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter workspace name here.." {...field} />
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
