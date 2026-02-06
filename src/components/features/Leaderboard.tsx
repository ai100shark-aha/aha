import { useState, useEffect } from 'react';
import { Trophy, Flame, Star } from 'lucide-react';
import { googleSheetsService } from '../../services/googleSheets';
import { calculateStreak } from '../../utils/streak';

type Tab = 'streak' | 'quality';

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState<Tab>('streak');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const questions = await googleSheetsService.getQuestions();

            // Calculate stats locally from questions
            const userStats: Record<string, {
                name: string,
                streak: number,
                totalAha: number,
                avatar: string,
                lastPost: string,
                dates: string[]
            }> = {};

            questions.forEach(q => {
                const key = q.studentId;
                if (!userStats[key]) {
                    userStats[key] = {
                        name: q.userDisplayName,
                        streak: 0,
                        totalAha: 0,
                        avatar: q.userAvatar,
                        lastPost: '',
                        dates: [] // Store dates to calculate streak
                    };
                }

                userStats[key].dates.push(q.timestamp);

                // Simple calculation: 
                // totalAha = question count (mock logic since we don't have real likes DB)
                // streak = question count (mock logic)
                userStats[key].totalAha += 1;
                // Streak will be calculated after collecting all dates
            });

            // Convert to array and calculate streak
            const sortedUsers = Object.values(userStats).map(stat => {
                const calculatedStreak = calculateStreak(stat.dates);
                return {
                    name: stat.name,
                    value: activeTab === 'streak' ? `${calculatedStreak}일 연속` : `${stat.totalAha}점`,
                    rawScore: activeTab === 'streak' ? calculatedStreak : stat.totalAha,
                    avatar: stat.avatar
                };
            })
                .sort((a, b) => b.rawScore - a.rawScore)
                .slice(0, 5)
                .map((u, i) => ({ ...u, rank: i + 1 }));

            setUsers(sortedUsers);
            setLoading(false);
        };

        fetchLeaderboard();
    }, [activeTab]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-2">
                <button
                    onClick={() => setActiveTab('streak')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'streak'
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Flame size={16} /> 참여 랭킹
                </button>
                <button
                    onClick={() => setActiveTab('quality')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'quality'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Star size={16} /> 질문 왕
                </button>
            </div>

            <div className="p-2">
                {loading ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        랭킹 계산 중...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        데이터가 없습니다.
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.rank} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${user.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                user.rank === 2 ? 'bg-slate-100 text-slate-600' :
                                    user.rank === 3 ? 'bg-orange-100 text-orange-600' :
                                        'text-slate-400 text-sm'
                                }`}>
                                {user.rank <= 3 ? <Trophy size={14} /> : user.rank}
                            </div>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full bg-slate-100"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                            </div>
                            <p className={`text-sm font-bold ${activeTab === 'streak' ? 'text-orange-500' : 'text-primary-600'}`}>
                                {user.value}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
