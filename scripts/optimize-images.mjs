import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = path.resolve('assets');
const outRoot = path.resolve('assets-optimized');

/** @type {{ file: string; maxWidth: number; quality?: number; png?: boolean }[]} */
const rules = [
  { file: 'brand/menace-logo.png', maxWidth: 877, png: true },
  { file: 'brand/aces-logo.png', maxWidth: 816, png: true },
  { file: 'hero/shop-2.jpg', maxWidth: 1200, quality: 82 },
  { file: 'hero/shop-1.jpg', maxWidth: 1200, quality: 82 },
  { file: 'hero/portrait-1.jpg', maxWidth: 900, quality: 82 },
  { file: 'hero/portrait-2.png', maxWidth: 900, png: true },
  { file: 'shop/cap.jpg', maxWidth: 600, quality: 84 },
  { file: 'shop/spray.png', maxWidth: 600, png: true },
  { file: 'shop/product3.png', maxWidth: 600, png: true },
  { file: 'shop/product4.png', maxWidth: 600, png: true },
  { file: 'team/ar-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/negini-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/anthony-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/saif-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/rowan-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/adoom-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/zy-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/daniel-bw.jpg', maxWidth: 608, quality: 82 },
  { file: 'team/ar.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/negini.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/anthony.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/saif.png', maxWidth: 800, png: true },
  { file: 'team/rowan.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/adoom.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/zy.jpg', maxWidth: 800, quality: 82 },
  { file: 'team/daniel.jpg', maxWidth: 800, quality: 82 },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(jpe?g|png)$/i.test(entry)) out.push(full);
  }
  return out;
}

async function optimizeOne(relPath, rule) {
  const input = path.join(root, relPath.replace(/\//g, path.sep));
  if (!fs.existsSync(input)) return null;

  const before = fs.statSync(input).size;
  const meta = await sharp(input).metadata();
  const ext = path.extname(input).toLowerCase();
  const output = path.join(outRoot, relPath.replace(/\//g, path.sep));
  fs.mkdirSync(path.dirname(output), { recursive: true });

  let pipeline = sharp(input).rotate();
  if ((meta.width || 0) > rule.maxWidth) {
    pipeline = pipeline.resize({ width: rule.maxWidth, withoutEnlargement: true });
  }

  if (rule.png || ext === '.png') {
    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
      .toFile(output);
  } else {
    await pipeline
      .jpeg({ quality: rule.quality ?? 82, mozjpeg: true, progressive: true })
      .toFile(output);
  }

  const webpOutput = output.replace(/\.(jpe?g|png)$/i, '.webp');
  await sharp(output)
    .webp({ quality: rule.quality ?? 82, effort: 6 })
    .toFile(webpOutput);

  const after = fs.statSync(output).size;
  const outMeta = await sharp(output).metadata();
  return {
    file: relPath,
    before,
    after,
    dims: `${outMeta.width}x${outMeta.height}`,
  };
}

if (fs.existsSync(outRoot)) {
  fs.rmSync(outRoot, { recursive: true, force: true });
}

const ruleMap = new Map(rules.map((r) => [r.file.replace(/\//g, path.sep), r]));
const allFiles = walk(root).map((f) => path.relative(root, f));

let totalBefore = 0;
let totalAfter = 0;
const results = [];

for (const rel of allFiles.sort()) {
  if (rel.includes('.tmp.') || rel.endsWith('ar-match.jpg')) continue;
  const rule = ruleMap.get(rel) || { maxWidth: 1200, quality: 82 };
  const result = await optimizeOne(rel, rule);
  if (!result) continue;
  totalBefore += result.before;
  totalAfter += result.after;
  results.push(result);
}

console.log('\nOptimized images:');
for (const r of results) {
  const saved = r.before - r.after;
  const pct = r.before ? Math.round((saved / r.before) * 100) : 0;
  console.log(
    `${r.file}: ${Math.round(r.before / 1024)}KB → ${Math.round(r.after / 1024)}KB (${pct}% saved) [${r.dims}]`
  );
}
console.log(
  `\nTotal: ${Math.round(totalBefore / 1024)}KB → ${Math.round(totalAfter / 1024)}KB (${Math.round(((totalBefore - totalAfter) / totalBefore) * 100)}% saved)`
);
