import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock user for local testing
const mockUser = {
  id: 1,
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin" as const,
};

export default function AdminDashboard() {
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [userQRCode, setUserQRCode] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [testMode, setTestMode] = useState(true);

  const quizzesQuery = trpc.quiz.listQuizzes.useQuery();
  const questionsQuery = trpc.quiz.getQuestions.useQuery(
    { quizId: selectedQuizId || 0 },
    { enabled: !!selectedQuizId }
  );

  const createQuizMutation = trpc.quiz.createQuiz.useMutation({
    onSuccess: () => {
      toast.success("Quiz created successfully!");
      setNewQuizTitle("");
      setNewQuizDesc("");
      quizzesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const startSessionMutation = trpc.quiz.startSession.useMutation({
    onSuccess: (result: any) => {
      if (result.status === "success") {
        toast.success(`Session created! Code: ${result.data.sessionCode}`);
        setUserQRCode("");
        setUserName("");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Quiz System Admin</h1>
            <p className="text-slate-400">Manage quizzes and test workflow</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded px-4 py-2">
            <p className="text-slate-300 text-sm">
              Mode: <span className="font-bold text-blue-400">{testMode ? "TEST" : "PRODUCTION"}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Quiz Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Title</label>
                <Input
                  placeholder="Enter quiz title"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <Textarea
                  placeholder="Enter quiz description"
                  value={newQuizDesc}
                  onChange={(e) => setNewQuizDesc(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  rows={3}
                />
              </div>
              <Button
                onClick={() => {
                  if (newQuizTitle.trim()) {
                    createQuizMutation.mutate({
                      title: newQuizTitle,
                      description: newQuizDesc,
                    });
                  } else {
                    toast.error("Please enter a quiz title");
                  }
                }}
                disabled={createQuizMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
              >
                {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
              </Button>
            </div>
          </div>

          {/* Start Session Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Start Quiz Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Quiz</label>
                <select
                  value={selectedQuizId || ""}
                  onChange={(e) => setSelectedQuizId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="">Choose a quiz...</option>
                  {quizzesQuery.data?.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">User QR Code</label>
                <Input
                  placeholder="e.g., USER_0001"
                  value={userQRCode}
                  onChange={(e) => setUserQRCode(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">User Name</label>
                <Input
                  placeholder="e.g., John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                />
              </div>
              <Button
                onClick={() => {
                  if (selectedQuizId && userQRCode && userName) {
                    startSessionMutation.mutate({
                      quizId: selectedQuizId,
                      userQrCode: userQRCode,
                      userName: userName,
                    });
                  } else {
                    toast.error("Please fill all fields");
                  }
                }}
                disabled={startSessionMutation.isPending || !selectedQuizId}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                {startSessionMutation.isPending ? "Starting..." : "Start Session"}
              </Button>
            </div>
          </div>
        </div>

        {/* Quizzes List Section */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Available Quizzes</h2>
          {quizzesQuery.isLoading ? (
            <p className="text-slate-400">Loading quizzes...</p>
          ) : quizzesQuery.data && quizzesQuery.data.length > 0 ? (
            <div className="space-y-3">
              {quizzesQuery.data.map((quiz) => (
                <div key={quiz.id} className="bg-slate-700 border border-slate-600 rounded p-4 hover:border-blue-500 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">ID: {quiz.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No quizzes found. Create one to get started!</p>
          )}
        </div>

        {/* Statistics Section */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded p-4 text-center">
              <p className="text-slate-400 text-sm">Total Quizzes</p>
              <p className="text-3xl font-bold text-blue-400">{quizzesQuery.data?.length || 0}</p>
            </div>
            <div className="bg-slate-700 rounded p-4 text-center">
              <p className="text-slate-400 text-sm">Active Sessions</p>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
            <div className="bg-slate-700 rounded p-4 text-center">
              <p className="text-slate-400 text-sm">Total Attempts</p>
              <p className="text-3xl font-bold text-purple-400">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
