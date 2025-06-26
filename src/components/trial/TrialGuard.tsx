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
      const response = await fetch('/api/trial/status');
      if (response.ok) {
        const data = await response.json();
        const trial = data.trial;
        setTrialStatus(trial);
        
        if (requiresPaid) {
          // Check if user has paid subscription
          const subResponse = await fetch('/api/subscription');
          if (subResponse.ok) {
            const subData = await subResponse.json();
            setHasAccess(subData.subscription?.status === 'active');
          }
        } else {
          // Allow access during trial or with paid subscription
          setHasAccess(trial?.isActive || data.hasTrialAccess);
        }
      }
    } catch (error) {
      console.error('Error checking trial access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
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

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default blocked access UI
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="flex items-center justify-center mb-4">
        {requiresPaid ? (
          <Crown className="w-12 h-12 text-yellow-500" />
        ) : trialStatus?.isExpired ? (
          <AlertTriangle className="w-12 h-12 text-red-500" />
        ) : (
          <Lock className="w-12 h-12 text-gray-400" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {requiresPaid ? 'Premium Feature' : 
         trialStatus?.isExpired ? 'Trial Expired' : 
         'Access Required'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {requiresPaid 
          ? `${feature} is available with a paid subscription.`
          : trialStatus?.isExpired 
            ? `Your trial has expired. Upgrade to continue using ${feature}.`
            : `Access to ${feature} requires an active trial or subscription.`
        }
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/subscription"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {requiresPaid ? (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              {trialStatus?.isExpired ? 'Upgrade Now' : 'Start Trial'}
            </>
          )}
        </Link>
        
        {!requiresPaid && (
          <Link
            href="/billing"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Billing
          </Link>
        )}
      </div>

      {trialStatus && !trialStatus.isExpired && (
        <p className="text-sm text-gray-500 mt-3">
          Trial expires in {trialStatus.daysRemaining} days
        </p>
      )}
    </div>
  );
}

