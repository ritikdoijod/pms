import { LoginForm } from "@/components/forms/login";

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gray-200 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
