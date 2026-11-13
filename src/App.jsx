
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import { getBooks, fetchBibleData } from './services/bibleService';
import {
  Languages,
  ChevronLeft,
  ChevronRight,
  Menu,
  Share2,
  Download,
  X,
  Check,
  Copy,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const SITE_URL = 'https://faith-flow-pied.vercel.app/';

const ShareModal = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayUrl = url.includes('localhost') ||
    url.includes('127.0.0.1')
    ? SITE_URL
    : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Unable to copy link:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020711]/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-[28px] border border-[#c9a96e]/20 bg-[#101c2d] p-8 shadow-2xl">

        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#d8bb83]">
            <BookOpen size={26} />
          </div>

          <h2 className="luxury-heading text-3xl text-[#ead9b6]">
            Share FaithFlow
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Share the beauty of Scripture with others.
          </p>
        </div>

        <div className="mb-6 flex justify-center rounded-2xl bg-white p-5">
          <QRCodeSVG value={displayUrl} size={190} />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#c9a96e]/20 bg-white/[0.04] p-2">
          <input
            readOnly
            value={displayUrl}
            className="min-w-0 flex-1 bg-transparent px-3 text-xs text-slate-300 outline-none"
          />

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-3 text-xs font-bold text-[#101827] transition hover:bg-[#e0c28c]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          FaithFlow · A peaceful place for Scripture
        </p>
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

  const shareUrl = window.location.origin;

  // PWA installation support
  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Load Bible books
  useEffect(() => {
    let cancelled = false;

    const loadBooks = async () => {
      try {
        const data = await getBooks();

        if (cancelled) return;

        setBooks(data || []);

        if (data?.length > 0) {
          setSelectedBook(data[0]);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load Bible books:', error);
        if (!cancelled) setLoading(false);
      }
    };

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load English and Telugu Bible data
  useEffect(() => {
    if (!selectedBook) return;

    let cancelled = false;

    const loadChapterData = async () => {
      setLoading(true);

      try {
        const [englishData, teluguData] = await Promise.all([
          fetchBibleData('en', selectedBook.id),
          fetchBibleData('te', selectedBook.id)
        ]);

        if (!cancelled) {
          setBookDataEn(englishData);
          setBookDataTe(teluguData);
        }
      } catch (error) {
        console.error('Failed to load Bible data:', error);

        if (!cancelled) {
          setBookDataEn(null);
          setBookDataTe(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadChapterData();

    return () => {
      cancelled = true;
    };
  }, [selectedBook]);

  // Chapter navigation
  const handleNextChapter = () => {
    if (selectedBook && currentChapter < selectedBook.chapters) {
      setCurrentChapter((previous) => previous + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter((previous) => previous - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Language selection
  const cycleLanguage = () => {
    const modes = ['en', 'te', 'dual', 'staggered'];
    const currentIndex = modes.indexOf(languageMode);
    setLanguageMode(modes[(currentIndex + 1) % modes.length]);
  };

  const languageLabel = {
    en: 'English',
    te: 'Telugu',
    dual: 'Side by Side',
    staggered: 'Staggered'
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#080f1c] text-[#eee8dc]">

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#243954]/20 blur-[130px]" />
        <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-[#a17b43]/[0.08] blur-[130px]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        books={books}
        selectedBook={selectedBook}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setCurrentChapter(1);
        }}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main content */}
      <main
        className={`relative flex min-h-screen min-w-0 flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-72'
        }`}
      >

        {/* Header */}
        <header className="sticky top-0 z-20 flex min-h-[88px] items-center justify-between gap-4 border-b border-[#c9a96e]/10 bg-[#080f1c]/85 px-6 py-4 backdrop-blur-2xl md:px-9">

          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="rounded-xl border border-[#c9a96e]/15 bg-white/[0.03] p-3 text-[#c9a96e] transition hover:bg-[#c9a96e]/10"
              aria-label="Toggle sidebar"
            >
              <Menu size={19} />
            </button>

            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">
                THE HOLY SCRIPTURES
              </p>

              <h1 className="luxury-heading truncate text-xl text-[#f0e5d0] md:text-2xl">
                {selectedBook?.en || 'FaithFlow'}
                <span className="mx-2 text-[#8c7653]">·</span>
                <span className="text-[#c9a96e]">
                  Chapter {currentChapter}
                </span>
              </h1>

              <p className="truncate text-xs text-slate-500">
                {selectedBook?.te || 'శుభవార్త'}
                {' · '}
                అధ్యాయం {currentChapter}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">

            {/* Language button */}
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-2 rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/[0.07] px-3 py-3 text-sm font-medium text-[#d9bd8c] transition hover:bg-[#c9a96e]/15 md:px-4"
            >
              <Languages size={17} />
              <span className="hidden sm:inline">
                {languageLabel[languageMode]}
              </span>
            </button>

            {/* Chapter controls */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] p-1">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapter === 1}
                className="rounded-lg p-2 text-[#c9a96e] transition hover:bg-white/10 disabled:opacity-20"
                aria-label="Previous chapter"
              >
                <ChevronLeft size={19} />
              </button>

              <span className="w-8 text-center text-sm font-semibold text-[#eee8dc]">
                {currentChapter}
              </span>

              <button
                onClick={handleNextChapter}
                disabled={!selectedBook || currentChapter === selectedBook.chapters}
                className="rounded-lg p-2 text-[#c9a96e] transition hover:bg-white/10 disabled:opacity-20"
                aria-label="Next chapter"
              >
                <ChevronRight size={19} />
              </button>
            </div>

            {/* Share */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/[0.07] p-3 text-[#c9a96e] transition hover:bg-[#c9a96e]/15"
              aria-label="Share FaithFlow"
            >
              <Share2 size={18} />
            </button>

            {/* Install */}
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="hidden items-center gap-2 rounded-xl bg-[#c9a96e] px-4 py-3 text-sm font-semibold text-[#101827] transition hover:bg-[#e0c28c] sm:flex"
              >
                <Download size={17} />
                Install
              </button>
            )}
          </div>
        </header>

        {/* Reader area */}
        <section className="relative flex-1 px-4 pb-32 pt-8 md:px-8 md:pt-12">

          {/* Welcome heading */}
          <div className="mx-auto mb-10 max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/15 bg-[#c9a96e]/[0.05] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
              <Sparkles size={13} />
              A moment in the Word
            </div>

            <h2 className="luxury-heading text-3xl text-[#f0e5d0] md:text-5xl">
              Find Peace in His Word
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Read, reflect and grow through Scripture.
            </p>

            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a96e]/70 to-transparent" />
          </div>

          {/* Loading screen */}
          {loading ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-6">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#c9a96e]/15 border-t-[#c9a96e]" />
                <BookOpen size={23} className="text-[#c9a96e]" />
              </div>

              <div className="text-center">
                <p className="luxury-heading text-xl text-[#e7d5b2]">
                  Preparing Scripture
                </p>
                <p className="mt-2 text-xs tracking-wide text-slate-500">
                  A peaceful moment awaits...
                </p>
              </div>
            </div>
          ) : selectedBook ? (
            <Reader
              bookDataEn={bookDataEn}
              bookDataTe={bookDataTe}
              currentChapter={currentChapter}
              languageMode={languageMode}
            />
          ) : (
            <div className="py-20 text-center text-slate-400">
              Unable to load Bible books. Please refresh the page.
            </div>
          )}
        </section>

        {/* Bottom navigation */}
        {!loading && selectedBook && (
          <div className="fixed bottom-6 left-0 right-0 z-10 flex justify-center px-4 pointer-events-none">
            <div className={`pointer-events-auto flex items-center gap-8 rounded-2xl border border-[#c9a96e]/20 bg-[#101c2d]/90 px-6 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all duration-300 ${
              isSidebarCollapsed ? 'ml-20' : 'ml-72'
            }`}>
              <button
                onClick={handlePrevChapter}
                disabled={currentChapter === 1}
                className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d8bd8c] transition hover:text-white disabled:opacity-25"
              >
                <ChevronLeft size={17} />
                PREVIOUS
              </button>

              <div className="h-5 w-px bg-[#c9a96e]/20" />

              <span className="text-xs text-slate-400">
                {currentChapter} / {selectedBook.chapters}
              </span>

              <div className="h-5 w-px bg-[#c9a96e]/20" />

              <button
                onClick={handleNextChapter}
                disabled={currentChapter === selectedBook.chapters}
                className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d8bd8c] transition hover:text-white disabled:opacity-25"
              >
                NEXT
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Share modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
      />
    </div>
  );
};

export default App;
