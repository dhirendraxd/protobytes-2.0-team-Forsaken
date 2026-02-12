import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Users,
  Clock,
} from "lucide-react";

interface SMSAlert {
  message: string;
  region: string;
  recipientCount: number;
}

const SMSAlertCenter = () => {
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sentAlerts, setSentAlerts] = useState<
    Array<{
      id: string;
      message: string;
      region: string;
      count: number;
      timestamp: string;
    }>
  >([
    {
      id: "1",
      message: "Heavy rainfall expected. Stay safe.",
      region: "Region A",
      count: 450,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      message: "Market closed tomorrow for holiday.",
      region: "All Regions",
      count: 1234,
      timestamp: "1 day ago",
    },
  ]);

  const regions = [
    { value: "all", label: "All Regions", count: 1234 },
    { value: "region-a", label: "Region A", count: 450 },
    { value: "region-b", label: "Region B", count: 380 },
    { value: "region-c", label: "Region C", count: 404 },
  ];

  const maxChars = 160;
  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const selectedRegionData = regions.find((r) => r.value === region);
  const recipientCount = selectedRegionData?.count || 0;

  const handleSend = () => {
    if (!message || !region) {
      alert("Please fill in all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSend = () => {
    const newAlert = {
      id: Date.now().toString(),
      message: message,
      region: selectedRegionData?.label || region,
      count: recipientCount,
      timestamp: "Just now",
    };
    setSentAlerts([newAlert, ...sentAlerts]);
    setMessage("");
    setRegion("");
    setUrgency("normal");
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            SMS Alert Center
          </h2>
          <p className="text-muted-foreground">
            Send urgent notifications to users by region
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose SMS Form */}
        <div className="space-y-6">
          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Compose Alert
            </h3>

            <div className="space-y-4">
              {/* Message Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Alert Message</Label>
                  <span
                    className={`text-sm ${
                      charCount > maxChars
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {charCount}/{maxChars} chars ({smsCount} SMS)
                  </span>
                </div>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your urgent alert message here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Keep messages clear and concise. Avoid special characters.
                </p>
              </div>

              {/* Region Selection */}
              <div className="space-y-2">
                <Label htmlFor="region">Target Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value}>
                        {reg.label} ({reg.count} users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency Level */}
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General Notice</SelectItem>
                    <SelectItem value="normal">Normal - Important</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                    <SelectItem value="critical">
                      Critical - Emergency
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message || !region}
            className="w-full gap-2 h-12 text-lg"
          >
            <Send className="w-5 h-5" />
            Review & Send Alert
          </Button>
        </div>

        {/* Right Column: Confirmation & History */}
        <div className="space-y-6">
          {/* Confirmation Dialog */}
          {showConfirmation && (
            <Card className="p-6 border-2 border-orange-500/50 backdrop-blur-sm bg-orange-500/10">
              <div className="flex items-start gap-4 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Confirm SMS Alert
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please review the details before sending. This action cannot
                    be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6 p-4 rounded-lg bg-background/50 border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Message:
                  </span>
                  <p className="text-sm text-foreground font-medium">
                    "{message}"
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Region:
                    </span>
                    <p className="text-sm text-foreground font-medium">
                      {selectedRegionData?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Recipients:
                    </span>
                    <p className="text-sm text-foreground font-medium">
                      {recipientCount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmSend}
                  className="flex-1 gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Send
                </Button>
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Alerts */}
          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Recent Alerts Sent
            </h3>
            <div className="space-y-3">
              {sentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm text-foreground font-medium mb-2">
                    "{alert.message}"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {alert.count} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Warning Card */}
          <Card className="p-6 border border-red-500/30 backdrop-blur-sm bg-red-500/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-foreground mb-2">
                  Important Guidelines
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• SMS alerts are sent immediately and cannot be recalled</li>
                  <li>• Always verify the message and target region</li>
                  <li>• Use urgency levels appropriately to avoid alert fatigue</li>
                  <li>• All alerts are logged and can be audited</li>
                  <li>• Free SMS service - no sending costs</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SMSAlertCenter;
