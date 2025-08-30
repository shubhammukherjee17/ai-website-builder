import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login",
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full p-6 flex items-center justify-center">
      <LoginForm />
    </main>
  )
}
