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

const Index = () => {
  return (
    <div className="min-h-screen bg-[#f3f3f3] relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0) translateX(0); }
              25% { transform: translateY(-30px) translateX(15px); }
              50% { transform: translateY(-60px) translateX(-15px); }
              75% { transform: translateY(-30px) translateX(10px); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
              33% { transform: translateY(-40px) translateX(20px) rotate(120deg); }
              66% { transform: translateY(-20px) translateX(-20px) rotate(240deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.25; transform: scale(1); }
              50% { opacity: 0.45; transform: scale(1.15); }
            }
            .particle { animation: float 18s infinite ease-in-out; }
            .particle-slow { animation: float-slow 22s infinite ease-in-out; }
            .particle-pulse { animation: pulse 10s infinite ease-in-out; }
          `}
        </style>
        
        {/* Lime particles */}
        <div className="particle absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-lime-300/30 blur-2xl" style={{ animationDelay: '0s' }} />
        <div className="particle-slow absolute top-[20%] right-[15%] w-32 h-32 rounded-full bg-lime-300/25 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="particle absolute bottom-[15%] left-[10%] w-28 h-28 rounded-full bg-lime-300/35 blur-2xl" style={{ animationDelay: '4s' }} />
        <div className="particle-pulse absolute top-[40%] right-[8%] w-40 h-40 rounded-full bg-lime-300/20 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="particle-slow absolute bottom-[30%] right-[20%] w-36 h-36 rounded-full bg-lime-300/30 blur-3xl" style={{ animationDelay: '3s' }} />
        
        {/* White/Gray particles */}
        <div className="particle absolute top-[60%] left-[20%] w-20 h-20 rounded-full bg-white/30 blur-xl" style={{ animationDelay: '1.5s' }} />
        <div className="particle-slow absolute top-[25%] left-[40%] w-24 h-24 rounded-full bg-white/25 blur-2xl" style={{ animationDelay: '3.5s' }} />
        <div className="particle-pulse absolute bottom-[40%] left-[35%] w-28 h-28 rounded-full bg-white/30 blur-2xl" style={{ animationDelay: '2.5s' }} />
        
        {/* Black particles */}
        <div className="particle absolute top-[70%] right-[30%] w-18 h-18 rounded-full bg-black/12 blur-xl" style={{ animationDelay: '5s' }} />
        <div className="particle-slow absolute bottom-[20%] right-[40%] w-22 h-22 rounded-full bg-black/15 blur-2xl" style={{ animationDelay: '6s' }} />
        
        {/* Additional center particles */}
        <div className="particle absolute top-[50%] left-[45%] w-16 h-16 rounded-full bg-lime-300/35 blur-xl" style={{ animationDelay: '7s' }} />
        <div className="particle-slow absolute bottom-[50%] right-[50%] w-20 h-20 rounded-full bg-lime-300/30 blur-xl" style={{ animationDelay: '8s' }} />
      </div>

      <div className="mx-auto w-full max-w-[1680px] px-4 pt-6 sm:px-6 lg:px-10 relative z-10">
        <Navbar />

        <section className="relative mb-24 overflow-hidden rounded-[26px] bg-lime-300 px-6 pb-10 pt-10 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="max-w-[520px]">
              <h1 className="mb-5 text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[56px] lg:text-[72px]">
                Connect with
                <br />
                your Customers
              </h1>
              <p className="max-w-[360px] text-sm leading-relaxed text-black/75 sm:text-base">
                Send bulk SMS and voice messages instantly. Reach thousands of customers with personalized, automated communication.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link to="/auth">
                  <Button className="h-11 rounded-xl bg-black px-6 text-xs font-semibold text-white hover:bg-black/90 sm:text-sm">
                    Get Started Free
                  </Button>
                </Link>
                <a href="#" className="inline-flex items-center gap-1 text-xs font-medium text-black/85">
                  See How It Works
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="relative min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]">
              <div className="absolute left-0 top-2 w-[210px] rotate-[-5deg] rounded-[24px] bg-white p-4 shadow-[0_24px_40px_rgba(0,0,0,0.17)] sm:left-6 sm:w-[250px] lg:left-10 lg:w-[280px]">
                <p className="mb-3 text-lg font-semibold text-black">Campaign Stats</p>
                <div className="mb-3 rounded-lg border border-black/10 bg-lime-100 px-3 py-2 text-[10px] text-black font-semibold">
                  98.5% Delivery Rate
                </div>
                <div className="mb-3 rounded-xl bg-black p-3 text-[10px] text-white">
                  <p className="mb-1 font-semibold">Messages Sent</p>
                  <p className="text-xl font-bold">12,450</p>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>SMS Delivered</span>
                    <span className="text-green-600 font-semibold">9,840</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voice Calls</span>
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
            Powerful Features
            <br />
            for Your Business
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-2xl bg-[#ececec] p-6">
              <h3 className="text-2xl font-semibold text-black">Bulk SMS Campaigns</h3>
              <p className="mt-3 max-w-[330px] text-sm leading-relaxed text-black/65">
                Send personalized SMS to thousands of customers instantly with guaranteed delivery
              </p>
              <a href="#" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-black">
                Learn More
                <ArrowRight className="h-3 w-3" />
              </a>
              <div className="absolute -bottom-4 right-0 h-24 w-24 rounded-tl-[30px] bg-lime-300" />
            </article>
            <article className="relative overflow-hidden rounded-2xl bg-[#ececec] p-6">
              <h3 className="text-2xl font-semibold text-black">Voice Messages & IVR</h3>
              <p className="mt-3 max-w-[350px] text-sm leading-relaxed text-black/65">
                Automated voice calls with Text-to-Speech or custom audio for alerts and confirmations
              </p>
              <a href="#" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-black">
                Learn More
                <ArrowRight className="h-3 w-3" />
              </a>
              <div className="absolute bottom-3 right-4 h-20 w-20 rounded-full border-[7px] border-lime-300 border-r-black border-t-[#f77d6f] border-b-transparent" />
            </article>
          </div>
        </section>

        <section id="why" className="mb-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="mb-3 text-[44px] font-semibold tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">Why VoiceLink</h2>
              <p className="max-w-[250px] text-sm leading-relaxed text-black/70">
                The most trusted communication platform for SMEs and organizations worldwide
              </p>
            </div>
            <div className="grid gap-0 rounded-2xl border border-black/10 bg-[#f5f5f5] md:grid-cols-2">
              <div className="border-b border-r border-black/10 p-5 md:border-b">
                <div className="mb-3 flex items-center gap-3">
                  <Clock3 className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">Instant Delivery</h3>
                </div>
                <p className="text-sm text-black/65">
                  Send messages to thousands instantly with 99.9% delivery guarantee
                </p>
              </div>
              <div className="border-b border-black/10 p-5 md:border-b">
                <div className="mb-3 flex items-center gap-3">
                  <Headphones className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">Expert Support</h3>
                </div>
                <p className="text-sm text-black/65">24/7 support team ready to help you maximize your campaigns</p>
              </div>
              <div className="border-r border-black/10 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <BadgePercent className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">Affordable Pricing</h3>
                </div>
                <p className="text-sm text-black/65">Pay only for what you send - no hidden fees or subscriptions</p>
              </div>
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 rounded-full bg-lime-300 p-1 text-black" />
                  <h3 className="text-xl font-semibold">Real Analytics</h3>
                </div>
                <p className="text-sm text-black/65">Track delivery, engagement, and ROI with detailed real-time reports</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20 rounded-[22px] bg-gradient-to-r from-black via-[#121212] to-[#212121] px-6 py-8 text-white sm:px-8 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="max-w-[520px] text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] sm:text-[52px] lg:text-[60px]">
                Start Connecting with Your Customers Today
              </h2>
              <Link to="/auth">
                <Button className="mt-6 h-11 rounded-xl bg-white px-6 text-xs font-semibold text-black hover:bg-white/90 sm:text-sm">
                  Get Started Free
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
            <h2 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">Send in Real Time</h2>
            <p className="mt-4 max-w-[520px] text-base leading-relaxed text-black/70">
              Messages are delivered instantly to your customers. Track delivery status in real-time and monitor engagement with advanced analytics dashboard.
            </p>
          </div>
        </section>

        <section id="pricing" className="mb-20">
          <h2 className="text-center text-[44px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">Simple Pricing</h2>
          <p className="mx-auto mt-3 max-w-[500px] text-center text-sm text-black/70">
            Pay only for what you send. No setup fees, no contracts.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="text-xl font-semibold text-black">Starter</h3>
              <p className="mt-2 text-sm text-black/60">For small businesses</p>
              <p className="mt-4 text-4xl font-bold text-black">$0<span className="text-lg">/mo</span></p>
              <Link to="/auth">
                <Button className="mt-6 w-full rounded-xl border border-black/10 text-black hover:bg-black/5">Get Started</Button>
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ 100 SMS credits</li>
                <li className="flex items-center gap-2 text-black/70">✓ Basic dashboard</li>
                <li className="flex items-center gap-2 text-black/70">✓ Email support</li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-black bg-white p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">Most Popular</div>
              <h3 className="text-xl font-semibold text-black">Professional</h3>
              <p className="mt-2 text-sm text-black/60">For growing businesses</p>
              <p className="mt-4 text-4xl font-bold text-black">$29<span className="text-lg">/mo</span></p>
              <Link to="/auth">
                <Button className="mt-6 w-full rounded-xl bg-black text-white hover:bg-black/90">Get Started</Button>
              </Link>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ 10,000 SMS</li>
                <li className="flex items-center gap-2 text-black/70">✓ Voice campaigns</li>
                <li className="flex items-center gap-2 text-black/70">✓ Advanced analytics</li>
                <li className="flex items-center gap-2 text-black/70">✓ Priority support</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className="text-xl font-semibold text-black">Enterprise</h3>
              <p className="mt-2 text-sm text-black/60">For large organizations</p>
              <p className="mt-4 text-4xl font-bold text-black">Custom<span className="text-lg">/mo</span></p>
              <a href="#contact">
                <Button className="mt-6 w-full rounded-xl bg-black text-white hover:bg-black/90">Contact Sales</Button>
              </a>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2 text-black/70">✓ Unlimited everything</li>
                <li className="flex items-center gap-2 text-black/70">✓ Dedicated account manager</li>
                <li className="flex items-center gap-2 text-black/70">✓ API access</li>
                <li className="flex items-center gap-2 text-black/70">✓ Custom integrations</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-20 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px]">Campaign Management</h2>
            <p className="mt-4 max-w-[520px] text-base leading-relaxed text-black/70">
              Manage all your SMS and voice campaigns from one powerful dashboard. Create, send, and track campaigns with detailed analytics and insights.
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
            Ready to connect with customers?
          </h2>
          <p className="mx-auto mt-3 max-w-[500px] text-black/70">Start sending SMS and voice messages in minutes</p>
          <Link to="/auth">
            <Button className="mt-6 h-11 rounded-xl bg-black px-6 text-xs text-white hover:bg-black/90 sm:text-sm">
              Get Started Free
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
