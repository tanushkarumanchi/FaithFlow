
import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ChevronRight,
  Crown
} from 'lucide-react';

const Sidebar = ({
  books,
  selectedBook,
  onSelectBook,
  isCollapsed
}) => {
  const [search, setSearch] = useState('');

  const filteredBooks = books.filter((book) =>
    book.en.toLowerCase().includes(search.toLowerCase()) ||
    book.te.includes(search)
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col overflow-hidden border-r border-[#c9a96e]/15 bg-[#0b1524] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand */}
      <div className="border-b border-[#c9a96e]/15 p-6">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#d8bb83]">
            <BookOpen size={23} />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="luxury-heading text-2xl tracking-wide text-[#ead9b6]">
                FaithFlow
              </h1>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#a98b5b]">
                Walk in His Word
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b69a6c]">
            <Crown size={13} />
            The Holy Scriptures
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a98b5b]"
          />

          <input
            type="text"
            placeholder={isCollapsed ? '' : 'Find a book...'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            disabled={isCollapsed}
            className={`w-full rounded-xl border border-[#c9a96e]/15 bg-white/[0.035] py-3 pl-10 pr-3 text-sm text-[#eee8dc] outline-none transition placeholder:text-slate-500 focus:border-[#c9a96e]/50 focus:bg-white/[0.06] ${
              isCollapsed ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>
      </div>

      {/* Book list */}
      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {!isCollapsed && (
          <p className="mb-3 px-3 pt-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Books of the Bible
          </p>
        )}

        {filteredBooks.map((book, index) => {
          const isSelected = selectedBook?.id === book.id;

          return (
            <button
              key={book.id}
              onClick={() => onSelectBook(book)}
              title={isCollapsed ? `${book.en} / ${book.te}` : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                isSelected
                  ? 'border border-[#c9a96e]/25 bg-[#c9a96e]/[0.10] text-[#ead9b6]'
                  : 'border border-transparent text-slate-400 hover:border-white/[0.05] hover:bg-white/[0.04] hover:text-[#eee8dc]'
              }`}
            >
              {/* Book initial */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? 'border border-[#c9a96e]/30 bg-[#c9a96e]/15 text-[#e4c68e]'
                    : 'bg-white/[0.045] text-slate-400 group-hover:bg-white/[0.08]'
                }`}
              >
                {book.en[0]}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${
                    isSelected ? 'text-[#ead9b6]' : ''
                  }`}>
                    {book.en}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {book.te}
                  </p>
                </div>
              )}

              {!isCollapsed && isSelected && (
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#c9a96e]"
                />
              )}

              {isSelected && (
                <span className="absolute bottom-3 left-0 top-3 w-[2px] rounded-full bg-[#d6b477]" />
              )}
            </button>
          );
        })}

        {filteredBooks.length === 0 && !isCollapsed && (
          <p className="px-3 py-8 text-center text-xs text-slate-500">
            No books found.
          </p>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-[#c9a96e]/10 p-5">
          <p className="luxury-heading text-center text-sm italic text-[#b69a6c]">
            His Word. Our Light.
          </p>
          <p className="mt-2 text-center text-[9px] uppercase tracking-[0.2em] text-slate-600">
            FaithFlow Bible
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
