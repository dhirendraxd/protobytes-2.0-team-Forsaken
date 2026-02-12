import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Eye, Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  municipality: string;
  wardNumber: string;
  status: "pending" | "approved" | "rejected";
  created_at: string | Date;
  accessCode?: string;
  [key: string]: unknown;
}

interface ApplicationReviewProps {
  applications: Application[];
  onRefresh: () => void;
}

export const ApplicationReview = ({ applications, onRefresh }: ApplicationReviewProps) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const { toast } = useToast();

  const generateAccessCode = () => {
    // Generate a unique 8-character access code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleApprove = async (application: Application) => {
    try {
      const accessCode = generateAccessCode();
      await updateDoc(doc(db, "mod_applications", application.id), {
        status: "approved",
        reviewed: true,
        accessCode: accessCode,
        reviewedAt: new Date().toISOString(),
      });

      toast({
        title: "Application Approved",
        description: `Access code ${accessCode} generated. Send this to ${application.email}`,
      });

      onRefresh();
    } catch (error) {
      console.error("Error approving application:", error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (application: Application) => {
    try {
      await updateDoc(doc(db, "mod_applications", application.id), {
        status: "rejected",
        reviewed: true,
        reviewedAt: new Date().toISOString(),
      });

      toast({
        title: "Application Rejected",
        description: "The application has been rejected.",
      });

      onRefresh();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Access code copied to clipboard",
    });
  };

  const viewDetails = (app: Application) => {
    setSelectedApp(app);
    setViewDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <>
      <Card className="p-6">
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No applications to review.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.fullName}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    {app.municipality}, Ward {app.wardNumber}
                  </TableCell>
                  <TableCell>{app.age}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {app.accessCode ? (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {app.accessCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAccessCode(app.accessCode!)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(app)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {app.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(app)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(app)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Full application information for {selectedApp?.fullName}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedApp.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{selectedApp.age}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{selectedApp.gender}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApp.email}</p>
                  </div>
                  {selectedApp.alternatePhone && (
                    <div>
                      <p className="text-muted-foreground">Alternate Phone</p>
                      <p className="font-medium">{selectedApp.alternatePhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Geographical Information */}
              <div>
                <h3 className="font-semibold mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Province</p>
                    <p className="font-medium capitalize">{selectedApp.province}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{selectedApp.district}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Municipality</p>
                    <p className="font-medium">{selectedApp.municipality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ward</p>
                    <p className="font-medium">{selectedApp.wardNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tole</p>
                    <p className="font-medium">{selectedApp.tole}</p>
                  </div>
                  {selectedApp.nearestLandmark && (
                    <div>
                      <p className="text-muted-foreground">Landmark</p>
                      <p className="font-medium">{selectedApp.nearestLandmark}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Demographic Information */}
              <div>
                <h3 className="font-semibold mb-3">Demographics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Education</p>
                    <p className="font-medium capitalize">{selectedApp.education}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Occupation</p>
                    <p className="font-medium">{selectedApp.occupation}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Languages</p>
                    <p className="font-medium">{selectedApp.languagesSpoken}</p>
                  </div>
                  {selectedApp.ethnicGroup && (
                    <div>
                      <p className="text-muted-foreground">Ethnic Group</p>
                      <p className="font-medium">{selectedApp.ethnicGroup}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <h3 className="font-semibold mb-3">Motivation</h3>
                <p className="text-sm">{selectedApp.reasonForApplying}</p>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Availability</p>
                    <p className="font-medium capitalize">{selectedApp.availability}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Smartphone</p>
                    <p className="font-medium capitalize">{selectedApp.hasSmartphone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Internet Access</p>
                    <p className="font-medium capitalize">{selectedApp.hasInternetAccess}</p>
                  </div>
                </div>
              </div>

              {/* Access Code */}
              {selectedApp.accessCode && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Access Code</p>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono font-bold">
                      {selectedApp.accessCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAccessCode(selectedApp.accessCode!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
