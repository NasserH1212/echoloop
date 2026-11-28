const OFFSET_BASIS = 0x811c9dc5;
const PRIME = 0x01000193;
const scratch = new DataView(new ArrayBuffer(8));

export class StateHasher {
  private hash = OFFSET_BASIS;

  reset(): void {
    this.hash = OFFSET_BASIS;
  }

  private updateByte(byte: number): void {
    this.hash = Math.imul(this.hash ^ byte, PRIME) >>> 0;
  }

  private updateScratch(count: number): void {
    for (let i = 0; i < count; i++) this.updateByte(scratch.getUint8(i));
  }

  u32(value: number): void {
    scratch.setUint32(0, value, true);
    this.updateScratch(4);
  }

  i32(value: number): void {
    scratch.setInt32(0, value, true);
    this.updateScratch(4);
  }

  f64(value: number): void {
    scratch.setFloat64(0, value, true);
    this.updateScratch(8);
  }

  bytes(input: Uint8Array, start = 0, end = input.length): void {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      end > input.length
    ) {
      throw new RangeError('Invalid byte range.');
    }
    for (let i = start; i < end; i++) this.updateByte(input[i]!);
  }

  digestHex(): string {
    return this.hash.toString(16).padStart(8, '0');
  }
}
