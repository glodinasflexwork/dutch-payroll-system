'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Users, 
  Calendar, 
  HardDrive, 
  TrendingUp, 
  CreditCard, 
  Download, 
  BarChart3,
  Euro,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  features: string[];
  maxEmployees: number;
  maxPayrolls: number;
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  plan: Plan;
  trialEnd?: string;
}

interface UsageStats {
  employees: { current: number; limit: number };
  payrolls: { current: number; limit: number };
  storage: { current: number; limit: number };
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    employees: { current: 12, limit: 50 },
    payrolls: { current: 8, limit: -1 },
    storage: { current: 2.1, limit: 10 }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchPlansAndSubscription();
    }
  }, [status, router]);

  const fetchPlansAndSubscription = async () => {
    try {
      // Fetch available plans
      const plansResponse = await fetch('/api/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData);
      }

      // Fetch current subscription
      const subscriptionResponse = await fetch('/api/subscription');
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setCurrentSubscription(subscriptionData.subscription || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, stripePriceId: string) => {
    setProcessingPlan(planId);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          planId: planId,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Star className="h-8 w-8 text-blue-600" />;
      case 'professional':
        return <Zap className="h-8 w-8 text-purple-600" />;
      case 'enterprise':
        return <Crown className="h-8 w-8 text-yellow-600" />;
      default:
        return <Star className="h-8 w-8 text-gray-600" />;
    }
  };

  const calculateUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageStatus = (current: number, limit: number) => {
    if (limit === -1) return 'unlimited';
    const percentage = (current / limit) * 100;
    if (percentage < 70) return 'good';
    if (percentage < 90) return 'warning';
    return 'critical';
  };

  const getDaysRemaining = () => {
    if (!currentSubscription?.trialEnd) return 0;
    const now = new Date();
    const trialEnd = new Date(currentSubscription.trialEnd);
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Usage Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Employees</p>
                  <p className="text-3xl font-bold">
                    {usageStats.employees.current}
                    {usageStats.employees.limit !== -1 && (
                      <span className="text-lg text-blue-200">/{usageStats.employees.limit}</span>
                    )}
                  </p>
                  {usageStats.employees.limit !== -1 && (
                    <div className="w-full bg-blue-500/30 rounded-full h-2 mt-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-300"
                        style={{ width: `${calculateUsagePercentage(usageStats.employees.current, usageStats.employees.limit)}%` }}
                      />
                    </div>
                  )}
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Payrolls</p>
                  <p className="text-3xl font-bold">{usageStats.payrolls.current}</p>
                  <p className="text-blue-100 text-sm">this month</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Storage</p>
                  <p className="text-3xl font-bold">
                    {usageStats.storage.current}
                    <span className="text-lg text-blue-200">GB</span>
                  </p>
                  <div className="w-full bg-blue-500/30 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-300"
                      style={{ width: `${calculateUsagePercentage(usageStats.storage.current, usageStats.storage.limit)}%` }}
                    />
                  </div>
                </div>
                <HardDrive className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your payroll management needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.plan && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <span className="text-green-800 font-semibold text-lg">
                      Current Plan: {currentSubscription.plan.name || 'Unknown'}
                    </span>
                    {currentSubscription.plan.price > 0 && (
                      <span className="text-green-700 ml-2 text-base">
                        (€{(currentSubscription.plan.price || 0) / 100}/month)
                      </span>
                    )}
                    {currentSubscription.status === 'trialing' && currentSubscription.trialEnd && (
                      <div className="text-sm text-green-700 mt-2 font-medium">
                        🎉 Free Trial Active - Ends: {new Date(currentSubscription.trialEnd).toLocaleDateString()} 
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                          {daysRemaining} days remaining
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {currentSubscription.status === 'trialing' && (
                  <div className="text-right">
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Trial Status</div>
                    <div className="text-green-600 font-bold">ACTIVE</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Pricing Plans */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const isPopular = plan.name.toLowerCase() === 'professional';
            
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  isPopular ? 'ring-2 ring-purple-500 transform scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`bg-gradient-to-r ${
                  plan.name.toLowerCase() === 'starter' ? 'from-blue-600 to-blue-700' :
                  plan.name.toLowerCase() === 'professional' ? 'from-purple-600 to-purple-700' :
                  'from-yellow-600 to-yellow-700'
                } px-6 py-4`}>
                  <div className="text-center text-white">
                    {getPlanIcon(plan.name)}
                    <h3 className="mt-2 text-2xl font-bold">{plan.name}</h3>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {plan.name === 'Enterprise' ? (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">€{plan.price / 100}</span>
                        <span className="text-gray-600">/payroll run</span>
                        <div className="text-sm text-gray-500 mt-1">Pay-per-use pricing</div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">€{plan.price / 100}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.maxEmployees === -1 ? 'Unlimited' : `Up to ${plan.maxEmployees}`} employees
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.maxPayrolls === -1 ? 'Unlimited' : `${plan.maxPayrolls}`} payrolls per year
                      </span>
                    </li>
                    {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    )) : null}
                  </ul>

                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <Button
                        disabled
                        className="w-full bg-green-100 text-green-700 hover:bg-green-100 cursor-not-allowed"
                      >
                        ✓ Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                        disabled={processingPlan === plan.id}
                        className={`w-full ${
                          plan.name.toLowerCase() === 'starter' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' :
                          plan.name.toLowerCase() === 'professional' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' :
                          'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                        }`}
                      >
                        {processingPlan === plan.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : plan.name === 'Enterprise' ? (
                          'Switch to Pay-per-Use'
                        ) : currentSubscription?.status === 'trialing' ? (
                          'Upgrade from Trial'
                        ) : currentSubscription ? (
                          'Switch Plan'
                        ) : (
                          'Get Started'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing History & Account Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-16">
          {/* Billing History */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <CreditCard className="w-5 h-5" />
                <span>Billing History</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Your recent payments and invoices
              </CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Apr 3, 2024</p>
                    <p className="text-sm text-gray-600">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">€50.00</p>
                    <p className="text-sm text-green-600">✓ Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Mar 3, 2024</p>
                    <p className="text-sm text-gray-600">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">€50.00</p>
                    <p className="text-sm text-green-600">✓ Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Feb 3, 2024</p>
                    <p className="text-sm text-gray-600">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">€20.00</p>
                    <p className="text-sm text-green-600">✓ Paid</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 hover:bg-blue-50 hover:border-blue-300">
                <Download className="w-4 h-4 mr-2" />
                Download All Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Usage Projections & Recommendations */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <span>Usage Insights</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Smart recommendations based on your usage
              </CardDescription>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Usage Trend</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your employee count has grown 20% this quarter. Consider upgrading to Enterprise for unlimited employees.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Cost Optimization</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You're saving €180/month compared to manual payroll processing.
                      </p>
                    </div>
                  </div>
                </div>

                {currentSubscription?.status === 'trialing' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Trial Ending Soon</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your trial ends in {daysRemaining} days. Upgrade now to continue using SalarySync without interruption.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {currentSubscription?.status === 'trialing' && (
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mt-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">🚀 Ready to unlock the full potential of SalarySync?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Your free trial ends in {daysRemaining} days. Upgrade now to continue enjoying seamless payroll management without interruption.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I change my plan at any time?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What happens if I exceed my plan limits?</h4>
              <p className="text-gray-600">If you exceed your plan limits, you'll be prompted to upgrade to a higher tier. We'll never charge you unexpectedly.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">We offer a 14-day free trial for all new accounts. No credit card required to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

