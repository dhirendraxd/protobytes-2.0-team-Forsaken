import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Zap, TrendingUp, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Pricing = () => {
  const plans = [
    {
      icon: <Zap className="w-6 h-6" />,
      name: "Starter",
      price: "रू 2,999",
      period: "/month",
      description: "Perfect for small businesses getting started",
      features: [
        "2,000 SMS credits/month",
        "1,000 voice minutes/month",
        "Basic analytics dashboard",
        "Email support",
        "API access",
        "Contact management (up to 5,000)",
      ],
      highlighted: false,
      cta: "Start Free Trial",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      name: "Professional",
      price: "रू 8,999",
      period: "/month",
      description: "For growing businesses with higher volume",
      features: [
        "15,000 SMS credits/month",
        "7,500 voice minutes/month",
        "Advanced analytics & reports",
        "Priority support (24/7)",
        "Full API integration",
        "Contact management (unlimited)",
        "Custom message templates",
        "Scheduled campaigns",
      ],
      highlighted: true,
      cta: "Get Started",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      name: "Enterprise",
      price: "Contact Us",
      period: "",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited SMS credits",
        "Unlimited voice minutes",
        "Enterprise analytics suite",
        "Dedicated account manager",
        "Custom API solutions",
        "Unlimited contacts",
        "White-label options",
        "SLA guarantee",
        "Advanced security features",
      ],
      highlighted: false,
      cta: "Contact Sales",
    },
  ];

  const addons = [
    { name: "Additional 2,000 SMS", price: "रू 1,499" },
    { name: "Additional 1,000 Voice Minutes", price: "रू 2,499" },
    { name: "Premium Support", price: "रू 3,999/month" },
    { name: "Dedicated Number", price: "रू 1,999/month" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10">
        <Navbar />

        {/* Hero Section */}
        <section className="mb-16 overflow-hidden rounded-[26px] bg-lime-300 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[64px] lg:text-[80px]">
              Simple Pricing
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/75">
              Choose the perfect plan for your business. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`rounded-[22px] p-8 transition-all ${
                  plan.highlighted
                    ? "border-2 border-lime-300 bg-white shadow-xl scale-105"
                    : "border border-black/10 bg-white hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold text-black">
                    Most Popular
                  </div>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black text-lime-300">
                  {plan.icon}
                </div>
                <h3 className="mb-2 text-2xl font-semibold text-black">{plan.name}</h3>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-black">{plan.price}</span>
                  <span className="text-lg text-black/60">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm text-black/70">{plan.description}</p>
                <Link to="/auth">
                  <Button
                    className={`mb-6 h-11 w-full rounded-xl text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-black text-white hover:bg-lime-600"
                        : "bg-lime-300 text-black hover:bg-lime-400"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-black/80">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-lime-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="mb-16">
          <div className="rounded-[26px] bg-white border border-black/10 px-6 py-12 sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em] text-black">
              Optional Add-ons
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {addons.map((addon, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-black/10 bg-[#f3f3f3] p-6 text-center hover:border-lime-300 transition-all"
                >
                  <h3 className="mb-2 text-lg font-semibold text-black">{addon.name}</h3>
                  <p className="text-2xl font-bold text-black">{addon.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bulk SMS Feature Section */}
        <section id="bulk-sms" className="mb-16 scroll-mt-20">
          <div className="rounded-[26px] bg-gradient-to-br from-lime-300 to-lime-200 px-6 py-12 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-[40px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[48px]">
                Bulk SMS Campaigns
              </h2>
              <p className="mb-6 max-w-2xl text-lg text-black/75">
                Send personalized SMS messages to thousands of your customers instantly with guaranteed delivery rates. Perfect for promotions, alerts, confirmations, and customer engagement.
              </p>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-black">Key Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-black" />
                      <div>
                        <p className="font-semibold text-black">99.9% Delivery Rate</p>
                        <p className="text-sm text-black/70">Guaranteed message delivery to all major carriers</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-black" />
                      <div>
                        <p className="font-semibold text-black">Instant Send</p>
                        <p className="text-sm text-black/70">Messages delivered in seconds, not hours</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-black" />
                      <div>
                        <p className="font-semibold text-black">Personalization</p>
                        <p className="text-sm text-black/70">Custom variables to address each customer by name</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-black" />
                      <div>
                        <p className="font-semibold text-black">Scheduled Campaigns</p>
                        <p className="text-sm text-black/70">Send messages at the optimal time for your audience</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="mb-4 text-2xl font-semibold text-black">Pricing Breakdown</h3>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm text-black/70">Starter Plan</p>
                      <p className="text-2xl font-bold text-black">रू 2,999<span className="text-base font-normal text-black/60">/month</span></p>
                      <p className="mt-2 text-xs text-black/60">2,000 SMS credits/month</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border-2 border-black">
                      <p className="text-sm text-black/70">Professional Plan</p>
                      <p className="text-2xl font-bold text-black">रू 8,999<span className="text-base font-normal text-black/60">/month</span></p>
                      <p className="mt-2 text-xs text-black/60">15,000 SMS credits/month + Advanced analytics</p>
                    </div>
                    <div className="rounded-xl bg-white p-4">
                      <p className="text-sm text-black/70">Add-on SMS</p>
                      <p className="text-2xl font-bold text-black">रू 1,499</p>
                      <p className="mt-2 text-xs text-black/60">Additional 2,000 SMS credits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Voice Feature Section */}
        <section id="voice-messages" className="mb-16 scroll-mt-20">
          <div className="rounded-[26px] bg-gradient-to-br from-black to-[#1a1a1a] px-6 py-12 text-white sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-[40px] font-semibold leading-[0.95] tracking-[-0.03em] sm:text-[48px]">
                Voice Messages
              </h2>
              <p className="mb-6 max-w-2xl text-lg text-white/75">
                Automated voice calls with Text-to-Speech or custom audio for alerts, confirmations, and important notifications. Reach customers even when they can't read SMS.
              </p>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-2xl font-semibold">Key Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-lime-300" />
                      <div>
                        <p className="font-semibold">Text-to-Speech Technology</p>
                        <p className="text-sm text-white/70">Natural-sounding voices in multiple languages</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-lime-300" />
                      <div>
                        <p className="font-semibold">Custom Audio Upload</p>
                        <p className="text-sm text-white/70">Use your own recordings for branded messages</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-lime-300" />
                      <div>
                        <p className="font-semibold">Voice Routing</p>
                        <p className="text-sm text-white/70">Route calls to the right message flow automatically</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-lime-300" />
                      <div>
                        <p className="font-semibold">Call Recording</p>
                        <p className="text-sm text-white/70">Record interactions for quality assurance</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="mb-4 text-2xl font-semibold">Pricing Breakdown</h3>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white/10 p-4 border border-white/20">
                      <p className="text-sm text-white/70">Starter Plan</p>
                      <p className="text-2xl font-bold">रू 2,999<span className="text-base font-normal text-white/60">/month</span></p>
                      <p className="mt-2 text-xs text-white/60">1,000 voice minutes/month</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4 border-2 border-lime-300">
                      <p className="text-sm text-white/70">Professional Plan</p>
                      <p className="text-2xl font-bold">रू 8,999<span className="text-base font-normal text-white/60">/month</span></p>
                      <p className="mt-2 text-xs text-white/60">7,500 voice minutes/month + automation features</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4 border border-white/20">
                      <p className="text-sm text-white/70">Add-on Voice</p>
                      <p className="text-2xl font-bold">रू 2,499</p>
                      <p className="mt-2 text-xs text-white/60">Additional 1,000 voice minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="rounded-[26px] bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em]">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto max-w-3xl space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">Can I change plans later?</h3>
                <p className="text-sm text-white/70">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">What happens if I exceed my limits?</h3>
                <p className="text-sm text-white/70">
                  We'll notify you when you're approaching your limit. You can purchase add-ons or upgrade to a higher plan.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Do you offer refunds?</h3>
                <p className="text-sm text-white/70">
                  Yes, we offer a 30-day money-back guarantee for all annual plans if you're not satisfied.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Is there a setup fee?</h3>
                <p className="text-sm text-white/70">
                  No setup fees or hidden charges. You only pay for the plan you choose.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 text-center">
          <h2 className="mx-auto max-w-[620px] text-[46px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[64px]">
            Start your free trial today
          </h2>
          <p className="mx-auto mt-3 max-w-[500px] text-black/70">
            No credit card required. Cancel anytime.
          </p>
          <Link to="/auth">
            <Button className="mt-6 h-11 rounded-xl bg-black px-8 text-sm text-white hover:bg-lime-600 transition-all">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
