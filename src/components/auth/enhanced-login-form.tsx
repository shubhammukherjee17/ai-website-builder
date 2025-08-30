"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useScreenSize, isTouchDevice } from '@/utils/responsive'

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function EnhancedLoginForm() {
  const router = useRouter()
  const screenSize = useScreenSize()
  const isTouch = isTouchDevice()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  const [rememberMe, setRememberMe] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    return null
  }

  const validateForm = () => {
    const newErrors: ValidationErrors = {}
    
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (errors.email) {
      const error = validateEmail(value)
      setErrors(prev => ({ ...prev, email: error || undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (errors.password) {
      const error = validatePassword(value)
      setErrors(prev => ({ ...prev, password: error || undefined }))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      })
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please confirm your email address before signing in.' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      setSuccess(true)
      // Small delay to show success state
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setErrors({ 
        general: 'Unable to connect to authentication service. Please check your internet connection and try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Responsive classes
  const getResponsiveClasses = () => ({
    container: `w-full max-w-md mx-auto rounded-lg border bg-white shadow-lg transition-all duration-300 ${
      isTouch ? 'min-h-[500px]' : ''
    }`,
    input: `w-full rounded-md border transition-all duration-200 outline-none ${
      isTouch ? 'h-12 px-4 text-base' : 'h-10 px-3 text-sm'
    } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`,
    button: `w-full rounded-md font-medium transition-all duration-200 ${
      isTouch ? 'h-12 text-base' : 'h-10 text-sm'
    } focus:outline-none focus:ring-2 focus:ring-offset-2`,
    iconSize: isTouch ? 'w-5 h-5' : 'w-4 h-4'
  })

  const classes = getResponsiveClasses()

  return (
    <div className={classes.container}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h1>
        <p className="text-gray-600 text-center mt-2">
          Sign in to continue building amazing websites
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Authentication Error</h4>
              <p className="text-sm text-red-600 mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-800">Successfully signed in! Redirecting...</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`${classes.iconSize} text-gray-400`} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`${classes.input} pl-10 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`${classes.iconSize} text-gray-400`} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`${classes.input} pl-10 pr-10 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className={`${classes.iconSize} text-gray-400 hover:text-gray-600`} />
                ) : (
                  <Eye className={`${classes.iconSize} text-gray-400 hover:text-gray-600`} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`${classes.button} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Success!
              </div>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Demo Account */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@aiwebsitebuilder.com')
                setPassword('demo123')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              disabled={loading}
            >
              Use demo account
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to AI Website Builder?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Create your account
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
