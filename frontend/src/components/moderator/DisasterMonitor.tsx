import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';

/**
 * DisasterMonitor Component
 * Displays static disaster data from ReliefWeb with SMS alert capability
 */
export default function DisasterMonitor() {
  const [showSendDialog, setShowSendDialog] = useState(false);

  // Static data
  const stats = {
    activeDisasters: 1,
    recentReports: 2,
    last24Hours: 1,
    totalAlertsSent: 0,
  };

  const activeDisasters = [
    {
      id: '1',
      name: 'Heavy Rainfall in Central Nepal',
      type: 'Flood',
      status: 'ongoing',
      glide: 'FL-2026-000123-NPL',
      date: '2026-02-10',
    },
  ];

  const recentReports = [
    {
      id: 'r1',
      title: 'Landslide Warning Issued for Eastern Districts',
      format: 'Alert',
      source: 'OCHA Nepal',
      date: '2026-02-12',
    },
    {
      id: 'r2',
      title: 'Earthquake Assessment Report - Magnitude 4.2',
      format: 'Situation Report',
      source: 'USGS',
      date: '2026-02-11',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Disaster Monitoring
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time emergency tracking and SMS alerts for Nepal
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-border/50 backdrop-blur-sm bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Active Disasters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeDisasters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ongoing emergencies
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 backdrop-blur-sm bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Last 24 Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.last24Hours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              New reports
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 backdrop-blur-sm bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-500" />
              Alerts Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAlertsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              SMS notifications
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/50 backdrop-blur-sm bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500/20 text-green-600 border border-green-500/30">
              Active
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Monitoring enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Disasters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disasters List */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Active Disasters ({activeDisasters.length})
            </h3>
          </div>

          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <div className="space-y-4">
              {activeDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-foreground">
                        {disaster.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type: <span className="font-medium">{disaster.type}</span>
                      </p>
                    </div>
                    <Badge variant="destructive">{disaster.status}</Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">GLIDE ID:</span>{' '}
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {disaster.glide}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Started:</span>{' '}
                      <span className="font-medium">{disaster.date}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => setShowSendDialog(true)}
                    >
                      <Send className="h-4 w-4" />
                      Send Alert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Recent Reports ({recentReports.length})
            </h3>
          </div>

          <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="border-l-4 border-orange-500/50 pl-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <h4 className="font-medium text-foreground mb-2">
                    {report.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-muted">
                      {report.format}
                    </span>
                    <span>•</span>
                    <span>{report.source}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-6 border border-blue-500/30 backdrop-blur-sm bg-blue-500/10">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground mb-3">
              About Disaster Monitoring
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p>✓ Real-time data from ReliefWeb (UN OCHA)</p>
                <p>✓ Covers all disaster types in Nepal</p>
              </div>
              <div className="space-y-1">
                <p>✓ Send free SMS alerts instantly</p>
                <p>✓ 100% free service for moderators</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Send Alert Confirmation Dialog */}
      {showSendDialog && (
        <Card className="p-6 border-2 border-orange-500/50 backdrop-blur-sm bg-orange-500/10">
          <div className="space-y-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Confirm SMS Alert
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Send emergency notification to affected users
                </p>
              </div>
            </div>

            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground mb-3">
                Alert Details:
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-foreground font-medium min-w-fit">
                    Message:
                  </span>
                  <span>"ALERT: Flood - Heavy Rainfall in Central Nepal"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground font-medium min-w-fit">
                    Recipients:
                  </span>
                  <span>~500 affected users</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground font-medium min-w-fit">
                    Cost:
                  </span>
                  <Badge className="bg-green-500/20 text-green-600 border border-green-500/30">
                    Free
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSendDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 gap-2"
                onClick={() => {
                  alert('✅ Alert sent successfully to 500 users!');
                  setShowSendDialog(false);
                }}
              >
                <Send className="h-4 w-4" />
                Confirm & Send
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
