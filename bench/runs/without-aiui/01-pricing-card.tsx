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
    <section className="py-16 px-4 bg-gradient-to-b from-[#FAFBFF] to-[#F0F4FF]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-[42px] font-bold text-[#0F172A] mb-3"
            style={{ letterSpacing: '-0.025em' }}
          >
            Pick the plan that&apos;s right for you
          </h2>
          <p className="text-[18px] text-[#475569] max-w-[480px] mx-auto leading-[1.5]">
            Start free, upgrade as you grow. No surprises, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={[
                'rounded-[14px] p-7 flex flex-col',
                tier.popular
                  ? 'bg-[#1E1B4B] text-white border-[3px] border-[#7C3AED] shadow-[0_25px_50px_-12px_rgba(124,58,237,0.45)]'
                  : 'bg-white border border-[#E2E8F0]',
              ].join(' ')}
            >
              {tier.popular && (
                <span className="self-start text-[11px] font-bold uppercase tracking-[0.12em] bg-[#A855F7] text-white px-[10px] py-[5px] rounded-[6px] mb-5">
                  Most popular
                </span>
              )}
              <h3
                className={[
                  'text-[22px] font-semibold mb-2',
                  tier.popular ? 'text-white' : 'text-[#0F172A]',
                ].join(' ')}
              >
                {tier.name}
              </h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[44px] font-bold leading-none">{tier.price}</span>
                {tier.price !== 'Custom' && (
                  <span
                    className={[
                      'text-[15px]',
                      tier.popular ? 'text-[#C4B5FD]' : 'text-[#64748B]',
                    ].join(' ')}
                  >
                    /mo
                  </span>
                )}
              </div>
              <ul className="space-y-3 mb-7 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className={[
                      'flex items-start gap-2 text-[14.5px]',
                      tier.popular ? 'text-[#E9D5FF]' : 'text-[#334155]',
                    ].join(' ')}
                  >
                    <svg
                      className={[
                        'w-[17px] h-[17px] flex-shrink-0 mt-[3px]',
                        tier.popular ? 'text-[#A78BFA]' : 'text-[#10B981]',
                      ].join(' ')}
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
                  'w-full py-[13px] rounded-[10px] font-semibold text-[15px] transition-colors',
                  tier.popular
                    ? 'bg-white text-[#1E1B4B] hover:bg-[#F1F5F9]'
                    : 'bg-[#0F172A] text-white hover:bg-[#1E293B]',
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
