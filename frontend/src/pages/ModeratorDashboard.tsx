import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  FileText,
  Bell,
  CheckCircle,
  Users,
  FolderTree,
  Send,
  TrendingUp,
  Calendar,
  MapPin,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import BrandIcon from "@/components/BrandIcon";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BriefingEditor from "@/components/moderator/BriefingEditor";
import CategoryManager from "@/components/moderator/CategoryManager";
import SMSAlertCenter from "@/components/moderator/SMSAlertCenter";
import ContentApproval from "@/components/moderator/ContentApproval";
import DisasterMonitor from "@/components/moderator/DisasterMonitor";

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  const handleLogout = async () => {
    await signOut();
  };

  const stats = [
    {
      label: "Pending Approvals",
      value: "5",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      label: "Active Briefings",
      value: "12",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      label: "SMS Sent (Today)",
      value: "247",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      icon: <Send className="w-6 h-6" />,
    },
    {
      label: "Active Users",
      value: "1,234",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      icon: <Users className="w-6 h-6" />,
    },
  ];

  const quickActions = [
    {
      id: "create-briefing",
      title: "Create Weekly Briefing",
      description: "Draft and schedule new content",
      icon: <FileText className="w-6 h-6" />,
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      action: () => setActiveSection("briefings"),
    },
    {
      id: "send-sms",
      title: "Send SMS Alert",
      description: "Send urgent notifications",
      icon: <Send className="w-6 h-6" />,
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      action: () => setActiveSection("sms"),
    },
    {
      id: "approve-content",
      title: "Review Submissions",
      description: "Approve pending content",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      action: () => setActiveSection("approvals"),
    },
    {
      id: "manage-categories",
      title: "Manage Categories",
      description: "Edit content categories",
      icon: <FolderTree className="w-6 h-6" />,
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      action: () => setActiveSection("categories"),
    },
    {
      id: "disaster-monitor",
      title: "Disaster Alerts",
      description: "Monitor emergencies (ReliefWeb)",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-red-500/20 to-red-600/20",
      borderColor: "border-red-500/30",
      action: () => setActiveSection("disasters"),
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "briefing",
      title: "Weekly Briefing Published",
      description: "Agriculture update for Region A",
      timestamp: "2 hours ago",
      user: "John Doe",
    },
    {
      id: 2,
      type: "sms",
      title: "SMS Alert Sent",
      description: "Weather warning to 450 users",
      timestamp: "5 hours ago",
      user: "Jane Smith",
    },
    {
      id: 3,
      type: "approval",
      title: "Content Approved",
      description: "Market prices update",
      timestamp: "1 day ago",
      user: "You",
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
            <div>
              <span className="text-2xl font-bold hover:text-primary transition-colors block">
                VoiceLink
              </span>
              <span className="text-xs text-muted-foreground">
                Moderator Portal
              </span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Moderator Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {user?.displayName || user?.email?.split("@")[0]} · Manage
            content and community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor} backdrop-blur-sm hover:border-primary/50 transition-colors`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-6 w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="briefings">Briefings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="sms">SMS Alerts</TabsTrigger>
            <TabsTrigger value="disasters">Disasters</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-foreground">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp} · by {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Briefings Tab */}
          <TabsContent value="briefings">
            <BriefingEditor />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms">
            <SMSAlertCenter />
          </TabsContent>

          {/* Disasters Tab */}
          <TabsContent value="disasters">
            <DisasterMonitor />
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals">
            <ContentApproval />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
