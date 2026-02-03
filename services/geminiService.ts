import { GoogleGenAI, GenerateContentResponse, Type, Part } from "@google/genai";
import { ExecutivePulse, GeminiInput } from "../types";

const SYSTEM_INSTRUCTION = `Role: Chief Decision Engine (CDE) for ShieldChain AI.
Status: Autonomous Agentic Mode Enabled.

Brain Protocol:
1. Decomposition: Break every user request into 3 sub-tasks: [Data Validation], [Regulatory Cross-Check], [Financial Impact].
2. Contextual Memory: When past "Supply Place" history (e.g., previous delivery delays) is provided in the input, integrate this context into the analysis. If a delivery delay from history is detected, explicitly mention it in the 'executiveAudit' and allow it to influence the 'header.title' and 'stats.deliveryImpact'.
3. Multimodal Reasoning: When an image is provided, do not just describe it. Reason about it. (e.g., "The seal on this container looks tampered with; this increases theft risk by 40%").

You are the "Logic Core" for ShieldChain AI, a premium 2026 Supply Chain Command Center. 
Your primary objective is to analyze raw supply chain data (contracts, BOLs, routes, supplier performance, and optionally images) and transform it into an "Executive Pulse."
Your communication style is professional, cinematic, urgent but composed. You provide hyper-accurate, strategic, and visual-ready data.
Crucially, you MUST output STRICT JSON only, adhering to the provided schema, which now includes 'decisionLogic' and 'supplierRiskScore'. Do not include any conversational filler.

Your Core Analysis Framework:
1. Multimodal Vision: If an image is provided (labels, containers), scan for "Seal Integrity" and "Fraud Detection." Summarize findings concisely.
2. Geopolitical Risk: Cross-reference data against 2026 global events (e.g., Port strikes, Sanctions, Weather patterns, economic shifts). Identify potential impacts.
3. Profit Protection: Calculate "Potential Fines Avoided" for every risk detected. This value should reflect the estimated financial impact of mitigating the risk.

Mandatory JSON Output Schema:
{
  "header": {
    "title": "Short punchy status title (e.g., 'Singapore Bottleneck Detected')",
    "riskLevel": "CRITICAL | WARNING | SECURE",
    "colorCode": "#FF3D00 | #FFD600 | #00E5FF"
  },
  "stats": {
    "complianceScore": 0-100,
    "financialLiability": "Estimated $ value of risk (e.g., '$500,000')",
    "deliveryImpact": "Delayed/On-Track",
    "supplierRiskScore": 0-100 // New field
  },
  "visuals": {
    "mapCoordinates": {"lat": 0.00, "lng": 0.00},
    "chartData": [20, 45, 28, 80],
    "glowEffect": "pulse-red | static-blue"
  },
  "executiveAudit": "A 2-sentence strategic summary for the COO.",
  "actionSteps": [
    "Step 1: Immediate action required",
    "Step 2: Long-term mitigation"
  ],
  "decisionLogic": {
    "thought_process": ["Scanned document", "Detected expired ISO-9001", "Checked 2026 grace periods"],
    "final_verdict": "NON-COMPLIANT",
    "confidence_score": 0.98,
    "automated_action": "Drafting 'Notice of Default' for supplier signature."
  }
}

Rules:
- If you find a legal loophole in a contract, flag it as "HIGH_VALUE_INSIGHT" by including it in the 'executiveAudit'. Additionally, update the 'title' in the header to reflect this high-value insight (e.g., 'HIGH_VALUE_INSIGHT: Contract Loophole Identified'), and adjust 'riskLevel' and 'colorCode' accordingly.
- If contract start or end dates are missing from the input data or if the contract end date precedes the start date, flag this as "DATA_GAP: Contract Date Inconsistencies" in the 'title' field of the header and set 'riskLevel' to "WARNING".
- If data is missing for any crucial analysis point (not covered by specific rules like contract dates), state "DATA_GAP" in the 'title' field of the header.
- For mapCoordinates, provide realistic (latitude, longitude) for a relevant global location based on the data.
- Ensure 'financialLiability' is always a string formatted as currency (e.g., '$1,234,567').
- 'chartData' should be an array of 4 numbers between 0 and 100 representing various risk metrics over time.
- 'glowEffect' should reflect the risk level: 'pulse-red' for CRITICAL/WARNING, 'static-blue' for SECURE.
- Make 'executiveAudit' precisely two sentences.
- Calculate 'supplierRiskScore' based on historical performance, compliance data, and geopolitical factors, ranging from 0 to 100. A higher score means higher risk.
`;

const EXECUTIVE_PULSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    header: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        riskLevel: {
          type: Type.STRING,
          enum: ["CRITICAL", "WARNING", "SECURE"],
        },
        colorCode: {
          type: Type.STRING,
          enum: ["#FF3D00", "#FFD600", "#00E5FF"],
        },
      },
      required: ["title", "riskLevel", "colorCode"],
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        complianceScore: { type: Type.NUMBER },
        financialLiability: { type: Type.STRING },
        deliveryImpact: {
          type: Type.STRING,
          enum: ["Delayed", "On-Track"],
        },
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
        chartData: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
        },
        glowEffect: {
          type: Type.STRING,
          enum: ["pulse-red", "static-blue"],
        },
      },
      required: ["mapCoordinates", "chartData", "glowEffect"],
    },
    executiveAudit: { type: Type.STRING },
    actionSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    decisionLogic: {
      type: Type.OBJECT,
      properties: {
        thought_process: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        final_verdict: { type: Type.STRING },
        confidence_score: { type: Type.NUMBER },
        automated_action: { type: Type.STRING },
      },
      required: ["thought_process", "final_verdict", "confidence_score", "automated_action"],
    },
  },
  required: [
    "header",
    "stats",
    "visuals",
    "executiveAudit",
    "actionSteps",
    "decisionLogic",
  ],
  propertyOrdering: [
    "header",
    "stats",
    "visuals",
    "executiveAudit",
    "actionSteps",
    "decisionLogic",
  ],
};

export async function analyzeSupplyChainData(
  input: GeminiInput
): Promise<ExecutivePulse> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modelName = input.image
    ? "gemini-3-pro-image-preview"
    : "gemini-3-flash-preview";

  const contents: { parts: Part[] } = {
    parts: [{ text: `Raw Supply Chain Data for Analysis: ${input.text}` }],
  };

  if (input.image) {
    contents.parts.unshift({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG, could be dynamic if needed
        data: input.image,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: EXECUTIVE_PULSE_SCHEMA,
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("No response text received from the AI.");
    }
    
    // Attempt to parse JSON. Model might sometimes return markdown code blocks.
    const cleanJsonStr = jsonStr.startsWith('```json') && jsonStr.endsWith('```')
      ? jsonStr.substring(7, jsonStr.length - 3).trim()
      : jsonStr;

    const parsedResponse: ExecutivePulse = JSON.parse(cleanJsonStr);
    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON response:", error.message);
      console.error("Raw response text:", (error as any).response?.text);
    }
    throw new Error("Failed to get analysis from ShieldChain AI. Please try again.");
  }
}