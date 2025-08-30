import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form"

export const metadata = {
  title: "Login",
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <EnhancedLoginForm />
      </div>
    </main>
  )
}
