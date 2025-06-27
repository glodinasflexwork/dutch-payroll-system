'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxEmployees: number;
  maxPayrolls: number;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
  stripeSubscriptionId: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
  period_start: number;
  period_end: number;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBillingData();
    }
  }, [status, router]);

  const fetchBillingData = async () => {
    try {
      // Fetch subscription
      const subscriptionResponse = await fetch('/api/subscription');
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setSubscription(subscriptionData);
      }

      // Fetch invoices
      const invoicesResponse = await fetch('/api/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripeSubscriptionId
        }),
      });

      if (response.ok) {
        await fetchBillingData(); // Refresh data
        alert('Subscription canceled successfully. It will remain active until the end of your current billing period.');
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;

    setActionLoading('reactivate');
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripeSubscriptionId
        }),
      });

      if (response.ok) {
        await fetchBillingData(); // Refresh data
        alert('Subscription reactivated successfully!');
      } else {
        throw new Error('Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-800 bg-green-100';
      case 'canceled':
        return 'text-red-800 bg-red-100';
      case 'past_due':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view invoices, and update billing information.
          </p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Current Subscription
            </h2>
          </div>
          
          {subscription ? (
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">
                      {subscription.plan.name} Plan
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1 capitalize">{subscription.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Price</p>
                      <p className="text-lg font-semibold text-gray-900">€{subscription.plan.price}/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Billing Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Employee Limit</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.plan.maxEmployees === -1 ? 'Unlimited' : subscription.plan.maxEmployees}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payroll Limit</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.plan.maxPayrolls === -1 ? 'Unlimited' : `${subscription.plan.maxPayrolls}/year`}
                      </p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">
                          Your subscription will be canceled on {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/subscription"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Change Plan
                </Link>
                
                {subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'reactivate' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Reactivating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Canceling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
              <Link
                href="/subscription"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Choose a Plan
              </Link>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Billing History
            </h2>
          </div>
          
          <div className="p-6">
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-gray-900">
                          {formatDate(invoice.created)}
                        </span>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Billing period: {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </span>
                      
                      <div className="flex space-x-2">
                        <a
                          href={invoice.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                        
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No billing history available.</p>
                <p className="text-sm text-gray-500 mt-1">
                  Invoices will appear here after your first billing cycle.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

