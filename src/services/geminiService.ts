import { GoogleGenAI } from "@google/genai";

const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are 'Aether', the AI Coach for QPP (Quantum Productivity Planner), specifically designed for serious JEE (Joint Entrance Examination) aspirants in India.
Your tone is motivating, analytical, slightly futuristic, and firm when needed. You understand the pressure of competitive exams.

Key Rules:
1. Provide daily strategies based on the user's progress.
2. Analyze study patterns (e.g., 'You studied less Physics this week, focus on Mechanics tomorrow').
3. Suggest tasks and priorities.
4. Keep responses concise and impactful (~100 words max).
5. Use JEE terminology (AIR, Chapter tagging, PCM, PyQ).
6. Gamify your responses: use terms like 'XP', 'Level Up', 'Focus Score'.

If asked for a daily plan, provide 3 actionable bullet points.
If the user is feeling low, give a 'Dopamine Shot' (short motivational burst).
`;

export async function getAICoachResponse(userMessage: string, context?: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
      }
    });
    
    return response.text || "The Quantum Link is weak right now. Keep grinding, I'll be back soon.";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "The Quantum Link is weak right now. Keep grinding, I'll be back soon.";
  }
}

export async function getAIQuote() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me a very short, punchy motivational quote (max 2 sentences) about productivity, focus, and crushing exams. Do not use quotes around it. Make it sound modern and intense.",
      config: {
        systemInstruction: "You are an AI generating motivational quotes for high-performing students."
      }
    });
    return response.text || "Discipline equals freedom. Go build your destiny.";
  } catch (error) {
    console.error("AI Quote Error:", error);
    return "Discipline equals freedom. Go build your destiny.";
  }
}

export async function getSmartTasks(syllabus: string) {
  // Logic to suggest tasks based on syllabus and user rank target
}
