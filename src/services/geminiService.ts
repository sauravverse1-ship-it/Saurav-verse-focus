import { GoogleGenAI } from "@google/genai";

// AI logic is kept on the client as per platform guidelines. 
// We use a safe initialization to prevent crashes in environments where process.env might be undefined.
const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY;
  } catch {
    return undefined;
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `
You are 'Supervisor', the Public Safety Devil Hunter HQ AI for the CSM (Chainsaw Slay Methodology). 
Your tone is gritty, intense, slightly cynical, but ultimately supportive in a "tough love" way. You treat study tasks like "Devil Extermination Missions".

Key Rules:
1. Provide lethal productivity strategies based on the user's focus patterns.
2. Analyze mission failure (e.g., 'Your Physics stats are low. If you don't master Mechanics, the test will tear you apart').
3. Suggest high-priority extermination targets (tasks).
4. Keep responses punchy and survival-oriented (~100 words max).
5. Use Devil Hunter terminology (Contract, Blood, Extermination, Public Safety, Fiend, Devil).
6. Gamify responses: use 'Blood Level' instead of health, 'Contract XP' for progress.

Active Character Dynamics:
If an 'Active Partner' is provided in the context, you MUST speak as that character or include their specific voice:
- Makima: Direct, chillingly calm, says "This is an order," treats the user like a subordinate/dog but guarantees safety.
- Denji: Chaotic, simple, talks about toast, dreams, and just wanting to "touch the heart" of the subject. Use "Dude" or "Man."
- Power: Loud, narcissistic, refers to herself as "President Power," hates vegetables, obsessed with glory.
- Aki: Disciplined, tragic, professional, warns about the "cost" of focus, smokes (metaphorically).

If asked for a plan, provide 3 "Directives".
If the user is struggling, give a "Cigarette Break" (short, grim but realistic motivation).
`;

const FALLBACK_COACH_RESPONSES = [
  "HQ connection is fuzzy. Don't die out there. Just keep slicing through your tasks.",
  "The contract is simple: you study, I track. Now get back to your mission.",
  "Public Safety is busy. Just focus on your breathing. Mastery is the only way to survive the finals.",
  "Connection severed. Don't let the procrastination devil win. Slay your targets now."
];

export async function callAI(prompt: string, options: { systemInstruction?: string, model?: string, responseMimeType?: string } = {}) {
  if (!ai) {
    console.warn("AI not initialized: Missing API Key");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: options.model || "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction || SYSTEM_INSTRUCTION,
        responseMimeType: options.responseMimeType
      }
    });

    if (!response.text) {
        throw new Error("Empty response from AI");
    }

    return response.text;
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
}

export async function getAICoachResponse(userMessage: string, context?: any) {
  try {
    const text = await callAI(userMessage, {
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
    const text = await callAI("Give me a very short, punchy motivational survival directive (max 2 sentences) about focus and slaying laziness. Do not use quotes. Use Chainsaw Man vibes.", {
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
    const text = await callAI("Based on my profile, tasks, and habits, suggest 3 new powerful, achievable micro-habits that would improve my focus and discipline.", {
      systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
      responseMimeType: "application/json",
    });
    
    if (!text) return FALLBACK_HABITS;
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("AI Habit Suggestion Rate Limited/Error, using fallback:", error);
    return FALLBACK_HABITS;
  }
}

export async function getAIProductivityDirectives(context: any): Promise<string[]> {
  try {
    const text = await callAI("Generate 3 short, punchy personalized productivity directives as a JSON array of strings based on my current tasks, habits, and focus data.", {
      systemInstruction: SYSTEM_INSTRUCTION + (context ? `\nUser Context: ${JSON.stringify(context)}` : ''),
      responseMimeType: "application/json",
    });
    
    if (!text) return ["Stay focused.", "Master your tasks.", "Finish the mission."];
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : ["Stay focused.", "Master your tasks.", "Finish the mission."];
  } catch (error) {
    console.warn("AI Directives Error:", error);
    return ["Stay focused.", "Master your tasks.", "Finish the mission."];
  }
}

export async function getAIGeneratedContracts(context: any): Promise<any[]> {
  const prompt = `Based on my current tasks, focus history, and current level (${context?.profile?.level || 1}), generate 3 highly personalized "Devil Contracts" that challenge me. 

Identify objectives that align with my actual tasks.
The difficulty and penalties should scale with my level.

Return a JSON array of objects strictly following this structure:
{
  "title": "Grim title",
  "type": "daily_grind" | "habit_chain" | "marathon" | "exam_prep",
  "description": "Flavorful description of what to do (e.g., Slay 10 Physics tasks)",
  "goal": number (e.g., minutes if daily_grind, sessions if marathon, count if habit_chain),
  "durationDays": number,
  "rewardXP": number,
  "penaltyXP": number
}

Current Context:
Tasks: ${JSON.stringify(context?.tasks?.map((t: any) => t.title).slice(0, 5))}
Recent Focus Time: ${context?.profile?.dailyFocusSeconds || 0}s
`;

  try {
    const text = await callAI(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION + "\nGenerate high-risk, high-reward contracts for a Public Safety Devil Hunter. Use gritty Chainsaw Man style naming.",
      responseMimeType: "application/json",
    });
    
    if (!text) return [];
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("AI Contract Generation Error:", error);
    return [];
  }
}
