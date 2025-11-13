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

// Serve static landing.html for root path - this ensures Google sees the static HTML
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'landing.html'));
});

// Serve static landing.html for /landing path as well
app.get('/landing', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'landing.html'));
});

// SPA fallback - serve index.html for all other routes not handled by static middleware
// This includes /auth/*, /dashboard/*, /timers/*, /docs/*, etc.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
