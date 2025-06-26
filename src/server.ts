import { serve } from 'bun';
import { resolve } from 'path';

const server = serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/index.js') {
      try {
        // Debug: Check current working directory and file path
        const filePath = './dist/index.js';
        const absolutePath = resolve(filePath);

        console.log('Current working directory:', process.cwd());
        console.log('Looking for file at:', absolutePath);

        const jsFile = Bun.file(filePath);

        // Return the file with proper content type
        return new Response(jsFile, {
          headers: {
            'Content-Type': 'application/javascript',
          },
        });
      } catch (error) {
        console.error('Error serving file:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    if (url.pathname === '/') {
      // put script at end so body is defined
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>React DevTools</title>
        </head>
        <body>
        </body>
        <div id="entry" />
            <script src="/index.js"></script>

        </html>
        `,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Listening on http://localhost:${server.port}`);
