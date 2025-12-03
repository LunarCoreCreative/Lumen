const https = require('https');

const OWNER = 'LunarCoreCreative';
const REPO = 'Lumen';
const TOKEN = process.env.GH_TOKEN;

if (!TOKEN) {
    console.error('❌ Error: GH_TOKEN environment variable is required.');
    console.error('Usage (PowerShell): $env:GH_TOKEN="your_token"; node scripts/delete-github-releases.js');
    process.exit(1);
}

const headers = {
    'User-Agent': 'Node.js Script',
    'Authorization': `Bearer ${TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
};

function request(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            method: method,
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : null);
                    } catch (e) {
                        resolve(null);
                    }
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function deleteAllReleases() {
    try {
        console.log(`🔍 Fetching releases for ${OWNER}/${REPO}...`);
        const releases = await request('GET', `/repos/${OWNER}/${REPO}/releases?per_page=100`);

        if (releases.length === 0) {
            console.log('✅ No releases found.');
            return;
        }

        console.log(`⚠️  Found ${releases.length} releases. Deleting...`);

        for (const release of releases) {
            console.log(`🗑️  Deleting release: ${release.name || release.tag_name} (ID: ${release.id})...`);

            // Delete the release
            await request('DELETE', `/repos/${OWNER}/${REPO}/releases/${release.id}`);

            // Delete the tag reference
            try {
                console.log(`   ↳ Deleting tag ref: tags/${release.tag_name}...`);
                await request('DELETE', `/repos/${OWNER}/${REPO}/git/refs/tags/${release.tag_name}`);
            } catch (tagError) {
                console.warn(`   ⚠️  Could not delete tag ${release.tag_name}: ${tagError.message}`);
            }
        }

        console.log('🎉 All releases deleted successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

deleteAllReleases();
