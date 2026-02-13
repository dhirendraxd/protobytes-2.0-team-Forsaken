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
  const [contactGroup, setContactGroup] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sentMessages, setSentMessages] = useState<
    Array<{
      id: string;
      message: string;
      group: string;
      count: number;
      timestamp: string;
    }>
  >([
    {
      id: "1",
      message: "Special offer: 20% off on all products this weekend!",
      group: "VIP Customers",
      count: 450,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      message: "New products arriving next week. Stay tuned!",
      group: "All Contacts",
      count: 1234,
      timestamp: "1 day ago",
    },
  ]);

  const contactGroups = [
    { value: "all", label: "All Contacts", count: 1234 },
    { value: "vip", label: "VIP Customers", count: 450 },
    { value: "regular", label: "Regular Customers", count: 380 },
    { value: "new", label: "New Subscribers", count: 404 },
  ];

  const maxChars = 160;
  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const selectedGroupData = contactGroups.find((g) => g.value === contactGroup);
  const recipientCount = selectedGroupData?.count || 0;

  const handleSend = () => {
    if (!message || !contactGroup) {
      alert("Please fill in all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSend = () => {
    const newMessage = {
      id: Date.now().toString(),
      message: message,
      group: selectedGroupData?.label || contactGroup,
      count: recipientCount,
      timestamp: "Just now",
    };
    setSentMessages([newMessage, ...sentMessages]);
    setMessage("");
    setContactGroup("");
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Send SMS Messages
          </h2>
          <p className="text-muted-foreground">
            Send messages to your customers and contacts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose SMS Form */}
        <div className="space-y-6">
          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Compose Message
            </h3>

            <div className="space-y-4">
              {/* Message Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message</Label>
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
                  placeholder="Enter your message (promotions, updates, notifications, etc.)..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Keep messages clear and engaging. Longer messages cost more credits.
                </p>
              </div>

              {/* Contact Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="contact-group">Recipients</Label>
                <Select value={contactGroup} onValueChange={setContactGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact group" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactGroups.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label} ({group.count} contacts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message || !contactGroup}
            className="w-full gap-2 h-12 text-lg"
          >
            <Send className="w-5 h-5" />
            Review & Send
          </Button>
        </div>

        {/* Right Column: Confirmation & History */}
        <div className="space-y-6">
          {/* Confirmation Dialog */}
          {showConfirmation && (
            <Card className="p-6 border-2 border-primary/50 backdrop-blur-sm bg-primary/10">
              <div className="flex items-start gap-4 mb-4">
                <Send className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Confirm Send
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please review the details before sending. Messages will be delivered immediately.
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
                      Group:
                    </span>
                    <p className="text-sm text-foreground font-medium">
                      {selectedGroupData?.label}
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
                  className="flex-1 gap-2"
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

          {/* Recent Messages */}
          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Recent Messages
            </h3>
            <div className="space-y-3">
              {sentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <p className="text-sm text-foreground font-medium mb-2">
                    "{msg.message}"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {msg.group}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {msg.count} contacts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-6 border border-blue-500/30 backdrop-blur-sm bg-blue-500/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-foreground mb-2">
                  Best Practices
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Messages are sent immediately and cannot be recalled</li>
                  <li>• Always verify message content and recipient group</li>
                  <li>• Keep messages concise and include clear call-to-action</li>
                  <li>• All messages are logged for your records</li>
                  <li>• SMS: $0.05/message • Voice: $0.15/minute</li>
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
