import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'core.js', 'map-view.js', 'geo-data.js', 'events.json', 'favicon.svg']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
await cp('vendor', 'dist/vendor', { recursive: true });
console.log('Built static site in dist/');
