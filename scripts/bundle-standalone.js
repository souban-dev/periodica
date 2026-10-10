import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const distHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distHtmlPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let html = fs.readFileSync(distHtmlPath, 'utf8');

// Find CSS file
const cssTagRegex = /<link\b[^>]*\bhref=["']([^"']+\.css)["'][^>]*>/i;
const cssMatch = html.match(cssTagRegex);
let cssContent = '';
if (cssMatch) {
  const cssHref = cssMatch[1];
  const cssFileName = path.basename(cssHref);
  const cssFilePath = path.join(distDir, 'assets', cssFileName);
  if (fs.existsSync(cssFilePath)) {
    cssContent = fs.readFileSync(cssFilePath, 'utf8');
    fs.writeFileSync(path.join(distDir, 'vanilla-styles.css'), cssContent, 'utf8');
    fs.writeFileSync(path.resolve('vanilla-styles.css'), cssContent, 'utf8');
  }
}

// Find JS file
const jsTagRegex = /<script\b[^>]*\bsrc=["']([^"']+\.js)["'][^>]*><\/script>/i;
const jsMatch = html.match(jsTagRegex);
let jsContent = '';
if (jsMatch) {
  const jsSrc = jsMatch[1];
  const jsFileName = path.basename(jsSrc);
  const jsFilePath = path.join(distDir, 'assets', jsFileName);
  if (fs.existsSync(jsFilePath)) {
    jsContent = fs.readFileSync(jsFilePath, 'utf8');
    // Safely escape any </script tags that might appear in literals
    jsContent = jsContent.replace(/<\/script/gi, '<\\/script');
  }
}

// Build standalone single-file HTML that runs without Node.js, npm, or any local server
let standaloneHtml = html;

if (cssMatch && cssContent) {
  standaloneHtml = standaloneHtml.replace(cssMatch[0], `<style id="periodica-vanilla-css">\n${cssContent}\n</style>`);
}

if (jsMatch && jsContent) {
  // Place script at bottom of body before the final </body> tag so #root exists when script executes
  standaloneHtml = standaloneHtml.replace(jsMatch[0], '');
  const lastBodyIdx = standaloneHtml.lastIndexOf('</body>');
  if (lastBodyIdx !== -1) {
    standaloneHtml = 
      standaloneHtml.slice(0, lastBodyIdx) + 
      `<script id="periodica-standalone-bundle">\n${jsContent}\n</script>\n` + 
      standaloneHtml.slice(lastBodyIdx);
  } else {
    standaloneHtml += `<script id="periodica-standalone-bundle">\n${jsContent}\n</script>`;
  }
}

// Save standalone.html in root, dist, and public
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.resolve('standalone.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join(distDir, 'standalone.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join(publicDir, 'standalone.html'), standaloneHtml, 'utf8');

if (cssContent) {
  fs.writeFileSync(path.join(publicDir, 'vanilla-styles.css'), cssContent, 'utf8');
}

console.log('Successfully created standalone.html and vanilla-styles.css:');
console.log(' - /standalone.html (' + Math.round(standaloneHtml.length / 1024) + ' KB, single-file runnable without Node.js)');
console.log(' - /public/standalone.html (available for direct browser download)');
console.log(' - /vanilla-styles.css (' + Math.round(cssContent.length / 1024) + ' KB, pure standard vanilla CSS)');
