import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../public/fonts/', import.meta.url);
const upstream = 'https://raw.githubusercontent.com/google/fonts/main/ofl/';

const assets = [
  {
    source: 'spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf',
    name: 'SpaceGrotesk.ttf',
    blob: 'a1b2e6c26093066510a31147e7aec9abdc8d6c5e',
  },
  {
    source: 'spacegrotesk/OFL.txt',
    name: 'SpaceGrotesk-OFL.txt',
    blob: 'cb512b9af44ff61e75e1aad387b7424cdfab36a3',
  },
  {
    source: 'jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf',
    name: 'JetBrainsMono.ttf',
    blob: 'aa310be8b717fe3774f9444dd89d5f4101cc6d10',
  },
  {
    source: 'jetbrainsmono/OFL.txt',
    name: 'JetBrainsMono-OFL.txt',
    blob: '821a3dac22aff15a1f1c9689a1d79c45bb58ca39',
  },
];

const downloads = await Promise.all(
  assets.map(async ({ source, name, blob }) => {
    const response = await fetch(upstream + source);

    if (!response.ok) {
      throw new Error(`${name}: HTTP ${response.status}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const actual = createHash('sha1')
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest('hex');

    if (actual !== blob) {
      throw new Error(
        `${name}: upstream content changed; review before updating.`,
      );
    }

    return { name, bytes };
  }),
);

await mkdir(root, { recursive: true });

for (const { name, bytes } of downloads) {
  await writeFile(new URL(name, root), bytes);
  console.info(`Prepared ${name}`);
}
