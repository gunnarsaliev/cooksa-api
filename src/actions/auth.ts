'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function loginAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  // Validate input
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
    }
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return {
      success: false,
      error: 'Invalid form data',
    }
  }

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Attempt login
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (result.token) {
      // Set the auth cookie
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return {
        success: true,
      }
    }

    return {
      success: false,
      error: 'Login failed',
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid credentials',
    }
  }
}

export async function logoutAction() {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Clear cookie even on error
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}
