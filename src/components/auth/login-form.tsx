"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
//   const { toast } = useToast()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const redirectTo = React.useMemo(() => search.get("redirect") || "/", [search])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert("Sign In Failed");
        // toast({
        //   title: "Sign in failed",
        //   description: error.message,
        //   variant: "destructive",
        // })
        return
      }
      alert("Signed In");
    //   toast({ title: "Signed in", description: "Welcome back!" })
      router.push(redirectTo)
      router.refresh()
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
    <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-sm">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-semibold text-balance">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your email and password.</p>
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
              autoComplete="current-password"
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
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
