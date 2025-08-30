import { EnhancedSignupForm } from "@/components/auth/enhanced-signup-form"

export const metadata = {
  title: "Sign up",
}

export default function SignupPage() {
  return (
    <main className="min-h-dvh w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <EnhancedSignupForm />
      </div>
    </main>
  )
}
