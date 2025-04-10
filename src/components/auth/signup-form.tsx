'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const signupSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verifyEmailSent, setVerifyEmailSent] = useState(false)
  const supabase = createClientSupabaseClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setVerifyEmailSent(true)
    } catch (error) {
      setError('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (verifyEmailSent) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">Check your email</h1>
          <p className="mt-1 text-muted-foreground">
            We've sent you a verification link
          </p>
        </div>
        <div className="mt-6 text-center bg-secondary p-5 rounded-md border border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Please check your email inbox and click the verification link to complete your registration.
          </p>
          <Link 
            href="/login" 
            className="text-primary hover:underline text-sm"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-foreground">Sign up</h1>
        <p className="mt-1 text-muted-foreground">Create your account</p>
      </div>
      
      <div className="mt-6 space-y-4">
        <Button 
          variant="outline" 
          className="w-full bg-transparent border border-border h-11 font-normal rounded-md"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="fullName" className="sr-only">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Full Name"
              className="h-11 bg-transparent border-border rounded-md"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="h-11 bg-transparent border-border rounded-md"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="h-11 bg-transparent border-border rounded-md"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          
          {error && <p className="text-xs text-destructive">{error}</p>}
          
          <Button 
            type="submit" 
            className="w-full h-11 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 