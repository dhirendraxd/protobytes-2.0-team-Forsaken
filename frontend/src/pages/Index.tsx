import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, BarChart3, Users, Phone, Mic2, Clock, Shield, User, LogOut, Zap, CheckCircle, TrendingUp } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Get user data from localStorage for footer
  const [userData, setUserData] = useState<{fullName?: string; email?: string} | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Glassmorphism */}
      <header className="relative animated-gradient text-primary-foreground overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating particles */}
        <div className="floating-particle w-12 h-12 left-[10%]" style={{ animation: 'float-up 15s infinite linear' }}></div>
        <div className="floating-particle w-8 h-8 left-[25%]" style={{ animation: 'float-up 12s infinite linear 2s' }}></div>
        <div className="floating-particle w-16 h-16 left-[40%]" style={{ animation: 'float-diagonal 18s infinite linear 1s' }}></div>
        <div className="floating-particle w-6 h-6 left-[55%]" style={{ animation: 'float-up 10s infinite linear 3s' }}></div>
        <div className="floating-particle w-10 h-10 left-[70%]" style={{ animation: 'float-diagonal 16s infinite linear' }}></div>
        <div className="floating-particle w-14 h-14 left-[85%]" style={{ animation: 'float-up 14s infinite linear 4s' }}></div>
        <div className="floating-particle w-8 h-8 left-[15%]" style={{ animation: 'float-diagonal 13s infinite linear 5s' }}></div>
        <div className="floating-particle w-12 h-12 left-[60%]" style={{ animation: 'float-up 17s infinite linear 2.5s' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <nav className="relative container mx-auto px-4 py-6 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BrandIcon className="w-8 h-8" />
            <span className="text-2xl font-bold text-white drop-shadow">VoiceLink</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {user.displayName || user.email?.split("@")[0] || "Profile"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                    {user.displayName || "User"}
                  </div>
                  <div className="px-2 py-1 text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <div className="my-1 border-t border-border/50" />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <Shield className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={async () => {
                        await signOut();
                      }}
                      className="cursor-pointer text-red-600 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2 inline" />
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all">
                Sign In
              </Link>
            )}
          </div>
        </nav>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              Reach Your Customers
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-white/90">
              With SMS & Voice Messages
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Powerful communication platform for SMEs and organizations
          </p>
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            Send bulk SMS, voice messages, and automated campaigns to thousands of contacts in seconds. No setup fees, pay only for what you send.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-xl">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                View Demo
              </Button>
            </Link>
          </div>
          
          {/* Stats with glass cards */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">99.9%</p>
              <p className="text-sm text-white/80">Delivery Rate</p>
            </div>
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">500+</p>
              <p className="text-sm text-white/80">Businesses</p>
            </div>
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">10M+</p>
              <p className="text-sm text-white/80">Messages Sent</p>
            </div>
          </div>
        </div>

        {/* Wave divider for smooth transition */}
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-background">
            <path d="M0,50 C300,100 600,0 900,50 C1050,75 1125,100 1200,80 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </header>

      {/* Platform Features */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Communicate
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional tools to engage customers via SMS and voice
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Bulk SMS</h3>
            <p className="text-sm text-muted-foreground">Send thousands of personalized SMS messages instantly</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Mic2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Voice Messages</h3>
            <p className="text-sm text-muted-foreground">Automated voice calls with custom audio or text-to-speech</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Contact Management</h3>
            <p className="text-sm text-muted-foreground">Import CSV, organize groups, manage unlimited contacts</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">Real-time tracking of delivery, opens, and engagement</p>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Instant Setup</h3>
              <p className="text-sm text-muted-foreground">
                Start sending messages in under 5 minutes. No technical knowledge required.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                Bank-level encryption and compliance with data privacy regulations.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Pay As You Grow</h3>
              <p className="text-sm text-muted-foreground">
                No monthly fees. Only pay for messages you send. Transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No subscriptions. Pay only for what you use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 border-2 border-border/50 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold">SMS Messages</h3>
            </div>
            <div className="mb-6">
              <p className="text-4xl font-bold mb-2">
                $0.05 <span className="text-lg text-muted-foreground font-normal">/message</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Volume discounts available for 10,000+ messages
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Delivery confirmation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Personalization variables</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Scheduled sending</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 border-2 border-border/50 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <Mic2 className="w-8 h-8 text-purple-600" />
              <h3 className="text-2xl font-bold">Voice Messages</h3>
            </div>
            <div className="mb-6">
              <p className="text-4xl font-bold mb-2">
                $0.15 <span className="text-lg text-muted-foreground font-normal">/minute</span>
              </p>
              <p className="text-sm text-muted-foreground">
                First 1000 minutes free for new accounts
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Upload audio or use TTS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Multi-language support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Call recording & analytics</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link to="/auth">
            <Button size="lg" className="px-8 py-6 h-auto text-lg">
              Start Free Trial - No Credit Card Required
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Ready to Connect With Your Customers?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join hundreds of SMEs and organizations using VoiceLink to send millions of messages every month.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="px-8 py-6 h-auto text-lg">
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="px-8 py-6 h-auto text-lg">
            <Phone className="w-5 h-5 mr-2" />
            Schedule a Demo
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
