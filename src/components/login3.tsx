'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Icon } from '@iconify/react'
import { loginAction } from '@/actions/auth'

interface Login3Props {
  buttonText?: string
  className?: string
}

const Login3 = ({ buttonText = 'Login', className }: Login3Props) => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    try {
      const result = await loginAction(formData)

      if (result.success) {
        setLoading(false)
        setSuccess(true)

        // Show green success state for 500ms
        setTimeout(() => {
          router.push('/admin')
        }, 500)
      } else if (result.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
      setLoading(false)
    }
  }

  return (
    <section className={cn('h-screen bg-transparent', className)}>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 lg:justify-start">
          <form
            action={handleSubmit}
            className="flex w-full max-w-sm min-w-sm flex-col items-center gap-y-4 px-6 py-12"
          >
            {/* Logo */}
            <Icon icon="simple-icons:codechef" width={100} height={100} />
            <h1 className="text-lg font-semibold">Cooksa API</h1>

            {error && (
              <div className="w-full rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="text-sm"
                required
                disabled={loading}
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="text-sm"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className={cn(
                'w-full hover:bg-green-600',
                success && 'bg-green-600 hover:bg-green-600',
              )}
              disabled={loading || success}
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              {success && <Icon icon="charm:circle-tick" width={20} height={20} className="mr-2" />}
              {loading ? 'Logging in...' : success ? 'Success!' : buttonText}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

export { Login3 }
