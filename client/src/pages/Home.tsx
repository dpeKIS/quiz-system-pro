import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Quiz System Pro</h1>
        <p className="text-xl text-slate-300 mb-8">
          Complete quiz management system with real-time statistics
        </p>
        <Button
          onClick={() => setLocation("/admin")}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
        >
          Go to Admin Panel
        </Button>
      </div>
    </div>
  );
}
