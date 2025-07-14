"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function UnifiedNavigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SalarySync</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="/solutions" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Solutions
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/signin">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

