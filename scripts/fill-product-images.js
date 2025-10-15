/**
 * Fill products.image_url automatically using Bing Image Search + Supabase Storage.
 * - Pulls models from DB (optionally brand). If brand missing, infers from model.
 * - Builds brand-aware queries.
 * - Scores results for catalog quality.
 * - In dry-run: prints chosen URLs. In normal run: downloads, uploads to storage, updates image_url.
 *
 * Usage:
 *   node scripts/fill-product-images.js --dry-run
 *   node scripts/fill-product-images.js
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BING_IMAGE_KEY = process.env.BING_IMAGE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
if (!BING_IMAGE_KEY) {
  console.error('Missing BING_IMAGE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DRY = process.argv.includes('--dry-run');

const PREFERRED_DOMAINS = [
  'apple.com', 'samsung.com', 'xiaomi.com', 'mi.com',
  'gsmarena.com', 'bestbuy.com', 'amazon.com',
  'media.ldlc.com', 'static.toiimg.com', 'cdn.tgdd.vn'
];

function inferBrand(modelRaw) {
  const m = (modelRaw || '').trim();
  const mLow = m.toLowerCase();

  // Canonicalize a couple of typos
  if (mLow.startsWith('iphone')) return 'Apple';
  if (mLow.startsWith('ipad')) return 'Apple';
  if (mLow.startsWith('airpods') || mLow === 'airtag' || mLow.startsWith('apple watch') || mLow.startsWith('apple pencil')) return 'Apple';
  if (mLow.includes('original head 20w') || mLow.includes('usb-c to lightning') || mLow.includes('charger type-c') || mLow.includes('iphone 16 cable')) return 'Apple';

  if (mLow.startsWith('galaxy')) return 'Samsung';
  if (mLow.startsWith('tab kids')) return 'Samsung'; // Galaxy Tab Kids
  if (mLow.startsWith('galaxy buds')) return 'Samsung';

  if (/^tune\s|^wave\s|beam$/i.test(mLow) || mLow.includes('tune 125') || mLow.includes('tune 520') || mLow.includes('tune beam') || mLow.includes('wave beam') || mLow.includes('wave flex')) return 'JBL';

  if (mLow === '105 4g' || mLow === '110 4g') return 'Nokia';
  if (mLow === 'f33' || mLow === 'f34') return 'Phone Line';
  if (mLow === 'n2000') return 'Blackview';

  return ''; // unknown
}

function buildQuery(brand, model) {
  const m = model.trim();
  const b = (brand || inferBrand(model) || '').trim();
  const tail = 'product photo white background';

  if (b) {
    // Brand-aware queries
    if (b === 'Apple') {
      return `Apple ${m} ${tail}`;
    } else if (b === 'Samsung') {
      if (m.toLowerCase().startsWith('galaxy')) return `Samsung ${m} ${tail}`;
      if (m.toLowerCase().startsWith('tab kids')) return `Samsung ${m} tablet ${tail}`;
      return `Samsung ${m} ${tail}`;
    } else if (b === 'JBL') {
      return `JBL ${m} ${tail}`;
    } else if (b === 'Nokia') {
      return `Nokia ${m} ${tail}`;
    } else if (b === 'Phone Line') {
      return `Phone Line ${m} ${tail}`;
    } else if (b === 'Blackview') {
      return `Blackview ${m} ${tail}`;
    }
  }
  // Fallback
  return `${m} ${tail}`;
}

function scoreResult(r) {
  let score = 0;
  const url = (r.contentUrl || '').toLowerCase();
  const host = (r.hostPageDomainFriendlyName || '').toLowerCase();
  const width = r.width || 0;
  const height = r.height || 0;
  const caption = ((r.name || '') + ' ' + (r.hostPageDisplayUrl || '')).toLowerCase();

  // Prefer large
  if (width >= 800) score += 3;
  if (width >= 1200) score += 2;
  if (height >= 800) score += 1;

  // White bg / product hints
  if (caption.includes('white background') || caption.includes('product')) score += 2;

  // Preferred domains
  for (const d of PREFERRED_DOMAINS) {
    if (url.includes(d) || host.includes(d)) { score += 4; break; }
  }

  // Penalize SVG or tiny
  if (url.endsWith('.svg')) score -= 3;
  if (width < 400 || height < 400) score -= 2;

  return score;
}

async function searchBing(query) {
  const params = new URLSearchParams({
    q: query,
    count: '12',
    safeSearch: 'Strict',
    imageType: 'Photo',
    license: 'Any',
  });
  const res = await fetch(`https://api.bing.microsoft.com/v7.0/images/search?${params.toString()}`, {
    headers: { 'Ocp-Apim-Subscription-Key': BING_IMAGE_KEY }
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Bing API error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return (data.value || []).sort((a, b) => scoreResult(b) - scoreResult(a));
}

async function download(url, keyName) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  const tmpDir = path.join(process.cwd(), 'tmp-img');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const extFromUrl = path.extname(new URL(url).pathname).toLowerCase();
  const ext = ['.jpg', '.jpeg', '.png', '.webp'].includes(extFromUrl) ? extFromUrl : '.jpg';
  const filePath = path.join(tmpDir, keyName + ext);
  fs.writeFileSync(filePath, buf);
  return { filePath, ext };
}

async function uploadToStorage(filePath, storageKey) {
  const file = fs.readFileSync(filePath);
  const contentType =
    filePath.endsWith('.png') ? 'image/png' :
    filePath.endsWith('.webp') ? 'image/webp' :
    'image/jpeg';

  const { data, error } = await supabase
    .storage.from('product-images')
    .upload(storageKey, file, { upsert: true, contentType });

  if (error) throw error;

  const { data: pub } = supabase.storage.from('product-images').getPublicUrl(storageKey);
  return pub.publicUrl;
}

async function updateImageUrl(productId, publicUrl) {
  const { error } = await supabase
    .from('products')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw error;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  // 1) Fetch products missing image_url OR duplicates where you want to refresh
  const { data: rows, error } = await supabase
    .from('products')
    .select('id, brand, model, storage, image_url')
    .order('model', { ascending: true });

  if (error) throw error;

  // Deduplicate exact same model strings to avoid hitting API multiple times
  // but still map per product id when uploading.
  const toProcess = rows.filter(r => !r.image_url || r.image_url.trim() === '');
  if (!toProcess.length) {
    console.log('No products missing image_url. Done.');
    return;
  }
  console.log(`Found ${toProcess.length} items without image.`);

  // Map of model -> picked image URL, to reuse across duplicates
  const cache = new Map();

  for (const p of toProcess) {
    const model = (p.model || '').trim();
    const brand = (p.brand && p.brand.trim()) || inferBrand(model);
    const baseKey = `${brand || 'Unknown'}-${model.replace(/[^a-z0-9]+/gi, '_')}`;

    try {
      let chosenUrl = cache.get(model);
      if (!chosenUrl) {
        const query = buildQuery(brand, model);
        console.log(`Searching: [${p.id}] ${brand ? brand + ' ' : ''}${model}  →  "${query}"`);
        const results = await searchBing(query);
        if (!results.length) {
          console.warn('No results for', model);
          continue;
        }
        chosenUrl = results[0].contentUrl;
        cache.set(model, chosenUrl);
      } else {
        console.log(`Reusing cached image for model "${model}"`);
      }

      if (DRY) {
        console.log(`[DRY] Would set image_url -> ${chosenUrl}`);
      } else {
        const { filePath, ext } = await download(chosenUrl, baseKey);
        const storageKey = `products/${p.id}${ext}`;
        const publicUrl = await uploadToStorage(filePath, storageKey);
        await updateImageUrl(p.id, publicUrl);
        console.log(`Saved: ${publicUrl}`);
      }

      await sleep(400); // rate limit
    } catch (e) {
      console.error(`Error on "${model}":`, e.message);
      await sleep(600);
    }
  }

  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
