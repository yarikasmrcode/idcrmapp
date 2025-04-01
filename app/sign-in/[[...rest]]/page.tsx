import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-lg p-6">
        <SignIn routing="path" path="/sign-in" />
      </div>
    </div>
  );
}
