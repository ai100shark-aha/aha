import React, { createContext, useContext, useEffect, useState } from 'react';

// Define simple user type
export interface SimpleUser {
    name: string;
    studentId: string;
    school: string; // Add School
    photoURL?: string;
    uid?: string; // Keep for compatibility
    displayName?: string; // Keep for compatibility
}

interface AuthContextType {
    user: SimpleUser | null;
    loading: boolean;
    login: (name: string, studentId: string, school: string) => void;
    logout: () => void;
    signInWithGoogle: () => Promise<void>; // Deprecated but kept to avoid breaking types immediately
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const storedUser = localStorage.getItem('aha_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (name: string, studentId: string, school: string) => {
        const newUser = {
            name,
            studentId,
            school,
            // Compatibility fields
            uid: studentId,
            displayName: name,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        };
        setUser(newUser);
        localStorage.setItem('aha_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('aha_user');
    };

    // Placeholder for compatibility
    const signInWithGoogle = async () => {
        console.warn("Google Login is disabled. Use simple login.");
    };

    const value = {
        user,
        loading,
        login,
        logout,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
