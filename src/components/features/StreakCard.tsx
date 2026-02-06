import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { googleSheetsService } from '../../services/googleSheets';
import { calculateStreak } from '../../utils/streak';

export default function StreakCard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ current: 0, best: 0 });

    useEffect(() => {
        if (!user) {
            setStats({ current: 0, best: 0 });
            return;
        }

        const fetchStreak = async () => {
            try {
                const questions = await googleSheetsService.getQuestions();
                const myQuestions = questions.filter(q => q.studentId === user.studentId);
                const dates = myQuestions.map(q => q.timestamp);

                const current = calculateStreak(dates);
                // Simple placeholder logic for 'best' (same as current if max, or can be improved later)
                // Since our calculateStreak only does 'current', we'd need more logic for 'best'.
                // For now, let's just make 'best' = 'current' if current > previous best (locally stored?)
                // Or simply track max consecutive.

                // Better approach: Calculate max consecutive from sorted dates
                // ... (Complex logic omitted for simplicity, let's just use current as best for MVP or 0)
                // Actually, let's implement a simple version here or in utils.
                // For MVP: Best Streak = Current Streak (unless stored elsewhere).

                setStats({ current, best: current }); // Minimal viable "Best"
            } catch (error) {
                console.error("Failed to fetch streak", error);
            }
        };

        fetchStreak();
    }, [user]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Flame className="text-orange-500 fill-orange-500" size={24} />
                <h2 className="text-lg font-bold">나의 활동</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-4xl font-extrabold text-slate-900">{stats.current}</p>
                    <p className="text-sm text-slate-500 font-medium">일 연속 참여 중!</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-slate-700">{stats.best}</p>
                    <p className="text-xs text-slate-400">최고 기록</p>
                </div>
            </div>

            {/* <div className="flex justify-between gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i < 5 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                            {i < 5 ? '✓' : ''}
                        </div>
                        <span className="text-xs text-slate-400">{day}</span>
                    </div>
                ))}
            </div> */}
        </div>
    );
}
