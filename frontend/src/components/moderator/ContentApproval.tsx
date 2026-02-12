import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  FolderTree,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  title: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
  content: string;
  type: "briefing" | "market-price" | "alert" | "community-notice";
  status: "pending" | "approved" | "rejected";
  region: string;
}

const ContentApproval = () => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      title: "Weekly Agricultural Update - Rice Harvest",
      category: "Community Notices",
      submittedBy: "Farmer's Cooperative Group",
      submittedAt: "2024-02-12 10:30 AM",
      content:
        "Rice harvest season has begun in the valley. Farmers are advised to prepare equipment and ensure proper drying facilities. Expected yield is 20% higher than last year.",
      type: "briefing",
      status: "pending",
      region: "Region A",
    },
    {
      id: "2",
      title: "Market Prices Update - Vegetables",
      category: "Market Prices",
      submittedBy: "Local Market Association",
      submittedAt: "2024-02-12 09:15 AM",
      content:
        "Tomato: Rs 80/kg, Potato: Rs 45/kg, Onion: Rs 65/kg, Cauliflower: Rs 55/kg. Prices stable compared to last week.",
      type: "market-price",
      status: "pending",
      region: "All Regions",
    },
    {
      id: "3",
      title: "Road Closure Notice - Main Highway",
      category: "Transport Updates",
      submittedBy: "Transport Committee",
      submittedAt: "2024-02-11 04:20 PM",
      content:
        "Main highway will be closed for maintenance on Feb 15-16. Alternative route via valley road available. Expected delays: 30-45 minutes.",
      type: "alert",
      status: "pending",
      region: "Region B",
    },
    {
      id: "4",
      title: "Community Meeting Announcement",
      category: "Community Notices",
      submittedBy: "Village Council",
      submittedAt: "2024-02-11 02:00 PM",
      content:
        "Monthly community meeting scheduled for Feb 18 at 3 PM. Topics: water management, school renovation fund. All residents welcome.",
      type: "community-notice",
      status: "pending",
      region: "Region C",
    },
  ]);

  const pendingCount = submissions.filter(
    (s) => s.status === "pending"
  ).length;

  const handleApprove = (submission: Submission) => {
    setSubmissions(
      submissions.map((s) =>
        s.id === submission.id ? { ...s, status: "approved" } : s
      )
    );
    setSelectedSubmission(null);
    setReviewNote("");
  };

  const handleReject = (submission: Submission) => {
    if (!reviewNote) {
      alert("Please provide a reason for rejection");
      return;
    }
    setSubmissions(
      submissions.map((s) =>
        s.id === submission.id ? { ...s, status: "rejected" } : s
      )
    );
    setSelectedSubmission(null);
    setReviewNote("");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-600 border-green-500/30",
      rejected: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "briefing":
        return "📄";
      case "market-price":
        return "💰";
      case "alert":
        return "⚠️";
      case "community-notice":
        return "📢";
      default:
        return "📋";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Content Approval Queue
          </h2>
          <p className="text-muted-foreground">
            Review community-submitted content before publishing
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-6 py-3 border border-orange-500/30 bg-orange-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending Reviews
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-0">
        <button className="px-4 py-2 border-b-2 border-primary text-foreground font-medium">
          Pending ({pendingCount})
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
          Approved (
          {submissions.filter((s) => s.status === "approved").length})
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
          Rejected (
          {submissions.filter((s) => s.status === "rejected").length})
        </button>
      </div>

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-4">
        {submissions
          .filter((s) => s.status === "pending")
          .map((submission) => (
            <Card
              key={submission.id}
              className="p-6 border border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-grow space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(submission.type)}</span>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {submission.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {submission.submittedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {submission.submittedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <FolderTree className="w-4 h-4" />
                          {submission.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="pl-11">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {submission.content}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="pl-11 flex gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getStatusBadge(
                        submission.status
                      )}`}
                    >
                      {submission.status.toUpperCase()}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full border border-border/50 bg-background/50 text-muted-foreground">
                      {submission.region}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full border border-border/50 bg-background/50 text-muted-foreground capitalize">
                      {submission.type.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setSelectedSubmission(submission)}
                    variant="outline"
                    size="sm"
                    className="gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}

        {pendingCount === 0 && (
          <Card className="p-12 border border-border/50 backdrop-blur-sm bg-card/50 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              All Caught Up!
            </h3>
            <p className="text-muted-foreground">
              No pending submissions to review at the moment.
            </p>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Review Submission</DialogTitle>
            <DialogDescription>
              Carefully review the content before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="text-lg font-bold text-foreground">
                    {selectedSubmission.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="text-foreground font-medium">
                      {selectedSubmission.category}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Region</Label>
                    <p className="text-foreground font-medium">
                      {selectedSubmission.region}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Submitted By
                    </Label>
                    <p className="text-foreground font-medium">
                      {selectedSubmission.submittedBy}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Submitted At
                    </Label>
                    <p className="text-foreground font-medium">
                      {selectedSubmission.submittedAt}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Content</Label>
                  <div className="mt-2 p-4 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-foreground">{selectedSubmission.content}</p>
                  </div>
                </div>
              </div>

              {/* Review Note */}
              <div className="space-y-2">
                <Label htmlFor="reviewNote">
                  Review Notes (Required for rejection)
                </Label>
                <textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleApprove(selectedSubmission)}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve & Publish
                </Button>
                <Button
                  onClick={() => handleReject(selectedSubmission)}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setReviewNote("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="p-6 border border-blue-500/30 backdrop-blur-sm bg-blue-500/10">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-foreground mb-2">
              Content Review Guidelines
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Verify information accuracy before approving</li>
              <li>✓ Check for appropriate language and tone</li>
              <li>✓ Ensure content matches the selected category</li>
              <li>✓ Confirm region targeting is correct</li>
              <li>✓ Provide clear rejection reasons to help contributors improve</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentApproval;
