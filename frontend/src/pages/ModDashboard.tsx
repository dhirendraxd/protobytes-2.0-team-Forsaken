import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Bus, 
  AlertCircle, 
  Users, 
  Plus,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { AddContributorDialog } from "@/components/AddContributorDialog";
import { ContributorCard, type Contributor } from "@/components/ContributorCard";
import { ApplicationReview } from "@/components/ApplicationReview";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const ModDashboard = () => {
  const { user, userProfile, isModerator, loading } = useAuth();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  
  interface ModApplication {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    area: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: {seconds?: number; nanoseconds?: number} | Date;
  }
  
  const [applications, setApplications] = useState<ModApplication[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContributors = async () => {
    try {
      const q = query(
        collection(db, "contributors"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Contributor[];
      setContributors(data);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast({
        title: "Error",
        description: "Failed to load contributors",
        variant: "destructive",
      });
    } finally {
      setLoadingContributors(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const q = query(
        collection(db, "mod_applications"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ModApplication[];
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    fetchContributors();
    fetchApplications();
    // Functions are defined in this component, safe to exclude from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, "contributors", deleteId));
      setContributors(prev => prev.filter(c => c.id !== deleteId));
      toast({
        title: "Success",
        description: "Contributor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting contributor:", error);
      toast({
        title: "Error",
        description: "Failed to delete contributor",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleContributorAdded = () => {
    setShowAddDialog(false);
    fetchContributors();
  };

  // Redirect if not logged in or not a moderator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !isModerator) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Moderator Dashboard</h1>
              <p className="text-white/90">Welcome back, {userProfile?.full_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <ChangePasswordDialog />
              <Badge variant="secondary" className="text-base px-4 py-2">
                Moderator
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Prices</p>
                <p className="text-2xl font-bold">42</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Bus className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transport Routes</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">{contributors.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prices">Market Prices</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* Market Prices Management */}
          <TabsContent value="prices" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Market Prices</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Price
              </Button>
            </div>

            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Market price management interface will be displayed here.
                <br />
                Add, edit, and delete commodity prices for different markets.
              </p>
            </Card>
          </TabsContent>

          {/* Transport Management */}
          <TabsContent value="transport" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Transport Schedules</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Transport schedule management interface will be displayed here.
                <br />
                Update bus/jeep schedules, delays, and cancellations.
              </p>
            </Card>
          </TabsContent>

          {/* Alerts Management */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Local Alerts</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </div>

            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Alert management interface will be displayed here.
                <br />
                Create and manage community announcements and alerts.
              </p>
            </Card>
          </TabsContent>

          {/* Contributors Management */}
          <TabsContent value="contributors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Contributors</h2>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contributor
              </Button>
            </div>

            {loadingContributors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : contributors.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No contributors added yet.</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contributor
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {contributors.map((contributor) => (
                  <ContributorCard 
                    key={contributor.id} 
                    contributor={contributor}
                    showActions
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Moderator Applications */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Moderator Applications</h2>
              <Badge variant="secondary">
                {applications.filter(app => app.status === 'pending').length} Pending
              </Badge>
            </div>

            {loadingApplications ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ApplicationReview 
                applications={applications as any} 
                onRefresh={fetchApplications}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Contributor Dialog */}
      <AddContributorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleContributorAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contributor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contributor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModDashboard;
