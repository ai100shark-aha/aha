const SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

export interface Comment {
    studentId: string;
    name: string;
    content: string;
    timestamp: string;
}

export interface SheetQuestion {
    id: string; // Changed to string for UUID
    studentId: string;
    userDisplayName: string;
    school: string; // School restored
    userAvatar: string;
    content: string;
    answer?: string;
    likes: number;
    hasLiked?: boolean; // Client-side state
    comments: Comment[];
    commentsCount: number;
    timestamp: string;
}

export const googleSheetsService = {
    async submitQuestion(data: { name: string; studentId: string; school: string; question: string; answer?: string }) {
        if (!SHEET_API_URL) throw new Error("Google Sheet URL not configured");

        try {
            const response = await fetch(SHEET_API_URL, {
                method: 'POST',
                // mode: 'no-cors', // REMOVED: We need to read the response!
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS requires text/plain to avoid preflight issues sometimes
                body: JSON.stringify({ ...data, action: 'create_question' })
            });

            const result = await response.json();
            return result;
        } catch (e) {
            console.error("❌ [API] submitQuestion FAILED:", e);
            throw e;
        }
    },

    async toggleLike(questionId: string, studentId: string) {
        if (!SHEET_API_URL) return { result: 'error', message: 'No API URL' };

        try {
            const response = await fetch(SHEET_API_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'toggle_like', questionId, studentId })
            });

            const result = await response.json();
            return result;
        } catch (e) {
            console.error("❌ [API] toggleLike FAILED:", e);
            return { result: 'error', error: e };
        }
    },

    async addComment(questionId: string, studentId: string, name: string, content: string) {
        if (!SHEET_API_URL) return { result: 'error', message: 'No API URL' };

        try {
            const response = await fetch(SHEET_API_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'add_comment', questionId, studentId, name, content })
            });

            const result = await response.json();
            return result;
        } catch (e) {
            console.error("❌ [API] addComment FAILED:", e);
            return { result: 'error', error: e };
        }
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
