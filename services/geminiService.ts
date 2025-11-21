import { GoogleGenAI, Type } from "@google/genai";
import { GeminiCommandResponse } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("No API Key found in environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const interpretCommand = async (text: string): Promise<GeminiCommandResponse | null> => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User command: "${text}".
            
            Current context: The user is in a building with 10 floors (0-10). 0 is Ground/Lobby.
            
            Task: Extract the source floor and destination floor from the user's intent.
            If the user says "I'm on floor X going to Y", extract both.
            If the user says "Take me to floor Y", assume source is unknown (or handle in UI) or just return destination.
            
            Return JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sourceFloor: { type: Type.INTEGER, description: "The floor the user is currently on. -1 if unknown." },
                        destinationFloor: { type: Type.INTEGER, description: "The floor the user wants to go to." },
                        intent: { type: Type.STRING, enum: ["call_elevator", "check_status", "unknown"] }
                    },
                    required: ["intent"]
                }
            }
        });

        const rawText = response.text;
        if (!rawText) return null;
        
        return JSON.parse(rawText) as GeminiCommandResponse;
    } catch (error) {
        console.error("Gemini parsing error:", error);
        return null;
    }
};
