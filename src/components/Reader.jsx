
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const Reader = ({
  bookDataEn,
  bookDataTe,
  currentChapter,
  languageMode
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

  const showEnglish = languageMode === 'en' ||
    languageMode === 'dual' ||
    languageMode === 'staggered';

  const showTelugu = languageMode === 'te' ||
    languageMode === 'dual' ||
    languageMode === 'staggered';

  const isDual = languageMode === 'dual' ||
    languageMode === 'staggered';

  return (
    <div className="mx-auto w-full max-w-5xl px-2 pb-12 md:px-6">

      {/* Chapter introduction */}
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

      {/* Verses */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${bookDataEn?.book || bookDataTe?.book}-${currentChapter}-${languageMode}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          {verses.map((verse, index) => {
            const verseEn = chapterEn?.verses?.[index];
            const verseTe = chapterTe?.verses?.[index];

            const isStaggered = languageMode === 'staggered' &&
              index % 2 === 1;

            return (
              <motion.article
                key={`${currentChapter}-${verse.verse ?? index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index * 0.015, 0.3)
                }}
                className="group relative rounded-2xl border border-[#c9a96e]/[0.12] bg-gradient-to-br from-[#142238]/90 to-[#0d192a]/95 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-[#c9a96e]/30 hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] md:p-7"
              >
                {/* Verse number */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-[#c9a96e]/25 bg-[#c9a96e]/[0.08] px-2 text-xs font-bold text-[#d9bc88]">
                    {verse.verse ?? index + 1}
                  </span>

                  <div className="h-px flex-1 bg-gradient-to-r from-[#c9a96e]/20 to-transparent" />
                </div>

                {/* Scripture text */}
                <div className={`grid gap-7 ${
                  isDual ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>

                  {/* English */}
                  {showEnglish && (
                    <p
                      className={`text-[17px] font-light leading-[2] tracking-[0.015em] text-[#e9e4da] md:text-lg ${
                        isStaggered ? 'md:order-2' : ''
                      }`}
                    >
                      {verseEn?.text || ''}
                    </p>
                  )}

                  {/* Telugu */}
                  {showTelugu && (
                    <p
                      className={`telugu-text text-lg font-medium leading-[2.1] text-[#c9c2b5] md:text-xl ${
                        isStaggered ? 'md:order-1' : ''
                      }`}
                    >
                      {verseTe?.text || ''}
                    </p>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* End of chapter */}
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
