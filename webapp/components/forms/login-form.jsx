import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn.mjs";

import { BiLogoGoogle } from "react-icons/bi";

const LoginForm = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <Card.Header>
          <Card.Title>Welcome back</Card.Title>
          <Card.Description>Login with your google account</Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col items-center">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-4"
          >
            <BiLogoGoogle />
            Login with Google
          </Button>
          <Separator>Or continue with</Separator>
          <div className="w-full">
            <form className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  name="username"
                  id="username"
                  className="w-full"
                  placeholder="abc@mail.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  className="w-full"
                />
              </div>
              <Button type="submit">Login</Button>
            </form>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export { LoginForm };
