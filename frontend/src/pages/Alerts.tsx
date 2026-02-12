import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Info, Calendar, Send, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { collection, query, orderBy, getDocs, addDoc, type Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { isRateLimited, getRemainingAttempts } from "@/lib/validation";
import { formatDistanceToNow } from "date-fns";
import { AnonymousAlertSubmission } from "@/components/AnonymousAlertSubmission";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Alert {
  id: string;
  type: string;
  title: string;
  location: string;
  message: string;
  created_at?: Timestamp;
  priority: string;
  province?: string;
}

interface LocalUserData {
  email: string;
  name: string;
  village: string;
  province: string;
}

const ALERT_RATE_LIMIT = 5; // Max 5 alerts per minute
const ALERT_RATE_WINDOW = 60000; // 1 minute in milliseconds

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<LocalUserData | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(ALERT_RATE_LIMIT);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedInStorage = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');
    
    setIsLoggedIn(!!isLoggedInStorage);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch {
        // Handle JSON parse error
      }
    }
    
    fetchAlerts();
  }, []);

  // Filter alerts when alerts or selected province changes
  useEffect(() => {
    if (selectedProvince === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.province === selectedProvince));
    }
  }, [alerts, selectedProvince]);

  const fetchAlerts = async () => {
    try {
      const alertsRef = collection(db, "alerts");
      const q = query(alertsRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      
      const alertsData: Alert[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          type: String(data.type ?? ""),
          title: String(data.title ?? ""),
          location: String(data.location ?? ""),
          message: String(data.message ?? ""),
          priority: String(data.priority ?? "low"),
          province: typeof data.province === "string" ? data.province : undefined,
          created_at: (data.created_at as Timestamp | undefined),
        };
      });
      
      setAlerts(alertsData);
      
      // Extract unique provinces from alerts
      const provinces = Array.from(
        new Set(
          alertsData
            .map((alert) => alert.province)
            .filter((p): p is string => Boolean(p))
        )
      ).sort();
      setAvailableProvinces(provinces);
      
      // If user is logged in and has a province, set it as default filter
      if (isLoggedIn && userData?.province) {
        setSelectedProvince(userData.province);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAlert = async () => {
    // Check rate limit first
    const userKey = userData?.email ? `alert_${userData.email}` : 'alert_anonymous';
    if (isRateLimited(userKey, ALERT_RATE_LIMIT, ALERT_RATE_WINDOW)) {
      const remaining = getRemainingAttempts(userKey, ALERT_RATE_LIMIT, ALERT_RATE_WINDOW);
      toast({
        title: "Rate Limited",
        description: `You've submitted too many alerts. Please wait a minute before submitting again. (${remaining}/${ALERT_RATE_LIMIT})`,
        variant: "destructive",
      });
      setRemainingAttempts(remaining);
      return;
    }

    if (!alertText.trim()) {
      toast({
        title: "Error",
        description: "Please enter alert text",
        variant: "destructive",
      });
      return;
    }

    if (!userEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!userData?.email) {
      toast({
        title: "Error",
        description: "User information not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "pending_alerts"), {
        alert_text: alertText,
        contributor_email: userData.email,
        contributor_name: userData.name,
        user_email: userEmail, // Email for status notifications
        village: userData.village,
        province: userData.province,
        status: "pending",
        created_at: new Date(),
        submitted_by: userData.email,
        submitted_via: "logged-in", // Track that this was submitted by logged-in user
        notification_sent: false, // Track if notification email has been sent
      });

      toast({
        title: "Success",
        description: "Alert submitted successfully! You will receive an email at " + userEmail + " once moderators review your submission.",
      });

      // Update remaining attempts
      const userKey = userData?.email ? `alert_${userData.email}` : 'alert_anonymous';
      const remaining = getRemainingAttempts(userKey, ALERT_RATE_LIMIT, ALERT_RATE_WINDOW);
      setRemainingAttempts(remaining);

      setAlertText("");
      setUserEmail("");
      setShowSubmitDialog(false);
    } catch (error) {
      console.error("Error submitting alert:", error);
      toast({
        title: "Error",
        description: "Failed to submit alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="relative animated-gradient text-primary-foreground overflow-hidden">
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
        
        <Navbar />
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-3">Local Alerts</h1>
          <p className="text-xl text-white/90">Community alerts, announcements, and important updates</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Submission Section */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10 p-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Share Information with Your Community</h2>
            
            {isLoggedIn && userData ? (
              // Logged-in user - Simple dialog
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Submit Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit an Alert</DialogTitle>
                    <DialogDescription>
                      Share important information with your community. Your alert will be reviewed by moderators before publication.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Rate Limit Warning */}
                  {remainingAttempts < 3 && remainingAttempts > 0 && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Limited Submissions</p>
                        <p className="text-xs text-amber-700">
                          {remainingAttempts} submission{remainingAttempts !== 1 ? 's' : ''} remaining this minute
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input value={userData?.name || ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>Village, Province</Label>
                      <Input 
                        value={`${userData?.village}, ${userData?.province}` || ""} 
                        disabled 
                        className="bg-muted" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-text" className="font-semibold">
                        Alert Message *
                      </Label>
                      <Textarea
                        id="alert-text"
                        placeholder="Describe the alert details, what happened, where, and any important information..."
                        value={alertText}
                        onChange={(e) => setAlertText(e.target.value)}
                        rows={5}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email" className="font-semibold">
                        Email for Status Updates *
                      </Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll notify you once moderators review your alert submission.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSubmitDialog(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitAlert}
                      disabled={isSubmitting || !alertText.trim() || !userEmail.trim()}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? "Submitting..." : "Submit Alert"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              // Non-logged-in user - Show anonymous submission
              <AnonymousAlertSubmission onAlertSubmitted={() => {
                setAlerts([]);
                setLoading(true);
                fetchAlerts();
              }} />
            )}
          </div>

          {/* Alerts List Section */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Published Alerts</h2>
              
              {/* Location Filter */}
              {availableProvinces.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="province-filter" className="text-sm font-medium">
                    Filter by Province:
                  </Label>
                  <select
                    id="province-filter"
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <option value="all">All Provinces</option>
                    {availableProvinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading alerts...</p>
              </Card>
            ) : filteredAlerts.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {alerts.length === 0 ? "No Alerts Available" : "No Alerts for This Location"}
                </h3>
                <p className="text-muted-foreground">
                  {alerts.length === 0 
                    ? "Check back later for community updates and alerts."
                    : `No alerts found for ${selectedProvince === "all" ? "your selected filter" : selectedProvince}. Try a different location.`}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id} className={`p-5 border-l-4 hover:shadow-[var(--card-shadow-hover)] transition-shadow ${
                    alert.priority === 'high' ? 'border-l-destructive' :
                    alert.priority === 'medium' ? 'border-l-secondary' : 'border-l-accent'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        alert.priority === 'high' ? 'bg-destructive/10' :
                        alert.priority === 'medium' ? 'bg-secondary/10' : 'bg-accent/10'
                      }`}>
                        {alert.priority === 'high' ? (
                          <AlertTriangle className="w-6 h-6 text-destructive" />
                        ) : alert.type === 'event' ? (
                          <Calendar className="w-6 h-6 text-accent" />
                        ) : (
                          <Info className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground mb-1">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">📍 {alert.location}</p>
                          </div>
                          <Badge variant={
                            alert.priority === 'high' ? 'destructive' :
                            alert.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-foreground mb-3">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.created_at ? formatDistanceToNow(alert.created_at.toDate(), { addSuffix: true }) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📞 Call to Report or Listen</h3>
            <p className="text-muted-foreground">Dial <span className="font-semibold text-foreground">1660-XXX-XXXX</span> and press <span className="font-semibold text-primary">3</span> for alerts or <span className="font-semibold text-primary">4</span> to leave a voice message</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;