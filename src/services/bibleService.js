export const fetchBibleData = async (lang, bookId) => {
  try {
    const response = await fetch(`data/${lang}/${bookId}.json`);
    if (!response.ok) throw new Error('Failed to fetch bible data');
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${bookId} in ${lang}:`, error);
    // Return mock data for Genesis if file not found, to keep app running
    if (bookId === 'Genesis') {
      const url = lang === 'en'
        ? 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/Genesis.json'
        : 'https://raw.githubusercontent.com/aruljohn/Bible-telugu/master/Genesis.json';
      
const fallbackRes = await fetch(url);

if (!fallbackRes.ok) {
  throw new Error('Failed to load Genesis fallback');
}

return await fallbackRes.json();

    }
    throw error;
  }
};


export const getBooks = async () => {
  try {
    const response = await fetch('data/books.json');

    if (!response.ok) {
      throw new Error('Failed to load books');
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading books:', error);
    throw error;
  }
};

