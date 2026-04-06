import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();

  // Redirect directly to admin for testing
  useEffect(() => {
    setLocation("/admin");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl">Redirecting to Admin Panel...</p>
      </div>
    </div>
  );
}
