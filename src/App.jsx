import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import { getBooks, fetchBibleData } from './services/bibleService';
import { Languages, ChevronLeft, ChevronRight, Menu, Share2, Download, X, Check, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ShareModal = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = React.useState(false);
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  const networkUrl = "https://tanushkarumanchi07-gif.github.io/faithflow/";
  // Use current origin if not localhost, otherwise use the network IP
  const displayUrl = isLocalhost ? networkUrl : url;

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-sm modal-content rounded-3xl p-8 animate-modal relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Share FaithFlow</h3>
          <p className="text-slate-400 text-sm">Let others experience the word.</p>
        </div>

        {isLocalhost && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <p className="text-amber-400 text-xs font-medium mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Mobile Sharing Note
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              To share with phones on your Wi-Fi, use the network link below instead of localhost.
            </p>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl flex justify-center mb-6 shadow-2xl shadow-indigo-500/10">
          <QRCodeSVG value={displayUrl} size={180} />
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <input
              type="text"
              readOnly
              value={displayUrl}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-slate-300 focus:outline-none"
            />
            <button
              onClick={() => handleCopy(displayUrl)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-95"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          {isLocalhost && (
            <p className="text-center text-[10px] text-slate-500 italic">
              Network IP: 10.3.143.55
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [bookDataEn, setBookDataEn] = useState(null);
  const [bookDataTe, setBookDataTe] = useState(null);
  const [languageMode, setLanguageMode] = useState('dual');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const shareUrl = window.location.origin;

  useEffect(() => {
    getBooks().then(data => {
      setBooks(data);
      if (data.length > 0) setSelectedBook(data[0]);
    });
  }, []);

  useEffect(() => {
    if (selectedBook) {
      setLoading(true);
      const enPromise = fetchBibleData('en', selectedBook.id).catch(() => null);
      const tePromise = fetchBibleData('te', selectedBook.id).catch(() => null);

      Promise.all([enPromise, tePromise]).then(([en, te]) => {
        setBookDataEn(en);
        setBookDataTe(te);
        setLoading(false);
      });
    }
  }, [selectedBook]);

  const handleNextChapter = () => {
    if (selectedBook && currentChapter < selectedBook.chapters) {
      setCurrentChapter(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cycleLanguage = () => {
    const modes = ['en', 'te', 'dual', 'staggered'];
    const nextIndex = (modes.indexOf(languageMode) + 1) % modes.length;
    setLanguageMode(modes[nextIndex]);
  };

  return (
    <div className="flex bg-[#0a0a0f] text-slate-200 min-h-screen">
      {/* Sidebar is fixed, so it doesn't need to be in the flex flow for width, but we use a spacer */}
      <Sidebar
        books={books}
        selectedBook={selectedBook}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setCurrentChapter(1);
        }}
        isCollapsed={isSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-72'
          }`}
      >
        <header className="sticky top-0 z-20 glass-morphism px-8 py-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white border border-white/5"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {selectedBook?.en} <span className="text-slate-600 font-light translate-y-[1px]">/</span> <span className="text-indigo-400">Chapter {currentChapter}</span>
              </h2>
              <p className="text-[12px] text-slate-500 font-telugu-text font-medium mt-0.5">
                {selectedBook?.te} / అధ్యాయం {currentChapter}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-all text-sm font-semibold"
            >
              <Languages size={16} />
              {languageMode === 'en' ? 'English' : languageMode === 'te' ? 'Telugu' : languageMode === 'dual' ? 'Side-by-Side' : 'Parallel & Staggered'}
            </button>

            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapter === 1}
                className="p-2 hover:bg-white/10 disabled:opacity-20 rounded-lg transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-10 text-center text-sm font-bold text-slate-200">
                {currentChapter}
              </div>
              <button
                onClick={handleNextChapter}
                disabled={!selectedBook || currentChapter === selectedBook.chapters}
                className="p-2 hover:bg-white/10 disabled:opacity-20 rounded-lg transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all"
              title="Share"
            >
              <Share2 size={18} />
            </button>

            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="p-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 rounded-xl border border-indigo-500/20 transition-all font-semibold flex items-center gap-2"
              >
                <Download size={18} />
                <span className="hidden md:inline text-sm">Install</span>
              </button>
            )}
          </div>
        </header>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          url={shareUrl}
        />

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full scale-110"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin scale-110"></div>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-slate-300">Gathering Scriptures...</p>
                <p className="text-sm text-slate-500 mt-2 italic">Preparing the word for you.</p>
              </div>
            </div>
          ) : (
            <Reader
              bookDataEn={bookDataEn}
              bookDataTe={bookDataTe}
              currentChapter={currentChapter}
              languageMode={languageMode}
            />
          )}

          {/* Bottom Floating Nav */}
          {!loading && (
            <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none z-10 transition-all duration-300">
              <div className={`glass-morphism px-8 py-3 rounded-2xl flex gap-16 pointer-events-auto border-white/10 shadow-2xl transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'
                }`}>
                <button
                  onClick={handlePrevChapter}
                  disabled={currentChapter === 1}
                  className="flex items-center gap-2 text-sm font-semibold hover:text-indigo-400 disabled:opacity-20 transition-colors"
                >
                  <ChevronLeft size={18} /> PREV
                </button>
                <button
                  onClick={handleNextChapter}
                  disabled={!selectedBook || currentChapter === selectedBook.chapters}
                  className="flex items-center gap-2 text-sm font-semibold hover:text-indigo-400 disabled:opacity-20 transition-colors"
                >
                  NEXT <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
