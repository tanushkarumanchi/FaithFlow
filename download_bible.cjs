const fs = require('fs');
const path = require('path');
const https = require('https');

const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
    "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
    "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
    "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function main() {
    const enDir = path.join(__dirname, 'public/data/en');
    const teDir = path.join(__dirname, 'public/data/te');

    if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });
    if (!fs.existsSync(teDir)) fs.mkdirSync(teDir, { recursive: true });

    for (const book of books) {
        const encodedBook = encodeURIComponent(book);
        const enUrl = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${encodedBook}.json`;
        const teUrl = `https://raw.githubusercontent.com/aruljohn/Bible-telugu/master/${encodedBook}.json`;

        console.log(`Downloading ${book}...`);
        try {
            await Promise.all([
                download(enUrl, path.join(enDir, `${book}.json`)),
                download(teUrl, path.join(teDir, `${book}.json`))
            ]);
        } catch (err) {
            console.error(`Error downloading ${book}:`, err.message);
        }
    }
    console.log('All downloads complete!');
}

main();
