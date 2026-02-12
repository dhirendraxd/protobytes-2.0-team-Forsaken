import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendContributorWelcomeEmail } from '@/services/emailService';
import { AlertReviewCard } from '@/components/AlertReviewCard';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  TrendingUp,
  Users,
  LogOut,
  User,
  Edit,
  AlertTriangle,
  Calendar,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  BarChart3,
  UserCheck,
  Clock,
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  interface UserData {
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    village?: string;
    province?: string;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<{full_name?: string; phone?: string; email?: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  
  interface PendingApp {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    area: string;
    status: string;
    applied_at: string;
  }
  
  const [pendingApplications, setPendingApplications] = useState<PendingApp[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [managedContributors, setManagedContributors] = useState<any[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [editingContributorId, setEditingContributorId] = useState<string | null>(null);
  const [contributionCount, setContributionCount] = useState<number>(0);
  const [showAddContributorDialog, setShowAddContributorDialog] = useState(false);
  const [incomingAlerts, setIncomingAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [newContributor, setNewContributor] = useState({
    name: "",
    phone: "",
    email: "",
    reason: "",
    contributor_id: "",
    role: "",
    coverage_area: ""
  });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditContributorDialog, setShowEditContributorDialog] = useState(false);
  const [editContributor, setEditContributor] = useState<any>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<{type: 'alert' | 'approval', data: any} | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'progress'>('summary');
  const [activityStats, setActivityStats] = useState<{alertsSent: number[], reviews: number[], approvals: number[]}>(
    { alertsSent: [], reviews: [], approvals: [] }
  );

  useEffect(() => {
    // DEV MODE: Skip authentication for development
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');

    if (!isLoggedIn || !storedUserData) {
      // Create demo user data for development
      const demoUserData = {
        user_id: 'demo_user_123',
        full_name: 'Demo Moderator',
        email: 'demo@example.com',
        phone: '+977-9800000000',
        village: 'Demo Village',
        province: 'Demo Province'
      };
      
      setUserData(demoUserData);
      setEditForm(demoUserData);
      
      // Fetch data with demo user
      fetchPendingApplications(demoUserData);
      fetchManagedContributors(demoUserData);
      fetchIncomingAlerts(demoUserData);
      
      setIsLoading(false);
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      setEditForm(parsedUserData);
      
      // Fetch pending contributor applications for this moderator's area
      fetchPendingApplications(parsedUserData);
      fetchManagedContributors(parsedUserData);
      fetchIncomingAlerts(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Use demo data on error
      const demoUserData = {
        user_id: 'demo_user_123',
        full_name: 'Demo Moderator',
        email: 'demo@example.com',
        phone: '+977-9800000000',
        village: 'Demo Village',
        province: 'Demo Province'
      };
      setUserData(demoUserData);
      setEditForm(demoUserData);
    }

    setIsLoading(false);
  }, [navigate]);

  const fetchPendingApplications = async (user: any) => {
    if (!user?.province || !user?.village) return;
    
    setLoadingApplications(true);
    // MOCK DATA - No database
    setTimeout(() => {
      const mockApps: PendingApp[] = [
        {
          id: 'app-1',
          full_name: 'Sita Sharma',
          email: 'sita@example.com',
          phone: '+977-9841234567',
          area: user.village,
          status: 'pending',
          applied_at: new Date().toISOString()
        },
        {
          id: 'app-2',
          full_name: 'Hari Thapa',
          email: 'hari@example.com',
          phone: '+977-9857654321',
          area: user.village,
          status: 'pending',
          applied_at: new Date().toISOString()
        }
      ];
      setPendingApplications(mockApps);
      setLoadingApplications(false);
    }, 300);
  };

  const fetchManagedContributors = async (user: any) => {
    if (!user?.province || !user?.village) return;
    
    setLoadingContributors(true);
    // MOCK DATA - No database
    setTimeout(() => {
      const mockContributors = [
        {
          id: 'cont-1',
          full_name: 'Ram Bahadur',
          email: 'ram@example.com',
          phone: '+977-9801111111',
          village: user.village,
          province: user.province,
          contributor_id: 'CONT-0001',
          status: 'approved'
        },
        {
          id: 'cont-2',
          full_name: 'Maya Gurung',
          email: 'maya@example.com',
          phone: '+977-9802222222',
          village: user.village,
          province: user.province,
          contributor_id: 'CONT-0002',
          status: 'approved'
        }
      ];
      setManagedContributors(mockContributors);
      setLoadingContributors(false);
    }, 300);
  };

  const fetchIncomingAlerts = async (user: any) => {
    if (!user?.province || !user?.village) return;
    
    setLoadingAlerts(true);
    // MOCK DATA - No database
    setTimeout(() => {
      const mockAlerts = [
        {
          id: 'alert-1',
          alert_text: 'Road blocked due to landslide near Ward 3',
          village: user.village,
          province: user.province,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          submitted_by: 'Contributor 1'
        },
        {
          id: 'alert-2',
          alert_text: 'Water shortage in Ward 5',
          village: user.village,
          province: user.province,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          submitted_by: 'Contributor 2'
        },
        {
          id: 'alert-3',
          alert_text: 'Power outage affecting entire village',
          village: user.village,
          province: user.province,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          submitted_by: 'Contributor 3'
        }
      ];
      setIncomingAlerts(mockAlerts);
      setLoadingAlerts(false);
      
      // Fetch weekly activity data
      fetchWeeklyActivity(user);
    }, 300);
  };

  const fetchWeeklyActivity = async (user: any) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const weekData = [];
      const alertsData = [];
      const reviewsData = [];
      const approvalsData = [];

      // STATIC MOCK DATA FOR UI - No database needed
      const mockDataCounts = [3, 2, 4, 1, 5, 2, 3]; // Items per day (Sun-Sat)
      
      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(startOfWeek);
        dayStart.setDate(startOfWeek.getDate() + i);
        
        const count = mockDataCounts[i];
        
        // Mock alerts
        const mockAlerts = Array.from({ length: count }, (_, idx) => ({
          id: `mock-alert-${i}-${idx}`,
          alert_text: `Alert ${idx + 1}: Road blocked in ${user.village} due to landslide.`,
          village: user.village,
          province: user.province,
          submitted_by: `Contributor ${idx + 1}`,
          contact: `+977-980000${String(idx).padStart(4, '0')}`,
          accepted_at: new Date(dayStart.getTime() + idx * 3600000).toISOString(),
          status: 'accepted'
        }));

        // Mock approvals
        const mockApprovals = Array.from({ length: Math.ceil(count / 2) }, (_, idx) => ({
          id: `mock-approval-${i}-${idx}`,
          name: `Ram Bahadur ${idx + 1}`,
          full_name: `Ram Bahadur ${idx + 1}`,
          email: `ram${idx}@example.com`,
          phone: `+977-984000${String(idx).padStart(4, '0')}`,
          village: user.village,
          province: user.province,
          contributor_id: `CONT-${String(i * 10 + idx).padStart(4, '0')}`,
          role: 'Contributor',
          coverage_area: `Ward ${idx + 1}`,
          approved_at: new Date(dayStart.getTime() + idx * 7200000).toISOString(),
          approved_by: user.full_name
        }));

        alertsData.push(mockAlerts.length);
        approvalsData.push(mockApprovals.length);
        reviewsData.push(mockAlerts.length + mockApprovals.length);

        weekData.push({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          date: dayStart,
          alerts: mockAlerts,
          approvals: mockApprovals,
          totalActivity: mockAlerts.length + mockApprovals.length
        });
      }

      setWeeklyActivity(weekData);
      setActivityStats({
        alertsSent: alertsData,
        reviews: reviewsData,
        approvals: approvalsData
      });
      
      // Don't auto-select - keep summary view as default
      setSelectedDayData(null);
      
    } catch (error) {
      console.error("Error in fetchWeeklyActivity:", error);
    }
  };

  const handleAcceptAlert = async (alertId: string, contactNumber: string, sourceNumber: string) => {
    // MOCK - No database for UI development
    toast({
      title: "Success",
      description: "Alert accepted successfully (UI Mode)",
    });
    setIncomingAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleRejectAlert = async (alertId: string, reason: string) => {
    // MOCK - No database for UI development
    toast({
      title: "Alert Rejected",
      description: "Alert has been rejected (UI Mode)",
    });
    setIncomingAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleApproveContributor = async (appId: string) => {
    // MOCK - No database for UI development
    toast({
      title: "Success",
      description: "Contributor approved successfully (UI Mode)",
    });
    setPendingApplications(prev => prev.filter(app => app.id !== appId));
  };

  const handleRejectContributor = async (appId: string, reason: string) => {
    // MOCK - No database for UI development
    toast({
      title: "Application Rejected",
      description: `Contributor application rejected (UI Mode)`,
    });
    setPendingApplications(prev => prev.filter(app => app.id !== appId));
  };

  const handleSendSMSNotification = async (phone: string, name: string, contributorId: string) => {
    // MOCK - SMS simulation
    toast({
      title: "SMS Sent (Simulated)",
      description: `Welcome message sent to ${phone}`,
    });
  };

  const handleSendEmailNotification = async (email: string, name: string, contributorId: string) => {
    // MOCK - Email simulation
    toast({
      title: "Email Sent (Simulated)",
      description: `Welcome email sent to ${email}`,
    });
  };

  const handleAddContributor = async (newContributor: any) => {
    // MOCK - No database for UI development
    const contributorId = `CONT-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    
    toast({
      title: "Success",
      description: `Contributor ${newContributor.full_name} added with ID: ${contributorId} (UI Mode)`,
    });

    setShowAddContributorDialog(false);
    setNewContributor({
      name: '',
      email: '',
      phone: '',
      coverage_area: '',
      reason: '',
      contributor_id: '',
      role: ''
    });
  };

  const handleUpdateProfile = async () => {
    // MOCK - No database for UI development
    const updatedData = { ...userData, ...editForm };
    setUserData(updatedData);
    setShowEditDialog(false);
    
    toast({
      title: "Success",
      description: "Profile updated successfully (UI Mode)",
    });
  };

  const handleEditContributor = async (contributorId: string, updates: any) => {
    // MOCK - No database for UI development
    setManagedContributors(prev => 
      prev.map(c => c.id === contributorId ? { ...c, ...updates } : c)
    );
    setShowEditContributorDialog(false);
    setEditContributor(null);
    
    toast({
      title: "Success",
      description: "Contributor updated successfully (UI Mode)",
    });
  };

  const handleDeleteContributor = async (contributorId: string) => {
    // MOCK - No database for UI development
    setManagedContributors(prev => prev.filter(c => c.id !== contributorId));
    
    toast({
      title: "Success",
      description: "Contributor deleted successfully (UI Mode)",
    });
  };

  const handleUpdateContributor = async () => {
    // MOCK - No database for UI development
    toast({
      title: "Success",
      description: "Contributor updated successfully (UI Mode)",
    });
    setShowEditContributorDialog(false);
  };

  const handleUpdateContributions = async (contributorId: string, newCount: number) => {
    // MOCK - No database for UI development
    setManagedContributors(prev => 
      prev.map(c => c.id === contributorId ? { ...c, contributions: newCount } : c)
    );
    setEditingContributorId(null);
    toast({
      title: "Contributions Updated",
      description: `Contribution count updated to ${newCount} (UI Mode)`,
    });
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/auth');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditForm(userData);
  };

  const handleApproveApplication = async (application: any) => {
    try {
      // Update application status to approved (no new entry created)
      const appRef = doc(db, "contributor_applications", application.id);
      await updateDoc(appRef, {
        status: "approved",
        approved_by: userData?.email,
        approved_at: new Date().toISOString(),
        contributions: 0, // Initialize contribution count
      });

      // Send approval email to contributor
      if (application.email) {
        try {
          await sendContributorWelcomeEmail({
            email: application.email,
            name: application.name,
            village: application.village,
            province: application.province,
          });
        } catch (emailError) {
          console.error('❌ Error sending approval email:', emailError);
        }
      }

      toast({
        title: "Application Approved",
        description: `${application.name} has been added as a contributor. ${application.email ? 'An approval email has been sent.' : ''}`,
      });

      // Refresh applications and contributors
      fetchPendingApplications(userData);
      fetchManagedContributors(userData);
    } catch (error) {
      console.error("Error approving application:", error);
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (application: any) => {
    try {
      const appRef = doc(db, "contributor_applications", application.id);
      await updateDoc(appRef, {
        status: "rejected",
        rejected_by: userData?.email,
        rejected_at: new Date().toISOString(),
      });

      toast({
        title: "Application Rejected",
        description: `Application from ${application.name} has been rejected.`,
      });

      // Refresh applications
      fetchPendingApplications(userData);
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update Firestore
      const applicationsRef = collection(db, "mod_applications");
      const q = query(
        applicationsRef,
        where("email", "==", userData.email),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, "mod_applications", querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone,
          updatedAt: new Date().toISOString(),
        });

        // Update localStorage
        const updatedData = { ...userData, ...editForm };
        setUserData(updatedData);
        localStorage.setItem('userData', JSON.stringify(updatedData));

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:px-12 lg:py-12 max-w-[1400px]">
        {/* URGENT SECTION - Top Priority Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-10">
          {/* Incoming Alerts - Highest Priority */}
          <Card className="p-4 lg:p-8 bg-transparent backdrop-blur-sm border-l-4 border-l-red-500 border-y-0 border-r-0">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-red-500/10 rounded-xl">
                    <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold tracking-tight">Incoming Alerts</h3>
                  {incomingAlerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2">{incomingAlerts.length}</Badge>
                  )}
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground ml-11 lg:ml-14 font-medium">Critical alerts requiring immediate attention</p>
              </div>
            </div>

            {loadingAlerts ? (
              <p className="text-muted-foreground">Loading alerts...</p>
            ) : incomingAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No incoming alerts</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {incomingAlerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="border rounded-lg p-3 hover:bg-red-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.alert_text?.substring(0, 60)}...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          From: {alert.contributor_name || 'Anonymous'}
                        </p>
                      </div>
                      <Badge className="bg-red-600 shrink-0">Urgent</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.village}
                      </span>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <FileText className="w-3 h-3" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                {incomingAlerts.length > 3 && (
                  <Button variant="link" size="sm" className="w-full">
                    View all {incomingAlerts.length} alerts →
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Pending Applications - High Priority */}
          <Card className="p-4 lg:p-8 bg-transparent backdrop-blur-sm border-l-4 border-l-orange-500 border-y-0 border-r-0">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-orange-500/10 rounded-xl">
                    <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold tracking-tight">Pending Applications</h3>
                  {pendingApplications.length > 0 && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600 ml-2">{pendingApplications.length}</Badge>
                  )}
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground ml-11 lg:ml-14 font-medium">New contributor applications pending review</p>
              </div>
            </div>

            {loadingApplications ? (
              <p className="text-muted-foreground">Loading applications...</p>
            ) : pendingApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No pending applications</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingApplications.slice(0, 3).map((app: any) => (
                  <div key={app.id} className="border rounded-lg p-3 hover:bg-orange-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{app.name || app.full_name}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.area || app.village}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleApproveApplication(app)}
                          className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectApplication(app.id)}
                          className="h-7 text-xs gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingApplications.length > 3 && (
                  <Button variant="link" size="sm" className="w-full">
                    View all {pendingApplications.length} applications →
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* SECONDARY SECTION - Activity Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 lg:mb-10">
          {/* Main Activity Tracker Card */}
          <Card className="lg:col-span-2 p-6 lg:p-10 shadow-lg bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <div className="flex items-center gap-3 lg:gap-4 mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Activity Tracker</h2>
                </div>
                <p className="text-muted-foreground text-sm lg:text-base font-medium">Monitor community engagement trends</p>
              </div>
              <Select defaultValue="week">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Chart */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold mb-6">
                {weeklyActivity.reduce((sum, day) => sum + day.totalActivity, 0)} Total Activities This Week
              </div>
              
              <div className="flex items-end justify-between gap-4 h-64 mb-4">
                {weeklyActivity.length > 0 ? weeklyActivity.map((dayData, i) => {
                  const maxActivity = Math.max(...weeklyActivity.map(d => d.totalActivity), 1);
                  const height = (dayData.totalActivity / maxActivity) * 100 || 10;
                  const isToday = i === new Date().getDay();
                  const isSelected = selectedDayData && selectedDayData.day === dayData.day && selectedDayData.date.getTime() === dayData.date.getTime();
                  const shouldHighlight = isSelected || (!selectedDayData && isToday);
                  
                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                      onClick={() => {
                        setSelectedDayData(dayData);
                        setSelectedItem(null);
                        setViewMode('progress');
                      }}
                    >
                      <div 
                        className="relative w-full bg-primary/20 rounded-t-lg hover:bg-primary/40 transition-all group-hover:shadow-lg" 
                        style={{ height: `${height}%`, minHeight: '10%' }}
                      >
                        {shouldHighlight && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            {dayData.totalActivity}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-medium transition-all ${
                        shouldHighlight 
                          ? 'bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center' 
                          : 'text-muted-foreground group-hover:text-primary'
                      }`}>
                        {dayData.day[0]}
                      </span>
                    </div>
                  );
                }) : (
                  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full bg-slate-100 rounded-t-lg" style={{ height: '10%' }}></div>
                      <span className="text-sm font-medium text-muted-foreground">{day}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center gap-2 text-sm mb-8">
              <div className="text-4xl font-bold">
                {weeklyActivity.length > 3 ? 
                  `${Math.round((weeklyActivity.slice(4).reduce((s, d) => s + d.totalActivity, 0) / 
                    Math.max(weeklyActivity.slice(0, 3).reduce((s, d) => s + d.totalActivity, 0), 1) - 1) * 100)}%` 
                  : '+0%'
                }
              </div>
              <div className="text-muted-foreground">
                This week's activity compared<br/>to the previous period
              </div>
            </div>

            {/* Community Progress */}
            <div className="border-t pt-6 lg:pt-8">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg lg:text-xl tracking-tight">
                    {selectedDayData ? `Activity Details - ${selectedDayData.day}` : 'Community Progress'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedDayData && (
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                      <Button
                        variant={viewMode === 'progress' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('progress')}
                        className="h-7 px-3 text-xs"
                      >
                        Progress
                      </Button>
                      <Button
                        variant={viewMode === 'summary' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('summary')}
                        className="h-7 px-3 text-xs"
                      >
                        Summary
                      </Button>
                    </div>
                  )}
                  {selectedDayData && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDayData(null);
                        setSelectedItem(null);
                        setViewMode('summary');
                      }}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Back to Summary
                    </Button>
                  )}
                </div>
              </div>

              {viewMode === 'summary' ? (
                // Summary View
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Alerts Reviewed</p>
                    <p className="text-3xl font-bold mb-2">{activityStats.alertsSent.reduce((a, b) => a + b, 0)}</p>
                    <div className="flex gap-0.5 h-16">
                      {(activityStats.alertsSent.length > 0 ? activityStats.alertsSent : Array(7).fill(0)).map((count, i) => {
                        const max = Math.max(...activityStats.alertsSent, 1);
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-slate-200 rounded-sm transition-all hover:bg-slate-300" 
                            style={{ height: `${(count / max) * 100 || 5}%` }}
                            title={`${count} alerts`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Total Reviews</p>
                    <p className="text-3xl font-bold mb-2">{activityStats.reviews.reduce((a, b) => a + b, 0)}</p>
                    <div className="flex gap-0.5 h-16">
                      {(activityStats.reviews.length > 0 ? activityStats.reviews : Array(7).fill(0)).map((count, i) => {
                        const max = Math.max(...activityStats.reviews, 1);
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-orange-200 rounded-sm transition-all hover:bg-orange-300" 
                            style={{ height: `${(count / max) * 100 || 5}%` }}
                            title={`${count} reviews`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Approvals</p>
                    <p className="text-3xl font-bold mb-2">{activityStats.approvals.reduce((a, b) => a + b, 0)}</p>
                    <div className="flex gap-0.5 h-16">
                      {(activityStats.approvals.length > 0 ? activityStats.approvals : Array(7).fill(0)).map((count, i) => {
                        const max = Math.max(...activityStats.approvals, 1);
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-slate-800 rounded-sm transition-all hover:bg-slate-700" 
                            style={{ height: `${(count / max) * 100 || 5}%` }}
                            title={`${count} approvals`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Progress View
                selectedDayData ? (
                    // Show selected day details
                    <div className="space-y-4">
                      {/* Day Header */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-3">
                          {selectedDayData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </h4>
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">Alerts Reviewed</p>
                            <p className="text-xl font-bold text-primary">{selectedDayData.alerts.length}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Approvals Made</p>
                            <p className="text-xl font-bold text-green-600">{selectedDayData.approvals.length}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                            <p className="text-xs text-muted-foreground mb-1">Total Activity</p>
                            <p className="text-xl font-bold">{selectedDayData.totalActivity}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alerts Reviewed */}
                      <div>
                        <h4 className="font-semibold text-xs mb-2 flex items-center gap-2">
                          <Bell className="w-3 h-3 text-red-500" />
                          Alerts Reviewed ({selectedDayData.alerts.length})
                        </h4>
                        {selectedDayData.alerts.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedDayData.alerts.map((alert: any, idx: number) => {
                              const itemExpanded = selectedItem?.type === 'alert' && selectedItem?.data === alert;
                              return (
                                <div 
                                  key={idx} 
                                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(itemExpanded ? null : {type: 'alert', data: alert});
                                  }}
                                >
                                  <p className={`text-xs font-medium ${itemExpanded ? '' : 'line-clamp-1'}`}>{alert.alert_text}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {alert.village}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(alert.accepted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {itemExpanded && alert.province && (
                                      <Badge variant="outline" className="text-xs h-5">{alert.province}</Badge>
                                    )}
                                  </div>
                                  {itemExpanded && (
                                    <div className="mt-2 pt-2 border-t space-y-1">
                                      {alert.submitted_by && (
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">Submitted by:</span> {alert.submitted_by}
                                        </p>
                                      )}
                                      {alert.contact && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {alert.contact}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">Status:</span> <Badge className="bg-green-600 text-xs h-5">Approved</Badge>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-3 bg-muted/20 rounded-lg">
                            No alerts reviewed
                          </p>
                        )}
                      </div>

                      {/* Approvals Made */}
                      <div>
                        <h4 className="font-semibold text-xs mb-2 flex items-center gap-2">
                          <UserCheck className="w-3 h-3 text-green-600" />
                          Contributor Approvals ({selectedDayData.approvals.length})
                        </h4>
                        {selectedDayData.approvals.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedDayData.approvals.map((approval: any, idx: number) => {
                              const itemExpanded = selectedItem?.type === 'approval' && selectedItem?.data === approval;
                              return (
                                <div 
                                  key={idx} 
                                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-green-500/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedItem(itemExpanded ? null : {type: 'approval', data: approval});
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium">{approval.name || approval.full_name}</p>
                                    <Badge variant="secondary" className="text-xs h-5">{approval.role || 'Contributor'}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {approval.contributor_id && (
                                      <span className="text-xs font-mono font-semibold text-primary">
                                        {approval.contributor_id}
                                      </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(approval.approved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                  {itemExpanded && (
                                    <div className="mt-2 pt-2 border-t space-y-1">
                                      {approval.phone && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {approval.phone}
                                        </p>
                                      )}
                                      {approval.email && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          {approval.email}
                                        </p>
                                      )}
                                      {approval.coverage_area && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span className="font-medium">Coverage:</span> {approval.coverage_area}
                                        </p>
                                      )}
                                      {approval.approved_by && (
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-medium">Approved by:</span> {approval.approved_by}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-3 bg-muted/20 rounded-lg">
                            No approvals made
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Show weekly day list
                    <div className="space-y-3">
                      {(() => {
                        const now = new Date();
                        const startOfWeek = new Date(now);
                        startOfWeek.setDate(now.getDate() - now.getDay());
                        startOfWeek.setHours(0, 0, 0, 0);
                        
                        const displayData = weeklyActivity.length > 0 ? weeklyActivity : Array.from({ length: 7 }, (_, i) => {
                          const dayStart = new Date(startOfWeek);
                          dayStart.setDate(startOfWeek.getDate() + i);
                          return {
                            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
                            date: dayStart,
                            alerts: [],
                            approvals: [],
                            totalActivity: 0
                          };
                        });
                        
                        return displayData.map((dayData, i) => {
                          const isToday = i === new Date().getDay();
                          const hasData = dayData.totalActivity > 0;
                          const isViewingThisDay = selectedDayData && selectedDayData.day === dayData.day && selectedDayData.date.getTime() === dayData.date.getTime();
                          
                          return (
                            <div 
                              key={i}
                              className={`p-4 rounded-lg transition-all cursor-pointer border ${
                                hasData 
                                  ? 'bg-muted/30 hover:bg-muted/50 border-transparent hover:border-primary/30' 
                                  : 'bg-muted/10 border-dashed border-muted-foreground/20 cursor-default'
                              }`}
                              onClick={() => {
                                if (hasData) {
                                  setSelectedDayData(dayData);
                                  setSelectedItem(null);
                                  setViewMode('progress');
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {(isToday || isViewingThisDay) && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  )}
                                  <div>
                                    <h4 className="font-semibold text-sm">{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Alerts</p>
                                    <p className={`text-lg font-bold ${hasData ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                      {dayData.alerts.length}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Approvals</p>
                                    <p className={`text-lg font-bold ${hasData ? 'text-green-600' : 'text-muted-foreground/50'}`}>
                                      {dayData.approvals.length}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className={`text-xl font-bold ${hasData ? '' : 'text-muted-foreground/50'}`}>
                                      {dayData.totalActivity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )
                )
              }
            </div>
          </Card>

          {/* Right Sidebar - User Account Profile */}
          <div className="space-y-4">
            <Card className="p-6 lg:p-10 bg-transparent backdrop-blur-sm border-0 h-full">
              {/* Profile Header */}
              <div className="text-center mb-6 lg:mb-8">
                <div className="relative w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-4">
                  {/* Animated avatar */}
                  <img 
                    src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(userData.full_name || 'moderator')}`}
                    alt={userData.full_name}
                    className="w-full h-full rounded-full shadow-xl border-4 border-white object-cover bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        // Create fallback avatar using DOM methods (safer than innerHTML)
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-xl border-4 border-white';
                        
                        const initialsSpan = document.createElement('span');
                        initialsSpan.className = 'text-2xl lg:text-4xl font-black text-white drop-shadow-lg';
                        const initials = userData.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'MD';
                        initialsSpan.textContent = initials;
                        
                        fallbackDiv.appendChild(initialsSpan);
                        
                        const statusIndicator = document.createElement('div');
                        statusIndicator.className = 'absolute bottom-0 right-0 w-5 h-5 lg:w-7 lg:h-7 bg-green-500 rounded-full border-3 border-white shadow-md';
                        
                        parent.appendChild(fallbackDiv);
                        parent.appendChild(statusIndicator);
                      }
                    }}
                  />
                  {/* Online status indicator */}
                  <div className="absolute bottom-0 right-0 w-5 h-5 lg:w-7 lg:h-7 bg-green-500 rounded-full border-3 border-white shadow-md"></div>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2 tracking-tight">{userData.full_name}</h2>
                <Badge className="mb-2 text-xs lg:text-sm" variant="secondary">Moderator</Badge>
                <p className="text-xs lg:text-sm text-muted-foreground font-medium">Managing {userData.village}</p>
              </div>

              {/* Account Information */}
              <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-muted-foreground font-semibold">Email Address</p>
                      <p className="font-medium text-sm lg:text-base truncate">{userData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-r from-secondary/5 to-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-muted-foreground font-semibold">Phone Number</p>
                      <p className="font-medium text-sm lg:text-base">{userData.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-muted-foreground font-semibold">Location</p>
                      <p className="font-medium text-sm lg:text-base">{userData.village}</p>
                      <p className="text-xs lg:text-sm text-muted-foreground">{userData.province}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 lg:p-5 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-muted-foreground font-semibold">Total Contributors</p>
                      <p className="font-bold text-2xl lg:text-3xl text-primary">{managedContributors.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 lg:space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 h-10 lg:h-11"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2 h-10 lg:h-11"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* TERTIARY SECTION - Contributors Summary */}
        <div className="grid grid-cols-1 gap-4 lg:gap-8">
          {/* Contributors List */}
          <Card className="p-4 lg:p-8 bg-transparent backdrop-blur-sm border-0">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg lg:text-xl tracking-tight">Your Contributors</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowAddContributorDialog(true)}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Add Contributor
                </Button>
                <Button variant="link" size="sm" className="text-primary gap-1 font-semibold">
                  View all
                  <span>→</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
              {managedContributors.slice(0, 4).map((contributor: any, i: number) => (
                <div 
                  key={contributor.id} 
                  className="flex items-center gap-3 p-4 lg:p-5 rounded-xl hover:bg-muted/50 transition-colors border cursor-pointer hover:shadow-md"
                  onClick={() => {
                    setEditContributor(contributor);
                    setShowEditContributorDialog(true);
                  }}
                >
                  <img 
                    src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(contributor.name || contributor.full_name || contributor.id)}`}
                    alt={contributor.name || contributor.full_name}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-primary/20 bg-gradient-to-br from-primary to-secondary"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const div = document.createElement('div');
                        div.className = 'w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-base lg:text-lg border-2 border-primary/20';
                        div.textContent = (contributor.name?.[0] || 'C').toUpperCase();
                        parent.insertBefore(div, target);
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm lg:text-base truncate">{contributor.name || contributor.full_name}</p>
                      <Badge variant="secondary" className="text-xs">{i === 0 ? 'Active' : 'New'}</Badge>
                    </div>
                    {contributor.contributor_id && (
                      <p className="text-xs font-mono font-semibold text-primary">{contributor.contributor_id}</p>
                    )}
                    <p className="text-xs lg:text-sm text-muted-foreground">{contributor.contributions || 0} contributions</p>
                  </div>
                </div>
              ))}  
              
              {managedContributors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 col-span-4">No contributors yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                handleSaveProfile();
                setShowEditDialog(false);
              }} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? You'll need to sign in again to access your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Contributor Dialog */}
        <Dialog open={showAddContributorDialog} onOpenChange={setShowAddContributorDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Contributor</DialogTitle>
              <DialogDescription>
                Add a new contributor who can submit information via the web platform. A unique ID will be auto-generated.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contributor-name" className="text-sm font-semibold">Full Name *</Label>
                <Input
                  id="contributor-name"
                  value={newContributor.name}
                  onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
                  placeholder="Enter contributor's full name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contributor-phone" className="text-sm font-semibold">Phone Number *</Label>
                <Input
                  id="contributor-phone"
                  value={newContributor.phone}
                  onChange={(e) => setNewContributor({ ...newContributor, phone: e.target.value })}
                  placeholder="+977-XXXXXXXXXX"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contributor-email" className="text-sm font-semibold">Email (Optional)</Label>
                <Input
                  id="contributor-email"
                  type="email"
                  value={newContributor.email}
                  onChange={(e) => setNewContributor({ ...newContributor, email: e.target.value })}
                  placeholder="contributor@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contributor-role" className="text-sm font-semibold">Role *</Label>
                <Select
                  value={newContributor.role}
                  onValueChange={(value) => setNewContributor({ ...newContributor, role: value })}
                >
                  <SelectTrigger id="contributor-role" className="mt-1.5">
                    <SelectValue placeholder="Select contributor role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community Leader">Community Leader</SelectItem>
                    <SelectItem value="Health Worker">Health Worker</SelectItem>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Farmer">Farmer</SelectItem>
                    <SelectItem value="Youth Volunteer">Youth Volunteer</SelectItem>
                    <SelectItem value="Local Business Owner">Local Business Owner</SelectItem>
                    <SelectItem value="General Contributor">General Contributor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contributor-area" className="text-sm font-semibold">Coverage Area *</Label>
                <Input
                  id="contributor-area"
                  value={newContributor.coverage_area}
                  onChange={(e) => setNewContributor({ ...newContributor, coverage_area: e.target.value })}
                  placeholder={`e.g., ${userData?.village || 'Village name'}, Ward 5`}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Specify the area this contributor will report on</p>
              </div>
              <div>
                <Label htmlFor="contributor-reason" className="text-sm font-semibold">Notes (Optional)</Label>
                <Textarea
                  id="contributor-reason"
                  value={newContributor.reason}
                  onChange={(e) => setNewContributor({ ...newContributor, reason: e.target.value })}
                  placeholder="Any additional information about this contributor"
                  className="mt-1.5 resize-none"
                  rows={3}
                />
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="font-mono">Auto-Generated</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Contributor ID Format:</p>
                <p className="font-mono font-bold text-lg text-primary">GK-XXXX</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This unique 4-digit ID will be assigned automatically. Contributors will use this ID when submitting information via the web.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddContributorDialog(false);
                  setNewContributor({ name: "", phone: "", email: "", reason: "", contributor_id: "", role: "", coverage_area: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddContributor}>
                Add Contributor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Contributor Dialog */}
        <Dialog open={showEditContributorDialog} onOpenChange={setShowEditContributorDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Contributor</DialogTitle>
              <DialogDescription>
                Update contributor information. The Contributor ID cannot be changed.
              </DialogDescription>
            </DialogHeader>
            {editContributor && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-contributor-name" className="text-sm font-semibold">Full Name *</Label>
                  <Input
                    id="edit-contributor-name"
                    value={editContributor.name || ''}
                    onChange={(e) => setEditContributor({ ...editContributor, name: e.target.value })}
                    placeholder="Enter contributor's full name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contributor-phone" className="text-sm font-semibold">Phone Number *</Label>
                  <Input
                    id="edit-contributor-phone"
                    value={editContributor.phone || ''}
                    onChange={(e) => setEditContributor({ ...editContributor, phone: e.target.value })}
                    placeholder="+977-XXXXXXXXXX"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contributor-email" className="text-sm font-semibold">Email (Optional)</Label>
                  <Input
                    id="edit-contributor-email"
                    type="email"
                    value={editContributor.email || ''}
                    onChange={(e) => setEditContributor({ ...editContributor, email: e.target.value })}
                    placeholder="contributor@example.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contributor-role" className="text-sm font-semibold">Role *</Label>
                  <Select
                    value={editContributor.role || ''}
                    onValueChange={(value) => setEditContributor({ ...editContributor, role: value })}
                  >
                    <SelectTrigger id="edit-contributor-role" className="mt-1.5">
                      <SelectValue placeholder="Select contributor role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Community Leader">Community Leader</SelectItem>
                      <SelectItem value="Health Worker">Health Worker</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Farmer">Farmer</SelectItem>
                      <SelectItem value="Youth Volunteer">Youth Volunteer</SelectItem>
                      <SelectItem value="Local Business Owner">Local Business Owner</SelectItem>
                      <SelectItem value="General Contributor">General Contributor</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-contributor-area" className="text-sm font-semibold">Coverage Area *</Label>
                  <Input
                    id="edit-contributor-area"
                    value={editContributor.coverage_area || ''}
                    onChange={(e) => setEditContributor({ ...editContributor, coverage_area: e.target.value })}
                    placeholder={`e.g., ${userData?.village || 'Village name'}, Ward 5`}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Specify the area this contributor will report on</p>
                </div>
                <div>
                  <Label htmlFor="edit-contributor-reason" className="text-sm font-semibold">Notes (Optional)</Label>
                  <Textarea
                    id="edit-contributor-reason"
                    value={editContributor.reason || ''}
                    onChange={(e) => setEditContributor({ ...editContributor, reason: e.target.value })}
                    placeholder="Any additional information about this contributor"
                    className="mt-1.5 resize-none"
                    rows={3}
                  />
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="font-mono">Read-Only</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Contributor ID:</p>
                  <p className="font-mono font-bold text-lg text-primary">{editContributor.contributor_id || 'Not assigned'}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    The Contributor ID cannot be changed once assigned.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditContributorDialog(false);
                  setEditContributor(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateContributor}>
                Update Contributor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
