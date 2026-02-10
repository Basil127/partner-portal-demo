import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../src/lib/api-client');

function processDir(dir) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const fullPath = path.join(dir, file);
		if (fs.statSync(fullPath).isDirectory()) {
			processDir(fullPath);
		} else if (file.endsWith('.ts')) {
			let content = fs.readFileSync(fullPath, 'utf8');
			const newContent = content.replace(/\.js(['"])/g, '$1');
			if (content !== newContent) {
				fs.writeFileSync(fullPath, newContent);
				console.log(`Updated ${fullPath}`);
			}
		}
	}
}

processDir(targetDir);
