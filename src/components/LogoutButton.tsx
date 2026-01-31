'use client'

import { useRouter } from 'next/navigation'
import { logoutAction } from '@/actions/auth'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const result = await logoutAction()
    if (result.success) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left"
      type="button"
    >
      Logout
    </button>
  )
}
