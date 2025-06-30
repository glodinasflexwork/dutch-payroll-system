'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  isExpired: boolean;
}

interface TrialGuardProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
  requiresPaid?: boolean; // If true, requires paid subscription, not just trial
}

export function TrialGuard({ 
  children, 
  feature = 'this feature',
  fallback,
  requiresPaid = false
}: TrialGuardProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [requiresPaid]);

  const checkAccess = async () => {
    try {
      console.log('=== TRIAL GUARD DEBUG ===');
      console.log('Checking access for feature:', feature);
      console.log('Requires paid subscription:', requiresPaid);

      // First check trial status
      const trialResponse = await fetch('/api/trial/status');
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        console.log('Trial data:', trialData);
        setTrialStatus(trialData.trial);
        
        // If user has active subscription, grant access
        if (trialData.hasSubscription) {
          console.log('User has active subscription - granting access');
          setHasAccess(true);
          setLoading(false);
          return;
        }
        
        // If requires paid subscription but no subscription, deny access
        if (requiresPaid && !trialData.hasSubscription) {
          console.log('Requires paid subscription but none found - denying access');
          setHasAccess(false);
          setLoading(false);
          return;
        }
        
        // Check if trial is active
        if (trialData.trial.isActive) {
          console.log('Trial is active - granting access');
          setHasAccess(true);
        } else {
          console.log('Trial is not active - denying access');
          setHasAccess(false);
        }
      } else {
        console.log('Failed to fetch trial status');
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Trial started:', data);
        // Refresh access check
        checkAccess();
      } else {
        const errorData = await response.json();
        console.error('Failed to start trial:', errorData);
        alert(errorData.error || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start trial. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Access Required
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {requiresPaid 
          ? `Access to ${feature} requires an active trial or subscription.`
          : `Access to ${feature} requires an active trial or subscription.`
        }
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={handleStartTrial}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Crown className="w-4 h-4 mr-2" />
          Start Trial
        </button>
        
        <Link
          href="/billing"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Billing
        </Link>
      </div>
      
      {trialStatus && trialStatus.isExpired && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Your trial period has expired. Please subscribe to continue using {feature}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

