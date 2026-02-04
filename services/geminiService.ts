import { GoogleGenAI, GenerateContentResponse, Type, Part } from "@google/genai";
import { ExecutivePulse, GeminiInput, AnalysisResult, RegionalBrief } from "../types";

const SYSTEM_INSTRUCTION = `Role: Chief Decision Engine (CDE) for ShieldChain AI.
Status: Autonomous Agentic Mode Enabled.

Brain Protocol:
1. Decomposition: Break every user request into 3 sub-tasks: [Data Validation], [Regulatory Cross-Check], [Financial Impact].
2. Contextual Memory: When past "Supply Place" history (e.g., previous delivery delays) is provided in the input, integrate this context into the analysis.
3. Multimodal Reasoning: When an image is provided, reason about it (e.g., "The seal on this container looks tampered with; this increases theft risk by 40%").

You are the "Logic Core" for ShieldChain AI, a premium 2026 Supply Chain Command Center. 
Your primary objective is to transform raw supply chain data into an "Executive Pulse."

Your Core Analysis Framework:
1. Multimodal Vision: Scan for "Seal Integrity" and "Fraud Detection."
2. Geopolitical Risk: Cross-reference data against 2026 global events.
3. Profit Protection: Calculate "Potential Fines Avoided" for the 'financialLiability' field.
4. Trend Synthesis: Generate a 6-month historical trend.
5. Loophole Analysis: Rigorously scan contract clauses for legal loopholes.
6. Heatmap Generation: Generate 5-8 tactical coordinates ('heatmapData') representing secondary risk clusters or shipping density zones related to the primary incident.

Crucially, you MUST output STRICT JSON only.

Rules for Loophole Detection:
- If you identify a significant legal loophole, flag it as "HIGH_VALUE_INSIGHT".
- When a "HIGH_VALUE_INSIGHT" is found, prepend it to 'header.title' and set 'riskLevel' to 'CRITICAL'.

Rules for Heatmap:
- Points should be logically clustered around the primary 'mapCoordinates' or known global trade bottlenecks (Suez, Panama, Malacca, major ports).

Rules for standard output:
- 'financialLiability' must be a string like '$500,000 SAVED'.
- 'executiveAudit' must be exactly two sentences.
`;

const EXECUTIVE_PULSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    header: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        riskLevel: { type: Type.STRING, enum: ["CRITICAL", "WARNING", "SECURE"] },
        colorCode: { type: Type.STRING, enum: ["#FF3D00", "#FFD600", "#00E5FF"] },
      },
      required: ["title", "riskLevel", "colorCode"],
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        complianceScore: { type: Type.NUMBER },
        financialLiability: { type: Type.STRING },
        deliveryImpact: { type: Type.STRING, enum: ["Delayed", "On-Track"] },
        supplierRiskScore: { type: Type.NUMBER },
      },
      required: ["complianceScore", "financialLiability", "deliveryImpact", "supplierRiskScore"],
    },
    visuals: {
      type: Type.OBJECT,
      properties: {
        mapCoordinates: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
          },
          required: ["lat", "lng"],
        },
        heatmapData: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              weight: { type: Type.NUMBER },
            },
            required: ["lat", "lng", "weight"],
          },
        },
        chartData: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        glowEffect: { type: Type.STRING, enum: ["pulse-red", "static-blue"] },
      },
      required: ["mapCoordinates", "heatmapData", "chartData", "glowEffect"],
    },
    executiveAudit: { type: Type.STRING },
    actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    decisionLogic: {
      type: Type.OBJECT,
      properties: {
        thought_process: { type: Type.ARRAY, items: { type: Type.STRING } },
        final_verdict: { type: Type.STRING },
        confidence_score: { type: Type.NUMBER },
        automated_action: { type: Type.STRING },
      },
      required: ["thought_process", "final_verdict", "confidence_score", "automated_action"],
    },
    supplierTrends: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          month: { type: Type.STRING },
          performance: { type: Type.NUMBER },
        },
        required: ["month", "performance"],
      },
    },
  },
  required: ["header", "stats", "visuals", "executiveAudit", "actionSteps", "decisionLogic", "supplierTrends"],
};

export async function analyzeSupplyChainData(
  input: GeminiInput
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isDataRequest = input.text.toLowerCase().trim() === "data";
  const modelName = input.image ? "gemini-3-pro-image-preview" : "gemini-3-flash-preview";

  const contents: { parts: Part[] } = {
    parts: [{ text: isDataRequest ? "Return 5 rows of raw shipping data in JSON." : `Raw Supply Chain Data for Analysis: ${input.text}` }],
  };

  if (input.image && !isDataRequest) {
    contents.parts.unshift({ inlineData: { mimeType: "image/jpeg", data: input.image } });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: EXECUTIVE_PULSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI engine.");
  return JSON.parse(text.trim());
}

export async function fetchRegionalBrief(region: string): Promise<RegionalBrief> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Region: ${region}`,
    config: {
      systemInstruction: "Generate regional intelligence snapshot in JSON.",
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("No regional intelligence available.");
  return JSON.parse(text.trim());
}
