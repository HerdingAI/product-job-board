'use client'

import Link from 'next/link'
import { Briefcase, Sparkles } from 'lucide-react'

export const Header = () => {
  return (
    <header className="bg-black/90 backdrop-blur-md shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Briefcase className="h-8 w-8 text-blue-400 transition-transform group-hover:scale-110" />
              <Sparkles className="h-3 w-3 text-blue-300 absolute -top-1 -right-1 opacity-60" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">Product Careers</span>
              <span className="text-xs text-gray-400 -mt-1">Premium PM Jobs</span>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-blue-400 font-medium text-sm transition-colors duration-200 relative group"
            >
              Browse Jobs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
