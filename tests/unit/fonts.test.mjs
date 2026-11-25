import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';

const fonts = new URL('../../public/fonts/', import.meta.url);

it.each(['SpaceGrotesk', 'JetBrainsMono'])(
  'ships the local %s TrueType font and OFL text',
  async (name) => {
    const data = await readFile(new URL(`${name}.ttf`, fonts));
    const license = await readFile(new URL(`${name}-OFL.txt`, fonts), 'utf8');

    expect(data.readUInt32BE(0)).toBe(0x00010000);
    expect(license).toMatch(/SIL OPEN FONT LICENSE/i);
    expect(license).toMatch(/1\.1/);
  },
);
