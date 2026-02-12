import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";
import { isRateLimited, getRemainingAttempts } from "@/lib/validation";
import Footer from "@/components/Footer";

const APPLICATION_RATE_LIMIT = 3; // Max 3 applications per minute
const APPLICATION_RATE_WINDOW = 60000; // 1 minute

const ApplyContributor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(APPLICATION_RATE_LIMIT);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');
    setIsLoggedIn(!!loggedIn);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    village: "",
    reason: "",
  });

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const provincesRef = collection(db, "mod_applications");
      const snapshot = await getDocs(query(provincesRef, where("status", "==", "approved")));
      const uniqueProvinces = new Set<string>();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.province) {
          uniqueProvinces.add(data.province);
        }
      });

      setProvinces(Array.from(uniqueProvinces).sort());
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchVillages = async (province: string) => {
    try {
      const provincesRef = collection(db, "mod_applications");
      const snapshot = await getDocs(query(provincesRef, where("status", "==", "approved")));
      const uniqueVillages = new Set<string>();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.province === province && data.village) {
          uniqueVillages.add(data.village);
        }
      });

      setVillages(Array.from(uniqueVillages).sort());
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
  };

  const handleProvinceChange = (province: string) => {
    setFormData({ ...formData, province, village: "" });
    fetchVillages(province);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit first
    const userKey = userData?.email ? `contributor_${userData.email}` : 'contributor_anonymous';
    if (isRateLimited(userKey, APPLICATION_RATE_LIMIT, APPLICATION_RATE_WINDOW)) {
      const remaining = getRemainingAttempts(userKey, APPLICATION_RATE_LIMIT, APPLICATION_RATE_WINDOW);
      toast({
        title: "Too Many Applications",
        description: `You've submitted too many applications. Please wait a minute before submitting again. (${remaining}/${APPLICATION_RATE_LIMIT})`,
        variant: "destructive",
      });
      setRemainingAttempts(remaining);
      return;
    }

    if (!formData.name || !formData.phone || !formData.province || !formData.village) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Submit contributor application
      await addDoc(collection(db, "contributor_applications"), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        province: formData.province,
        village: formData.village,
        reason: formData.reason,
        status: "pending",
        applied_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        contributions: 0,
      });

      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the area moderators for review.",
      });

      // Update remaining attempts
      const userKey = userData?.email ? `contributor_${userData.email}` : 'contributor_anonymous';
      const remaining = getRemainingAttempts(userKey, APPLICATION_RATE_LIMIT, APPLICATION_RATE_WINDOW);
      setRemainingAttempts(remaining);

      // Redirect to contributions page
      setTimeout(() => {
        navigate("/contributions");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Become a Community Contributor
            </h1>
            <p className="text-lg text-muted-foreground">
              Share local information and help your community stay informed. 
              Your application will be reviewed by area moderators.
            </p>
          </div>

          {/* Benefits Section */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Become a Contributor?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Share Local Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide updates on market prices, transport, and community alerts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Community Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Help your neighbors stay informed and connected
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    No technical skills required, just local knowledge
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Application Form */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rate Limit Warning */}
              {remainingAttempts < 2 && remainingAttempts > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Limited Applications</p>
                    <p className="text-xs text-amber-700">
                      {remainingAttempts} application{remainingAttempts !== 1 ? 's' : ''} remaining this minute
                    </p>
                  </div>
                </div>
              )}
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Select value={formData.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Village */}
              <div className="space-y-2">
                <Label htmlFor="village">Village/Ward *</Label>
                <Select 
                  value={formData.village} 
                  onValueChange={(village) => setFormData({ ...formData, village })}
                  disabled={!formData.province}
                >
                  <SelectTrigger id="village">
                    <SelectValue placeholder={formData.province ? "Select your village" : "Select a province first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Why Do You Want to Become a Contributor?</Label>
                <Textarea
                  id="reason"
                  placeholder="Tell us about your interest and how you can help your community..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer isLoggedIn={isLoggedIn} userData={userData} />
    </div>
  );
};

export default ApplyContributor;
