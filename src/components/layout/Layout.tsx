import React from 'react';
import { LayoutDashboard, Award, Users, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const { user, signInWithGoogle, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-6 fixed h-full z-10 shadow-sm">
                <div className="flex items-center gap-3 mb-12 text-primary-600 px-2">
                    <div className="bg-primary-100 p-2 rounded-lg">
                        <BookOpen size={28} className="text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">아하! 프로젝트</h1>
                </div>

                <nav className="space-y-3">
                    <NavButton to="/" active={isActive('/')} icon={<LayoutDashboard size={22} />} label="오늘의 질문" />
                    <NavButton to="/rankings" active={isActive('/rankings')} icon={<Award size={22} />} label="질문 랭킹" />
                    <NavButton to="/peer-feedback" active={isActive('/peer-feedback')} icon={<Users size={22} />} label="친구들의 질문" />
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    {user ? (
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                            <img
                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                                alt={user.displayName || 'User'}
                                className="w-10 h-10 rounded-full bg-slate-200 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{user.displayName}</p>
                                <button
                                    onClick={logout}
                                    className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-primary-50 rounded-xl">
                            <p className="text-xs font-semibold text-primary-800 mb-2">로그인이 필요해요</p>
                            <button
                                onClick={signInWithGoogle}
                                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                구글 로그인
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-6 md:p-10 relative">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header className="mb-8 md:hidden flex justify-between items-center">
                        <div className="flex items-center gap-2 text-primary-600">
                            <BookOpen size={24} />
                            <h1 className="text-xl font-bold">아하! 프로젝트</h1>
                        </div>
                        {/* Mobile menu button could go here */}
                    </header>
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavButton({ icon, label, to, active = false }: { icon: React.ReactNode, label: string, to: string, active?: boolean }) {
    return (
        <Link to={to} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary-50 text-primary-700 font-bold shadow-sm ring-1 ring-primary-200'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
            }`}>
            <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
            <span className="text-base">{label}</span>
        </Link>
    );
}
