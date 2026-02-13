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
  Smartphone
} from "lucide-react";
import BrandIcon from "@/components/BrandIcon";

const ModerationDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
              <BrandIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">VoiceLink</span>
              <p className="text-xs text-slate-500 font-medium">Pro</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 mb-3 px-3 tracking-wider">MENU</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30">
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all hover:text-slate-900">
              <MessageSquare className="w-5 h-5" />
              Messages
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">24</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all hover:text-slate-900">
              <Users className="w-5 h-5" />
              Contacts
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all hover:text-slate-900">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
          </div>

          <div className="space-y-1 mt-8">
            <p className="text-[10px] font-bold text-slate-400 mb-3 px-3 tracking-wider">GENERAL</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all hover:text-slate-900">
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-all hover:text-slate-900">
              <HelpCircle className="w-5 h-5" />
              Help
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 font-medium transition-all hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>

        {/* Download App Card */}
        <div className="p-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <CardContent className="p-5 relative">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3 shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base mb-1">Download Mobile App</h3>
                <p className="text-xs text-slate-300">Manage campaigns on the go</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg border-0 font-semibold">
                Download Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Plan, prioritize, and manage your campaigns with ease.</p>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search campaigns..."
                  className="w-full pl-11 pr-16 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-semibold">⌘F</span>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium">
                <Upload className="w-4 h-4" />
                Import Data
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0 font-semibold">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className={`${index === 0 ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white border-0 shadow-xl shadow-blue-500/20' : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${index === 0 ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-slate-50 to-slate-100'} shadow-sm`}>
                      {index === 0 && <MessageSquare className="w-5 h-5" />}
                      {index === 1 && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                      {index === 2 && <TrendingUp className="w-5 h-5 text-blue-600" />}
                      {index === 3 && <Users className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${index === 0 ? 'text-white/80' : 'text-slate-500'} mb-2 uppercase tracking-wide`}>{stat.label}</p>
                    <p className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-slate-900'} mb-1.5`}>{stat.value}</p>
                    <p className={`text-xs font-medium ${index === 0 ? 'text-white/70' : 'text-slate-400'}`}>
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
            <Card className="lg:col-span-2 bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Message Analytics</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Weekly delivery performance</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64 flex items-end justify-between gap-3 px-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const heights = [40, 80, 65, 90, 50, 45, 70];
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                        <div 
                          className={`w-full rounded-t-xl transition-all duration-300 ${i === 2 || i === 3 ? 'bg-gradient-to-t from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-t from-slate-200 to-slate-300 group-hover:from-slate-300 group-hover:to-slate-400'}`}
                          style={{ height: `${heights[i]}%` }}
                        />
                        <span className="text-xs text-slate-600 font-semibold">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Start a new campaign</p>
                </div>
                <Button size="sm" className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-md">New</Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1 text-slate-900">Compose SMS</h4>
                      <p className="text-xs text-slate-600">Send to your customers</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-lg shadow-blue-500/25 font-semibold" onClick={() => navigate('/dashboard')}>
                    Start Composing
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Groups</p>
                  {contactGroups.map((group, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group">
                      <div className={`w-2.5 h-2.5 rounded-full ${group.color} shadow-sm`} />
                      <span className="text-sm flex-1 font-medium text-slate-700 group-hover:text-slate-900">{group.name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{group.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Messages */}
            <Card className="lg:col-span-2 bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Recent Campaigns</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Latest messaging activities</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs hover:bg-slate-100 font-medium">View All</Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-200">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        {msg.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 mb-0.5">{msg.title}</p>
                        <p className="text-xs text-slate-500 truncate">{msg.group} • {msg.recipients} recipients</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        msg.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        msg.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Progress */}
            <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Delivery Status</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Real-time overview</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-8">
                <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="#e2e8f0" strokeWidth="16" fill="none" />
                    <circle cx="96" cy="96" r="80" stroke="url(#gradient)" strokeWidth="16" fill="none"
                      strokeDasharray={`${2 * Math.PI * 80 * 0.41} ${2 * Math.PI * 80}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">41%</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm" />
                    <span className="text-sm text-slate-700 font-medium flex-1">Delivered</span>
                    <span className="text-sm font-bold text-emerald-700">41%</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" />
                    <span className="text-sm text-slate-700 font-medium flex-1">In Progress</span>
                    <span className="text-sm font-bold text-blue-700">27%</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-3 h-3 rounded-full bg-slate-400 shadow-sm" />
                    <span className="text-sm text-slate-700 font-medium flex-1">Pending</span>
                    <span className="text-sm font-bold text-slate-700">32%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModerationDashboard;
