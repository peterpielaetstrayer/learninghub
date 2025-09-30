import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const subscriptionPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 10 items per month',
      'Up to 50 flashcards',
      'Basic AI processing',
      'CSV export',
    ],
    limits: {
      itemsPerMonth: 10,
      cardsTotal: 50,
      aiRequestsPerMonth: 20,
    },
  },
  pro: {
    name: 'Pro',
    price: 999, // $9.99
    features: [
      'Unlimited items',
      'Unlimited flashcards',
      'Advanced AI processing',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
    limits: {
      itemsPerMonth: -1, // unlimited
      cardsTotal: -1, // unlimited
      aiRequestsPerMonth: -1, // unlimited
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 2999, // $29.99
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'Custom AI models',
      'White-label options',
    ],
    limits: {
      itemsPerMonth: -1,
      cardsTotal: -1,
      aiRequestsPerMonth: -1,
    },
  },
}

export async function createCheckoutSession(
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
) {
  const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
  if (!plan) throw new Error('Invalid plan')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.features.join(', '),
          },
          unit_amount: plan.price,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
