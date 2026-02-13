import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  Home, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Search,
  Bell,
  Send,
  Upload,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Smartphone,
  Calendar
} from "lucide-react";
import BrandIcon from "@/components/BrandIcon";

const ModerationDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleMessagesClick = () => {
    navigate('/dashboard/messages');
  };

  const handleContactsClick = () => {
    navigate('/dashboard/contacts');
  };

  const handleAnalyticsClick = () => {
    navigate('/dashboard/analytics');
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const stats = [
    { 
      label: "Total Messages", 
      value: "12,450", 
      change: "+15%",
      trend: "up",
      subtitle: "Increased from last month"
    },
    { 
      label: "Delivered Messages", 
      value: "12,254", 
      change: "+8%",
      trend: "up",
      subtitle: "98.5% delivery rate"
    },
    { 
      label: "This Month", 
      value: "3,247", 
      change: "+22%",
      trend: "up",
      subtitle: "Active campaigns"
    },
    { 
      label: "Active Contacts", 
      value: "8,932", 
      change: "-3%",
      trend: "down",
      subtitle: "Verified numbers"
    },
  ];

  const recentMessages = [
    {
      id: 1,
      title: "Summer Sale Campaign",
      group: "VIP Customers",
      status: "Delivered",
      recipients: 450
    },
    {
      id: 2,
      title: "New Product Launch",
      group: "All Contacts",
      status: "In Progress",
      recipients: 1234
    },
    {
      id: 3,
      title: "Payment Reminder",
      group: "Regular Customers",
      status: "Pending",
      recipients: 380
    },
    {
      id: 4,
      title: "Event Invitation",
      group: "New Subscribers",
      status: "Delivered",
      recipients: 404
    },
  ];

  const contactGroups = [
    { name: "VIP Customers", count: 450, color: "bg-violet-500" },
    { name: "Regular Customers", count: 380, color: "bg-blue-500" },
    { name: "New Subscribers", count: 404, color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-400/20">
              <BrandIcon className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-lg font-bold">VoiceLink</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-300/60 mb-3 px-3 uppercase tracking-wider">MENU</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/30 text-emerald-100 font-medium hover:bg-emerald-600/50 transition-all border border-emerald-500/30"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button 
              onClick={handleMessagesClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-700/30 font-medium transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Messages
              <span className="ml-auto bg-emerald-500/40 text-emerald-100 text-xs px-2 py-0.5 rounded-full font-semibold">24</span>
            </button>
            <button 
              onClick={handleContactsClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-700/30 font-medium transition-all"
            >
              <Users className="w-5 h-5" />
              Contacts
            </button>
            <button 
              onClick={handleAnalyticsClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-700/30 font-medium transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </div>

          <div className="space-y-1 mt-8">
            <p className="text-xs font-semibold text-emerald-300/60 mb-3 px-3 uppercase tracking-wider">GENERAL</p>
            <button 
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-700/30 font-medium transition-all"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button 
              onClick={handleHelpClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-emerald-100 hover:bg-emerald-700/30 font-medium transition-all"
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-200/70 hover:text-red-300 hover:bg-red-600/20 font-medium transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>

        {/* User Profile Card */}
        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-600/30 border border-emerald-500/30">
            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-100 truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-emerald-300/60 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your communication campaigns</p>
            </div>
            
            {/* Date Range & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>January 2024 - May 2024</span>
              </div>
              
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className={`${index === 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 shadow-lg' : 'bg-white border border-emerald-100 shadow-md hover:shadow-lg transition-shadow'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${index === 0 ? 'bg-white/20' : 'bg-emerald-50'}`}>
                      {index === 0 && <MessageSquare className="w-5 h-5" />}
                      {index === 1 && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                      {index === 2 && <TrendingUp className="w-5 h-5 text-teal-600" />}
                      {index === 3 && <Users className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${index === 0 ? 'text-white/80' : 'text-gray-500'} mb-1`}>{stat.label}</p>
                    <p className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-gray-900'} mb-1`}>{stat.value}</p>
                    <p className={`text-xs ${index === 0 ? 'text-white/70' : 'text-gray-400'}`}>
                      {stat.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Message Analytics */}
            <Card className="lg:col-span-2 bg-white border border-emerald-100 shadow-md">
              <CardHeader className="border-b border-emerald-100">
                <CardTitle className="text-lg font-bold text-gray-900">Message Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const heights = [40, 80, 65, 90, 50, 45, 70];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={`w-full rounded-t-lg ${i === 2 || i === 3 ? 'bg-emerald-600' : 'bg-emerald-100'}`}
                          style={{ height: `${heights[i]}%` }}
                        />
                        <span className="text-xs text-gray-500 font-medium">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-emerald-100 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100">
                <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
                <Button size="sm" variant="outline" className="text-xs">New</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1 text-gray-900">Compose SMS</h4>
                      <p className="text-xs text-gray-600">Send to customers</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm border-0" onClick={() => navigate('/dashboard')}>
                    Start Composing
                  </Button>
                </div>
                <div className="space-y-2">
                  {contactGroups.map((group, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors">
                      <div className={`w-2 h-2 rounded-full ${group.color}`}></div>
                      <span className="text-sm flex-1 text-gray-700">{group.name}</span>
                      <span className="text-xs text-emerald-600 font-medium">{group.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Messages */}
            <Card className="lg:col-span-2 bg-white border border-emerald-100 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-100">
                <CardTitle className="text-lg font-bold text-gray-900">Recent Campaigns</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {msg.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{msg.title}</p>
                        <p className="text-xs text-gray-500 truncate">{msg.group}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        msg.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Progress */}
            <Card className="bg-white border border-emerald-100 shadow-md">
              <CardHeader className="border-b border-emerald-100">
                <CardTitle className="text-lg font-bold text-gray-900">Delivery Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#d1fae5" strokeWidth="16" fill="none" />
                    <circle cx="96" cy="96" r="80" stroke="#10b981" strokeWidth="16" fill="none"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.41} ${2 * Math.PI * 80}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900">41%</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    <span className="text-sm text-gray-700">Delivered</span>
                    <span className="ml-auto text-sm font-bold text-emerald-700">41%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-gray-700">In Progress</span>
                    <span className="ml-auto text-sm font-bold text-amber-700">27%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-200"></div>
                    <span className="text-sm text-gray-700">Pending</span>
                    <span className="ml-auto text-sm font-bold text-emerald-600">32%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white shadow-2xl">
            <CardHeader className="border-b border-emerald-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Account Settings</CardTitle>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-600 mt-1">{user?.email}</p>
              </div>
              <div className="border-t pt-4">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white shadow-2xl">
            <CardHeader className="border-b border-emerald-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Help & Support</CardTitle>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">VoiceLink Documentation</h3>
                <p className="text-sm text-gray-600 mb-3">Learn how to use VoiceLink to send SMS and voice messages to your customers.</p>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  📖 View Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  💬 Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  ❓ FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModerationDashboard;
