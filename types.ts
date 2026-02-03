export type RiskLevel = "CRITICAL" | "WARNING" | "SECURE";
export type ColorCode = "#FF3D00" | "#FFD600" | "#00E5FF";
export type DeliveryImpact = "Delayed" | "On-Track";
export type GlowEffect = "pulse-red" | "static-blue";

export interface ExecutivePulseHeader {
  title: string;
  riskLevel: RiskLevel;
  colorCode: ColorCode;
}

export interface ExecutivePulseStats {
  complianceScore: number;
  financialLiability: string;
  deliveryImpact: DeliveryImpact;
  supplierRiskScore: number; // Added new field
}

export interface ExecutivePulseVisuals {
  mapCoordinates: { lat: number; lng: number };
  chartData: number[];
  glowEffect: GlowEffect;
}

// New interface for Decision Logic
export interface DecisionLogic {
  thought_process: string[];
  final_verdict: string;
  confidence_score: number;
  automated_action: string;
}

export interface ExecutivePulse {
  header: ExecutivePulseHeader;
  stats: ExecutivePulseStats;
  visuals: ExecutivePulseVisuals;
  executiveAudit: string;
  actionSteps: string[];
  decisionLogic: DecisionLogic; // Added new field
}

export interface GeminiInput {
  text: string;
  image?: string; // Base64 encoded image
}