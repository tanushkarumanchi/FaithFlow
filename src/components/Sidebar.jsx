import React, { useState } from 'react';
import { Book as BookIcon, Search, ChevronRight } from 'lucide-react';

const Sidebar = ({ books, selectedBook, onSelectBook, isCollapsed }) => {
    const [search, setSearch] = useState('');

    const filteredBooks = books.filter(b =>
        b.en.toLowerCase().includes(search.toLowerCase()) ||
        b.te.includes(search)
    );

    return (
        <aside
            className={`glass-morphism h-screen fixed left-0 top-0 z-30 transition-all duration-300 flex flex-col overflow-hidden ${isCollapsed ? 'w-20' : 'w-72'
                }`}
        >
            {/* Brand area */}
            <div className="p-6 border-b border-white/10 flex-shrink-0">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 mb-6">
                        <h1 className="text-xl font-bold tracking-tight text-white">FaithFlow</h1>
                    </div>
                ) : (
                    <div className="flex justify-center mb-6">
                        <BookIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                )}

                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none`} />
                    <input
                        type="text"
                        placeholder={isCollapsed ? "" : "Search books..."}
                        className={`w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isCollapsed ? 'opacity-0' : 'opacity-100'
                            }`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isCollapsed}
                    />
                </div>
            </div>

            {/* Book List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col space-y-1">
                {filteredBooks.map((book) => (
                    <button
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative ${selectedBook?.id === book.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'hover:bg-white/5 text-slate-400 hover:text-white'
                            }`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedBook?.id === book.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                            }`}>
                            {book.en[0]}
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-semibold truncate">{book.en}</p>
                                <p className={`text-[10px] truncate opacity-70 font-telugu-text`}>
                                    {book.te}
                                </p>
                            </div>
                        )}

                        {!isCollapsed && selectedBook?.id === book.id && (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}

                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                {book.en} / {book.te}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
