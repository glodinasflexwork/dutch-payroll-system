'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  daysUsed: number;
  startDate: string | null;
  endDate: string | null;
  isExpired: boolean;
  canExtend: boolean;
}

interface TrialCountdownProps {
  className?: string;
}

export default function TrialCountdown({ className = '' }: TrialCountdownProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrialStatus();
    
    // Refresh trial status every hour
    const interval = setInterval(fetchTrialStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!trialStatus || !trialStatus.isActive) {
    return null;
  }

  const progressPercentage = (trialStatus.daysUsed / (trialStatus.daysUsed + trialStatus.daysRemaining)) * 100;

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Free Trial Status</h3>
        <Clock className="h-5 w-5 text-blue-600" />
      </div>

      <div className="space-y-4">
        {/* Days Remaining */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {trialStatus.daysRemaining}
          </div>
          <div className="text-sm text-gray-600">
            {trialStatus.daysRemaining === 1 ? 'day remaining' : 'days remaining'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Trial Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">Days Used</div>
              <div className="font-medium">{trialStatus.daysUsed}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-gray-600">Total Trial</div>
              <div className="font-medium">14 days</div>
            </div>
          </div>
        </div>

        {/* Trial Dates */}
        {trialStatus.startDate && trialStatus.endDate && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Trial: {new Date(trialStatus.startDate).toLocaleDateString()} - {new Date(trialStatus.endDate).toLocaleDateString()}
          </div>
        )}

        {/* Upgrade Prompt */}
        {trialStatus.daysRemaining <= 3 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm text-orange-800">
              <strong>Trial ending soon!</strong> Upgrade to a paid plan to continue using all features without interruption.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

