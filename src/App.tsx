import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import QuestionInput from './components/features/QuestionInput';
import QuestionFeed from './components/features/QuestionFeed';
import StreakCard from './components/features/StreakCard';
import Leaderboard from './components/features/Leaderboard';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Interaction */}
      <div className="lg:col-span-2 space-y-10">
        <section>
          <QuestionInput />
        </section>
        <section>
          <QuestionFeed />
        </section>
      </div>

      {/* Right Column - Stats & Ranking */}
      <div className="space-y-8">
        <StreakCard />
        <Leaderboard />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rankings" element={
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Rankings</h2>
                <Leaderboard />
              </div>
            } />
            <Route path="/peer-feedback" element={
              <div className="max-w-3xl mx-auto">
                <QuestionFeed />
              </div>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
