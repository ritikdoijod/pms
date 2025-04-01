"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { createProjectFormSchema } from "@/lib/validations/project";
import { createProject } from "@/actions/project";

const CreateProjectForm = ({ workspace, onSuccess }) => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createProjectFormSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    const { status, message } = await createProject({ ...data, workspace });
    switch (status) {
      case "success":
        toast.success(message);
        router.refresh();
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
                  <Input placeholder="Enter project name here..." {...field} />
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
            Create Project
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { CreateProjectForm };
