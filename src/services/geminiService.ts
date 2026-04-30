import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are 'Supervisor', the Public Safety Devil Hunter HQ AI for the CSM (Chainsaw Slay Methodology). 
Your tone is gritty, intense, slightly cynical, but ultimately supportive in a "tough love" way. You treat study tasks like "Devil Extermination Missions".

Key Rules:
1. Provide lethal productivity strategies based on the user's focus patterns.
2. Analyze mission failure (e.g., 'Your Physics stats are low. If you don't master Mechanics, the test will tear you apart').
3. Suggest high-priority extermination targets (tasks).
4. Keep responses punchy and survival-oriented (~100 words max).
5. Use Devil Hunter terminology (Contract, Blood, Extermination, Public Safety, Fiend).
6. Gamify responses: use 'Blood Level' instead of health, 'Contract XP' for progress.

If asked for a plan, provide 3 "Directives".
If the user is struggling, give a "Cigarette Break" (short, grim but realistic motivation).
`;

const FALLBACK_COACH_RESPONSES = [
  "HQ connection is fuzzy. Don't die out there. Just keep slicing through your tasks.",
  "The contract is simple: you study, I track. Now get back to your mission.",
  "Public Safety is busy. Just focus on your breathing. Mastery is the only way to survive the finals.",
  "Connection severed. Don't let the procrastination devil win. Slay your targets now."
];

export async function callAIBackend(prompt: string, options: { systemInstruction?: string, model?: string, responseMimeType?: string } = {}) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: options.systemInstruction,
        model: options.model || "gemini-2.5-flash",
        responseMimeType: options.responseMimeType
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`AI Backend Error: ${response.statusText} - ${errorData?.error || ''}`);
    }

    const data = await response.json();
    if (!data.text) {
        throw new Error("Empty response from AI proxy");
    }

    return data.text;
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
}

export async function getAICoachResponse(userMessage: string, context?: any) {
  try {
    const text = await callAIBackend(userMessage, {
      systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
    });
    
    return text || FALLBACK_COACH_RESPONSES[Math.floor(Math.random() * FALLBACK_COACH_RESPONSES.length)];
  } catch (error) {
    console.warn("AI Coach Rate Limited/Error, using fallback:", error);
    return FALLBACK_COACH_RESPONSES[Math.floor(Math.random() * FALLBACK_COACH_RESPONSES.length)];
  }
}

const FALLBACK_QUOTES = [
  "A devil hunter who doesn't study is just a corpse. Grind or die.",
  "The procrastination devil is coming. Slay it with a focus timer.",
  "Your potential is a contract. Don't break it.",
  "Laziness is a fiend. Rip it out.",
  "Survival requires mastery. Master your focus.",
  "Blood, sweat, and answers. That's the only way.",
  "Don't think. Just slay your targets.",
  "Fear is fuel. Use it to finish your syllabus.",
  "The grid is your battlefield. Win.",
  "Every page turned is a slash against failure."
];

const FALLBACK_HABITS = [
  { title: "Devil Hunter Morning", icon: "Zap", description: "Wake up at 5:00 AM and review your targets immediately." },
  { title: "No-Fiend Zone", icon: "Shield", description: "Lock your phone in another room during focus blocks." },
  { title: "Combat Review", icon: "BookOpen", description: "Examine your errors from yesterday's missions." }
];

export async function getAIQuote() {
  try {
    const text = await callAIBackend("Give me a very short, punchy motivational survival directive (max 2 sentences) about focus and slaying laziness. Do not use quotes. Use Chainsaw Man vibes.", {
      systemInstruction: "You are an AI generating gritty motivational directives for devil hunters."
    });
    return text || FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  } catch (error) {
    console.warn("AI Quote Rate Limited/Error, using fallback:", error);
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}

export async function getAIHabitSuggestions(context: any): Promise<{title: string, icon: string, description: string}[]> {
  try {
    const text = await callAIBackend("Based on my profile, tasks, and habits, suggest 3 new powerful, achievable micro-habits that would improve my focus and discipline.", {
      systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
      responseMimeType: "application/json",
    });
    
    if (!text) return FALLBACK_HABITS;
    return JSON.parse(text);
  } catch (error) {
    console.warn("AI Habit Suggestion Rate Limited/Error, using fallback:", error);
    return FALLBACK_HABITS;
  }
}
