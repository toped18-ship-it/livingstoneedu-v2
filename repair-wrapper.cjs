const fs = require('fs');
const https = require('https');

const wrapperJarUrl = 'https://github.com/ionic-team/capacitor/raw/main/android/gradle/wrapper/gradle-wrapper.jar';
const destFile = './android/gradle/wrapper/gradle-wrapper.jar';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        });
        request.on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function main() {
    console.log('Downloading official gradle-wrapper.jar...');
    try {
        await downloadFile(wrapperJarUrl, destFile);
        console.log('Successfully repaired gradle-wrapper.jar!');
    } catch (e) {
        console.error('Error repairing gradle-wrapper.jar:', e);
        process.exit(1);
    }
}

main();
