import React, { useEffect, useState, useRef } from 'react';
import { GameVisuals } from './components/GameVisuals';
import { TeacherPanel } from './components/TeacherPanel';
import { Question, QuestionSet, Language } from './types';
import { STORAGE_KEY, DEFAULT_QUESTIONS, KEYBOARD_LAYOUTS, WINNING_SCORE } from './constants';

declare global {
  interface Window {
    confetti: any;
  }
}

export default function App() {
  // Data State
  const [sets, setSets] = useState<Record<string, QuestionSet>>({});
  const [currentSetId, setCurrentSetId] = useState<string>('');
  
  // Game State
  const [ropePosition, setRopePosition] = useState(0);
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null);
  const [qTeam1, setQTeam1] = useState<Question | null>(null);
  const [qTeam2, setQTeam2] = useState<Question | null>(null);
  
  // UI State
  const [inputTeam1, setInputTeam1] = useState('');
  const [inputTeam2, setInputTeam2] = useState('');
  const [msgTeam1, setMsgTeam1] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [msgTeam2, setMsgTeam2] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [keyboardLang, setKeyboardLang] = useState<Language>('kz');
  
  // Focus refs
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSets(parsed.sets || {});
        setCurrentSetId(parsed.currentSetId || '');
        
        if (!parsed.sets || Object.keys(parsed.sets).length === 0) {
          resetToDefault();
        } else if (!parsed.sets[parsed.currentSetId]) {
          setCurrentSetId(Object.keys(parsed.sets)[0]);
        }
      } catch (e) {
        resetToDefault();
      }
    } else {
      resetToDefault();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(sets).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sets, currentSetId }));
    }
  }, [sets, currentSetId]);

  useEffect(() => {
    // When set changes or init, start new game round if needed
    if (currentSetId && sets[currentSetId] && !qTeam1) {
      resetGame();
    }
  }, [currentSetId, sets]);

  const resetToDefault = () => {
    const defaultSets = { [DEFAULT_QUESTIONS.id]: { ...DEFAULT_QUESTIONS } };
    setSets(defaultSets);
    setCurrentSetId(DEFAULT_QUESTIONS.id);
  };

  // --- Game Logic ---
  const getRandomQuestion = (excludeId?: string): Question | null => {
    if (!sets[currentSetId]) return null;
    const allQs = sets[currentSetId].questions;
    if (allQs.length === 0) return null;
    
    const available = allQs.filter(q => q.id !== excludeId);
    if (available.length === 0) return allQs[0];
    
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  };

  const resetGame = () => {
    setRopePosition(0);
    setWinner(null);
    setInputTeam1('');
    setInputTeam2('');
    setMsgTeam1(null);
    setMsgTeam2(null);
    
    // Slight delay to ensure state is ready
    setTimeout(() => {
      setQTeam1(getRandomQuestion());
      setQTeam2(getRandomQuestion());
    }, 0);
  };

  const handleAnswer = (team: 'team1' | 'team2') => {
    if (winner) return;

    const inputVal = team === 'team1' ? inputTeam1 : inputTeam2;
    const question = team === 'team1' ? qTeam1 : qTeam2;
    const setInput = team === 'team1' ? setInputTeam1 : setInputTeam2;
    const setMsg = team === 'team1' ? setMsgTeam1 : setMsgTeam2;
    const setQ = team === 'team1' ? setQTeam1 : setQTeam2;

    if (!question) return;

    if (inputVal.trim().toLowerCase() === question.answer.toLowerCase()) {
      // Correct
      setMsg({ text: 'Дұрыс!', type: 'success' });
      setInput('');
      setTimeout(() => setMsg(null), 1500);

      const move = team === 'team1' ? -1 : 1;
      const newPos = ropePosition + move;
      setRopePosition(newPos);

      if (newPos <= -WINNING_SCORE) endGame('team1');
      else if (newPos >= WINNING_SCORE) endGame('team2');
      else {
        setQ(getRandomQuestion(question.id));
      }
    } else {
      // Wrong
      setMsg({ text: 'Қате жауап', type: 'error' });
      setTimeout(() => setMsg(null), 1500);
    }
  };

  const endGame = (winTeam: 'team1' | 'team2') => {
    setWinner(winTeam);
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // --- Keyboard Helpers ---
  const insertChar = (char: string, team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setInputTeam1(prev => prev + char.toLowerCase());
      inputRef1.current?.focus();
    } else {
      setInputTeam2(prev => prev + char.toLowerCase());
      inputRef2.current?.focus();
    }
  };

  const backspace = (team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setInputTeam1(prev => prev.slice(0, -1));
      inputRef1.current?.focus();
    } else {
      setInputTeam2(prev => prev.slice(0, -1));
      inputRef2.current?.focus();
    }
  };

  const toggleLang = () => {
    if (keyboardLang === 'kz') setKeyboardLang('ru');
    else if (keyboardLang === 'ru') setKeyboardLang('en');
    else setKeyboardLang('kz');
  };

  // --- Teacher Panel Handlers ---
  const handleCreateSet = (name: string) => {
    const newId = Date.now().toString();
    const newSet: QuestionSet = { id: newId, name, questions: [] };
    setSets(prev => ({ ...prev, [newId]: newSet }));
    setCurrentSetId(newId);
  };

  const handleDeleteSet = () => {
    if (Object.keys(sets).length <= 1) {
      alert("Соңғы бөлімді өшіруге болмайды!");
      return;
    }
    if (!confirm("Бұл бөлімді жоюға сенімдісіз бе?")) return;
    
    const newSets = { ...sets };
    delete newSets[currentSetId];
    setSets(newSets);
    setCurrentSetId(Object.keys(newSets)[0]);
  };

  const handleAddQuestion = (qData: {text: string, answer: string}) => {
    const q: Question = { ...qData, id: Date.now().toString() };
    setSets(prev => ({
      ...prev,
      [currentSetId]: {
        ...prev[currentSetId],
        questions: [...prev[currentSetId].questions, q]
      }
    }));
  };

  const handleDeleteQuestion = (qId: string) => {
    setSets(prev => ({
      ...prev,
      [currentSetId]: {
        ...prev[currentSetId],
        questions: prev[currentSetId].questions.filter(q => q.id !== qId)
      }
    }));
  };

  // --- Render Components ---
  const renderKeyboard = (team: 'team1' | 'team2') => {
    const layout = KEYBOARD_LAYOUTS[keyboardLang];
    const teamClass = team === 'team1' ? 'kb-team1 text-blue-600' : 'kb-team2 text-red-600';
    const bgHover = team === 'team1' ? 'hover:bg-blue-50 active:bg-blue-100' : 'hover:bg-red-50 active:bg-red-100';

    return (
      <div className={`mt-2 p-1.5 rounded-lg bg-black/25 flex flex-col gap-1 select-none animate-fade-in`}>
        {layout.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-[3px]">
            {row.map(char => (
              <button 
                key={char}
                onMouseDown={(e) => { e.preventDefault(); insertChar(char, team); }}
                className={`flex-1 h-10 min-w-[20px] rounded bg-white ${teamClass} font-bold text-sm shadow-sm ${bgHover} flex items-center justify-center`}
              >
                {char}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-[3px]">
          <button 
            onMouseDown={(e) => { e.preventDefault(); toggleLang(); }}
            className="flex-[1.5] h-10 rounded bg-gray-200 text-gray-700 font-black text-[10px] shadow-sm hover:bg-gray-300 flex items-center justify-center"
          >
            {keyboardLang.toUpperCase()}
          </button>
          <button 
             onMouseDown={(e) => { e.preventDefault(); insertChar(' ', team); }}
             className={`flex-[4] h-10 rounded bg-white ${teamClass} font-bold text-xs shadow-sm ${bgHover} flex items-center justify-center`}
          >
            SPACE
          </button>
          <button 
             onMouseDown={(e) => { e.preventDefault(); backspace(team); }}
             className={`flex-[1.5] h-10 rounded bg-white ${teamClass} font-bold text-lg shadow-sm ${bgHover} flex items-center justify-center`}
          >
            ⌫
          </button>
          <button 
             onMouseDown={(e) => { e.preventDefault(); handleAnswer(team); }}
             className={`flex-[1.5] h-10 rounded bg-white ${teamClass} font-bold text-lg shadow-sm ${bgHover} flex items-center justify-center`}
          >
            ↵
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* HEADER */}
      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center z-20 shrink-0">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-2">
            АРҚАН ТАРТЫС <span className="text-blue-600">•</span> ИНФОРМАТИКА
        </h1>
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600 hidden sm:inline-block">
                {sets[currentSetId]?.name || 'Жүктелуде...'}
            </span>
            <button onClick={() => setShowTeacherPanel(true)} className="flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-colors border bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                Мұғалім режимі
            </button>
        </div>
      </header>

      {/* GAME VISUALS */}
      <GameVisuals ropePosition={ropePosition} />

      {/* GAMEPLAY AREA */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* TEAM 1 */}
        <div className="flex-1 bg-blue-600 p-6 flex flex-col justify-center items-center relative overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-700"></div>
            <h2 className="text-white text-2xl font-black mb-4 bg-blue-800/30 px-6 py-2 rounded-full backdrop-blur-sm">1-КОМАНДА</h2>
            
            <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl flex flex-col">
                <div className="min-h-[80px] flex items-center justify-center text-center mb-6">
                    <p className="text-2xl font-bold text-white leading-relaxed drop-shadow-md">
                        {qTeam1?.text || 'Сұрақ...'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input 
                          ref={inputRef1}
                          type="text" 
                          inputMode="none" // Prevent mobile keyboard
                          value={inputTeam1}
                          onChange={(e) => setInputTeam1(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnswer('team1')}
                          placeholder="Жауап..." 
                          autoComplete="off"
                          disabled={!!winner}
                          className="w-full p-4 rounded-lg bg-black/20 border-2 border-white/30 text-white placeholder-blue-200 focus:outline-none focus:border-white focus:bg-black/30 transition-all text-lg font-medium"
                        />
                        <div className={`absolute -top-10 left-0 right-0 text-center font-bold text-lg transition-opacity duration-300 ${msgTeam1 ? 'opacity-100' : 'opacity-0'} ${msgTeam1?.type === 'success' ? 'text-green-300' : 'text-yellow-300'}`}>
                          {msgTeam1?.text}
                        </div>
                    </div>
                    
                    {!winner && renderKeyboard('team1')}

                    <button 
                      onClick={() => handleAnswer('team1')} 
                      disabled={!!winner}
                      className="w-full bg-white text-blue-600 font-black py-4 rounded-lg hover:bg-blue-50 active:scale-95 transition-all shadow-lg text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ЖАУАП БЕРУ
                    </button>
                </div>
            </div>
        </div>

        {/* TEAM 2 */}
        <div className="flex-1 bg-red-600 p-6 flex flex-col justify-center items-center relative overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
            <h2 className="text-white text-2xl font-black mb-4 bg-red-800/30 px-6 py-2 rounded-full backdrop-blur-sm">2-КОМАНДА</h2>
            
            <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl flex flex-col">
                <div className="min-h-[80px] flex items-center justify-center text-center mb-6">
                    <p className="text-2xl font-bold text-white leading-relaxed drop-shadow-md">
                        {qTeam2?.text || 'Сұрақ...'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input 
                          ref={inputRef2}
                          type="text" 
                          inputMode="none" 
                          value={inputTeam2}
                          onChange={(e) => setInputTeam2(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnswer('team2')}
                          placeholder="Жауап..." 
                          autoComplete="off"
                          disabled={!!winner}
                          className="w-full p-4 rounded-lg bg-black/20 border-2 border-white/30 text-white placeholder-red-200 focus:outline-none focus:border-white focus:bg-black/30 transition-all text-lg font-medium"
                        />
                        <div className={`absolute -top-10 left-0 right-0 text-center font-bold text-lg transition-opacity duration-300 ${msgTeam2 ? 'opacity-100' : 'opacity-0'} ${msgTeam2?.type === 'success' ? 'text-green-300' : 'text-yellow-300'}`}>
                          {msgTeam2?.text}
                        </div>
                    </div>
                    
                    {!winner && renderKeyboard('team2')}

                    <button 
                      onClick={() => handleAnswer('team2')}
                      disabled={!!winner} 
                      className="w-full bg-white text-red-600 font-black py-4 rounded-lg hover:bg-red-50 active:scale-95 transition-all shadow-lg text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ЖАУАП БЕРУ
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* WINNER OVERLAY */}
      {winner && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-2xl transform scale-110 animate-[fadeIn_0.3s_ease-out]">
            <div className="mx-auto mb-6 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <h2 className="text-5xl font-black mb-4 uppercase">
              {winner === 'team1' ? '1-КОМАНДА ЖЕҢДІ!' : '2-КОМАНДА ЖЕҢДІ!'}
            </h2>
            <p className="text-gray-500 mb-8 text-xl">Құттықтаймыз!</p>
            <button onClick={resetGame} className="bg-gray-900 text-white text-xl font-bold py-4 px-10 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-3 mx-auto shadow-xl hover:shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                Қайта ойнау
            </button>
          </div>
        </div>
      )}

      {/* TEACHER PANEL */}
      <TeacherPanel 
        isOpen={showTeacherPanel} 
        onClose={() => setShowTeacherPanel(false)}
        sets={sets}
        currentSetId={currentSetId}
        onChangeSet={setCurrentSetId}
        onCreateSet={handleCreateSet}
        onDeleteSet={handleDeleteSet}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
      />
    </div>
  );
}