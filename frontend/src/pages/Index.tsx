import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  CircleArrowOutUpRight,
  Clock3,
  Headphones,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#f3f3f3] relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10 relative z-10">
        <Navbar />

        <section className="relative mb-24 overflow-hidden rounded-[26px] bg-lime-300 px-6 pb-10 pt-10 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="max-w-[520px]">
              <h1 className="mb-5 text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[72px]">
                {t('voicelink.hero.title')}
              </h1>
              <p className="max-w-[360px] text-sm leading-relaxed text-black/75 sm:text-base">
                {t('voicelink.hero.description')}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button className="h-11 rounded-xl bg-black px-6 text-xs font-semibold text-white hover:bg-black/90 sm:text-sm">
                    {user ? t('voicelink.cta.goToDashboard') : t('voicelink.cta.getStarted')}
                  </Button>
                </Link>
                <a href="#" className="inline-flex items-center gap-1 text-xs font-medium text-black/85">
                  See how it works
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="relative min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]">
              <div className="absolute left-0 top-2 w-[210px] rotate-[-5deg] rounded-[24px] bg-white p-4 shadow-[0_24px_40px_rgba(0,0,0,0.17)] sm:left-6 sm:w-[250px] lg:left-10 lg:w-[280px]">
                <p className="mb-3 text-lg font-semibold text-black">{t('voicelink.dashboard.campaignStats')}</p>
                <div className="mb-3 rounded-lg border border-black/10 bg-lime-100 px-3 py-2 text-[10px] text-black font-semibold">
                  98.5% Delivery Rate
                </div>
                <div className="mb-3 rounded-xl bg-black p-3 text-[10px] text-white">
                  <p className="mb-1 font-semibold">{t('voicelink.dashboard.messagesDelivered')}</p>
                  <p className="text-xl font-bold">12,450</p>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>{t('voicelink.dashboard.messagesDelivered')}</span>
                    <span className="text-green-600 font-semibold">9,840</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('voicelink.dashboard.voiceCalls')}</span>
                    <span className="text-green-600 font-semibold">2,610</span>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-10 w-[220px] rotate-[8deg] rounded-[22px] bg-black p-4 shadow-[0_26px_40px_rgba(0,0,0,0.3)] sm:w-[260px] lg:w-[300px]">
                <div className="mb-3 flex items-center justify-between text-[10px] text-white/80">
                  <span>Active Customers</span>
                  <span>289</span>
                </div>
                <div className="h-32 rounded-xl bg-gradient-to-b from-white/5 to-black p-2 sm:h-36 lg:h-44">
                  <svg viewBox="0 0 210 80" className="h-full w-full">
                    <path
                      d="M0 48 C16 18, 28 74, 44 35 C58 8, 72 52, 88 40 C102 29, 115 64, 132 22 C145 8, 162 42, 176 30 C188 20, 199 6, 210 22"
                      fill="none"
                      stroke="#d9ff4a"
                      strokeWidth="2"
                    />
                    <path
                      d="M0 72 C20 62, 32 76, 46 64 C64 48, 78 72, 94 66 C112 56, 126 72, 144 64 C162 58, 180 70, 210 58"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] text-white/75">
                  <span>SMS</span>
                  <span>Voice</span>
                  <span>Success</span>
                  <span>Track</span>
                </div>
              </div>
            </div>
          </div>

          <svg
            viewBox="0 0 280 120"
            className="pointer-events-none absolute bottom-8 left-[34%] hidden h-24 w-72 text-black/80 lg:block"
          >
            <path d="M4 14 C 102 14, 128 88, 210 86" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path d="M206 76 L228 88 L214 106" fill="none" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        </section>

        <section id="features" className="mb-20">
          <h2 className="mb-8 text-[40px] font-semibold leading-[0.96] tracking-[-0.02em] text-black sm:text-[48px] lg:text-[60px]">
            {t('voicelink.features.title')}
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-2xl bg-[#ececec] p-6">
              <h3 className="text-2xl font-semibold text-black">{t('voicelink.features.bulkSms')}</h3>
              <p className="mt-3 max-w-[330px] text-sm leading-relaxed text-black/65">
                {t('voicelink.features.bulkSmsDesc')}
              </p>
              <Link to="/pricing#bulk-sms" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-black">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </Link>
              <div className="absolute -bottom-4 right-0 h-24 w-24 rounded-tl-[30px] bg-lime-300" />
            </article>
            <article className="relative overflow-hidden rounded-2xl bg-[#ececec] p-6">
              <h3 className="text-2xl font-semibold text-black">{t('voicelink.features.voiceIvr')}</h3>
              <p className="mt-3 max-w-[350px] text-sm leading-relaxed text-black/65">
                {t('voicelink.features.voiceIvrDesc')}
              </p>
              <Link to="/pricing#voice-ivr" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-black">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </Link>
              <div className="absolute bottom-3 right-4 h-20 w-20 rounded-full border-[7px] border-lime-300 border-r-black border-t-[#f77d6f] border-b-transparent" />
            </article>
          </div>
        </section>

        <section id="why" className="mb-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="mb-3 text-[44px] font-semibold tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">{t('voicelink.why.title')}</h2>
              <p className="max-w-[250px] text-sm leading-relaxed text-black/70">
                {t('voicelink.why.subtitle')}
              </p>
            </div>
            <div className="grid gap-0 rounded-2xl border border-black/10 bg-[#f5f5f5] md:grid-cols-2">
              <div className="border-b border-r border-black/10 p-5 md:border-b">
                <div className="mb-3 flex items-center gap-3">
                  <Clock3 className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">{t('voicelink.why.instantDelivery')}</h3>
                </div>
                <p className="text-sm text-black/65">
                  {t('voicelink.why.instantDeliveryDesc')}
                </p>
              </div>
              <div className="border-b border-black/10 p-5 md:border-b">
                <div className="mb-3 flex items-center gap-3">
                  <Headphones className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">{t('voicelink.why.expertSupport')}</h3>
                </div>
                <p className="text-sm text-black/65">{t('voicelink.why.expertSupportDesc')}</p>
              </div>
              <div className="border-r border-black/10 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <BadgePercent className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">{t('voicelink.why.affordablePricing')}</h3>
                </div>
                <p className="text-sm text-black/65">{t('voicelink.why.affordablePricingDesc')}</p>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">{t('voicelink.why.realAnalytics')}</h3>
                </div>
                <p className="text-sm text-black/65">{t('voicelink.why.realAnalyticsDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20 rounded-[22px] bg-gradient-to-r from-black via-[#121212] to-[#212121] px-6 py-8 text-white sm:px-8 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="max-w-[520px] text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] sm:text-[52px] lg:text-[60px]">
                {t('voicelink.cta.ready')}
              </h2>
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button className="mt-6 h-11 rounded-xl bg-white px-6 text-xs font-semibold text-black hover:bg-white/90 sm:text-sm">
                  {user ? t('voicelink.cta.goToDashboard') : t('voicelink.cta.getStarted')}
                </Button>
              </Link>
            </div>
            <div className="mx-auto w-[210px] rounded-3xl bg-white p-4 text-black shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
              <p className="text-3xl font-semibold">98.5%</p>
              <p className="text-xs text-black/70">Delivery Rate</p>
              <div className="mt-4 rounded-xl bg-black p-3 text-xs text-white">
                <p>Active Users</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/20">
                  <div className="h-1.5 w-4/5 rounded-full bg-lime-300" />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-black/70">
                <div className="flex items-center justify-between">
                  <span>Messages Today</span>
                  <span className="text-green-600 font-semibold">24,580</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Campaigns Active</span>
                  <span className="text-green-600 font-semibold">842</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Countries Served</span>
                  <span className="text-black font-semibold">156+</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20 grid items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto h-40 w-[280px] sm:w-[320px]">
            <div className="absolute left-0 top-2 h-32 w-40 rotate-[-8deg] rounded-2xl bg-lime-300" />
            <div className="absolute left-5 top-5 h-32 w-56 rounded-2xl bg-black p-3">
              <svg viewBox="0 0 200 80" className="h-full w-full">
                <path
                  d="M0 12 C20 24,40 14,62 38 C78 56,92 58,108 52 C128 44,154 30,200 26"
                  fill="none"
                  stroke="#d9ff4a"
                  strokeWidth="2"
                />
                <path
                  d="M0 58 C22 34,40 70,60 52 C76 42,92 64,112 48 C132 28,148 62,200 44"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.7"
                  opacity="0.8"
                />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">{t('voicelink.campaigns.realtime')}</h2>
            <p className="mt-4 max-w-[520px] text-base leading-relaxed text-black/70">
              {t('voicelink.campaigns.realtimeDesc')}
            </p>
          </div>
        </section>

        <section id="pricing" className="mb-20">
          <h2 className="text-center text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">{t('voicelink.pricing.title')}</h2>
          <p className="mx-auto mt-3 max-w-[500px] text-center text-sm text-black/70">
            {t('voicelink.pricing.subtitle')}
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="text-xl font-semibold text-black">{t('voicelink.pricing.starter.name')}</h3>
              <p className="mt-2 text-sm text-black/60">{t('voicelink.pricing.starter.desc')}</p>
              <p className="mt-4 text-4xl font-bold text-black">{t('voicelink.pricing.starter.price')}<span className="text-lg">/month</span></p>
              <Link to="/auth">
                <Button className="mt-6 w-full rounded-xl border border-black/10 text-black hover:bg-black/5">Get Started</Button>
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.starter.feature1')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.starter.feature2')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.starter.feature3')}</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-black bg-white p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">{t('voicelink.pricing.professional.popular')}</div>
              <h3 className="text-xl font-semibold text-black">{t('voicelink.pricing.professional.name')}</h3>
              <p className="mt-2 text-sm text-black/60">{t('voicelink.pricing.professional.desc')}</p>
              <p className="mt-4 text-4xl font-bold text-black">{t('voicelink.pricing.professional.price')}<span className="text-lg">/month</span></p>
              <Link to="/auth">
                <Button className="mt-6 w-full rounded-xl bg-black text-white hover:bg-black/90">Get Started</Button>
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.professional.feature1')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.professional.feature2')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.professional.feature3')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.professional.feature4')}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="text-xl font-semibold text-black">{t('voicelink.pricing.enterprise.name')}</h3>
              <p className="mt-2 text-sm text-black/60">{t('voicelink.pricing.enterprise.desc')}</p>
              <p className="mt-4 text-4xl font-bold text-black">{t('voicelink.pricing.enterprise.price')}<span className="text-lg">/month</span></p>
              <a href="#contact">
                <Button className="mt-6 w-full rounded-xl bg-black text-white hover:bg-black/90">Contact Sales</Button>
              </a>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.enterprise.feature1')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.enterprise.feature2')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.enterprise.feature3')}</li>
                <li className="flex items-center gap-2 text-black/70">✓ {t('voicelink.pricing.enterprise.feature4')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-20 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">{t('voicelink.campaigns.title')}</h2>
            <p className="mt-4 max-w-[520px] text-base leading-relaxed text-black/70">
              {t('voicelink.campaigns.description')}
            </p>
          </div>
          <div className="relative flex min-h-[220px] items-center justify-center">
            <div className="absolute right-8 h-44 w-44 rounded-full bg-lime-300" />
            <div className="relative z-10 w-full max-w-[360px] space-y-3">
              {[
                ["SMS Campaign", "12,450 sent", "98.5% delivered"],
                ["Voice Calls", "2,340 placed", "99.2% connected"],
                ["Email Follow-up", "1,892 queued", "Pending send"],
              ].map(([name, sent, status]) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm font-medium text-black/85">{name}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">{sent}</p>
                    <p className="text-xs text-green-600">{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-24 text-center">
          <h2 id="contact" className="mx-auto max-w-[620px] text-[46px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[64px]">
            {t('voicelink.cta.ready')}
          </h2>
          <p className="mx-auto mt-3 max-w-[500px] text-black/70">{t('voicelink.cta.subtitle')}</p>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button className="mt-6 h-11 rounded-xl bg-black px-6 text-xs text-white hover:bg-black/90 sm:text-sm">
              {user ? t('voicelink.cta.goToDashboard') : t('voicelink.cta.getStarted')}
            </Button>
          </Link>
        </section>

        <footer className="mt-24 rounded-t-[26px] bg-black px-6 py-12 text-white sm:px-8 lg:px-12 -mx-4 sm:-mx-6 lg:-mx-10">
          <div className="grid gap-12 lg:grid-cols-4 items-start">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-1.5 text-lg font-semibold">
                <span>VoiceLink</span>
                <span className="inline-block h-5 w-5 rounded-full bg-lime-300" />
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Stocks & Founds</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Learn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Company</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>

            {/* Subscribe to News */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Subscribe to News</h3>
              <div className="relative mb-6">
                <Input
                  type="email"
                  placeholder="Your e-mail"
                  className="h-12 rounded-full border-white/20 bg-white/10 pr-14 text-white placeholder:text-white/50 focus-visible:ring-lime-300"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-lime-300 text-black hover:bg-lime-400 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-4">
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
