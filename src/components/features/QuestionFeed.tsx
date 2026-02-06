import { useState, useEffect } from 'react';
import { MessageCircle, Heart, CheckCircle2 } from 'lucide-react';
import { googleSheetsService, type SheetQuestion } from '../../services/googleSheets';

function QuestionCard({ question }: { question: SheetQuestion }) {
    const handleLike = () => {
        alert("구글 시트 연동 모드에서는 좋아요가 누적되지 않습니다. (단순 보기용)");
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={question.userAvatar}
                        alt={question.userDisplayName}
                        className="w-10 h-10 rounded-full bg-primary-100 border border-slate-100"
                    />
                    <div>
                        <h4 className="font-bold text-slate-900">{question.userDisplayName}</h4>
                        <span className="text-xs text-slate-400">
                            {question.school} • {question.studentId} • {new Date(question.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-slate-800 font-medium mb-4 leading-relaxed text-lg">
                {question.content}
            </p>

            {question.answer && (
                <div className="mb-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-2 mb-2 text-primary-700 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        작성자의 답변
                    </div>
                    <p className="text-slate-700">{question.answer}</p>
                </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-pink-500 transition-colors"
                >
                    <Heart size={18} />
                    {question.likes} 아하!
                </button>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <MessageCircle size={18} />
                    댓글 {question.commentsCount || 0}개
                </div>
            </div>
        </div>
    );
}

export default function QuestionFeed() {
    const [questions, setQuestions] = useState<SheetQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        setLoading(true);
        const data = await googleSheetsService.getQuestions();
        setQuestions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">친구들의 질문 (구글 시트)</h2>
                <button
                    onClick={fetchQuestions}
                    className="text-sm text-primary-600 font-bold hover:underline"
                >
                    새로고침
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-400">질문을 불러오는 중...</div>
            ) : (
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">아직 등록된 질문이 없습니다.</p>
                            <p className="text-primary-500 font-bold mt-1">첫 번째 질문의 주인공이 되어보세요!</p>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <QuestionCard key={q.id} question={q} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
