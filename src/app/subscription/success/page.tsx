'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionDetails {
  planName: string;
  price: number;
  status: string;
}

export default function SubscriptionSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && sessionId) {
      verifySubscription();
    }
  }, [status, sessionId, router]);

  const verifySubscription = async () => {
    try {
      const response = await fetch(`/api/verify-subscription?session_id=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionDetails(data);
      } else {
        setError('Failed to verify subscription');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      setError('An error occurred while verifying your subscription');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">
              Subscription Verification Failed
            </h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/subscription"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Subscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Activated!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for subscribing to our Dutch Payroll System. Your subscription is now active.
          </p>

          {/* Subscription Details */}
          {subscriptionDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Subscription Details</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Plan:</span> {subscriptionDetails.planName}</p>
                <p><span className="font-medium">Price:</span> €{subscriptionDetails.price}/month</p>
                <p><span className="font-medium">Status:</span> {subscriptionDetails.status}</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
            
            <Link
              href="/subscription"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Manage Subscription
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-xs text-gray-500">
            <p>
              You will receive a confirmation email shortly. If you have any questions, 
              please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

