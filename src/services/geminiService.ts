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

const FALLBACK_COACH_RESPONSES = [
  "Quantum systems are under maintenance. Focus on your PyQs for now. Consistency is the only path to the AIR you want.",
  "The AI core is recharging. I've analyzed your intent: keep grinding on those Mechanics problems. Intensity wins.",
  "Connection to Aether is fluxing. Standby and maintain focus. Remember: Chemistry is where you'll score easy marks if you memorize the inorganic reactions.",
  "System offline. Real-world study mode engaged. Take a 5-minute break then finish your Physics target. I'll be back online shortly."
];

export async function getAICoachResponse(userMessage: string, context?: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
      }
    });
    
    return response.text || FALLBACK_COACH_RESPONSES[Math.floor(Math.random() * FALLBACK_COACH_RESPONSES.length)];
  } catch (error) {
    console.warn("AI Coach Rate Limited/Error, using fallback:", error);
    return FALLBACK_COACH_RESPONSES[Math.floor(Math.random() * FALLBACK_COACH_RESPONSES.length)];
  }
}

const FALLBACK_QUOTES = [
  "Discipline equals freedom. Go build your destiny.",
  "Your potential is a limited resource. Stop wasting it.",
  "The grind doesn't lie. Results are coming.",
  "Focus is the master key. Unlock your greatness.",
  "Don't stop when you're tired. Stop when you're done.",
  "Excellence is not an act, but a habit. Keep at it.",
  "Precision beats power. Consistency beats intensity.",
  "Obsession is the motor of genius. Stay locked in.",
  "Your future self is watching. Don't let them down.",
  "Pressure creates diamonds. Embrace the squeeze."
];

const FALLBACK_HABITS = [
  { title: "Deep Focus Block", icon: "Brain", description: "Set a 50-minute timer and hide your phone." },
  { title: "Hydration Sync", icon: "Droplets", description: "Drink 500ml water before every study session." },
  { title: "Review Pulse", icon: "BookOpen", description: "Quickly review previous day's notes for 10 minutes." }
];

export async function getAIQuote() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Give me a very short, punchy motivational quote (max 2 sentences) about productivity, focus, and crushing exams. Do not use quotes around it. Make it sound modern and intense.",
      config: {
        systemInstruction: "You are an AI generating motivational quotes for high-performing students."
      }
    });
    return response.text || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  } catch (error) {
    console.warn("AI Quote Rate Limited/Error, using fallback:", error);
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}

export async function getAIHabitSuggestions(context: any): Promise<{title: string, icon: string, description: string}[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Based on my profile, tasks, and habits, suggest 3 new powerful, achievable micro-habits that would improve my focus and discipline. Return ONLY a valid JSON array of objects with keys: 'title', 'icon' (a lucide-react icon name like 'Zap', 'Brain', 'BookOpen'), and 'description'.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
        responseMimeType: "application/json",
      }
    });
    
    if (!response.text) return FALLBACK_HABITS;
    return JSON.parse(response.text);
  } catch (error) {
    console.warn("AI Habit Suggestion Rate Limited/Error, using fallback:", error);
    return FALLBACK_HABITS;
  }
}
