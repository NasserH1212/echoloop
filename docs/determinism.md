# ECHOLOOP determinism

## Supported execution model

The M1a primitives run synchronously on one JavaScript thread. All inputs are explicit.
Core reads no clock, device, file or browser state. Direction tables are initialized
once. Callers treat their elements as read-only and index with `frame & 15`.

## Numeric policy

Authoritative real values use binary64. Core follows the arithmetic and named
Math operations in contract §8. The direction tables use zero, signed one
and signed Math.SQRT1_2. Opposing directions cancel by axis. Their squared
length has an absolute tolerance of four Number.EPSILON for nonzero directions.
Vector helpers accept finite coordinates. Clamp expects ordered limits.
Normalization scales before squaring and writes into a caller-provided Float64Array.

## Integer operations

Math.imul and the 32-bit bitwise operators |, &, ^, ~, <<, >> and >>> are
permitted. Unsigned outputs use >>> 0. The exclusive upper bound 4294967296
remains a Number throughout bounded sampling.

## Three clocks

- **Sim ticks** are authoritative integer steps at 60 Hz. At load, positive
  durations use Math.max(1, Math.round(ms * 60 / 1000)). Zero gives zero.
- **Real time** consists of browser timestamps for application scheduling.
- **Presentation time** drives motion and fx. Ticks-to-ms conversion belongs to presentation.

The application advances a fixed-step accumulator and presents a rolling tick/FPS
readout. See [runtime timing](architecture.md) for the cap, clock tolerance and
visibility lifecycle.

## RNG seeding and state restoration

Normalize int32 or uint32 integer seeds with >>> 0. Four advances of a single
SplitMix32 cursor initialize a, b, c, d. Discard the first twelve SFC32 outputs.
The returned word includes the old counter. Each float consumes one word.
Bounded draws reject the incomplete upper bucket before taking the remainder.

Checkpoints contain four words in a, b, c, d order. Offsets count elements.
Restoring copies all four words without a warm-up. Invalid slices throw before
mutation. Tests compare both words and output to a separate BigInt implementation.
Fast-check reports a seed and shrink path on failure. Set FC_SEED and FC_PATH
to those values to replay the same property.

The six-bin chi-square sanity test uses seed 2026 and 60000 draws. The fixed
threshold of 25 for five degrees of freedom tolerates ordinary variation while
detecting gross skew. Cutoff-boundary tests separately exercise rejection logic.

## Hash encoding and coverage policy

FNV-1a starts at 0x811c9dc5 and XORs each byte before multiplying by 0x01000193
with Math.imul. Scalar calls write explicit little-endian DataView bytes. Hash
instances keep independent accumulators and share synchronous eight-byte scratch.
Byte ranges are half-open, relative to the supplied view. Invalid ranges throw
before any update. The digest is eight lowercase hex digits.

The hash mechanism is locked in M1. State coverage and store order will be
locked in M2 under §10.2. Raw multibyte typed-array views assume a little-endian
host under §8. Explicit scalar encoding is independent of host byte order.

## Threat model

| Threat                          | Failure mechanism                                 | Prevention                                                 | Automated test                                            | Observable signal                            |
| ------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| Unseeded randomness             | Equal inputs take different branches              | One seeded generator per wave and core lint                | rejects Math.random in core                               | Lint diagnostic                              |
| Float operations                | A representation or evaluation change alters bits | Fixed binary64 operations and scalar encoding              | encodes binary64 using local little-endian DataView bytes | Byte digest mismatch                         |
| Platform-dependent math         | An approximation changes movement                 | Math allowlist and constant directions                     | rejects Math.sin in core                                  | Lint diagnostic                              |
| Variable timestep               | Refresh rate changes progress                     | Fixed application steps                                    | advances 60 ticks per second at 144 Hz                    | Different tick counts for equal elapsed time |
| Tick boundaries                 | Rounding shifts expiry                            | Convert once with the specified formula                    | converts 120 ms to 7 ticks                                | Unexpected tick count                        |
| Iteration order                 | Enumeration changes updates                       | Ascending indices and explicit system order                | rejects for-in iteration in core                          | Lint diagnostic or different outcomes        |
| Collision order                 | Simultaneous hits resolve differently             | Resolve by enemy index then slot                           | planned: M3                                               | Different hit sequence                       |
| Event order                     | Same-tick notifications change order              | Emit by system, entity and slot                            | planned: M7                                               | Changed ordered event stream                 |
| Input sampling                  | A short press disappears between ticks            | Latch edges and sample per tick                            | planned: M2                                               | Captured input differs                       |
| Incomplete reset                | A later attempt inherits state                    | Compare reset against a fresh world                        | planned: M4                                               | Post-reset hash differs                      |
| Unserialized RNG state          | Draws diverge after restore                       | Save every word in locked order                            | restores 1000 outputs after a 500-draw checkpoint         | First different restored word                |
| Hidden subsystem state          | Cache state affects gameplay                      | Identify authoritative fields and exercise repeated resets | planned: M4                                               | Replayed outcome differs                     |
| Presentation writing to the sim | Rendering mutates state                           | Read-only WorldView boundary                               | planned: M2                                               | Hash changes during a read                   |
| ID recycling                    | A stale handle points at a new entity             | Generation checks and slot retirement                      | planned: M2                                               | Stale handle resolves                        |
| Data changes                    | Fixture inputs change                             | Version outcome changes and reject incompatible fixtures   | planned: M4                                               | Re-record-required diagnostic                |

## Known limitations

The specified ms conversion can overflow at the intermediate multiplication
for enormous finite inputs. No saturation is applied. Direction tables expose
mutable typed arrays. Callers own the read-only convention. Hashing preserves
signed zero and performs no explicit NaN canonicalization. JavaScript Number
does not guarantee arbitrary NaN payload preservation. A 32-bit digest can collide.

## Verification scope

Node tests exercise the primitives, lint rules, local byte encoding and RNG
streams. Cross-engine determinism remains NOT VERIFIED until the M11 browser
golden job passes on Chromium and Firefox. Browser timing, visibility handling,
whole-world replay and deployment require separate verification.
