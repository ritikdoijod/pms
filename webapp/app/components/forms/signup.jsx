import { Link, Form } from "@remix-run/react";

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
import { FormItem, FormLabel } from "@/components/ui/form";


function SignUpForm() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome!!</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form method="post">
          <div className="grid gap-6">
            <FormItem>
              <FormLabel htmlFor="name" className="gap-1" requiredStar>
                Name
              </FormLabel>
              <Input name="name" autoComplete="name" />
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="email" className="gap-1" requiredStar>
                Email
              </FormLabel>
              <Input type="email" name="email" autoComplete="email" />
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="password" className="gap-1" requiredStar>
                Password
              </FormLabel>
              <Input type="password" name="password" />
            </FormItem>

            <FormItem>
              <FormLabel
                htmlFor="confirmPassword"
                className="gap-1"
                requiredStar
              >
                Confirm Password
              </FormLabel>
              <Input type="password" name="confirmPassword" />
            </FormItem>

            <Button>Sign Up</Button>
          </div>
        </Form>
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

export { SignUpForm };
