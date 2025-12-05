import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";

export function JoinGame() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const [sessionCode, setSessionCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill session code from URL query parameter
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setSessionCode(code.toUpperCase());
    }
  }, []);

  const joinMutation = trpc.game.joinSession.useMutation({
    onSuccess: (data) => {
      setLocation(`/play/${data.sessionId}/${data.player.id}`);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!sessionCode.trim()) {
      setError("Please enter a session code");
      return;
    }
    
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    joinMutation.mutate({
      sessionCode: sessionCode.toUpperCase().trim(),
      playerName: playerName.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto mb-2">
            <img
              src="/assets/np-logo.png"
              alt="Ngee Ann Polytechnic"
              className="h-20 md:h-24 mx-auto"
            />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            The Business Lexicon Lock
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Join a game session to start playing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="sessionCode" className="font-semibold text-gray-900">Session Code</Label>
              <Input
                id="sessionCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest font-bold border-2 h-14 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="playerName" className="font-semibold text-gray-900">Your Name</Label>
              <Input
                id="playerName"
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="border-2 h-12 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-sm font-medium text-red-800">⚠️ {error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg transition-all duration-300 hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Joining...
                </span>
              ) : (
                "Join Game"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 font-medium">Are you the Game Host?</p>
              <Button
                variant="outline"
                className="w-full h-12 font-bold border-2 hover:bg-blue-50 text-blue-600"
                onClick={() => setLocation("/host")}
                disabled={isLoading}
              >
                Create New Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
