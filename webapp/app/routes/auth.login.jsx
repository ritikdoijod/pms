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

const schema = z.object({
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
});

export async function action({ request }) {
  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema });
    if (submission.status !== "success") {
      return json(submission.reply());
    }

    const { email, password } = submission.value;

    const { token, user } = await api.post("/auth/login", {
      email,
      password,
    });

    console.log(token, user)

    return redirect("/");
  } catch (error) {
    console.log(error)
    return json({ errors: error.details });
  }
}

export default function Login() {
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
        <CardTitle className="text-xl">Welcome Back!!</CardTitle>
        <CardDescription>Please login to use PMS</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <FormProvider context={form.context}>
          <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
            <fieldset disabled={navigation.state === "submitting"}>
              <div className="grid gap-6">
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

                {navigation.state === "submitting" ? (
                  <Button disabled>
                    <Loader2 className="animate-spin" />
                    Logging in...
                  </Button>
                ) : (
                  <Button>Login</Button>
                )}
              </div>
            </fieldset>
          </Form>
        </FormProvider>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Don&apos;t have an account?&nbsp;
        <Link href="/auth/signup" className="text-foreground">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
