import { ESLint } from 'eslint';
import { expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' });
const coreFile = 'src/core/sim/fixture.ts';
const purityRule = 'echoloop/core-purity';

async function diagnostics(code, filePath = coreFile) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((message) => message.ruleId ?? message.message);
}

const forbiddenMath = [
  'random',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'sinh',
  'cosh',
  'tanh',
  'exp',
  'expm1',
  'log',
  'log1p',
  'log2',
  'log10',
  'pow',
  'cbrt',
  'hypot',
];

it.each(forbiddenMath)('rejects Math.%s in core', async (name) => {
  expect(await diagnostics(`export const f = Math.${name};`)).toContain(
    purityRule,
  );
});

const forbiddenGlobals = [
  'Date',
  'performance',
  'window',
  'document',
  'globalThis',
  'setTimeout',
  'setInterval',
  'requestAnimationFrame',
];

it.each(forbiddenGlobals)('rejects the global %s in core', async (name) => {
  expect(await diagnostics(`export const value = ${name};`)).toContain(
    'no-restricted-globals',
  );
});

it.each([
  'export const math = Math;',
  "export const random = Math['random'];",
  'export const { sin } = Math;',
  'export const result = 2 ** 3;',
  'export function square(x: number) { x **= 2; return x; }',
  "import 'pixi.js';",
  "import 'node:fs';",
  "import '../../render/landing';",
  "export * from '../../render/landing';",
  "export type T = import('../../app/types').T;",
  "export const load = () => import('../math/value');",
  "import './settings.json';",
])('rejects the core violation in %s', async (code) => {
  expect(await diagnostics(code)).toContain(purityRule);
});

it('allows approved math and relative imports inside core', async () => {
  const code = [
    "import type { Tick } from '../types';",
    'export const distance = (x: Tick) => Math.sqrt(Math.abs(x));',
  ].join('\n');

  expect(await diagnostics(code)).toEqual([]);
});

it('allows the presentation layer to read its clock', async () => {
  const code = 'export const now = () => performance.now();';
  expect(await diagnostics(code, 'src/render/fixture.ts')).toEqual([]);
});
