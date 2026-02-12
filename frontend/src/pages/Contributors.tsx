import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Filter, Plus, User, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, addDoc, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { ContributorCard, type Contributor } from "@/components/ContributorCard";
import { ModeratorCard, type Moderator } from "@/components/ModeratorCard";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contributors = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [allPeople, setAllPeople] = useState<(Contributor | Moderator)[]>([]);
  const [filteredContributors, setFilteredContributors] = useState<(Contributor | Moderator)[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{fullName?: string; email?: string} | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedVillage, setSelectedVillage] = useState<string>("all");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newContributor, setNewContributor] = useState({
    name: "",
    phone: "",
    email: "",
    village: "",
    province: "",
    role: "Community Reporter",
    bio: "",
  });
  const [contributorApplication, setContributorApplication] = useState({
    name: "",
    phone: "",
    email: "",
    village: "",
    province: "",
    reason: "",
  });
  const location = useUserLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch approved contributors from contributor_applications
        const contributorsQuery = query(
          collection(db, "contributor_applications"),
          where("status", "==", "approved")
        );
        const contributorsSnapshot = await getDocs(contributorsQuery);
        console.log(`Found ${contributorsSnapshot.docs.length} contributor applications in database`);
        
        // Filter for approved contributors only
        const contributorsData = contributorsSnapshot.docs
          .filter(doc => doc.data().status === "approved")
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
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
              type: 'contributor' as const
            };
          });
        console.log('Total approved contributors processed:', contributorsData.length);
        setContributors(contributorsData);

        // Fetch moderators - available to all users (only approved ones)
        const loggedIn = localStorage.getItem('isLoggedIn');
        const moderatorsQuery = query(
          collection(db, "mod_applications"),
          where("status", "==", "approved")
        );
        const moderatorsSnapshot = await getDocs(moderatorsQuery);
        console.log(`Found ${moderatorsSnapshot.docs.length} total moderator applications in database`);
        
        // Filter for approved moderators only
        const moderatorsData = moderatorsSnapshot.docs
          .filter(doc => doc.data().status === "approved")
          .map(doc => {
            const data = doc.data();
            console.log('Approved moderator data:', { 
              id: doc.id,
              name: data.fullName,
              village: data.village,
              province: data.province,
              status: data.status
            });
            return {
              id: doc.id,
              name: data.fullName,
              phone: data.phoneNumber,
              email: data.email,
              village: (data.village || "").trim(),
              province: (data.province || "").trim(),
              dateOfBirth: data.dateOfBirth || "",
              profilePhoto: data.profilePhoto || "",
              moderations: data.moderations || 0,
              joinedDate: data.createdAt,
              type: 'moderator' as const
            };
          })
          .sort((a, b) => {
            // Sort by joined date descending
            const dateA = a.joinedDate?.toDate?.() || new Date(0);
            const dateB = b.joinedDate?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
        console.log('Total approved moderators processed:', moderatorsData.length);
        setModerators(moderatorsData);

        // Combine contributors and moderators for all users
        const combined = [...contributorsData, ...moderatorsData];
        console.log('Total combined people:', combined.length, {
          contributors: contributorsData.length,
          moderators: moderatorsData.length
        });
        setAllPeople(combined);

        // Extract unique provinces and villages for filters
        const uniqueProvinces = [...new Set(combined.map(c => c.province).filter(Boolean))];
        const uniqueVillages = [...new Set(combined.map(c => c.village).filter(Boolean))];
        setProvinces(uniqueProvinces);
        setVillages(uniqueVillages);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Check if user is logged in and get their data
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUserData = localStorage.getItem('userData');
    setIsLoggedIn(!!loggedIn);
    
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    fetchData();
  }, [toast]);

  // Filter and sort contributors based on live location and filters
  useEffect(() => {
    if (allPeople.length === 0) return;

    let filtered = [...allPeople];

    // Separate moderators and contributors
    const allModerators = filtered.filter(p => p.type === 'moderator');
    const allContributors = filtered.filter(p => p.type === 'contributor');

    // Apply filter selections to contributors only (case-insensitive)
    let filteredContributorsList = allContributors;
    if (selectedProvince !== "all") {
      filteredContributorsList = filteredContributorsList.filter(c => 
        c.province?.toLowerCase() === selectedProvince.toLowerCase()
      );
    }
    if (selectedVillage !== "all") {
      filteredContributorsList = filteredContributorsList.filter(c => 
        c.village?.toLowerCase() === selectedVillage.toLowerCase()
      );
    }

    // Sort moderators by location (priority to area-specific, but show all)
    let sortedModerators = [...allModerators];
    if (selectedProvince !== "all" || selectedVillage !== "all") {
      // When filters are applied, show matching moderators first (case-insensitive)
      const matchingMods = allModerators.filter(m => {
        const provinceMatch = selectedProvince === "all" || 
          m.province?.toLowerCase() === selectedProvince.toLowerCase();
        const villageMatch = selectedVillage === "all" || 
          m.village?.toLowerCase() === selectedVillage.toLowerCase();
        return provinceMatch && villageMatch;
      });
      const otherMods = allModerators.filter(m => !matchingMods.includes(m));
      sortedModerators = [...matchingMods, ...otherMods];
    } else if (!location.loading) {
      // Sort by live GPS location when no filters applied
      const userCity = location.city || "";
      const userDistrict = location.district || "";
      
      const sameCity = allModerators.filter(m => 
        m.village?.toLowerCase().includes(userCity.toLowerCase()) || 
        m.province?.toLowerCase().includes(userDistrict.toLowerCase())
      );
      
      const sameProfileLocation = isLoggedIn && userData ? allModerators.filter(m => 
        m.province === userData.province && 
        m.village === userData.village &&
        !sameCity.includes(m)
      ) : [];
      
      const others = allModerators.filter(m => 
        !sameCity.includes(m) && 
        !sameProfileLocation.includes(m)
      );
      
      sortedModerators = [...sameCity, ...sameProfileLocation, ...others];
    } else if (isLoggedIn && userData && location.loading) {
      // Fallback to profile location if GPS is loading
      const sameLocation = allModerators.filter(
        m => m.province === userData.province && m.village === userData.village
      );
      const sameProvince = allModerators.filter(
        m => m.province === userData.province && m.village !== userData.village
      );
      const others = allModerators.filter(m => m.province !== userData.province);
      
      sortedModerators = [...sameLocation, ...sameProvince, ...others];
    }

    // Sort contributors by location
    let sortedContributors = [...filteredContributorsList];
    if (selectedProvince === "all" && selectedVillage === "all" && !location.loading) {
      const userCity = location.city || "";
      const userDistrict = location.district || "";
      
      const sameCity = filteredContributorsList.filter(c => 
        c.village?.toLowerCase().includes(userCity.toLowerCase()) || 
        c.province?.toLowerCase().includes(userDistrict.toLowerCase())
      );
      
      const sameProfileLocation = isLoggedIn && userData ? filteredContributorsList.filter(c => 
        c.province === userData.province && 
        c.village === userData.village &&
        !sameCity.includes(c)
      ) : [];
      
      const others = filteredContributorsList.filter(c => 
        !sameCity.includes(c) && 
        !sameProfileLocation.includes(c)
      );
      
      sortedContributors = [...sameCity, ...sameProfileLocation, ...others];
    } else if (isLoggedIn && userData && selectedProvince === "all" && selectedVillage === "all" && location.loading) {
      const sameLocation = filteredContributorsList.filter(
        c => c.province === userData.province && c.village === userData.village
      );
      const sameProvince = filteredContributorsList.filter(
        c => c.province === userData.province && c.village !== userData.village
      );
      const others = filteredContributorsList.filter(c => c.province !== userData.province);
      
      sortedContributors = [...sameLocation, ...sameProvince, ...others];
    }

    // Combine: moderators first, then contributors
    filtered = [...sortedModerators, ...sortedContributors];
    
    console.log('Final filtered display:', {
      totalModerators: sortedModerators.length,
      totalContributors: sortedContributors.length,
      totalDisplay: filtered.length,
      selectedProvince,
      selectedVillage
    });

    setFilteredContributors(filtered);
  }, [allPeople, selectedProvince, selectedVillage, isLoggedIn, userData, location]);

  const handleAddContributor = async () => {
    if (!newContributor.name || !newContributor.phone) {
      toast({
        title: "Missing Information",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "contributors"), {
        name: newContributor.name,
        phone: newContributor.phone,
        email: newContributor.email || "",
        village: newContributor.village || userData?.village || "",
        province: newContributor.province || userData?.province || "",
        area: `${newContributor.village || userData?.village}, ${newContributor.province || userData?.province}`,
        role: newContributor.role,
        bio: newContributor.bio || "",
        status: "active",
        contributions: 0,
        created_at: new Date().toISOString(),
        created_by: userData?.email || "unknown",
        moderator_id: userData?.applicationId || "",
      });

      toast({
        title: "Success",
        description: "Contributor added successfully",
      });

      // Reset form
      setNewContributor({
        name: "",
        phone: "",
        email: "",
        village: "",
        province: "",
        role: "Community Reporter",
        bio: "",
      });
      setShowAddDialog(false);

      // Refresh contributors list
      const q = query(
        collection(db, "contributors"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'contributor'
      })) as Contributor[];
      setContributors(data);
      
      // Update combined list
      const combined = [...data, ...moderators];
      setAllPeople(combined);
    } catch (error) {
      console.error("Error adding contributor:", error);
      toast({
        title: "Error",
        description: "Failed to add contributor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContributorApplication = async () => {
    if (!contributorApplication.name || !contributorApplication.phone || !contributorApplication.email) {
      toast({
        title: "Missing Information",
        description: "Name, phone number, and email are required",
        variant: "destructive",
      });
      return;
    }

    if (!contributorApplication.province || !contributorApplication.village) {
      toast({
        title: "Location Required",
        description: "Please select your province and village to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const selectedProvince = contributorApplication.province.trim();
      const selectedVillage = contributorApplication.village.trim();
      
      // Fetch moderators from the database to ensure we have latest data
      const moderatorsQuery = query(
        collection(db, "mod_applications"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );
      const moderatorsSnapshot = await getDocs(moderatorsQuery);
      const allModerators = moderatorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName,
          email: data.email,
          village: (data.village || "").trim(),
          province: (data.province || "").trim(),
        };
      });

      // Check if there are moderators in the selected area
      const areaModerators = allModerators.filter(mod => {
        return mod.province === selectedProvince && mod.village === selectedVillage;
      });

      if (areaModerators.length === 0) {
        toast({
          title: "No Moderator Available",
          description: `There is currently no moderator for ${selectedVillage}, ${selectedProvince}. Please check back later or contact us directly.`,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Check if contributor already exists
      const contributorsRef = collection(db, "contributor_applications");
      const q = query(contributorsRef, where("status", "==", "approved"));
      const snapshot = await getDocs(q);
      
      const existingContributor = snapshot.docs.find(doc => {
        const data = doc.data();
        return (
          (data.phone === contributorApplication.phone) ||
          (contributorApplication.email && data.email === contributorApplication.email)
        );
      });

      if (existingContributor) {
        toast({
          title: "Application Already Exists",
          description: "A contributor with this phone or email already exists or has already applied.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // First, save the application to Firestore
      const applicationRef = await addDoc(collection(db, "contributor_applications"), {
        name: contributorApplication.name,
        phone: contributorApplication.phone,
        email: contributorApplication.email || "",
        village: selectedVillage,
        province: selectedProvince,
        reason: contributorApplication.reason || "",
        status: "pending",
        applied_at: new Date().toISOString(),
      });

      // Send notification to area moderators
      for (const mod of areaModerators) {
        await addDoc(collection(db, "notifications"), {
          recipient_id: mod.id,
          recipient_email: mod.email,
          type: "contributor_application",
          title: "New Contributor Application",
          message: `${contributorApplication.name} from ${selectedVillage}, ${selectedProvince} has applied to become a contributor.`,
          application_id: applicationRef.id,
          application_data: {
            name: contributorApplication.name,
            phone: contributorApplication.phone,
            email: contributorApplication.email,
            village: selectedVillage,
            province: selectedProvince,
            reason: contributorApplication.reason,
          },
          created_at: new Date().toISOString(),
          read: false,
        });
      }

      toast({
        title: "Application Submitted Successfully!",
        description: `Thank you! Your application has been sent to moderators for review. You will receive an email notification once approved. Please check back later.`,
        duration: 8000,
      });

      // Reset form
      setContributorApplication({
        name: "",
        phone: "",
        email: "",
        village: "",
        province: "",
        reason: "",
      });
      setShowApplicationDialog(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditContributor = async (contributor: Contributor) => {
    // Future implementation
    toast({
      title: "Coming Soon",
      description: "Edit functionality will be available soon",
    });
  };

  const handleDeleteContributor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this contributor?")) return;

    try {
      await deleteDoc(doc(db, "contributors", id));
      
      toast({
        title: "Success",
        description: "Contributor removed successfully",
      });

      // Refresh lists
      setContributors(contributors.filter(c => c.id !== id));
      setAllPeople(allPeople.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting contributor:", error);
      toast({
        title: "Error",
        description: "Failed to remove contributor",
        variant: "destructive",
      });
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
          <h1 className="text-5xl font-bold mb-3">
            {isLoggedIn ? "Community Contributors & Moderators" : "Community Contributors"}
          </h1>
          <p className="text-xl text-white/90">
            {isLoggedIn 
              ? "Connect with local reporters and fellow moderators serving the community"
              : "Meet our verified local reporters serving the community"
            }
          </p>
          {isLoggedIn && (
            <Button
              size="lg"
              className="mt-6 bg-white text-primary hover:bg-white hover:shadow-lg transition-all gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-5 h-5" />
              Add New Contributor
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Filters Section - Available to both logged-in users and visitors */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              {location.loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <h2 className="text-lg font-semibold">Detecting your location...</h2>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Your Current Location</h2>
                  <Badge variant="secondary" className="ml-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {location.city}{location.district && `, ${location.district}`}
                  </Badge>
                </>
              )}
            </div>
            
            {!location.loading && location.city && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Live GPS Location:</strong> Contributors from <strong>{location.city}</strong> will be shown first
                </p>
              </div>
            )}
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Filter by Location</h3>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> All moderators are always visible. Filters apply to contributors only.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Province</label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Provinces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {provinces.map(province => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Village</label>
                  <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Villages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Villages</SelectItem>
                      {villages.map(village => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedProvince === "all" && selectedVillage === "all" && !location.loading && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing all moderators and contributors based on your live GPS location
                </p>
              )}
            </Card>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredContributors.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No {isLoggedIn ? "contributors or moderators" : "contributors"} found{selectedProvince !== "all" || selectedVillage !== "all" ? " matching your filters" : " yet"}.</p>
              {(selectedProvince !== "all" || selectedVillage !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedProvince("all");
                    setSelectedVillage("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {selectedProvince === "all" && selectedVillage === "all" && !location.loading && location.city && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>
                    {isLoggedIn && userData ? (
                      <>
                        Showing {filteredContributors.length} {filteredContributors.length === 1 ? "person" : "people"} ({filteredContributors.filter(p => p.type === 'moderator').length} moderators, {filteredContributors.filter(p => p.type === 'contributor').length} contributors) near <strong>{location.city}</strong> first
                      </>
                    ) : (
                      <>
                        Showing {filteredContributors.length} {filteredContributors.length === 1 ? "person" : "people"} ({filteredContributors.filter(p => p.type === 'moderator').length} moderators, {filteredContributors.filter(p => p.type === 'contributor').length} contributors) near <strong>{location.city}</strong> first
                      </>
                    )}
                  </span>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {filteredContributors.map((person) => (
                  person.type === 'moderator' ? (
                    <ModeratorCard key={person.id} moderator={person as Moderator} />
                  ) : (
                    <ContributorCard 
                      key={person.id} 
                      contributor={person as Contributor}
                      showActions={isLoggedIn}
                      onEdit={handleEditContributor}
                      onDelete={handleDeleteContributor}
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-3">Become a Contributor</h3>
                <p className="text-muted-foreground mb-6">
                  Share local information and help your community stay informed. Apply to become a verified contributor.
                </p>
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                  onClick={() => setShowApplicationDialog(true)}
                >
                  Apply to Become a Contributor
                </Button>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
                <h3 className="text-2xl font-bold text-foreground mb-3">Become a Moderator</h3>
                <p className="text-muted-foreground mb-6">
                  Help manage and verify local information for your community. Join our team of trusted moderators.
                </p>
                <Link to="/apply-moderator">
                  <Button size="lg" variant="outline" className="w-full border-accent/40 hover:bg-accent/10">
                    Apply to Become a Moderator
                  </Button>
                </Link>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Add Contributor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Add New Contributor
            </DialogTitle>
            <DialogDescription>
              Register a community member who calls to share alerts and information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter contributor's name"
                  value={newContributor.name}
                  onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Phone number they call from"
                  value={newContributor.phone}
                  onChange={(e) => setNewContributor({ ...newContributor, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={newContributor.email}
                  onChange={(e) => setNewContributor({ ...newContributor, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newContributor.role}
                  onValueChange={(value) => setNewContributor({ ...newContributor, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Community Reporter">Community Reporter</SelectItem>
                    <SelectItem value="Local Farmer">Local Farmer</SelectItem>
                    <SelectItem value="Market Vendor">Market Vendor</SelectItem>
                    <SelectItem value="Transport Operator">Transport Operator</SelectItem>
                    <SelectItem value="Village Elder">Village Elder</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">
                  Village
                  {userData?.village && " (Defaults to your village)"}
                </Label>
                <Select 
                  value={newContributor.village} 
                  onValueChange={(value) => setNewContributor({ ...newContributor, village: value })}
                >
                  <SelectTrigger id="village">
                    <SelectValue placeholder={userData?.village || "Select village"} />
                  </SelectTrigger>
                  <SelectContent>
                    {userData?.village && (
                      <SelectItem value={userData.village}>{userData.village} (Your village)</SelectItem>
                    )}
                    {villages.filter(v => v !== userData?.village).map(village => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">
                  Province
                  {userData?.province && " (Defaults to your province)"}
                </Label>
                <Select 
                  value={newContributor.province} 
                  onValueChange={(value) => setNewContributor({ ...newContributor, province: value })}
                >
                  <SelectTrigger id="province">
                    <SelectValue placeholder={userData?.province || "Select province"} />
                  </SelectTrigger>
                  <SelectContent>
                    {userData?.province && (
                      <SelectItem value={userData.province}>{userData.province} (Your province)</SelectItem>
                    )}
                    {provinces.filter(p => p !== userData?.province).map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Notes (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Additional information about this contributor..."
                value={newContributor.bio}
                onChange={(e) => setNewContributor({ ...newContributor, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Important Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>This person will be able to call and share community alerts</li>
                <li>Their phone number will be verified when they call</li>
                <li>You can manage their contributions from your dashboard</li>
                <li>All information shared by them will be attributed to this profile</li>
              </ul>
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
            <Button
              onClick={handleAddContributor}
              disabled={isSaving}
            >
              {isSaving ? "Adding..." : "Add Contributor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contributor Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Apply to Become a Contributor
            </DialogTitle>
            <DialogDescription>
              Submit your information to become a verified contributor. A moderator will review your application and create your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="app-name"
                  placeholder="Enter your full name"
                  value={contributorApplication.name}
                  onChange={(e) => setContributorApplication({ ...contributorApplication, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="app-phone"
                  placeholder="Your phone number"
                  value={contributorApplication.phone}
                  onChange={(e) => setContributorApplication({ ...contributorApplication, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-email">Email *</Label>
                <Input
                  id="app-email"
                  type="email"
                  placeholder="your@email.com"
                  value={contributorApplication.email}
                  onChange={(e) => setContributorApplication({ ...contributorApplication, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-village">Village / Town</Label>
                <Select 
                  value={contributorApplication.village} 
                  onValueChange={(value) => setContributorApplication({ ...contributorApplication, village: value })}
                >
                  <SelectTrigger id="app-village">
                    <SelectValue placeholder="Select your village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map(village => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="app-province">Province</Label>
                <Select 
                  value={contributorApplication.province} 
                  onValueChange={(value) => setContributorApplication({ ...contributorApplication, province: value })}
                >
                  <SelectTrigger id="app-province">
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-reason">Why do you want to become a contributor?</Label>
              <Textarea
                id="app-reason"
                placeholder="Tell us why you want to help share local information..."
                value={contributorApplication.reason}
                onChange={(e) => setContributorApplication({ ...contributorApplication, reason: e.target.value })}
                rows={4}
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Your application will be reviewed by a moderator</li>
                <li>If approved, a moderator will create your contributor account</li>
                <li>You'll be able to call in and share local alerts and information</li>
                <li>Your contributions will help keep the community informed</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApplicationDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContributorApplication}
              disabled={isSaving}
            >
              {isSaving ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contributors;