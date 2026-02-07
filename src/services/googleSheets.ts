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

        console.log("[API] submitQuestion sending:", data);
        try {
            await fetch(SHEET_API_URL, {
                method: 'POST',
                mode: 'no-cors', // Important: no-cors means we can't read the response, but it sends
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ ...data, action: 'create_question' })
            });
            console.log("[API] submitQuestion sent. (no-cors mode, assuming success)");
            return { result: 'success' };
        } catch (e) {
            console.error("[API] submitQuestion failed:", e);
            throw e;
        }
    },

    async toggleLike(questionId: string, studentId: string) {
        if (!SHEET_API_URL) return { result: 'error', message: 'No API URL' };

        console.log("[API] toggleLike sending:", { questionId, studentId });
        try {
            // Note: In 'no-cors' mode, we cannot read the response JSON.
            // We optimize for fire-and-forget or assume success if no network error.
            // *However*, to get real updates, we usually need 'cors' if the script supports it.
            // Standard simple trigger apps script often requires 'redirect' following or 'text/plain'.
            // For this project's simple setup with 'no-cors', client must assume success.
            await fetch(SHEET_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'toggle_like', questionId, studentId })
            });
            console.log("[API] toggleLike sent.");
            return { result: 'success' };
        } catch (e) {
            console.error("[API] toggleLike failed:", e);
            return { result: 'error', error: e };
        }
    },

    async addComment(questionId: string, studentId: string, name: string, content: string) {
        if (!SHEET_API_URL) return { result: 'error', message: 'No API URL' };

        console.log("[API] addComment sending:", { questionId, studentId, name, content });
        try {
            await fetch(SHEET_API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'add_comment', questionId, studentId, name, content })
            });
            console.log("[API] addComment sent.");
            return { result: 'success' };
        } catch (e) {
            console.error("[API] addComment failed:", e);
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
