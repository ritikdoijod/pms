import { SignUpForm } from "@/components/forms/signup";

import { api } from "@/configs/fc.config";

export async function action({ request }) {
  try {
    
    const formData = await request.formData();
    const { name, email, password, confirmPassword } =
      Object.fromEntries(formData);

    const { user } = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });

    return { user };
  } catch (error) {
    return { error };
  }
}

export default function SignUp() {
  return <SignUpForm />;
}
