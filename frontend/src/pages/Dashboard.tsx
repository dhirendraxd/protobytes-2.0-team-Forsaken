import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
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
  channel: "SMS" | "Voice" | "IVR" | "Email";
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

const normalizeCampaign = (raw: Partial<Campaign>): Campaign => ({
  id: raw.id ?? Date.now(),
  name: raw.name?.trim() || "Untitled Campaign",
  channel: raw.channel ?? "SMS",
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

const Dashboard = () => {
  const { signOut, user } = useAuth();

  const initialStore = useMemo(readDashboardStore, []);

  const [activeMenu, setActiveMenu] = useState("dashboard");
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
  });
  const [campaignError, setCampaignError] = useState("");

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

  const [alertForm, setAlertForm] = useState({
    title: "",
    severity: "Medium" as AlertRule["severity"],
    channel: "Email" as AlertRule["channel"],
  });
  const [alertError, setAlertError] = useState("");

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
    let active = true;

    const loadStore = async () => {
      if (!user || !db) {
        setStoreHydrated(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, DASHBOARD_COLLECTION, user.uid));
        if (!active) return;
        if (snap.exists()) {
          const remoteStore = mergeStore(snap.data() as Partial<DashboardStore>);
          setCampaigns(remoteStore.campaigns);
          setContacts(remoteStore.contacts);
          setAlerts(remoteStore.alerts);
          setBillingPlan(remoteStore.billingPlan);
          setCreditBalance(remoteStore.creditBalance);
          setSettingsState(remoteStore.settingsState);
          setActivityLog(remoteStore.activityLog);
        }
      } catch (error) {
        console.warn("Failed to load dashboard state from Firestore, using local cache.", error);
      } finally {
        if (active) {
          setStoreHydrated(true);
        }
      }
    };

    loadStore();
    return () => {
      active = false;
    };
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

    if (typeof window !== "undefined") {
      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(store));
    }

    if (!db || !user) return;

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

  const toggleContactSelection = (id: number) => {
    setSelectedContactIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisibleContacts = () => {
    setSelectedContactIds(visibleContacts.map((contact) => contact.id));
  };

  const clearContactSelection = () => {
    setSelectedContactIds([]);
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
      { label: "Total Messages", value: `${89000 + campaigns.length * 210}`, delta: "+0.5%" },
      { label: "Total Campaigns", value: `${campaigns.length}`, delta: "+0.3%" },
      { label: "Avg Delivery Rate", value: `${analyticsStats.deliveryRate}%`, delta: "+0.5%" },
      { label: "Active Contacts", value: `${contacts.length}`, delta: "+1.1%" },
    ],
    [campaigns.length, contacts.length, analyticsStats.deliveryRate]
  );

  const recentActivity = useMemo(
    () => activityLog.slice(0, 6),
    [activityLog]
  );

  const handleCreateCampaign = () => {
    setCampaignError("");
    if (!campaignForm.name.trim() || !campaignForm.message.trim()) {
      setCampaignError("Campaign name and message are required.");
      return;
    }

    const createdCampaign: Campaign = {
      id: Date.now(),
      name: campaignForm.name.trim(),
      channel: campaignForm.channel,
      audience: campaignForm.audience.trim() || "All Contacts",
      category: campaignForm.category,
      objective: campaignForm.objective,
      frequency: campaignForm.frequency,
      schedule: campaignForm.schedule || new Date().toISOString().slice(0, 16),
      info: campaignForm.info.trim(),
      message: campaignForm.message.trim(),
      status: campaignForm.schedule ? "Scheduled" : "Draft",
    };

    setCampaigns((prev) => [createdCampaign, ...prev]);
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
    });
    logActivity("Campaign created", `${createdCampaign.name} (${createdCampaign.channel}, ${createdCampaign.category})`);
  };

  const toggleCampaignStatus = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;

    const nextStatus: Campaign["status"] =
      target.status === "Draft" ? "Scheduled" : target.status === "Scheduled" ? "Draft" : "Scheduled";
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
    logActivity("Campaign updated", `${target.name} moved to ${nextStatus}`);
  };

  const runCampaignNow = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;
    const now = new Date().toISOString().slice(0, 16);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Active", schedule: now } : c)));
    logActivity("Campaign launched", `${target.name} is now active`);
  };

  const removeCampaign = (id: number) => {
    const target = campaigns.find((c) => c.id === id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logActivity("Campaign removed", target.name);
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
            <p className="mt-2 text-xs text-black/50">
              last month <span className="text-green-600">{stat.delta}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="border border-black/10 bg-[#efefef] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-black/50">Total Delivery Volume</p>
            <p className="mt-2 text-2xl font-semibold text-black">{campaigns.length * 1340}</p>
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
    <div className="space-y-6">
      <SectionCards
        title="Campaign Summary"
        cards={[
          { label: "Running Campaigns", value: `${analyticsStats.activeCount}`, note: "Live right now" },
          { label: "Scheduled", value: `${campaigns.filter((c) => c.status === "Scheduled").length}`, note: "Queued by date/time" },
          { label: "Drafts", value: `${campaigns.filter((c) => c.status === "Draft").length}`, note: "Needs scheduling" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Create Campaign</h3>
          <p className="mt-1 text-xs text-black/55">Pick category, timing, message, and audience. Keep it simple and launch fast.</p>
          <div className="mt-4 space-y-3 text-sm">
            <input
              value={campaignForm.name}
              onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Campaign name"
              className="h-10 w-full rounded-xl border border-black/15 bg-white px-3"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={campaignForm.category}
                onChange={(e) => {
                  const category = e.target.value as Campaign["category"];
                  setCampaignForm((p) => ({
                    ...p,
                    category,
                    message: p.message.trim() ? p.message : CAMPAIGN_TEMPLATES[category],
                  }));
                }}
                className="h-10 rounded-xl border border-black/15 bg-white px-3"
              >
                {CAMPAIGN_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={campaignForm.objective}
                onChange={(e) => setCampaignForm((p) => ({ ...p, objective: e.target.value as Campaign["objective"] }))}
                className="h-10 rounded-xl border border-black/15 bg-white px-3"
              >
                {CAMPAIGN_OBJECTIVES.map((option) => (
                  <option key={option} value={option}>
                    Objective: {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={campaignForm.channel}
                onChange={(e) => setCampaignForm((p) => ({ ...p, channel: e.target.value as Campaign["channel"] }))}
                className="h-10 rounded-xl border border-black/15 bg-white px-3"
              >
                <option>SMS</option>
                <option>Voice</option>
                <option>IVR</option>
                <option>Email</option>
              </select>
              <select
                value={campaignForm.audience}
                onChange={(e) => setCampaignForm((p) => ({ ...p, audience: e.target.value }))}
                className="h-10 rounded-xl border border-black/15 bg-white px-3"
              >
                {segmentOptions.map((segment) => (
                  <option key={segment} value={segment}>
                    Audience: {segment}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="datetime-local"
                value={campaignForm.schedule}
                onChange={(e) => setCampaignForm((p) => ({ ...p, schedule: e.target.value }))}
                className="h-10 w-full rounded-xl border border-black/15 bg-white px-3"
              />
              <select
                value={campaignForm.frequency}
                onChange={(e) => setCampaignForm((p) => ({ ...p, frequency: e.target.value as Campaign["frequency"] }))}
                className="h-10 rounded-xl border border-black/15 bg-white px-3"
              >
                {CAMPAIGN_FREQUENCIES.map((option) => (
                  <option key={option} value={option}>
                    Repeat: {option}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={campaignForm.info}
              onChange={(e) => setCampaignForm((p) => ({ ...p, info: e.target.value }))}
              placeholder="What key information should be shared? (offer, link, event address)"
              className="h-10 w-full rounded-xl border border-black/15 bg-white px-3"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCampaignForm((p) => ({ ...p, message: CAMPAIGN_TEMPLATES[p.category] }))}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-black/70"
              >
                Use Template
              </button>
              <button
                onClick={() => setCampaignForm((p) => ({ ...p, schedule: new Date().toISOString().slice(0, 16) }))}
                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-black/70"
              >
                Set Start Now
              </button>
            </div>
            <textarea
              value={campaignForm.message}
              onChange={(e) => setCampaignForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Message content (supports placeholders like {{name}})"
              className="h-24 w-full rounded-xl border border-black/15 bg-white px-3 py-2"
            />
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-black/60">
              Category: <span className="font-medium text-black">{campaignForm.category}</span> . Objective:{" "}
              <span className="font-medium text-black">{campaignForm.objective}</span> . Repeat:{" "}
              <span className="font-medium text-black">{campaignForm.frequency}</span>
            </div>
            {campaignError ? <p className="text-xs text-red-600">{campaignError}</p> : null}
            <Button onClick={handleCreateCampaign} className="w-full rounded-xl bg-black text-white">
              Save Campaign
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Campaign Queue</h3>
          <div className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-black/10 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-black">{c.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
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
                <p className="mt-1 text-xs text-black/55">
                  {c.category} . {c.objective} . {c.channel}
                </p>
                <p className="mt-1 text-xs text-black/45">
                  {c.audience} . {c.frequency} . {new Date(c.schedule).toLocaleString()}
                </p>
                {c.info ? <p className="mt-1 text-xs text-black/50">Info: {c.info}</p> : null}
                <p className="mt-1 line-clamp-2 text-xs text-black/50">{c.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => runCampaignNow(c.id)}
                    className="rounded-lg border border-black/15 bg-black px-2 py-1 text-[10px] text-white"
                  >
                    Run Now
                  </button>
                  <button onClick={() => toggleCampaignStatus(c.id)} className="rounded-lg border border-black/15 px-2 py-1 text-[10px] text-black/70">
                    {c.status === "Draft" ? "Schedule" : "Move To Draft"}
                  </button>
                  <button onClick={() => removeCampaign(c.id)} className="rounded-lg border border-red-200 px-2 py-1 text-[10px] text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/20 bg-white p-4 text-center text-xs text-black/55">
                No campaigns yet. Create one from the form.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black">Analytics Snapshot</h2>
        <select
          value={analyticsWindow}
          onChange={(e) => setAnalyticsWindow(e.target.value)}
          className="h-9 rounded-lg border border-black/20 bg-white px-3 text-xs"
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

      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
        <h3 className="text-lg font-semibold text-black">Performance Context</h3>
        <p className="mt-2 text-sm text-black/60">
          Delivery improves when contacts are segmented and campaigns are scheduled for the audience timezone. Current timezone: {settingsState.timezone}.
        </p>
      </div>
    </div>
  );

  const renderContacts = () => {
    const segmentOptions = ["All Contacts", "VIP Customers", "Retail", "Wholesale", "Leads"];
    const cityOptions = ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar", "Butwal"];
    const areaOptions = ["Ward 1", "Ward 5", "Ward 10", "Lakeside", "Thamel"];
    const categoryOptions = ["General", "High Value", "New", "At Risk"];

    return (
      <div className="space-y-6">
        <SectionCards
          title="Contacts Overview"
          cards={[
            { label: "Total Contacts", value: `${contacts.length}`, note: "All active records" },
            { label: "VIP Segment", value: `${contacts.filter((c) => c.segment.toLowerCase().includes("vip")).length}`, note: "High-priority audience" },
            { label: "Unique Categories", value: `${new Set(contacts.map((c) => c.category ?? "General")).size}`, note: "Classification groups" },
          ]}
        />
        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
            <h3 className="text-lg font-semibold text-black">Add Contact</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <input value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" className="h-10 w-full rounded-xl border border-black/15 bg-white px-3" />
              <input value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone number" className="h-10 w-full rounded-xl border border-black/15 bg-white px-3" />
              <div className="grid grid-cols-2 gap-2">
                <select value={contactForm.segment} onChange={(e) => setContactForm((p) => ({ ...p, segment: e.target.value }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                  {segmentOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <input value={contactForm.age} onChange={(e) => setContactForm((p) => ({ ...p, age: e.target.value }))} placeholder="Age (optional)" className="h-10 rounded-xl border border-black/15 bg-white px-3" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={contactForm.city} onChange={(e) => setContactForm((p) => ({ ...p, city: e.target.value }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                  <option value="">Select city</option>
                  {cityOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <select value={contactForm.area} onChange={(e) => setContactForm((p) => ({ ...p, area: e.target.value }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                  <option value="">Select area</option>
                  {areaOptions.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <select value={contactForm.category} onChange={(e) => setContactForm((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                {categoryOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              {contactError ? <p className="text-xs text-red-600">{contactError}</p> : null}
              <Button onClick={handleAddContact} className="w-full rounded-xl bg-black text-white">Save Contact</Button>
            </div>

            <div className="mt-6 border-t border-black/10 pt-4">
              <h4 className="text-sm font-semibold text-black">Bulk Upload Contacts</h4>
              <p className="mt-1 text-xs text-black/60">
                Upload `.csv` or `.txt` with `name,phone,segment,city,area,age,category`
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleBulkContactUpload}
                className="mt-3 block w-full text-xs text-black/70 file:mr-3 file:rounded-lg file:border file:border-black/20 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium"
              />
              {bulkImportError ? <p className="mt-2 text-xs text-red-600">{bulkImportError}</p> : null}
              {bulkImportReport ? (
                <div className="mt-2 rounded-lg bg-white p-2 text-xs text-black/70">
                  Imported: {bulkImportReport.imported} · Invalid: {bulkImportReport.skippedInvalid} · Duplicate: {bulkImportReport.skippedDuplicate}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
            <h3 className="text-lg font-semibold text-black">Contact List</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <select
                value={contactSortBy}
                onChange={(e) => setContactSortBy(e.target.value as "name" | "city" | "area" | "age")}
                className="h-9 rounded-lg border border-black/15 bg-white px-2 text-xs"
              >
                <option value="name">Sort by Name</option>
                <option value="city">Sort by City</option>
                <option value="area">Sort by Area</option>
                <option value="age">Sort by Age</option>
              </select>
              <div className="flex gap-2">
                <button onClick={selectAllVisibleContacts} className="h-9 flex-1 rounded-lg border border-black/15 bg-white px-2 text-xs text-black/70">Select All</button>
                <button onClick={clearContactSelection} className="h-9 flex-1 rounded-lg border border-black/15 bg-white px-2 text-xs text-black/70">Clear</button>
              </div>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <select value={contactFilters.city} onChange={(e) => setContactFilters((p) => ({ ...p, city: e.target.value }))} className="h-9 rounded-lg border border-black/15 bg-white px-2 text-xs">
                <option value="">All cities</option>
                {cityOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select value={contactFilters.area} onChange={(e) => setContactFilters((p) => ({ ...p, area: e.target.value }))} className="h-9 rounded-lg border border-black/15 bg-white px-2 text-xs">
                <option value="">All areas</option>
                {areaOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
              <select value={contactFilters.category} onChange={(e) => setContactFilters((p) => ({ ...p, category: e.target.value }))} className="h-9 rounded-lg border border-black/15 bg-white px-2 text-xs">
                <option value="">All categories</option>
                {categoryOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
              <p className="text-xs font-semibold text-black/70">Update Selected ({selectedContactIds.length})</p>
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
              <Button onClick={applyBulkContactAssignment} className="mt-2 h-9 rounded-lg bg-black px-3 text-xs text-white">Apply</Button>
            </div>

            <div className="mt-4 space-y-3">
              {visibleContacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-black/10 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        className="mt-1 h-3.5 w-3.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-black">{contact.name}</p>
                        <p className="text-xs text-black/55">{contact.phone}</p>
                        <p className="mt-1 text-[11px] text-black/60">
                          {contact.segment} · {contact.city ?? "-"} · {contact.area ?? "-"} · Age {contact.age ?? "-"} · {contact.category ?? "General"}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeContact(contact.id)} className="rounded-lg border border-red-200 px-2 py-1 text-[10px] text-red-600">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => (
    <div className="space-y-6">
      <SectionCards
        title="Billing Overview"
        cards={[
          { label: "Current Balance", value: `$${creditBalance}`, note: "Available credits" },
          { label: "Plan", value: billingPlan, note: "Current subscription" },
          { label: "Projected Spend", value: `$${Math.max(650, campaigns.length * 45)}`, note: "Based on active usage" },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Change Plan</h3>
          <select value={billingPlan} onChange={(e) => handlePlanChange(e.target.value)} className="mt-4 h-10 w-full rounded-xl border border-black/15 bg-white px-3 text-sm">
            <option>Starter</option>
            <option>Professional</option>
            <option>Enterprise</option>
          </select>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Top Up Credits</h3>
          <div className="mt-4 flex gap-2">
            <input value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Amount" className="h-10 flex-1 rounded-xl border border-black/15 bg-white px-3 text-sm" />
            <Button onClick={handleTopUp} className="rounded-xl bg-black text-white">Top Up</Button>
          </div>
          {billingError ? <p className="mt-2 text-xs text-red-600">{billingError}</p> : null}
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <SectionCards
        title="Alert Center"
        cards={[
          { label: "Active Rules", value: `${alerts.length}`, note: "Configured triggers" },
          { label: "High Severity", value: `${alerts.filter((a) => a.severity === "High").length}`, note: "Immediate attention" },
          { label: "SMS Rules", value: `${alerts.filter((a) => a.channel === "SMS").length}`, note: "Direct notifications" },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Create Alert Rule</h3>
          <div className="mt-4 space-y-3 text-sm">
            <input value={alertForm.title} onChange={(e) => setAlertForm((p) => ({ ...p, title: e.target.value }))} placeholder="Rule title" className="h-10 w-full rounded-xl border border-black/15 bg-white px-3" />
            <div className="grid grid-cols-2 gap-2">
              <select value={alertForm.severity} onChange={(e) => setAlertForm((p) => ({ ...p, severity: e.target.value as AlertRule["severity"] }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select value={alertForm.channel} onChange={(e) => setAlertForm((p) => ({ ...p, channel: e.target.value as AlertRule["channel"] }))} className="h-10 rounded-xl border border-black/15 bg-white px-3">
                <option>Email</option>
                <option>SMS</option>
              </select>
            </div>
            {alertError ? <p className="text-xs text-red-600">{alertError}</p> : null}
            <Button onClick={handleAddAlert} className="w-full rounded-xl bg-black text-white">Save Rule</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
          <h3 className="text-lg font-semibold text-black">Configured Rules</h3>
          <div className="mt-4 space-y-3">
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
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <SectionCards
        title="Settings"
        cards={[
          { label: "Timezone", value: settingsState.timezone, note: "Campaign schedule base" },
          { label: "2FA", value: settingsState.twoFactor ? "Enabled" : "Disabled", note: "Account protection" },
          { label: "Auto Retry", value: settingsState.autoRetry ? "Enabled" : "Disabled", note: "Failed delivery handling" },
        ]}
      />

      <div className="rounded-2xl border border-black/10 bg-[#efefef] p-5">
        <h3 className="text-lg font-semibold text-black">Platform Settings</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="rounded-xl border border-black/10 bg-white p-3 text-sm text-black/80">
            Timezone
            <select
              value={settingsState.timezone}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-black/15 px-2"
            >
              <option>Asia/Kathmandu</option>
              <option>Asia/Kolkata</option>
              <option>UTC</option>
            </select>
          </label>

          <div className="space-y-2 rounded-xl border border-black/10 bg-white p-3 text-sm text-black/80">
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
      <div className="px-4 pt-4 sm:px-6 lg:px-8">
        <Navbar />
      </div>

      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-[280px_1fr]">
        <aside className="bg-black px-4 py-6 text-white lg:px-5 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              VoiceLink
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-lime-300" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await signOut()}
              className="h-8 rounded-full px-2 text-white/70 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

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

          <div className="mt-6 space-y-2 text-xs">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeMenu;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                    isActive
                      ? "bg-lime-300 font-semibold text-black"
                      : "text-white/70 hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="space-y-6 bg-[#f3f3f3] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-3 border border-black/10 bg-[#efefef] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
};

export default Dashboard;
