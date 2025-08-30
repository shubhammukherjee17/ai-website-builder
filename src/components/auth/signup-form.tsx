"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function SignupForm() {
  const router = useRouter()
  const search = useSearchParams()
//   const { toast } = useToast()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const redirectAfter = React.useMemo(() => search.get("redirect") || "/", [search])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const emailRedirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        (typeof window !== "undefined" ? window.location.origin : undefined)

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      })

      if (error) {
        alert("Sign up failed");
        // toast({
        //   title: "Sign up failed",
        //   description: error.message,
        //   variant: "destructive",
        // })
        return
      }

      alert("Check your email");
    //   toast({
    //     title: "Check your email",
    //     description: "We sent you a confirmation link. After confirming, come back and sign in.",
    //   })
      router.push(`/auth/login`)
    } catch (err: any) {
        alert("Error Occured");
    //   toast({
    //     title: "Configuration error",
    //     description: err?.message || "Supabase is not configured yet.",
    //     variant: "destructive",
    //   })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-indigo-50 shadow-sm">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-semibold text-balance">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign up with your email and a password.</p>
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
