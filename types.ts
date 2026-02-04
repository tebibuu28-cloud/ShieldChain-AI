export type RiskLevel = "CRITICAL" | "WARNING" | "SECURE";
export type ColorCode = "#FF3D00" | "#FFD600" | "#00E5FF";
export type DeliveryImpact = "Delayed" | "On-Track";
export type GlowEffect = "pulse-red" | "static-blue";

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number; // 0 to 1
}

export interface ExecutivePulseHeader {
  title: string;
  riskLevel: RiskLevel;
  colorCode: ColorCode;
}

export interface ExecutivePulseStats {
  complianceScore: number;
  financialLiability: string;
  deliveryImpact: DeliveryImpact;
  supplierRiskScore: number;
}

export interface ExecutivePulseVisuals {
  mapCoordinates: { lat: number; lng: number };
  heatmapData: HeatmapPoint[];
  chartData: number[];
  glowEffect: GlowEffect;
}

export interface DecisionLogic {
  thought_process: string[];
  final_verdict: string;
  confidence_score: number;
  automated_action: string;
}

export interface SupplierTrend {
  month: string;
  performance: number;
}

export interface RegionalBrief {
  region: string;
  riskIndex: number;
  activeHubs: string[];
  efficiency: string;
  geopoliticalNotes: string;
  lastUpdated: string;
}

export interface ExecutivePulse {
  header: ExecutivePulseHeader;
  stats: ExecutivePulseStats;
  visuals: ExecutivePulseVisuals;
  executiveAudit: string;
  actionSteps: string[];
  decisionLogic: DecisionLogic;
  supplierTrends: SupplierTrend[];
}

export interface RawShippingData {
  BOL: string;
  Route: string;
  Performance: string;
  Supplier: string;
  Status: string;
}

export type AnalysisResult = ExecutivePulse | RawShippingData[];

export interface GeminiInput {
  text: string;
  image?: string; // Base64 encoded image
}
