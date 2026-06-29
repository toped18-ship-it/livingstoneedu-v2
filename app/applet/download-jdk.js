const fs = require('fs');
const https = require('https');
const { spawnSync } = require('child_process');

const jdkUrl = 'https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse';
const destFile = '/tmp/jdk17.tar.gz';
const destDir = '/tmp/jdk17';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
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
    console.log('Downloading JDK 17 from adoptium...');
    try {
        await downloadFile(jdkUrl, destFile);
        console.log('Download complete. Extracting to ' + destDir + '...');
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        const tarResult = spawnSync('tar', ['-xzf', destFile, '-C', destDir, '--strip-components=1']);
        if (tarResult.status !== 0) {
            throw new Error(`tar failed with status ${tarResult.status}: ${tarResult.stderr.toString()}`);
        }
        console.log('JDK 17 extracted successfully.');
        fs.unlinkSync(destFile);
        console.log('Temporary archive cleaned up.');
    } catch (e) {
        console.error('Error during JDK setup:', e);
        process.exit(1);
    }
}

main();
