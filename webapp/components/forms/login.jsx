"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { loginFormSchema } from "@/lib/validations/auth";
import { login } from "@/actions/auth";

const LoginForm = () => {
  const [formState, formAction] = React.useActionState(login, {
    status: "",
  });

  const formRef = React.useRef();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      ...(formState?.fields ?? {}),
    },
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back!!</CardTitle>
        <CardDescription>Login with your Google account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form>
          <Button type="submit" variant="outline" className="w-full space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 48 48"
            >
              <path
                fill="#fbc02d"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#e53935"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4caf50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1565c0"
                d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            <span>Login with Google account</span>
          </Button>
        </form>

        <div className="flex items-center justify-center gap-4 overflow-hidden">
          <Separator className="flex-grow" />
          <span className="text-sm text-nowrap">Or continue with</span>
          <Separator className="flex-grow" />
        </div>
        <Form {...form}>
          <form
            ref={formRef}
            action={formAction}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@mail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="cursor-pointer">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Don't have an account?&nbsp;
        <Link href="/auth/signup" className="text-foreground">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
};

export { LoginForm };
