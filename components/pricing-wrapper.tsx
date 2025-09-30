'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 items per month',
      'Up to 50 flashcards',
      'Basic AI processing',
      'CSV export',
      'Chrome extension',
    ],
    limits: {
      itemsPerMonth: 10,
      cardsTotal: 50,
      aiRequestsPerMonth: 20,
    },
    popular: false,
  },
  {
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    description: 'For serious learners',
    features: [
      'Unlimited items',
      'Unlimited flashcards',
      'Advanced AI processing',
      'Priority support',
      'Advanced analytics',
      'API access',
      'All Free features',
    ],
    limits: {
      itemsPerMonth: -1,
      cardsTotal: -1,
      aiRequestsPerMonth: -1,
    },
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 29.99,
    interval: 'month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'Custom AI models',
      'White-label options',
      'Advanced security',
    ],
    limits: {
      itemsPerMonth: -1,
      cardsTotal: -1,
      aiRequestsPerMonth: -1,
    },
    popular: false,
  },
]

export function PricingWrapper() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planName: string) => {
    if (!session) {
      // Redirect to sign in
      window.location.href = '/api/auth/signin'
      return
    }

    if (planName === 'free') {
      // Free plan - no action needed
      return
    }

    setLoading(planName)
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: planName.toLowerCase() }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session:', data.error)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoading('manage')
    try {
      const response = await fetch('/api/subscriptions/customer-portal', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Failed to create customer portal session:', data.error)
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error)
    } finally {
      setLoading(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start learning smarter with AI-powered flashcards
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {session?.user?.subscriptionPlan === plan.name.toLowerCase() ? (
                  <div className="w-full">
                    <Button
                      onClick={handleManageSubscription}
                      disabled={loading === 'manage'}
                      className="w-full"
                      variant="outline"
                    >
                      {loading === 'manage' ? 'Loading...' : 'Manage Subscription'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loading === plan.name}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {loading === plan.name
                      ? 'Loading...'
                      : plan.name === 'Free'
                      ? 'Current Plan'
                      : `Subscribe to ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {session && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Current plan: <span className="font-semibold capitalize">
                {session.user.subscriptionPlan || 'Free'}
              </span>
            </p>
            {session.user.subscriptionStatus && (
              <p className="text-sm text-gray-500 mt-1">
                Status: {session.user.subscriptionStatus}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
