"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SalarySync</h1>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verified!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is now active and ready to use
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Welcome to SalarySync!</h3>
                <p className="text-gray-600 mt-2">
                  Your email has been successfully verified. You can now sign in and start setting up your company.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-2">🎯 What's Next:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Sign in to your account</li>
                    <li>• Complete your company setup</li>
                    <li>• Start your 14-day free trial</li>
                    <li>• Add employees and begin payroll management</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/auth/signin">
                  <Button className="w-full" size="lg">
                    Sign In to Your Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <p className="text-xs text-gray-500">
                  Ready to start managing your Dutch payroll with confidence!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

