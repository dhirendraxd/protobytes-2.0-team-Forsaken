import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogOut,
  User,
  Mail,
  Shield,
  Home,
  Bell,
  Users,
  Phone,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
} from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
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
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      action: () => navigate("/"),
    },
    {
      id: "alerts",
      icon: <Bell className="w-6 h-6" />,
      title: "Submit Alert",
      description: "Report a community issue or update",
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      action: () => navigate("/alerts"),
    },
    {
      id: "community",
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Connect with other users",
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      action: () => navigate("/community"),
    },
    {
      id: "prices",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Market Prices",
      description: "View current market information",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      action: () => navigate("/market-prices"),
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
      icon: <Shield className="w-5 h-5" />,
    },
    {
      label: "Auth Method",
      value:
        user?.providerData[0]?.providerId === "google.com"
          ? "Google"
          : "Email",
      color: "text-blue-600",
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-3 hover:scale-105 transition-transform"
          >
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20">
              <BrandIcon className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold hover:text-primary transition-colors">
              VoiceLink
            </span>
          </a>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              title="Go to Homepage"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              onClick={() => navigate("/alerts")}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              title="View Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground opacity-60 hover:opacity-100 hover:text-red-500"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-3">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  {user?.displayName?.split(" ")[0] ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                You're authenticated and ready to use VoiceLink
              </p>
            </div>
            {user?.photoURL && (
              <div className="flex-shrink-0">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-primary shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border/50">
          {["overview", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors capitalize border-b-2 ${
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
              <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Email</p>
                    <p className="font-semibold text-foreground break-all text-sm">
                      {user?.email}
                    </p>
                  </div>
                  <Mail className="w-5 h-5 text-primary" />
                </div>
              </Card>

              <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
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
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </Card>

              <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Auth Provider
                    </p>
                    <p className="font-semibold text-foreground">
                      {user?.providerData[0]?.providerId === "google.com"
                        ? "Google"
                        : "Email"}
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
              </Card>

              <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      User ID
                    </p>
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {user?.uid?.substring(0, 12)}...
                    </p>
                  </div>
                  <User className="w-5 h-5 text-purple-600" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`group relative p-6 rounded-xl border-2 ${action.borderColor} bg-gradient-to-br ${action.color} hover:border-primary/50 transition-all duration-300 text-left overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300" />
                    <div className="relative z-10">
                      <div className="mb-4 text-primary group-hover:scale-110 transition-transform inline-block">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Get started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <Card className="p-8 border border-border/50 backdrop-blur-sm bg-card/50">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Account Information
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your account is secured and authenticated. You have full
                    access to all VoiceLink features and services.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/alerts")}
                      size="sm"
                      className="gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Submit Alert
                    </Button>
                    <Button
                      onClick={() => navigate("/community")}
                      variant="outline"
                      size="sm"
                      className="gap-2"
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
            <h2 className="text-2xl font-bold text-foreground">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Card
                  key={activity.id}
                  className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{activity.icon}</div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="h-8 border-l border-border/50 ml-7 mt-4" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="mt-12 pt-8 border-t border-border/50 flex justify-end">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground opacity-60 hover:opacity-100 hover:text-red-500"
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
