// Confere o contraste WCAG dos pares texto/fundo da paleta.
// Uso: node scripts/check-contrast.js
const pairs = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textMuted', 'surface'],
  ['textMuted', 'background'],
  ['textMuted', 'placeholder'],
  ['primary', 'surface'],
  ['primary', 'background'],
  ['primary', 'primarySoft'],
  ['textOnPrimary', 'primary'],
  ['danger', 'surface'],
  ['danger', 'dangerSoft'],
  ['success', 'surface'],
  ['success', 'successSoft'],
  ['star', 'surface'],
  ['favorite', 'surface'],
];

const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'theme', 'colors.ts'), 'utf8');
const colors = Object.fromEntries(
  [...source.matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2]]),
);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

let failed = false;
for (const [fg, bg] of pairs) {
  const value = ratio(colors[fg], colors[bg]);
  const ok = value >= 4.5;
  if (!ok) failed = true;
  console.log(`${ok ? 'OK  ' : 'FALHA'} ${fg} sobre ${bg}: ${value.toFixed(2)}:1`);
}
process.exit(failed ? 1 : 0);
