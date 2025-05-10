import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="block">Symphony</span>
          <span className="block text-blue-600 dark:text-blue-400">Life Management Hub</span>
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl">
          Organize your life with a minimalist, intelligent system for goals, tasks, and routines.
        </p>
        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
          <div className="rounded-md shadow">
            <Link href="/dashboard">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3">
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
