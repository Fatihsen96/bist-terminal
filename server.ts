import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Stock Analysis endpoint
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { symbol, name, market, currentPrice, peRatio, sector, userQuestion } = req.body;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      const ai = getGenAI();

      const prompt = `You are an elite quantitative analyst and chief equity strategist at MarketTerminal.
Analyze the following asset and provide institutional insights:
Asset: ${symbol} (${name || symbol})
Market: ${market || "Equities"}
Sector: ${sector || "General"}
Current Price: ${currentPrice || "N/A"}
P/E Ratio: ${peRatio || "N/A"}
User specific question / context: ${userQuestion || "Provide a comprehensive 3-bullet investment thesis, key risk factors, and valuation health score justification."}

Return a JSON object matching this schema strictly:
{
  "investmentThesis": "Detailed 2-3 sentence strategic rationale",
  "valueScore": 88, // integer 0-100
  "signal": "STRONG BUY" | "BUY" | "WAIT" | "OVERVALUED" | "SELL",
  "upsidePercentage": 24.5, // float estimated 12-month upside
  "healthBreakdown": {
    "profit": 85, // 0-100
    "debt": 30,   // 0-100 (lower debt means healthier)
    "value": 82,  // 0-100
    "flow": 90,   // 0-100
    "momentum": 78, // 0-100
    "sentiment": 85 // 0-100
  },
  "keyCatalysts": ["Catalyst 1", "Catalyst 2", "Catalyst 3"],
  "riskFactors": ["Risk 1", "Risk 2"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      res.json({
        success: true,
        symbol,
        analysis: parsedData,
      });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to generate AI analysis",
      });
    }
  });

  // AI Chat Assistant endpoint for Terminal ask
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, activeSymbol, marketContext } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGenAI();

      const systemInstruction = `You are MarketTerminal AI, a senior Wall Street & Borsa İstanbul algorithmic trading bot and valuation strategist.
Answer concisely in a technical, crisp, highly analytical tone.
Highlight price targets, valuation metrics (EV/EBITDA, P/E, FCF yield), macro drivers, technical indicators (RSI, MACD, Volume Profile), and actionable signal recommendations.
If asked in Turkish, respond in clear professional Turkish financial terminology.`;

      const prompt = `Active Context: Asset=${activeSymbol || "None Selected"}, Market=${marketContext || "Global"}.
User Question: ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({
        success: true,
        reply: response.text,
      });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to generate AI chat response",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
