// A tiny web server for trying the game on this computer.
// Run it with:  npm start   (or: node tools/serve.js)
// Then open http://127.0.0.1:8000 in a browser. Press Ctrl+C to stop it.
// It only serves files from this folder, only to this computer, and needs no packages.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

function send(res, status, text){
  res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end(text);
}

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (e) { return send(res, 400, 'Bad request'); }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  // Hidden files and folders (such as .git) are never served.
  if (urlPath.split('/').some(part => part.startsWith('.'))) return send(res, 404, 'Not found');
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT + path.sep)) return send(res, 404, 'Not found');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found: ' + urlPath);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'   // always load the newest version of each file
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Little Monkey is running at http://127.0.0.1:${PORT}/`);
});
