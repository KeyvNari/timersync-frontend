// Simple Express server to serve static files from dist directory
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the dist directory
// The { index: false } option prevents serving index.html automatically for directory requests
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('sitemap.xml')) {
      res.set('Content-Type', 'application/xml');
    }
  }
}));

// SPA fallback - serve index.html for all routes not handled by static middleware
// express.static only passes control here if the file doesn't exist
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
