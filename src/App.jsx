
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  History,
  Bookmark,
  StickyNote,
  Highlighter,
  Trash2,
  Clock,
  BookMarked
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const SITE_URL = 'https://faith-flow-pied.vercel.app/';

const readSaved = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const saveItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
  }
};

const ShareModal = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayUrl =
    url.includes('localhost') || url.includes('127.0.0.1')
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020711]/85 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md rounded-[28px] border border-[#c9a96e]/20 bg-[#101c2d] p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close share window"
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

const featureItems = [
  { id: 'history', label: 'History', icon: History },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'highlights', label: 'Highlights', icon: Highlighter }
];

const SavedVerseList = ({ items, emptyText, onOpen, onRemove, showNote = false }) => {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-9 text-center">
        <BookOpen size={27} className="mb-3 text-[#9c8156]" />
        <p className="text-sm text-[#e3d2b1]">Nothing here yet</p>
        <p className="mt-2 max-w-xs text-xs text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="group flex items-start gap-3 rounded-xl border border-[#c9a96e]/15 bg-white/[0.035] p-3 transition hover:border-[#c9a96e]/35"
        >
          <button
            onClick={() => onOpen(item)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="text-xs font-semibold text-[#d9bd8c]">
              {item.bookName} · Chapter {item.chapter}
              {item.verse ? ` · Verse ${item.verse}` : ''}
            </p>

            {item.text && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">
                {item.text}
              </p>
            )}

            {showNote && item.note && (
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#c9b58f]">
                {item.note}
              </p>
            )}

            {item.date && (
              <p className="mt-2 text-[10px] text-slate-500">
                {new Date(item.date).toLocaleString()}
              </p>
            )}
          </button>

          <button
            onClick={() => onRemove(item.id)}
            title="Remove"
            aria-label="Remove saved item"
            className="rounded-lg p-2 text-slate-500 opacity-70 transition hover:bg-red-400/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

const FeaturePanel = ({
  activeFeature,
  history,
  bookmarks,
  notes,
  highlights,
  onOpen,
  onRemove
}) => {
  const titles = {
    history: ['Reading History', 'Continue where you left off.'],
    bookmarks: ['Your Bookmarks', 'Your saved Scripture passages.'],
    notes: ['Personal Notes', 'Thoughts and reflections you have written.'],
    highlights: ['Highlighted Verses', 'Scripture passages you have highlighted.']
  };

  const [title, subtitle] = titles[activeFeature] || titles.history;

  const content = {
    history: history,
    bookmarks: bookmarks,
    notes: notes,
    highlights: highlights
  }[activeFeature] || [];

  const emptyText = {
    history: 'The chapters you read will appear here.',
    bookmarks: 'Tap the bookmark icon on any verse while reading.',
    notes: 'Add a personal note using the note icon on a verse.',
    highlights: 'Tap the highlighter icon on a verse to save it here.'
  }[activeFeature];

  return (
    <motion.div
      key={activeFeature}
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[24px] border border-[#c9a96e]/25 bg-[#101c2d]/[98%] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a96e]/25 bg-[#c9a96e]/10 text-[#d9bd8c]">
          {activeFeature === 'history' && <History size={19} />}
          {activeFeature === 'bookmarks' && <Bookmark size={19} />}
          {activeFeature === 'notes' && <StickyNote size={19} />}
          {activeFeature === 'highlights' && <Highlighter size={19} />}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="luxury-heading text-xl text-[#ead9b6]">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <SavedVerseList
        items={content}
        emptyText={emptyText}
        onOpen={onOpen}
        onRemove={(id) => onRemove(activeFeature, id)}
        showNote={activeFeature === 'notes'}
      />
    </motion.div>
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

  const [history, setHistory] = useState(() => readSaved('faithflow-history'));
  const [bookmarks, setBookmarks] = useState(() => readSaved('faithflow-bookmarks'));
  const [notes, setNotes] = useState(() => readSaved('faithflow-notes'));
  const [highlights, setHighlights] = useState(() => readSaved('faithflow-highlights'));

  const [activeFeature, setActiveFeature] = useState(null);
  const [touchStart, setTouchStart] = useState(null);

  const shareUrl = window.location.origin;

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  useEffect(() => saveItem('faithflow-history', history), [history]);
  useEffect(() => saveItem('faithflow-bookmarks', bookmarks), [bookmarks]);
  useEffect(() => saveItem('faithflow-notes', notes), [notes]);
  useEffect(() => saveItem('faithflow-highlights', highlights), [highlights]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

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
    return () => { cancelled = true; };
  }, []);

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
    return () => { cancelled = true; };
  }, [selectedBook]);

  useEffect(() => {
    if (!selectedBook) return;

    const entry = {
      id: `${selectedBook.id}-${currentChapter}`,
      bookId: selectedBook.id,
      bookName: selectedBook.en || 'Bible',
      chapter: currentChapter,
      date: new Date().toISOString()
    };

    setHistory((previous) => [
      entry,
      ...previous.filter((item) => item.id !== entry.id)
    ].slice(0, 40));
  }, [selectedBook, currentChapter]);

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

  const cycleLanguage = () => {
    const modes = ['en', 'te', 'dual', 'staggered'];
    const index = modes.indexOf(languageMode);
    setLanguageMode(modes[(index + 1) % modes.length]);
  };

  const languageLabel = {
    en: 'English',
    te: 'Telugu',
    dual: 'Side by Side',
    staggered: 'Staggered'
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((previous) => !previous);
  };

  const toggleSavedItem = (setter, item) => {
    setter((previous) =>
      previous.some((saved) => saved.id === item.id)
        ? previous.filter((saved) => saved.id !== item.id)
        : [{ ...item, date: new Date().toISOString() }, ...previous]
    );
  };

  const handleBookmark = (item) => toggleSavedItem(setBookmarks, item);
  const handleHighlight = (item) => toggleSavedItem(setHighlights, item);

  const handleNote = (item) => {
    const existing = notes.find((saved) => saved.id === item.id);
    const noteText = window.prompt(
      `Your note for ${item.bookName} ${item.chapter}:${item.verse}`,
      existing?.note || ''
    );

    if (noteText === null) return;

    if (!noteText.trim()) {
      setNotes((previous) => previous.filter((saved) => saved.id !== item.id));
      return;
    }

    setNotes((previous) => [
      { ...item, note: noteText.trim(), date: new Date().toISOString() },
      ...previous.filter((saved) => saved.id !== item.id)
    ]);
  };

  const openSavedItem = (item) => {
    const book = books.find((entry) => String(entry.id) === String(item.bookId));

    if (!book) return;

    setSelectedBook(book);
    setCurrentChapter(Number(item.chapter) || 1);
    setActiveFeature(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSavedItem = (feature, id) => {
    const setters = {
      history: setHistory,
      bookmarks: setBookmarks,
      notes: setNotes,
      highlights: setHighlights
    };

    setters[feature]?.((previous) => previous.filter((item) => item.id !== id));
  };

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;

    const difference = event.changedTouches[0].clientX - touchStart;
    const currentIndex = featureItems.findIndex(
      (item) => item.id === activeFeature
    );

    if (Math.abs(difference) > 60 && currentIndex !== -1) {
      const nextIndex = difference < 0
        ? Math.min(currentIndex + 1, featureItems.length - 1)
        : Math.max(currentIndex - 1, 0);

      setActiveFeature(featureItems[nextIndex].id);
    }

    setTouchStart(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#080f1c] text-[#eee8dc]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#243954]/20 blur-[130px]" />
        <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-[#a17b43]/[0.08] blur-[130px]" />
      </div>

      <Sidebar
        books={books}
        selectedBook={selectedBook}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setCurrentChapter(1);
          setIsSidebarCollapsed(true);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(true)}
      />

      <main
        className={`relative flex min-h-screen min-w-0 flex-col transition-all duration-300 ${
          isSidebarCollapsed
            ? 'ml-0 w-full'
            : 'ml-0 w-full md:ml-[300px] md:w-[calc(100%-300px)]'
        }`}
      >
        <header className="sticky top-0 z-20 flex min-h-[88px] items-center justify-between gap-3 border-b border-[#c9a96e]/10 bg-[#080f1c]/90 px-4 py-4 backdrop-blur-2xl sm:px-6 md:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              className="shrink-0 rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/[0.07] p-3 text-[#c9a96e] transition hover:bg-[#c9a96e]/15"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">
                THE HOLY SCRIPTURES
              </p>

              <h1 className="luxury-heading truncate text-lg text-[#f0e5d0] sm:text-xl md:text-2xl">
                {selectedBook?.en || 'FaithFlow'}
                <span className="mx-2 text-[#8c7653]">·</span>
                <span className="text-[#c9a96e]">Chapter {currentChapter}</span>
              </h1>

              <p className="truncate text-xs text-slate-500">
                {selectedBook?.te || 'శుభవార్త'} · అధ్యాయం {currentChapter}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-2 rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/[0.07] px-3 py-3 text-sm font-medium text-[#d9bd8c] transition hover:bg-[#c9a96e]/15 md:px-4"
            >
              <Languages size={17} />
              <span className="hidden sm:inline">{languageLabel[languageMode]}</span>
            </button>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] p-1">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapter === 1}
                className="rounded-lg p-2 text-[#c9a96e] transition hover:bg-white/10 disabled:opacity-20"
                aria-label="Previous chapter"
              >
                <ChevronLeft size={19} />
              </button>

              <span className="w-7 text-center text-sm font-semibold text-[#eee8dc]">
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

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/[0.07] p-3 text-[#c9a96e] transition hover:bg-[#c9a96e]/15"
              aria-label="Share FaithFlow"
            >
              <Share2 size={18} />
            </button>

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

        <section className="relative w-full flex-1 px-4 pb-44 pt-8 sm:px-6 md:px-8 md:pt-12">
          <div className="mx-auto mb-10 w-full max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/15 bg-[#c9a96e]/[0.05] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
              <Sparkles size={13} />
              A moment in the Word
            </div>

            <h2 className="luxury-heading text-3xl text-[#f0e5d0] sm:text-4xl md:text-5xl">
              Find Peace in His Word
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Read, reflect and grow through Scripture.
            </p>

            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a96e]/70 to-transparent" />
          </div>

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
              selectedBook={selectedBook}
              bookmarks={bookmarks}
              highlights={highlights}
              notes={notes}
              onBookmark={handleBookmark}
              onHighlight={handleHighlight}
              onNote={handleNote}
            />
          ) : (
            <div className="py-20 text-center text-slate-400">
              Unable to load Bible books. Please refresh the page.
            </div>
          )}
        </section>

        {!loading && selectedBook && (
          <div
            className={`fixed bottom-5 right-0 z-40 flex flex-col items-center gap-3 px-3 transition-all duration-300 ${
              isSidebarCollapsed ? 'left-0' : 'left-0 md:left-[300px]'
            }`}
          >
            <AnimatePresence mode="wait">
              {activeFeature && (
                <div
                  className="w-full max-w-xl"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <FeaturePanel
                    activeFeature={activeFeature}
                    history={history}
                    bookmarks={bookmarks}
                    notes={notes}
                    highlights={highlights}
                    onOpen={openSavedItem}
                    onRemove={removeSavedItem}
                  />
                </div>
              )}
            </AnimatePresence>

            <div className="flex w-full max-w-[440px] items-center justify-around gap-1 rounded-[22px] border border-[#c9a96e]/25 bg-[#101c2d]/95 p-2 shadow-[0_15px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:gap-3 sm:p-3">
              {featureItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeFeature === item.id;

                const counts = {
                  history: history.length,
                  bookmarks: bookmarks.length,
                  notes: notes.length,
                  highlights: highlights.length
                };

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveFeature(
                      isActive ? null : item.id
                    )}
                    aria-label={item.label}
                    aria-pressed={isActive}
                    className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 transition-colors ${
                      isActive ? 'text-[#f0d49b]' : 'text-slate-400 hover:text-[#e6d2ad]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="faithflow-active-feature"
                        className="absolute inset-0 rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/[0.12]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <span className="relative">
                      <Icon size={19} />
                      {counts[item.id] > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a96e] px-1 text-[9px] font-bold text-[#101827]">
                          {counts[item.id] > 99 ? '99+' : counts[item.id]}
                        </span>
                      )}
                    </span>

                    <span className="relative text-[9px] font-semibold tracking-wide sm:text-[10px]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
      />
    </div>
  );
};

export default App;
