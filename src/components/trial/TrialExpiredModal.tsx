'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialExpiredModal({ isOpen, onClose }: TrialExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trial Expired
          </h2>
          <p className="text-gray-600">
            Your 14-day free trial has ended. Upgrade to a paid plan to continue using all features of SalarySync.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What happens now?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your data is safely preserved</li>
              <li>• Limited access to view-only features</li>
              <li>• No new payroll processing until upgrade</li>
              <li>• Full access restored upon subscription</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/subscription"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            onClick={onClose}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Link>
          
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Continue with Limited Access
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? <a href="mailto:support@dutchpayroll.com" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

