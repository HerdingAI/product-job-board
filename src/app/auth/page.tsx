'use client'

import Link from 'next/link'

export default function AuthPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In Disabled</h1>
        <p className="text-gray-600 mb-6">
          This is a read-only job board. Posting and accounts are not enabled in this version.
        </p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          Back to jobs →
        </Link>
      </div>
    </div>
  )
}
