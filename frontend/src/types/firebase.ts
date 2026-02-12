// Market Price types
export interface MarketPrice {
  id: string;
  commodity: string;
  price: number;
  unit: string; // kg, quintal, basket, etc.
  market: string;
  location?: string;
  date: Date;
  source?: string;
  trend?: 'up' | 'down' | 'stable';
  createdAt: Date;
  updatedAt: Date;
}

// Transport Schedule types
export interface TransportSchedule {
  id: string;
  route: string;
  operator: string;
  departureTime: string; // HH:mm format
  arrivalTime: string;
  fare: number;
  capacity?: number;
  frequency?: string; // daily, weekly, etc.
  delayStatus?: boolean;
  delayMinutes?: number;
  contactNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Community Alert types
export interface CommunityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string; // 'health', 'weather', 'safety', 'general', etc.
  location?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'moderator' | 'admin';
  phone?: string;
  location?: string;
  language: 'en' | 'ne'; // English or Nepali
  preferences?: {
    enableNotifications: boolean;
    topics: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Reporter/Contributor types
export interface Reporter {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  isVerified: boolean;
  contributionCount: number;
  reliabilityScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

// Feedback types
export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'feedback' | 'other';
  message: string;
  rating?: number;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
