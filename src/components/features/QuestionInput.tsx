import React, { useState } from 'react';
import { Send, Clock, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { googleSheetsService } from '../../services/googleSheets';
import AIGuide from '../common/AIGuide';

export default function QuestionInput() {
    const { user, login, triggerRefresh } = useAuth();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Login form state
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [school, setSchool] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && studentId && school) {
            login(name, studentId, school);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!question.trim()) return;

        setIsSubmitting(true);
        try {
            console.log("⏳ [UI] Submitting question...");
            await googleSheetsService.submitQuestion({
                name: user.name,
                studentId: user.studentId,
                school: user.school || school, // Use user.school or local state fallback
                question: question,
                answer: showAnswer ? answer : undefined
            });

            console.log("✅ [UI] Question submitted! Triggering refresh.");
            setQuestion('');
            setAnswer('');
            setShowAnswer(false);

            // Trigger refresh for leaderboard and feed
            triggerRefresh();

            alert('질문이 성공적으로 등록되었습니다! (새로고침 완료)');
        } catch (error: any) {
            console.error("Error submitting", error);
            if (error.message.includes("configured")) {
                alert("구글 시트 연동이 필요합니다! .env 파일을 확인해주세요.");
            } else {
                alert('등록 요청을 보냈습니다. (새로고침하여 확인해보세요)');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <Lightbulb className="mx-auto text-primary-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800 mb-4">질문하기 전에 먼저 알려주세요</h3>

                <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-3">
                    <input
                        type="text"
                        placeholder="학교 (예: 선린중학교)"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                    />
                    <input
                        type="text"
                        placeholder="이름 (예: 김선린)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                    />
                    <input
                        type="text"
                        placeholder="학번 (예: 10101)"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-bold transition-all shadow-sm"
                    >
                        시작하기
                    </button>
                    <p className="text-xs text-slate-400 mt-2">입력한 정보는 제출 시 함께 기록됩니다.</p>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AIGuide />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">오늘의 질문</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={16} />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="오늘 당신을 멈춰 서게 만든 사소한 궁금증은 무엇인가요?"
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700"
                    />

                    {showAnswer && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-2 text-primary-700 font-bold text-sm">
                                <CheckCircle2 size={16} />
                                내가 찾은 답 기록하기
                            </div>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="스스로 찾은 답이 있다면 기록해 보세요! (+3 보너스 아하!)"
                                className="w-full h-24 p-4 bg-primary-50 border border-primary-100 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none resize-none transition-all placeholder:text-primary-300 text-slate-700"
                            />
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <button
                            type="button"
                            onClick={() => setShowAnswer(!showAnswer)}
                            className={`text-sm font-semibold transition-colors flex items-center gap-1 ${showAnswer ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {showAnswer ? '답변 닫기' : '+ 내가 찾은 답 기록하기'}
                        </button>

                        <button
                            type="submit"
                            disabled={!question.trim() || isSubmitting}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            <Send size={18} />
                            {isSubmitting ? '등록 중...' : '구글 시트로 등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
