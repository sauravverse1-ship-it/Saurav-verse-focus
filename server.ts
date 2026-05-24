import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/test-key", (req, res) => {
    res.json({ key: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "none" });
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, responseMimeType, model, customApiKey } = req.body;
      
      const key = customApiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        console.warn("GEMINI_API_KEY is not configured on the server.");
        return res.status(400).json({ error: "GEMINI_API_KEY is not configured on this container. Please verify your settings or provide an API key." });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Default to gemini-3.5-flash as the main high-performance text model
      // Maps deprecated gemini-1.5-flash, gemini-2.0-flash, or empty to gemini-3.5-flash
      let modelToUse = model || "gemini-3.5-flash";
      if (modelToUse.includes("gemini-1.5") || modelToUse === "gemini-2.0-flash") {
        modelToUse = "gemini-3.5-flash";
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: modelToUse,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType,
          }
        });
      } catch (genErr) {
        console.warn(`Primary generation with ${modelToUse} failed, attempting fallback to gemini-2.5-flash...`, genErr);
        if (modelToUse !== "gemini-2.5-flash") {
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType,
            }
          });
        } else {
          throw genErr;
        }
      }

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Server-side Gemini generation failed:", err);
      res.status(500).json({ error: err.message || "Unknown error during generation" });
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", async (clientWs, req) => {
    console.log("WebSocket client connected");
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const customKey = url.searchParams.get("key");
      const key = customKey || process.env.GEMINI_API_KEY;

      if (!key) {
        clientWs.send(JSON.stringify({ error: "No API Key provided" }));
        clientWs.close();
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const p of parts) {
                if (p.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: p.inlineData.data }));
                }
                if (p.text) {
                  clientWs.send(JSON.stringify({ textOutput: p.text }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
            if (message.serverContent?.turnComplete) {
              console.log("Turn complete");
            }
          },
          onclose: () => {
             console.log("Live API closed");
             clientWs.close();
          },
          onerror: (err) => {
            console.error("Gemini Live API Error:", err);
            clientWs.send(JSON.stringify({ error: err.message }));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are Jarvis, a highly advanced, capable, and polite AI assistant. You help the user manage tasks, habits, stats, exams, and any general knowledge query. Speak concisely and naturally.",
        },
      });

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.setup) {
            session.sendRealtimeInput({ text: `System context update: ${msg.setup}` });
          }
          if (msg.textMessage) {
            session.sendRealtimeInput({ text: msg.textMessage });
          }
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Error parsing or sending audio/text:", e);
        }
      });

      clientWs.on("close", () => {
        // Unfortunately standard close not always well-defined, wait until onclose if applicable.
      });

    } catch (e: any) {
      console.error("Failed to connect wss to gemini:", e);
      clientWs.send(JSON.stringify({ error: "Failed to connect: " + e.message }));
      clientWs.close();
    }
  });
}

startServer();
