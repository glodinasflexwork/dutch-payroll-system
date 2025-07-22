/**
 * Employee Portal Dashboard
 * 
 * This is the main page employees see after logging in to the portal.
 * It displays personalized information and provides access to employee features.
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, FileTextIcon, UserIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

export default function EmployeePortalPage() {
  const { data: session, status } = useSession();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployeeData() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/employee-portal/me");
          
          if (!response.ok) {
            throw new Error("Failed to fetch employee data");
          }
          
          const data = await response.json();
          setEmployeeData(data);
        } catch (err) {
          console.error("Error fetching employee data:", err);
          setError("Failed to load your employee information. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchEmployeeData();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("You must be logged in to access the employee portal.");
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <EmployeePortalSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in to access the employee portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {employeeData?.firstName || session?.user?.name?.split(" ")[0] || "Employee"}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-NL", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/employee-portal/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData?.leaveBalance || "20"} days
            </div>
            <p className="text-xs text-muted-foreground">
              Annual leave remaining
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payday</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData?.nextPayday || "25 Jul 2025"}
            </div>
            <p className="text-xs text-muted-foreground">
              {employeeData?.daysToPayday || "3"} days from now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData?.documentCount || "5"}
            </div>
            <p className="text-xs text-muted-foreground">
              Available documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeData?.workingHours || "40"} hrs/week
            </div>
            <p className="text-xs text-muted-foreground">
              {employeeData?.workSchedule || "Monday-Friday"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payslips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="payslips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payslips</CardTitle>
              <CardDescription>
                View and download your recent payslips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {employeeData?.payslips?.length > 0 ? (
                employeeData.payslips.map((payslip: any) => (
                  <div
                    key={payslip.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{payslip.period}</p>
                      <p className="text-sm text-muted-foreground">
                        Net: €{payslip.netAmount}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No payslips available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Manage your leave requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {employeeData?.leaveRequests?.length > 0 ? (
                employeeData.leaveRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {request.startDate} - {request.endDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.days} days • {request.status}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "approved" ? "bg-green-100 text-green-800" :
                      request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {request.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No leave requests found.</p>
              )}
              <Button className="w-full">
                Request Leave
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Access your employment documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {employeeData?.documents?.length > 0 ? (
                employeeData.documents.map((document: any) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.type} • {document.date}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No documents available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmployeePortalSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

