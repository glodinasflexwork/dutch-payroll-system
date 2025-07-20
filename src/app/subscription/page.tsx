'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Check, Crown, Star, Zap } from 'lucide-react';

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
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

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
        console.log('=== SUBSCRIPTION PAGE DEBUG ===');
        console.log('Raw subscription response:', subscriptionData);
        // Handle the nested response structure
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
        return <Crown className="h-8 w-8 text-gold-600" />;
      default:
        return <Star className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return 'border-blue-200 bg-blue-50';
      case 'professional':
        return 'border-purple-200 bg-purple-50 ring-2 ring-purple-500';
      case 'enterprise':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getButtonColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'professional':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'enterprise':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                          {Math.ceil((new Date(currentSubscription.trialEnd) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
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

        {/* Pricing Plans */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const isPopular = plan.name.toLowerCase() === 'professional';
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 shadow-lg ${getPlanColor(plan.name)} ${
                  isPopular ? 'transform scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  {getPlanIcon(plan.name)}
                  <h3 className="mt-4 text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
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
                </div>

                <ul className="mt-8 space-y-4">
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

                <div className="mt-8">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-lg bg-green-100 text-green-700 font-medium cursor-not-allowed border-2 border-green-200"
                    >
                      ✓ Current Plan
                    </button>
                  ) : plan.name === 'Enterprise' ? (
                    <button
                      onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                      disabled={processingPlan === plan.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${getButtonColor(plan.name)} ${
                        processingPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingPlan === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Switch to Pay-per-Use'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                      disabled={processingPlan === plan.id}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${getButtonColor(plan.name)} ${
                        processingPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingPlan === plan.id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : currentSubscription?.status === 'trialing' ? (
                        'Upgrade from Trial'
                      ) : currentSubscription ? (
                        'Switch Plan'
                      ) : (
                        'Get Started'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Points Purchase Section for Enterprise Users */}
        {currentSubscription?.plan?.name === 'Enterprise' && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                💳 Purchase Payroll Credits
              </h3>
              <p className="text-gray-700 text-center mb-8">
                Buy payroll credits in bulk and save money. Each credit allows you to run one payroll.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-yellow-400 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">10 Credits</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">€30.00</div>
                    <div className="text-sm text-gray-500">€3.00 per credit</div>
                    <button className="w-full mt-4 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border-2 border-yellow-400 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      5% OFF
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">25 Credits</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">€71.25</div>
                    <div className="text-sm text-gray-500">€2.85 per credit</div>
                    <button className="w-full mt-4 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border-2 border-yellow-400 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      10% OFF
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">50 Credits</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">€135.00</div>
                    <div className="text-sm text-gray-500">€2.70 per credit</div>
                    <button className="w-full mt-4 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border-2 border-yellow-400 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      15% OFF
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">100 Credits</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">€255.00</div>
                    <div className="text-sm text-gray-500">€2.55 per credit</div>
                    <button className="w-full mt-4 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Purchase
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600">
                  💡 <strong>Current Balance:</strong> 0 credits • <strong>Credits never expire</strong> • Instant activation
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trial Upgrade Banner */}
        {currentSubscription?.status === 'trialing' && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-4">
                🚀 Ready to unlock the full potential of SalarySync?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Your free trial ends in {Math.ceil((new Date(currentSubscription.trialEnd) - new Date()) / (1000 * 60 * 60 * 24))} days. 
                Upgrade now to continue enjoying seamless payroll management without interruption.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-sm opacity-75">
                  ✓ No setup fees • ✓ Cancel anytime • ✓ 30-day money-back guarantee
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-gray-600">
                If you exceed your plan limits, you'll be prompted to upgrade to a higher tier. We'll never charge you unexpectedly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day free trial for all new accounts. No credit card required to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

