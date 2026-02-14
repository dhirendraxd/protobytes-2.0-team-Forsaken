import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/config/firebase";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useLocation } from "react-router-dom";
import MessageSender from "@/components/MessageSender";
import VoiceCampaign from "@/components/VoiceCampaign";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpRight,
  Bell,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  channel: "SMS" | "Voice" | "Email";
  audience: string;
  category: "Promotion" | "Announcement" | "Reminder" | "Event" | "Survey" | "Custom";
  objective: "Awareness" | "Engagement" | "Conversion" | "Retention" | "Feedback";
  frequency: "One-time" | "Daily" | "Weekly" | "Monthly";
  schedule: string;
  info: string;
  message: string;
  status: "Draft" | "Scheduled" | "Active";
};

type Contact = {
  id: number;
  name: string;
  phone: string;
  segment: string;
  area?: string;
  city?: string;
  age?: number;
  category?: string;
};

type AlertRule = {
  id: number;
  title: string;
  severity: "Low" | "Medium" | "High";
  channel: "Email" | "SMS";
};

type ActivityEntry = {
  id: number;
  title: string;
  detail: string;
  time: string;
};

type CampaignLaunchResult = {
  id: number;
  campaignName: string;
  channel: Campaign["channel"];
  audience: string;
  targeted: number;
  delivered: number;
  failed: number;
  responseRate: number;
  launchedAt: string;
};

type BulkImportReport = {
  imported: number;
  skippedInvalid: number;
  skippedDuplicate: number;
};

type DashboardStore = {
  campaigns: Campaign[];
  contacts: Contact[];
  alerts: AlertRule[];
  billingPlan: string;
  creditBalance: number;
  settingsState: {
    timezone: string;
    twoFactor: boolean;
    emailReports: boolean;
    autoRetry: boolean;
  };
  activityLog: ActivityEntry[];
};

const DASHBOARD_STORAGE_KEY = "voicelink_dashboard_store_v1";
const DASHBOARD_COLLECTION = "dashboard_states";
const CAMPAIGN_CATEGORIES: Campaign["category"][] = ["Promotion", "Announcement", "Reminder", "Event", "Survey", "Custom"];
const CAMPAIGN_OBJECTIVES: Campaign["objective"][] = ["Awareness", "Engagement", "Conversion", "Retention", "Feedback"];
const CAMPAIGN_FREQUENCIES: Campaign["frequency"][] = ["One-time", "Daily", "Weekly", "Monthly"];

const CAMPAIGN_TEMPLATES: Record<Campaign["category"], string> = {
  Promotion: "Hi {{name}}, we have a new offer for you. Reply YES to claim.",
  Announcement: "Hi {{name}}, here is an important update from our team.",
  Reminder: "Hi {{name}}, quick reminder for your upcoming schedule.",
  Event: "Hi {{name}}, you are invited to our event. Confirm your slot.",
  Survey: "Hi {{name}}, please share your feedback in this short survey.",
  Custom: "Hi {{name}}, write your custom campaign message here.",
};

const normalizeCampaignChannel = (channel: unknown): Campaign["channel"] => {
  if (channel === "SMS" || channel === "Voice" || channel === "Email") return channel;
  if (channel === "IVR") return "Voice";
  return "SMS";
};

const normalizeCampaign = (raw: Partial<Campaign>): Campaign => ({
  id: raw.id ?? Date.now(),
  name: raw.name?.trim() || "Untitled Campaign",
  channel: normalizeCampaignChannel(raw.channel),
  audience: raw.audience?.trim() || "All Contacts",
  category: raw.category ?? "Promotion",
  objective: raw.objective ?? "Awareness",
  frequency: raw.frequency ?? "One-time",
  schedule: raw.schedule || new Date().toISOString().slice(0, 16),
  info: raw.info?.trim() || "",
  message: raw.message?.trim() || CAMPAIGN_TEMPLATES.Promotion,
  status: raw.status === "Active" ? "Active" : raw.status === "Scheduled" ? "Scheduled" : "Draft",
});

const defaultStore: DashboardStore = {
  campaigns: [
    {
      id: 1,
      name: "Winter Promo",
      channel: "SMS",
      audience: "VIP Customers",
      category: "Promotion",
      objective: "Conversion",
      frequency: "One-time",
      schedule: "2026-02-20T10:00",
      info: "Use code WINTER25 for 25% off.",
      message: "Hi {{name}}, your winter offer is live.",
      status: "Scheduled",
    },
  ],
  contacts: [
    { id: 1, name: "Aarav Shah", phone: "+9779811111111", segment: "VIP Customers", city: "Kathmandu", area: "Ward 10", age: 31, category: "High Value" },
    { id: 2, name: "Maya Rana", phone: "+9779822222222", segment: "Retail", city: "Pokhara", area: "Lakeside", age: 27, category: "General" },
  ],
  alerts: [
    { id: 1, title: "Low SMS balance", severity: "High", channel: "Email" },
    { id: 2, title: "Delivery rate below 95%", severity: "Medium", channel: "SMS" },
  ],
  billingPlan: "Professional",
  creditBalance: 4920,
  settingsState: {
    timezone: "Asia/Kathmandu",
    twoFactor: true,
    emailReports: true,
    autoRetry: true,
  },
  activityLog: [
    { id: 1, title: "Campaign loaded", detail: "Winter Promo is scheduled", time: "Now" },
    { id: 2, title: "Contacts loaded", detail: "2 contacts available", time: "Now" },
  ],
};

const readDashboardStore = (): DashboardStore => {
  if (typeof window === "undefined") return defaultStore;
  const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
  if (!raw) return defaultStore;
  try {
    const parsed = JSON.parse(raw) as Partial<DashboardStore>;
    return {
      ...defaultStore,
      ...parsed,
      settingsState: {
        ...defaultStore.settingsState,
        ...(parsed.settingsState ?? {}),
      },
      campaigns: (parsed.campaigns ?? defaultStore.campaigns).map((campaign) => normalizeCampaign(campaign)),
      contacts: parsed.contacts ?? defaultStore.contacts,
      alerts: parsed.alerts ?? defaultStore.alerts,
      activityLog: parsed.activityLog ?? defaultStore.activityLog,
    };
  } catch {
    return defaultStore;
  }
};

const nowLabel = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const mergeStore = (partial: Partial<DashboardStore> | null | undefined): DashboardStore => ({
  ...defaultStore,
  ...(partial ?? {}),
  settingsState: {
    ...defaultStore.settingsState,
    ...((partial?.settingsState as Partial<DashboardStore["settingsState"]>) ?? {}),
  },
  campaigns: (partial?.campaigns ?? defaultStore.campaigns).map((campaign) => normalizeCampaign(campaign)),
  contacts: partial?.contacts ?? defaultStore.contacts,
  alerts: partial?.alerts ?? defaultStore.alerts,
  activityLog: partial?.activityLog ?? defaultStore.activityLog,
});

const menuFromPath = (pathname: string) => {
  if (pathname === "/billing") return "billing";
  if (pathname === "/campaigns") return "campaigns";
  if (pathname === "/analytics") return "analytics";
  if (pathname === "/contacts") return "contacts";
  if (pathname === "/alerts") return "alerts";
  if (pathname === "/settings") return "settings";
  return "dashboard";
};

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const initialStore = useMemo(readDashboardStore, []);

  const [activeMenu, setActiveMenu] = useState(menuFromPath(location.pathname));
  const [quickFind, setQuickFind] = useState("");
  const [analyticsWindow, setAnalyticsWindow] = useState("30d");

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialStore.campaigns);
  const [contacts, setContacts] = useState<Contact[]>(initialStore.contacts);
  const [alerts, setAlerts] = useState<AlertRule[]>(initialStore.alerts);
  const [billingPlan, setBillingPlan] = useState(initialStore.billingPlan);
  const [creditBalance, setCreditBalance] = useState(initialStore.creditBalance);
  const [settingsState, setSettingsState] = useState(initialStore.settingsState);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(initialStore.activityLog);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const localSerializedStoreRef = useRef("");
  const remoteSerializedStoreRef = useRef("");
  const applyingRemoteStateRef = useRef(false);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    channel: "SMS" as Campaign["channel"],
    audience: "All Contacts",
    category: "Promotion" as Campaign["category"],
    objective: "Awareness" as Campaign["objective"],
    frequency: "One-time" as Campaign["frequency"],
    schedule: "",
    info: "",
    message: "",
    emailSubject: "",
    emailReceiver: "",
    emailImages: [] as string[],
    emailAttachments: [] as string[],
  });
  const [campaignError, setCampaignError] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [lastLaunchResult, setLastLaunchResult] = useState<CampaignLaunchResult | null>(null);
  const [showCampaignManager, setShowCampaignManager] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    segment: "All Contacts",
    city: "",
    area: "",
    age: "",
    category: "General",
  });
  const [contactError, setContactError] = useState("");
  const [bulkImportError, setBulkImportError] = useState("");
  const [bulkImportReport, setBulkImportReport] = useState<BulkImportReport | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [contactSortBy, setContactSortBy] = useState<"name" | "city" | "area" | "age">("name");
  const [contactFilters, setContactFilters] = useState({
    city: "",
    area: "",
    category: "",
  });
  const [bulkAssign, setBulkAssign] = useState({
    segment: "",
    category: "",
    city: "",
    area: "",
  });
  const [topUpAmount, setTopUpAmount] = useState("500");
  const [billingError, setBillingError] = useState("");

  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<"all" | "Draft" | "Scheduled" | "Active">("all");
  const [contactSearch, setContactSearch] = useState("");
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const [alertForm, setAlertForm] = useState({
    title: "",
    severity: "Medium" as AlertRule["severity"],
    channel: "Email" as AlertRule["channel"],
  });
  const [alertError, setAlertError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: Home },
      { id: "campaigns", label: "Campaigns", icon: MessageSquare },
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "contacts", label: "Contacts", icon: Users },
      { id: "billing", label: "Billing", icon: Wallet },
      { id: "alerts", label: "Alerts", icon: Bell },
      { id: "settings", label: "Settings", icon: Settings },
    ],
    []
  );

  useEffect(() => {
    setActiveMenu(menuFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (!user || !db) {
      setStoreHydrated(true);
      return;
    }

    const docRef = doc(db, DASHBOARD_COLLECTION, user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const remoteStore = mergeStore(snap.data() as Partial<DashboardStore>);
          const remoteSerialized = JSON.stringify(remoteStore);
          remoteSerializedStoreRef.current = remoteSerialized;

          if (remoteSerialized !== localSerializedStoreRef.current) {
            applyingRemoteStateRef.current = true;
            setCampaigns(remoteStore.campaigns);
            setContacts(remoteStore.contacts);
            setAlerts(remoteStore.alerts);
            setBillingPlan(remoteStore.billingPlan);
            setCreditBalance(remoteStore.creditBalance);
            setSettingsState(remoteStore.settingsState);
            setActivityLog(remoteStore.activityLog);
          }
        }
        setStoreHydrated(true);
      },
      (error) => {
        console.warn("Failed to subscribe dashboard state from Firestore, using local cache.", error);
        setStoreHydrated(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!storeHydrated) return;
    const store: DashboardStore = {
      campaigns,
      contacts,
      alerts,
      billingPlan,
      creditBalance,
      settingsState,
      activityLog,
    };
    const serializedStore = JSON.stringify(store);
    localSerializedStoreRef.current = serializedStore;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, serializedStore);
    }

    if (!db || !user) return;
    if (applyingRemoteStateRef.current) {
      applyingRemoteStateRef.current = false;
      setSaveStatus("saved");
      return;
    }
    if (serializedStore === remoteSerializedStoreRef.current) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    const timeoutId = window.setTimeout(async () => {
      try {
        await setDoc(
          doc(db, DASHBOARD_COLLECTION, user.uid),
          {
            ...store,
            userId: user.uid,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setSaveStatus("saved");
      } catch (error) {
        console.warn("Failed to save dashboard state to Firestore.", error);
        setSaveStatus("error");
      }
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [
    storeHydrated,
    user,
    campaigns,
    contacts,
    alerts,
    billingPlan,
    creditBalance,
    settingsState,
    activityLog,
  ]);

  const logActivity = (title: string, detail: string) => {
    setActivityLog((prev) => [{ id: Date.now(), title, detail, time: nowLabel() }, ...prev].slice(0, 15));
  };

  const filteredMenuItems = useMemo(() => {
    const query = quickFind.trim().toLowerCase();
    if (!query) return menuItems;
    return menuItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [menuItems, quickFind]);

  const activeLabel = menuItems.find((item) => item.id === activeMenu)?.label ?? "Dashboard";

  const quickFindHint = useMemo(() => {
    if (!quickFind.trim()) return null;
    if (filteredMenuItems.length === 0) return "No match";
    return `Found ${filteredMenuItems.length}`;
  }, [quickFind, filteredMenuItems]);

  const segmentOptions = useMemo(() => {
    const known = contacts.map((contact) => contact.segment).filter(Boolean);
    return ["All Contacts", ...Array.from(new Set(known))];
  }, [contacts]);

  const visibleContacts = useMemo(() => {
    const filtered = contacts.filter((contact) => {
      if (contactFilters.city && (contact.city ?? "").toLowerCase() !== contactFilters.city.toLowerCase()) return false;
      if (contactFilters.area && (contact.area ?? "").toLowerCase() !== contactFilters.area.toLowerCase()) return false;
      if (contactFilters.category && (contact.category ?? "").toLowerCase() !== contactFilters.category.toLowerCase()) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (contactSortBy === "age") return (a.age ?? 0) - (b.age ?? 0);
      const aValue = (a[contactSortBy] ?? "").toString().toLowerCase();
      const bValue = (b[contactSortBy] ?? "").toString().toLowerCase();
      return aValue.localeCompare(bValue);
    });

    return sorted;
  }, [contacts, contactFilters, contactSortBy]);

  const filteredContactResults = useMemo(
    () =>
      visibleContacts.filter(
        (contact) =>
          contactSearch === "" ||
          contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
          contact.phone.includes(contactSearch)
      ),
    [visibleContacts, contactSearch]
  );

  const contactsBySegment = useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((contact) => {
      const key = contact.segment || "All Contacts";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [contacts]);

  const toggleContactSelection = (id: number) => {
    setSelectedContactIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisibleContacts = () => {
    setSelectedContactIds(filteredContactResults.map((contact) => contact.id));
  };

  const clearContactSelection = () => {
    setSelectedContactIds([]);
  };

  const getAudienceSize = (audience: string) => {
    if (audience === "All Contacts" || audience === "Selected Contacts") return contacts.length;
    if (audience.endsWith(" Contacts")) {
      const city = audience.replace(" Contacts", "").trim().toLowerCase();
      const inCity = contacts.filter((contact) => (contact.city ?? "").toLowerCase() === city).length;
      return inCity || Math.max(1, Math.round(contacts.length * 0.4));
    }
    const bySegment = contacts.filter((contact) => contact.segment.toLowerCase() === audience.toLowerCase()).length;
    return bySegment || Math.max(1, Math.round(contacts.length * 0.3));
  };

  const buildMockLaunchResult = (campaign: Campaign): CampaignLaunchResult => {
    const targeted = Math.max(1, getAudienceSize(campaign.audience));
    const channelSuccessRate = campaign.channel === "SMS" ? 0.97 : campaign.channel === "Email" ? 0.94 : 0.91;
    const delivered = Math.max(1, Math.round(targeted * channelSuccessRate));
    const failed = Math.max(0, targeted - delivered);
    const responseRate = Number((campaign.channel === "Email" ? 12.8 : campaign.channel === "Voice" ? 9.4 : 14.2).toFixed(1));

    return {
      id: Date.now(),
      campaignName: campaign.name,
      channel: campaign.channel,
      audience: campaign.audience,
      targeted,
      delivered,
      failed,
      responseRate,
      launchedAt: new Date().toLocaleString(),
    };
  };

  const openCampaignForAudience = (audience: string) => {
    setCampaignForm((prev) => ({
      ...prev,
      audience,
      name: prev.name || `${audience} Campaign`,
      message:
        prev.channel === "SMS" ? prev.message || CAMPAIGN_TEMPLATES[prev.category] : prev.message,
      schedule: prev.schedule || new Date().toISOString().slice(0, 16),
    }));
    setActiveMenu("campaigns");
  };

  const applyBulkContactAssignment = () => {
    if (selectedContactIds.length === 0) return;
    const hasChanges = Object.values(bulkAssign).some((value) => value.trim());
    if (!hasChanges) return;

    setContacts((prev) =>
      prev.map((contact) =>
        selectedContactIds.includes(contact.id)
          ? {
              ...contact,
              segment: bulkAssign.segment.trim() || contact.segment,
              category: bulkAssign.category.trim() || contact.category,
              city: bulkAssign.city.trim() || contact.city,
              area: bulkAssign.area.trim() || contact.area,
            }
          : contact
      )
    );

    logActivity("Bulk contact update", `${selectedContactIds.length} contacts recategorized`);
    setBulkAssign({ segment: "", category: "", city: "", area: "" });
    setSelectedContactIds([]);
  };

  const analyticsStats = useMemo(() => {
    const campaignCount = campaigns.length;
    const scheduledCount = campaigns.filter((c) => c.status === "Scheduled").length;
    const activeCount = campaigns.filter((c) => c.status === "Active").length;
    const contactCount = contacts.length;
    const windowScale = analyticsWindow === "7d" ? 0.9 : analyticsWindow === "90d" ? 1.15 : 1;
    const avgAudience = campaignCount > 0 ? Math.round((contactCount * 0.8) / campaignCount) : 0;
    const rateBase = campaignCount > 0 ? Math.min(99.3, 95 + campaignCount * 0.25) : 95;

    return {
      campaignCount,
      scheduledCount,
      activeCount,
      contactCount,
      avgAudience,
      deliveryRate: (rateBase * windowScale).toFixed(1),
      criticalAlerts: alerts.filter((a) => a.severity === "High").length,
    };
  }, [campaigns, contacts, alerts, analyticsWindow]);

  const summaryStats = useMemo(
    () => [
      {
        label: "Total Messages",
        value: `${campaigns.reduce((sum, campaign) => {
          if (campaign.status === "Active") return sum + contacts.length;
          if (campaign.status === "Scheduled") return sum + Math.round(contacts.length * 0.6);
          return sum + Math.round(contacts.length * 0.2);
        }, 0)}`,
        note: "Live estimate from campaigns + contacts",
      },
      { label: "Total Campaigns", value: `${campaigns.length}`, note: "Updates in real time" },
      { label: "Avg Delivery Rate", value: `${analyticsStats.deliveryRate}%`, note: `Live window: ${analyticsWindow}` },
      { label: "Active Contacts", value: `${contacts.length}`, note: "Synced from Firestore" },
    ],
    [campaigns, contacts.length, analyticsStats.deliveryRate, analyticsWindow]
  );

  const recentActivity = useMemo(
    () => activityLog.slice(0, 6),
    [activityLog]
  );

  const billingTransactions = useMemo(
    () =>
      activityLog
        .filter((item) => {
          const title = item.title.toLowerCase();
          return title.includes("credit") || title.includes("plan") || title.includes("top");
        })
        .slice(0, 6)
        .map((item) => {
          const amountFromDetail = item.detail.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
          const amount = amountFromDetail ? Number(amountFromDetail[1]) : 0;
          const isCredit = item.title.toLowerCase().includes("credit") || item.title.toLowerCase().includes("top");
          return {
            id: item.id,
            label: item.title,
            amount: `${isCredit ? "+" : "-"}${amount || 0}`,
            note: item.time,
          };
        }),
    [activityLog]
  );

  const campaignStatusCounts = useMemo(
    () => ({
      all: campaigns.length,
      Active: campaigns.filter((campaign) => campaign.status === "Active").length,
      Scheduled: campaigns.filter((campaign) => campaign.status === "Scheduled").length,
      Draft: campaigns.filter((campaign) => campaign.status === "Draft").length,
    }),
    [campaigns]
  );

  const filteredCampaigns = useMemo(() => {
    const searched = campaigns
      .filter((campaign) => campaignStatusFilter === "all" || campaign.status === campaignStatusFilter)
      .filter((campaign) => campaignSearch === "" || campaign.name.toLowerCase().includes(campaignSearch.toLowerCase()));

    const priority: Record<Campaign["status"], number> = { Active: 0, Scheduled: 1, Draft: 2 };
    return [...searched].sort((a, b) => {
      if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
      return new Date(a.schedule).getTime() - new Date(b.schedule).getTime();
    });
  }, [campaigns, campaignSearch, campaignStatusFilter]);

  const handleCreateCampaign = () => {
    setCampaignError("");
    if (!campaignForm.name.trim()) {
      setCampaignError("Campaign name is required.");
      return;
    }

    if (campaignForm.channel === "SMS" && !campaignForm.message.trim()) {
      setCampaignError("SMS message is required.");
      return;
    }

    if (campaignForm.channel === "Voice" && !campaignForm.info.trim() && !campaignForm.message.trim()) {
      setCampaignError("Add a voice file or a voice script.");
      return;
    }

    if (campaignForm.channel === "Email") {
      if (!campaignForm.emailReceiver.trim()) {
        setCampaignError("Recipient email is required for email campaigns.");
        return;
      }
      if (!campaignForm.emailSubject.trim()) {
        setCampaignError("Email subject is required.");
        return;
      }
      if (!campaignForm.message.trim()) {
        setCampaignError("Email body is required.");
        return;
      }
    }

    const normalizedInfo =
      campaignForm.channel === "Email"
        ? `To: ${campaignForm.emailReceiver.trim()} | Subject: ${campaignForm.emailSubject.trim()} | Images: ${campaignForm.emailImages.length} | Attachments: ${campaignForm.emailAttachments.length}`
        : campaignForm.channel === "Voice"
          ? campaignForm.info.trim()
            ? `Voice file: ${campaignForm.info.trim()}`
            : "Voice script only"
          : campaignForm.info.trim();

    const normalizedMessage =
      campaignForm.channel === "Voice" && !campaignForm.message.trim()
        ? "Voice message will be played to recipients."
        : campaignForm.message.trim();

    if (campaignForm.channel === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campaignForm.emailReceiver.trim())) {
      setCampaignError("Recipient email format looks invalid.");
      return;
    }

    if (editingCampaignId !== null) {
      // Update existing campaign
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === editingCampaignId
            ? {
                ...c,
                name: campaignForm.name.trim(),
                channel: campaignForm.channel,
                audience: campaignForm.audience.trim() || "All Contacts",
                category: campaignForm.category,
                objective: campaignForm.objective,
                frequency: campaignForm.frequency,
                schedule: campaignForm.schedule || new Date().toISOString().slice(0, 16),
                info: normalizedInfo,
                message: normalizedMessage,
              }
            : c
        )
      );
      const campaign = campaigns.find((c) => c.id === editingCampaignId);
      if (campaign) {
        logActivity("Campaign updated", `${campaignForm.name.trim()} modified`);
        toast({
          title: "Campaign updated",
          description: `${campaignForm.name.trim()} was updated successfully.`,
        });
      }
      setEditingCampaignId(null);
    } else {
      // Create new campaign
      const createdCampaign: Campaign = {
        id: Date.now(),
        name: campaignForm.name.trim(),
        channel: campaignForm.channel,
        audience: campaignForm.audience.trim() || "All Contacts",
        category: campaignForm.category,
        objective: campaignForm.objective,
        frequency: campaignForm.frequency,
        schedule: campaignForm.schedule || new Date().toISOString().slice(0, 16),
        info: normalizedInfo,
        message: normalizedMessage,
        status: campaignForm.schedule ? "Scheduled" : "Draft",
      };

      setCampaigns((prev) => [createdCampaign, ...prev]);
      logActivity("Campaign created", `${createdCampaign.name} (${createdCampaign.channel}, ${createdCampaign.category})`);
      toast({
        title: "Campaign saved",
        description: `${createdCampaign.name} is ready (${createdCampaign.channel}).`,
      });
    }

    setCampaignForm({
      name: "",
      channel: "SMS",
      audience: "All Contacts",
      category: "Promotion",
      objective: "Awareness",
      frequency: "One-time",
      schedule: "",
      info: "",
      message: "",
      emailSubject: "",
      emailReceiver: "",
      emailImages: [],
      emailAttachments: [],
    });
  };

  const startEditCampaign = (campaign: Campaign) => {
    const emailReceiverMatch = campaign.info.match(/To:\s*([^|]+)/i);
    const emailSubjectMatch = campaign.info.match(/Subject:\s*([^|]+)/i);
    const voiceFileName = campaign.info.replace(/^Voice file:\s*/i, "").trim();

    setEditingCampaignId(campaign.id);
    setCampaignForm({
      name: campaign.name,
      channel: campaign.channel,
      audience: campaign.audience,
      category: campaign.category,
      objective: campaign.objective,
      frequency: campaign.frequency,
      schedule: campaign.schedule,
      info: campaign.channel === "Voice" ? voiceFileName : campaign.info,
      message: campaign.message,
      emailSubject: campaign.channel === "Email" ? (emailSubjectMatch?.[1] ?? "").trim() : "",
      emailReceiver: campaign.channel === "Email" ? (emailReceiverMatch?.[1] ?? "").trim() : "",
      emailImages: [],
      emailAttachments: [],
    });
    setCampaignError("");
  };

  const cancelEditCampaign = () => {
    setEditingCampaignId(null);
    setCampaignForm({
      name: "",
      channel: "SMS",
      audience: "All Contacts",
      category: "Promotion",
      objective: "Awareness",
      frequency: "One-time",
      schedule: "",
      info: "",
      message: "",
      emailSubject: "",
      emailReceiver: "",
      emailImages: [],
      emailAttachments: [],
    });
  };

  const toggleCampaignStatus = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;

    const nextStatus: Campaign["status"] =
      target.status === "Draft" ? "Scheduled" : target.status === "Scheduled" ? "Draft" : "Scheduled";
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
    logActivity("Campaign updated", `${target.name} moved to ${nextStatus}`);
    toast({
      title: "Campaign status updated",
      description: `${target.name} moved to ${nextStatus}.`,
    });
  };

  const runCampaignNow = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    const now = new Date().toISOString().slice(0, 16);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Active", schedule: now } : c)));
    const mockResult = buildMockLaunchResult(target);
    setLastLaunchResult(mockResult);
    logActivity("Campaign launched", `${target.name}: ${mockResult.delivered}/${mockResult.targeted} delivered`);
    toast({
      title: "Campaign completed",
      description: `${target.name} done. Delivered ${mockResult.delivered}/${mockResult.targeted}, failed ${mockResult.failed}.`,
    });
  };

  const removeCampaign = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logActivity("Campaign removed", target.name);
      toast({
        title: "Campaign removed",
        description: `${target.name} was removed.`,
      });
    }
  };

  const handleAddContact = () => {
    setContactError("");
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError("Name and phone are required.");
      return;
    }
    if (!/^\+?[0-9]{9,15}$/.test(contactForm.phone.trim())) {
      setContactError("Phone format looks invalid.");
      return;
    }
    const exists = contacts.some((c) => c.phone === contactForm.phone.trim());
    if (exists) {
      setContactError("This phone already exists.");
      return;
    }
    if (contactForm.age && Number.isNaN(Number(contactForm.age))) {
      setContactError("Age must be a valid number.");
      return;
    }

    const createdContact: Contact = {
      id: Date.now(),
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      segment: contactForm.segment.trim() || "All Contacts",
      city: contactForm.city.trim() || undefined,
      area: contactForm.area.trim() || undefined,
      age: contactForm.age ? Number(contactForm.age) : undefined,
      category: contactForm.category.trim() || "General",
    };

    setContacts((prev) => [createdContact, ...prev]);
    setContactForm({ name: "", phone: "", segment: "All Contacts", city: "", area: "", age: "", category: "General" });
    logActivity("Contact added", `${createdContact.name} (${createdContact.segment})`);
  };

  const removeContact = (id: number) => {
    const target = contacts.find((c) => c.id === id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContactIds((prev) => prev.filter((x) => x !== id));
    if (target) {
      logActivity("Contact removed", target.name);
    }
  };

  const normalizePhone = (value: string) => value.replace(/[\s()-]/g, "");

  const parseDelimitedRows = (content: string) => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];

    const sample = lines[0];
    const delimiter = sample.includes(",") ? "," : sample.includes("\t") ? "\t" : sample.includes(";") ? ";" : ",";

    return lines.map((line) => line.split(delimiter).map((part) => part.trim()));
  };

  const detectColumnIndex = (headers: string[], names: string[]) => {
    const normalized = headers.map((h) => h.toLowerCase());
    return normalized.findIndex((h) => names.some((name) => h === name || h.includes(name)));
  };

  const importContactsFromFile = async (file: File) => {
    setBulkImportError("");
    setBulkImportReport(null);

    const content = await file.text();
    const rows = parseDelimitedRows(content);
    if (rows.length === 0) {
      setBulkImportError("File is empty or not readable.");
      return;
    }

    const headers = rows[0];
    let startIndex = 1;
    let nameIdx = detectColumnIndex(headers, ["name", "full name", "fullname"]);
    let phoneIdx = detectColumnIndex(headers, ["phone", "mobile", "number", "contact"]);
    let segmentIdx = detectColumnIndex(headers, ["segment", "group", "tag", "audience"]);
    let cityIdx = detectColumnIndex(headers, ["city", "town"]);
    let areaIdx = detectColumnIndex(headers, ["area", "district", "locality", "location"]);
    let ageIdx = detectColumnIndex(headers, ["age"]);
    let categoryIdx = detectColumnIndex(headers, ["category", "type", "class"]);

    // If header row not present, fallback to fixed positions
    if (phoneIdx === -1) {
      startIndex = 0;
      nameIdx = 0;
      phoneIdx = 1;
      segmentIdx = 2;
      cityIdx = 3;
      areaIdx = 4;
      ageIdx = 5;
      categoryIdx = 6;
    }

    let imported = 0;
    let skippedInvalid = 0;
    let skippedDuplicate = 0;

    const existingPhones = new Set(contacts.map((c) => normalizePhone(c.phone)));
    const newContacts: Contact[] = [];

    for (let i = startIndex; i < rows.length; i += 1) {
      const row = rows[i];
      const rawName = (row[nameIdx] ?? "").trim();
      const rawPhone = normalizePhone((row[phoneIdx] ?? "").trim());
      const rawSegment = (segmentIdx >= 0 ? row[segmentIdx] : "")?.trim() || "All Contacts";
      const rawCity = (cityIdx >= 0 ? row[cityIdx] : "")?.trim() || undefined;
      const rawArea = (areaIdx >= 0 ? row[areaIdx] : "")?.trim() || undefined;
      const rawAge = (ageIdx >= 0 ? row[ageIdx] : "")?.trim();
      const rawCategory = (categoryIdx >= 0 ? row[categoryIdx] : "")?.trim() || "General";
      const parsedAge = rawAge && !Number.isNaN(Number(rawAge)) ? Number(rawAge) : undefined;

      if (!rawName || !rawPhone || !/^\+?[0-9]{9,15}$/.test(rawPhone)) {
        skippedInvalid += 1;
        continue;
      }

      if (existingPhones.has(rawPhone)) {
        skippedDuplicate += 1;
        continue;
      }

      existingPhones.add(rawPhone);
      newContacts.push({
        id: Date.now() + i,
        name: rawName,
        phone: rawPhone,
        segment: rawSegment,
        city: rawCity,
        area: rawArea,
        age: parsedAge,
        category: rawCategory,
      });
      imported += 1;
    }

    if (newContacts.length > 0) {
      setContacts((prev) => [...newContacts, ...prev]);
      logActivity("Bulk contacts import", `${imported} contacts imported from ${file.name}`);
    }

    setBulkImportReport({ imported, skippedInvalid, skippedDuplicate });
  };

  const handleBulkContactUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = [".csv", ".txt"];
    const lower = file.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      setBulkImportError("Unsupported file type. Upload a .csv or .txt file.");
      return;
    }
    try {
      await importContactsFromFile(file);
    } catch (error) {
      console.error("Bulk import failed:", error);
      setBulkImportError("Failed to process file. Ensure it contains valid rows.");
    } finally {
      event.target.value = "";
    }
  };

  const handleTopUp = () => {
    setBillingError("");
    const amount = Number(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setBillingError("Enter a valid top-up amount.");
      return;
    }
    setCreditBalance((prev) => prev + amount);
    setTopUpAmount("");
    logActivity("Credits topped up", `$${amount} added to balance`);
  };

  const handlePlanChange = (plan: string) => {
    setBillingPlan(plan);
    logActivity("Plan updated", `Switched to ${plan}`);
  };

  const handleAddAlert = () => {
    setAlertError("");
    if (!alertForm.title.trim()) {
      setAlertError("Rule title is required.");
      return;
    }

    const createdAlert: AlertRule = {
      id: Date.now(),
      title: alertForm.title.trim(),
      severity: alertForm.severity,
      channel: alertForm.channel,
    };

    setAlerts((prev) => [createdAlert, ...prev]);
    setAlertForm({ title: "", severity: "Medium", channel: "Email" });
    logActivity("Alert rule created", `${createdAlert.title} (${createdAlert.severity})`);
  };

  const removeAlert = (id: number) => {
    const target = alerts.find((a) => a.id === id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      logActivity("Alert rule removed", target.title);
    }
  };

  const updateSetting = <K extends keyof DashboardStore["settingsState"]>(key: K, value: DashboardStore["settingsState"][K]) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
    logActivity("Settings updated", `${String(key)} changed`);
  };

  const SectionCards = ({
    title,
    cards,
  }: {
    title: string;
    cards: Array<{ label: string; value: string; note: string }>;
  }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-black">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
            <p className="text-xs font-semibold text-black/50">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-black">{card.value}</p>
            <p className="mt-2 text-xs text-black/50">{card.note}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboardOverview = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-black/50">{stat.label}</p>
              <ArrowUpRight className="h-4 w-4 text-black/40" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-black">{stat.value}</p>
            <p className="mt-2 text-xs text-black/50">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="border border-black/10 bg-[#efefef] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-black/50">Total Delivery Volume</p>
            <p className="mt-2 text-2xl font-semibold text-black">{summaryStats[0]?.value ?? "0"}</p>
            <p className="text-xs text-black/50">
              scheduled <span className="text-green-600">{analyticsStats.scheduledCount}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setActiveMenu("campaigns")} className="rounded-xl bg-black text-white hover:bg-black/90">
              New Campaign
            </Button>
            <Button onClick={() => setActiveMenu("contacts")} variant="outline" className="rounded-xl border-black/20 bg-white text-black">
              Manage Contacts
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_260px]">
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-black/50">
              <LineChart className="h-4 w-4" />
              Trend Overview
            </div>
            <div className="mt-4 h-48">
              <svg viewBox="0 0 600 220" className="h-full w-full">
                <path d="M20 190 L120 120 L220 150 L320 80 L420 110 L520 60" fill="none" stroke="#111111" strokeWidth="3" />
                <path d="M20 190 L120 160 L220 130 L320 150 L420 120 L520 140" fill="none" stroke="#c5d900" strokeWidth="3" />
                <path d="M20 190 L120 170 L220 180 L320 160 L420 170 L520 155" fill="none" stroke="#888888" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold text-black/60">Live Snapshot</p>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-[#efefef] px-3 py-2">Delivery Rate: {analyticsStats.deliveryRate}%</div>
              <div className="rounded-xl bg-[#efefef] px-3 py-2">Avg Audience: {analyticsStats.avgAudience}</div>
              <div className="rounded-xl bg-[#efefef] px-3 py-2">Balance: ${creditBalance}</div>
              <div className="rounded-xl bg-[#efefef] px-3 py-2">Critical Alerts: {analyticsStats.criticalAlerts}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-6">
          <h2 className="text-lg font-semibold text-black">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-black">{item.title}</p>
                  <p className="text-xs text-black/50">{item.detail}</p>
                </div>
                <span className="text-xs text-black/40">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-6">
          <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Button onClick={() => setActiveMenu("campaigns")} className="w-full rounded-xl bg-black text-white">Setup Campaign</Button>
            <Button onClick={() => setActiveMenu("alerts")} variant="outline" className="w-full rounded-xl border-black/20 bg-white text-black">Configure Alerts</Button>
            <Button onClick={() => setActiveMenu("settings")} variant="outline" className="w-full rounded-xl border-black/20 bg-white text-black">Open Settings</Button>
          </div>
        </div>
      </div>
    </>
  );

  const renderCampaigns = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black">Quick Voice & Campaign Tools</h2>
            <p className="text-sm text-black/60">Send instant messages or launch bulk voice campaigns.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Send Individual Messages</h3>
          <p className="text-sm text-black/60 mb-4">Send SMS or voice calls to a single recipient with instant delivery</p>
          <div className="bg-white rounded-xl p-4">
            <MessageSender />
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Bulk Voice & SMS Campaigns</h3>
          <p className="text-sm text-black/60 mb-4">Send message campaigns to multiple recipients with TTS, file upload, or text options</p>
          <div className="bg-white rounded-xl p-4">
            <VoiceCampaign
              onCampaignStarted={() => {
                setShowCampaignManager(true);
                requestAnimationFrame(() => {
                  document.getElementById('campaign-queue')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                });
              }}
            />
          </div>
        </div>
      </div>

      <div id="campaign-manager" className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black">Campaign Manager</h2>
            <p className="text-sm text-black/60">Create, schedule, and run campaigns only when you need this section.</p>
          </div>
          <Button
            onClick={() => setShowCampaignManager((prev) => !prev)}
            variant="outline"
            className="rounded-xl border-black/20 bg-white text-black hover:bg-black/5"
          >
            {showCampaignManager ? "Hide Campaign Manager" : "Open Campaign Manager"}
          </Button>
        </div>
      </div>

      {showCampaignManager ? (
        <>
          <SectionCards
            title="Campaign Summary"
            cards={[
              { label: "Running Campaigns", value: `${analyticsStats.activeCount}`, note: "Live right now" },
              { label: "Scheduled", value: `${campaigns.filter((c) => c.status === "Scheduled").length}`, note: "Queued by date/time" },
              { label: "Drafts", value: `${campaigns.filter((c) => c.status === "Draft").length}`, note: "Needs scheduling" },
            ]}
          />

          {lastLaunchResult ? (
            <div className="rounded-2xl border border-lime-300 bg-lime-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Campaign Sent Successfully</p>
                  <p className="text-xs text-black/60">
                    {lastLaunchResult.campaignName} · {lastLaunchResult.channel} · {lastLaunchResult.launchedAt}
                  </p>
                </div>
                <button
                  onClick={() => setLastLaunchResult(null)}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1 text-xs text-black/70 hover:bg-black/5"
                >
                  Dismiss
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black/70">
                  Targeted
                  <p className="mt-1 text-lg font-semibold text-black">{lastLaunchResult.targeted}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black/70">
                  Delivered
                  <p className="mt-1 text-lg font-semibold text-black">{lastLaunchResult.delivered}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black/70">
                  Failed
                  <p className="mt-1 text-lg font-semibold text-black">{lastLaunchResult.failed}</p>
                </div>
                <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black/70">
                  Response Rate
                  <p className="mt-1 text-lg font-semibold text-black">{lastLaunchResult.responseRate}%</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
        {/* Campaign Form */}
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <h3 className="text-2xl font-semibold text-black">{editingCampaignId !== null ? "Edit Campaign" : "Create Campaign"}</h3>
          <p className="mt-2 text-sm text-black/55">{editingCampaignId !== null ? "Update campaign details and save changes." : "Pick category, timing, message, and audience. Keep it simple and launch fast."}</p>
          <div className="mt-5 space-y-4 text-base">
            <input
              value={campaignForm.name}
              onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Campaign name (e.g., Summer Sale, Holiday Promo)"
              className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-black/60 block mb-2">Category</label>
                <select
                  value={campaignForm.category}
                  onChange={(e) => {
                    const category = e.target.value as Campaign["category"];
                    setCampaignForm((p) => ({
                      ...p,
                      category,
                      message:
                        p.channel === "SMS" && !p.message.trim()
                          ? CAMPAIGN_TEMPLATES[category]
                          : p.message,
                    }));
                  }}
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
                >
                  {CAMPAIGN_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-black/60 block mb-2">Goal</label>
                <select
                  value={campaignForm.objective}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, objective: e.target.value as Campaign["objective"] }))}
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
                >
                  {CAMPAIGN_OBJECTIVES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-black/60 block mb-2">Media Type</label>
                <div className="flex flex-wrap gap-2">
                  {["SMS", "Voice", "Email"].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const nextChannel = type as Campaign["channel"];
                        setCampaignForm((p) => ({
                          ...p,
                          channel: nextChannel,
                          message:
                            nextChannel === "SMS" && !p.message.trim()
                              ? CAMPAIGN_TEMPLATES[p.category]
                              : p.message,
                        }));
                        setCampaignError("");
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        campaignForm.channel === type
                          ? "bg-black text-white shadow-md"
                          : "border border-black/15 bg-white text-black/70 hover:bg-black/5"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-black/60 block mb-2">Audience</label>
                <select
                  value={campaignForm.audience}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, audience: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
                >
                  {segmentOptions.map((segment) => (
                    <option key={segment} value={segment}>
                      {segment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Channel-specific input fields */}
            {campaignForm.channel === "SMS" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                <label className="text-sm font-semibold text-blue-900 block">SMS Message</label>
                <input
                  value={campaignForm.info}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, info: e.target.value }))}
                  placeholder="Key info (offer code, short link, event location)"
                  className="h-11 w-full rounded-lg border border-blue-200 bg-white px-4 text-base"
                />
                <textarea
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Write SMS text (use {{name}} to personalize)"
                  className="h-28 w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-base"
                />
                <div className="flex items-center justify-between gap-3 text-xs text-blue-700">
                  <p>{campaignForm.message.length} / 160 characters</p>
                  <button
                    onClick={() => setCampaignForm((p) => ({ ...p, message: CAMPAIGN_TEMPLATES[p.category] }))}
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            )}

            {campaignForm.channel === "Voice" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <label className="text-sm font-semibold text-amber-900 block">Voice Message</label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg"
                  onChange={(e) => {
                    const fileName = e.target.files?.[0]?.name || "";
                    setCampaignForm((p) => ({ ...p, info: fileName }));
                  }}
                  className="block w-full text-sm text-black/70 file:mr-3 file:rounded-lg file:border file:border-amber-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-amber-100"
                />
                <p className="text-xs text-amber-800">{campaignForm.info || "No file chosen"}</p>
                <textarea
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Optional voice script or call notes"
                  className="h-24 w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-base"
                />
              </div>
            )}

            {campaignForm.channel === "Email" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <label className="text-sm font-semibold text-emerald-900 block">Email Details</label>
                <input
                  type="email"
                  value={campaignForm.emailReceiver}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, emailReceiver: e.target.value }))}
                  placeholder="Recipient email (e.g., customer@example.com)"
                  className="h-11 w-full rounded-lg border border-emerald-200 bg-white px-4 text-base"
                />
                <input
                  value={campaignForm.emailSubject}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, emailSubject: e.target.value }))}
                  placeholder="Email subject"
                  className="h-11 w-full rounded-lg border border-emerald-200 bg-white px-4 text-base"
                />
                <textarea
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Write email body (you can use {{name}})"
                  className="h-28 w-full rounded-lg border border-emerald-200 bg-white px-4 py-3 text-base"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-emerald-700 block mb-1">Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).map((f) => f.name);
                        setCampaignForm((p) => ({ ...p, emailImages: files }));
                      }}
                      className="block w-full text-sm text-black/70 file:mr-3 file:rounded-lg file:border file:border-emerald-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-emerald-100"
                    />
                    <p className="mt-1 text-xs text-emerald-700">{campaignForm.emailImages.length} file(s)</p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-700 block mb-1">Attachments</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).map((f) => f.name);
                        setCampaignForm((p) => ({ ...p, emailAttachments: files }));
                      }}
                      className="block w-full text-sm text-black/70 file:mr-3 file:rounded-lg file:border file:border-emerald-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:cursor-pointer hover:file:bg-emerald-100"
                    />
                    <p className="mt-1 text-xs text-emerald-700">{campaignForm.emailAttachments.length} file(s)</p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-black/60 block mb-2">Schedule</label>
                <input
                  type="datetime-local"
                  value={campaignForm.schedule}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, schedule: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
                />
              </div>
              <div>
                <label className="text-sm text-black/60 block mb-2">Repeat</label>
                <select
                  value={campaignForm.frequency}
                  onChange={(e) => setCampaignForm((p) => ({ ...p, frequency: e.target.value as Campaign["frequency"] }))}
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base"
                >
                  {CAMPAIGN_FREQUENCIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setCampaignForm((p) => ({ ...p, schedule: new Date().toISOString().slice(0, 16) }))}
              className="w-fit rounded-lg border border-black/15 bg-white px-4 py-2 text-sm text-black/70 hover:bg-black/5"
            >
              Send Now
            </button>
            <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/60">
              <p>
                <span className="font-medium text-black">{campaignForm.category}</span> · <span className="font-medium text-black">{campaignForm.objective}</span> · <span className="font-medium text-black">{campaignForm.frequency}</span>
              </p>
              <p className="mt-1">
                {campaignForm.channel === "SMS" && "SMS campaign"}
                {campaignForm.channel === "Voice" && `Voice campaign · ${campaignForm.info || "No file chosen"}`}
                {campaignForm.channel === "Email" &&
                  `Email campaign · ${campaignForm.emailSubject || "No subject"}`}
              </p>
            </div>
            {campaignError ? <p className="text-xs text-red-600">{campaignError}</p> : null}
            <div className="flex gap-2">
              <Button onClick={handleCreateCampaign} className="flex-1 rounded-xl bg-black text-white hover:bg-black/90">
                {editingCampaignId !== null ? "Update Campaign" : "Save Campaign"}
              </Button>
              {editingCampaignId !== null && (
                <Button onClick={cancelEditCampaign} variant="outline" className="rounded-xl border-black/20 hover:bg-black/5">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Queue */}
        <div id="campaign-queue" className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-black">Campaign Queue ({filteredCampaigns.length})</h3>
            <span className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs text-black/60">Sorted: active first</span>
          </div>
          
          <div className="mt-5 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-black/40" />
              <input
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="h-10 w-full rounded-lg border border-black/15 bg-white pl-12 pr-4 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(["all", "Active", "Scheduled", "Draft"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setCampaignStatusFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    campaignStatusFilter === status
                      ? "bg-black text-white"
                      : "border border-black/15 bg-white text-black/70 hover:bg-black/5"
                  }`}
                >
                  {status === "all" ? "All" : status} ({campaignStatusCounts[status]})
                </button>
              ))}
            </div>

            {/* Campaign List */}
            <div className="space-y-2">
              {filteredCampaigns.map((c) => (
                  <div key={c.id} className="rounded-xl border border-black/10 bg-white p-3 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-black">{c.name}</p>
                        <p className="mt-0.5 text-xs text-black/55">
                          {c.category} · {c.objective} · {c.channel}
                        </p>
                        <p className="mt-1 text-xs text-black/45">
                          {c.audience} · {c.frequency}
                        </p>
                        <p className="mt-1 text-xs text-black/45">Schedule: {new Date(c.schedule).toLocaleString()}</p>
                        {c.info ? <p className="mt-1 text-xs text-black/50">{c.info}</p> : null}
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-medium ${
                          c.status === "Active"
                            ? "bg-black text-white"
                            : c.status === "Scheduled"
                              ? "bg-lime-300 text-black"
                              : "bg-black/10 text-black/70"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-black/50">{c.message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => runCampaignNow(c.id)}
                        className="rounded-lg bg-black px-3 py-1.5 text-[11px] text-white hover:bg-black/90"
                      >
                        Run
                      </button>
                      <button onClick={() => startEditCampaign(c)} className="rounded-lg border border-black/15 px-3 py-1.5 text-[11px] text-black/70 hover:bg-black/5">
                        Edit
                      </button>
                      <button onClick={() => toggleCampaignStatus(c.id)} className="rounded-lg border border-black/15 px-3 py-1.5 text-[11px] text-black/70 hover:bg-black/5">
                        {c.status === "Draft" ? "Schedule" : "Move To Draft"}
                      </button>
                      <button onClick={() => removeCampaign(c.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              {filteredCampaigns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/20 bg-white p-4 text-center text-xs text-black/55">
                  No campaigns match. Create one or adjust filters.
                </div>
              ) : null}
            </div>
          </div>
        </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black">Analytics Snapshot</h2>
        <select
          value={analyticsWindow}
          onChange={(e) => setAnalyticsWindow(e.target.value)}
          className="h-10 rounded-lg border border-black/20 bg-white px-4 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <SectionCards
        title=""
        cards={[
          { label: "Delivery Success", value: `${analyticsStats.deliveryRate}%`, note: `Window: ${analyticsWindow}` },
          { label: "Avg Audience", value: `${analyticsStats.avgAudience}`, note: "Estimated recipients per campaign" },
          { label: "Critical Alerts", value: `${analyticsStats.criticalAlerts}`, note: "High severity rules" },
        ]}
      />

      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
        <h3 className="text-2xl font-semibold text-black">Performance Context</h3>
        <p className="mt-3 text-base text-black/60">
          Delivery improves when contacts are segmented and campaigns are scheduled for the audience timezone. Current timezone: {settingsState.timezone}.
        </p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-black/10 bg-white p-3">Campaigns: {campaigns.length}</div>
          <div className="rounded-xl border border-black/10 bg-white p-3">Contacts: {contacts.length}</div>
          <div className="rounded-xl border border-black/10 bg-white p-3">Scheduled: {analyticsStats.scheduledCount}</div>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => {
    const cityOptions = ["Pokhara", "Kathmandu", "Lalitpur", "Biratnagar", "Butwal", "Others"];
    
    // Map cities to their areas
    const cityAreaMap: Record<string, string[]> = {
      "Pokhara": [
        "Lakeside",
        "Pokhara City Centre",
        "Sarangkot",
        "Ward 1",
        "Ward 5",
        "Ward 10",
        "Ward 15",
        "Ward 20",
        "Amar Narayan",
        "Mahendra Bazaar",
        "Ramghat",
        "Hardi Bazaar",
        "Others"
      ],
      "Kathmandu": [
        "Thamel",
        "Durbar Square",
        "Asan",
        "Koteshwor",
        "Baluwatar",
        "Bhaktapur",
        "Others"
      ],
      "Lalitpur": [
        "Patan Durbar Square",
        "Jawalakhel",
        "Lubhu",
        "Godawari",
        "Others"
      ],
      "Others": ["Not Specified"]
    };

    // Get areas for selected city
    const getAreasForCity = (city: string) => {
      return cityAreaMap[city] || ["Select a city first"];
    };

    const areaOptions = getAreasForCity(contactForm.city);
    const categoryOptions = ["General", "High Value", "New", "At Risk"];

    return (
      <div className="space-y-5">
        <SectionCards
          title="Contacts Overview"
          cards={[
            { label: "Total Contacts", value: `${contacts.length}`, note: "All active records" },
            { label: "VIP Segment", value: `${contacts.filter((c) => c.segment.toLowerCase().includes("vip")).length}`, note: "High-priority audience" },
            { label: "Unique Categories", value: `${new Set(contacts.map((c) => c.category ?? "General")).size}`, note: "Classification groups" },
          ]}
        />
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-black">Campaign Ready Segments</h3>
            <Button
              onClick={() => openCampaignForAudience(contactFilters.city ? `${contactFilters.city} Contacts` : "All Contacts")}
              className="rounded-xl bg-black text-white hover:bg-black/90"
            >
              Create Campaign For Filtered Group
            </Button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {contactsBySegment.map(([segment, count]) => (
              <button
                key={segment}
                onClick={() => openCampaignForAudience(segment)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-left hover:bg-black/5"
              >
                <p className="text-xs font-semibold text-black">{segment}</p>
                <p className="text-xs text-black/55">{count} contacts</p>
              </button>
            ))}
          </div>
        </div>
      <div className="grid gap-4 xl:grid-cols-2">
          {/* Add Contact Form */}
          <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
            <h3 className="text-2xl font-semibold text-black">Add Contact</h3>
            <p className="mt-2 text-sm text-black/55">Add individual contacts or bulk upload CSV files</p>
            <div className="mt-5 space-y-4 text-base">
              <input value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" className="h-12 w-full rounded-xl border border-black/15 bg-white px-4" />
              <input value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number (9-15 digits)" className="h-12 w-full rounded-xl border border-black/15 bg-white px-4" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-black/60 block mb-2">Segment</label>
                  <select value={contactForm.segment} onChange={(e) => setContactForm((p) => ({ ...p, segment: e.target.value }))} className="h-12 w-full rounded-xl border border-black/15 bg-white px-4">
                    {segmentOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-black/60 block mb-2">Age (optional)</label>
                  <input value={contactForm.age} onChange={(e) => setContactForm((p) => ({ ...p, age: e.target.value }))} placeholder="Age" className="h-12 w-full rounded-xl border border-black/15 bg-white px-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-black/60 block mb-2">City</label>
                  <select value={contactForm.city} onChange={(e) => setContactForm((p) => ({ ...p, city: e.target.value, area: "" }))} className="h-12 w-full rounded-xl border border-black/15 bg-white px-4">
                    <option value="">Select city</option>
                    {cityOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-black/60 block mb-2">Area</label>
                  <select value={contactForm.area} onChange={(e) => setContactForm((p) => ({ ...p, area: e.target.value }))} className="h-12 w-full rounded-xl border border-black/15 bg-white px-4">
                    <option value="">Select area</option>
                    {areaOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-black/60 block mb-2">Category</label>
                <select value={contactForm.category} onChange={(e) => setContactForm((p) => ({ ...p, category: e.target.value }))} className="h-12 w-full rounded-xl border border-black/15 bg-white px-4">
                  {categoryOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              {contactError ? <p className="text-xs text-red-600">{contactError}</p> : null}
              <Button onClick={handleAddContact} className="w-full rounded-xl bg-black text-white hover:bg-black/90">Save Contact</Button>
            </div>

            {/* Bulk Upload Section */}
            <div className="mt-6 border-t border-black/10 pt-5">
              <h4 className="text-base font-semibold text-black">Bulk Upload</h4>
              <p className="mt-2 text-sm text-black/60">
                Upload CSV/TXT: name, phone, segment, city, area, age, category
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleBulkContactUpload}
                className="mt-3 block w-full text-xs text-black/70 file:mr-3 file:rounded-lg file:border file:border-black/20 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:cursor-pointer hover:file:bg-black/5"
              />
              {bulkImportError ? <p className="mt-2 text-xs text-red-600">{bulkImportError}</p> : null}
              {bulkImportReport ? (
                <div className="mt-2 rounded-lg bg-white p-2 text-xs text-black/70">
                  Imported: {bulkImportReport.imported} &nbsp; Invalid: {bulkImportReport.skippedInvalid} &nbsp; Duplicate: {bulkImportReport.skippedDuplicate}
                </div>
              ) : null}
            </div>
          </div>

          {/* Contact List */}
          <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
            <h3 className="text-2xl font-semibold text-black">Contact List ({filteredContactResults.length})</h3>
            
            {/* Search and Filters */}
            <div className="mt-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3 h-5 w-5 text-black/40" />
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search names or phones..."
                  className="h-10 w-full rounded-lg border border-black/15 bg-white pl-12 pr-4 text-sm"
                />
              </div>

              {/* Sort and Selection */}
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={contactSortBy}
                  onChange={(e) => setContactSortBy(e.target.value as "name" | "city" | "area" | "age")}
                  className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="city">Sort by City</option>
                  <option value="area">Sort by Area</option>
                  <option value="age">Sort by Age</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={selectAllVisibleContacts} className="h-10 flex-1 rounded-lg border border-black/15 bg-white px-3 text-sm text-black/70 hover:bg-black/5">Select All ({filteredContactResults.length})</button>
                  <button onClick={clearContactSelection} className="h-10 flex-1 rounded-lg border border-black/15 bg-white px-3 text-sm text-black/70 hover:bg-black/5">Clear</button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid gap-3 sm:grid-cols-3">
                <select value={contactFilters.city} onChange={(e) => setContactFilters((p) => ({ ...p, city: e.target.value, area: "" }))} className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm">
                  <option value="">All cities</option>
                  {cityOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <select value={contactFilters.area} onChange={(e) => setContactFilters((p) => ({ ...p, area: e.target.value }))} className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm">
                  <option value="">All areas</option>
                  {contactFilters.city ? getAreasForCity(contactFilters.city).map((opt) => <option key={opt}>{opt}</option>) : areaOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <select value={contactFilters.category} onChange={(e) => setContactFilters((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-lg border border-black/15 bg-white px-3 text-sm">
                  <option value="">All categories</option>
                  {categoryOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Bulk Update */}
            {selectedContactIds.length > 0 && (
              <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
                <p className="text-xs font-semibold text-black/70">Update {selectedContactIds.length} Selected</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <select value={bulkAssign.segment} onChange={(e) => setBulkAssign((p) => ({ ...p, segment: e.target.value }))} className="h-9 rounded-lg border border-black/15 px-2 text-xs">
                    <option value="">Keep segment</option>
                    {segmentOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                  <select value={bulkAssign.category} onChange={(e) => setBulkAssign((p) => ({ ...p, category: e.target.value }))} className="h-9 rounded-lg border border-black/15 px-2 text-xs">
                    <option value="">Keep category</option>
                    {categoryOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <Button onClick={applyBulkContactAssignment} className="mt-2 h-9 w-full rounded-lg bg-black px-3 text-xs text-white hover:bg-black/90">✓ Apply Changes</Button>
                <Button
                  onClick={() => openCampaignForAudience("Selected Contacts")}
                  variant="outline"
                  className="mt-2 h-9 w-full rounded-lg border-black/15 bg-white px-3 text-xs text-black hover:bg-black/5"
                >
                  Open Campaign For Selected
                </Button>
              </div>
            )}

            {/* Contact Cards */}
            <div className="mt-4 space-y-2">
              {filteredContactResults.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-black/10 bg-white p-3 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="mt-1 h-3.5 w-3.5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-black">{contact.name}</p>
                        <p className="text-xs text-black/55">{contact.phone}</p>
                        <p className="mt-1 text-[11px] text-black/60">
                          {contact.segment} · {contact.city || "-"} · {contact.area || "-"} · Age {contact.age || "-"} · {contact.category || "General"}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeContact(contact.id)} className="rounded-lg border border-red-200 px-2 py-1 text-[10px] text-red-600 hover:bg-red-50 whitespace-nowrap">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {filteredContactResults.length === 0 && (
                <div className="rounded-xl border border-dashed border-black/20 bg-white p-4 text-center text-xs text-black/55">
                  No contacts. Add one or upload CSV to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => (
    <div className="space-y-5">
      <SectionCards
        title="Billing Overview"
        cards={[
          { label: "Current Balance", value: `$${creditBalance}`, note: "Available credits" },
          { label: "Plan", value: billingPlan, note: "Current subscription" },
          { label: "Projected Spend", value: `$${Math.max(650, campaigns.length * 45)}`, note: "Based on active usage" },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <h3 className="text-2xl font-semibold text-black">Change Plan</h3>
          <p className="mt-2 text-sm text-black/55">Select your preferred subscription tier</p>
          <select value={billingPlan} onChange={(e) => handlePlanChange(e.target.value)} className="mt-5 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base">
            <option>Starter</option>
            <option>Professional</option>
            <option>Enterprise</option>
          </select>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <h3 className="text-2xl font-semibold text-black">Top Up Credits</h3>
          <p className="mt-2 text-sm text-black/55">Add more credits to your account</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Amount" className="h-12 flex-1 rounded-xl border border-black/15 bg-white px-4 text-base" />
            <Button onClick={handleTopUp} className="rounded-xl bg-black px-6 text-white hover:bg-black/90">Top Up</Button>
          </div>
          {billingError ? <p className="mt-2 text-xs text-red-600">{billingError}</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
        <h3 className="text-2xl font-semibold text-black">Recent Transactions</h3>
        <div className="mt-5 space-y-3">
          {billingTransactions.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3">
              <div>
                <p className="text-sm font-semibold text-black">{item.label}</p>
                <p className="text-xs text-black/55">{item.note}</p>
              </div>
              <span className={`text-sm font-semibold ${item.amount.startsWith("+") ? "text-green-600" : "text-black/70"}`}>{item.amount}</span>
            </div>
          ))}
          {billingTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/20 bg-white p-4 text-center text-xs text-black/55">
              No billing activity yet. Top up credits or switch plan.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-5">
      <SectionCards
        title="Alert Center"
        cards={[
          { label: "Active Rules", value: `${alerts.length}`, note: "Configured triggers" },
          { label: "High Severity", value: `${alerts.filter((a) => a.severity === "High").length}`, note: "Immediate attention" },
          { label: "SMS Rules", value: `${alerts.filter((a) => a.channel === "SMS").length}`, note: "Direct notifications" },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <h3 className="text-2xl font-semibold text-black">Create Alert Rule</h3>
          <div className="mt-5 space-y-4 text-base">
            <input value={alertForm.title} onChange={(e) => setAlertForm((p) => ({ ...p, title: e.target.value }))} placeholder="Rule title" className="h-12 w-full rounded-xl border border-black/15 bg-white px-4" />
            <div className="grid grid-cols-2 gap-3">
              <select value={alertForm.severity} onChange={(e) => setAlertForm((p) => ({ ...p, severity: e.target.value as AlertRule["severity"] }))} className="h-12 rounded-xl border border-black/15 bg-white px-4">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select value={alertForm.channel} onChange={(e) => setAlertForm((p) => ({ ...p, channel: e.target.value as AlertRule["channel"] }))} className="h-12 rounded-xl border border-black/15 bg-white px-4">
                <option>Email</option>
                <option>SMS</option>
              </select>
            </div>
            {alertError ? <p className="text-xs text-red-600">{alertError}</p> : null}
            <Button onClick={handleAddAlert} className="w-full rounded-xl bg-black text-white">Save Rule</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
          <h3 className="text-2xl font-semibold text-black">Configured Rules</h3>
          <div className="mt-5 space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-black/10 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-black">{alert.title}</p>
                    <p className="mt-1 text-xs text-black/55">{alert.channel} notification</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] ${alert.severity === "High" ? "bg-red-100 text-red-700" : alert.severity === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-lime-100 text-lime-700"}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <button onClick={() => removeAlert(alert.id)} className="rounded-lg border border-red-200 px-2 py-1 text-[10px] text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/20 bg-white p-4 text-center text-xs text-black/55">
                No alert rules yet. Add one from the form.
              </div>
            ) : null}
          </div>
        </div>
      </div>

    </div>
  );

  const renderSettings = () => (
    <div className="space-y-5">
      <SectionCards
        title="Settings"
        cards={[
          { label: "Timezone", value: settingsState.timezone, note: "Campaign schedule base" },
          { label: "2FA", value: settingsState.twoFactor ? "Enabled" : "Disabled", note: "Account protection" },
          { label: "Auto Retry", value: settingsState.autoRetry ? "Enabled" : "Disabled", note: "Failed delivery handling" },
        ]}
      />

      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-7">
        <h3 className="text-2xl font-semibold text-black">Platform Settings</h3>
        <div className="mt-5 grid gap-4">
          <label className="rounded-xl border border-black/10 bg-white p-4 text-sm text-black/80">
            Timezone
            <select
              value={settingsState.timezone}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="mt-3 h-12 w-full rounded-lg border border-black/15 px-4 text-base"
            >
              <option>Asia/Kathmandu</option>
              <option>Asia/Kolkata</option>
              <option>UTC</option>
            </select>
          </label>

          <div className="space-y-3 rounded-xl border border-black/10 bg-white p-4 text-sm text-black/80">
            <label className="flex items-center justify-between">
              Two-factor authentication
              <input type="checkbox" checked={settingsState.twoFactor} onChange={(e) => updateSetting("twoFactor", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              Email reports
              <input type="checkbox" checked={settingsState.emailReports} onChange={(e) => updateSetting("emailReports", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              Auto retry failed sends
              <input type="checkbox" checked={settingsState.autoRetry} onChange={(e) => updateSetting("autoRetry", e.target.checked)} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveContent = () => {
    if (activeMenu === "dashboard") return renderDashboardOverview();
    if (activeMenu === "campaigns") return renderCampaigns();
    if (activeMenu === "analytics") return renderAnalytics();
    if (activeMenu === "contacts") return renderContacts();
    if (activeMenu === "billing") return renderBilling();
    if (activeMenu === "alerts") return renderAlerts();
    return renderSettings();
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className={`grid min-h-screen ${sidebarMinimized ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[280px_1fr]"}`}>
        <aside className={`self-stretch bg-black px-4 py-6 text-white lg:min-h-screen lg:py-8 transition-all duration-300 ${sidebarMinimized ? "lg:px-3" : "lg:px-5"}`}>
          <div className="flex items-center justify-between">
            {!sidebarMinimized && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                VoiceLink
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-lime-300" />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarMinimized(!sidebarMinimized)}
                className="h-8 rounded-full px-2 text-white/70 hover:text-white"
                title={sidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {sidebarMinimized ? "»" : "«"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutConfirm(true)}
                className="h-8 rounded-full px-2 text-white/70 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!sidebarMinimized && (
            <>
              <div className="mt-6 rounded-xl border border-white/10 bg-[#171717] px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Search className="h-4 w-4" />
                  <input
                    value={quickFind}
                    onChange={(e) => setQuickFind(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredMenuItems[0]) {
                        setActiveMenu(filteredMenuItems[0].id);
                      }
                    }}
                    placeholder="Quick Find"
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/45"
                  />
                </div>
                {quickFindHint ? <p className="mt-1 text-[10px] text-white/45">{quickFindHint}</p> : null}
              </div>
            </>
          )}

          <div className={`mt-6 space-y-3 ${sidebarMinimized ? "text-[11px]" : "text-sm"}`}>
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeMenu;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  title={sidebarMinimized ? item.label : ""}
                  className={`flex w-full items-center gap-3 rounded-xl ${sidebarMinimized ? "justify-center px-3 py-3" : "px-4 py-3 text-left"} ${
                    isActive
                      ? "bg-lime-300 font-semibold text-black"
                      : "text-white/70 hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {!sidebarMinimized && item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-screen space-y-5 bg-[#f3f3f3] px-4 py-5 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="px-0">
            <Navbar />
          </div>

          <div className="flex flex-col gap-3 border border-black/10 bg-[#efefef] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-black/50">Merchants</p>
              <h1 className="text-2xl font-semibold text-black">{activeLabel}</h1>
            </div>
            <p className="text-xs text-black/60">
              Use sidebar or Quick Find to switch sections
              {db && user
                ? ` · Sync: ${
                    saveStatus === "saving"
                      ? "Saving..."
                      : saveStatus === "saved"
                        ? "Saved"
                        : saveStatus === "error"
                          ? "Retrying"
                          : "Idle"
                  }`
                : " · Local mode"}
            </p>
          </div>

          {renderActiveContent()}
        </main>

      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await signOut();
                setShowLogoutConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
