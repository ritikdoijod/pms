import { Link, Form, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useForm, getInputProps, FormProvider } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

import { api } from "@/configs/fc.config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const schema = z
  .object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(3, { message: "Name must be at least 3 characters long" })
      .max(255, { message: "Name must be at most 255 characters long" }),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email address")
      .min(1)
      .max(255),
    password: z
      .string({ required_error: "Password is required" })
      .trim()
      .min(6)
      .max(255),
    confirmPassword: z.string({required_error: "Confirm Password is required"}).trim().max(255),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords must match!",
    path: ["confirmPassword"],
  });

export async function action({ request }) {
  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema });
    if (submission.status !== "success") {
      return json(submission.reply());
    }

    const { name, email, password, confirmPassword } = submission.value;

    const { user } = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });

    return redirect("/auth/login");
  } catch (error) {
    return json({ errors: error.details });
  }
}

export default function SignUp() {
  const navigation = useNavigation();
  const actionData = useActionData();

  const [form, fields] = useForm({
    actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome!!</CardTitle>
        <CardDescription>
          Please sign up to get started with PMS
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <FormProvider context={form.context}>
          <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
            <fieldset disabled={navigation.state === "submitting"}>
              <div className="grid gap-6">
                <FormField name={fields.name.name}>
                  <FormItem>
                    <FormLabel requiredStar>Name</FormLabel>
                    <FormControl autoComplete>
                      <Input type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name={fields.email.name}>
                  <FormItem>
                    <FormLabel requiredStar>Email</FormLabel>
                    <FormControl autoComplete>
                      <Input type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name={fields.password.name}>
                  <FormItem>
                    <FormLabel requiredStar>Password</FormLabel>
                    <FormControl>
                      <Input type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name={fields.confirmPassword.name}>
                  <FormItem>
                    <FormLabel requiredStar>Confirm Passwod</FormLabel>
                    <FormControl>
                      <Input type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                {navigation.state === "submitting" ? (
                  <Button disabled>
                    <Loader2 className="animate-spin" />
                    Signing up...
                  </Button>
                ) : (
                  <Button>Sign Up</Button>
                )}
              </div>
            </fieldset>
          </Form>
        </FormProvider>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?&nbsp;
        <Link href="/auth/login" className="text-foreground">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
