const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../images');
const thresholdBytes = 500 * 1024; // 500KB

function findLargeImages(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            findLargeImages(filePath);
        } else {
            if (stats.size > thresholdBytes) {
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`LARGE IMAGE: ${filePath} (${sizeKB} KB)`);
            }
        }
    });
}

console.log('Checking for images strictly larger than 500KB...');
findLargeImages(directoryPath);
console.log('Done.');
