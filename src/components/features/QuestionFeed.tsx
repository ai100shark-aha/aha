import { useState, useEffect } from 'react';
import { MessageCircle, Heart, CheckCircle2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { googleSheetsService, type SheetQuestion } from '../../services/googleSheets';
import { useAuth } from '../../contexts/AuthContext';

function QuestionCard({ question }: { question: SheetQuestion }) {
    const { user } = useAuth();
    const [likes, setLikes] = useState(question.likes);
    const [isLiked, setIsLiked] = useState(false); // Local only state for visual feedback
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [localComments, setLocalComments] = useState(question.comments || []);

    // Simple local storage persistence for likes to prevent spamming
    // Key: `liked_${question.id}`
    useEffect(() => {
        const likedKey = `liked_${question.id}`;
        if (localStorage.getItem(likedKey)) {
            setIsLiked(true);
        }
    }, [question.id]);

    const handleLike = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        console.log("[UI] Like button clicked for:", question.id);
        const likedKey = `liked_${question.id}`;
        const previousLikes = likes;
        const previousIsLiked = isLiked;

        // 1. Optimistic Update
        if (isLiked) {
            setLikes(prev => Math.max(0, prev - 1));
            setIsLiked(false);
            localStorage.removeItem(likedKey);
            console.log("[UI] Optimistic Update: Unliked");
        } else {
            setLikes(prev => prev + 1);
            setIsLiked(true);
            localStorage.setItem(likedKey, 'true');
            console.log("[UI] Optimistic Update: Liked");
        }

        // 2. API Call
        try {
            console.log("[UI] Sending API request...");
            const result: any = await googleSheetsService.toggleLike(question.id, user.studentId);

            if (result && result.result === 'success') {
                console.log("[UI] API Success");
                // Optional: alert("좋아요 성공! (DB 반영됨)"); 
            } else {
                throw new Error(result?.message || "Unknown error");
            }
        } catch (error) {
            console.error("[UI] API Failed, reverting:", error);
            alert("좋아요 반영 실패! 원래대로 되돌립니다.");
            // 3. Revert on Failure
            setLikes(previousLikes);
            setIsLiked(previousIsLiked);
            if (previousIsLiked) {
                localStorage.setItem(likedKey, 'true');
            } else {
                localStorage.removeItem(likedKey);
            }
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !commentText.trim()) return;

        console.log("[UI] Comment submit clicked");

        // 1. Optimistic Update
        const newComment = {
            studentId: user.studentId,
            name: user.name,
            content: commentText,
            timestamp: new Date().toISOString()
        };
        const previousComments = [...localComments];

        setLocalComments([...localComments, newComment]);
        setCommentText("");
        console.log("[UI] Optimistic Update: Comment added locally");

        // 2. API Call
        try {
            console.log("[UI] Sending API request...");
            const result: any = await googleSheetsService.addComment(question.id, user.studentId, user.name, newComment.content);

            if (result && result.result === 'success') {
                console.log("✅ [UI] API Success");
                // alert("댓글이 등록되었습니다! (DB 저장 완료)"); // Removed as per user request
            } else {
                throw new Error(result?.message || "Unknown error");
            }
        } catch (error) {
            console.error("[UI] API Failed, reverting:", error);
            alert("댓글 등록 실패! 다시 시도해주세요.");
            // 3. Revert on Failure
            setLocalComments(previousComments);
            setCommentText(newComment.content); // Restore text so user doesn't lose it
        }
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

            <p className="text-slate-800 font-medium mb-4 leading-relaxed text-lg whitespace-pre-wrap">
                {question.content}
            </p>

            {question.answer && (
                <div className="mb-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-2 mb-2 text-primary-700 font-bold text-sm">
                        <CheckCircle2 size={16} />
                        작성자의 답변
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{question.answer}</p>
                </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-slate-50 relative z-10">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm font-medium transition-all transform active:scale-95 ${isLiked ? 'text-pink-500' : 'text-slate-500 hover:text-pink-400'
                        }`}
                >
                    <Heart size={18} className={isLiked ? "fill-current" : ""} />
                    {likes} 아하!
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                >
                    <MessageCircle size={18} />
                    댓글 {localComments.length}개
                    {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 relative z-10">
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                        {localComments.length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-2">첫 번째 댓글을 남겨보세요!</p>
                        )}
                        {localComments.map((comment, idx) => (
                            <div key={idx} className="flex gap-2 text-sm">
                                <div className="font-bold text-slate-700 shrink-0">{comment.name}:</div>
                                <div className="text-slate-600 break-words flex-1">{comment.content}</div>
                            </div>
                        ))}
                    </div>

                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary-500"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    ) : (
                        <p className="text-xs text-center text-slate-400">댓글을 작성하려면 로그인이 필요합니다.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function QuestionFeed() {
    const { refreshTrigger } = useAuth();
    const [questions, setQuestions] = useState<SheetQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        console.log("🔄 [UI] Fetching questions...");
        setLoading(true);
        const data = await googleSheetsService.getQuestions();
        console.log(`✅ [UI] Fetched ${data.length} questions.`);
        setQuestions(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
    }, [refreshTrigger]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">친구들의 질문</h2>
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
                            <p className="text-primary-500 font-bold mt-1">첫 번째 질문의 주인공이 되어보세요! 🚀</p>
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
