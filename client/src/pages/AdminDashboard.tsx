import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

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
  });

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz System Admin</h1>
          <p className="text-slate-400">Manage quizzes and track results</p>
        </div>

        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800 border border-slate-700">
            <TabsTrigger value="quizzes">
              <BookOpen className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Quiz Title"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newQuizDesc}
                  onChange={(e) => setNewQuizDesc(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  onClick={() => {
                    if (newQuizTitle.trim()) {
                      createQuizMutation.mutate({
                        title: newQuizTitle,
                        description: newQuizDesc,
                      });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Quiz
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Quizzes</h3>
              {quizzesQuery.data?.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500 transition"
                  onClick={() => setSelectedQuizId(quiz.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{quiz.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Statistics will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
