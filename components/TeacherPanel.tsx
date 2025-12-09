import React, { useState } from 'react';
import { Question, QuestionSet } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sets: Record<string, QuestionSet>;
  currentSetId: string;
  onChangeSet: (id: string) => void;
  onCreateSet: (name: string) => void;
  onDeleteSet: () => void;
  onAddQuestion: (q: Omit<Question, 'id'>) => void;
  onDeleteQuestion: (id: string) => void;
}

export const TeacherPanel: React.FC<Props> = ({
  isOpen, onClose, sets, currentSetId, onChangeSet, onCreateSet, onDeleteSet, onAddQuestion, onDeleteQuestion
}) => {
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newQText, setNewQText] = useState('');
  const [newQAnswer, setNewQAnswer] = useState('');

  if (!isOpen) return null;

  const currentSet = sets[currentSetId];

  const handleCreateSet = () => {
    if (newSetName.trim()) {
      onCreateSet(newSetName.trim());
      setNewSetName('');
      setShowCreateSet(false);
    }
  };

  const handleAddQuestion = () => {
    if (newQText.trim() && newQAnswer.trim()) {
      onAddQuestion({ text: newQText.trim(), answer: newQAnswer.trim() });
      setNewQText('');
      setNewQAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">
        {/* Header */}
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-md">
            <h2 className="text-xl font-bold flex items-center gap-2">
                Мұғалім панелі
            </h2>
            <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Set Management */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 uppercase text-sm tracking-wider">Сабақтар / Кластар</h3>
                
                {!showCreateSet ? (
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Қазіргі бөлім:</label>
                          <select 
                            value={currentSetId} 
                            onChange={(e) => onChangeSet(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          >
                            {Object.values(sets).map((set: QuestionSet) => (
                              <option key={set.id} value={set.id}>{set.name} ({set.questions.length} сұрақ)</option>
                            ))}
                          </select>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setShowCreateSet(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors">
                              Жаңа бөлім
                          </button>
                          <button onClick={onDeleteSet} className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition-colors" title="Бөлімді жою">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                      </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700">Бөлім атауы:</label>
                      <input 
                        type="text" 
                        value={newSetName}
                        onChange={(e) => setNewSetName(e.target.value)}
                        placeholder="Мысалы: 5-сынып" 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                      />
                      <div className="flex gap-2">
                          <button onClick={handleCreateSet} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded">Құру</button>
                          <button onClick={() => setShowCreateSet(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 rounded">Болдырмау</button>
                      </div>
                  </div>
                )}
            </div>

            {/* Question Editor */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800 uppercase text-sm tracking-wider">Сұрақтар редакторы</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{currentSet?.questions.length || 0} сұрақ</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                    <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Сұрақ:</label>
                        <textarea 
                          value={newQText}
                          onChange={(e) => setNewQText(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm" 
                          rows={2}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Дұрыс жауап:</label>
                        <input 
                          type="text" 
                          value={newQAnswer}
                          onChange={(e) => setNewQAnswer(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm"
                        />
                    </div>
                    <button onClick={handleAddQuestion} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 transition-colors font-medium">
                        Сұрақты қосу
                    </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {currentSet?.questions.map((q, idx) => (
                      <div key={q.id} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-start group">
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{idx + 1}. {q.text}</p>
                          <p className="text-green-600 text-xs mt-1 font-bold">{q.answer}</p>
                        </div>
                        <button onClick={() => onDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                    {(!currentSet || currentSet.questions.length === 0) && (
                      <p className="text-center text-gray-400 text-sm py-4">Сұрақтар жоқ</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};