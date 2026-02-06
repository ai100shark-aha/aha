const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

export interface SheetQuestion {
    id: string | number;
    studentId: string;
    userDisplayName: string;
    school?: string; // Add School
    userAvatar: string;
    content: string;
    answer?: string;
    likes: number;
    commentsCount: number;
    timestamp: string;
}

export const googleSheetsService = {
    async submitQuestion(data: { name: string; studentId: string; school: string; question: string; answer?: string }) {
        if (!SHEET_API_URL) throw new Error("Google Sheet URL not configured");

        // Use text/plain to avoid CORS preflight (OPTIONS) which GAS doesn't handle
        const response = await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data)
        });
        return response;
    },

    async getQuestions(): Promise<SheetQuestion[]> {
        if (!SHEET_API_URL) return [];

        try {
            const response = await fetch(SHEET_API_URL);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching sheets data:", error);
            return [];
        }
    }
};
