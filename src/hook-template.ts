export const HOOK_SCRIPT = `
const fs = require('fs');
const path = require('path');

const TARGET_PATTERN = /@gemini/i;
const IGNORE_DIRS = ['.git', 'node_modules', '.gemini', 'dist'];
const WATCH_EXTENSIONS = ['.js', '.ts', '.py', '.go', '.md', '.txt', '.java', '.cpp', '.c', '.h', '.rs'];

function findTodos(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (IGNORE_DIRS.includes(file)) continue;
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                if (findTodos(fullPath)) return true;
            } else if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                if (WATCH_EXTENSIONS.includes(ext)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (TARGET_PATTERN.test(content)) return true;
                }
            }
        }
    } catch (e) {}
    return false;
}

function waitForChange() {
    process.stderr.write("Waiting for file changes...\\n");
    return new Promise((resolve) => {
        const watcher = fs.watch('.', { recursive: true }, (eventType, filename) => {
            if (filename) {
                const normalizedFilename = filename.replace(/\\\\/g, '/');
                const isIgnored = IGNORE_DIRS.some(dir => normalizedFilename.startsWith(dir + '/') || normalizedFilename === dir);
                const ext = path.extname(normalizedFilename).toLowerCase();
                if (!isIgnored && WATCH_EXTENSIONS.includes(ext)) {
                    process.stderr.write("Change detected in " + filename + "\\n");
                    watcher.close();
                    resolve();
                }
            }
        });
    });
}

async function run() {
    if (findTodos('.')) {
        console.log(JSON.stringify({
            decision: "deny",
            reason: "I found @gemini TODOs. Please resolve them now.",
            systemMessage: "🔍 TODOs detected. Starting resolution..."
        }));
    } else {
        await waitForChange();
        console.log(JSON.stringify({
            decision: "deny",
            reason: "File change detected. Check for new @gemini tags.",
            systemMessage: "🔄 File changed. Scanning..."
        }));
    }
}

run().catch(err => {
    process.stderr.write("Error in hook: " + err.message + "\\n");
    process.exit(1);
});
`;
