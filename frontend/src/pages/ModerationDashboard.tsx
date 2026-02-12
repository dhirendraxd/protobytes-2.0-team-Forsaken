import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Send, CheckCircle, AlertTriangle, LogOut, Home } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { useState } from "react";
import BriefingEditor from "@/components/moderator/BriefingEditor";
import SMSAlertCenter from "@/components/moderator/SMSAlertCenter";
import ContentApproval from "@/components/moderator/ContentApproval";
import DisasterMonitor from "@/components/moderator/DisasterMonitor";

const ModerationDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("home");

  const handleLogout = async () => {
    await signOut();
  };

  // Core moderation features - only 4 essential tools
  const features = [
    {
      id: "briefings",
      title: "Create Briefing",
      description: "Create and schedule weekly content briefings",
      icon: <FileText className="w-8 h-8" />,
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      accentColor: "text-blue-600",
    },
    {
      id: "sms",
      title: "Send Alert",
      description: "Send urgent SMS notifications to communities",
      icon: <Send className="w-8 h-8" />,
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      accentColor: "text-orange-600",
    },
    {
      id: "approvals",
      title: "Review Content",
      description: "Approve or reject community submissions",
      icon: <CheckCircle className="w-8 h-8" />,
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      accentColor: "text-green-600",
    },
    {
      id: "disasters",
      title: "Monitor Disasters",
      description: "Track active emergencies from ReliefWeb",
      icon: <AlertTriangle className="w-8 h-8" />,
      color: "from-red-500/20 to-red-600/20",
      borderColor: "border-red-500/30",
      accentColor: "text-red-600",
    },
  ];

  const stats = [
    { label: "Pending Reviews", value: "5" },
    { label: "Active Briefings", value: "12" },
    { label: "Alerts Sent", value: "247" },
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
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BrandIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold">VoiceLink</span>
              <span className="text-xs text-muted-foreground block">Moderation</span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
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
        <div className="flex gap-8">
          {/* Sidebar with Stats */}
          <div className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">QUICK STATS</h3>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 bg-card/50 border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">USER</h3>
              <p className="font-medium">{user?.displayName || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeSection === "home" ? (
              <div className="space-y-8">
                {/* Welcome */}
                <div>
                  <h1 className="text-4xl font-bold mb-2">Moderation Dashboard</h1>
                  <p className="text-lg text-muted-foreground">
                    Manage content, send alerts, and monitor emergencies
                  </p>
                </div>

                {/* Features Grid - 2x2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => setActiveSection(feature.id)}
                      className={`group relative p-8 rounded-2xl border-2 ${feature.borderColor} bg-gradient-to-br ${feature.color} hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/5 transition-all duration-300" />
                      <div className="relative z-10">
                        <div className={`mb-6 ${feature.accentColor} group-hover:scale-110 transition-transform inline-block`}>
                          {feature.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                          {feature.title}
                        </h2>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeSection === "briefings" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">Create Briefing</h1>
                    <p className="text-muted-foreground">Schedule content for your community</p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("home")}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
                <BriefingEditor />
              </div>
            ) : activeSection === "sms" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">Send Alert</h1>
                    <p className="text-muted-foreground">Send urgent SMS notifications</p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("home")}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
                <SMSAlertCenter />
              </div>
            ) : activeSection === "approvals" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">Review Content</h1>
                    <p className="text-muted-foreground">Approve or reject submissions</p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("home")}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
                <ContentApproval />
              </div>
            ) : activeSection === "disasters" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">Disaster Monitoring</h1>
                    <p className="text-muted-foreground">Track active emergencies</p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("home")}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
                <DisasterMonitor />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationDashboard;
