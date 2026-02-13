import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Award,
  Shield,
  Zap,
  Globe,
  HeadphonesIcon,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const WhyUs = () => {
  const reasons = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Delivery",
      description: "99.9% delivery rate with average message delivery in under 3 seconds globally. Our redundant infrastructure ensures your messages always reach their destination.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "Your data is protected with 256-bit encryption, SOC 2 compliance, and GDPR adherence. We never share or sell your customer data.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Coverage",
      description: "Reach customers in 200+ countries with local number support and multi-language capabilities. Seamless international messaging at competitive rates.",
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: "24/7 Expert Support",
      description: "Our dedicated support team is available around the clock via chat, email, and phone. Average response time under 2 minutes.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Proven Track Record",
      description: "10+ years of experience delivering billions of messages for thousands of businesses worldwide. Trusted by Fortune 500 companies.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Industry Awards",
      description: "Recognized as the #1 messaging platform by leading tech publications. Multiple awards for innovation and customer satisfaction.",
    },
  ];

  const stats = [
    { number: "10M+", label: "Messages Delivered Daily" },
    { number: "15K+", label: "Active Businesses" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "200+", label: "Countries Covered" },
  ];

  const testimonials = [
    {
      quote: "VoiceLink transformed how we communicate with customers. The delivery rates are incredible and support is always there when we need them.",
      author: "Sarah Johnson",
      role: "Marketing Director, TechCorp",
      rating: 5,
    },
    {
      quote: "We switched from another provider and saw immediate improvements. The analytics dashboard alone is worth it.",
      author: "Michael Chen",
      role: "CEO, RetailPro",
      rating: 5,
    },
    {
      quote: "The best messaging platform we've used. Easy to integrate, reliable, and cost-effective. Highly recommended!",
      author: "Emily Rodriguez",
      role: "CTO, StartupHub",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10">
        <Navbar />

        {/* Hero Section */}
        <section className="mb-16 overflow-hidden rounded-[26px] bg-lime-300 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[64px] lg:text-[80px]">
              Why Choose VoiceLink?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/75">
              Join thousands of businesses that trust VoiceLink for their mission-critical communications
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="rounded-[22px] border border-black/10 bg-white p-8 text-center hover:shadow-lg transition-all"
              >
                <div className="mb-2 text-5xl font-bold text-black">{stat.number}</div>
                <div className="text-sm font-medium text-black/70">{stat.label}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Reasons Grid */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em] text-black sm:text-[42px]">
            What Sets Us Apart
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <Card
                key={index}
                className="rounded-[22px] border border-black/10 bg-white p-8 transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300/20 text-black">
                  {reason.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-black">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-black/70">{reason.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <div className="rounded-[26px] bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em]">
              What Our Customers Say
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-lime-300 text-lime-300" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-white/90">"{testimonial.quote}"</p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-white/70">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="mb-16">
          <div className="rounded-[26px] border border-black/10 bg-white px-6 py-12 sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em] text-black">
              Trusted & Certified
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-lime-300/20">
                  <Shield className="h-10 w-10 text-black" />
                </div>
                <h3 className="mb-2 font-semibold text-black">SOC 2 Compliant</h3>
                <p className="text-sm text-black/70">Certified security standards</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-lime-300/20">
                  <CheckCircle className="h-10 w-10 text-black" />
                </div>
                <h3 className="mb-2 font-semibold text-black">GDPR Ready</h3>
                <p className="text-sm text-black/70">Privacy compliant</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-lime-300/20">
                  <Users className="h-10 w-10 text-black" />
                </div>
                <h3 className="mb-2 font-semibold text-black">ISO Certified</h3>
                <p className="text-sm text-black/70">Quality management</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-lime-300/20">
                  <Clock className="h-10 w-10 text-black" />
                </div>
                <h3 className="mb-2 font-semibold text-black">99.9% Uptime SLA</h3>
                <p className="text-sm text-black/70">Guaranteed reliability</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 text-center">
          <h2 className="mx-auto max-w-[620px] text-[46px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[64px]">
            Experience the difference
          </h2>
          <p className="mx-auto mt-3 max-w-[500px] text-black/70">
            Join thousands of satisfied customers today
          </p>
          <Link to="/auth">
            <Button className="mt-6 h-11 rounded-xl bg-black px-8 text-sm text-white hover:bg-lime-600 transition-all">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default WhyUs;
