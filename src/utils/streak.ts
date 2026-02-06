
/**
 * Calculates the current streak from a list of dates.
 * A streak is defined as consecutive days ending today or yesterday.
 * @param dates List of Date objects or date strings
 * @returns number of consecutive days
 */
export function calculateStreak(dates: (Date | string)[]): number {
    if (!dates.length) return 0;

    // 1. Normalize dates to YYYY-MM-DD strings to ignore time
    const uniqueDates = Array.from(new Set(dates.map(d => {
        const dateObj = new Date(d);
        return dateObj.toISOString().split('T')[0];
    }))).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // 2. Check if the most recent activity is today or yesterday
    // If the user hasn't posted since day-before-yesterday, streak is 0.
    const lastActivity = uniqueDates[0];
    if (lastActivity !== today && lastActivity !== yesterday) {
        return 0;
    }

    // 3. Count consecutive days
    let streak = 1;
    let currentDateStr = lastActivity;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDateStr = uniqueDates[i];

        // Calculate expected previous date
        const current = new Date(currentDateStr);
        const expectedPrev = new Date(current);
        expectedPrev.setDate(expectedPrev.getDate() - 1);
        const expectedPrevStr = expectedPrev.toISOString().split('T')[0];

        if (prevDateStr === expectedPrevStr) {
            streak++;
            currentDateStr = prevDateStr;
        } else {
            break; // Gap found, streak ends
        }
    }

    return streak;
}
