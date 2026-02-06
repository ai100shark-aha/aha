import { Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StreakCard() {
    const { user } = useAuth();

    // In Sheets mode, real personal streak calculation is hard without fetching all data.
    // For now, we'll show a "Active" status or placeholder if logged in.
    const currentStreak = user ? 1 : 0;
    const bestStreak = user ? 1 : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Flame className="text-orange-500 fill-orange-500" size={24} />
                <h2 className="text-lg font-bold">나의 활동</h2>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-4xl font-extrabold text-slate-900">{currentStreak}</p>
                    <p className="text-sm text-slate-500 font-medium">일째 참여 중!</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-slate-700">{bestStreak}</p>
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
