import * as React from 'react';

interface Tier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Starter',
    price: '$0',
    features: ['1 project', '5 GB storage', 'Community support', 'Email updates'],
    cta: 'Get started',
  },
  {
    name: 'Pro',
    price: '$24',
    features: [
      'Unlimited projects',
      '500 GB storage',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact sales',
  },
];

export default function PricingCard() {
  return (
    <section className="py-16 px-4 bg-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Pick the plan that&apos;s right for you
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Start free, upgrade as you grow. No surprises, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={[
                'rounded-md p-6 flex flex-col bg-background border',
                tier.popular ? 'border-primary border-2' : 'border-border',
              ].join(' ')}
            >
              {tier.popular && (
                <span className="self-start text-xs font-bold uppercase tracking-wider bg-accent text-background px-2 py-1 rounded-sm mb-4">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-2">{tier.name}</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.price !== 'Custom' && (
                  <span className="text-base text-muted-foreground">/mo</span>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0L4.3 10.3a1 1 0 0 1 1.4-1.4L8.7 11.9l6.6-6.6a1 1 0 0 1 1.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={[
                  'w-full py-3 rounded-md font-semibold text-sm transition-opacity hover:opacity-90',
                  tier.popular ? 'bg-primary text-background' : 'bg-foreground text-background',
                ].join(' ')}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
