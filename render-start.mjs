import { createServer } from 'node:http';
import { resolve } from 'node:path';
import handler from 'serve-handler';

const port = Number(process.env.PORT || 4173);
const publicDir = resolve('dist', 'jericho-portfolio', 'browser');

const server = createServer((request, response) => {
  return handler(request, response, {
    public: publicDir,
    cleanUrls: true,
    rewrites: [{ source: '**', destination: '/index.html' }]
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Render static server running on 0.0.0.0:${port}`);
  console.log(`Serving: ${publicDir}`);
});
