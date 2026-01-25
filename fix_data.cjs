const fs = require('fs');
const path = require('path');
const https = require('https');

const failedBooks = ["1 Peter", "2 Peter", "1 John", "2 John", "3 John"];

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

    for (const book of failedBooks) {
        // Try with spaces directly or slightly different encoding
        const encodedBook = book.replace(/ /g, '%20');
        const enUrl = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${encodedBook}.json`;
        const teUrl = `https://raw.githubusercontent.com/aruljohn/Bible-telugu/master/${encodedBook}.json`;

        console.log(`Retrying ${book}...`);
        try {
            await Promise.all([
                download(enUrl, path.join(enDir, `${book}.json`)),
                download(teUrl, path.join(teDir, `${book}.json`))
            ]);
            console.log(`Success for ${book}`);
        } catch (err) {
            console.error(`Error retrying ${book}:`, err.message);
        }
    }
}

main();
