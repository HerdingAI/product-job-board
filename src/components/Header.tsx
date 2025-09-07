'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Briefcase, User, LogOut, Plus } from 'lucide-react'

export const Header = () => {
  const { user, loading } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Mini Job Board</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Browse Jobs
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/post-job">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Plus className="h-4 w-4" />
                        <span>Post Job</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                    <Button 
                      onClick={handleSignOut}
                      variant="outline" 
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <Link href="/auth">
                    <Button size="sm">Sign In</Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
