import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, BarChart3, BusFront, Bell, Mic2, Clock, Shield, User, LogOut, MapPin, Loader2, FileText, Send, CheckCircle, FolderTree } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { Link, useNavigate } from "react-router-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const location = useUserLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [areaUpdates, setAreaUpdates] = useState<Array<{
    id: string;
    title?: string;
    message?: string;
    created_at?: unknown;
    [key: string]: unknown;
  }>>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    const fetchAreaUpdates = async () => {
      if (!location.city || location.loading) return;
      
      try {
        // Fetch latest alerts for the user's area
        const alertsQuery = query(
          collection(db, "alerts"),
          orderBy("created_at", "desc"),
          limit(3)
        );
        
        const snapshot = await getDocs(alertsQuery);
        const updates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setAreaUpdates(updates);
      } catch (error) {
        console.error("Error fetching area updates:", error);
      } finally {
        setLoadingUpdates(false);
      }
    };

    fetchAreaUpdates();
  }, [location.city, location.loading]);

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
                      {t("navigation.logout")}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all">
                {t("navigation.auth")}
              </Link>
            )}
          </div>
        </nav>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            {location.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                  {t('homepage.locating')}
                </h1>
              </div>
            ) : (
              <>
                <MapPin className="w-10 h-10 md:w-14 md:h-14" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                  {location.city}
                  {location.district && `, ${location.district}`}
                </h1>
              </>
            )}
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Community-driven voice information system powered by local moderators
          </p>
          <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
            {loadingUpdates ? (
              t('homepage.loadingUpdates')
            ) : areaUpdates.length > 0 ? (
              <>
                <strong>{t('homepage.latestUpdate')}:</strong> {areaUpdates[0].title || areaUpdates[0].message || t('homepage.noUpdates')}
              </>
            ) : (
              t('homepage.noUpdates')
            )}
          </p>
          
          {/* Glass card with phone number */}
          <div className="inline-flex items-center gap-4 glass-card px-8 py-6 rounded-2xl mb-16 shadow-2xl">
            <div className="p-3 rounded-full bg-white/20">
              <Phone className="w-8 h-8" />
            </div>
            <div className="text-left">
              <p className="text-sm text-white/80">Call Now</p>
              <p className="text-3xl font-bold">1660-XXX-XXXX</p>
            </div>
          </div>
          
          {/* Stats with glass cards */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">12</p>
              <p className="text-sm text-white/80">Active Briefings</p>
            </div>
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">42</p>
              <p className="text-sm text-white/80">Moderators</p>
            </div>
            <div className="glass-card p-6 rounded-xl backdrop-blur-lg">
              <p className="text-4xl md:text-5xl font-bold mb-2">247</p>
              <p className="text-sm text-white/80">SMS Alerts Sent</p>
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

      {/* Moderator Portal Features */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Moderator Portal</h2>
          <p className="text-lg text-muted-foreground">Manage community content and communications</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Weekly Briefings</h3>
            <p className="text-sm text-muted-foreground">Create and schedule IVR content with text, audio, or TTS</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">SMS Alerts</h3>
            <p className="text-sm text-muted-foreground">Send urgent notifications to users by region with cost estimation</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Content Approval</h3>
            <p className="text-sm text-muted-foreground">Review and approve community-submitted content</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 group">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <FolderTree className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Category Manager</h3>
            <p className="text-sm text-muted-foreground">Organize content categories for IVR navigation</p>
          </Card>
        </div>
      </section>

      {/* How It Works - IVR System */}
      <section className="relative py-14 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Call and navigate through voice menus</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 h-full hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 border hover:border-primary/50">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 w-fit mb-5">
                <BarChart3 className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Press 1 - Market Prices</h3>
              <p className="text-sm text-muted-foreground mb-4">Get real-time agricultural commodity prices for your region</p>
            </Card>
            
            <Card className="p-6 h-full hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 border hover:border-orange-500/50">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 w-fit mb-5">
                <Bell className="w-9 h-9 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Press 2 - Safety Updates</h3>
              <p className="text-sm text-muted-foreground mb-4">Listen to emergency alerts and safety information</p>
            </Card>
            
            <Card className="p-6 h-full hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 border hover:border-purple-500/50">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 w-fit mb-5">
                <Bell className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Press 3 - Community Notices</h3>
              <p className="text-sm text-muted-foreground mb-4">Hear local news and community announcements</p>
            </Card>
            
            <Card className="p-6 h-full hover:shadow-[var(--card-shadow-hover)] transition-all hover:scale-105 border hover:border-blue-500/50">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 w-fit mb-5">
                <BusFront className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Press 4 - Transport Updates</h3>
              <p className="text-sm text-muted-foreground mb-4">Check road conditions and transport schedules</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Why VoiceLink?</h2>
          <p className="text-xl text-muted-foreground">Built for rural communities with community-driven moderation</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Internet Needed</h3>
            <p className="text-muted-foreground text-lg">Works on any phone. Just dial and listen to IVR briefings.</p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">Content Approval Workflow</h3>
            <p className="text-muted-foreground text-lg">Community submits → Moderators review → Approved content published.</p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">Region-Based Targeting</h3>
            <p className="text-muted-foreground text-lg">Different regions get tailored briefings and SMS alerts.</p>
          </div>
        </div>
      </section>

      {/* CTA for Moderators */}
      <section className="relative py-20 animated-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {user ? "Access Moderator Portal" : "Join as a Moderator"}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {user 
              ? "Manage community content, send SMS alerts, and moderate submissions" 
              : "Sign in to access the moderator dashboard and start managing your community's content"}
          </p>
          {user ? (
            <Link to="/moderator">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                <Shield className="w-5 h-5" />
                Open Moderator Portal
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                <User className="w-5 h-5" />
                Sign In to Continue
              </Button>
            </Link>
          )}
        </div>
      </section>

      
      <Footer />
    </div>
  );
};

export default Index;
