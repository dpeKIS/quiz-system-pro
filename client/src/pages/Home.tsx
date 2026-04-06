import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Quiz System Pro</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => setLocation("/admin")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Admin Panel
                </Button>
                <Button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-green-600 hover:bg-green-700"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to Quiz System Pro</h2>
            <p className="text-xl text-slate-300">
              A complete quiz management system with real-time statistics and ESP32 hardware integration
            </p>
          </div>

          {isAuthenticated ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-300 mb-6">
                Welcome, <span className="font-bold text-white">{user?.name || "User"}</span>!
              </p>
              <Button
                onClick={() => setLocation("/admin")}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              >
                Go to Admin Panel
              </Button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-300 mb-6">
                Please log in to access the admin panel and manage quizzes.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              >
                Login with Manus
              </Button>
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">Create Quizzes</h3>
              <p className="text-slate-400">
                Easily create and manage multiple quizzes with custom questions and answers.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
              <p className="text-slate-400">
                Track participant performance with detailed statistics and leaderboards.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">Hardware Integration</h3>
              <p className="text-slate-400">
                Connect ESP32 devices with QR scanners for interactive quiz sessions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
