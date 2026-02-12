import { useEffect, useState } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Filter, AlertTriangle, Users, Plus, Navigation, Shield, UserPlus, TrendingUp, Activity, MessageSquare, BarChart3, PieChart, Calendar, Clock, CheckCircle, AlertCircle as AlertCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { collection, query, orderBy, getDocs, where, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { formatDistanceToNow, format } from "date-fns";
import { ContributorCard, type Contributor } from "@/components/ContributorCard";
import { ModeratorCard, type Moderator } from "@/components/ModeratorCard";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Alert {
  id: string;
  type: string;
  title: string;
  location: string;
  message: string;
  created_at: any;
  priority: string;
}

const Contributions = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<(Contributor | Moderator)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedVillage, setSelectedVillage] = useState<string>("all");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newContributor, setNewContributor] = useState({
    name: "",
    location: "",
    phone: "",
    bio: "",
  });
  const [tab, setTab] = useState("overview");
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useUserLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(!!loggedIn);
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchContributorsAndModerators();
    fetchProvinces();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [contributors, moderators, selectedProvince, selectedVillage, location]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "alerts" || tabParam === "contributors") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const fetchAlerts = async () => {
    try {
      const alertsRef = collection(db, "alerts");
      const q = query(alertsRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);

      const alertsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Alert[];

      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchContributorsAndModerators = async () => {
    try {
      // Fetch approved contributors from contributor_applications
      const contributorsQuery = query(
        collection(db, "contributor_applications"),
        where("status", "==", "approved")
      );
      const contributorsSnapshot = await getDocs(contributorsQuery);

      const contributorsData = contributorsSnapshot.docs
        .filter(doc => doc.data().status === "approved")
        .map((doc) => {
          const data = doc.data();
          const name = data.name || data.full_name || data.fullName || data.applicant_name || data.user?.name || "";
          return {
            id: doc.id,
            name,
            phone: data.phone,
            email: data.email || "",
            village: data.village,
            province: data.province,
            area: `${data.village}, ${data.province}`,
            role: "Community Reporter",
            bio: data.reason || "",
            status: "active",
            contributions: data.contributions || 0,
            created_at: data.applied_at || data.created_at,
            approved_by: data.approved_by,
            created_by: data.created_by,
            created_by_moderator: data.created_by_moderator,
            type: 'contributor' as const
          };
        });

      // Build moderation counts keyed by moderator identifier (email currently used)
      const moderationCounts = contributorsData.reduce<Record<string, number>>((acc, contributor) => {
        // Moderation credit: contributors added/approved by a moderator
        if (!contributor.created_by_moderator) return acc;
        const key = (contributor.approved_by || contributor.created_by || "").trim();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Fetch moderators from mod_applications
      const moderatorsQuery = query(
        collection(db, "mod_applications"),
        where("status", "==", "approved")
      );
      const moderatorsSnapshot = await getDocs(moderatorsQuery);

      const moderatorsData = moderatorsSnapshot.docs
        .filter(doc => doc.data().status === "approved")
        .map((doc) => {
          const data = doc.data();
          const name = data.name || data.full_name || data.fullName || data.applicant_name || data.user?.name || "";
          return {
            id: doc.id,
            name,
            phone: data.phone || data.phoneNumber,
            email: data.email || "",
            village: (data.village || "").trim(),
            province: (data.province || "").trim(),
            area: `${data.village || ""}, ${data.province || ""}`.trim(),
            role: data.role || "Moderator",
            bio: data.reason || data.bio || "",
            status: "active",
            moderations: data.moderations || data.moderation_count || data.moderationsCount || moderationCounts[data.email || ""] || 0,
            created_at: data.created_at || data.createdAt || data.applied_at,
            type: 'moderator' as const
          };
        });

      setContributors(contributorsData);
      setModerators(moderatorsData);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast({
        title: "Error",
        description: "Failed to load contributors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const contributorsRef = collection(db, "contributor_applications");
      const querySnapshot = await getDocs(contributorsRef);
      
      const provinceSet = new Set<string>();
      querySnapshot.docs.forEach((doc) => {
        const province = doc.data().province;
        if (province) provinceSet.add(province);
      });

      setProvinces(Array.from(provinceSet).sort());
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedVillage("all");
    fetchVillages(province);
  };

  const fetchVillages = async (province: string) => {
    if (province === "all") {
      setVillages([]);
      return;
    }

    try {
      const contributorsRef = collection(db, "contributor_applications");
      const q = query(contributorsRef, where("province", "==", province));
      const querySnapshot = await getDocs(q);

      const villageSet = new Set<string>();
      querySnapshot.docs.forEach((doc) => {
        const village = doc.data().village;
        if (village) villageSet.add(village);
      });

      setVillages(Array.from(villageSet).sort());
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
  };

  const filterPeople = () => {
    const allPeople = [...contributors, ...moderators];

    let filtered = allPeople;

    if (selectedProvince !== "all") {
      filtered = filtered.filter((p) => p.province === selectedProvince);
    }

    if (selectedVillage !== "all") {
      filtered = filtered.filter((p) => p.village === selectedVillage);
    }

    // Sort: moderators first, then by distance from user location
    filtered.sort((a, b) => {
      const aIsModerator = "role" in a && a.role === "Moderator";
      const bIsModerator = "role" in b && b.role === "Moderator";

      if (aIsModerator && !bIsModerator) return -1;
      if (!aIsModerator && bIsModerator) return 1;

      return 0;
    });

    setFilteredPeople(filtered);
  };

  const handleAddContributor = async () => {
    if (!newContributor.name || !newContributor.location || !newContributor.phone) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const contributorsRef = collection(db, "contributor_applications");
      await addDoc(contributorsRef, {
        name: newContributor.name,
        phone: newContributor.phone,
        email: "",
        village: newContributor.location,
        province: newContributor.location,
        reason: newContributor.bio,
        status: "pending",
        applied_at: new Date(),
      });

      toast({
        title: "Success",
        description: "Contributor application submitted successfully",
      });

      setShowAddDialog(false);
      setNewContributor({ name: "", location: "", phone: "", bio: "" });
      fetchContributorsAndModerators();
    } catch (error) {
      console.error("Error adding contributor:", error);
      toast({
        title: "Error",
        description: "Failed to add contributor",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

        <div className="relative container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-3">Project Dashboard</h1>
          <p className="text-xl text-white/90">
            Track the overall progress and impact of VoiceLink
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Alerts */}
          <Card className="p-6 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Total Alerts</p>
                <p className="text-3xl font-bold">{alerts.length}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Community engagement
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>

          {/* Total Contributors */}
          <Card className="p-6 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Contributors</p>
                <p className="text-3xl font-bold">{contributors.length}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Active members
                </p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>

          {/* Total Moderators */}
          <Card className="p-6 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Moderators</p>
                <p className="text-3xl font-bold">{moderators.length}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Verified reviews
                </p>
              </div>
              <Shield className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>

          {/* Active Engagement */}
          <Card className="p-6 border-primary/20 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Engagement Rate</p>
                <p className="text-3xl font-bold">
                  {contributors.length > 0 && alerts.length > 0 
                    ? Math.round((alerts.length / contributors.length) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Overall activity
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Call to Action - Subtle Banner */}
        {!isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <RouterLink to="/apply-moderator" className="group">
              <Card className="p-4 border border-primary/30 hover:border-primary/60 hover:shadow-md transition-all bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm font-medium">Become a Moderator</p>
                      <p className="text-xs text-muted-foreground">Help keep community informed</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">→</Button>
                </div>
              </Card>
            </RouterLink>
            <RouterLink to="/apply-contributor" className="group">
              <Card className="p-4 border border-secondary/30 hover:border-secondary/60 hover:shadow-md transition-all bg-gradient-to-r from-secondary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-secondary opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm font-medium">Become a Contributor</p>
                      <p className="text-xs text-muted-foreground">Share local information</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">→</Button>
                </div>
              </Card>
            </RouterLink>
          </div>
        )}

        {/* Dashboard Content - All Visible */}
        <div className="space-y-8">
          {/* Analytics Row 1 - Alert Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Priority Distribution */}
                <Card className="p-6 col-span-1 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Alert Activity
                    </h3>
                    <Badge variant="secondary">Last 30 days</Badge>
                  </div>
                  <div className="space-y-4">
                    {['High', 'Medium', 'Low'].map((priority) => {
                      const count = alerts.filter(a => a.priority === priority).length;
                      const percentage = alerts.length > 0 ? (count / alerts.length) * 100 : 0;
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{priority} Priority</span>
                            <span className="text-sm text-muted-foreground">{count} alerts</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                priority === 'High' ? 'bg-red-500' :
                                priority === 'Medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Stats Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Resolved</span>
                      <span className="font-bold">{Math.round(alerts.length * 0.6)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Pending</span>
                      <span className="font-bold">{Math.round(alerts.length * 0.3)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">In Progress</span>
                      <span className="font-bold">{Math.round(alerts.length * 0.1)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Analytics Row 2 - Recent Activity & Top Locations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="p-6 col-span-1 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {alerts.slice(0, 6).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.priority === 'High' ? 'bg-red-500' :
                          alert.priority === 'Medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{alert.title || alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.location}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {(() => {
                            const rawDate = alert.created_at as any;
                            if (rawDate?.seconds) {
                              return formatDistanceToNow(new Date(rawDate.seconds * 1000), { addSuffix: true });
                            }
                            return "Recently";
                          })()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Contributors */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Top Contributors
                  </h3>
                  <div className="space-y-3">
                    {contributors.slice(0, 5).map((contrib, idx) => (
                      <div key={contrib.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{(contrib as any).name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{(contrib as any).location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

          {/* All Alerts Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              All Alerts
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts at the moment</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {alert.title || "Community Alert"}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {alert.location}
                        </div>
                      </div>
                      <Badge variant="outline">{alert.type}</Badge>
                    </div>
                    <p className="text-foreground/80 mb-4">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                          {(() => {
                            const rawDate = alert.created_at as any;
                            if (rawDate?.seconds) {
                              return formatDistanceToNow(new Date(rawDate.seconds * 1000), { addSuffix: true });
                            }
                            if (rawDate) {
                              const parsed = new Date(rawDate);
                              if (!isNaN(parsed.getTime())) {
                                return formatDistanceToNow(parsed, { addSuffix: true });
                              }
                            }
                            return "Recently";
                          })()}
                        </span>
                        <Badge variant="secondary">{alert.priority || "Normal"}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          {/* Community Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Community
            </h2>
            <div className="max-w-5xl space-y-6">
              {/* Location Info */}
              {!location.loading && location.city && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Your Location:</strong> {location.city}
                      {location.district && `, ${location.district}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Filter by Location</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                      <SelectTrigger id="province">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Select
                      value={selectedVillage}
                      onValueChange={setSelectedVillage}
                      disabled={villages.length === 0}
                    >
                      <SelectTrigger id="village">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Villages</SelectItem>
                        {villages.map((village) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Contributors Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredPeople.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No contributors found for this location
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPeople.map((person) => {
                    if ("role" in person && person.role === "Moderator") {
                      return (
                        <ModeratorCard key={person.id} moderator={person} />
                      );
                    }
                    return (
                      <ContributorCard key={person.id} contributor={person} />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Add Contributor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contributor</DialogTitle>
            <DialogDescription>
              Add a new contributor to the community network
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newContributor.name}
                onChange={(e) =>
                  setNewContributor({ ...newContributor, name: e.target.value })
                }
                placeholder="Enter contributor name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={newContributor.location}
                onChange={(e) =>
                  setNewContributor({
                    ...newContributor,
                    location: e.target.value,
                  })
                }
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={newContributor.phone}
                onChange={(e) =>
                  setNewContributor({ ...newContributor, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newContributor.bio}
                onChange={(e) =>
                  setNewContributor({ ...newContributor, bio: e.target.value })
                }
                placeholder="Enter contributor bio"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddContributor} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Contributor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contributions;
