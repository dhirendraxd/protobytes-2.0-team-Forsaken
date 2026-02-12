import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface IncomingAlert {
  id: string;
  alert_text: string;
  contributor_email: string;
  contributor_name: string;
  village: string;
  province: string;
  created_at: {
    toDate: () => Date;
  };
  status: "pending" | "accepted" | "rejected";
}

interface AlertReviewCardProps {
  alert: IncomingAlert;
  onAccept: (alertId: string, contactNumber: string, sourceNumber: string) => Promise<void>;
  onReject: (alertId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const AlertReviewCard = ({ 
  alert, 
  onAccept, 
  onReject,
  isLoading = false 
}: AlertReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [sourceNumber, setSourceNumber] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!contactNumber.trim()) {
      window.alert("Please enter the contact number");
      return;
    }
    if (!sourceNumber.trim()) {
      window.alert("Please enter the source number");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAccept(alert.id, contactNumber, sourceNumber);
      setContactNumber("");
      setSourceNumber("");
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      window.alert("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(alert.id, rejectReason);
      setRejectReason("");
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-accent hover:shadow-lg transition-shadow">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{alert.contributor_name}</CardTitle>
            <CardDescription className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                {alert.village}, {alert.province}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                {alert.contributor_email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {alert.created_at ? formatDistanceToNow(alert.created_at.toDate(), { addSuffix: true }) : "Recently"}
              </div>
            </CardDescription>
          </div>
          <Badge variant={alert.status === "pending" ? "secondary" : "outline"}>
            {alert.status}
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Alert Content */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Alert Message:</h4>
            <p className="text-foreground text-sm whitespace-pre-wrap">{alert.alert_text}</p>
          </div>

          {alert.status === "pending" && (
            <>
              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor={`contact-${alert.id}`} className="text-sm font-semibold">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Number (who provided info)
                </Label>
                <Input
                  id={`contact-${alert.id}`}
                  placeholder="e.g., +977-1234567890"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  disabled={isSubmitting || isLoading}
                />
              </div>

              {/* Source Number */}
              <div className="space-y-2">
                <Label htmlFor={`source-${alert.id}`} className="text-sm font-semibold">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Source Number (reporter's number)
                </Label>
                <Input
                  id={`source-${alert.id}`}
                  placeholder="e.g., +977-9876543210"
                  value={sourceNumber}
                  onChange={(e) => setSourceNumber(e.target.value)}
                  disabled={isSubmitting || isLoading}
                />
              </div>

              {/* Reject Reason */}
              <div className="space-y-2">
                <Label htmlFor={`reject-${alert.id}`} className="text-sm font-semibold">
                  Reject Reason (if rejecting)
                </Label>
                <Textarea
                  id={`reject-${alert.id}`}
                  placeholder="Why are you rejecting this alert? (optional if accepting)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="resize-none"
                  disabled={isSubmitting || isLoading}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleAccept}
                  disabled={isSubmitting || isLoading || !contactNumber.trim() || !sourceNumber.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Alert
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting || isLoading || !rejectReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </>
          )}

          {alert.status === "accepted" && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">✓ This alert has been accepted and published.</p>
            </div>
          )}

          {alert.status === "rejected" && (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">✗ This alert has been rejected.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
