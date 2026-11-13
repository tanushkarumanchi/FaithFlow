
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Bookmark,
  Highlighter,
  StickyNote,
  Check
} from 'lucide-react';

const Reader = ({
  bookDataEn,
  bookDataTe,
  currentChapter,
  languageMode,
  selectedBook,
  bookmarks = [],
  highlights = [],
  notes = [],
  onBookmark,
  onHighlight,
  onNote
}) => {
  const chapterEn = bookDataEn?.chapters?.find(
    (chapter) => parseInt(chapter.chapter, 10) === currentChapter
  );

  const chapterTe = bookDataTe?.chapters?.find(
    (chapter) => parseInt(chapter.chapter, 10) === currentChapter
  );

  if (!chapterEn && !chapterTe) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <BookOpen size={30} className="text-[#c9a96e]" />
        <p className="luxury-heading text-xl text-[#d8c49f]">
          Preparing Scripture...
        </p>
        <p className="text-sm text-slate-500">
          Your reading experience will begin shortly.
        </p>
      </div>
    );
  }

  const verses = chapterEn?.verses || chapterTe?.verses || [];

  const showEnglish = ['en', 'dual', 'staggered'].includes(languageMode);
  const showTelugu = ['te', 'dual', 'staggered'].includes(languageMode);
  const isDual = ['dual', 'staggered'].includes(languageMode);

  const bookName = selectedBook?.en || 'Bible';
  const bookId = selectedBook?.id || 'unknown';

  return (
    <div className="mx-auto w-full max-w-5xl px-2 pb-12 md:px-6">
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/[0.05] px-4 py-2">
          <BookOpen size={13} className="text-[#c9a96e]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Scripture Reading
          </span>
        </div>

        <h2 className="luxury-heading text-3xl text-[#ead9b6] md:text-4xl">
          Chapter {currentChapter}
        </h2>

        <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${bookId}-${currentChapter}-${languageMode}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          {verses.map((verse, index) => {
            const verseNumber = verse.verse ?? index + 1;
            const verseEn = chapterEn?.verses?.[index];
            const verseTe = chapterTe?.verses?.[index];

            const isStaggered =
              languageMode === 'staggered' && index % 2 === 1;

            const item = {
              id: `${bookId}-${currentChapter}-${verseNumber}`,
              bookId,
              bookName,
              chapter: currentChapter,
              verse: verseNumber,
              text: [
                verseEn?.text,
                verseTe?.text
              ].filter(Boolean).join(' / ')
            };

            const isBookmarked = bookmarks.some(
              (saved) => saved.id === item.id
            );

            const isHighlighted = highlights.some(
              (saved) => saved.id === item.id
            );

            const hasNote = notes.some(
              (saved) => saved.id === item.id
            );

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.015, 0.3)
                }}
                className={`group relative rounded-2xl border p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] transition-all duration-300 md:p-7 ${
                  isHighlighted
                    ? 'border-[#c9a96e]/50 bg-gradient-to-br from-[#493b27]/70 to-[#172238]'
                    : 'border-[#c9a96e]/[0.12] bg-gradient-to-br from-[#142238]/90 to-[#0d192a]/95 hover:border-[#c9a96e]/30'
                }`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#c9a96e]/25 bg-[#c9a96e]/[0.08] px-2 text-xs font-bold text-[#d9bc88]">
                    {verseNumber}
                  </span>

                  <div className="h-px flex-1 bg-gradient-to-r from-[#c9a96e]/20 to-transparent" />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onBookmark?.(item)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                      aria-label="Bookmark verse"
                      className={`rounded-lg p-2 transition ${
                        isBookmarked
                          ? 'bg-[#c9a96e]/20 text-[#e7c887]'
                          : 'text-slate-500 hover:bg-white/10 hover:text-[#d9bc88]'
                      }`}
                    >
                      <Bookmark size={17} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={() => onHighlight?.(item)}
                      title={isHighlighted ? 'Remove highlight' : 'Highlight verse'}
                      aria-label="Highlight verse"
                      className={`rounded-lg p-2 transition ${
                        isHighlighted
                          ? 'bg-[#c9a96e]/20 text-[#e7c887]'
                          : 'text-slate-500 hover:bg-white/10 hover:text-[#d9bc88]'
                      }`}
                    >
                      <Highlighter size={17} />
                    </button>

                    <button
                      onClick={() => onNote?.(item)}
                      title={hasNote ? 'Edit note' : 'Add note'}
                      aria-label="Add personal note"
                      className={`rounded-lg p-2 transition ${
                        hasNote
                          ? 'bg-[#c9a96e]/20 text-[#e7c887]'
                          : 'text-slate-500 hover:bg-white/10 hover:text-[#d9bc88]'
                      }`}
                    >
                      <StickyNote size={17} />
                    </button>
                  </div>
                </div>

                <div className={`grid gap-7 ${
                  isDual ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {showEnglish && (
                    <p className={`text-[17px] font-light leading-[2] tracking-[0.015em] text-[#e9e4da] md:text-lg ${
                      isStaggered ? 'md:order-2' : ''
                    }`}>
                      {verseEn?.text || ''}
                    </p>
                  )}

                  {showTelugu && (
                    <p className={`telugu-text text-lg font-medium leading-[2.1] text-[#c9c2b5] md:text-xl ${
                      isStaggered ? 'md:order-1' : ''
                    }`}>
                      {verseTe?.text || ''}
                    </p>
                  )}
                </div>

                {hasNote && (
                  <div className="mt-5 flex items-start gap-2 border-t border-[#c9a96e]/15 pt-4 text-xs text-[#d8bd8c]">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    Personal note saved
                  </div>
                )}
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-14 flex flex-col items-center text-center">
        <div className="mb-4 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <BookOpen size={19} className="text-[#b69a6c]" />
        <p className="luxury-heading mt-3 text-base italic text-[#b69a6c]">
          End of Chapter {currentChapter}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-600">
          Continue in His Word
        </p>
      </div>
    </div>
  );
};

export default Reader;
