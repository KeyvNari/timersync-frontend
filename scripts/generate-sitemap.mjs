import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const timerPresetsPath = path.join(projectRoot, 'src', 'config', 'timerPresets.ts');

// Read and parse timerPresets
function getTimerPresets() {
  try {
    const content = fs.readFileSync(timerPresetsPath, 'utf-8');

    // Extract the timerPresets array using regex
    const match = content.match(/export const timerPresets: TimerPreset\[\] = \[([\s\S]*?)\];/);
    if (!match) {
      console.error('Could not find timerPresets array in timerPresets.ts');
      process.exit(1);
    }

    // Simple parsing - extract slug values
    const slugMatches = content.matchAll(/slug: '([^']+)'/g);
    const slugs = Array.from(slugMatches).map((m) => m[1]);

    return slugs;
  } catch (error) {
    console.error('Error reading timerPresets:', error);
    process.exit(1);
  }
}

function generateSitemap() {
  const baseUrl = 'https://verotime.com'; // Update with your actual domain
  const slugs = getTimerPresets();
  const now = new Date().toISOString().split('T')[0];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add homepage
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${baseUrl}/</loc>\n`;
  sitemap += `    <lastmod>${now}</lastmod>\n`;
  sitemap += `    <changefreq>weekly</changefreq>\n`;
  sitemap += `    <priority>1.0</priority>\n`;
  sitemap += `  </url>\n`;

  // Add timer pages
  slugs.forEach((slug) => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}/timers/${slug}</loc>\n`;
    sitemap += `    <lastmod>${now}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += '</urlset>';

  // Write to public directory
  const outputPath = path.join(projectRoot, 'public', 'sitemap.xml');
  const outputDir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, sitemap);
  console.log(`✓ Sitemap generated: ${outputPath}`);
  console.log(`✓ Included ${slugs.length} timer pages`);
}

generateSitemap();
