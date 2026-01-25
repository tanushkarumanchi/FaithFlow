import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Reader = ({ bookDataEn, bookDataTe, currentChapter, languageMode }) => {
    const chapterEn = bookDataEn?.chapters?.find(c => parseInt(c.chapter) === currentChapter);
    const chapterTe = bookDataTe?.chapters?.find(c => parseInt(c.chapter) === currentChapter);

    if (!chapterEn && !chapterTe) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 italic">
                Loading scriptures...
            </div>
        );
    }

    // Combine verses for side-by-side view
    const verses = chapterEn?.verses || chapterTe?.verses || [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${bookDataEn?.book}-${currentChapter}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                >
                    {verses.map((verse, idx) => {
                        const verseEn = chapterEn?.verses[idx];
                        const verseTe = chapterTe?.verses[idx];

                        return (
                            <div
                                key={idx}
                                className={`verse-card p-6 rounded-2xl glass-morphism border-white/5 hover:border-indigo-500/20 group relative transition-all duration-500 ${languageMode === 'staggered' && idx % 2 === 1 ? 'md:translate-x-4 border-l-2 border-l-indigo-500/30' :
                                        languageMode === 'staggered' ? 'md:-translate-x-4 border-r-2 border-r-indigo-500/30' : ''
                                    }`}
                            >
                                <span className="absolute -left-2 top-6 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg group-hover:scale-110 transition-transform">
                                    {verse.verse}
                                </span>

                                <div className={`grid gap-6 ${languageMode === 'dual' || languageMode === 'staggered' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                                    {/* Handle alternating order for staggered mode */}
                                    {languageMode === 'staggered' && idx % 2 === 1 ? (
                                        <>
                                            {/* Telugu first for odd indices in staggered mode */}
                                            <p className="text-slate-300 leading-loose text-xl font-medium telugu-text order-2 md:order-1">
                                                {verseTe?.text}
                                            </p>
                                            <p className="text-slate-200 leading-relaxed text-lg font-light tracking-wide order-1 md:order-2">
                                                {verseEn?.text}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            {(languageMode === 'en' || languageMode === 'dual' || languageMode === 'staggered') && (
                                                <p className="text-slate-200 leading-relaxed text-lg font-light tracking-wide">
                                                    {verseEn?.text}
                                                </p>
                                            )}
                                            {(languageMode === 'te' || languageMode === 'dual' || languageMode === 'staggered') && (
                                                <p className="text-slate-300 leading-loose text-xl font-medium telugu-text">
                                                    {verseTe?.text}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Reader;
