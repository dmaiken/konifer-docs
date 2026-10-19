import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Run against an ephemeral Konifer instance with no path configuration:
// node scripts/generate-documentation-images.mjs [http://localhost:8080] [source-directory]
// Omit source-directory to regenerate from the committed originals.
const server = new URL(process.argv[2] ?? 'http://localhost:8080');
const output = fileURLToPath(new URL('../static/image-transformations/', import.meta.url));
const sourceDirectory = process.argv[3];
const sources = {
  cow: 'animal_cow_animals_pasture.jpg',
  bird: 'animal_bird_ave_birds.jpg',
  flamingos: 'animals_animal_nature_birds.jpg',
  squirrel: 'animal_squirrel.jpg',
  cheetah: 'animal_africa_wilderness_zoo.jpg',
};
const examples = [
  ['resizing', 'cow', 'fit-320', {width: 320, height: 320, fit: 'fit'}, 320, 240],
  ['resizing', 'cow', 'fill-320', {width: 320, height: 320, fit: 'fill'}, 320, 320],
  ['resizing', 'cow', 'stretch-320', {width: 320, height: 320, fit: 'stretch'}, 320, 320],
  ['resizing', 'cow', 'crop-320', {width: 320, height: 320, fit: 'crop'}, 320, 320],
  ['resizing', 'cow', 'thumbnail-128', {width: 128, height: 128, fit: 'fill'}, 128, 128],
  ...['center', 'entropy', 'attention'].map(gravity =>
    ['gravity', 'bird', `fill-${gravity}-240x320`, {width: 240, height: 320, fit: 'fill', gravity}, 240, 320]),
  ...[0, 90, 180, 270].map(rotate =>
    ['rotation', 'bird', `rotate-${rotate}`, {width: 160, height: 160, rotate}, rotate % 180 === 0 ? 160 : 107, rotate % 180 === 0 ? 107 : 160]),
  ...['none', 'h', 'v'].map(flip =>
    ['flip', 'bird', `flip-${flip}`, {width: 240, flip}, 240, 160]),
  ...['none', 'black_white', 'grayscale', 'sepia'].map(filter =>
    ['filters', 'flamingos', `filter-${filter.replaceAll('_', '-')}`, {width: 480, filter}, 480, 316]),
  ...[0, 10, 50].map(blur =>
    ['blur', 'squirrel', `blur-${blur}`, {width: 480, blur}, 480, 320]),
  ['padding', 'squirrel', 'padding-16-transparent', {width: 320, pad: 16}, 352, 245],
  ['padding', 'squirrel', 'padding-16-orange', {width: 320, pad: 16, 'pad-color': '#FF2900'}, 352, 245],
  ...[10, 80].map(quality =>
    ['quality', 'cheetah', `quality-${quality}`, {width: 640, quality}, 640, 427]),
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = {sources: [], examples: []};
const entries = new Map();

async function request(relative, options) {
  const response = await fetch(new URL(relative, server), {
    signal: AbortSignal.timeout(60_000),
    ...options,
  });
  if (!response.ok) throw new Error(`${relative}: ${response.status} ${await response.text()}`);
  return response;
}

async function save(relative, bytes) {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), {recursive: true});
  await writeFile(destination, bytes);
  return {file: relative, bytes: bytes.length, sha256: sha256(bytes)};
}

for (const [animal, originalFilename] of Object.entries(sources)) {
  const relative = `sources/${animal}-original.jpg`;
  const bytes = await readFile(sourceDirectory ? path.join(sourceDirectory, originalFilename) : path.join(output, relative));
  const form = new FormData();
  form.set('metadata', JSON.stringify({alt: `${animal} documentation source`}));
  form.set('asset', new Blob([bytes], {type: 'image/jpeg'}), `${animal}-original.jpg`);
  const uploaded = await (await request(`/assets/documentation/${animal}`, {method: 'POST', body: form})).json();
  const entry = `/assets/documentation/${animal}/-/entry/${uploaded.entryId}`;
  entries.set(animal, entry);
  const content = new Uint8Array(await (await request(`${entry}/content`)).arrayBuffer());
  if (sha256(content) !== sha256(bytes)) throw new Error(`${animal}: server changed the original; use an unconfigured path`);
  const attributes = uploaded.variants.find(variant => variant.isOriginalVariant).attributes;
  manifest.sources.push({animal, ...await save(relative, content), attributes});
  console.log(`Source: ${animal} (${attributes.width}×${attributes.height})`);
}

for (const [group, animal, name, parameters, width, height] of examples) {
  const query = new URLSearchParams({format: 'webp', ...parameters}).toString();
  const entry = entries.get(animal);
  const link = await (await request(`${entry}/link?${query}`)).json();
  const attributes = link.attributes;
  if (attributes.width !== width || attributes.height !== height || attributes.format !== 'webp') {
    throw new Error(`${animal}-${name}: unexpected attributes ${JSON.stringify(attributes)}`);
  }
  const response = await request(`${entry}/content?${query}`);
  if (!response.headers.get('content-type')?.startsWith('image/webp')) {
    throw new Error(`${animal}-${name}: expected image/webp`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  manifest.examples.push({
    animal,
    request: `/assets/documentation/${animal}/-/content?${query}`,
    ...await save(`${group}/${animal}-${name}.webp`, bytes),
    attributes,
  });
  console.log(`${group}/${animal}-${name}.webp (${width}×${height}, ${bytes.length} bytes)`);
}

await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
