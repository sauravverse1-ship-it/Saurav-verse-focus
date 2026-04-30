import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      console.error("CRITICAL: GEMINI_API_KEY is not defined in the environment.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  };

  app.get("/api/test-key", (req, res) => {
    res.json({ key: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "none" });
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, model = "gemini-2.5-flash", responseMimeType } = req.body;
      
      const ai = getAI();
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
      }

      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
        if (responseMimeType === "application/json") {
            config.responseSchema = {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        icon: { type: "string" },
                        description: { type: "string" }
                    },
                    required: ["title", "icon", "description"]
                }
            };
        }
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined
      });
      
      if (!response || !response.text) {
          throw new Error("Empty response from AI");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Proxy Error details:", error);
      res.status(500).json({ error: error.message || "Internal AI Proxy Error" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
