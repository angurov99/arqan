import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RefreshCw, Trophy } from 'lucide-react';
import { GameVisuals } from './components/GameVisuals';
import { TeacherPanel } from './components/TeacherPanel';
import { Question, QuestionSet, GameState, Team } from './types';
import { DEFAULT_QUESTIONS, WINNING_SCORE } from './constants';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'arkan_tartys_data_v2';

// Safe ID generator fallback
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export default function App() {
  // --- STATE ---
  
  // Data State
  const [sets, setSets] = useState<Record<string, QuestionSet>>({});
  const [currentSetId, setCurrentSetId] = useState<string>('');
  
  // UI State
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    ropePosition: 0,
    team1Score: 0,
    team2Score: 0,
    winner: null,
  });

  // Current active questions for each team
  const [qTeam1, setQTeam1] = useState<Question | null>(null);
  const [qTeam2, setQTeam2] = useState<Question | null>(null);

  // Inputs
  const [inputTeam1, setInputTeam1] = useState('');
  const [inputTeam2, setInputTeam2] = useState('');
  const [msgTeam1, setMsgTeam1] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  const [msgTeam2, setMsgTeam2] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  // --- PERSISTENCE & INIT ---

  const initializeDefaults = () => {
    // Deep copy to prevent reference issues
    const defaultSet = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    // Ensure default set has a valid structure
    if (!defaultSet.id) defaultSet.id = 'default-set';
    
    setSets({ [defaultSet.id]: defaultSet });
    setCurrentSetId(defaultSet.id);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate loaded data
        if (parsed.sets && Object.keys(parsed.sets).length > 0) {
          setSets(parsed.sets);
          // Ensure currentSetId is valid, otherwise pick the first one
          if (parsed.currentSetId && parsed.sets[parsed.currentSetId]) {
            setCurrentSetId(parsed.currentSetId);
          } else {
            setCurrentSetId(Object.keys(parsed.sets)[0]);
          }
        } else {
          initializeDefaults();
        }
      } catch (e) {
        console.error("Failed to load data", e);
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && Object.keys(sets).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sets, currentSetId }));
    }
  }, [sets, currentSetId, isLoading]);

  // --- HELPERS ---

  const getRandomQuestion = useCallback((excludeId?: string): Question | null => {
    if (!currentSetId || !sets[currentSetId]) return null;
    const questions = sets[currentSetId].questions;
    if (questions.length === 0) return null;
    
    // Simple random selection
    const available = questions.filter(q => q.id !== excludeId);
    if (available.length === 0) return questions[0]; // Fallback if only 1 question
    
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }, [currentSetId, sets]);

  // Initial Question Load
  useEffect(() => {
    if (!isLoading && currentSetId && !qTeam1 && !qTeam2) {
      resetGame();
    }
  }, [isLoading, currentSetId]);

  // --- GAME LOGIC ---

  const resetGame = () => {
    setGameState({
      ropePosition: 0,
      team1Score: 0,
      team2Score: 0,
      winner: null,
    });
    setQTeam1(getRandomQuestion());
    setQTeam2(getRandomQuestion());
    setInputTeam1('');
    setInputTeam2('');
    setMsgTeam1(null);
    setMsgTeam2(null);
  };

  const handleAnswer = (team: Team) => {
    if (gameState.winner) return;

    const currentQ = team === 'team1' ? qTeam1 : qTeam2;
    const input = team === 'team1' ? inputTeam1 : inputTeam2;
    const setMsg = team === 'team1' ? setMsgTeam1 : setMsgTeam2;
    const setInput = team === 'team1' ? setInputTeam1 : setInputTeam2;
    const setQ = team === 'team1' ? setQTeam1 : setQTeam2;

    if (!currentQ) return;

    const isCorrect = input.trim().toLowerCase() === currentQ.answer.toLowerCase();

    if (isCorrect) {
      // Logic: Move rope towards the winning team
      // Team 1 (Left) correct -> Move Left (Negative)
      // Team 2 (Right) correct -> Move Right (Positive)
      
      let move = 0;
      if (team === 'team1') move = -1;
      if (team === 'team2') move = 1;

      const newPos = gameState.ropePosition + move;
      
      let winner: 'team1' | 'team2' | null = null;
      if (newPos <= -WINNING_SCORE) winner = 'team1';
      if (newPos >= WINNING_SCORE) winner = 'team2';

      setGameState(prev => ({
        ...prev,
        ropePosition: newPos,
        winner,
      }));

      // Feedback
      setMsg({ text: 'Дұрыс!', type: 'success' });
      setTimeout(() => setMsg(null), 1500);
      setInput('');
      
      // New Question for this team
      setQ(getRandomQuestion(currentQ.id));

      if (winner) {
        triggerWinConfetti();
      }

    } else {
      // Wrong Answer
      setMsg({ text: 'Қате жауап', type: 'error' });
      setTimeout(() => setMsg(null), 1500);
    }
  };

  const triggerWinConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2563EB', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#DC2626', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // --- TEACHER ACTIONS ---

  const createSet = (name: string) => {
    const newId = generateId();
    const newSet: QuestionSet = { id: newId, name, questions: [] };
    
    setSets(prev => ({
      ...prev,
      [newId]: newSet
    }));
    setCurrentSetId(newId);
  };

  const deleteSet = (id: string) => {
    // Calculate new sets
    const newSets = { ...sets };
    delete newSets[id];
    
    // Update sets state
    setSets(newSets);
    
    // Handle ID switching
    if (currentSetId === id) {
      const remainingIds = Object.keys(newSets);
      if (remainingIds.length > 0) {
        setCurrentSetId(remainingIds[0]);
      } else {
        // If all sets deleted, re-initialize default
        initializeDefaults();
      }
    }
  };

  const addQuestion = (q: Question) => {
    if (!currentSetId) return;
    setSets(prev => ({
      ...prev,
      [currentSetId]: {
        ...prev[currentSetId],
        questions: [...prev[currentSetId].questions, q]
      }
    }));
    // If game was empty/stuck, update current questions
    if (!qTeam1) setQTeam1(q);
    if (!qTeam2) setQTeam2(q);
  };

  const deleteQuestion = (qId: string) => {
    if (!currentSetId) return;
    setSets(prev => ({
      ...prev,
      [currentSetId]: {
        ...prev[currentSetId],
        questions: prev[currentSetId].questions.filter(q => q.id !== qId)
      }
    }));
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-bold text-gray-500">Жүктелуде...</div>;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center z-20 relative">
        <h1 className="text-2xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-2">
           АРҚАН ТАРТЫС <span className="text-blue-600">•</span> ИНФОРМАТИКА
        </h1>
        <div className="flex items-center gap-4">
           {currentSetId && sets[currentSetId] && (
             <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600 hidden sm:inline-block">
               {sets[currentSetId].name}
             </span>
           )}
           <button 
             onClick={() => setIsTeacherMode(!isTeacherMode)}
             className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors border ${isTeacherMode ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
           >
             <Settings size={16} />
             Мұғалім режимі
           </button>
        </div>
      </header>

      {/* GAME AREA */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Visuals */}
        <GameVisuals ropePosition={gameState.ropePosition} />

        {/* Input Panels */}
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* TEAM 1 PANEL */}
          <div className="flex-1 bg-blue-600 p-6 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-blue-700"></div>
             <h2 className="text-white text-2xl font-black mb-6 bg-blue-800/30 px-6 py-2 rounded-full backdrop-blur-sm">1-КОМАНДА</h2>
             
             <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl min-h-[300px] flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-2xl font-bold text-white leading-relaxed drop-shadow-md">
                    {qTeam1 ? qTeam1.text : 'Сұрақтар жоқ... Мұғалім сұрақ қосуы керек.'}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={inputTeam1}
                      onChange={(e) => setInputTeam1(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer('team1')}
                      placeholder="Жауапты осында жазыңыз..."
                      className="w-full p-4 rounded-lg bg-black/20 border-2 border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white focus:bg-black/30 transition-all text-lg font-medium"
                      disabled={!!gameState.winner}
                    />
                    {msgTeam1 && (
                      <div className={`absolute -top-10 left-0 right-0 text-center font-bold text-lg animate-bounce ${msgTeam1.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                        {msgTeam1.text}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleAnswer('team1')}
                    disabled={!!gameState.winner}
                    className="w-full bg-white text-blue-600 font-black py-4 rounded-lg hover:bg-blue-50 active:scale-95 transition-all shadow-lg text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Жауап беру
                  </button>
                </div>
             </div>
          </div>

          {/* TEAM 2 PANEL */}
          <div className="flex-1 bg-red-600 p-6 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
             <h2 className="text-white text-2xl font-black mb-6 bg-red-800/30 px-6 py-2 rounded-full backdrop-blur-sm">2-КОМАНДА</h2>
             
             <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl min-h-[300px] flex flex-col">
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-2xl font-bold text-white leading-relaxed drop-shadow-md">
                    {qTeam2 ? qTeam2.text : 'Сұрақтар жоқ... Мұғалім сұрақ қосуы керек.'}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={inputTeam2}
                      onChange={(e) => setInputTeam2(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnswer('team2')}
                      placeholder="Жауапты осында жазыңыз..."
                      className="w-full p-4 rounded-lg bg-black/20 border-2 border-white/30 text-white placeholder-red-200 focus:outline-none focus:border-white focus:bg-black/30 transition-all text-lg font-medium"
                      disabled={!!gameState.winner}
                    />
                    {msgTeam2 && (
                      <div className={`absolute -top-10 left-0 right-0 text-center font-bold text-lg animate-bounce ${msgTeam2.type === 'success' ? 'text-green-300' : 'text-yellow-300'}`}>
                        {msgTeam2.text}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleAnswer('team2')}
                    disabled={!!gameState.winner}
                    className="w-full bg-white text-red-600 font-black py-4 rounded-lg hover:bg-red-50 active:scale-95 transition-all shadow-lg text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Жауап беру
                  </button>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* WINNER OVERLAY */}
      {gameState.winner && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in">
           <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-2xl transform scale-110">
              <Trophy size={80} className={`mx-auto mb-6 ${gameState.winner === 'team1' ? 'text-blue-600' : 'text-red-600'}`} />
              <h2 className={`text-5xl font-black mb-4 uppercase ${gameState.winner === 'team1' ? 'text-blue-600' : 'text-red-600'}`}>
                {gameState.winner === 'team1' ? '1-КОМАНДА' : '2-КОМАНДА'} ЖЕҢДІ!
              </h2>
              <p className="text-gray-500 mb-8 text-xl">Құттықтаймыз!</p>
              
              <button 
                onClick={resetGame}
                className="bg-gray-900 text-white text-xl font-bold py-4 px-10 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl"
              >
                <RefreshCw />
                Қайта ойнау
              </button>
           </div>
        </div>
      )}

      {/* TEACHER PANEL COMPONENT */}
      <TeacherPanel 
        isOpen={isTeacherMode}
        onClose={() => setIsTeacherMode(false)}
        sets={sets}
        currentSetId={currentSetId}
        onSetChange={setCurrentSetId}
        onCreateSet={createSet}
        onDeleteSet={deleteSet}
        onAddQuestion={addQuestion}
        onDeleteQuestion={deleteQuestion}
      />
    </div>
  );
}