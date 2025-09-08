'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Product Careers</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Browse Jobs
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
