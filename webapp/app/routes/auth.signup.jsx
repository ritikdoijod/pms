import { SignUpForm } from "@/components/forms/signup";

import { api } from "@/configs/fc.config";

export async function action({ request }) {
  const formData = await request.formData();
  const { name, email, password, confirmPassword } =
    Object.fromEntries(formData);

  const { token, user } = await api.post("/auth/register", {
    name,
    email,
    password,
    confirmPassword,
  });

  console.log(token, user);
}

export default function SignUp() {
  return <SignUpForm />
}
