import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { WordSearchGrid } from "../components/WordSearchGrid";
import { GameState } from "../types/game";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useSound } from "../hooks/useSound";
import { Volume2, VolumeX } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

export function HostDashboard() {
  const [sessionCode, setSessionCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(90);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium");
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [previousFoundWordsCount, setPreviousFoundWordsCount] = useState(0);
  const { playSuccess, playCountdownBeep, playGameStart, playGameEnd, toggleMute, isMuted } = useSound();

  const createMutation = trpc.game.createSession.useMutation({
    onSuccess: (data) => {
      setSessionCode(data.sessionCode);
      setSessionId(data.sessionId);
      setTimeRemaining(data.duration);
      setIsCreating(false);
    },
  });

  const startMutation = trpc.game.startGame.useMutation({
    onSuccess: () => {
      setIsGameActive(true);
    },
  });

  const endMutation = trpc.game.endGame.useMutation();

  const { data, refetch } = trpc.game.getGameState.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId, refetchInterval: 1000 }
  );

  useEffect(() => {
    if (data) {
      setGameState(data as GameState);
      const wasActive = isGameActive;
      const nowActive = data.session.status === "active";
      setIsGameActive(nowActive);
      
      // Play game start sound when game becomes active
      if (!wasActive && nowActive && !hasGameStarted) {
        playGameStart();
        setHasGameStarted(true);
      }
      
      // Play success sound when new words are found
      const currentFoundCount = data.foundWords?.length || 0;
      if (currentFoundCount > previousFoundWordsCount && previousFoundWordsCount > 0) {
        playSuccess();
      }
      setPreviousFoundWordsCount(currentFoundCount);
      
      if (data.session.startTime && data.session.status === "active") {
        const elapsed = Math.floor((Date.now() - new Date(data.session.startTime).getTime()) / 1000);
        const gameDuration = data.session.duration || 90;
        const remaining = Math.max(0, gameDuration - elapsed);
        setTimeRemaining(remaining);
        
        // Play countdown beep for last 10 seconds
        if (remaining <= 10 && remaining > 0) {
          playCountdownBeep();
        }
        
        if (remaining === 0 && data.session.status === "active") {
          playGameEnd();
          endMutation.mutate({ sessionId: sessionId! });
        }
      }
    }
  }, [data, sessionId, isGameActive, hasGameStarted, previousFoundWordsCount, playGameStart, playSuccess, playCountdownBeep, playGameEnd]);

  useEffect(() => {
    if (!isGameActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          if (sessionId) {
            endMutation.mutate({ sessionId });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isGameActive, sessionId]);

  const handleCreateSession = () => {
    setIsCreating(true);
    createMutation.mutate({ difficulty: selectedDifficulty });
  };

  const handleStartGame = () => {
    if (sessionId) {
      startMutation.mutate({ sessionId });
    }
  };

  const handleResetGame = () => {
    setSessionCode("");
    setSessionId(null);
    setGameState(null);
    setTimeRemaining(90);
    setIsGameActive(false);
  };

  const getFoundWordsCount = () => {
    return gameState?.foundWords.length || 0;
  };

  const getTotalWordsCount = () => {
    return gameState?.session.words.length || 0;
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto mb-4">
              <img
                src="/assets/np-logo.png"
                alt="Ngee Ann Polytechnic"
                className="h-20 md:h-24 mx-auto"
              />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Host Dashboard
            </CardTitle>
            <p className="text-gray-600 md:text-base">
              Create a new game session for players to join
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-blue-900 text-lg">How it works:</h3>
              <ul className="space-y-2.5 text-sm text-blue-800">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">1.</span>
                  <span>Create a new game session</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">2.</span>
                  <span>Share the session code with players (up to 8)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">3.</span>
                  <span>Start the game when all players have joined</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-lg flex-shrink-0">4.</span>
                  <span>Players compete on the same word search grid</span>
                </li>
              </ul>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-4">
              <Label className="text-base font-bold text-gray-900">Select Difficulty Level</Label>
              <RadioGroup value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)}>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative" onClick={() => setSelectedDifficulty("easy")}>
                    <RadioGroupItem value="easy" id="easy" className="hidden" />
                    <Label htmlFor="easy" className="block cursor-pointer">
                      <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                        style={{
                          borderColor: selectedDifficulty === "easy" ? "#16a34a" : "#d1d5db",
                          backgroundColor: selectedDifficulty === "easy" ? "#f0fdf4" : "#ffffff"
                        }}>
                        <div className="font-bold text-green-700 text-lg">Easy</div>
                        <div className="text-xs text-gray-600 mt-1">8 words</div>
                        <div className="text-xs text-gray-600">120 sec</div>
                      </div>
                    </Label>
                  </div>
                  <div className="relative" onClick={() => setSelectedDifficulty("medium")}>
                    <RadioGroupItem value="medium" id="medium" className="hidden" />
                    <Label htmlFor="medium" className="block cursor-pointer">
                      <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                        style={{
                          borderColor: selectedDifficulty === "medium" ? "#2563eb" : "#d1d5db",
                          backgroundColor: selectedDifficulty === "medium" ? "#eff6ff" : "#ffffff"
                        }}>
                        <div className="font-bold text-blue-700 text-lg">Medium</div>
                        <div className="text-xs text-gray-600 mt-1">12 words</div>
                        <div className="text-xs text-gray-600">90 sec</div>
                      </div>
                    </Label>
                  </div>
                  <div className="relative" onClick={() => setSelectedDifficulty("hard")}>
                    <RadioGroupItem value="hard" id="hard" className="hidden" />
                    <Label htmlFor="hard" className="block cursor-pointer">
                      <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                        style={{
                          borderColor: selectedDifficulty === "hard" ? "#dc2626" : "#d1d5db",
                          backgroundColor: selectedDifficulty === "hard" ? "#fef2f2" : "#ffffff"
                        }}>
                        <div className="font-bold text-red-700 text-lg">Hard</div>
                        <div className="text-xs text-gray-600 mt-1">15 words</div>
                        <div className="text-xs text-gray-600">60 sec</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <Button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              {isCreating ? "Creating..." : "Create New Game Session"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-xl font-semibold">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/np-logo.png"
                  alt="NP"
                  className="h-12 md:h-16 flex-shrink-0"
                />
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    The Business Lexicon Lock
                  </CardTitle>
                  <p className="text-gray-600 text-sm md:text-base mt-1">Diploma in Business Studies</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className="h-10 w-10 rounded-full"
                  title={isMuted ? "Unmute sounds" : "Mute sounds"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="text-right">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 font-mono tracking-wider">
                    {sessionCode}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">Session Code</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 md:text-lg">Quick Join with QR Code</h3>
                <p className="text-sm text-gray-600 mt-1">Players can scan to join instantly</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-lg">
                <QRCodeSVG
                  value={`${window.location.origin}?code=${sessionCode}`}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Grid and Timer (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer and Progress Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Words Found</p>
                    <p className="text-4xl md:text-5xl font-bold text-blue-600 mt-2">
                      {getFoundWordsCount()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">/ {getTotalWordsCount()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Time</p>
                    <div className={`text-5xl md:text-6xl font-bold mt-2 transition-all ${
                      timeRemaining <= 10 ? "text-red-600 animate-pulse scale-110" : "text-blue-600"
                    }`}>
                      {timeRemaining}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">seconds</p>
                  </div>
                  <div className="text-center">
                    {!isGameActive && gameState.session.status === "waiting" && (
                      <Button
                        onClick={handleStartGame}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold w-full shadow-lg"
                        disabled={gameState.players.length === 0}
                      >
                        Start<br/>Game
                      </Button>
                    )}
                    {gameState.session.status === "completed" && (
                      <Button
                        onClick={handleResetGame}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold w-full shadow-lg"
                      >
                        New<br/>Game
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Word Search Grid */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="pt-6 md:pt-8">
                <WordSearchGrid
                  grid={gameState.session.grid}
                  foundWords={gameState.foundWords}
                  playerColor="#10B981"
                  onWordSelect={() => {}}
                  disabled={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Players */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-lg md:text-xl">
                  Players<span className="text-gray-500 font-normal ml-2">({gameState.players.length}/8)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.players.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 font-medium">
                    Waiting for players...
                  </p>
                ) : (
                  <div className="space-y-3">
                    {gameState.players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
                        style={{
                          backgroundColor: player.color + "15",
                          borderColor: player.color + "40",
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: player.color }}
                          >
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-900 truncate text-sm md:text-base">
                            {player.name}
                          </span>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold ml-2 flex-shrink-0" style={{ color: player.color }}>
                          {player.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Words List */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-lg md:text-xl">Business Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {gameState.session.words.map((word, index) => {
                    const found = gameState.foundWords.find((fw) => fw.word === word.word);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                          found
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                            : "bg-white border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-medium text-xs md:text-sm ${found ? "line-through text-green-700 font-bold" : "text-gray-700"}`}>
                            {found ? word.word : word.clue}
                          </span>
                          {found && (
                            <Badge variant="secondary" className="bg-green-600 text-white flex-shrink-0 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
