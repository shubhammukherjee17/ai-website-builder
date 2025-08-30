"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, User, Check, X } from 'lucide-react'
import { useScreenSize, isTouchDevice } from '@/utils/responsive'

interface ValidationErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  passed: boolean[];
}

export function EnhancedSignupForm() {
  const router = useRouter()
  const screenSize = useScreenSize()
  const isTouch = isTouchDevice()

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<ValidationErrors>({})
  const [agreedToTerms, setAgreedToTerms] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength>({
    score: 0,
    feedback: [],
    passed: [false, false, false, false]
  })

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const checks = [
      { test: /.{8,}/, message: "At least 8 characters" },
      { test: /[A-Z]/, message: "One uppercase letter" },
      { test: /[a-z]/, message: "One lowercase letter" },
      { test: /\d/, message: "One number" },
    ]

    const passed = checks.map(check => check.test.test(password))
    const score = passed.filter(Boolean).length
    const feedback = checks
      .map((check, index) => ({ ...check, passed: passed[index] }))
      .filter(check => !check.passed)
      .map(check => check.message)

    return { score, feedback, passed }
  }

  // Validation functions
  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    return null
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    const strength = checkPasswordStrength(password)
    if (strength.score < 3) return "Password is too weak"
    return null
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password"
    if (confirmPassword !== password) return "Passwords do not match"
    return null
  }

  const validateForm = () => {
    const newErrors: ValidationErrors = {}
    
    const nameError = validateFullName(fullName)
    if (nameError) newErrors.fullName = nameError

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError

    const confirmError = validateConfirmPassword(confirmPassword, password)
    if (confirmError) newErrors.confirmPassword = confirmError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Real-time validation handlers
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFullName(value)
    if (errors.fullName) {
      const error = validateFullName(value)
      setErrors(prev => ({ ...prev, fullName: error || undefined }))
    }
  }

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
    setPasswordStrength(checkPasswordStrength(value))
    
    if (errors.password) {
      const error = validatePassword(value)
      setErrors(prev => ({ ...prev, password: error || undefined }))
    }
    
    // Re-validate confirm password if it exists
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, value)
      setErrors(prev => ({ ...prev, confirmPassword: confirmError || undefined }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (errors.confirmPassword) {
      const error = validateConfirmPassword(value, password)
      setErrors(prev => ({ ...prev, confirmPassword: error || undefined }))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    
    if (!validateForm()) return
    if (!agreedToTerms) {
      setErrors({ general: 'Please agree to the Terms of Service and Privacy Policy' })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const emailRedirectTo = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { 
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
          }
        }
      })
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ 
            general: 'An account with this email already exists. Please try signing in instead.' 
          })
        } else if (error.message.includes('Password should be at least')) {
          setErrors({ password: 'Password must be at least 6 characters long' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      setSuccess(true)
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
      isTouch ? 'min-h-[600px]' : ''
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

  if (success) {
    return (
      <div className={classes.container}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Please check your email and click the link to activate your account.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Sign In
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Need to change your email?
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">Create account</h1>
        <p className="text-gray-600 text-center mt-2">
          Start building amazing websites in minutes
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Registration Error</h4>
              <p className="text-sm text-red-600 mt-1">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className={`${classes.iconSize} text-gray-400`} />
              </div>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={handleFullNameChange}
                placeholder="John Doe"
                className={`${classes.input} pl-10 ${
                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                disabled={loading}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.fullName}
              </p>
            )}
          </div>

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
                autoComplete="new-password"
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

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded ${
                        index < passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-red-500'
                            : passwordStrength.score === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  {passwordStrength.passed.map((passed, index) => {
                    const requirements = [
                      "At least 8 characters",
                      "One uppercase letter", 
                      "One lowercase letter",
                      "One number"
                    ]
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {passed ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <X className="w-3 h-3 text-red-500" />
                        )}
                        <span className={passed ? 'text-green-600' : 'text-red-600'}>
                          {requirements[index]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`${classes.iconSize} text-gray-400`} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                className={`${classes.input} pl-10 pr-10 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className={`${classes.iconSize} text-gray-400 hover:text-gray-600`} />
                ) : (
                  <Eye className={`${classes.iconSize} text-gray-400 hover:text-gray-600`} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className={`${classes.button} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center w-full h-10 px-4 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Sign in to your account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
