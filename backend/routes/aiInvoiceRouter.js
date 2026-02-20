import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const aiInvoiceRouter = express.Router();
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(" GEMINI_API_KEY not found in .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0",
];

// prompt

function buildInvoicePrompt(userText) {
  const schema = {
    issueDate: "YYYY-MM-DD",
    dueDate: "YYYY-MM-DD",
    fromBusinessName: "",
    fromEmail: "",
    fromAddress: "",
    fromPhone: "",
    fromGst: "",
    client: {
      name: "",
      email: "",
      address: "",
      phone: "",
    },
    items: [
      {
        description: "",
        qty: 1,
        unitPrice: 0,
      },
    ],
    taxPercent: 18,
    currency: "INR",
    status: "draft",
    notes: "",
  };

  return `
You are an invoice JSON generator.

Rules:
- Output ONLY valid JSON (no markdown, no explanation).
- JSON must EXACTLY match the schema.
- Dates must be "YYYY-MM-DD".
- qty and unitPrice must be numbers.

Schema:
${JSON.stringify(schema, null, 2)}

User input:
${userText}
`;
}

// modal call

async function tryGenerate(model, prompt) {
  const res = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const text =
    res?.text ||
    res?.output?.[0]?.content?.[0]?.text ||
    res?.outputs?.[0]?.text;

  if (!text || !text.trim()) {
    throw new Error("Empty AI response");
  }

  return { text: text.trim(), model };
}
// route
aiInvoiceRouter.post("/generate", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key missing",
      });
    }

    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt text required",
      });
    }

    const fullPrompt = buildInvoicePrompt(prompt);

    let lastError = null;
    let aiText = null;
    let usedModel = null;

    for (const model of MODEL_CANDIDATES) {
      try {
        const { text, model: m } = await tryGenerate(model, fullPrompt);
        aiText = text;
        usedModel = m;
        break;
      } catch (err) {
        lastError = err;
        console.warn(` ${model} failed`, err.message);
      }
    }

    if (!aiText) {
      return res.status(502).json({
        success: false,
        message: "All AI models failed",
        detail: lastError?.message,
      });
    }


    // extract json
    const start = aiText.indexOf("{");
    const end = aiText.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(502).json({
        success: false,
        message: "AI response is not JSON",
        raw: aiText,
      });
    }

    let data;
    try {
      data = JSON.parse(aiText.slice(start, end + 1));
    } catch (err) {
      return res.status(502).json({
        success: false,
        message: "Invalid JSON from AI",
        raw: aiText,
      });
    }

    return res.status(200).json({
      success: true,
      model: usedModel,
      data,
    });
  } catch (err) {
    console.error("AI Invoice Error:", err);
    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      detail: err.message,
    });
  }
});

export default aiInvoiceRouter;
