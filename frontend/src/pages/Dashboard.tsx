import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Mail,
  Bell,
  Users,
  Phone,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    await signOut();
  };

  const quickActions = [
    {
      id: "ivr",
      icon: <Phone className="w-6 h-6" />,
      title: "IVR Access",
      description: "Call our number to access voice services",
      action: () => navigate("/"),
    },
    {
      id: "alerts",
      icon: <Bell className="w-6 h-6" />,
      title: "Submit Alert",
      description: "Report a community issue or update",
      action: () => navigate("/alerts"),
    },
    {
      id: "community",
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Connect with other users",
      action: () => navigate("/community"),
    },
    {
      id: "prices",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Market Prices",
      description: "View current market information",
      action: () => navigate("/market-prices"),
    },
    {
      id: "moderator",
      icon: <Settings className="w-6 h-6" />,
      title: "Moderator Portal",
      description: "Manage content and moderate community",
      action: () => navigate("/moderator"),
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "login",
      title: "Account Login",
      description: "Successfully logged in to VoiceLink",
      timestamp: "Today at 10:30 AM",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      id: 2,
      type: "alert",
      title: "Alert Submitted",
      description: "Your community alert has been posted",
      timestamp: "Yesterday",
      icon: <Bell className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 3,
      type: "verification",
      title: "Email Verified",
      description: "Your email address has been verified",
      timestamp: "2 days ago",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
  ];

  const stats = [
    {
      label: "Account Status",
      value: user?.emailVerified ? "✓ Verified" : "Pending",
      color:
        user?.emailVerified ?
          "text-green-600" : "text-yellow-600",
      icon: <Mail className="w-5 h-5" />,
    },
    {
      label: "Auth Method",
      value:
        user?.providerData[0]?.providerId === "google.com"
          ? "Google"
          : "Email",
      color: "text-blue-600",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

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
        
        <div className="particle absolute top-[10%] left-[5%] w-24 h-24 rounded-full bg-lime-300/30 blur-2xl" style={{ animationDelay: '0s' }} />
        <div className="particle-slow absolute top-[20%] right-[15%] w-32 h-32 rounded-full bg-lime-300/25 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="particle absolute bottom-[15%] left-[10%] w-28 h-28 rounded-full bg-lime-300/35 blur-2xl" style={{ animationDelay: '4s' }} />
        <div className="particle-pulse absolute top-[40%] right-[8%] w-40 h-40 rounded-full bg-lime-300/20 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="particle-slow absolute bottom-[30%] right-[20%] w-36 h-36 rounded-full bg-lime-300/30 blur-3xl" style={{ animationDelay: '3s' }} />
        <div className="particle absolute top-[60%] left-[20%] w-20 h-20 rounded-full bg-white/30 blur-xl" style={{ animationDelay: '1.5s' }} />
        <div className="particle-slow absolute top-[25%] left-[40%] w-24 h-24 rounded-full bg-white/25 blur-2xl" style={{ animationDelay: '3.5s' }} />
      </div>

      <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-10 relative z-10">
        <Navbar />

        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-[42px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[52px] lg:text-[60px] mb-3">
                Welcome back,{" "}
                <span className="text-black">
                  {user?.displayName?.split(" ")[0] ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </span>
              </h1>
              <p className="text-base text-black/60">
                You're authenticated and ready to use VoiceLink
              </p>
            </div>
            {user?.photoURL && (
              <div className="flex-shrink-0">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-20 w-20 rounded-full border-2 border-black/10"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-black/10">
          {["overview", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold transition-all capitalize border-b-2 rounded-t-lg ${
                activeTab === tab
                  ? "border-lime-300 text-black bg-lime-300/10"
                  : "border-transparent text-black/50 hover:text-black hover:bg-black/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 border border-black/10 bg-white shadow-sm rounded-[22px] hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/50 mb-2">Email</p>
                    <p className="font-semibold text-black break-all text-sm">
                      {user?.email}
                    </p>
                  </div>
                  <Mail className="w-5 h-5 text-black/60" />
                </div>
              </Card>

              <Card className="p-6 border border-black/10 bg-white shadow-sm rounded-[22px] hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/50 mb-2">
                      Status
                    </p>
                    <p
                      className={`font-semibold ${
                        user?.emailVerified
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {user?.emailVerified ? "✓ Verified" : "Pending"}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-black/60" />
                </div>
              </Card>

              <Card className="p-6 border border-black/10 bg-white shadow-sm rounded-[22px] hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/50 mb-2">
                      Auth Provider
                    </p>
                    <p className="font-semibold text-black">
                      {user?.providerData[0]?.providerId === "google.com"
                        ? "Google"
                        : "Email"}
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-black/60" />
                </div>
              </Card>

              <Card className="p-6 border border-black/10 bg-white shadow-sm rounded-[22px] hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-black/50 mb-2">
                      User ID
                    </p>
                    <p className="font-mono text-xs text-black/60 truncate">
                      {user?.uid?.substring(0, 12)}...
                    </p>
                  </div>
                  <User className="w-5 h-5 text-black/60" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group relative rounded-[22px] border border-black/10 bg-white p-6 text-left transition-all duration-300 hover:border-lime-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-lime-300/20 text-black group-hover:bg-lime-300 transition-colors">
                        {action.icon}
                      </div>
                      <h3 className="mb-2 font-semibold text-black">
                        {action.title}
                      </h3>
                      <p className="mb-4 text-sm text-black/60">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold text-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                        Get started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <Card className="p-8 border border-black/10 bg-white shadow-sm rounded-[22px]">
              <div className="flex items-start gap-6">
                <div className="rounded-xl bg-lime-300/20 p-4 text-black">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-black">
                    Account Information
                  </h3>
                  <p className="mb-4 text-black/60">
                    Your account is secured and authenticated. You have full
                    access to all VoiceLink features and services.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/alerts")}
                      size="sm"
                      className="h-10 gap-2 rounded-xl bg-black text-white hover:bg-lime-600 active:scale-95 transition-all"
                    >
                      <Bell className="w-4 h-4" />
                      Submit Alert
                    </Button>
                    <Button
                      onClick={() => navigate("/community")}
                      variant="outline"
                      size="sm"
                      className="h-10 gap-2 rounded-xl border-black/20 text-black hover:bg-black/5 active:scale-95 transition-all"
                    >
                      <Users className="w-4 h-4" />
                      Join Community
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-black">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Card
                  key={activity.id}
                  className="p-6 border border-black/10 bg-white shadow-sm rounded-[22px] hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{activity.icon}</div>
                    <div className="flex-grow">
                      <h3 className="mb-1 font-semibold text-black">
                        {activity.title}
                      </h3>
                      <p className="mb-2 text-sm text-black/60">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-black/50">
                        <Clock className="w-4 h-4" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="ml-7 mt-4 h-8 border-l border-black/10" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="mt-12 flex justify-end border-t border-black/10 pt-8">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-black/50 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
