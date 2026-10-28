export type CategoryType = 
  | 'all'
  | 'vehicles' 
  | 'space' 
  | 'internet' 
  | 'ai' 
  | 'energy' 
  | 'robots' 
  | 'future' 
  | 'investments' 
  | 'social';

export interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  monthlyEstimate: number;
  currency: string;
  range: string;
  acceleration: string;
  drivetrain: string;
  deliveryEstimate: string;
  image: string;
  gallery: string[];
  description: string;
  specs: {
    topSpeed: string;
    seating: string;
    cargo: string;
    powertrain: string;
    autopilot: string;
  };
  officialUrl: string;
}

export interface SpaceProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  deposit?: number;
  priceNote?: string;
  type: 'starship' | 'falcon9' | 'dragon' | 'mars';
  seats?: number;
  nextLaunch?: string;
  image: string;
  description: string;
  specs: Record<string, string>;
  officialUrl: string;
}

export interface StarlinkProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  monthlyFee?: number;
  localPriceNGN?: string;
  tagline: string;
  speed: string;
  latency: string;
  image: string;
  features: string[];
  officialUrl: string;
}

export interface GrokTier {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface EnergyProduct {
  id: string;
  name: string;
  priceStarting: number;
  currency: string;
  subtitle: string;
  nigerianBenefit?: string;
  capacity?: string;
  image: string;
  description: string;
  specs: Record<string, string>;
  officialUrl: string;
}

export interface OptimusSpec {
  generation: string;
  priceRange: string;
  height: string;
  weight: string;
  battery: string;
  brain: string;
  capabilities: string[];
  waitlistCount: number;
  videoDemos: {
    title: string;
    id: string;
    thumbnail: string;
    description: string;
  }[];
}

export interface FutureProject {
  id: string;
  name: string;
  company: string;
  category: string;
  status: string;
  description: string;
  location: string;
  impact: string;
  image: string;
  officialUrl: string;
}

export interface ExpralInvestmentPlan {
  id: string;
  title: string;
  tier: 'Seed Node' | 'Growth Portfolio' | 'Sovereign Supercluster';
  minCapital: number;
  maxCapital: number;
  targetYieldApy: number;
  durationMonths: number;
  payoutFrequency: string;
  focusAsset: string;
  riskRating: 'Moderate' | 'High Growth' | 'Syndicate Venture';
  highlights: string[];
  description: string;
  allocationBreakdown: { asset: string; percentage: number }[];
}

export interface CartItem {
  id: string;
  title: string;
  category: CategoryType;
  price: number;
  recurringMonthly?: number;
  quantity: number;
  image?: string;
  currency: string;
  details?: string;
}

export interface CommunityMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions: number;
  isVerified?: boolean;
}
