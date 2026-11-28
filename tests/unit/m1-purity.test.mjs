import { ESLint } from 'eslint';
import { expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' });
const filePath = 'src/core/rng/fixture.ts';

it('allows the locked integer operations in core', async () => {
  const [result] = await eslint.lintText(
    'export function mix(a: number, b: number) { return Math.imul((a | b) & ~b, (a ^ b) << 2) + (a >> 3) + (b >>> 4); }',
    { filePath },
  );
  expect(result.messages).toEqual([]);
});

it('rejects for-in iteration in core', async () => {
  const [result] = await eslint.lintText(
    'export function first(x: object) { for (const k in x) return k; }',
    { filePath },
  );
  expect(result.messages.map((m) => m.ruleId)).toContain(
    'echoloop/core-purity',
  );
});
