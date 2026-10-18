import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

type DirectionEvidence = {
  number: string;
  selectedRepresentativeScreen: string;
  screenshot: string;
};

type BriefEvidence = { id: string; directions: DirectionEvidence[] };
type ReviewReport = { sourceSha: string | null; status: string; briefs: BriefEvidence[] };

const root = process.cwd();
const sourceDirectory = path.resolve(root, 'quality/evidence/step-14/manual-review/current');
const outputDirectory = path.join(sourceDirectory, 'contact-sheets');
fs.mkdirSync(outputDirectory, { recursive: true });

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function imageData(screenshot: string) {
  const imagePath = path.resolve(root, screenshot);
  if (!imagePath.startsWith(sourceDirectory)) {
    throw new Error(`Refusing screenshot outside the current Step 14 evidence directory: ${imagePath}`);
  }
  return `data:image/png;base64,${fs.readFileSync(imagePath).toString('base64')}`;
}

function renderCard(brief: BriefEvidence, direction: DirectionEvidence) {
  return `<figure>
    <figcaption><strong>${escapeHtml(brief.id)}</strong> · Direction ${escapeHtml(direction.number)}<br><span>${escapeHtml(direction.selectedRepresentativeScreen)}</span></figcaption>
    <img src="${imageData(direction.screenshot)}" alt="${escapeHtml(brief.id)} Direction ${escapeHtml(direction.number)} preview" />
  </figure>`;
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of ['desktop', 'mobile'] as const) {
    const reportPath = path.join(sourceDirectory, viewport, 'browser-review.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as ReviewReport;
    if (report.status !== 'passed' || report.briefs.length !== 100) {
      throw new Error(`${viewport} review is incomplete; contact sheets require all 100 briefs.`);
    }

    const page = await browser.newPage({ viewport: viewport === 'desktop' ? { width: 1680, height: 1000 } : { width: 1000, height: 1000 } });
    for (let start = 0; start < report.briefs.length; start += 10) {
      const group = report.briefs.slice(start, start + 10);
      const cards = group.flatMap((brief) => brief.directions.map((direction) => renderCard(brief, direction)));
      const columns = viewport === 'desktop' ? 3 : 2;
      const imageRule = viewport === 'desktop'
        ? 'img{display:block;width:100%;max-height:300px;object-fit:contain;background:#fff}'
        : 'img{display:block;width:auto;height:440px;max-width:100%;object-fit:contain;background:#fff;margin:auto}';
      const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${viewport} briefs ${start + 1}-${start + group.length}</title>
        <style>
          *{box-sizing:border-box}body{margin:0;padding:16px;background:#d8d8d5;color:#181818;font:14px/1.35 Arial,sans-serif}
          header{padding:0 0 12px;font-size:20px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:10px}
          figure{margin:0;padding:8px;background:#f8f8f6;border:1px solid #aaa;min-width:0}figcaption{min-height:38px;margin-bottom:6px;font-weight:600}figcaption span{font-size:12px;font-weight:400;color:#555}
          ${imageRule}
        </style><body><header>${viewport} composition benchmark · briefs ${start + 1}–${start + group.length} · ${report.sourceSha ?? 'source SHA unavailable'}</header><main class="grid">${cards.join('')}</main></body></html>`;
      await page.setContent(html, { waitUntil: 'load' });
      const destination = path.join(
        outputDirectory,
        `${viewport}-${String(start + 1).padStart(3, '0')}-${String(start + group.length).padStart(3, '0')}.png`
      );
      await page.screenshot({ path: destination, fullPage: true, animations: 'disabled' });
      console.log(`Created ${path.relative(root, destination)}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
