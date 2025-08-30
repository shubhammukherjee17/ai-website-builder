import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign up",
}

export default function SignupPage() {
  return (
    <main className="min-h-dvh w-full p-6 flex items-center justify-center">
      <SignupForm />
    </main>
  )
}
