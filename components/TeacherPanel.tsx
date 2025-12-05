import React, { useState } from 'react';
import { Question, QuestionSet } from '../types';
import { Trash2, Plus, Save, BookOpen, X, AlertCircle } from 'lucide-react';

interface TeacherPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sets: Record<string, QuestionSet>;
  currentSetId: string;
  onSetChange: (setId: string) => void;
  onCreateSet: (name: string) => void;
  onDeleteSet: (setId: string) => void;
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  isOpen,
  onClose,
  sets,
  currentSetId,
  onSetChange,
  onCreateSet,
  onDeleteSet,
  onAddQuestion,
  onDeleteQuestion,
}) => {
  const [newSetName, setNewSetName] = useState('');
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  
  const [qText, setQText] = useState('');
  const [qAnswer, setQAnswer] = useState('');

  if (!isOpen) return null;

  const activeSet = sets[currentSetId];

  const handleCreateSet = () => {
    if (newSetName.trim()) {
      onCreateSet(newSetName);
      setNewSetName('');
      setIsCreatingSet(false);
    }
  };

  const handleAddQuestion = () => {
    if (qText.trim() && qAnswer.trim()) {
      // Simple random ID
      const newQ: Question = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        text: qText.trim(),
        answer: qAnswer.trim(),
      };
      onAddQuestion(newQ);
      setQText('');
      setQAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} />
            Мұғалім панелі
          </h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Section 1: Set Management */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3 uppercase text-sm tracking-wider">Сабақтар / Кластар</h3>
            
            {!isCreatingSet ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Қазіргі бөлімді таңдаңыз:</label>
                  <select 
                    value={currentSetId} 
                    onChange={(e) => onSetChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {Object.values(sets).map((set: QuestionSet) => (
                      <option key={set.id} value={set.id}>{set.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsCreatingSet(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus size={16} /> Жаңа бөлім
                  </button>
                  
                  {Object.keys(sets).length > 1 && (
                    <button 
                      onClick={() => {
                        if(window.confirm('Бұл бөлімді жоюға сенімдісіз бе? Барлық сұрақтар өшіріледі.')) onDeleteSet(currentSetId);
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition-colors"
                      title="Бөлімді жою"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700">Бөлім атауы:</label>
                <input 
                  type="text" 
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="Мысалы: 5-сынып · 4 желтоқсан"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleCreateSet}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded"
                  >
                    Құру
                  </button>
                  <button 
                    onClick={() => setIsCreatingSet(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 rounded"
                  >
                    Болдырмау
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Question Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Сұрақтар редакторы</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{activeSet?.questions.length || 0} сұрақ</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
               <div className="mb-3">
                 <label className="block text-xs font-semibold text-gray-500 mb-1">Сұрақ (информатика):</label>
                 <textarea 
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm"
                    rows={2}
                 />
               </div>
               <div className="mb-3">
                 <label className="block text-xs font-semibold text-gray-500 mb-1">Дұрыс жауап:</label>
                 <input 
                    type="text" 
                    value={qAnswer}
                    onChange={(e) => setQAnswer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm"
                 />
               </div>
               <button 
                onClick={handleAddQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-medium"
               >
                 <Save size={16} /> Сұрақты қосу
               </button>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              {activeSet && activeSet.questions.length > 0 ? (
                activeSet.questions.map((q, idx) => (
                  <div key={q.id} className="flex justify-between items-start bg-gray-50 p-3 rounded border border-gray-100 group hover:border-blue-200 transition-colors">
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-medium text-gray-800"><span className="text-gray-400 mr-1">{idx + 1}.</span> {q.text}</p>
                      <p className="text-xs text-green-600 mt-1 font-mono">{q.answer}</p>
                    </div>
                    {/* Always visible delete button for better UX on all devices */}
                    <button 
                      onClick={() => onDeleteQuestion(q.id)}
                      className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                      title="Сұрақты жою"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                    <AlertCircle size={32} className="mb-2 opacity-50"/>
                    <p>Бұл бөлімде сұрақтар жоқ.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};