import { GoogleGenAI } from "@google/genai";
import { getWorkers, getAttendance } from "./dbService";

// Initialize AI with the provided API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyBriefing = async (): Promise<string> => {
  const workers = getWorkers();
  const attendance = getAttendance();
  const today = new Date().toISOString().split('T')[0];
  
  const presentCount = attendance.filter(a => a.date === today && a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.date === today && a.status === 'ABSENT').length;
  const totalWorkers = workers.length;
  const attendanceRate = totalWorkers > 0 ? Math.round((presentCount / totalWorkers) * 100) : 0;
  
  const prompt = `
    Analyze the daily workforce stats for "White Lotus Corp" and provide an executive summary.
    
    Stats for Today (${today}):
    - Total Workers: ${totalWorkers}
    - Present: ${presentCount}
    - Absent: ${absentCount}
    - Attendance Rate: ${attendanceRate}%

    Instructions:
    - Provide a professional, encouraging, or critical 2-3 sentence summary.
    - Highlight if the attendance rate is excellent (>90%) or needs attention (<70%).
    - Do not use markdown or bullet points, just a paragraph.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate daily briefing at this time.";
  } catch (error) {
    console.error("AI Briefing Error:", error);
    return "AI Service is temporarily unavailable. Please check your connection.";
  }
};

export const sendMessageToAssistant = async (message: string): Promise<string> => {
    const workers = getWorkers();
    const attendance = getAttendance();
    
    // Prepare a lightweight context from the database
    // We limit the attendance history to the last 50 records to keep it relevant and concise
    const context = `
      DATABASE CONTEXT:
      1. WORKERS LIST:
      ${workers.map(w => `- ${w.name} (Role: ${w.role}, Status: ${w.status})`).join('\n')}

      2. RECENT ATTENDANCE LOGS (Last 50 entries):
      ${JSON.stringify(attendance.slice(0, 50).map(a => ({
          worker: a.worker_name,
          date: a.date,
          status: a.status,
          check_in: a.check_in ? a.check_in.split('T')[1].slice(0,5) : 'N/A'
      })))}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: `You are the AI HR Assistant for White Lotus WMS. 
                Your goal is to help the administrator manage the workforce using the provided database context.
                
                Guidelines:
                - Use the provided 'DATABASE CONTEXT' to answer questions about specific workers or attendance trends.
                - If the user asks to draft an email or announcement, use a professional corporate tone.
                - Be concise and direct.
                - If the information is not in the context, state that you don't have that record.
                - Current Date: ${new Date().toLocaleDateString()}
                
                ${context}
                `
            }
        });
        return response.text || "I didn't understand that request.";
    } catch (error) {
        console.error("AI Chat Error:", error);
        return "I am unable to connect to the White Lotus neural network right now.";
    }
}