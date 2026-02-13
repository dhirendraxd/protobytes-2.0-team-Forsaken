import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  BarChart3,
  Users,
  Clock,
  Shield,
  Zap,
  Globe,
  Smartphone,
  HeadphonesIcon,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Features = () => {
  const mainFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Bulk SMS Messaging",
      description: "Send thousands of SMS messages instantly to your contact lists with personalized content and scheduling options.",
      highlights: ["API Integration", "Message Templates", "Delivery Reports"],
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Voice Broadcasting",
      description: "Reach your audience with automated voice calls. Perfect for alerts, reminders, and important announcements.",
      highlights: ["Text-to-Speech", "Voice Recording", "Call Analytics"],
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Track message delivery, open rates, and engagement metrics with comprehensive dashboards and reports.",
      highlights: ["Live Tracking", "Custom Reports", "Export Data"],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Contact Management",
      description: "Organize contacts into groups, import from CSV, and manage subscriber preferences efficiently.",
      highlights: ["Smart Segmentation", "CSV Import", "Opt-out Management"],
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Scheduled Campaigns",
      description: "Plan and schedule your messaging campaigns in advance with timezone-aware delivery.",
      highlights: ["Time Zone Support", "Recurring Messages", "Auto-Retry"],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption, secure API endpoints, and compliance with global messaging regulations.",
      highlights: ["256-bit Encryption", "GDPR Compliant", "2FA Support"],
    },
  ];

  const additionalFeatures = [
    { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast Delivery", description: "99.9% delivery rate globally" },
    { icon: <Globe className="w-5 h-5" />, title: "Global Coverage", description: "200+ countries supported" },
    { icon: <Smartphone className="w-5 h-5" />, title: "Mobile Apps", description: "iOS & Android available" },
    { icon: <HeadphonesIcon className="w-5 h-5" />, title: "24/7 Support", description: "Round-the-clock assistance" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10">
        <Navbar />

        {/* Hero Section */}
        <section className="mb-16 overflow-hidden rounded-[26px] bg-lime-300 px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[52px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[64px] lg:text-[80px]">
              Powerful Features
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/75">
              Everything you need to communicate effectively with your customers through SMS and voice messaging
            </p>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em] text-black sm:text-[42px]">
            Core Capabilities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className="rounded-[22px] border border-black/10 bg-white p-8 transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300/20 text-black">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-black">{feature.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-black/70">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-black/60">
                      <CheckCircle className="h-4 w-4 text-lime-600" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-16">
          <div className="rounded-[26px] bg-black px-6 py-12 text-white sm:px-8 lg:px-12">
            <h2 className="mb-8 text-center text-[36px] font-semibold tracking-[-0.02em]">
              And Much More
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-black">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 text-center">
          <h2 className="mx-auto max-w-[620px] text-[46px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[64px]">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-[500px] text-black/70">
            Join thousands of businesses already using VoiceLink
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

export default Features;
