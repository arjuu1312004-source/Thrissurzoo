const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'visit-us.html',
  'virtual-tour.html',
  'events.html',
  'research.html',
  'jeevdarshini.html'
];

let totalErrors = 0;

pages.forEach(page => {
  if (!fs.existsSync(page)) {
    console.error('ERROR: Missing page file ' + page);
    totalErrors++;
    return;
  }

  const html = fs.readFileSync(page, 'utf8');
  console.log(`\nChecking ${page} (${html.length} bytes)...`);

  // Check img src
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src.startsWith('http') && !src.startsWith('data:')) {
      if (!fs.existsSync(src)) {
        console.warn(`  [WARN in ${page}] Image not found on disk: ${src}`);
        totalErrors++;
      }
    }
  }

  // Check internal href links
  const hrefRegex = /<a[^>]+href=["']([^"'#]+)["']/gi;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      if (!fs.existsSync(href)) {
        console.warn(`  [WARN in ${page}] Linked file not found: ${href}`);
        totalErrors++;
      }
    }
  }

  // Check title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  console.log('  Title:', titleMatch ? titleMatch[1] : 'MISSING TITLE');
});

console.log(`\n=== Verification complete. Total issues found: ${totalErrors} ===`);

