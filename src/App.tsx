/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  History as HistoryIcon, 
  Home as HomeIcon, 
  Copy, 
  Wand2, 
  ShieldCheck, 
  History as HistoryEdu, 
  Zap, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  Star,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { transformText } from './services/geminiService';
import { Conversion, View, Tone } from './types';

// --- Components ---

const TONE_OPTIONS: { value: Tone; label: string; icon: string }[] = [
  { value: 'friendly', label: 'Friendly', icon: '😊' },
  { value: 'formal', label: 'Formal', icon: '👔' },
  { value: 'professor', label: 'Professor', icon: '🎓' },
  { value: 'boss', label: 'Boss', icon: '💼' },
  { value: 'partner', label: 'Partner', icon: '❤️' },
];

const Navbar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => (
  <header className="w-full bg-[#fcf8f9] dark:bg-slate-950 border-b border-surface-variant/10 sticky top-0 z-50">
    <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto w-full">
      <div 
        className="text-xl font-bold tracking-tighter text-[#323235] dark:text-slate-100 cursor-pointer"
        onClick={() => setView('home')}
      >
        PoliteWriter
      </div>
      <div className="hidden md:flex space-x-8 items-center">
        <button 
          onClick={() => setView('home')}
          className={`text-sm font-medium transition-colors ${currentView === 'home' || currentView === 'result' ? 'text-[#323235] dark:text-white border-b-2 border-[#595e6c] pb-1' : 'text-[#5f5f61] dark:text-slate-400 hover:text-[#323235]'}`}
        >
          Home
        </button>
        <button 
          onClick={() => setView('history')}
          className={`text-sm font-medium transition-colors ${currentView === 'history' ? 'text-[#323235] dark:text-white border-b-2 border-[#595e6c] pb-1' : 'text-[#5f5f61] dark:text-slate-400 hover:text-[#323235]'}`}
        >
          History
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-[#595e6c] dark:text-slate-300 hover:bg-[#f6f3f4] dark:hover:bg-slate-800 rounded-md transition-all active:scale-95 duration-200">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="w-full py-12 mt-auto bg-[#fcf8f9] dark:bg-slate-950 border-t border-surface-variant/10">
    <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto w-full opacity-80 text-[#5f5f61] dark:text-slate-400 text-[0.75rem] uppercase tracking-widest font-medium">
      <div className="mb-4 md:mb-0">
        © 2024 PoliteWriter Editorial. Designed for focus.
      </div>
      <div className="flex space-x-6">
        <a className="hover:text-[#595e6c] dark:hover:text-slate-300 transition-colors" href="#">Privacy</a>
        <a className="hover:text-[#595e6c] dark:hover:text-slate-300 transition-colors" href="#">Terms</a>
        <a className="hover:text-[#595e6c] dark:hover:text-slate-300 transition-colors" href="#">Support</a>
      </div>
    </div>
  </footer>
);

const Toast = ({ message, visible }: { message: string, visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div 
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        className="fixed bottom-8 left-1/2 glass-effect border border-outline-variant/10 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-[60] bg-white/80 backdrop-blur-md"
      >
        <CheckCircle2 size={16} className="text-[#595e6c]" />
        <span className="text-[0.75rem] uppercase tracking-widest font-bold text-[#323235]">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>('formal');
  const [isTransforming, setIsTransforming] = useState(false);
  const [currentResult, setCurrentResult] = useState<Conversion | null>(null);
  const [history, setHistory] = useState<Conversion[]>([]);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('polite_writer_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('polite_writer_history', JSON.stringify(history));
  }, [history]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const handleTransform = async () => {
    if (!inputText.trim()) return;
    setIsTransforming(true);
    try {
      const result = await transformText(inputText, selectedTone);
      const newConversion: Conversion = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
        originalText: inputText,
        politeText: result.politeText,
        toneInsight: result.toneInsight,
        editorialScore: result.editorialScore,
        tags: result.tags,
        isFavorite: false,
        tone: selectedTone,
      };
      setCurrentResult(newConversion);
      setHistory(prev => [newConversion, ...prev]);
      setView('result');
      setInputText('');
    } catch (error) {
      console.error("Transformation failed:", error);
      showToast("Transformation failed. Please try again.");
    } finally {
      setIsTransforming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Text Copied");
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col selection:bg-primary/20">
      <Navbar currentView={view} setView={setView} />
      
      <main className="flex-grow flex flex-col items-center px-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-primary-container rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-tertiary-container rounded-full blur-[140px]"></div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl z-10 py-12 md:py-24"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#323235] tracking-tighter mb-6">
                  Refine your perspective.
                </h1>
                <p className="text-[#5f5f61] text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                  Transform blunt communication into professional, editorial-grade correspondence instantly.
                </p>
              </div>

              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTone(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                      selectedTone === option.value
                        ? 'bg-[#595e6c] text-white border-[#595e6c] shadow-md'
                        : 'bg-white text-[#5f5f61] border-outline-variant/20 hover:border-[#595e6c]/50'
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <div className="bg-white rounded-2xl p-2 shadow-[0_12px_40px_rgba(50,50,53,0.06)] transition-all duration-300 focus-within:ring-2 focus-within:ring-[#595e6c]/10 border border-outline-variant/10">
                  <textarea 
                    className="w-full min-h-[280px] p-6 text-lg md:text-xl text-[#323235] placeholder:text-outline-variant bg-transparent border-none focus:ring-0 resize-none font-body leading-relaxed"
                    placeholder="Enter your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="flex items-center justify-between px-6 py-4 border-t border-surface-container">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[0.65rem] font-bold uppercase tracking-widest rounded-full">
                        Draft Mode
                      </span>
                      <span className="text-[0.65rem] text-[#5f5f61] font-medium tracking-widest uppercase ml-4">
                        {inputText.length} Characters
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => copyToClipboard(inputText)}
                        className="p-2 text-[#5f5f61] hover:bg-surface-container rounded-md transition-colors"
                      >
                        <Copy size={18} />
                      </button>
                      <button className="p-2 text-[#5f5f61] hover:bg-surface-container rounded-md transition-colors">
                        <Wand2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={handleTransform}
                    disabled={isTransforming || !inputText.trim()}
                    className="bg-gradient-to-br from-[#595e6c] to-[#4e525f] text-white px-10 py-5 rounded-xl font-semibold text-lg shadow-[0_12px_40px_rgba(50,50,53,0.1)] active:scale-95 hover:opacity-95 transition-all flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTransforming ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Zap size={20} />
                      </motion.div>
                    ) : (
                      <Zap size={20} />
                    )}
                    <span>{isTransforming ? 'Refining...' : 'Make it Polite'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-70">
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="text-[#595e6c] mb-3" size={24} />
                  <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[#5f5f61]">Private by Design</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <HistoryEdu className="text-[#595e6c] mb-3" size={24} />
                  <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[#5f5f61]">Editorial Precision</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="text-[#595e6c] mb-3" size={24} />
                  <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[#5f5f61]">Instant Clarity</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'result' && currentResult && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-5xl z-10 py-12 md:py-24"
            >
              <div className="w-full mb-12 space-y-2">
                <p className="text-[0.75rem] uppercase tracking-widest font-medium text-[#5f5f61]">Transformation Result</p>
                <h1 className="text-4xl font-bold tracking-tight text-[#323235]">Refined Polish</h1>
              </div>

              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-4">
                  <label className="text-[0.75rem] uppercase tracking-widest font-medium text-[#5f5f61] flex items-center gap-2">
                    <HistoryIcon size={14} />
                    Original Input
                  </label>
                  <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15">
                    <p className="text-[#5f5f61] leading-relaxed italic">
                      "{currentResult.originalText}"
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-1 flex justify-center py-4 lg:py-16">
                  <ArrowRight className="text-outline-variant rotate-90 lg:rotate-0" size={24} />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <label className="text-[0.75rem] uppercase tracking-widest font-medium text-[#5f5f61] flex items-center gap-2">
                    <Wand2 size={14} />
                    Polite Version ({TONE_OPTIONS.find(t => t.value === currentResult.tone)?.label})
                  </label>
                  <div className="bg-white p-8 rounded-2xl shadow-[0_12px_40px_rgba(50,50,53,0.06)] border border-outline-variant/10 relative group">
                    <div className="min-h-[120px]">
                      <p className="text-xl md:text-2xl text-[#323235] leading-relaxed font-medium">
                        "{currentResult.politeText}"
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex gap-2">
                        {currentResult.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[0.65rem] font-bold uppercase tracking-wider rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(currentResult.politeText)}
                        className="bg-gradient-to-br from-[#595e6c] to-[#4e525f] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                      >
                        <Copy size={16} />
                        Copy Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 flex flex-col justify-center">
                  <h3 className="text-[#323235] font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="text-[#595e6c]" size={20} />
                    Tone Insight
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {currentResult.toneInsight}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-[0_12px_40px_rgba(50,50,53,0.06)] border border-outline-variant/10 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="text-[#595e6c] mb-4" size={32} />
                  <h3 className="text-[#323235] font-semibold text-sm uppercase tracking-widest">Editorial Score</h3>
                  <p className="text-4xl font-bold text-[#323235] mt-2">{currentResult.editorialScore}%</p>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setView('home')}
                  className="flex items-center gap-2 text-[#5f5f61] hover:text-[#323235] font-medium transition-colors"
                >
                  <ArrowLeft size={18} />
                  Start New Refinement
                </button>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl z-10 py-12 md:py-24"
            >
              <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-[#323235] mb-3">Conversion History</h1>
                <p className="text-[#5f5f61] max-w-2xl text-lg">A curated archive of your text refinements. Reflect on past edits and maintain your professional voice.</p>
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-outline-variant/20 rounded-2xl bg-surface-container-low/30">
                  <HistoryEdu className="text-outline-variant mb-4" size={48} />
                  <p className="text-[#5f5f61] font-medium">No history yet. Start your first refinement!</p>
                  <button 
                    onClick={() => setView('home')}
                    className="mt-6 px-8 py-3 bg-[#595e6c] text-white rounded-full font-semibold hover:bg-[#4e525f] transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      className="bg-white rounded-2xl p-8 border border-outline-variant/10 shadow-[0_12px_40px_rgba(50,50,53,0.03)] hover:shadow-[0_12px_40px_rgba(50,50,53,0.06)] transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-grow space-y-6">
                          <div className="flex items-center gap-3">
                            <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[#5f5f61] bg-surface-container px-3 py-1 rounded-full">
                              {item.timestamp}
                            </span>
                            <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[#595e6c] border border-[#595e6c]/20 px-3 py-1 rounded-full">
                              {TONE_OPTIONS.find(t => t.value === item.tone)?.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                              <span className="text-[0.65rem] uppercase tracking-widest font-medium text-[#5f5f61] block">Original Input</span>
                              <p className="text-[#323235] text-lg font-medium leading-relaxed italic opacity-70">"{item.originalText}"</p>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[0.65rem] uppercase tracking-widest font-medium text-[#595e6c] block">Polite Refinement</span>
                              <p className="text-[#323235] text-lg font-bold leading-relaxed">"{item.politeText}"</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col gap-2 shrink-0">
                          <button 
                            onClick={() => copyToClipboard(item.politeText)}
                            className="p-3 text-[#5f5f61] hover:bg-surface-container-high rounded-xl transition-colors"
                            title="Copy"
                          >
                            <Copy size={20} />
                          </button>
                          <button 
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-3 rounded-xl transition-colors ${item.isFavorite ? 'text-[#595e6c] bg-primary-container' : 'text-[#5f5f61] hover:bg-surface-container-high'}`}
                            title="Favorite"
                          >
                            <Star size={20} fill={item.isFavorite ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="mt-8 flex flex-col items-center justify-center py-12 border-2 border-dashed border-outline-variant/20 rounded-2xl bg-surface-container-low/30">
                    <MoreHorizontal className="text-outline-variant mb-4" size={32} />
                    <p className="text-[#5f5f61] font-medium">Viewing {history.length} conversions</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
