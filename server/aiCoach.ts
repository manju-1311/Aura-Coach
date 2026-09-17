import { GoogleGenAI } from '@google/genai';
import { AICoachAdvice, UserProfile, TaskItem } from '../src/types.js';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Gemini AI initialization failed:', e);
    }
  }
  return genAIClient;
}

export async function generateAICoachAdvice(
  user: UserProfile,
  tasks: TaskItem[],
  currentScreenTime: number,
  timeOfDayHours: number = new Date().getHours()
): Promise<AICoachAdvice> {
  const client = getAIClient();

  // Determine current energy profile based on research report (peak focus 9AM-12PM)
  const isMorningPeak = timeOfDayHours >= 8 && timeOfDayHours <= 12;
  const isAfternoonSlump = timeOfDayHours > 12 && timeOfDayHours < 16;
  const energyLevel: 'high' | 'medium' | 'low' = isMorningPeak ? 'high' : isAfternoonSlump ? 'medium' : 'high';

  if (client) {
    try {
      const activeTasksStr = tasks
        .filter((t) => t.status !== 'completed')
        .map((t) => `- ${t.title} (${t.durationMinutes} min, [${t.tag}])`)
        .join('\n');

      const prompt = `You are "Aura Coach", an empathetic, supportive, and scientifically grounded AI academic and productivity coach for college students and aspirants.
The student profile:
- Name: ${user.name}
- Goal / Milestone: ${user.targetMilestone}
- Streak: ${user.streakDays} days
- Social Screen Time Today: ${currentScreenTime} / ${user.dailySocialBudgetMinutes} min
- AI Proactivity Level: ${user.aiProactivity}
- Current Time: ${timeOfDayHours}:00 (Energy status: ${energyLevel})
- Pending Tasks:
${activeTasksStr || 'No pending tasks yet.'}

Guiding Product Principle: "Empowerment over Punishment". No punitive guilt trips or aggressive shaming. Provide dynamic energy-level planning, actionable bite-sized advice, and psychological encouragement.
Respond strictly in JSON matching this exact schema:
{
  "headline": "Short punchy observation (under 8 words)",
  "body": "Empathetic, clear coaching guidance (1-2 sentences max)",
  "actionableStep": "One immediate micro-step to take right now (under 12 words)"
}`;

      let responseText = '';
      // Prioritize high-availability, low-latency gemini-3.6-flash with fallback to gemini-3.8-flash
      const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash'];

      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });
          responseText = response.text?.trim() || '';
          if (responseText) break;
        } catch (_modelErr: any) {
          // Model temporarily busy or unavailable (e.g. 503 high demand spike); seamlessly advance to next candidate
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (responseText) {
        // Clean markdown codeblocks if present
        const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanedJson);

        return {
          headline: parsed.headline || 'High Focus Window Detected',
          body: parsed.body || 'Tackle your hardest programming topic before 1:00 PM for maximum retention.',
          actionableStep: parsed.actionableStep || 'Start a 25-minute Pomodoro sprint on your top priority task.',
          energyLevel,
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (_err: any) {
      // Gracefully fall through to empathetic heuristic guidance
    }
  }

  // Empathetic heuristic advice calibrated directly to the Research Report findings
  if (currentScreenTime >= user.dailySocialBudgetMinutes) {
    return {
      headline: 'Social Limit Reached • Reset Your State',
      body: `You've enjoyed your ${user.dailySocialBudgetMinutes}m social media budget. Reclaim cognitive momentum with a 5-minute breather or micro-task!`,
      actionableStep: 'Complete 1 quick micro-task to unlock 15 bonus minutes guilt-free.',
      energyLevel: 'medium',
      generatedAt: new Date().toISOString(),
    };
  }

  if (isMorningPeak) {
    return {
      headline: 'High Focus Energy Detected',
      body: 'Your cognitive peak is active. Tackle your highest priority academic milestone before 1:00 PM.',
      actionableStep: 'Start your 45-minute deep work session with dynamic programming trees.',
      energyLevel: 'high',
      generatedAt: new Date().toISOString(),
    };
  } else if (isAfternoonSlump) {
    return {
      headline: 'Afternoon Slump Defense',
      body: 'Survey data shows post-lunch distraction spikes on Instagram. Switch to low-friction flashcards or a short sprint.',
      actionableStep: 'Take a 5-minute breathwork break, then review 5 quick flashcards.',
      energyLevel: 'medium',
      generatedAt: new Date().toISOString(),
    };
  } else {
    return {
      headline: 'Evening Review & Wind Down',
      body: 'Protect sleep hygiene and lock in today’s progress. Consolidate notes and prepare tomorrow’s top 3 priorities.',
      actionableStep: 'Mark completed tasks and celebrate keeping your 4-day streak alive!',
      energyLevel: 'high',
      generatedAt: new Date().toISOString(),
    };
  }
}
