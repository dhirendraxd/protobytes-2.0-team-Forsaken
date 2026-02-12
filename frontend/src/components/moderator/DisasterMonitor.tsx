import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import {
  AlertTriangle,
  Bell,
  BellOff,
  RefreshCw,
  Send,
  Settings,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

/**
 * DisasterMonitor Component
 * Monitors ReliefWeb API for disasters and allows automated SMS alerts
 */
export default function DisasterMonitor() {
  const [config, setConfig] = useState({
    enabled: true,
    autoSendSMS: false,
    checkInterval: 3600000,
    lastCheck: new Date(),
    monitoredTypes: [
      'Earthquake',
      'Flood',
      'Landslide',
      'Epidemic',
      'Storm',
      'Fire',
      'Cold Wave',
    ],
    targetCountry: 'NPL',
    regions: [],
  });

  const [activeDisasters, setActiveDisasters] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [stats, setStats] = useState({
    activeDisasters: 0,
    recentReports: 0,
    last24Hours: 0,
    totalAlertsSent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const allDisasterTypes = [
    'Earthquake',
    'Flood',
    'Landslide',
    'Epidemic',
    'Storm',
    'Fire',
    'Cold Wave',
    'Drought',
    'Tsunami',
    'Volcanic Activity',
  ];

  // Fetch initial data
  useEffect(() => {
    fetchConfig();
    fetchActiveDisasters();
    fetchRecentReports();
    fetchStats();
  }, []);

  // Auto-check for new disasters if enabled
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      checkForNewDisasters();
    }, config.checkInterval);

    return () => clearInterval(interval);
  }, [config.enabled, config.checkInterval]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchActiveDisasters = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/disasters/active');
      const data = await response.json();
      if (data.success) {
        setActiveDisasters(data.data);
      }
    } catch (error) {
      console.error('Error fetching active disasters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters/recent?limit=10');
      const data = await response.json();
      if (data.success) {
        setRecentReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkForNewDisasters = async () => {
    try {
      setChecking(true);
      const response = await fetch('http://localhost:5000/api/disasters/check');
      const data = await response.json();
      if (data.success && data.count > 0) {
        // New disasters found!
        await fetchActiveDisasters();
        await fetchRecentReports();
        await fetchStats();
        
        // Show notification
        alert(`${data.count} new disaster(s) detected!`);
      }
    } catch (error) {
      console.error('Error checking for new disasters:', error);
    } finally {
      setChecking(false);
    }
  };

  const updateConfig = async (updates) => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const sendAlert = async (disaster, regions = []) => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disasterId: disaster.id,
          disasterData: disaster,
          regions,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Alert sent successfully to ${data.data.recipientCount} people!`);
        await fetchStats();
        setShowSendDialog(false);
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Failed to send alert');
    }
  };

  const toggleDisasterType = (type) => {
    const newTypes = config.monitoredTypes.includes(type)
      ? config.monitoredTypes.filter((t) => t !== type)
      : [...config.monitoredTypes, type];
    
    updateConfig({ monitoredTypes: newTypes });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Disasters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDisasters}</div>
            <p className="text-xs text-muted-foreground">Ongoing emergencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last24Hours}</div>
            <p className="text-xs text-muted-foreground">New reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alerts Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlertsSent}</div>
            <p className="text-xs text-muted-foreground">SMS notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={config.enabled ? 'default' : 'secondary'}>
              {config.enabled ? 'Active' : 'Paused'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {config.autoSendSMS ? 'Auto-send ON' : 'Manual approval'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Disaster Monitoring</CardTitle>
              <CardDescription>
                Automated alerts from ReliefWeb API for Nepal disasters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkForNewDisasters}
                disabled={checking}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                Check Now
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfigDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="monitoring-toggle">Enable Monitoring</Label>
              {config.enabled ? (
                <Bell className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <Switch
              id="monitoring-toggle"
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig({ enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-send-toggle">Auto-Send SMS Alerts</Label>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </div>
            <Switch
              id="auto-send-toggle"
              checked={config.autoSendSMS}
              onCheckedChange={(checked) => updateConfig({ autoSendSMS: checked })}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Last checked: {new Date(config.lastCheck).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Active Disasters */}
      <Card>
        <CardHeader>
          <CardTitle>Active Disasters</CardTitle>
          <CardDescription>
            Ongoing emergencies requiring attention ({activeDisasters.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading disasters...
            </div>
          ) : activeDisasters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active disasters at this time
            </div>
          ) : (
            <div className="space-y-3">
              {activeDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h4 className="font-semibold">{disaster.fields?.name}</h4>
                        <Badge variant="destructive">{disaster.fields?.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {disaster.fields?.type?.[0]?.name} - GLIDE: {disaster.fields?.glide}
                      </p>
                      <p className="text-sm">
                        Started: {new Date(disaster.fields?.date?.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(disaster.fields?.url, '_blank')}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDisaster(disaster);
                          setShowSendDialog(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Alert
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Latest disaster updates from ReliefWeb ({recentReports.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent reports available
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="border-l-4 border-orange-500 pl-4 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{report.fields?.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{report.fields?.format?.[0]?.name}</span>
                        <span>•</span>
                        <span>{report.fields?.source?.[0]?.shortname}</span>
                        <span>•</span>
                        <span>
                          {new Date(report.fields?.date?.created).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(report.fields?.url, '_blank')}
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Disaster Monitoring Configuration</DialogTitle>
            <DialogDescription>
              Choose which disaster types to monitor and receive alerts for
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {allDisasterTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={config.monitoredTypes.includes(type)}
                    onCheckedChange={() => toggleDisasterType(type)}
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Alert Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Disaster Alert</DialogTitle>
            <DialogDescription>
              Send SMS alert for: {selectedDisaster?.fields?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium mb-2">Alert will be sent to:</p>
              <ul className="text-sm space-y-1">
                <li>• All registered users in Nepal</li>
                <li>• Estimated recipients: ~500 people</li>
                <li>• Free SMS service - no charges</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The alert will be sent immediately.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendAlert(selectedDisaster)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
