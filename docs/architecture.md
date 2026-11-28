# Runtime timing

The application owns the browser frame scheduler. Each callback samples a monotonic
clock, advances the fixed-step accumulator, then presents one frame. The first
callback after start or resume uses zero delta. The first simulation step has index
zero. TICK counts completed steps, including during graphics fallback.

The step duration is 1000 / 60 ms. At higher refresh rates a frame can present
without stepping; at lower rates one frame can run multiple steps. The scheduler
clamps a finite real delta to [0, 250] ms before applying time scale [0, 1].
Negative and non-finite deltas contribute zero. At most four steps run per frame:
extra whole ticks are discarded and the fractional remainder supplies alpha.
At 10 FPS this deliberately limits simulation to 40 steps per real second.

Timestamp subtraction and a repeating fractional tick period can leave the
accumulator infinitesimally short at a mathematically exact boundary. A 1e-6 ms
tolerance is used only to count whole real-time intervals. After subtraction,
a tiny negative remainder is clamped to zero. Core uses integer tick indices;
this real-time tolerance must never enter movement, collisions or replay.

Hiding the document cancels its pending callback and clears the accumulator.
Resuming preserves the tick count and starts with a fresh timestamp. Window
blur handling belongs to the later gameplay milestones.

The bottom-left DOM readout samples completed steps and presentation frames
in a rolling one-second window at millisecond resolution. The preallocated
ring records multiple callbacks within one millisecond. It expires old slots
by timestamp, including after long pauses. A string is built at most every
250 ms and the DOM changes only when the displayed values change. In graphics
fallback FPS counts presentation callbacks driving the DOM. The readout is
visible by default through M1 and moves behind the debug flag in M10.
