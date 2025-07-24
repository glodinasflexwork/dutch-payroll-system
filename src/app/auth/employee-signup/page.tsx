/**
 * Employee Signup Page
 * 
 * This page handles the employee invitation acceptance flow.
 * Employees receive an invitation link via email which directs them to this page.
 * The page validates the invitation token and allows the employee to create their account.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateEmployeeInvitationToken } from "@/lib/employee-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function EmployeeSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate the invitation token when the page loads
  useEffect(() => {
    async function validateToken() {
      if (!token || !email) {
        setError("Invalid invitation link. Please check your email for the correct link.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/employees/validate-invitation?token=${token}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.valid) {
          setIsValid(true);
          setEmployeeName(data.employeeName || "");
        } else {
          setError(data.error || "Invalid invitation. Please contact your HR department.");
        }
      } catch (err) {
        setError("An error occurred while validating your invitation. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    validateToken();
  }, [token, email]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setPasswordError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/employees/complete-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin?success=invitation-accepted");
        }, 3000);
      } else {
        setError(data.error || "An error occurred while creating your account.");
      }
    } catch (err) {
      setError("An error occurred while creating your account. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <Image
              src="/logo.svg"
              alt="SalarySync Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            SalarySync Employee Portal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your account setup to access your employee portal
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
              <p className="text-center mt-4">Validating your invitation...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <CardTitle className="text-red-600">Invitation Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-600">
                If you believe this is an error, please contact your HR department.
              </p>
            </CardFooter>
          </Card>
        ) : success ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <CardTitle className="text-green-600">Account Created!</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                Your employee portal account has been successfully created. You will be redirected to the login page shortly.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push("/auth/signin")}
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                {employeeName ? `Welcome, ${employeeName}!` : "Welcome to SalarySync!"} Create your password to access your employee portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a secure password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-gray-600">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function EmployeeSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeSignupContent />
    </Suspense>
  );
}

