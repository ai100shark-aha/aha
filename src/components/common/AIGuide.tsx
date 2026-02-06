
import { Lightbulb, Sparkles } from 'lucide-react';

export default function AIGuide() {
    return (
        <div className="bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 p-8 bg-primary-100 rounded-full opacity-30 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-primary-900 font-bold text-lg mb-2 flex items-center gap-2">
                        <Sparkles className="text-primary-500" size={20} />
                        질문 가이드
                    </h3>
                    <p className="text-primary-700 text-sm md:text-base">
                        질문이 막혔나요? <span className="font-bold bg-white px-2 py-0.5 rounded-md text-primary-600 shadow-sm mx-1">왜?</span>
                        <span className="font-bold bg-white px-2 py-0.5 rounded-md text-primary-600 shadow-sm mx-1">어떻게?</span>
                        또는 <span className="font-bold bg-white px-2 py-0.5 rounded-md text-primary-600 shadow-sm mx-1">만약~라면?</span>을 사용해 보세요.
                    </p>
                </div>
                <div className="hidden md:block">
                    <Lightbulb className="text-primary-300" size={48} />
                </div>
            </div>
        </div>
    );
}
