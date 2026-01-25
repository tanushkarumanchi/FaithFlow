const fs = require('fs');
const path = require('path');
const https = require('https');

const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
    "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
    "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
    "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
    "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
    "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => reject(new Error(`Status ${response.statusCode}`)));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function repairBook(book, lang, dir) {
    const variations = [
        book,
        book.replace(/\s/g, ''),
        book.replace(/\s/g, '_')
    ];

    if (lang === 'te' && book === 'Song of Solomon') {
        variations.push('Song of Songs');
    }

    const baseUrl = lang === 'en'
        ? 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/'
        : 'https://raw.githubusercontent.com/aruljohn/Bible-telugu/master/';

    for (const v of variations) {
        const url = `${baseUrl}${encodeURIComponent(v)}.json`;
        const dest = path.join(dir, `${book}.json`);
        try {
            await download(url, dest);
            const stats = fs.statSync(dest);
            if (stats.size > 100) {
                console.log(`[PASS] ${lang} ${book} using ${v}`);
                return true;
            }
        } catch (e) {
            // Try next variation
        }
    }
    console.error(`[FAIL] ${lang} ${book} failed all variations`);
    return false;
}

async function main() {
    const enDir = path.join(__dirname, 'public/data/en');
    const teDir = path.join(__dirname, 'public/data/te');

    if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
    if (!fs.existsSync(teDir)) fs.mkdirSync(teDir, { recursive: true });

    let successCount = 0;
    for (const book of books) {
        const [enRes, teRes] = await Promise.all([
            repairBook(book, 'en', enDir),
            repairBook(book, 'te', teDir)
        ]);
        if (enRes && teRes) successCount++;
    }

    console.log(`\nRepair complete. Success: ${successCount}/66`);
}

main();
