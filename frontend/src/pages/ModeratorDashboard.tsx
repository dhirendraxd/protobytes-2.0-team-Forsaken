import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Bell,
  CheckCircle,
  Users,
  FolderTree,
  Send,
  TrendingUp,
  Calendar,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BriefingEditor from "@/components/moderator/BriefingEditor";
import CategoryManager from "@/components/moderator/CategoryManager";
import SMSAlertCenter from "@/components/moderator/SMSAlertCenter";
import ContentApproval from "@/components/moderator/ContentApproval";
import DisasterMonitor from "@/components/moderator/DisasterMonitor";
import Navbar from "@/components/Navbar";

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

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
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-10">
        <Navbar />

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-[40px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[48px] lg:text-[56px] mb-2">
            Moderator Dashboard
          </h1>
          <p className="text-base text-black/60">
            Welcome, {user?.displayName || user?.email?.split("@")[0]} · Manage
            content and community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 border border-black/10 bg-white shadow-none"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-300 text-black">
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-3xl font-semibold text-black mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-black/60">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="group relative rounded-xl border border-black/10 bg-white p-6 text-left transition-all duration-300 hover:border-black/30"
              >
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-300 text-black">
                    {action.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-black">
                    {action.title}
                  </h3>
                  <p className="text-sm text-black/60">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-6 w-full mb-6 bg-white border border-black/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="briefings">Briefings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="sms">SMS Alerts</TabsTrigger>
            <TabsTrigger value="disasters">Disasters</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 border border-black/10 bg-white shadow-none">
              <h3 className="text-xl font-semibold text-black mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-black/10 last:border-0"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-300 text-black">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-black">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-black/60">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-black/50">
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
