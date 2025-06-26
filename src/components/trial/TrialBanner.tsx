'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  daysUsed: number;
  startDate: string | null;
  endDate: string | null;
  isExpired: boolean;
  canExtend: boolean;
}

interface TrialBannerProps {
  className?: string;
}

export default function TrialBanner({ className = '' }: TrialBannerProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data.trial);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trialStatus || !trialStatus.isActive || dismissed) {
    return null;
  }

  const getBannerStyle = () => {
    if (trialStatus.daysRemaining <= 1) {
      return 'bg-red-50 border-red-200 text-red-800';
    } else if (trialStatus.daysRemaining <= 3) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    if (trialStatus.daysRemaining <= 1) {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    } else if (trialStatus.daysRemaining <= 3) {
      return <Clock className="h-5 w-5 text-orange-600" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getMessage = () => {
    if (trialStatus.daysRemaining <= 0) {
      return 'Your trial has expired. Upgrade now to continue using all features.';
    } else if (trialStatus.daysRemaining === 1) {
      return 'Your trial expires tomorrow. Upgrade now to avoid interruption.';
    } else {
      return `Your free trial expires in ${trialStatus.daysRemaining} days.`;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <p className="font-medium">
              {getMessage()}
            </p>
            <p className="text-sm opacity-75 mt-1">
              Trial started {trialStatus.daysUsed} days ago • 
              {trialStatus.endDate && (
                ` Expires ${new Date(trialStatus.endDate).toLocaleDateString()}`
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            href="/subscription"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Upgrade Now
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

