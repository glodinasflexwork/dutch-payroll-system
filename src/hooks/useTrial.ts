'use client';

import { useState, useEffect } from 'react';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  daysUsed: number;
  startDate: string | null;
  endDate: string | null;
  isExpired: boolean;
  canExtend: boolean;
}

interface UseTrialReturn {
  trialStatus: TrialStatus | null;
  hasTrialAccess: boolean;
  loading: boolean;
  error: string | null;
  refreshTrialStatus: () => Promise<void>;
  showExpiredModal: boolean;
  setShowExpiredModal: (show: boolean) => void;
}

export function useTrial(): UseTrialReturn {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [hasTrialAccess, setHasTrialAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const fetchTrialStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/trial/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trial status');
      }

      const data = await response.json();
      setTrialStatus(data.trial);
      setHasTrialAccess(data.hasTrialAccess);

      // Show expired modal if trial just expired
      if (data.trial?.isExpired && !showExpiredModal) {
        setShowExpiredModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching trial status:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrialStatus = async () => {
    setLoading(true);
    await fetchTrialStatus();
  };

  useEffect(() => {
    fetchTrialStatus();

    // Refresh trial status every hour
    const interval = setInterval(fetchTrialStatus, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Check for trial expiration every minute
  useEffect(() => {
    if (!trialStatus) return;

    const checkExpiration = () => {
      if (trialStatus.endDate) {
        const now = new Date();
        const endDate = new Date(trialStatus.endDate);
        
        if (now > endDate && trialStatus.isActive) {
          // Trial just expired, refresh status
          fetchTrialStatus();
        }
      }
    };

    const expirationInterval = setInterval(checkExpiration, 60 * 1000);
    
    return () => clearInterval(expirationInterval);
  }, [trialStatus]);

  return {
    trialStatus,
    hasTrialAccess,
    loading,
    error,
    refreshTrialStatus,
    showExpiredModal,
    setShowExpiredModal
  };
}

