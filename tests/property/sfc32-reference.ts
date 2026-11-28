const MASK = 0xffffffffn;

export function referenceRng(seed: number) {
  let cursor = BigInt(seed) & MASK;
  function expand(): bigint {
    cursor = (cursor + 0x9e3779b9n) & MASK;
    let word = cursor ^ (cursor / 65536n);
    word = (word * 0x21f0aaadn) & MASK;
    word ^= word / 32768n;
    word = (word * 0x735a2d97n) & MASK;
    return (word ^ (word / 32768n)) & MASK;
  }

  let state = [expand(), expand(), expand(), expand()] as const;
  function draw(): number {
    const [a, b, c, d] = state;
    const result = (a + b + d) & MASK;
    const rotated = ((c * 2097152n) & MASK) + c / 2048n;
    state = [
      (b ^ (b / 512n)) & MASK,
      (9n * c) & MASK,
      (rotated + result) & MASK,
      (d + 1n) & MASK,
    ];
    return Number(result);
  }
  for (let warmup = 0; warmup < 12; warmup++) draw();
  return { draw, words: () => state.map(Number) };
}
