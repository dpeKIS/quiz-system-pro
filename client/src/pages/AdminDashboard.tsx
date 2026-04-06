import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");

  const quizzesQuery = trpc.quiz.listQuizzes.useQuery();
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz System Admin</h1>
          <p className="text-slate-400">Manage quizzes and track results</p>
        </div>

        <div className="space-y-8">
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

          {/* Quizzes List Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Available Quizzes</h2>
            {quizzesQuery.isLoading ? (
              <p className="text-slate-400">Loading quizzes...</p>
            ) : quizzesQuery.data && quizzesQuery.data.length > 0 ? (
              <div className="space-y-3">
                {quizzesQuery.data.map((quiz) => (
                  <div key={quiz.id} className="bg-slate-700 border border-slate-600 rounded p-4 hover:border-blue-500 transition">
                    <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>
                    <div className="mt-3 flex gap-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1">
                        View Questions
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1">
                        Start Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No quizzes found. Create one to get started!</p>
            )}
          </div>

          {/* Statistics Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
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
    </div>
  );
}
