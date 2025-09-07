'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    // Set the origin only on the client side
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  if (user) {
    return null
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Mini Job Board</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={origin ? `${origin}/` : '/'}
        />
      </div>
    </div>
  )
}
