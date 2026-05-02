import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI(process.env.GOOGLE_GENAI_API_KEY || '');

export const extractTaskDetails = async (input: string) => {
  const systemInstruction = `Role: You are a specialized Workflow & Task Orchestration Engine. Your purpose is to ingest unstructured team communication and transform it into a structured task schema for a project management dashboard.
Task:
Categorize Work: Assign the input to a workflow type (e.g., Task Creation, Status Update, Blocker, Meeting Request).
Determine Visibility: Identify who needs to see this (Assignee, Department, or Stakeholders).
Calculate Priority: Use a matrix of deadlines and sentiment to assign priority (Low, Medium, High, Urgent).
Map Dependencies: Identify if this task relies on another person or a previous action.
Strict Operational Rules:
Zero Assumption: Do not invent deadlines. If no date is mentioned, return null for due_date.
Dependency Mapping: Only link tasks if explicit "waiting on" or "after" language is used.
Output Format: Return ONLY a JSON object. No prose.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: input,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          priority: { type: Type.STRING },
          visibility: { type: Type.ARRAY, items: { type: Type.STRING } },
          details: {
            type: Type.OBJECT,
            properties: {
              task_name: { type: Type.STRING },
              due_date: { type: Type.STRING, nullable: true },
              dependency: { type: Type.STRING, nullable: true },
              assignee: { type: Type.STRING, nullable: true },
              change_request: { type: Type.STRING, nullable: true },
              status: { type: Type.STRING, nullable: true }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error('No response from AI');
  }

  return JSON.parse(response.text);
};

export const generateExecutionSummary = async (stage1Output: any) => {
  const systemInstruction = `Role: You are a precise Workflow Communication Engine. Your task is to take structured JSON data from a task extraction engine and generate a controlled, professional confirmation and a system execution summary.
Task:
Generate Response: Write a concise notification for the team channel/user.
Assign System Flags: Determine if an automated calendar invite or notification needs to be sent.
Draft Log: Create a one-sentence summary for the internal audit log.
Strict Operational Rules:
No Hallucination: Use ONLY the data provided in the JSON input. If due_date is null, do not mention a deadline.
Tone: Professional, supportive, and clarity-driven.
Format: Output ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: JSON.stringify(stage1Output),
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          user_notification: { type: Type.STRING },
          system_action: { type: Type.ARRAY, items: { type: Type.STRING } },
          audit_summary: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error('No response from AI');
  }

  return JSON.parse(response.text);
};
